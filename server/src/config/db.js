const mongoose = require('mongoose');

const connectDB = async (MONGO_URI) => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:');
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
