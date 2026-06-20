const express = require('express');
const slugify = require('slugify');
const Blog = require('../models/Blog');
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
  while (await Blog.findOne({ slug: candidate, _id: { $ne: ignoreId } })) {
    candidate = `${slug}-${++i}`;
  }
  return candidate;
}

// Public: list posts (defaults to published only; admin can pass ?all=1)
router.get('/', async (req, res) => {
  const filter = req.query.all ? {} : { published: true };
  const posts = await Blog.find(filter).sort({ publishedAt: -1, createdAt: -1 });
  res.json(posts);
});

// Admin: create post
router.post('/', requireAdminApi, async (req, res) => {
  try {
    const body = req.body;
    const slugBase = body.slug || body.title;
    const slug = await uniqueSlug(slugBase);
    const published = body.published === 'on' || body.published === true;

    const post = await Blog.create({
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      tags: parseListField(body.tags),
      published,
      publishedAt: published ? new Date() : null,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: parseListField(body.seoKeywords),
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: update post
router.put('/:id', requireAdminApi, async (req, res) => {
  try {
    const body = req.body;
    const existing = await Blog.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let slug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      slug = await uniqueSlug(body.slug, existing._id);
    }

    const published = body.published === 'on' || body.published === true;

    existing.set({
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      tags: parseListField(body.tags),
      published,
      publishedAt: published ? existing.publishedAt || new Date() : existing.publishedAt,
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

// Admin: delete post
router.delete('/:id', requireAdminApi, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
