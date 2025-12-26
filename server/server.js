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

// --- CONNECTION CACHING ---
// Use a cached connection promise to avoid redundant connections on subsequent function invocations
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

// Basic middleware (applies to every request)
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Ensure models register
try { require('./src/models'); } catch (e) { /* optional */ }

// Direct route imports (CommonJS)
const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const eventRegistrationRoutes = require('./src/routes/eventRegistrationRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

// [NEW] Import Data Routes (Excel Import/Export)
const dataRoutes = require('./src/routes/dataRoutes');

// --- ROUTE MOUNTING ---
app.use('/api', authRoutes);
app.use('/api', accountRoutes);
app.use('/api', eventRegistrationRoutes);
app.use('/api', contactRoutes);

// [NEW] Mount Data Routes
// Final URL: /api/data/import-members AND /api/data/export-members
app.use('/api/data', dataRoutes);

// Serve static files (Vercel typically ignores express.static, use the 'public' folder directly)
// app.use(express.static(path.join(__dirname, 'public'))); // KEEP THIS FOR LOCAL DEV

// Health check (always available)
app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express on Vercel!" });
});
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- VERCEL-SPECIFIC ENTRYPOINT: WRAP ALL ROUTES IN A DB CONNECTOR ---
// Export a handler that ensures DB connection before passing the request to Express
module.exports = async (req, res) => {
  try {
    await connectToDatabase();
  } catch (e) {
    return res.status(503).json({ message: 'Service Unavailable: Could not connect to database.' });
  }

  return app(req, res);
};

// --- LOCAL DEVELOPMENT ONLY ---
// This block is only for running the server locally with `npm start` or `npm run dev`.
if (process.env.NODE_ENV !== 'production') {
    (async () => {
        try {
            await connectToDatabase();
            app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
            });
        } catch (e) {
            console.error('Local server failed to start:', e.message);
        }
    })();
}

// 404 handler for /api (Vercel routes typically handle the 404 outside the function)
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});