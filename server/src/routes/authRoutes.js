const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const InterestRegistration = require('../models/InterestRegistration'); 

// --- TWILIO SETUP ---
require('dotenv').config();
// Initialize Twilio client only if credentials exist to prevent crash
const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
    ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const router = express.Router();

console.log("✅ Auth Routes Loaded");

// ==========================================
// 1. EMAIL CONFIGURATION (SSL BYPASS FIX)
// ==========================================
const mailer = nodemailer.createTransport({
  pool: true,        // Keeps connection open for speed
  host: 'smtp.gmail.com',
  port: 465,         // Secure Gmail Port
  secure: true,      // Use SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS // Must be App Password
  },
  // 👇 CRITICAL FIX FOR "Self-Signed Certificate" ERROR 👇
  tls: {
    rejectUnauthorized: false
  },
  debug: false        // Set to true only if debugging email issues
});

// Verify connection on startup
mailer.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP Server is connected and ready.");
  }
});

// Helper: Send Email
const sendVerificationEmail = async ({ to, name, token, otp }) => {
  const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(to)}`;

  console.log(`[Email Service] Sending OTP to ${to}...`);

  try {
    await mailer.sendMail({
      from: `"Shivba Admin" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Your Verification Code - Shivba',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; max-width: 500px;">
          <h2 style="color: #4f46e5;">Hello, ${name}</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
          </div>
          <p align="center">
             <a href="${verifyUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Account</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Code expires in 10 minutes.</p>
        </div>
      `
    });
    console.log(`[Email Service] ✅ Email Sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email Failed:', error);
    throw error; // Throw to notify the route
  }
};

