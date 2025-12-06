const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { Registration, Member, InterestRegistration } = require('../models');

module.exports = (razorpay) => {
  // ==========================================
  // 1. CREATE ORDER
  // ==========================================
  router.post('/payment/create-order', async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      
      const options = {
        amount: Number(amount), // Amount in paise
        currency: 'INR',
        receipt: `receipt_order_${crypto.randomBytes(4).toString('hex')}`,
      };
      
      const order = await razorpay.orders.create(options);
      
      if (!order) {
        return res.status(500).json({ message: 'Razorpay order creation failed' });
      }
      res.json(order);
    } catch (error) {
      console.error('Error creating Razorpay order:', error.message);
      res.status(500).json({ message: 'Server error while creating order' });
    }
  });

  // ==========================================
  // 2. VERIFY PAYMENT & SAVE DATA
  // ==========================================
  router.post('/payment/verify-payment', async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        registrationData,
      } = req.body;

      // --- A. Verify Signature ---
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        console.warn('Payment verification failed: Invalid signature');
        return res.status(400).json({
          signatureIsValid: false,
          message: 'Payment verification failed. Invalid signature.',
        });
      }

      // --- B. Extract Data ---
      const { name, email, phone, eventName, planDuration, amount } = registrationData;
      const lowerCaseEmail = email.toLowerCase().trim();

      // --- C. Calculate Expiry (Logic for Services) ---
      // This is used for 'programs' in User model and 'services' in Member model
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      const durationString = planDuration || eventName; 

      if (durationString.includes('Month')) {
         const months = parseInt(durationString) || 1;
         expiryDate.setMonth(expiryDate.getMonth() + months);
      } else if (durationString.includes('Year')) {
         const years = parseInt(durationString) || 1;
         expiryDate.setFullYear(expiryDate.getFullYear() + years);
      } else {
         // Default fallback: 1 Month
         expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      // --- D. Prepare Data Objects ---
      
      // 1. Payment Record (For Payment History Table)
      const newPayment = {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amount: Number(amount) / 100, // Convert paise to Rupees for display
          eventName: eventName, 
          date: new Date(),
          status: 'success'
      };

      // 2. Program Record (For Active Services Cards)
      const newProgram = {
          name: planDuration ? `${eventName} (${planDuration})` : eventName,
          status: 'active',
          registrationDate: startDate,
          endDate: expiryDate,
          paymentId: razorpay_payment_id
      };

      // --- E. KEY STEP: Update InterestRegistration (The Main Auth Model) ---
      // This ensures the data shows up on the MyAccountPage Dashboard
      let user = await InterestRegistration.findOne({ email: lowerCaseEmail });

      if (user) {
          // User exists: Add to history
          if (!user.payments) user.payments = [];
          if (!user.programs) user.programs = [];
          
          user.payments.push(newPayment);
          user.programs.push(newProgram);
          
          // Ensure phone is updated
          if (!user.mobileNumber) user.mobileNumber = phone;
          
          await user.save();
          console.log(`✅ Updated existing user: ${lowerCaseEmail}`);
      } else {
          // Guest Checkout: Create new User Account
          // They are "Verified" because they successfully paid.
          user = new InterestRegistration({
              name,
              email: lowerCaseEmail,
              mobileNumber: phone,
              isVerified: true, 
              payments: [newPayment],
              programs: [newProgram]
          });
          await user.save();
          console.log(`✅ Created new user from payment: ${lowerCaseEmail}`);
      }

      // --- F. Legacy/Redundant Support (Optional) ---
      // If you still use the 'Member' schema for admin panels, keep this.
      // If you are migrating fully to InterestRegistration, this block can eventually be removed.
      const isService = /talim|hostel|library|training|membership/i.test(eventName);
      if (isService) {
        let serviceId = 'general_service';
        if (eventName.toLowerCase().includes('talim')) serviceId = 'talim';
        if (eventName.toLowerCase().includes('hostel')) serviceId = 'hostel';

        await Member.findOneAndUpdate(
          { email: lowerCaseEmail },
          {
            $setOnInsert: { name, phone, joiningDate: new Date() },
            $push: { 
                services: {
                    serviceId,
                    serviceName: newProgram.name,
                    subscriptionDate: startDate,
                    expiryDate: expiryDate,
                    totalFee: Number(amount) / 100, // Store in Rupees
                    paymentId: razorpay_payment_id
                } 
            },
            $set: { phone: phone } 
          },
          { upsert: true, new: true }
        );
      }

      // --- G. Response ---
      res.json({
        signatureIsValid: true,
        message: 'Payment verified and account updated successfully.',
        registrationId: user._id,
      });

    } catch (error) {
      console.error('Error verifying payment:', error.message);
      res.status(500).json({ message: 'Server error while verifying payment' });
    }
  });

  return router;
};