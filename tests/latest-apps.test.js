const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const apps = require('../data/latest-apps');

test('five unique applications have valid external website and repository links', () => {
  assert.equal(apps.length, 5);
  assert.equal(new Set(apps.map((app) => app.slug)).size, apps.length);
  assert.equal(new Set(apps.map((app) => app.live)).size, apps.length);
  for (const app of apps) {
    assert.ok(app.title && app.description && app.category && app.outcome);
    assert.ok(Array.isArray(app.stack) && app.stack.length);
    assert.equal(new URL(app.live).protocol, 'https:');
    assert.equal(new URL(app.repo).hostname, 'github.com');
  }
});

test('homepage and projects listing are connected to latest apps', () => {
  const route = fs.readFileSync(path.join(__dirname, '../routes/public.js'), 'utf8');
  const homepage = fs.readFileSync(path.join(__dirname, '../views/index.ejs'), 'utf8');
  assert.match(route, /latestApps: LATEST_APPS/);
  assert.match(route, /works: slug === 'projects' \? withLatestApps\(works\) : works/);
  assert.match(homepage, /id="latest-apps"/);
  assert.match(homepage, /latestApps\.forEach/);
});
