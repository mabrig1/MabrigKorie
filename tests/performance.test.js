const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const registry = require('../data/performance-apps');
const {
  WINDOWS, catalogue, validateHit, emptyBuckets, insights,
} = require('../services/performance');

test('all latest apps plus portfolio are in the immutable approved analytics catalogue', () => {
  const apps = catalogue();
  assert.ok(apps.length >= 6);
  assert.equal(new Set(apps.map((app) => app.id)).size, apps.length);
  for (const id of ['mabrig-portfolio', 'ai-university', 'openforge-africa', 'campusverse', 'supplyhq-online', 'mabrig-statlab']) {
    assert.ok(apps.some((app) => app.id === id), id);
  }
  assert.equal(registry.length, apps.length);
});

test('admin-managed apps are added without duplicate hosts or insecure URLs', () => {
  const apps = catalogue([
    { slug: 'same-host', title: 'Duplicate', url: 'https://aiuniversityhq.uk/' },
    { slug: 'another-app', title: 'Unique', url: 'https://another-public-app.example/' },
    { slug: 'bad-protocol', title: 'Unsecured', url: 'http://unsafe.example/' },
    { slug: 'bad-slug!', title: 'Not tracked', url: 'https://another-example.com/' },
  ]);
  assert.equal(apps.filter((app) => app.origin === 'https://aiuniversityhq.uk').length, 1);
  assert.ok(apps.some((app) => app.id === 'another-app'));
  assert.ok(!apps.some((app) => app.id === 'bad-protocol' || app.id === 'bad-slug!'));
});

test('only public registered origins and valid anonymous tab sessions can ingest events', () => {
  const apps = catalogue();
  const valid = { app: 'ai-university', session: 'a'.repeat(32), path: '/courses' };
  const clean = validateHit(apps, 'https://aiuniversityhq.uk', valid);
  assert.deepEqual(clean, { appId: 'ai-university', sessionId: valid.session, pathname: '/courses' });
  assert.equal(validateHit(apps, 'https://attacker.example', valid), null);
  assert.equal(validateHit(apps, 'https://www.campusverse.store', valid), null);
  assert.equal(validateHit(apps, 'https://aiuniversityhq.uk', { ...valid, path: '//evil' }), null);
  assert.equal(validateHit(apps, 'https://aiuniversityhq.uk', { ...valid, path: '/?email=private' }), null);
  assert.equal(validateHit(apps, 'https://aiuniversityhq.uk', { ...valid, session: 'abc' }), null);
});

test('trend buckets have the correct time range', () => {
  const now = new Date('2026-11-15T09:00:00Z');
  assert.equal(emptyBuckets(now, '24h').length, 24);
  assert.equal(emptyBuckets(now, '7d').length, 7);
  assert.equal(emptyBuckets(now, '30d').length, 30);
  assert.equal(emptyBuckets(now, '7d').at(-1), '2026-11-15');
  assert.equal(emptyBuckets(now, '24h').at(-1), '2026-11-15T09:00');
  assert.equal(WINDOWS['30d'], 2592000000);
});

test('the analyst never invents traffic observations', () => {
  const noData = insights([], 0, 0, 0, 0);
  assert.match(noData.join(' '), /not received any page-view events/);
  const active = [{ title: 'AI University', views: 15, lastEvent: new Date().toISOString() }];
  assert.match(insights(active, 15, 15, 10, 2).join(' '), /AI University received the most recorded page views/);
});

test('collector and dashboard routes use admin-only API authorization for summaries', () => {
  const routes = fs.readFileSync(path.join(__dirname, '../routes/performance.js'), 'utf8');
  const server = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  const admin = fs.readFileSync(path.join(__dirname, '../routes/admin.js'), 'utf8');
  assert.match(routes, /router\.get\('\/summary', requireAdminApi/);
  assert.match(routes, /router\.post\('\/event', express\.text/);
  assert.match(server, /app\.use\('\/api\/performance', performanceRoutes\)/);
  assert.match(admin, /router\.get\('\/performance', requireAdmin/);
});
