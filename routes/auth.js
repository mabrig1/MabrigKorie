const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyAdminCredentials } = require('../lib/adminCredentials');
const router = express.Router();
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

router.get('/', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/', (req, res) => {
  const { username, password } = req.body;

  if (!verifyAdminCredentials(username, password)) {
    return res.status(401).render('admin/login', { error: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.cookie('admin_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000,
  });
  res.redirect(303, '/admin');
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.redirect('/admin/login');
});

module.exports = router;
