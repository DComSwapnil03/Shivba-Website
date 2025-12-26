const nodemailer = require('nodemailer');

/**
 * Transport configuration
 * Fixes applied: 
 * 1. Added 'ciphers: SSLv3' to fix handshake errors.
 * 2. Set 'rejectUnauthorized: false' to prevent certificate issues locally.
 * 3. Added 'logger: true' and 'debug: true' to help you see what's wrong in the console.
 */
const mailer = nodemailer.createTransport({
  service: 'gmail', // Simplifies configuration if using Gmail
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // Must be FALSE for port 587 (STARTTLS)
  auth: {
    user: process.env.MAIL_USER, // Your Gmail address
    pass: process.env.MAIL_PASS  // Your 16-digit App Password
  },
  tls: {
    ciphers: 'SSLv3',            // Critical fix for "Connection closed unexpectedly"
    rejectUnauthorized: false    // Allows connection even if antivirus/firewall interferes
  },
  logger: true, // Logs SMTP transaction details to console
  debug: true   // Includes debug info
});

/**
 * Send verification email with link + code
 */
async function sendVerificationEmail({ to, name, token, code }) {
  try {
    const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-account?token=${token}&email=${encodeURIComponent(to)}`;

    const info = await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER, // Sender address
      to: to, // Receiver address
      subject: 'Verify your Shivba account email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #FFA500;">Welcome to Shivba!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your verification code is:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">${code}</h1>
          <p>You can either enter the code manually or click the link below:</p>
          <p>
            <a href="${verifyUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </p>
          <p style="font-size: 0.8rem; color: #888; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error("❌ Email Sending Failed:", error);
    // Don't throw error, just return false so the user registration doesn't crash completely
    return false;
  }
}

module.exports = {
  mailer,
  sendVerificationEmail
};