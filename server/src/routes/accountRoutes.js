const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');

// Import Model
const InterestRegistration = require('../models/InterestRegistration');

// --- EMAIL TRANSPORTER CONFIGURATION ---
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

// ==========================================
// 🔐 ROUTE: LOGIN
// ==========================================
router.post('/account/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = (email || '').toLowerCase().trim();

        // 1. Validate Input
        if (!lowerEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 2. Find User
        // We select +password to ensure we get it even if schema has select: false
        const user = await InterestRegistration.findOne({ 
            email: lowerEmail, 
            isVerified: true 
        }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Account not found or not verified.' });
        }

        // --- CRITICAL FIX: ZOMBIE USER CHECK ---
        // Prevents crash if DB has old users without passwords
        if (!user.password) {
            console.error(`⚠️ Login failed: User ${lowerEmail} exists but has NO password in DB.`);
            return res.status(400).json({ 
                message: 'Account data invalid (missing password). Please reset password or register again.' 
            });
        }

        // 3. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 4. Success - Prepare Response (Strip Sensitive Data)
        const userObj = user.toObject();
        delete userObj.password;        
        delete userObj.otp;             
        delete userObj.verifyToken;
        delete userObj.verifyTokenExpiresAt;
        
        userObj.services = userObj.services || []; 

        console.log(`✅ Login successful for: ${lowerEmail}`);
        return res.json(userObj);

    } catch (err) {
        console.error("❌ Login Error:", err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

// ==========================================
// 🔄 ROUTE: ACCOUNT FIND (Session Restore)
// ==========================================
router.post('/account/find', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required.' });
        
        const lower = email.toLowerCase().trim();

        // Find verified user
        const user = await InterestRegistration.findOne({ 
            email: lower, 
            isVerified: true 
        }).lean();

        if (!user) {
            return res.status(403).json({ message: 'Session invalid or expired.' });
        }

        // Remove sensitive data
        delete user.password;
        delete user.otp;
        delete user.verifyToken;
        delete user.verifyTokenExpiresAt;

        return res.json({
            ...user,
            services: user.services || []
        });

    } catch (err) {
        console.error('Account lookup error:', err);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// ==========================================
// 📧 ROUTE: FORGOT PASSWORD
// ==========================================
router.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const lowerEmail = email.toLowerCase().trim();
        
        const user = await InterestRegistration.findOne({ email: lowerEmail });

        if (user) {
            // 1. Generate Reset Token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 Minutes

            // 2. Save Token to DB
            user.verifyToken = resetToken;
            user.verifyTokenExpiresAt = expiresAt;
            await user.save();

            // 3. Construct Link
            const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(lowerEmail)}`;

            // 4. Send Email
            console.log(`[Forgot Password] Sending email to ${lowerEmail}`);
            
            await mailer.sendMail({
                from: process.env.MAIL_FROM || process.env.MAIL_USER,
                to: lowerEmail,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Password Reset</h2>
                        <p>You requested a password reset. Click the link below to set a new password:</p>
                        <a href="${resetLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p style="margin-top: 20px;">Or copy this link: <br/>${resetLink}</p>
                        <p>This link expires in 30 minutes.</p>
                        <p>If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
        }

        // Always return success (Security Best Practice)
        return res.json({ 
            success: true, 
            message: 'If an account exists, a reset link has been sent.' 
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        return res.status(500).json({ message: 'Error processing request' });
    }
});

module.exports = router;