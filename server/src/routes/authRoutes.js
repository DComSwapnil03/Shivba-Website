const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const InterestRegistration = require('../models/InterestRegistration'); 

// --- TWILIO SETUP ---
require('dotenv').config();
const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
    ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const router = express.Router();
console.log("✅ Auth Routes Loaded (Optimized)");

// ==========================================
// 1. EMAIL CONFIGURATION
// ==========================================
const mailer = nodemailer.createTransport({
  pool: true,        // Critical for speed: keeps connection open
  maxConnections: 5, // Process multiple emails at once
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS 
  },
  tls: { rejectUnauthorized: false },
  debug: false
});

// Helper: Send Email
const sendVerificationEmail = async ({ to, name, token, otp }) => {
  const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(to)}`;

  // We await this because if email fails, user needs to know immediately
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
};

// ==========================================
// 2. ROUTE: REGISTER (Optimized)
// ==========================================
router.post('/register-interest-simple', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // PERFORMANCE: Run Password Hashing and DB Check in Parallel
    // This saves time by overlapping CPU work (bcrypt) with I/O work (Mongo)
    const [existingUser, hashedPassword] = await Promise.all([
        InterestRegistration.findOne({ email: lowerEmail }).lean(), // .lean() for speed
        bcrypt.hash(password, 10)
    ]);

    // Check if user exists & verified
    if (existingUser && existingUser.isVerified) {
        return res.status(409).json({ message: 'User already exists. Please login instead.' });
    }

    // Rate Limiting Logic
    if (existingUser && existingUser.lastOtpSentAt) {
        const timeSinceLastOtp = Date.now() - new Date(existingUser.lastOtpSentAt).getTime();
        const cooldownMs = 60 * 1000; 
        if (timeSinceLastOtp < cooldownMs) {
            const secondsLeft = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
            return res.status(429).json({ message: `Please wait ${secondsLeft}s before retrying.` });
        }
    }

    // Generate Tokens
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    // DB Write
    await InterestRegistration.findOneAndUpdate(
      { email: lowerEmail },
      {
        name: name.trim(),
        email: lowerEmail,
        phone: phone.trim(),
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

    // Email Send
    try {
        await sendVerificationEmail({ to: lowerEmail, name: name.trim(), token, otp });
    } catch (emailError) {
        console.error("Email send failed:", emailError);
        return res.status(500).json({ message: 'Failed to send email. Check address.' });
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

    // Verify and Update
    const user = await InterestRegistration.findOneAndUpdate(
      {
        email: lowerEmail,
        $or: [{ otp: otp }, { verifyToken: token }],
        verifyTokenExpiresAt: { $gt: new Date() }
      },
      {
        $set: { 
            isVerified: true,
            otp: undefined,
            verifyToken: undefined,
            verifyTokenExpiresAt: undefined,
        }
      },
      { new: true } // Need the updated doc to return name/email
    ).lean(); // .lean() makes the result a plain JS object (faster)

    if (!user) {
      // Check for expired code only if verification failed
      const expiredUser = await InterestRegistration.findOne({ email: lowerEmail }).lean();
      if (expiredUser && (expiredUser.otp === otp || expiredUser.verifyToken === token)) {
             return res.status(400).json({ message: 'Code expired. Request a new one.' });
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
    return res.status(500).json({ message: 'Server error.' });
  }
});

// ==========================================
// 4. ROUTE: WELCOME MESSAGE (Fire-and-Forget)
// ==========================================
router.post('/send-welcome-message', (req, res) => {
    // Note: removed 'async' because we don't want to await the promise
    const { phone, name } = req.body;

    if (!phone) return res.status(400).json({ message: "Phone number missing" });
    if (!client) return res.status(500).json({ message: "Twilio not configured" });

    // 🚀 PERFORMANCE: Send Response IMMEDIATELY
    // We do not wait for Twilio. The user is verified, they don't need to wait for the SMS API.
    res.status(200).json({ success: true, message: "Message queued" });

    // --- Background Process ---
    (async () => {
        try {
            let targetPhone = phone.trim();
            const isWhatsApp = process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER.includes('whatsapp');
            
            if (isWhatsApp && !targetPhone.startsWith('whatsapp:')) {
                targetPhone = 'whatsapp:' + targetPhone;
            }

            console.log(`[Background] Sending Welcome to ${targetPhone}...`);
            await client.messages.create({
                body: `Hello ${name}! 🎉\n\nWelcome to Shivba-Website. Your verification is complete!`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: targetPhone
            });
            console.log(`[Background] Welcome message sent.`);
        } catch (error) {
            console.error("❌ [Background] Twilio Failed:", error.message);
            // No res.status here because response is already sent
        }
    })();
});

// ==========================================
// 5. LOGIN & PROFILE (Lean Queries)
// ==========================================
router.post('/account/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = (email || '').toLowerCase().trim();
        if (!lowerEmail || !password) return res.status(400).json({ message: 'Required fields missing.' });

        // .lean() makes this ~3x faster by skipping Mongoose hydration
        const user = await InterestRegistration.findOne({ email: lowerEmail, isVerified: true })
            .select('+password')
            .lean();

        if (!user) return res.status(404).json({ message: 'Account not found or not verified.' });

        // Bcrypt compare is strictly CPU bound
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Manual cleanup since .lean() returns plain object
        delete user.password; delete user.otp; delete user.verifyToken;
        return res.json(user);

    } catch (err) { return res.status(500).json({ message: 'Server error.' }); }
});

router.get('/members/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email required.' });
        
        // .lean() for read-only speed
        const user = await InterestRegistration.findOne({ email: email.toLowerCase().trim() }).lean();
        
        if (user) { 
            delete user.password; delete user.otp; delete user.verifyToken; 
            return res.json(user); 
        }
        return res.status(404).json({ message: 'User not found.' });
    } catch (err) { return res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;