const jwt = require('jsonwebtoken');
const AdminAuth = require('../models/AdminAuth');

async function verifyAdminSession(req) {
  const token = req.cookies && req.cookies.admin_token;
  if (!token) return false;

  const claims = jwt.verify(token, process.env.JWT_SECRET);
  if (claims.username !== process.env.ADMIN_USERNAME) return false;

  // The database records when a password was most recently reset.
  // Prior JWTs become invalid immediately, even if their 12-hour TTL remains.
  const account = await AdminAuth.findById('primary').select('passwordChangedAt');
  const currentVersion = account && account.passwordChangedAt
    ? account.passwordChangedAt.getTime() : 0;
  const tokenVersion = claims.passwordVersion || 0;
  return tokenVersion === currentVersion;
}

async function requireAdmin(req, res, next) {
  try {
    if (await verifyAdminSession(req)) return next();
  } catch (error) {
    console.error('Admin session check failed:', error.message);
  }
  res.clearCookie('admin_token');
  return res.redirect('/admin/login');
}

async function requireAdminApi(req, res, next) {
  try {
    if (await verifyAdminSession(req)) return next();
  } catch (error) {
    console.error('Admin API session check failed:', error.message);
  }
  return res.status(401).json({ error: 'Not authenticated or session expired' });
}

module.exports = { requireAdmin, requireAdminApi };
