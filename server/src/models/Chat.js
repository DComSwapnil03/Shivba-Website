import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: false, // Optional: useful if you have logged-in users
    default: "guest" 
  }, 
  userMessage: { 
    type: String, 
    required: true 
  },
  botReply: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Chat", chatSchema);