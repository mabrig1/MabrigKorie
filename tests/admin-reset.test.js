const test = require('node:test');
const assert = require('node:assert/strict');
const AdminAuth = require('../models/AdminAuth');
const {
  normalizeEmail,
  recoveryReadiness,
  deliveryErrorHint,
  isAuthorizedRecoveryEmail,
  validateNewPassword,
  requestAdminReset,
  isValidResetToken,
  consumeResetToken,
} = require('../services/adminReset');

test('normalizes email and permits only the configured admin recovery address', () => {
  const before = process.env.ADMIN_RECOVERY_EMAIL;
  try {
    process.env.ADMIN_RECOVERY_EMAIL = 'Owner@Example.com';
    assert.equal(normalizeEmail(' Owner@Example.com '), 'owner@example.com');
    assert.equal(isAuthorizedRecoveryEmail(' OWNER@example.com '), true);
    assert.equal(isAuthorizedRecoveryEmail('intruder@example.com'), false);
  } finally {
    if (before === undefined) delete process.env.ADMIN_RECOVERY_EMAIL;
    else process.env.ADMIN_RECOVERY_EMAIL = before;
  }
});

test('requires a sufficiently strong password within bcrypt byte limit', () => {
  assert.match(validateNewPassword('short'), /12 characters/);
  assert.equal(validateNewPassword('a-safe-passphrase-2026'), null);
  assert.match(validateNewPassword('😀'.repeat(20)), /72 UTF-8 bytes/);
});

test('invalid or malformed tokens never reach the database', async () => {
  assert.equal(await isValidResetToken('not-a-token'), false);
  assert.equal(await consumeResetToken('bad', 'a-safe-passphrase-2026'), false);
});

test('recovery requests never send to a submitted unrecognized mailbox', async () => {
  const original = process.env.ADMIN_RECOVERY_EMAIL;
  const savedFetch = global.fetch;
  try {
    process.env.ADMIN_RECOVERY_EMAIL = 'owner@example.com';
    global.fetch = async () => { throw new Error('Unrecognized email must not send'); };
    assert.equal(await requestAdminReset('other@example.com'), false);
  } finally {
    global.fetch = savedFetch;
    if (original === undefined) delete process.env.ADMIN_RECOVERY_EMAIL;
    else process.env.ADMIN_RECOVERY_EMAIL = original;
  }
});

