const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const apps = require('../data/latest-apps');
const { repairPublicWorkLink, AI_UNIVERSITY_URL } = require('../services/publicLinkFixes');

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');

test('AI University uses the requested canonical domain on the home, projects and academy paths', () => {
  const app = apps.find((item) => item.slug === 'ai-university');
  assert.equal(app.live, AI_UNIVERSITY_URL);
  assert.match(read('views/academy.ejs'), /https:\/\/aiuniversity\.mabrigkorie\.org\//);
  assert.doesNotMatch(read('README.md'), /aiuniversityhq\.uk/);
  assert.match(read('views/index.ejs'), /latestApps\.forEach/);
  assert.match(read('routes/public.js'), /works: slug === 'projects' \? withLatestApps\(works\) : works/);
});

test('legacy AI University and misdirected Destiny Skills records render corrected links', () => {
  assert.equal(repairPublicWorkLink({
    title: 'AI University', url: 'https://aiuniversityhq.uk/'
  }).url, AI_UNIVERSITY_URL);
  assert.equal(repairPublicWorkLink({
    title: 'Destiny Skills Bridge', url: 'https://www.mabrigresearch.online/'
  }).url, 'https://ddei.online/');
  assert.equal(repairPublicWorkLink({
    title: 'Igbo Truth', url: 'https://music.apple.com/album/igbo-truth-glory-hallelujah'
  }).url, 'https://music.apple.com/us/album/igbo-truth-glory-hallelujah-single/1866634330');
  const custom = { title: 'Destiny Skills Bridge', url: 'https://custom.example/' };
  assert.equal(repairPublicWorkLink(custom), custom, 'do not override edited links');
  assert.equal(repairPublicWorkLink(null), null);
});

test('the public homepage, category pages and detail pages all apply legacy link repairs', () => {
  const routes = read('routes/public.js');
  assert.match(routes, /app: works\.filter\(\(w\) => w\.category === 'app'\)\.map\(repairPublicWorkLink\)/);
  assert.match(routes, /\.map\(repairPublicWorkLink\);/);
  assert.match(routes, /const work = repairPublicWorkLink\(storedWork\)/);
  assert.match(routes, /\x60\$\{SITE_URL\(\)\}\/academy\x60/);
});

test('seed data no longer sends Destiny Skills to Mabrig Research or Apple Music to incomplete slugs', () => {
  const seed = read('seed.js');
  assert.match(seed, /title: 'Destiny Skills Bridge',[\s\S]*?url: 'https:\/\/ddei\.online\/'/);
  assert.doesNotMatch(seed, /music\.apple\.com\/album\/(?:justice-before-unity|igbo-truth-glory-hallelujah)/);
});
