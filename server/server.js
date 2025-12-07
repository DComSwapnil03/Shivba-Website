require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Ensure models register if you have src/models/index.js
try { require('./src/models'); } catch (e) { /* optional */ }

// Direct route imports
const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const eventRegistrationRoutes = require('./src/routes/eventRegistrationRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
// add other route imports as needed

// --- ROUTE MOUNTING ---
// Mount all modules under a single API prefix. Route files define their own sub-paths (e.g., /auth/..., /account/...)
app.use('/api', authRoutes);
app.use('/api', accountRoutes);
app.use('/api', eventRegistrationRoutes);
app.use('/api', contactRoutes);

// Serve static files (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get("/api/message", (req, res) => {
res.json({ message: "Hello from Express on Vercel!" });
});
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 404 handler for /api
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB and start server
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('⚠️ MONGO_URI not set in .env - DB will fail if required.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err && err.message ? err.message : err);
    // continue to start server if you prefer for non-DB routes
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();