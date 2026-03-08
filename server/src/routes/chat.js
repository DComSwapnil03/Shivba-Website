const express = require('express');
const OpenAI = require('openai');
const Chat = require('../models/Chat'); 
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

const SHIVBA_IDENTITY = `
You are Shivba, the AI for Shivba Gym & Library (https://shivaam.netlify.app).
Location: [Insert City/Area].
Gym: Premium equipment, ₹500/month starting.
Library: Quiet, AC-equipped, high-speed Wi-Fi.
Tone: Helpful, direct, and motivating.
`;

router.post("/", async (req, res) => {
  const { message, history } = req.body; 

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fastest model to avoid Vercel timeouts
      messages: [
        { role: "system", content: SHIVBA_IDENTITY },
        ...(history || []).slice(-3), // Only last 3 messages to keep payload small
        { role: "user", content: message }
      ],
      max_tokens: 150,
    });

    const botReply = completion.choices[0].message.content;

    // Save to DB (Fire and forget to speed up response)
    Chat.create({
      userMessage: message,
      botReply: botReply
    }).catch(err => console.error("DB Save Error:", err));

    res.json({ reply: botReply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Shivba AI is currently resting. Try again soon!" });
  }
});

module.exports = router;