const express = require('express');
const OpenAI = require('openai');
const Chat = require('../models/Chat'); 
const router = express.Router();

// Initialize OpenAI using the key from your .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

const SHIVBA_IDENTITY = `
You are Shivba, the AI assistant for Shivba Gym & Library (https://shivaam.netlify.app).
Location: Chakan, Maharashtra.
Gym: Premium equipment, ₹500/month starting.
Library: Quiet, AC-equipped, high-speed Wi-Fi.
Tone: Helpful, direct, and motivating.
Keep responses concise and under 3 sentences unless asked for details.
`;

router.post("/", async (req, res) => {
  const { message, history } = req.body; 

  if (!message) {
      return res.status(400).json({ error: "Message is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: SHIVBA_IDENTITY },
        ...(history || []).slice(-4), // Keep the last 4 messages for context
        { role: "user", content: message }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const botReply = completion.choices[0].message.content;

    // Save chat log to database
    try {
      await Chat.create({
        userMessage: message,
        botReply: botReply
      });
    } catch (dbErr) {
      console.error("Database Save Error:", dbErr);
      // Proceed even if DB fails, so the user still gets a reply
    }

    res.json({ reply: botReply });
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    res.status(500).json({ error: "Shivba AI is currently resting. Try again soon." });
  }
});

module.exports = router;