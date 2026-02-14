const express = require('express');
const OpenAI = require('openai');
const Chat = require('../models/Chat'); // Ensure your Chat model is also using CommonJS

const router = express.Router();

// Initialize OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

router.post("/", async (req, res) => {
  // Extract message, history, and optional userId from the request
  const { message, history, userId } = req.body; 

  try {
    // 1. Construct context for OpenAI
    const conversation = [
      { role: "system", content: "You are Shivba, a helpful and professional AI assistant for a gym and library. Keep answers concise, friendly, and helpful." },
      ...(history || []), // Append previous chat context if available
      { role: "user", content: message }
    ];

    // 2. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // You can switch to "gpt-3.5-turbo" to save costs
      messages: conversation,
      max_tokens: 150, // Limit response length
    });

    const botReply = completion.choices[0].message.content;

    // 3. SAVE TO MONGODB
    await Chat.create({
      userId: userId || "guest",
      userMessage: message,
      botReply: botReply,
      timestamp: new Date()
    });

    // 4. Send response back to frontend
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// IMPORTANT: Export using module.exports for compatibility with app.js
module.exports = router;