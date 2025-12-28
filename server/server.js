require('dotenv').config();
const express = require('express');
const { json, urlencoded } = express;
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONNECTION CACHING (FOR VERCEL) ---
let cachedDb = null;

// --- DATABASE CONNECTION FUNCTION ---
async function connectToDatabase() {
  if (cachedDb) {
    console.log('✅ Using cached MongoDB connection');
    return cachedDb;
  }

  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI not set - Database connection will fail.');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 1,
    });
    cachedDb = db;
    console.log('✅ New MongoDB connection established');
    return cachedDb;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    throw new Error('Database connection failed.');
  }
}

// --- MIDDLEWARE ---
app.use(json());
app.use(urlencoded({ extended: true }));

// Allow all origins for dev (Fixes frontend connection issues)
app.use(cors({ origin: '*', credentials: true })); 

app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Ensure models register
try { require('./src/models'); } catch (e) { /* optional */ }

// --- ROUTE IMPORTS ---
// Ensure the file you updated in the last step is named 'authRoutes.js' 
// inside the 'src/routes' folder!
const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const eventRegistrationRoutes = require('./src/routes/eventRegistrationRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const dataRoutes = require('./src/routes/dataRoutes');

// --- ROUTE MOUNTING ---
// The '/send-welcome-message' route is inside authRoutes now
app.use('/api', authRoutes); 
app.use('/api', accountRoutes);
app.use('/api', eventRegistrationRoutes);
app.use('/api', contactRoutes);
app.use('/api/data', dataRoutes);

// Health check
app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express on Vercel!" });
});
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- VERCEL ENTRYPOINT ---
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
  } catch (e) {
    return res.status(503).json({ message: 'Service Unavailable: Could not connect to database.' });
  }
  return app(req, res);
};

// --- LOCAL DEVELOPMENT ONLY ---
if (process.env.NODE_ENV !== 'production') {
    (async () => {
        try {
            await connectToDatabase();
            
            // --- ENV CHECK (For Debugging) ---
            if(!process.env.TWILIO_AUTH_TOKEN) {
                console.warn("⚠️  WARNING: TWILIO_AUTH_TOKEN is missing from .env!");
            } else {
                console.log("✅ Twilio Config Detected");
            }

            app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
            });
        } catch (e) {
            console.error('Local server failed to start:', e.message);
        }
    })();
}

// 404 handler
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});