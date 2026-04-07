const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
// Ensure you have these models imported
const { Registration, Member, InterestRegistration, LibrarySeat, HostelBed } = require('../models');

// --- 1. EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS  // Your Google App Password
  }
});

module.exports = (razorpay) => {
  // ==========================================
  // 1. CREATE ORDER
  // ==========================================
  router.post('/payment/create-order', async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
      
      const options = {
        amount: Number(amount), 
        currency: 'INR',
        receipt: `receipt_order_${crypto.randomBytes(4).toString('hex')}`,
      };
      
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error.message);
      res.status(500).json({ message: 'Server error while creating order' });
    }
  });

  // ==========================================
  // 2. VERIFY PAYMENT, UPDATE STATUS & SEND EMAIL
  // ==========================================
  router.post('/payment/verify-payment', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationData } = req.body;

      // --- A. Verify Signature ---
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ signatureIsValid: false, message: 'Invalid signature.' });
      }

      // --- B. Extract Data ---
      const { name, email, phone, eventName, planDuration, amount, slotId } = registrationData;
      const lowerCaseEmail = email.toLowerCase().trim();

      // --- C. Update Occupancy ---
      if (slotId) {
        const lowerEvent = eventName.toLowerCase();
        if (lowerEvent.includes('library')) {
           await LibrarySeat.findOneAndUpdate({ seatNo: slotId }, { status: 'booked', userEmail: lowerCaseEmail });
        } else if (lowerEvent.includes('hostel')) {
           await HostelBed.findOneAndUpdate({ bedId: slotId }, { status: 'booked', userEmail: lowerCaseEmail });
        }
      }

      // --- D. Prepare Data & Expiry ---
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      const durationString = planDuration || eventName; 
      if (durationString.includes('Month')) {
         expiryDate.setMonth(expiryDate.getMonth() + (parseInt(durationString) || 1));
      } else if (durationString.includes('Year')) {
         expiryDate.setFullYear(expiryDate.getFullYear() + (parseInt(durationString) || 1));
      } else {
         expiryDate.setMonth(expiryDate.getMonth() + 1);
      }

      const newPayment = {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amount: Number(amount) / 100, 
          eventName: eventName, 
          date: new Date(),
          status: 'success'
      };

      const newProgram = {
          name: planDuration ? `${eventName} (${planDuration})` : eventName,
          status: 'active',
          registrationDate: startDate,
          endDate: expiryDate,
          paymentId: razorpay_payment_id,
          slotId: slotId 
      };

      // --- E. Update InterestRegistration (Verification) ---
      let user = await InterestRegistration.findOneAndUpdate(
        { email: lowerCaseEmail },
        { 
          $set: { isVerified: true, mobileNumber: phone, name: name }, 
          $push: { payments: newPayment, programs: newProgram }
        },
        { new: true, upsert: true }
      );

      // --- F. EMAIL SENDING LOGIC ---
      const mailOptions = {
        from: `"Shivba Foundation" <${process.env.EMAIL_USER}>`,
        to: lowerCaseEmail,
        subject: `Payment Confirmed - ${eventName} Receipt`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: #ea580c; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px;">Payment Successful</h1>
            </div>
            <div style="padding: 25px; color: #333;">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Your payment for <strong>${eventName}</strong> has been received. Your membership is now <strong>Verified ✅</strong>.</p>
              
              <div style="background: #f9fafb; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #ea580c; border-bottom: 1px solid #eee; padding-bottom: 10px;">Receipt Detail</h3>
                <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                <p><strong>Amount Paid:</strong> ₹${amount / 100}</p>
                ${slotId ? `<p style="font-size: 1.1rem; color: #ea580c;"><strong>Your Assigned Spot:</strong> ${slotId}</p>` : ''}
                <p><strong>Duration:</strong> ${planDuration || '1 Month'}</p>
              </div>

              <p>Please show this digital receipt at the center to access your facilities.</p>
              <p style="margin-top: 30px;">Stay Strong,<br><strong>Team Shivba Foundation</strong></p>
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions).catch(err => console.error("Mail Error:", err));

      res.json({
        signatureIsValid: true,
        message: 'Payment verified and Receipt sent.',
        registrationId: user._id,
      });

    } catch (error) {
      console.error('Error verifying payment:', error.message);
      res.status(500).json({ message: 'Server error while verifying payment' });
    }
  });

  return router;
};