const crypto = require('node:crypto');

function tokenFor(req) {
  const session = req.cookies && req.cookies.admin_token;
  if (!session || !process.env.JWT_SECRET) return '';
  return crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update('mabrig-business-operations-v1:' + session)
    .digest('hex');
}

function verifyOperationsCsrf(req, res, next) {
  const expected = tokenFor(req);
  const incoming = typeof req.body?._csrf === 'string' ? req.body._csrf : '';
  const valid = Boolean(expected) && /^[a-f0-9]{64}$/.test(incoming) &&
    crypto.timingSafeEqual(Buffer.from(incoming, 'hex'), Buffer.from(expected, 'hex'));
  if (!valid) return res.status(403).send('Invalid session form token. Reload the page and retry.');
  next();
}

module.exports = { tokenFor, verifyOperationsCsrf };
