const express = require('express');
const slugify = require('slugify');
const Work = require('../models/Work');
const { requireAdminApi } = require('../middleware/auth');

const router = express.Router();

function parseListField(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

async function uniqueSlug(base, ignoreId) {
  let slug = slugify(base, { lower: true, strict: true });
  let candidate = slug;
  let i = 1;
  while (await Work.findOne({ slug: candidate, _id: { $ne: ignoreId } })) {
    candidate = `${slug}-${++i}`;
  }
  return candidate;
}

// Public: list works (optionally filtered by category)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const works = await Work.find(filter).sort({ order: 1, createdAt: -1 });
  res.json(works);
});

// Admin: create work
router.post('/', requireAdminApi, async (req, res) => {
  try {
    const body = req.body;
    const slugBase = body.slug || body.title;
    const slug = await uniqueSlug(slugBase);

    const work = await Work.create({
      category: body.category,
      title: body.title,
      description: body.description,
      url: body.url,
      platform: body.platform,
      tags: parseListField(body.tags),
      image: body.image,
      content: body.content,
      featured: body.featured === 'on' || body.featured === true,
      order: Number(body.order) || 0,
      slug,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: parseListField(body.seoKeywords),
    });
    res.status(201).json(work);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: update work
router.put('/:id', requireAdminApi, async (req, res) => {
  try {
    const body = req.body;
    const existing = await Work.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let slug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      slug = await uniqueSlug(body.slug, existing._id);
    }

    existing.set({
      category: body.category,
      title: body.title,
      description: body.description,
      url: body.url,
      platform: body.platform,
      tags: parseListField(body.tags),
      image: body.image,
      content: body.content,
      featured: body.featured === 'on' || body.featured === true,
      order: Number(body.order) || 0,
      slug,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: parseListField(body.seoKeywords),
    });
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: delete work
router.delete('/:id', requireAdminApi, async (req, res) => {
  await Work.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
