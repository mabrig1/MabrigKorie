const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

function constantTimeStringEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = crypto.createHash('sha256').update(left).digest();
  const b = crypto.createHash('sha256').update(right).digest();
  return crypto.timingSafeEqual(a,b);
}

function verifyAdminCredentials(username, password, config = process.env) {
  if (typeof username !== 'string' || typeof password !== 'string' ||
      username.length > 128 || password.length > 512 || !username || !password) return false;
  if (!config.ADMIN_USERNAME || !config.JWT_SECRET || config.JWT_SECRET.length < 24) return false;
  if (!constantTimeStringEqual(username, config.ADMIN_USERNAME)) return false;

  // Optional migration to a bcrypt-hashed secret; if defined, it wins over
  // ADMIN_PASSWORD and never falls back to the plaintext value on failure.
  if (typeof config.ADMIN_PASSWORD_HASH === 'string' && config.ADMIN_PASSWORD_HASH) {
    if (!/^\$2[aby]\$\d\d\$/.test(config.ADMIN_PASSWORD_HASH)) return false;
    try { return bcrypt.compareSync(password, config.ADMIN_PASSWORD_HASH); }
    catch (err) { return false; }
  }
  if (typeof config.ADMIN_PASSWORD !== 'string' || !config.ADMIN_PASSWORD) return false;
  return constantTimeStringEqual(password, config.ADMIN_PASSWORD);
}

module.exports = { verifyAdminCredentials };
