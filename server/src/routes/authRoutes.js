const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs'); 
const path = require('path');

const router = express.Router();

console.log("✅ Auth Routes Loaded"); // Debugging check

// --- REPLACE safeRequire WITH DIRECT MODEL IMPORTS ---
const InterestRegistration = require('../models/InterestRegistration');
const Member = require('../models/Member'); // optional / legacy

if (!InterestRegistration) {
  console.error('❌ Could not load InterestRegistration model. Ensure file exists at src/models/InterestRegistration.js');
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
  tls: {
    rejectUnauthorized: process.env.NODE_ENV !== 'development'
  }
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
// 2. REGISTRATION ROUTE
// ==========================================
router.post('/register-interest-simple', async (req, res) => {
  console.log('📝 Register request received');
  
  try {
    const { name, email, phone, password } = req.body; 
    
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check if user already exists AND is verified
    const existingUser = await InterestRegistration.findOne({ email: lowerEmail });
    if (existingUser && existingUser.isVerified) {
        return res.status(409).json({ message: 'User already exists. Please login instead.' });
    }

    // Generate OTP & Token
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update or Create User (Using findOneAndUpdate to be safe)
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
        // Initialize arrays only if creating a new document
        $setOnInsert: { payments: [], programs: [] }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`💾 Saved OTP for ${lowerEmail}`);

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

// ==========================================
// 3. VERIFICATION ROUTE (OTP)
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, token } = req.body;
    
    if (!email || (!otp && !token)) {
      return res.status(400).json({ message: 'Email and Code are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    // Find user using atomic update
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
            verifyTokenExpiresAt: undefined
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
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

        // Find User (Explicitly select password)
        const user = await InterestRegistration.findOne({ 
            email: lowerEmail, 
            isVerified: true 
        }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Account not found or not verified.' });
        }

        // Handle Guest Users (Paid but no password set)
        if (!user.password) {
            return res.status(400).json({ 
                message: 'Account exists but has no password set. Please use "Paid but no password?" option.' 
            });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Success: Prepare Response
        const userObj = user.toObject();
        delete userObj.password;        
        delete userObj.otp;             
        delete userObj.verifyToken;
        delete userObj.verifyTokenExpiresAt;
        
        // Ensure arrays exist for frontend safety
        userObj.programs = userObj.programs || [];
        userObj.payments = userObj.payments || [];

        console.log(`✅ Login successful for: ${lowerEmail}`);
        return res.json(userObj);

    } catch (err) {
        console.error("❌ Login Error:", err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

// ==========================================
// 5. PROFILE ROUTE (Dashboard Data)
// ==========================================
router.get('/members/profile', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email required.' });
        
        const lowerEmail = email.toLowerCase().trim();

        // Fetch User Data including Payment History & Programs
        const user = await InterestRegistration.findOne({ email: lowerEmail }).lean();

        if (user) {
            // Remove sensitive data
            delete user.password;
            delete user.otp;
            delete user.verifyToken;
            
            // Normalize arrays for frontend
            user.programs = user.programs || [];
            user.payments = user.payments || [];

            return res.json(user);
        }

        return res.status(404).json({ message: 'User not found.' });

    } catch (err) {
        console.error('Profile fetch error:', err);
        return res.status(500).json({ message: 'Server error fetching profile.' });
    }
});

// ==========================================
// 6. FORGOT PASSWORD (STEP 1: SEND EMAIL)
// ==========================================
router.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const lowerEmail = email.toLowerCase().trim();
        
        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 Minutes

        // Atomic Update
        const user = await InterestRegistration.findOneAndUpdate(
            { email: lowerEmail },
            { 
                $set: { 
                    verifyToken: resetToken, 
                    verifyTokenExpiresAt: expiresAt 
                } 
            },
            { new: true }
        );

        if (user) {
            const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
            const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(lowerEmail)}`;

            console.log(`[Forgot Password] Sending email to ${lowerEmail}`);
            
            await mailer.sendMail({
                from: process.env.MAIL_FROM || process.env.MAIL_USER,
                to: lowerEmail,
                subject: 'Password Reset Request - Shivba',
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Password Reset</h2>
                        <p>You requested a password reset (or are setting it for the first time).</p>
                        <p>Click the link below to set your password:</p>
                        <a href="${resetLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p style="margin-top: 20px;">Link expires in 30 minutes.</p>
                    </div>
                `
            });
        }

        return res.json({ 
            success: true, 
            message: 'If an account exists, a reset link has been sent.' 
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        return res.status(500).json({ message: 'Error processing request' });
    }
});

// ==========================================
// 7. RESET PASSWORD (STEP 2: UPDATE PASSWORD) [CRITICAL MISSING PART]
// ==========================================
router.post('/auth/reset-password', async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const lowerEmail = email.toLowerCase().trim();

        // 1. Find User & Validate Token
        const user = await InterestRegistration.findOne({
            email: lowerEmail,
            verifyToken: token,
            verifyTokenExpiresAt: { $gt: new Date() } // Check expiry
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        // 2. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update User (Atomic Update)
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

        console.log(`✅ Password reset successfully for: ${lowerEmail}`);
        return res.json({ success: true, message: "Password updated successfully." });

    } catch (err) {
        console.error("Reset Password Confirm Error:", err);
        return res.status(500).json({ message: "Server error resetting password." });
    }
});

// ==========================================
// 8. ACCOUNT FIND (Session Restore)
// ==========================================
router.post('/account/find', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required.' });
        
        const lower = email.toLowerCase().trim();

        const user = await InterestRegistration.findOne({ 
            email: lower, 
            isVerified: true 
        }).lean();

        if (!user) {
            return res.status(403).json({ message: 'Session invalid or expired.' });
        }

        return res.json({
            name: user.name,
            email: user.email,
            phone: user.phone || user.mobileNumber,
            programs: user.programs || [],
            payments: user.payments || []
        });

    } catch (err) {
        console.error('Account lookup error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
