const express = require('express');
const Appointment = require('../models/Appointment');
const { requireAdminApi } = require('../middleware/auth');

const router = express.Router();

// Public: submit a booking request
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, preferredDate, preferredTime, message } = req.body;
    const appointment = await Appointment.create({
      name,
      email,
      phone,
      service,
      preferredDate,
      preferredTime,
      message,
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: list all booking requests
router.get('/', requireAdminApi, async (req, res) => {
  const appointments = await Appointment.find().sort({ createdAt: -1 });
  res.json(appointments);
});

// Admin: update a booking's status
router.put('/:id', requireAdminApi, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: delete a booking request
router.delete('/:id', requireAdminApi, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
