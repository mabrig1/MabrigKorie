const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ejs = require('ejs');

const siteUrl = 'https://www.mabrigkorie.org';
const meta = {
  title: 'MABRIG Technologies — Business Services',
  description: 'Websites and practical business software',
  url: siteUrl + '/business'
};

test('business landing renders with conversion CTAs, canonical metadata and contact', async () => {
  const html = await ejs.renderFile('views/business.ejs', { meta, siteUrl });
  for (const piece of [
    'Request a project quotation',
    'Get a quotation for your business',
    'Online stores',
    'AI &amp; workflow automation',
    'id="business-enquiry"',
    'https://wa.me/2347065342818',
    'mabrig@mabrigkorie.org',
    'https://www.mabrigkorie.org/business',
    'application/ld+json',
    '/public/js/business.js',
    'Business Services'
  ]) assert.ok(html.includes(piece), 'Missing: ' + piece);
  assert.match(html, /<meta name="description"/);
  assert.ok(!html.includes('Guaranteed earnings'));
});

test('enquiry privacy disclosure renders without implied auto-collection', async () => {
  const html = await ejs.renderFile('views/business-privacy.ejs', {
    meta: { title: 'Business privacy', description: 'Privacy notice',
      url: 'https://www.mabrigkorie.org/business/privacy' }
  });
  assert.match(html, /not automatically save the form/);
  assert.match(html, /manually record/);
  assert.match(html, /mabrig@mabrigkorie.org/);
});

test('enquiry script builds user-reviewed WhatsApp brief with attribution, without server submission', () => {
  let submitted;
  let opened;
  const fields = new Map([
    ['business', 'Example Enterprise'],
    ['market', 'Nsukka / Enugu'],
    ['service', 'Business website'],
    ['goal', 'Showcase services and accept enquiries'],
    ['budget', 'NGN 100,000 - 250,000']
  ]);
  const form = {
    reportValidity: () => true,
    addEventListener: (event, callback) => { if (event === 'submit') submitted = callback; }
  };
  const elements = {
    'business-enquiry': form,
    'business-service': { value: '' },
    'business-form-error': { hidden: true, textContent: '' }
  };
  const context = {
    document: {
      getElementById: (id) => elements[id],
      querySelectorAll: () => []
    },
    FormData: class { constructor() {} get(key) { return fields.get(key); } },
    URLSearchParams,
    encodeURIComponent,
    location: {
      search: '?utm_source=facebook&utm_campaign=website-demo-day1',
      assign: (target) => { opened = target; }
    }
  };
  vm.runInNewContext(fs.readFileSync('public/js/business.js','utf8'), context);
  assert.equal(typeof submitted, 'function');
  let prevented = false;
  submitted({ preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.ok(opened.startsWith('https://wa.me/2347065342818?text='));
  const message = decodeURIComponent(opened.split('?text=')[1]);
  assert.match(message, /Business: Example Enterprise/);
  assert.match(message, /Market: Nsukka \/ Enugu/);
  assert.match(message, /Service: Business website/);
  assert.match(message, /Enquiry source: facebook \/ website-demo-day1/);
});

test('marketing route and sitemap are registered', () => {
  const src = fs.readFileSync('routes/public.js','utf8');
  assert.ok(src.includes("router.get('/business'"));
  assert.ok(src.includes("`${SITE_URL()}/business`"));
  assert.ok(fs.readFileSync('views/index.ejs','utf8').includes('href="/business#request"'));
  assert.ok(fs.readFileSync('views/partials/nav.ejs','utf8').includes('href="/business"'));
  assert.ok(src.includes("router.get('/business/privacy'"));
});
