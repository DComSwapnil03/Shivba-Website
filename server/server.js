require('dotenv').config();
const express = require('express');
const { json, urlencoded } = express;
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const Razorpay = require('razorpay');

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

// --- RAZORPAY CONFIGURATION ---
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay Configured');
} else {
  console.warn('⚠️ WARNING: RAZORPAY_KEY_ID or SECRET missing from .env. Payments will fail.');
}

// --- MIDDLEWARE ---
app.use(json());
app.use(urlencoded({ extended: true }));

// CRITICAL FIX: Dynamically accept the origin instead of using the forbidden '*'
app.use(cors({ 
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        return callback(null, true); // Allows any dynamically requested origin
    }, 
    credentials: true 
}));

app.use(helmet());
app.use(morgan('dev'));

// Rate limiter applied only to API routes
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', apiLimiter);

// Ensure models register
try { require('./src/models'); } catch (e) { /* optional */ }

// --- ROUTE IMPORTS (With Safety Checks) ---
let authRoutes, accountRoutes, eventRegistrationRoutes, contactRoutes, dataRoutes, paymentRoutes, chatRoutes;

try { authRoutes = require('./src/routes/authRoutes'); } catch(e) { console.warn('⚠️ authRoutes not found'); }
try { accountRoutes = require('./src/routes/accountRoutes'); } catch(e) { console.warn('⚠️ accountRoutes not found'); }
try { eventRegistrationRoutes = require('./src/routes/eventRegistrationRoutes'); } catch(e) { console.warn('⚠️ eventRegistrationRoutes not found'); }
try { contactRoutes = require('./src/routes/contactRoutes'); } catch(e) { console.warn('⚠️ contactRoutes not found'); }
try { dataRoutes = require('./src/routes/dataRoutes'); } catch(e) { console.warn('⚠️ dataRoutes not found'); }
try { paymentRoutes = require('./src/routes/paymentRoutes'); } catch(e) { console.warn('⚠️ paymentRoutes not found'); }

// THE CHATBOT FIX: You forgot the chatbot route!
try { chatRoutes = require('./src/routes/chat'); } catch(e) { console.warn('⚠️ chat.js route not found. AI Chatbot disabled.'); }


// --- CRITICAL FIX: ROOT HEALTH CHECK ---
app.get('/', (req, res) => {
    res.status(200).send("Shivba Backend Server is live and healthy.");
});

// --- ROUTE MOUNTING ---
if (authRoutes) app.use('/api', authRoutes); 
if (accountRoutes) app.use('/api', accountRoutes);
if (eventRegistrationRoutes) app.use('/api', eventRegistrationRoutes);
if (contactRoutes) app.use('/api', contactRoutes);

// Your Admin Dashboard & Excel Data Routes
if (dataRoutes) app.use('/api/data', dataRoutes);

// Your AI Chatbot Route
if (chatRoutes) app.use('/api/chat', chatRoutes);

// Razorpay Routes
if (razorpayInstance && paymentRoutes) {
  app.use('/', paymentRoutes(razorpayInstance));
}

// Additional API Health checks
app.get("/api/message", (req, res) => res.json({ message: "Hello from Express on Vercel!" }));
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
            
            if(!process.env.TWILIO_AUTH_TOKEN) {
                console.warn("⚠️  WARNING: TWILIO_AUTH_TOKEN is missing from .env!");
            } else {
                console.log("✅ Twilio Config Detected");
            }

            if(!process.env.OPENAI_API_KEY) {
                console.warn("⚠️  WARNING: OPENAI_API_KEY is missing! Chatbot will fail.");
            } else {
                console.log("✅ OpenAI API Key Detected");
            }

            app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
            });
        } catch (e) {
            console.error('Local server failed to start:', e.message);
        }
    })();
}

// 404 handler for API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});