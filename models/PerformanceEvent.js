const mongoose = require('mongoose');

const performanceEventSchema = new mongoose.Schema({
  appId: { type: String, required: true, maxlength: 80 },
  sessionId: { type: String, required: true, maxlength: 64 },
  pathname: { type: String, maxlength: 160, default: '/' },
  recordedAt: { type: Date, required: true, default: Date.now },
}, { versionKey: false, strict: true });

performanceEventSchema.index({ appId: 1, recordedAt: -1 });
performanceEventSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('PerformanceEvent', performanceEventSchema);
