const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ejs = require('ejs');

const meta = {
  title:'Free Business Check', description:'Business self-check',
  url:'https://www.mabrigkorie.org/business/check'
};

test('public self-assessment renders 7 labelled questions and privacy disclosure', async () => {
  const questions = [
    {id:'discover',question:'Can customers find you?'},
    {id:'contact',question:'Can customers reach you?'},
    {id:'offer',question:'Can customers see your offer?'},
    {id:'mobile',question:'Does your site work on phones?'},
    {id:'followup',question:'Do you follow up?'},
    {id:'trust',question:'Can buyers trust the business?'},
    {id:'workflow',question:'Can you reduce repetitive work?'}
  ];
  const html = await ejs.renderFile('views/business-check.ejs',{
    meta, questions,siteUrl:'https://www.mabrigkorie.org'
  });
  assert.equal((html.match(/class="check-question"/g)||[]).length,7);
  assert.match(html,/How ready is your business/);
  assert.match(html,/Your answers and score remain in your browser/);
  assert.match(html,/business-check.js/);
  assert.match(html,/id="check-result"/);
  assert.match(html,/No account required|NO ACCOUNT REQUIRED/i);
  const routes = fs.readFileSync('routes/public.js','utf8');
  assert.ok(routes.includes("router.get('/business/check'"));
  assert.ok(routes.includes("`${SITE_URL()}/business/check`"));
});

test('check script produces deterministic score, actionable steps and voluntary WhatsApp draft', () => {
  const handlers = {};
  let renderNodes=[];
  const ids={
    'readiness-check':{
      addEventListener: (name,cb)=>{handlers['form-'+name]=cb;},
      reportValidity:()=>true,
      reset:()=>{},
      scrollIntoView:()=>{}
    },
    'check-result':{hidden:true,scrollIntoView:()=>{}},
    'check-score':{textContent:''},
    'check-result-intro':{textContent:''},
    'check-next-steps':{
      replaceChildren:()=>{renderNodes=[];},
      appendChild:(node)=>{renderNodes.push(node);}
    },
    'check-discuss':{href:''},
    'check-reset':{addEventListener:(name,cb)=>{handlers['reset-'+name]=cb;}},
    'check-share':{addEventListener:(name,cb)=>{handlers['share-'+name]=cb;}},
    'share-message':{textContent:''}
  };
  const values={
    discover:'1',contact:'1',offer:'0',mobile:'1',followup:'0',trust:'1',workflow:'0'
  };
  const context = {
    document:{
      getElementById:(id)=>ids[id],
      createElement:(tag)=>{assert.equal(tag,'li');return {textContent:''};}
    },
    FormData: class{constructor(){ } get(id){return values[id]||null;}},
    navigator:{},
    encodeURIComponent
  };
  vm.runInNewContext(fs.readFileSync('public/js/business-check.js','utf8'),context);
  let prevented=false;
  handlers['form-submit']({preventDefault:()=>{prevented=true;}});
  assert.equal(prevented,true);
  assert.equal(ids['check-result'].hidden,false);
  assert.match(ids['check-score'].textContent,/4 \/ 7/);
  assert.equal(renderNodes.length,3);
  assert.match(renderNodes[0].textContent,/products or services/i);
  assert.match(decodeURIComponent(ids['check-discuss'].href),/Result: 4 \/ 7/);
  assert.ok(ids['check-discuss'].href.startsWith('https://wa.me/2347065342818?text='));
  handlers['reset-click']();
  assert.equal(ids['check-result'].hidden,true);
});

test('private printable quotation renders with escaped client input and no payment claim',async()=>{
  const lead={
    _id:'507f1f77bcf86cd799439011',
    business:'<script>alert(1)</script>',
    service:'Business website',
    summary:'A catalog and enquiry button',
    contact:'client@example.com',
    currency:'NGN',
    quotedMinor:12500000
  };
  const html=await ejs.renderFile('views/admin/quote.ejs',{
    lead, reference:'MBR-99439011',issueDate:'2026-11-04',validUntil:'2026-11-18',
    CURRENCIES:['NGN','USD','GBP','EUR'],
    formatAmount:(v)=>'NGN '+(v/100).toFixed(2)
  });
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.match(html,/Print \/ Save as PDF/);
  assert.match(html,/not a tax invoice/i);
  assert.match(html,/quote.js/);
  const routes=fs.readFileSync('routes/operations.js','utf8');
  assert.ok(routes.includes("router.get('/quotes/:id'"));
  assert.ok(routes.indexOf("router.use(requireAdmin)") < routes.indexOf("router.get('/quotes/:id'"));
  assert.ok(fs.readFileSync('views/admin/operations.ejs','utf8').includes('/admin/operations/quotes/'));
});
