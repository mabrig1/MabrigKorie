const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ejs = require('ejs');
const { leadFromBody, postFromBody, minorAmount, metric, formatAmount,
  STAGES, MARKETS, CURRENCIES, PLATFORMS, PRODUCTS, POST_STATUSES } = require('../lib/businessValidation');
const { tokenFor, verifyOperationsCsrf } = require('../middleware/operationsCsrf');

test('lead fields allow valid manual business intake and separate currencies', () => {
  const lead = leadFromBody({ business: ' Nsukka Shop ', contact: '07000000000',
    market: 'Nsukka / Enugu', service: 'Business website',
    source: 'facebook / website-demo-day1', summary: 'Show our goods', currency: 'NGN' });
  assert.equal(lead.business, 'Nsukka Shop');
  assert.equal(lead.stage, 'new');
  assert.equal(lead.collectedMinor, undefined);
  assert.deepEqual([minorAmount('5000'), minorAmount('50.25'), minorAmount('0.01')], [500000, 5025, 1]);
  assert.match(formatAmount(500000,'NGN'), /5,000/);
  assert.throws(() => minorAmount('-100'), /valid/);
  assert.throws(() => minorAmount('10.999'), /valid/);
  assert.throws(() => leadFromBody({ business: '<>', market:'Unknown', service:'web', currency:'NGN' }), /Unsupported/);
  assert.throws(() => leadFromBody({ business:'', market:'Nsukka / Enugu', service:'web', currency:'NGN' }), /Required/);
  assert.deepEqual(leadFromBody({
    stage:'quoted', currency:'USD', quoted:'99.99', collected:'0', paymentNote:'Not yet paid'
  }, 'update'), { stage:'quoted',currency:'USD',quotedMinor:9999,collectedMinor:0,paymentNote:'Not yet paid' });
});

test('post planning validates campaign codes, date and whole-number metrics', () => {
  const draft = postFromBody({ day:'2026-11-04', platform:'Facebook', product:'MABRIG Technologies',
    source:'website-demo-day1', title:'A website for your shop', caption:'See the real demo' });
  assert.equal(draft.status, 'draft');
  assert.equal(draft.source, 'website-demo-day1');
  assert.deepEqual([metric('100'),metric('0')],[100,0]);
  assert.throws(()=>metric('3.5'),/whole numbers/);
  assert.throws(()=>postFromBody({ ...draft, source:'../../injected' }),/source code/);
  assert.throws(()=>postFromBody({ ...draft, day:'2026-02-30' }),/valid/);
  assert.deepEqual(postFromBody({status:'published', views:'200', followers:'9',
    enquiries:'3', sales:'1'}, 'update'), {
    status:'published',views:200,followers:9,enquiries:3,sales:1
  });
});

test('operations forms reject missing and forged CSRF tokens', () => {
  const old = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'ci-only-test-secret-not-used-in-production';
  try {
    const request = { cookies:{ admin_token:'example-signed-session' }, body:{} };
    const expected = tokenFor(request);
    assert.equal(expected.length,64);
    let status, body, nextCalled = false;
    const response = { status(n){status=n;return this;},send(v){body=v;return this;} };
    verifyOperationsCsrf(request,response,()=>{nextCalled=true;});
    assert.equal(status,403);
    assert.match(body,/Invalid session/);
    request.body._csrf = '0'.repeat(64);
    verifyOperationsCsrf(request,response,()=>{nextCalled=true;});
    assert.equal(nextCalled,false);
    request.body._csrf=expected;
    verifyOperationsCsrf(request,response,()=>{nextCalled=true;});
    assert.equal(nextCalled,true);
  } finally {
    if (old == null) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = old;
  }
});

test('admin dashboard renders properly and HTML-escapes customer fields', async () => {
  const html = await ejs.renderFile('views/admin/operations.ejs',{
    csrfToken:'0'.repeat(64),
    leads:[{
      _id:'507f1f77bcf86cd799439011',
      business:'<script>alert(1)</script>',
      contact:'contact@example.com',market:'Nsukka / Enugu',service:'Website',
      source:'facebook / website-demo-day1',summary:'Client wants catalogue',
      stage:'new',currency:'NGN',quotedMinor:10000,collectedMinor:0,paymentNote:''
    }],
    posts:[{
      _id:'507f1f77bcf86cd799439012',title:'Website demo',day:'2026-11-04',
      platform:'Facebook',product:'MABRIG Technologies',source:'website-demo-day1',
      caption:'Show the demo and ask a question',status:'draft',views:0,followers:0,enquiries:0,sales:0
    }],
    totals:[{_id:'NGN',count:1,quoted:10000,recorded:0}],
    campaignTotals:[{_id:'MABRIG Technologies',posts:1,views:200,followers:5,enquiries:2,sales:1}],
    totalLeadCount:1,totalPostCount:1,STAGES,MARKETS,CURRENCIES,PLATFORMS,PRODUCTS,POST_STATUSES,
    formatAmount,today:'2026-11-04'
  });
  assert.match(html,/Customer pipeline/);
  assert.match(html,/Organic promotion studio/);
  assert.match(html,/website-demo-day1/);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.match(html,/type="hidden" name="_csrf"/);
});

test('only admin-authenticated operations paths are registered; no public lead API', () => {
  const routerSrc=fs.readFileSync('routes/operations.js','utf8');
  const serverSrc=fs.readFileSync('server.js','utf8');
  assert.ok(routerSrc.includes('router.use(requireAdmin)'));
  assert.ok(routerSrc.includes('router.use(verifyOperationsCsrf)'));
  assert.ok(serverSrc.includes("app.use('/admin/operations', operationsRoutes)"));
  assert.ok(!serverSrc.includes("app.use('/api/leads'"));
});
