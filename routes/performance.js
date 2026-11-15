const express = require('express');
const Work = require('../models/Work');
const PerformanceEvent = require('../models/PerformanceEvent');
const { requireAdminApi } = require('../middleware/auth');
const { WINDOWS, catalogue, validateHit, emptyBuckets, insights } = require('../services/performance');

const router = express.Router();
const MAX_EVENTS_PER_MINUTE = 1200; // in-process safety valve, not a distributed quota
let rateWindow = Date.now();
let rateCount = 0;
const recentSessionHits = new Map();
const healthCache = new Map();
const HEALTH_TTL_MS = 5 * 60 * 1000;

async function appsCatalogue() {
  const works = await Work.find({ category: 'app' }).select('slug title url').lean();
  return catalogue(works);
}
function originAllowed(origin, apps) {
  return typeof origin === 'string' && apps.some((app) => app.origin === origin);
}
function allowCors(res, origin) {
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '600');
  res.set('Cache-Control', 'no-store');
}

// Public, limited event ingestion. No cookies, emails, IP addresses, query
// strings, referrers or user agents are written to MongoDB.
router.options('/event', async (req, res) => {
  try {
    const apps = await appsCatalogue();
    const origin = req.get('Origin');
    if (!originAllowed(origin, apps)) return res.sendStatus(403);
    allowCors(res, origin);
    return res.sendStatus(204);
  } catch (_) {
    return res.sendStatus(503);
  }
});
router.post('/event', express.text({ type: 'text/plain', limit: '1kb' }), async (req, res) => {
  try {
    const origin = req.get('Origin');
    const apps = await appsCatalogue();
    if (!originAllowed(origin, apps)) return res.sendStatus(403);
    allowCors(res, origin);
    let data;
    try { data = JSON.parse(req.body); } catch (_) { return res.sendStatus(400); }
    const hit = validateHit(apps, origin, data);
    if (!hit) return res.sendStatus(400);

    const now = Date.now();
    if (now - rateWindow > 60000) { rateWindow = now; rateCount = 0; recentSessionHits.clear(); }
    if (++rateCount > MAX_EVENTS_PER_MINUTE) return res.sendStatus(429);
    const key = hit.appId + ':' + hit.sessionId;
    const last = recentSessionHits.get(key) || 0;
    if (now - last < 1500) return res.sendStatus(204);
    recentSessionHits.set(key, now);
    if (recentSessionHits.size > MAX_EVENTS_PER_MINUTE) recentSessionHits.clear();

    await PerformanceEvent.create(hit);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Performance ingest unavailable:', error.message);
    return res.sendStatus(503);
  }
});

async function checkReachability(app) {
  // Never fetch user-controlled URLs from the database; only fixed curated targets.
  if (!app.curated || typeof fetch !== 'function') return { state: 'not_checked' };
  const previous = healthCache.get(app.id);
  if (previous && Date.now() - previous.checkedMs < HEALTH_TTL_MS) return previous.value;
  const started = Date.now();
  let result;
  try {
    const response = await fetch(app.url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(3500),
      headers: { 'User-Agent': 'MABRIG-Performance-Monitor/1.0' },
    });
    result = {
      state: response.status < 400 ? 'responding' : 'http_error',
      httpStatus: response.status,
      responseMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    };
    if (response.body) await response.body.cancel();
  } catch (_) {
    result = { state: 'unverified', checkedAt: new Date().toISOString() };
  }
  healthCache.set(app.id, { checkedMs: Date.now(), value: result });
  return result;
}
function groupedById(rows, key = '_id') {
  return new Map(rows.map((row) => [row[key], row]));
}

router.get('/summary', requireAdminApi, async (req, res) => {
  try {
    const period = WINDOWS[req.query.period] ? req.query.period : '7d';
    const now = new Date();
    const start = new Date(+now - WINDOWS[period]);
    const previousStart = new Date(+start - WINDOWS[period]);
    const activeSince = new Date(+now - 5 * 60000);
    const apps = await appsCatalogue();

    const [current, previous, trend, lastRecords] = await Promise.all([
      PerformanceEvent.aggregate([
        { $match: { recordedAt: { $gte: start, $lte: now } } },
        { $group: { _id: { app: '$appId', session: '$sessionId' }, views: { $sum: 1 }, last: { $max: '$recordedAt' } } },
        { $group: {
          _id: '$_id.app', views: { $sum: '$views' }, sessions: { $sum: 1 },
          active: { $sum: { $cond: [{ $gte: ['$last', activeSince] }, 1, 0] } },
        } },
      ]),
      PerformanceEvent.aggregate([
        { $match: { recordedAt: { $gte: previousStart, $lt: start } } },
        { $group: { _id: '$appId', views: { $sum: 1 } } },
      ]),
      PerformanceEvent.aggregate([
        { $match: { recordedAt: { $gte: start, $lte: now } } },
        { $group: {
          _id: { $dateToString: { format: period === '24h' ? '%Y-%m-%dT%H:00' : '%Y-%m-%d', date: '$recordedAt', timezone: 'UTC' } },
          views: { $sum: 1 },
        } },
        { $sort: { _id: 1 } },
      ]),
      PerformanceEvent.aggregate([
        { $group: { _id: '$appId', last: { $max: '$recordedAt' } } },
      ]),
    ]);

    const currentMap = groupedById(current);
    const previousMap = groupedById(previous);
    const lastMap = groupedById(lastRecords);
    const appRows = apps.map((app) => {
      const row = currentMap.get(app.id);
      const last = lastMap.get(app.id);
      return {
        id: app.id,
        title: app.title,
        url: app.url,
        curated: app.curated,
        views: row ? row.views : 0,
        sessions: row ? row.sessions : 0,
        active: row ? row.active : 0,
        previousViews: previousMap.get(app.id)?.views || 0,
        lastEvent: last?.last?.toISOString() || null,
      };
    });
    const health = await Promise.all(apps.map((app) => checkReachability(app)));
    appRows.forEach((app, i) => { app.health = health[i]; });
    const aggregateTotal = (key) => appRows.reduce((sum, app) => sum + app[key], 0);
    const totalViews = aggregateTotal('views');
    const previousViews = aggregateTotal('previousViews');
    const active = aggregateTotal('active');
    const buckets = emptyBuckets(now, period);
    const counts = groupedById(trend);
    const series = buckets.map((bucket) => ({ bucket, views: counts.get(bucket)?.views || 0 }));

    res.set('Cache-Control', 'no-store');
    res.json({
      period,
      generatedAt: now.toISOString(),
      refreshSeconds: 30,
      definitions: {
        visitors: 'Anonymous tab-based visitor sessions, not verified individual people.',
        active: 'Sessions that recorded a page view in the last five minutes; not a live presence connection.',
        availability: 'HEAD reachability probe cached for five minutes; it does not prove feature health.',
        untracked: 'No events recorded in the last 60 days is not proof of zero traffic.',
      },
      totals: {
        apps: appRows.length,
        tracked: appRows.filter((app) => app.lastEvent).length,
        views: totalViews,
        sessions: aggregateTotal('sessions'),
        active,
        previousViews,
      },
      trend: series,
      apps: appRows,
      insights: insights(appRows, totalViews, totalViews, previousViews, active),
    });
  } catch (error) {
    console.error('Performance summary failed:', error.message);
    res.status(503).set('Cache-Control', 'no-store').json({ error: 'Live performance metrics are unavailable. Check database and runtime configuration.' });
  }
});

module.exports = router;
