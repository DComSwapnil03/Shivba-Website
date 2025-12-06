const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const InterestRegistration = require('../models/InterestRegistration'); // Your User Model

// Configure Mailer (Same as auth routes)
const mailer = nodemailer.createTransport({
    // ... your smtp settings
});

router.post('/events/add', async (req, res) => {
    try {
        const eventData = req.body;
        // 1. Save Event to DB (Create an Event Model first if needed)
        // const newEvent = await Event.create(eventData);

        // 2. NOTIFY USERS LOGIC
        if (eventData.notifyUsers) {
            // Get all verified user emails
            const users = await InterestRegistration.find({ isVerified: true }, 'email name');
            const emailList = users.map(u => u.email);

            if (emailList.length > 0) {
                // Send Emails (Using Bcc to hide emails from each other)
                await mailer.sendMail({
                    from: process.env.MAIL_USER,
                    bcc: emailList, // Blind Copy everyone
                    subject: `New Event: ${eventData.title}`,
                    html: `
                        <h2>New Event Announcement!</h2>
                        <p>We are excited to announce: <strong>${eventData.title}</strong></p>
                        <p>📅 Date: ${eventData.date}</p>
                        <p>📍 Location: ${eventData.location}</p>
                        <p>${eventData.shortDescription}</p>
                        <p>Log in to Shivba to register!</p>
                    `
                });
                console.log(`📧 Notification sent to ${emailList.length} users.`);
            }
        }

        res.json({ message: 'Event added and notifications sent!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;