test('recovery emails contain a single-use link and use a hashed database token', async () => {
  const previous = Object.fromEntries(
    ['ADMIN_RECOVERY_EMAIL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'SITE_URL']
      .map((name) => [name, process.env[name]]),
  );
  const originalFind = AdminAuth.findOneAndUpdate;
  const savedFetch = global.fetch;
  let filter, update, message;

  try {
    Object.assign(process.env, {
      ADMIN_RECOVERY_EMAIL: 'owner@example.com',
      RESEND_API_KEY: 'test-key',
      RESEND_FROM_EMAIL: 'Admin <no-reply@example.com>',
      SITE_URL: 'https://www.mabrigkorie.org',
    });
    AdminAuth.findOneAndUpdate = async (f, u) => { filter = f; update = u; return {}; };
    global.fetch = async (_url, options) => {
      message = JSON.parse(options.body);
      return { ok: true, status: 200, json: async () => ({ id: 'test-resend-email-id' }) };
    };

    assert.equal(await requestAdminReset('OWNER@example.com'), true);
    assert.deepEqual(message.to, ['owner@example.com']);
    assert.equal(update.$set.resetTokenHash.length, 64);
    assert.equal(filter._id, 'primary');
    assert.match(message.text, /https:\/\/www\.mabrigkorie\.org\/admin\/login\/reset-password\?token=[a-f0-9]{64}/);
    assert.doesNotMatch(message.text, new RegExp(update.$set.resetTokenHash));
  } finally {
    AdminAuth.findOneAndUpdate = originalFind;
    global.fetch = savedFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('single-use password reset requires matching unexpired token and clears it', async () => {
  const originalFind = AdminAuth.findOneAndUpdate;
  let query, changes;
  try {
    AdminAuth.findOneAndUpdate = async (q, u) => { query = q; changes = u; return { _id: 'primary' }; };
    const token = 'e'.repeat(64);
    assert.equal(await consumeResetToken(token, 'a-safe-passphrase-2026'), true);
    assert.notEqual(query.resetTokenHash, token);
    assert.equal(query.resetTokenHash.length, 64);
    assert.ok(query.resetTokenExpiresAt.$gt instanceof Date);
    assert.ok(changes.$set.passwordHash.startsWith('$2'));
    assert.equal(changes.$unset.resetTokenHash, '');
    AdminAuth.findOneAndUpdate = async () => null;
    assert.equal(await consumeResetToken(token, 'a-safe-passphrase-2026'), false);
  } finally {
    AdminAuth.findOneAndUpdate = originalFind;
  }
});

test('recovery readiness reports missing settings without returning secrets or addresses', () => {
  const vars = ['ADMIN_RECOVERY_EMAIL', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'SITE_URL', 'MONGODB_URI', 'JWT_SECRET'];
  const previous = Object.fromEntries(vars.map((key) => [key, process.env[key]]));
  try {
    for (const key of vars) delete process.env[key];
    const missing = recoveryReadiness();
    assert.equal(missing.readyForAttempt, false);
    assert.equal(missing.checks.resendKey, false);
    Object.assign(process.env, {
      ADMIN_RECOVERY_EMAIL: 'owner@example.com',
      RESEND_API_KEY: 're_abcdefghijklmnopqrstuvwxyz',
      RESEND_FROM_EMAIL: 'MABRIG <no-reply@example.com>',
      SITE_URL: 'https://www.mabrigkorie.org',
      MONGODB_URI: 'mongodb://example.test/test',
      JWT_SECRET: 'test-secret-not-for-production',
    });
    const ready = recoveryReadiness();
    assert.equal(ready.readyForAttempt, true);
    assert.doesNotMatch(JSON.stringify(ready), /owner@example.com|re_abcdefg/);
    process.env.SITE_URL = 'http://www.mabrigkorie.org';
    assert.equal(recoveryReadiness().checks.siteUrlIsHttps, false);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('Resend API error hints distinguish invalid keys and unverified sender domains', () => {
  assert.match(deliveryErrorHint(401), /RESEND_API_KEY/);
  assert.match(deliveryErrorHint(403), /sender-domain verification/);
  assert.match(deliveryErrorHint(429), /rate limit/);
});

test('a 2xx response without Resend receipt ID fails closed and clears pending reset token', async () => {
  const vars = ['ADMIN_RECOVERY_EMAIL','RESEND_API_KEY','RESEND_FROM_EMAIL','SITE_URL'];
  const previous = Object.fromEntries(vars.map((key) => [key, process.env[key]]));
  const oldFind = AdminAuth.findOneAndUpdate;
  const oldUpdate = AdminAuth.updateOne;
  const oldFetch = global.fetch;
  let cleaned = false;
  try {
    Object.assign(process.env, {
      ADMIN_RECOVERY_EMAIL: 'owner@example.com',
      RESEND_API_KEY: 're_some-valid-looking-test-key',
      RESEND_FROM_EMAIL: 'MABRIG <no-reply@example.com>',
      SITE_URL: 'https://www.mabrigkorie.org',
    });
    AdminAuth.findOneAndUpdate = async () => ({});
    AdminAuth.updateOne = async () => { cleaned = true; };
    global.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
    await assert.rejects(requestAdminReset('owner@example.com'), /acknowledgement was incomplete/);
    assert.equal(cleaned, true);
  } finally {
    AdminAuth.findOneAndUpdate = oldFind;
    AdminAuth.updateOne = oldUpdate;
    global.fetch = oldFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
