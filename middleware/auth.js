const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies.admin_token;
  if (!token) return res.redirect('/admin/login');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.redirect('/admin/login');
  }
}

function requireAdminApi(req, res, next) {
  const token = req.cookies && req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = { requireAdmin, requireAdminApi };
