const Razorpay = require('razorpay');
const crypto = require('crypto');
const Member = require('../models/Member'); // Assuming your user model
// Import models for seat/bed management
const LibrarySeat = require('../models/LibrarySeat'); 
const HostelBed = require('../models/HostelBed');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * STEP 1: Create Order
 */
exports.createOrder = async (req, res) => {
    try {
        const options = {
            amount: req.body.amount, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Could not create order", error });
    }
};

/**
 * STEP 2: Verify Payment & Update Occupancy
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            registrationData 
        } = req.body;

        // Verify signature security
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            
            // --- LOGIC FOR OCCUPYING SEATS/BEDS ---
            const { eventName, email, slotId } = registrationData;

            // 1. Mark Library Seat as occupied if applicable
            if (eventName.toLowerCase().includes('library') && slotId) {
                await LibrarySeat.findOneAndUpdate(
                    { seatNo: slotId }, 
                    { status: 'booked', userEmail: email }
                );
            }

            // 2. Mark Hostel Bed as occupied if applicable
            if (eventName.toLowerCase().includes('hostel') && slotId) {
                await HostelBed.findOneAndUpdate(
                    { bedId: slotId }, 
                    { status: 'booked', userEmail: email }
                );
            }

            // 3. Log the payment to the member's profile
            await Member.findOneAndUpdate(
                { email: email },
                { 
                    $push: { 
                        payments: {
                            orderId: razorpay_order_id,
                            paymentId: razorpay_payment_id,
                            amount: registrationData.amount / 100,
                            eventName: eventName,
                            date: new Date()
                        }
                    }
                }
            );

            return res.status(200).json({ 
                signatureIsValid: true, 
                message: "Payment verified and seat reserved successfully!" 
            });
        } else {
            return res.status(400).json({ 
                signatureIsValid: false, 
                message: "Invalid signature" 
            });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};