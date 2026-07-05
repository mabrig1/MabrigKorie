const mongoose = require('mongoose');

const SERVICES = [
  'Full-Stack Web App Development',
  'Research Assistant',
  'Grant Writing',
  'Article Publishing',
  'Book Publishing',
  'Music Production',
  'Content Writing Assistance',
  'Other',
];

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    service: { type: String, required: true, enum: SERVICES },
    preferredDate: { type: Date, required: true },
    preferredTime: { type: String, trim: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
module.exports.SERVICES = SERVICES;
