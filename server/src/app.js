const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// --- IMPORT ROUTES ---
const dynamicContentRoutes = require('./routes/dynamicContentRoutes');
const publicContentRoutes = require('./routes/publicContentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const paymentRoutesFactory = require('./routes/paymentRoutes');
const eventRegistrationRoutes = require('./routes/eventRegistrationRoutes');

// [UPDATED] Import the new Auth Routes (Password + OTP)
const authRoutes = require('./routes/authRoutes'); 

// [UPDATED] Import Account Routes
const accountRoutes = require('./routes/accountRoutes'); 

// [NEW] Import Data Routes (Excel Import/Export)
const dataRoutes = require('./routes/dataRoutes');

// [NEW] Import Notification Routes (WhatsApp Welcome Message)
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security / Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// MongoDB Connection
const MONGOURI = process.env.MONGOURI || process.env.MONGO_URI;
if (!MONGOURI) {
  console.error('❌ MONGOURI not found in .env file!');
  process.exit(1);
}

mongoose
  .connect(MONGOURI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'SHIVBA API Server is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Razorpay instance
const createRazorpayInstance = require('./config/razorpay');
// Wrap in try-catch in case Razorpay config is missing locally
let paymentRoutes;
try {
    const razorpay = createRazorpayInstance();
    paymentRoutes = paymentRoutesFactory(razorpay);
} catch (error) {
    console.warn("⚠️ Razorpay setup failed (check .env). Payment routes disabled.");
    paymentRoutes = (req, res, next) => next(); // Dummy middleware
}

// --- MOUNT ROUTES ---
app.use('/api', dynamicContentRoutes);       // Dynamic content (services, team, etc.)
app.use('/api', publicContentRoutes);        // Public data (events, gallery, testimonials)
app.use('/api', contactRoutes);              // Contact form

// [UPDATED] New Auth Routes (Register Interest + Verify OTP)
app.use('/api', authRoutes);                 

app.use('/api', accountRoutes);              // Account lookup
app.use('/api', registrationRoutes);         // Existing registrations
app.use('/api', paymentRoutes);              // Razorpay payments
app.use('/api', eventRegistrationRoutes);    // Event registrations

// [NEW] Data Routes (Excel Import/Export) - Mounts at /api/data
app.use('/api/data', dataRoutes);

// [NEW] Notification Routes - Mounts at /api/send-welcome-message
app.use('/api', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Shivba API Server running on http://localhost:${PORT}`);
});

module.exports = server;