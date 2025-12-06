const express = require('express');
const InterestRegistration = require('../models/InterestRegistration');

const router = express.Router();

// POST /api/account/verify-email
// Handles both Link Click (token) and Manual OTP Entry (otp)
router.post('/account/verify-email', async (req, res) => {
  try {
    const { email, token, otp } = req.body;

    // 1. Validation: Require Email AND (Token OR OTP)
    if (!email || (!token && !otp)) {
      return res
        .status(400)
        .json({ message: 'Email and either a Verification Token or OTP are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 2. Find the user based on Email + (Token OR OTP) + Expiry
    const record = await InterestRegistration.findOne({
      email: lowerEmail,
      $or: [
        { verifyToken: token }, // Match link token
        { otp: otp }            // Match manual code
      ],
      verifyTokenExpiresAt: { $gt: new Date() } // Check if not expired
    });

    if (!record) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired verification code/link.' });
    }

    // 3. Mark as Verified & Clean up security fields
    record.isVerified = true;
    record.verifyToken = undefined;
    record.verifyTokenExpiresAt = undefined;
    record.otp = undefined; // Clear the OTP so it can't be reused
    
    await record.save();

    // 4. Return sanitized user data (excluding password)
    // This allows the frontend to auto-login the user immediately after verification
    const userObj = record.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.verifyToken;
    delete userObj.verifyTokenExpiresAt;

    res.json({
      success: true,
      message: 'Email verified successfully.',
      user: userObj
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    res
      .status(500)
      .json({ message: 'Server error while verifying email.' });
  }
});

module.exports = router;