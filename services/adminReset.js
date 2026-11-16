const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const AdminAuth = require('../models/AdminAuth');

const ADMIN_ID = 'primary';
const TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 5 * 60 * 1000;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isAuthorizedRecoveryEmail(email) {
  const configured = normalizeEmail(process.env.ADMIN_RECOVERY_EMAIL);
  return Boolean(configured && normalizeEmail(email) === configured);
}

function validateNewPassword(password) {
  if (typeof password !== 'string' || password.length < 12) {
    return 'Use a password of at least 12 characters.';
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'Use a password no longer than 72 UTF-8 bytes.';
  }
  return null;
}

function recoveryReadiness() {
  const email = normalizeEmail(process.env.ADMIN_RECOVERY_EMAIL);
  const apiKey = process.env.RESEND_API_KEY || '';
  const sender = process.env.RESEND_FROM_EMAIL || '';
  const fromMatch = sender.trim().match(/^(?:[^<>\r\n]+\s*<)?([^<>\s@]+@[^<>\s@]+\.[^<>\s@]+)>?$/);
  let siteUrlIsHttps = false;
  try {
    const url = new URL(process.env.SITE_URL || '');
    siteUrlIsHttps = url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash;
  } catch (_) { /* SITE_URL is absent or invalid. */ }
  const checks = {
    recoveryEmail: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
    resendKey: apiKey.startsWith('re_') && apiKey.length > 12,
    verifiedSenderConfigured: Boolean(fromMatch),
    siteUrlIsHttps,
    databaseConfigured: Boolean(process.env.MONGODB_URI),
    jwtConfigured: Boolean(process.env.JWT_SECRET),
  };
  return {
    checks,
    readyForAttempt: Object.values(checks).every(Boolean),
    disclaimer: 'Configuration checks do not verify the Resend key, sender domain, inbox delivery, or database connectivity.',
  };
}

function deliveryErrorHint(status) {
  if (status === 401) return 'Resend rejected authentication. Inspect the deployed RESEND_API_KEY.';
  if (status === 403) return 'Resend denied sending. Check sender-domain verification and key permissions.';
  if (status === 422 || status === 400) return 'Resend rejected message details. Check RESEND_FROM_EMAIL and recovery recipient.';
  if (status === 429) return 'Resend rate limit reached; wait before retrying.';
  return 'Resend could not accept the recovery email. Inspect the Resend dashboard Logs and Emails.';
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function resetLink(token) {
  const origin = new URL(process.env.SITE_URL || 'https://www.mabrigkorie.org');
  if (origin.protocol !== 'https:') throw new Error('SITE_URL must use HTTPS for password recovery');
  const url = new URL('/admin/login/reset-password', origin.origin);
  url.searchParams.set('token', token);
  return url.toString();
}

// Always send to the separately configured address, never a submitted destination.
// The caller gives the same public response whether the address matches or not.
async function requestAdminReset(email) {
  if (!isAuthorizedRecoveryEmail(email)) return false;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error('Admin password recovery not configured: RESEND_API_KEY or RESEND_FROM_EMAIL missing');
    return false;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const now = new Date();
  const cutoff = new Date(now.getTime() - REQUEST_COOLDOWN_MS);

  try {
    await AdminAuth.findOneAndUpdate({
      _id: ADMIN_ID,
      $or: [
        { resetRequestedAt: null },
        { resetRequestedAt: { $lte: cutoff } },
      ],
    }, {
      $set: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: new Date(now.getTime() + TOKEN_LIFETIME_MS),
        resetRequestedAt: now,
      },
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
  } catch (error) {
    // Concurrent/too-frequent requests can collide with the singleton's _id.
    if (error.code === 11000) return false;
    throw error;
  }

  try {
    const link = resetLink(token);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [process.env.ADMIN_RECOVERY_EMAIL.trim()],
        subject: 'Reset your MABRIG administrator password',
        text: `A password reset was requested for your MABRIG administrator account. Open this link within 15 minutes: ${link}\n\nIf you did not request this, ignore this email. Your password will remain unchanged.`,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Resend recovery send failed: HTTP ' + response.status + '. ' + deliveryErrorHint(response.status));
      throw new Error('Recovery email delivery failed');
    }
    // A 2xx HTTP response is necessary but not enough: Resend normally
    // returns an email ID upon accepting a message for delivery.
    const receipt = await response.json();
    if (!receipt || typeof receipt.id !== 'string' || !receipt.id.trim()) {
      console.error('Resend recovery send returned no email receipt ID.');
      throw new Error('Recovery email acknowledgement was incomplete');
    }
    console.info('Resend accepted admin recovery email for delivery; confirm the delivery event in Resend Emails.');
    return true;
  } catch (error) {
    // Let a legitimate admin retry if delivery failed.
    await AdminAuth.updateOne(
      { _id: ADMIN_ID, resetTokenHash: tokenHash },
      { $unset: { resetTokenHash: '', resetTokenExpiresAt: '', resetRequestedAt: '' } },
    ).catch(() => {});
    throw error;
  }
}

async function isValidResetToken(token) {
  if (typeof token !== 'string' || !TOKEN_PATTERN.test(token)) return false;
  return Boolean(await AdminAuth.exists({
    _id: ADMIN_ID,
    resetTokenHash: hashToken(token),
    resetTokenExpiresAt: { $gt: new Date() },
  }));
}

async function consumeResetToken(token, password) {
  if (typeof token !== 'string' || !TOKEN_PATTERN.test(token) || validateNewPassword(password)) {
    return false;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  // Atomic, single-use update: two concurrent submissions cannot both succeed.
  const changed = await AdminAuth.findOneAndUpdate({
    _id: ADMIN_ID,
    resetTokenHash: hashToken(token),
    resetTokenExpiresAt: { $gt: new Date() },
  }, {
    $set: { passwordHash, passwordChangedAt: new Date() },
    $unset: { resetTokenHash: '', resetTokenExpiresAt: '', resetRequestedAt: '' },
  });
  return Boolean(changed);
}

module.exports = {
  normalizeEmail,
  recoveryReadiness,
  deliveryErrorHint,
  isAuthorizedRecoveryEmail,
  validateNewPassword,
  requestAdminReset,
  isValidResetToken,
  consumeResetToken,
};
