const express = require('express');
const SocialLink = require('../models/SocialLink');
const { requireAdminApi } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const links = await SocialLink.find().sort({ order: 1 });
  res.json(links);
});

router.post('/', requireAdminApi, async (req, res) => {
  try {
    const { platform, url, icon, order } = req.body;
    const link = await SocialLink.create({ platform, url, icon, order: Number(order) || 0 });
    res.status(201).json(link);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireAdminApi, async (req, res) => {
  try {
    const { platform, url, icon, order } = req.body;
    const link = await SocialLink.findByIdAndUpdate(
      req.params.id,
      { platform, url, icon, order: Number(order) || 0 },
      { new: true }
    );
    if (!link) return res.status(404).json({ error: 'Not found' });
    res.json(link);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', requireAdminApi, async (req, res) => {
  await SocialLink.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
