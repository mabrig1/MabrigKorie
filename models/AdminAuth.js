const mongoose = require('mongoose');

// Singleton record: the admin's current password and one-time recovery state.
const adminAuthSchema = new mongoose.Schema({
  _id: { type: String, default: 'primary' },
  passwordHash: { type: String, default: null },
  passwordChangedAt: { type: Date, default: null },
  resetTokenHash: { type: String, default: null },
  resetTokenExpiresAt: { type: Date, default: null },
  resetRequestedAt: { type: Date, default: null },
}, { versionKey: false });

module.exports = mongoose.models.AdminAuth || mongoose.model('AdminAuth', adminAuthSchema);
