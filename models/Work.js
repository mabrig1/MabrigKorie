const mongoose = require('mongoose');

const workSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['app', 'research', 'book', 'music', 'service'],
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    url: { type: String, trim: true },
    platform: { type: String, trim: true }, // e.g. Spotify, Goodreads, Gumroad
    tags: [{ type: String, trim: true }],
    image: { type: String, trim: true },
    content: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // SEO fields
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

workSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Work', workSchema);
