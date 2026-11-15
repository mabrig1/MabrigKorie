const registry = require('../data/performance-apps');

const WINDOWS = Object.freeze({ '24h': 24 * 60 * 60 * 1000, '7d': 7 * 24 * 60 * 60 * 1000, '30d': 30 * 24 * 60 * 60 * 1000 });

function canonicalUrl(input) {
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.origin + url.pathname.replace(/[/]+$/, '') ;
  } catch (_) {
    return null;
  }
}
function originOf(input) {
  const canonical = canonicalUrl(input);
  return canonical ? new URL(canonical).origin : null;
}
function catalogue(works = []) {
  const known = new Set();
  const result = [];
  for (const a of registry) {
    const origin = originOf(a.url);
    if (!origin || known.has(origin)) continue;
    known.add(origin);
    result.push({ ...a, origin });
  }
  for (const work of works) {
    const origin = originOf(work.url);
    if (!origin || known.has(origin)) continue;
    if (!/^[a-z0-9-]{1,80}$/.test(work.slug || '')) continue;
    known.add(origin);
    result.push({
      id: work.slug,
      title: work.title,
      url: work.url,
      origin,
      curated: false,
    });
  }
  return result;
}
function getAppById(apps, id) {
  return apps.find((a) => a.id === id);
}
function validateHit(apps, origin, data) {
  if (!origin || !data || typeof data !== 'object') return null;
  const app = getAppById(apps, data.app);
  if (!app || app.origin !== origin) return null;
  if (typeof data.session !== 'string' || !/^[a-zA-Z0-9_-]{20,64}$/.test(data.session)) return null;
  const pathname = typeof data.path === 'string' ? data.path : '/';
  if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.length > 160 || /[?#\x00-\x1f]/.test(pathname)) return null;
  return { appId: app.id, sessionId: data.session, pathname };
}
function formatDay(date, hourly) {
  return hourly ? date.toISOString().slice(0, 13) + ':00' : date.toISOString().slice(0, 10);
}
function emptyBuckets(now, key) {
  const hourly = key === '24h';
  const count = hourly ? 24 : key === '30d' ? 30 : 7;
  const step = hourly ? 3600000 : 86400000;
  const floor = new Date(now);
  if (hourly) floor.setUTCMinutes(0, 0, 0);
  else floor.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => formatDay(new Date(+floor - (count - 1 - i) * step), hourly));
}
function insights(apps, total, current, previous, activeCount) {
  if (!total) return [
    'Visitor tracking has not received any page-view events in this period. Install the tracker on each app to begin collecting data.',
    'Uptime checks measure reachability, not purchases, registrations or application errors.'
  ];
  const ranked = apps.filter((app) => app.views > 0).sort((a, b) => b.views - a.views);
  const recommendations = [];
  if (ranked.length) recommendations.push(ranked[0].title + ' received the most recorded page views (' + ranked[0].views.toLocaleString('en-US') + ') in this period.');
  if (previous > 0) recommendations.push('Recorded page views are ' + (current >= previous ? 'up ' : 'down ') + Math.abs(Math.round(((current - previous) / previous) * 100)) + '% compared with the preceding equal-length period.');
  if (activeCount > 0) recommendations.push(activeCount + ' anonymous visitor session' + (activeCount === 1 ? '' : 's') + ' sent a page view in the last five minutes.');
  const unconnected = apps.filter((app) => !app.lastEvent);
  if (unconnected.length) recommendations.push(unconnected.length + ' app' + (unconnected.length === 1 ? ' has' : 's have') + ' no recorded tracking data yet; verify tracker installation and site traffic.');
  return recommendations;
}
module.exports = { WINDOWS, catalogue, getAppById, validateHit, formatDay, emptyBuckets, insights };
