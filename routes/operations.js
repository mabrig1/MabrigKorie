const express = require('express');
const mongoose = require('mongoose');
const { requireAdmin } = require('../middleware/auth');
const { tokenFor, verifyOperationsCsrf } = require('../middleware/operationsCsrf');
const { leadFromBody, postFromBody, formatAmount,
  STAGES, MARKETS, CURRENCIES, PLATFORMS, PRODUCTS, POST_STATUSES } = require('../lib/businessValidation');
const BusinessLead = require('../models/BusinessLead');
const PromoPost = require('../models/PromoPost');

const router = express.Router();
router.use(requireAdmin);
router.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

router.get('/', async (req, res) => {
  try {
    const [leads, posts, totals, campaignTotals, totalLeadCount, totalPostCount] = await Promise.all([
      BusinessLead.find().sort({ createdAt: -1 }).limit(100).lean(),
      PromoPost.find().sort({ day: -1, createdAt: -1 }).limit(50).lean(),
      BusinessLead.aggregate([{
        $group: {
          _id: '$currency',
          count: { $sum: 1 },
          quoted: { $sum: '$quotedMinor' },
          recorded: { $sum: '$collectedMinor' }
        }
      }]),
      PromoPost.aggregate([
        { $match: { status: 'published' } },
        { $group: {
          _id: '$product', posts: { $sum: 1 }, views: { $sum: '$views' },
          followers: { $sum: '$followers' }, enquiries: { $sum: '$enquiries' },
          sales: { $sum: '$sales' }
        } },
        { $sort: { views: -1 } }
      ]),
      BusinessLead.countDocuments(),
      PromoPost.countDocuments()
    ]);
    res.render('admin/operations', {
      csrfToken: tokenFor(req), leads, posts, totals, campaignTotals, totalLeadCount, totalPostCount,
      STAGES, MARKETS, CURRENCIES, PLATFORMS, PRODUCTS, POST_STATUSES, formatAmount,
      today: new Date().toISOString().slice(0, 10)
    });
  } catch (error) {
    console.error('Operations dashboard failed:', error.message);
    res.status(503).send('Business dashboard is temporarily unavailable. Please try again.');
  }
});

router.use(verifyOperationsCsrf);

function respondError(res, error) {
  if (error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError ||
      /Required field|Unsupported field|valid|Amount|Metric|Use a source|Metrics|too large|non-negative/i.test(error.message)) {
    return res.status(400).send('Cannot save: ' + String(error.message).slice(0, 180));
  }
  console.error('Operations write failed:', error.message);
  return res.status(503).send('Unable to save this record right now. Please try again.');
}

router.post('/leads', async (req, res) => {
  try {
    await BusinessLead.create(leadFromBody(req.body, 'create'));
    return res.redirect(303, '/admin/operations#leads');
  } catch (error) { return respondError(res, error); }
});

router.post('/leads/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid lead ID.');
  try {
    const changes = leadFromBody(req.body, 'update');
    const row = await BusinessLead.findById(req.params.id);
    if (!row) return res.status(404).send('Lead not found.');
    // Currency changes must not silently relabel a previous amount as a different currency.
    if (row.currency !== changes.currency && (row.quotedMinor || row.collectedMinor)) {
      return res.status(400).send('Currency cannot change for a lead with recorded amounts.');
    }
    row.set(changes);
    await row.save();
    return res.redirect(303, '/admin/operations#leads');
  } catch (error) { return respondError(res, error); }
});

router.post('/posts', async (req, res) => {
  try {
    await PromoPost.create(postFromBody(req.body, 'create'));
    return res.redirect(303, '/admin/operations#posts');
  } catch (error) { return respondError(res, error); }
});

router.post('/posts/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid post ID.');
  try {
    const changes = postFromBody(req.body, 'update');
    const result = await PromoPost.findByIdAndUpdate(req.params.id, { $set: changes },
      { runValidators: true, new: true });
    if (!result) return res.status(404).send('Promotion not found.');
    return res.redirect(303, '/admin/operations#posts');
  } catch (error) { return respondError(res, error); }
});

module.exports = router;
