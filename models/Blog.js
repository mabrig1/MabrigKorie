const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true }, // raw HTML body
    coverImage: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },

    // SEO fields
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

blogSchema.index({ published: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
