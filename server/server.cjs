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
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGO_URI) { console.warn('MONGO_URI not set'); return; }
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000, maxPoolSize: 1 });
    cachedDb = db;
    return cachedDb;
  } catch (err) {
    console.error('DB connection error', err);
    throw err;
  }
}

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

try { require('./src/models'); } catch (e) {}

const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const eventRegistrationRoutes = require('./src/routes/eventRegistrationRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

app.use('/api', authRoutes);
app.use('/api', accountRoutes);
app.use('/api', eventRegistrationRoutes);
app.use('/api', contactRoutes);

app.get('/api/message', (req, res) => res.json({ message: 'Hello from Express on Vercel!' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));

module.exports = async (req, res) => {
  try { await connectToDatabase(); } catch (e) {
    return res.status(503).json({ message: 'Service Unavailable' });
  }
  return app(req, res);
};

if (process.env.NODE_ENV !== 'production') {
  (async () => { try { await connectToDatabase(); app.listen(PORT, () => console.log(`Server running on ${PORT}`)); } catch (e) { console.error(e); } })();
}

app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));
app.use((err, req, res, next) => { console.error('Unhandled error:', err); res.status(500).json({ message: 'Internal server error' }); });
