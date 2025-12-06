const express = require('express');
const router = express.Router();
const { InterestRegistration } = require('../models');

router.post('/register-interest', async (req, res) => {
  try {
    const { name, email, phone, eventName, amount } = req.body;

    if (!name || !email || !phone || !eventName) {
      return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    const newInterest = new InterestRegistration({
      name,
      email,
      phone,
      eventName,
      amount: amount || 0,
    });
    await newInterest.save();

    console.log(`Saved new interest registration for ${email}`);
    res.status(201).json({ message: 'Registration received successfully!' });
  } catch (error) {
    console.error('Error saving interest registration:', error.message);
    res.status(500).json({ message: 'Server error while saving registration' });
  }
});

module.exports = router;
