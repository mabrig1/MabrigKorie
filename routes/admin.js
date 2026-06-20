const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
  res.render('admin/dashboard', { siteUrl: process.env.SITE_URL || '' });
});

module.exports = router;
