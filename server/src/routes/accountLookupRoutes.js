const express = require('express');
const Member = require('../models/Member'); // adjust path

const router = express.Router();

// POST /api/account/find
router.post('/account/find', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const lower = email.toLowerCase().trim();

    let member = await Member.findOne({ email: lower });

    if (!member) {
      member = new Member({
        name: 'Guest Member',
        email: lower,
        phone: '',
        joiningDate: new Date(),
        services: []
      });
      await member.save();
    }

    return res.status(200).json({
      name: member.name,
      email: member.email,
      phone: member.phone,
      joiningDate: member.joiningDate,
      services: member.services || []
    });
  } catch (err) {
    console.error('Account lookup error:', err);
    return res
      .status(500)
      .json({ message: 'Server error while looking up account.' });
  }
});

module.exports = router;
