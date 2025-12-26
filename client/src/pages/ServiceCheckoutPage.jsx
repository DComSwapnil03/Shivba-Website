import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- 1. RAZORPAY HELPER ---
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// --- 2. CONFIG DATA (Shared) ---
const SERVICE_CONFIG = {
  talim: { title: 'Shivba Talim', price: 1200, plans: [{ label: '1 Month', price: 1200 }, { label: '3 Months', price: 3000 }, { label: '6 Months', price: 5500 }, { label: '1 Year', price: 8000 }] },
  library: { title: 'Shivba Library', price: 900, plans: [{ label: '1 Month', price: 900 }, { label: '3 Months', price: 2500 }, { label: '6 Months', price: 5000 }, { label: '1 Year', price: 7000 }] },
  hostel: { title: 'Shivba Hostel', price: 2499, plans: [{ label: 'Standard Room', price: 2499 }] },
  social: { title: 'Social Awareness', price: 299, plans: [{ label: 'Volunteer Kit', price: 299 }] }
};

// --- 3. COMPONENT ---
function ServiceCheckoutPage({ serviceId, userInfo, setPage, params }) {
  // Determine selected plan from params or default to first
  const service = SERVICE_CONFIG[serviceId] || SERVICE_CONFIG.talim;
  const planIndex = params?.selectedPlanIndex || 0;
  const selectedPlan = service.plans[planIndex] || service.plans[0];

  const [formData, setFormData] = useState({
    name: '',
    email: userInfo?.email || '',
    phone: '',
    address: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Scroll to top on load
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay failed to load. Please check your connection.');
      setIsProcessing(false);
      return;
    }

    // MOCK RAZORPAY OPTIONS
    const options = {
      key: "YOUR_RAZORPAY_TEST_KEY_ID", // 🔴 Replace with actual Test Key
      amount: selectedPlan.price * 100, // paise
      currency: "INR",
      name: "Shivba Organization",
      description: `${service.title} - ${selectedPlan.label}`,
      image: "https://via.placeholder.com/150/FFA500/000000?text=Shivba",
      handler: function (response) {
        // Success
        alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        setPage({ name: 'account' }); // Redirect to dashboard
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: { color: "#FFA500" }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    setIsProcessing(false);
  };

  return (
    <motion.div 
      className="checkout-page"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <style>{`
        .checkout-page {
            max-width: 1200px; margin: 0 auto; padding: 2rem;
            min-height: 80vh; display: flex; align-items: flex-start; justify-content: center;
        }
        .checkout-grid {
            display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; width: 100%;
        }
        @media (max-width: 900px) { .checkout-grid { grid-template-columns: 1fr; } }

        /* Left Column: Form */
        .checkout-form-section {
            background: white; padding: 2.5rem; border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05); border: 1px solid #eee;
        }
        body.dark-mode .checkout-form-section { background: #1e1e1e; border-color: #333; }

        h2 { margin-top: 0; font-family: 'Cinzel', serif; margin-bottom: 1.5rem; }
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        .form-group input, .form-group textarea {
            width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;
            font-family: 'Montserrat', sans-serif; font-size: 1rem;
        }
        body.dark-mode input, body.dark-mode textarea { background: #2a2a2a; border-color: #444; color: white; }
        
        /* Right Column: Summary */
        .order-summary {
            background: #f9fafb; padding: 2rem; border-radius: 12px;
            border: 1px solid #e5e7eb; position: sticky; top: 120px;
        }
        body.dark-mode .order-summary { background: #151515; border-color: #333; }

        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; color: #555; }
        body.dark-mode .summary-row { color: #aaa; }
        .total-row { 
            display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.5rem; 
            border-top: 1px solid #ddd; font-weight: bold; font-size: 1.2rem; color: #1a1a1a; 
        }
        body.dark-mode .total-row { border-color: #333; color: white; }

        .checkout-btn {
            width: 100%; padding: 16px; background: black; color: white; border: none;
            border-radius: 8px; font-weight: 700; text-transform: uppercase; cursor: pointer;
            margin-top: 1.5rem; transition: background 0.3s; letter-spacing: 0.05em;
        }
        .checkout-btn:hover { background: #FFA500; color: black; }
        .checkout-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .secure-badge {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-top: 1rem; font-size: 0.8rem; color: #10b981; font-weight: 600;
        }
        
        .back-link {
            display: inline-block; margin-bottom: 1rem; color: #888; cursor: pointer; text-decoration: underline;
        }
      `}</style>

      <div className="checkout-grid">
        {/* --- LEFT: USER DETAILS --- */}
        <div className="checkout-form-section">
          <span className="back-link" onClick={() => setPage({ name: 'service-detail', params: { id: serviceId } })}>
             &larr; Back to Details
          </span>
          <h2>Billing Details</h2>
          <form id="checkoutForm" onSubmit={handlePayment}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" name="name" required placeholder="Enter your full name"
                value={formData.name} onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" name="email" required placeholder="Enter your email"
                value={formData.email} onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" name="phone" required placeholder="10-digit mobile number"
                value={formData.phone} onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Address (Optional)</label>
              <textarea 
                name="address" rows="2" placeholder="Street area, City..."
                value={formData.address} onChange={handleInputChange}
              ></textarea>
            </div>
          </form>
        </div>

        {/* --- RIGHT: ORDER SUMMARY --- */}
        <div className="order-summary">
          <h3 style={{ marginTop: 0, fontFamily: 'Cinzel, serif', fontSize: '1.4rem' }}>Order Summary</h3>
          
          <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255, 165, 0, 0.1)', borderRadius: '8px', borderLeft: '4px solid #FFA500' }}>
            <strong style={{ display:'block', color: '#d97706' }}>{service.title}</strong>
            <span style={{ fontSize: '0.9rem' }}>Plan: {selectedPlan.label}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{selectedPlan.price}</span>
          </div>
          <div className="summary-row">
            <span>Tax (GST 18% included)</span>
            <span>₹0.00</span>
          </div>
          <div className="summary-row">
            <span>Processing Fee</span>
            <span>FREE</span>
          </div>

          <div className="total-row">
            <span>Total Payable</span>
            <span style={{ color: '#ea580c' }}>₹{selectedPlan.price}</span>
          </div>

          <button 
            type="submit" 
            form="checkoutForm" 
            className="checkout-btn"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${selectedPlan.price}`}
          </button>

          <div className="secure-badge">
            <span>🔒</span> SSL Secure Payment
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: '10px' }}>
            Your personal data will be used to process your order and support your experience.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ServiceCheckoutPage;