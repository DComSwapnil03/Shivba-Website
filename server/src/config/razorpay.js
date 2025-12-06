const Razorpay = require('razorpay');

const createRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('FATAL ERROR: Razorpay API keys are not defined in .env file.');
    process.exit(1);
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

module.exports = createRazorpayInstance;
