const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');

// --- SAFE REQUIRE SETUP ---
// This attempts to load the model from the correct path
const safeRequire = (relativePath) => {
    try {
        // Adjusts path relative to this file
        const fullPath = path.join(__dirname, '../../', relativePath); 
        return require(relativePath.startsWith('.') ? fullPath : relativePath); 
    } catch (err) {
        // Fallback: assume standard structure
        return require('../models/InterestRegistration'); 
    }
};

// Import the model
const InterestRegistration = require('../models/InterestRegistration'); 

const router = express.Router();

// --- 1. EMAIL CONFIGURATION ---
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV !== 'development'
  }
});

// Helper to send email
async function sendVerificationEmail({ to, name, token, otp }) {
  console.log(`[Email] Sending OTP ${otp} to: ${to}`);
  const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(to)}`;

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hello, ${name}</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
          <p>Or verify by clicking this link:</p>
          <a href="${verifyUrl}" style="color: #4f46e5;">Verify Email</a>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error);
    // We don't throw error here to avoid crashing the response if email fails, 
    // but in production you might want to handle this differently.
    return false;
  }
}

// --- 2. REGISTRATION ROUTE ---
router.post('/register-interest-simple', async (req, res) => {
  console.log('📝 Register request received');
  
  try {
    const { name, email, phone } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, Email, and Phone are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 1. Generate Codes
    const otp = crypto.randomInt(100000, 999999).toString(); // 6 digits
    const token = crypto.randomBytes(32).toString('hex');   // Long secure string
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

    // 2. Save/Update User in DB
    // We use findOneAndUpdate to handle both new users and existing users re-requesting OTP
    const user = await InterestRegistration.findOneAndUpdate(
      { email: lowerEmail },
      {
        name: name.trim(),
        email: lowerEmail,
        phone: phone.trim(),
        eventName: 'General Interest',
        isVerified: false, // Reset verification on new attempt
        
        // SAVE BOTH FIELDS:
        otp: otp,           
        verifyToken: token, 
        verifyTokenExpiresAt: expiresAt
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`💾 Saved OTP for ${lowerEmail}: ${otp}`);

    // 3. Send Email
    await sendVerificationEmail({ to: lowerEmail, name: name.trim(), token, otp });

    return res.status(201).json({
      success: true,
      message: 'Verification code sent to your email!',
      email: lowerEmail,
      nextStep: 'verify'
    });

  } catch (error) {
    console.error('❌ Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// --- 3. VERIFICATION ROUTE ---
router.post('/verify-otp', async (req, res) => {
  console.log('🔍 Verify request received:', req.body);
  
  try {
    // User might send 'otp' (typed) OR 'token' (clicked link)
    const { email, otp, token } = req.body;
    
    if (!email || (!otp && !token)) {
      return res.status(400).json({ message: 'Email and Code are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Find user where:
    // 1. Email matches
    // 2. Code matches EITHER 'otp' OR 'verifyToken'
    // 3. Not expired
    const user = await InterestRegistration.findOne({
      email: lowerEmail,
      $or: [
        { otp: otp },          // Match 6-digit code
        { verifyToken: token } // Match link token
      ],
      verifyTokenExpiresAt: { $gt: new Date() } // Must be in the future
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification code.' 
      });
    }

    // Success: Mark verified
    user.isVerified = true;
    
    // Clear codes so they can't be reused
    user.otp = undefined;
    user.verifyToken = undefined;
    user.verifyTokenExpiresAt = undefined;
    
    await user.save();

    console.log(`✅ User verified: ${lowerEmail}`);

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('❌ Verify Error:', error);
    return res.status(500).json({ message: 'Server error during verification.' });
  }
});

module.exports = router;