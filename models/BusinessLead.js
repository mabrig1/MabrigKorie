const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  business: { type: String, required: true, trim: true, maxlength: 100 },
  contact: { type: String, trim: true, maxlength: 120, default: '' },
  market: { type: String, required: true, enum: ['Nsukka / Enugu', 'Elsewhere in Nigeria', 'International'] },
  service: { type: String, required: true, trim: true, maxlength: 80 },
  source: { type: String, trim: true, maxlength: 100, default: 'manual' },
  summary: { type: String, trim: true, maxlength: 600, default: '' },
  stage: { type: String, enum: ['new', 'contacted', 'quoted', 'won', 'in-progress', 'completed', 'lost'], default: 'new' },
  currency: { type: String, enum: ['NGN', 'USD', 'GBP', 'EUR'], default: 'NGN' },
  quotedMinor: { type: Number, min: 0, max: 1e13, default: 0 },
  collectedMinor: { type: Number, min: 0, max: 1e13, default: 0 },
  paymentNote: { type: String, trim: true, maxlength: 250, default: '' },
}, { timestamps: true, strict: 'throw' });

leadSchema.index({ createdAt: -1 });
leadSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.models.BusinessLead || mongoose.model('BusinessLead', leadSchema);
