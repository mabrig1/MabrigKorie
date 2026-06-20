const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true }, // e.g. Facebook, LinkedIn, TikTok, YouTube, Spotify
    url: { type: String, required: true, trim: true },
    icon: { type: String, trim: true }, // emoji or short label shown in UI
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialLink', socialLinkSchema);
