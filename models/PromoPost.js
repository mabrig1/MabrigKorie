const mongoose = require('mongoose');

const promoPostSchema = new mongoose.Schema({
  day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  platform: { type: String, required: true, enum: ['Facebook', 'TikTok', 'YouTube', 'Instagram', 'LinkedIn'] },
  product: { type: String, required: true, enum: ['MABRIG Technologies', 'DDEI Online', 'DevShield AI'] },
  source: { type: String, required: true, trim: true, match: /^[a-z0-9_-]{3,64}$/ },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  caption: { type: String, required: true, trim: true, maxlength: 2400 },
  status: { type: String, enum: ['draft', 'ready', 'published'], default: 'draft' },
  views: { type: Number, min: 0, max: 1e9, default: 0 },
  followers: { type: Number, min: 0, max: 1e9, default: 0 },
  enquiries: { type: Number, min: 0, max: 1e9, default: 0 },
  sales: { type: Number, min: 0, max: 1e9, default: 0 },
}, { timestamps: true, strict: 'throw' });

promoPostSchema.index({ day: -1, createdAt: -1 });
module.exports = mongoose.models.PromoPost || mongoose.model('PromoPost', promoPostSchema);