// ==========================================
// 2. ROUTE: REGISTER / SEND OTP
// ==========================================
router.post('/register-interest-simple', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check if user exists & verified
    const existingUser = await InterestRegistration.findOne({ email: lowerEmail });
    if (existingUser && existingUser.isVerified) {
        return res.status(409).json({ message: 'User already exists. Please login instead.' });
    }

    // Rate Limiting (1 Minute)
    if (existingUser && existingUser.lastOtpSentAt) {
        const timeSinceLastOtp = Date.now() - new Date(existingUser.lastOtpSentAt).getTime();
        const cooldownMs = 60 * 1000; 

        if (timeSinceLastOtp < cooldownMs) {
            const secondsLeft = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
            return res.status(429).json({ 
                message: `Please wait ${secondsLeft} seconds before requesting a new code.` 
            });
        }
    }

    // Generate Data
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 Minutes strict

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to DB
    await InterestRegistration.findOneAndUpdate(
      { email: lowerEmail },
      {
        name: name.trim(),
        email: lowerEmail,
        phone: phone.trim(), // We save raw phone here
        password: hashedPassword,
        isVerified: false,
        otp: otp,
        verifyToken: token,
        verifyTokenExpiresAt: expiresAt, 
        lastOtpSentAt: now,
        $setOnInsert: { payments: [], programs: [] }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send Email
    try {
        await sendVerificationEmail({ to: lowerEmail, name: name.trim(), token, otp });
    } catch (emailError) {
        return res.status(500).json({ 
            message: 'Failed to send email. Check if your email is correct.' 
        });
    }

    return res.status(201).json({
      success: true,
      message: 'Verification code sent!',
      email: lowerEmail,
      nextStep: 'verify'
    });

  } catch (error) {
    console.error('❌ Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ==========================================
// 3. ROUTE: VERIFY OTP
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, token } = req.body;
    
    if (!email || (!otp && !token)) {
      return res.status(400).json({ message: 'Email and Code are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check code AND Expiry
    const user = await InterestRegistration.findOneAndUpdate(
      {
        email: lowerEmail,
        $or: [{ otp: otp }, { verifyToken: token }],
        verifyTokenExpiresAt: { $gt: new Date() } // 10 Min Check
      },
      {
        $set: { 
            isVerified: true,
            otp: undefined,
            verifyToken: undefined,
            verifyTokenExpiresAt: undefined,
        }
      },
      { new: true }
    );

    if (!user) {
      const expiredUser = await InterestRegistration.findOne({ email: lowerEmail });
      if (expiredUser && (expiredUser.otp === otp || expiredUser.verifyToken === token)) {
             return res.status(400).json({ message: 'Code has expired (10 min limit). Please request a new one.' });
      }
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    return res.json({
      success: true,
      message: 'Email verified successfully!',
      user: { name: user.name, email: user.email, isVerified: true }
    });

  } catch (error) {
    console.error('❌ Verify Error:', error);
    return res.status(500).json({ message: 'Server error during verification.' });
  }
});

// ==========================================
// 4. ROUTE: SEND WELCOME MESSAGE (TWILIO)
// ==========================================
router.post('/send-welcome-message', async (req, res) => {
    const { phone, name } = req.body;

    // --- DEBUG LOGGING ---
    console.log("------------------------------------------");
    console.log("⚠️ [Backend Debug] Welcome Message Triggered");
    console.log(`📦 Payload: Phone=${phone}, Name=${name}`);
    
    // Safety check: if no phone provided, skip without crashing
    if (!phone) {
        console.error("❌ Error: Phone number is MISSING in request body.");
        return res.status(400).json({ message: "Phone number missing" });
    }
    
    // Check if Twilio is configured
    if (!client) {
        console.error("❌ Error: Twilio client not initialized. Check .env variables.");
        return res.status(500).json({ message: "Twilio configuration error" });
    }

    // --- SANDBOX FORMATTING LOGIC ---
    // If testing in Sandbox, we MUST prefix 'whatsapp:'. 
    // Even if using SMS, Twilio prefers E.164 (e.g., +91...)
    
    let targetPhone = phone.trim();
    
    // If your .env TWILIO_PHONE_NUMBER has 'whatsapp:', we assume we are sending WhatsApp.
    const isWhatsApp = process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER.includes('whatsapp');

    // Only add 'whatsapp:' prefix if it's missing AND we are in WhatsApp mode
    if (isWhatsApp && !targetPhone.startsWith('whatsapp:')) {
        targetPhone = 'whatsapp:' + targetPhone;
    }

    try {
        console.log(`[Twilio] Sending Welcome Message to ${targetPhone}...`);
        
        const message = await client.messages.create({
            body: `Hello ${name}! 🎉\n\nWelcome to Shivba-Website. Your verification is complete!`,
            from: process.env.TWILIO_PHONE_NUMBER, // Checks .env
            to: targetPhone
        });

        console.log(`[Twilio] Success! SID: ${message.sid}`);
        console.log("------------------------------------------");
        return res.status(200).json({ success: true, sid: message.sid });

    } catch (error) {
        console.error("❌ Twilio Error:", error.message);
        console.log("------------------------------------------");
        // We return 200 to Frontend so the UI doesn't show an error to the user
        // (The user is already verified, so a failed SMS shouldn't scare them)
        return res.status(200).json({ success: false, error: error.message });
    }
});

// ==========================================
// 5. LOGIN & PROFILE
// ==========================================
router.post('/account/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = (email || '').toLowerCase().trim();
        if (!lowerEmail || !password) return res.status(400).json({ message: 'Email and password required.' });

        const user = await InterestRegistration.findOne({ email: lowerEmail, isVerified: true }).select('+password');

        if (!user) return res.status(404).json({ message: 'Account not found or not verified.' });
        if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials.' });

        const u = user.toObject(); delete u.password; delete u.otp; delete u.verifyToken;
        return res.json(u);
    } catch (err) { return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/members/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email required.' });
        const user = await InterestRegistration.findOne({ email: email.toLowerCase().trim() }).lean();
        if (user) { delete user.password; delete user.otp; return res.json(user); }
        return res.status(404).json({ message: 'User not found.' });
    } catch (err) { return res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;