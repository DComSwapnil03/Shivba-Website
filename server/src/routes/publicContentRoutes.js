const express = require('express');
const router = express.Router();
const { Event, Gallery, Testimonial, Faq } = require('../models');

// Events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
  res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// Gallery
router.get('/gallery', async (req, res) => {
  try {
    const items = await Gallery.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching gallery:', error.message);
    res.status(500).json({ message: 'Server error while fetching gallery' });
  }
});

// Testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const items = await Testimonial.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching testimonials:', error.message);
    res.status(500).json({ message: 'Server error while fetching testimonials' });
  }
});

// FAQs
router.get('/faqs', async (req, res) => {
  try {
    const items = await Faq.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching FAQs:', error.message);
    res.status(500).json({ message: 'Server error while fetching FAQs' });
  }
});

module.exports = router;
