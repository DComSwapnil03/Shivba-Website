const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

// --- IMPORT ROUTES ---
const dynamicContentRoutes = require('./routes/dynamicContentRoutes');
const publicContentRoutes = require('./routes/publicContentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const paymentRoutesFactory = require('./routes/paymentRoutes');
const eventRegistrationRoutes = require('./routes/eventRegistrationRoutes');
const authRoutes = require('./routes/authRoutes'); 
const accountRoutes = require('./routes/accountRoutes'); 
const dataRoutes = require('./routes/dataRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// [NEW] Import Chat Route
const chatRoutes = require('./routes/chat'); 

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
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// MongoDB Connection
mongoose.connect(process.env.MONGOURI || process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// --- MOUNT ROUTES ---
app.use('/api', dynamicContentRoutes);
app.use('/api', publicContentRoutes);
app.use('/api', contactRoutes);
app.use('/api', authRoutes);
app.use('/api', accountRoutes);
app.use('/api', registrationRoutes);
app.use('/api/data', dataRoutes);
app.use('/api', notificationRoutes);

// [NEW] Chatbot Route - This fixes your 404!
app.use('/api/chat', chatRoutes); 

// Payment Logic
try {
  const createRazorpayInstance = require('./config/razorpay');
  const razorpay = createRazorpayInstance();
  app.use('/api', paymentRoutesFactory(razorpay));
} catch (e) {
  console.warn("⚠️ Razorpay disabled.");
}

app.use('/api', eventRegistrationRoutes);

// 404 & Error Handlers
app.use('*', (req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));