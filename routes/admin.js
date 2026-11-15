const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
  res.render('admin/dashboard', { siteUrl: process.env.SITE_URL || '' });
});

router.get('/performance', requireAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.render('admin/performance');
});

module.exports = router;
