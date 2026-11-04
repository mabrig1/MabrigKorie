const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { verifyAdminCredentials } = require('../lib/adminCredentials');
const { sameOriginMutation } = require('../middleware/sameOrigin');
const fs = require('node:fs');

const base = {
  ADMIN_USERNAME: 'site-owner',
  ADMIN_PASSWORD: 'example-strong-password-used-only-in-tests',
  JWT_SECRET: 'another-test-only-random-session-key-123'
};

test('existing username/password configuration still works without migration', () => {
  assert.equal(verifyAdminCredentials('site-owner',base.ADMIN_PASSWORD,base),true);
  assert.equal(verifyAdminCredentials('site-owner','wrong-password',base),false);
  assert.equal(verifyAdminCredentials('not-the-owner',base.ADMIN_PASSWORD,base),false);
  assert.equal(verifyAdminCredentials(null,base.ADMIN_PASSWORD,base),false);
  assert.equal(verifyAdminCredentials('site-owner',[],base),false);
  assert.equal(verifyAdminCredentials('site-owner',base.ADMIN_PASSWORD,{ ...base, JWT_SECRET:'' }),false);
});

test('bcrypt admin hash takes precedence and malformed hashes fail closed', () => {
  const hash = bcrypt.hashSync('correct-test-password', 4);
  const cfg = { ...base, ADMIN_PASSWORD_HASH: hash };
  assert.equal(verifyAdminCredentials('site-owner','correct-test-password',cfg),true);
  assert.equal(verifyAdminCredentials('site-owner',base.ADMIN_PASSWORD,cfg),false);
  assert.equal(verifyAdminCredentials('site-owner','correct-test-password',{
    ...cfg,ADMIN_PASSWORD_HASH:'not-a-bcrypt-hash'
  }),false);
});

function request(method,origin,site,host='www.mabrigkorie.org') {
  const headers={host,'sec-fetch-site':site,origin};
  return {method,get:(key)=>headers[key]};
}

function response() {
  return {statusCode:null,message:null,status(n){this.statusCode=n;return this;},send(s){this.message=s;return this;}};
}

test('write operations allow correct same-origin browser requests', () => {
  const res=response();let nexted=0;
  sameOriginMutation(request('POST','https://www.mabrigkorie.org','same-origin'),res,()=>nexted++);
  assert.equal(nexted,1);
  assert.equal(res.statusCode,null);
});

test('cross-site and mismatched origins are rejected for sensitive writes', () => {
  for (const req of [
    request('POST','https://malicious.example','cross-site'),
    request('PUT','https://malicious.example','same-site'),
    request('DELETE','not-a-url','same-origin'),
    request('POST','https://mabrigkorie.org','same-site')
  ]) {
    const res=response();let nexted=false;
    sameOriginMutation(req,res,()=>{nexted=true;});
    assert.equal(nexted,false);
    assert.equal(res.statusCode,403);
  }
});

test('public GET and HEAD routes are not blocked by same-origin protections', () => {
  for (const method of ['GET','HEAD','OPTIONS']) {
    const res=response();let nexted=false;
    sameOriginMutation(request(method,'https://outside.example','cross-site'),res,()=>{nexted=true;});
    assert.equal(nexted,true);
  }
});

test('server wraps admin and API writes with same-origin checks', () => {
  const src=fs.readFileSync('server.js','utf8');
  assert.match(src,/app\.use\('\/admin\/login', sameOriginMutation, authRoutes\)/);
  assert.match(src,/app\.use\('\/admin\/operations', sameOriginMutation, operationsRoutes\)/);
  assert.match(src,/app\.use\('\/api\/works', sameOriginMutation, worksRoutes\)/);
  assert.match(src,/app\.use\('\/api\/social-links', sameOriginMutation, socialLinksRoutes\)/);
  const authSrc=fs.readFileSync('routes/auth.js','utf8');
  assert.match(authSrc,/verifyAdminCredentials\(username, password\)/);
});
