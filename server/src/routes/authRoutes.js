const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs'); 
const path = require('path');

const router = express.Router();

console.log("✅ Auth Routes Loaded");

// --- MODEL IMPORTS ---
const InterestRegistration = require('../models/InterestRegistration');

if (!InterestRegistration) {
  console.error('❌ Could not load InterestRegistration model.');
  process.exit(1);
}

// ==========================================
// 1. EMAIL CONFIGURATION
// ==========================================
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: { rejectUnauthorized: process.env.NODE_ENV !== 'development' }
});

// Helper: Send Verification/OTP Email
async function sendVerificationEmail({ to, name, token, otp }) {
  console.log(`[Email] Sending OTP ${otp} to: ${to}`);
  const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify?token=${token}&email=${encodeURIComponent(to)}`;

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject: 'Your Verification Code - Shivba',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Hello, ${name}</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f3f4f6; padding: 10px; display: inline-block; letter-spacing: 5px; border-radius: 8px;">${otp}</h1>
          <p>Or verify by clicking this link:</p>
          <a href="${verifyUrl}" style="color: #4f46e5; font-weight: bold;">Verify Email</a>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error);
    return false;
  }
}

// ==========================================
// 2. REGISTER / SEND OTP ROUTE (OPTIMIZED)
// ==========================================
router.post('/register-interest-simple', async (req, res) => {
  console.log('📝 Register/OTP request received');
  
  try {
    const { name, email, phone, password } = req.body; 
    
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const existingUser = await InterestRegistration.findOne({ email: lowerEmail });

    // 2. If Verified: Stop them (They should login)
    if (existingUser && existingUser.isVerified) {
        return res.status(409).json({ message: 'User already exists. Please login instead.' });
    }

    // 3. RATE LIMITING (The "Hold"): Check if OTP was sent recently
    if (existingUser && existingUser.lastOtpSentAt) {
        const timeSinceLastOtp = Date.now() - new Date(existingUser.lastOtpSentAt).getTime();
        const cooldownMs = 60 * 1000; // 1 Minute Cooldown

        if (timeSinceLastOtp < cooldownMs) {
            const secondsLeft = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
            return res.status(429).json({ 
                message: `Please wait ${secondsLeft} seconds before requesting a new code.` 
            });
        }
    }

    // 4. Generate Data
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 Minutes strict expiry

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. UPSERT (Update if exists, Insert if new)
    await InterestRegistration.findOneAndUpdate(
      { email: lowerEmail },
      {
        name: name.trim(),
        email: lowerEmail,
        phone: phone.trim(),
        password: hashedPassword, 
        eventName: 'General Interest',
        isVerified: false, 
        otp: otp,           
        verifyToken: token, 
        verifyTokenExpiresAt: expiresAt,
        lastOtpSentAt: now, 
        $setOnInsert: { payments: [], programs: [] }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`💾 Saved New OTP for ${lowerEmail}`);

    // 6. Send Email in BACKGROUND (Fire-and-Forget)
    // CRITICAL FIX: No 'await' here.
    sendVerificationEmail({ to: lowerEmail, name: name.trim(), token, otp })
      .catch(err => console.error("⚠️ Background Email Failed:", err));

    // 7. Reply Immediately
    return res.status(201).json({
      success: true,
      message: 'Verification code sent! Check your inbox.',
      email: lowerEmail,
      nextStep: 'verify'
    });

  } catch (error) {
    console.error('❌ Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ==========================================
// 3. VERIFICATION ROUTE (STRICT 10 MIN CHECK)
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, token } = req.body;
    
    if (!email || (!otp && !token)) {
      return res.status(400).json({ message: 'Email and Code are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Find and Verify atomically
    const user = await InterestRegistration.findOneAndUpdate(
      {
        email: lowerEmail,
        $or: [{ otp: otp }, { verifyToken: token }],
        verifyTokenExpiresAt: { $gt: new Date() } // Strict Expiry Check
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
          return res.status(400).json({ message: 'Code has expired. Please register again to get a new code.' });
      }
      return res.status(400).json({ message: 'Invalid code.' });
    }

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

// ==========================================
// 4. LOGIN ROUTE
// ==========================================
router.post('/account/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = (email || '').toLowerCase().trim();

        if (!lowerEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await InterestRegistration.findOne({ 
            email: lowerEmail, 
            isVerified: true 
        }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Account not found or not verified.' });
        }

        if (!user.password) {
            return res.status(400).json({ 
                message: 'Account exists but has no password set. Please use "Paid but no password?" option.' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const userObj = user.toObject();
        delete userObj.password;        
        delete userObj.otp;             
        delete userObj.verifyToken;
        delete userObj.verifyTokenExpiresAt;
        userObj.programs = userObj.programs || [];
        userObj.payments = userObj.payments || [];

        return res.json(userObj);

    } catch (err) {
        console.error("❌ Login Error:", err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

router.get('/members/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email required.' });
        
        const lowerEmail = email.toLowerCase().trim();
        const user = await InterestRegistration.findOne({ email: lowerEmail }).lean();

        if (user) {
            delete user.password;
            delete user.otp;
            delete user.verifyToken;
            user.programs = user.programs || [];
            user.payments = user.payments || [];
            return res.json(user);
        }
        return res.status(404).json({ message: 'User not found.' });

    } catch (err) {
        return res.status(500).json({ message: 'Server error fetching profile.' });
    }
});

router.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const lowerEmail = email.toLowerCase().trim();
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); 

        const user = await InterestRegistration.findOneAndUpdate(
            { email: lowerEmail },
            { $set: { verifyToken: resetToken, verifyTokenExpiresAt: expiresAt } },
            { new: true }
        );

        if (user) {
            const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
            const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(lowerEmail)}`;
            
            // Fire-and-forget for password reset email as well
            mailer.sendMail({
                from: process.env.MAIL_FROM || process.env.MAIL_USER,
                to: lowerEmail,
                subject: 'Password Reset Request - Shivba',
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Password Reset</h2>
                        <a href="${resetLink}">Reset Password</a>
                    </div>
                `
            }).catch(err => console.error("Forgot Password Email Failed:", err));
        }
        return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    } catch (err) {
        return res.status(500).json({ message: 'Error processing request' });
    }
});

router.post('/auth/reset-password', async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;
        if (!token || !email || !newPassword) return res.status(400).json({ message: "Missing fields." });

        const lowerEmail = email.toLowerCase().trim();
        const user = await InterestRegistration.findOne({
            email: lowerEmail,
            verifyToken: token,
            verifyTokenExpiresAt: { $gt: new Date() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired reset token." });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await InterestRegistration.findOneAndUpdate(
            { email: lowerEmail },
            { 
                $set: {
                    password: hashedPassword,
                    isVerified: true,
                    verifyToken: undefined,
                    verifyTokenExpiresAt: undefined
                }
            }
        );
        return res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        return res.status(500).json({ message: "Server error resetting password." });
    }
});

router.post('/account/find', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required.' });
        
        const user = await InterestRegistration.findOne({ email: email.toLowerCase().trim(), isVerified: true }).lean();
        if (!user) return res.status(403).json({ message: 'Session invalid or expired.' });

        return res.json({
            name: user.name,
            email: user.email,
            phone: user.phone || user.mobileNumber,
            programs: user.programs || [],
            payments: user.payments || []
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;