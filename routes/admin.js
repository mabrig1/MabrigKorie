const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { recoveryReadiness } = require('../services/adminReset');
const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
  res.render('admin/dashboard', { siteUrl: process.env.SITE_URL || '' });
});

router.get('/performance', requireAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.render('admin/performance');
});

// Authenticated, read-only configuration readiness. Never expose API key or mailbox.
router.get('/recovery-health', requireAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.render('admin/recovery-health', { report: recoveryReadiness() });
});

module.exports = router;
