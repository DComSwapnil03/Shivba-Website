const axios = require('axios'); // Make sure to run: npm install axios

// Controller to send WhatsApp Welcome Message via Meta Cloud API
const sendWelcomeMessage = async (req, res) => {
  const { name, phone } = req.body;

  // 1. Basic Input Validation
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and Phone are required.' });
  }

  try {
    console.log(`[Notification] Preparing Meta WhatsApp message for: ${name} (${phone})`);

    // 2. Format Phone Number for Meta API
    // Meta requires the number to:
    // - Contain the Country Code (e.g., 91 for India)
    // - NOT contain any '+' signs or special characters
    let formattedPhone = phone.toString().replace(/\D/g, ''); // Remove non-digits (like +, -, space)
    
    // If the user entered a 10-digit number (e.g., 9876543210), assume it's Indian and add '91'
    if (formattedPhone.length === 10) {
        formattedPhone = '91' + formattedPhone; 
    }
    
    // 3. Load Credentials from .env
    const phoneId = process.env.META_PHONE_ID;
    const token = process.env.META_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

    if (!phoneId || !token) {
        throw new Error("Missing META_PHONE_ID or META_ACCESS_TOKEN in .env file");
    }

    // 4. Construct the Message Payload
    const data = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: {
        body: `🎉 *Welcome to Shivba, ${name}!*

You have successfully registered. We are proud to have you in our community.

*Join our Community Groups via the links below:*
💪 *Talim Group:* https://chat.whatsapp.com/TalimGroupLink
📚 *Library Group:* https://chat.whatsapp.com/LibraryGroupLink
🏘️ *Hostel Group:* https://chat.whatsapp.com/HostelGroupLink

If you have any questions, feel free to reply to this message.`
      }
    };

    // 5. Send Request to Meta
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[Notification] Message Sent Successfully. ID:', response.data.messages[0].id);

    // 6. Respond to Frontend
    return res.status(200).json({ 
      success: true, 
      message: 'WhatsApp welcome message sent successfully.',
      metaResponse: response.data 
    });

  } catch (error) {
    // detailed error logging for Meta API issues
    const apiError = error.response ? error.response.data : error.message;
    console.error('[Notification Error]', JSON.stringify(apiError, null, 2));
    
    // Return a 500 error but include details to help you debug
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send message via Meta API', 
      error: apiError 
    });
  }
};

module.exports = { sendWelcomeMessage };