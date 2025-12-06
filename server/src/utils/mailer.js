const nodemailer = require('nodemailer');

/**
 * Transport configuration
 */
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  tls: {
    // allow self-signed only in development
    rejectUnauthorized: process.env.NODE_ENV !== 'development'
  }
});

/**
 * Send verification email with link + code
 */
async function sendVerificationEmail({ to, name, token, code }) {
  const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify-account?token=${token}&email=${encodeURIComponent(
    to
  )}`;

  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject: 'Verify your Shivba account email',
    html: `
      <p>Hi ${name},</p>
      <p>Your verification code is <strong>${code}</strong>.</p>
      <p>You can either click this link or enter the code on the website:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
    `
  });
}

module.exports = {
  mailer,
  sendVerificationEmail
};
