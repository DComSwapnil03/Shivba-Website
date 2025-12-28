const express = require('express');
const router = express.Router();
const { sendWelcomeMessage } = require('../controllers/notificationController');

// Route to handle sending welcome messages after registration
router.post('/send-welcome-message', sendWelcomeMessage);

module.exports = router;