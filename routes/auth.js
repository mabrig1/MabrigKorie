const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AdminAuth = require('../models/AdminAuth');
const {
  requestAdminReset,
  isValidResetToken,
  consumeResetToken,
  validateNewPassword,
} = require('../services/adminReset');

const router = express.Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.render('admin/login', {
    error: null,
    notice: req.query.reset === 'success' ? 'Password changed. Sign in with your new password.' : null,
  });
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Once a password is reset, MongoDB becomes the source of truth.
    // The old ADMIN_PASSWORD environment variable MUST stop authenticating.
    const account = await AdminAuth.findById('primary').select('passwordHash passwordChangedAt');
    const matchesUsername = typeof username === 'string' && username === process.env.ADMIN_USERNAME;
    let matchesPassword = false;

    if (matchesUsername && typeof password === 'string') {
      if (account && account.passwordHash) {
        matchesPassword = await bcrypt.compare(password, account.passwordHash);
      } else {
        matchesPassword = Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
      }
    }

    if (!matchesUsername || !matchesPassword) {
      return res.status(401).render('admin/login', {
        error: 'Invalid username or password', notice: null,
      });
    }

    const token = jwt.sign({
      username,
      passwordVersion: account && account.passwordChangedAt
        ? account.passwordChangedAt.getTime() : 0,
    }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.cookie('admin_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 12 * 60 * 60 * 1000,
    });
    return res.redirect('/admin');
  } catch (error) {
    console.error('Admin authentication failed:', error.message);
    return res.status(503).render('admin/login', {
      error: 'Login is temporarily unavailable. Please try again.', notice: null,
    });
  }
});

router.get('/forgot-password', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.render('admin/forgot-password', { submitted: false });
});

router.post('/forgot-password', async (req, res) => {
  // Identical response for unmatched addresses, throttled requests, and delivery failures.
  try {
    await requestAdminReset(req.body.email);
  } catch (error) {
    console.error('Admin recovery request failed:', error.message);
  }
  res.set('Cache-Control', 'no-store');
  return res.render('admin/forgot-password', { submitted: true });
});

router.get('/reset-password', async (req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  try {
    const token = req.query.token;
    const valid = await isValidResetToken(token);
    return res.render('admin/reset-password', {
      token: valid ? token : '',
      error: valid ? null : 'This link is invalid, expired, or has already been used.',
    });
  } catch (error) {
    console.error('Admin recovery link validation failed:', error.message);
    return res.status(503).render('admin/reset-password', {
      token: '', error: 'Password recovery is temporarily unavailable.',
    });
  }
});

router.post('/reset-password', async (req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  const { token, password, confirmPassword } = req.body;
  const error = validateNewPassword(password) ||
    (password !== confirmPassword ? 'Your passwords do not match.' : null);

  if (error) {
    return res.status(400).render('admin/reset-password', { token, error });
  }

  try {
    if (!await consumeResetToken(token, password)) {
      return res.status(400).render('admin/reset-password', {
        token: '', error: 'This link is invalid, expired, or has already been used.',
      });
    }
    // A successful reset revokes existing admin sessions via passwordVersion checks.
    res.clearCookie('admin_token');
    return res.redirect('/admin/login?reset=success');
  } catch (caught) {
    console.error('Admin password reset failed:', caught.message);
    return res.status(503).render('admin/reset-password', {
      token: '', error: 'Password recovery is temporarily unavailable.',
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.redirect('/admin/login');
});

module.exports = router;
