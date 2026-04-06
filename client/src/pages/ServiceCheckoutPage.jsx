import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// --- 2. CONFIG DATA ---
const SERVICE_CONFIG = {
  talim: { 
    title: 'Shivba Talim', 
    price: 1200, 
    plans: [
      { label: '1 Month', price: 1200 }, 
      { label: '3 Months', price: 3000, save: 'Save ₹600' }, 
      { label: '6 Months', price: 5500, save: 'Save ₹1700' }, 
      { label: '1 Year', price: 8000, save: 'Save ₹6400' }
    ] 
  },
  library: { 
    title: 'Shivba Library', 
    price: 900, 
    plans: [
      { label: '1 Month', price: 900 }, 
      { label: '3 Months', price: 2500, save: 'Save ₹200' }, 
      { label: '6 Months', price: 5000, save: 'Save ₹400' }, 
      { label: '1 Year', price: 7000, save: 'Save ₹3800' }
    ] 
  },
  hostel: { 
    title: 'Shivba Hostel', 
    price: 2499, 
    plans: [{ label: 'Monthly Rent', price: 2499 }] 
  },
  social: { 
    title: 'Social Awareness', 
    price: 299, 
    plans: [{ label: 'Volunteer Kit', price: 299 }] 
  }
};

const GROUP_LINKS = {
    talim: 'https://chat.whatsapp.com/E5d123TalimGroupLink',
    library: 'https://chat.whatsapp.com/L8a456LibraryGroupLink',
    hostel: 'https://chat.whatsapp.com/H9b789HostelGroupLink',
    social: 'https://chat.whatsapp.com/S1c012SocialGroupLink'
};

// ==========================================
// API CONFIGURATION
// ==========================================
const API_BASE_URL = 'http://localhost:5000'; 

// --- 3. COMPONENT ---
function ServiceCheckoutPage({ serviceId, userInfo, setPage, params }) {
  const service = SERVICE_CONFIG[serviceId] || SERVICE_CONFIG.talim;
  const bookingSlot = params?.bookingSlot; 

  const [selectedPlanIdx, setSelectedPlanIdx] = useState(params?.selectedPlanIndex || 0);
  const [hostelMonths, setHostelMonths] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: userInfo?.email || '', phone: '', address: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const isHostel = serviceId === 'hostel';
  const currentPlanLabel = isHostel 
    ? `${hostelMonths} Month${hostelMonths > 1 ? 's' : ''} Rent`
    : service.plans[selectedPlanIdx].label;

  const finalPrice = isHostel
    ? service.plans[0].price * hostelMonths
    : service.plans[selectedPlanIdx].price;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // DYNAMIC KEY CHECK - Tries Vite, then CRA.
    // If you are completely stuck, replace this entire line with: const RAZORPAY_KEY = "rzp_test_YOUR_ACTUAL_KEY_HERE";
    const RAZORPAY_KEY = import.meta.env?.VITE_RAZORPAY_KEY_ID || process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!RAZORPAY_KEY || RAZORPAY_KEY.includes("YOUR_RAZORPAY")) {
        alert("🚨 FATAL ERROR: Your Razorpay Key is missing or invalid in your frontend code. Razorpay cannot open. Check your .env file.");
        setIsProcessing(false);
        return;
    }

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay failed to load. Check your internet connection.');
      setIsProcessing(false);
      return;
    }

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventName: service.title, 
        planDuration: currentPlanLabel,
        amount: finalPrice * 100 
      };

      const orderResponse = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPrice * 100 })
      });
      
      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.id) {
        throw new Error(orderData.message || 'Failed to generate secure Order ID from backend.');
      }

      const options = {
        key: RAZORPAY_KEY, // This is now strictly validated
        amount: orderData.amount, 
        currency: orderData.currency,
        order_id: orderData.id, 
        name: "Shivba",
        description: `${service.title} - ${currentPlanLabel}`,
        image: "https://via.placeholder.com/150/FFA500/000000?text=SHIVBA",
        
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    registrationData: registrationData
                })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.signatureIsValid) {
              setIsProcessing(false);
              setShowSuccessModal(true); 
            } else {
              alert("Security Error: Payment verification failed on the server.");
              setIsProcessing(false);
            }
          } catch (err) {
            console.error("Backend verification error:", err);
            alert("Your payment went through, but we failed to update your account. Please contact Shivba support.");
            setIsProcessing(false);
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: "#ea580c" }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        console.error(response.error);
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      paymentObject.on('modal.closed', function() {
          setIsProcessing(false);
      });

      paymentObject.open();

    } catch (error) {
      console.error("Checkout Error:", error);
      alert(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      className="checkout-page"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <style>{`
        .checkout-page { max-width: 1200px; margin: 0 auto; padding: 2rem; min-height: 80vh; display: flex; align-items: flex-start; justify-content: center; }
        .checkout-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; width: 100%; }
        @media (max-width: 900px) { .checkout-grid { grid-template-columns: 1fr; } }
        .checkout-form-section { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border: 1px solid #eee; }
        body.dark-mode .checkout-form-section { background: #1e1e1e; border-color: #333; }
        h2 { margin-top: 0; font-family: 'Cinzel', serif; margin-bottom: 1.5rem; }
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: 'Montserrat', sans-serif; font-size: 1rem; }
        body.dark-mode input, body.dark-mode textarea { background: #2a2a2a; border-color: #444; color: white; }
        .plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-bottom: 1.5rem; }
        .plan-card { border: 1px solid #ddd; padding: 10px; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.2s; background: #fafafa; }
        .plan-card:hover { background: #f0f0f0; }
        .plan-card.active { border-color: #ea580c; background: #fff7ed; color: #ea580c; font-weight: bold; box-shadow: 0 0 0 1px #ea580c; }
        .plan-label { font-size: 0.85rem; display: block; margin-bottom: 4px; }
        .plan-price { font-size: 1rem; font-weight: 700; }
        .plan-save { font-size: 0.65rem; color: #16a34a; font-weight: 600; display: block; margin-top: 2px; }
        .month-counter { display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem; background: #f9f9f9; padding: 15px; border-radius: 8px; width: fit-content; }
        .counter-btn { width: 35px; height: 35px; border-radius: 50%; border: 1px solid #ccc; background: white; cursor: pointer; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .counter-btn:hover { background: #ea580c; color: white; border-color: #ea580c; }
        .month-val { font-size: 1.1rem; font-weight: bold; min-width: 80px; text-align: center; }
        .order-summary { background: #f9fafb; padding: 2rem; border-radius: 12px; border: 1px solid #e5e7eb; position: sticky; top: 120px; }
        body.dark-mode .order-summary { background: #151515; border-color: #333; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem; color: #555; }
        body.dark-mode .summary-row { color: #aaa; }
        .total-row { display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd; font-weight: bold; font-size: 1.2rem; color: #1a1a1a; }
        body.dark-mode .total-row { border-color: #333; color: white; }
        .checkout-btn { width: 100%; padding: 16px; background: black; color: white; border: none; border-radius: 8px; font-weight: 700; text-transform: uppercase; cursor: pointer; margin-top: 1.5rem; transition: background 0.3s; letter-spacing: 0.05em; }
        .checkout-btn:hover { background: #ea580c; color: white; }
        .checkout-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .back-link { display: inline-block; margin-bottom: 1rem; color: #888; cursor: pointer; text-decoration: underline; }
        .success-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .success-box { background: white; width: 90%; max-width: 450px; padding: 40px; border-radius: 20px; text-align: center; position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .success-icon { font-size: 4rem; margin-bottom: 20px; display: block; }
        .wa-btn { background: #25D366; color: white; padding: 15px 30px; border: none; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; margin-top: 20px; box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3); text-decoration: none; }
        .wa-btn:hover { background: #20bd5a; transform: translateY(-3px); }
        .dashboard-link { display: block; margin-top: 20px; color: #888; font-size: 0.9rem; text-decoration: underline; cursor: pointer; }
      `}</style>

      {/* --- SUCCESS MODAL --- */}
      <AnimatePresence>
        {showSuccessModal && (
            <motion.div 
                className="success-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <motion.div 
                    className="success-box"
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                >
                    <span className="success-icon">🎉</span>
                    <h2 style={{color: '#1a1a1a', marginBottom:'10px'}}>Payment Successful!</h2>
                    <p style={{color:'#666', lineHeight:1.6}}>
                        You have successfully joined <strong>{service.title}</strong>. <br/>
                        Your account has been updated and a confirmation message has been sent to your mobile.
                    </p>
                    
                    <a 
                        href={GROUP_LINKS[serviceId]} 
                        target="_blank" 
                        rel="noreferrer"
                        className="wa-btn"
                    >
                        <span>Join {service.title.split(' ')[1]} WhatsApp Group</span>
                    </a>

                    <span className="dashboard-link" onClick={() => setPage({ name: 'account' })}>
                        Go to My Dashboard
                    </span>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="checkout-grid">
        <div className="checkout-form-section">
          <span className="back-link" onClick={() => setPage({ name: 'service-detail', params: { id: serviceId } })}>
             &larr; Back to Details
          </span>
          
          <h2>{service.title} Checkout</h2>

          {isHostel ? (
             <div style={{marginBottom:'2rem'}}>
                <h3 style={{fontSize:'1rem', marginBottom:'10px', color:'#555'}}>Select Duration</h3>
                <div className="month-counter">
                    <button className="counter-btn" type="button" onClick={() => setHostelMonths(Math.max(1, hostelMonths - 1))}>−</button>
                    <div className="month-val">{hostelMonths} Month{hostelMonths > 1 ? 's' : ''}</div>
                    <button className="counter-btn" type="button" onClick={() => setHostelMonths(Math.min(12, hostelMonths + 1))}>+</button>
                </div>
                <p style={{fontSize:'0.85rem', color:'#ea580c'}}>₹{service.plans[0].price} per month</p>
             </div>
          ) : (
             serviceId !== 'social' && (
                 <div style={{marginBottom:'2rem'}}>
                    <h3 style={{fontSize:'1rem', marginBottom:'10px', color:'#555'}}>Choose Plan Duration</h3>
                    <div className="plan-grid">
                        {service.plans.map((plan, idx) => (
                            <div 
                                key={idx} 
                                className={`plan-card ${selectedPlanIdx === idx ? 'active' : ''}`}
                                onClick={() => setSelectedPlanIdx(idx)}
                            >
                                <span className="plan-label">{plan.label}</span>
                                <span className="plan-price">₹{plan.price}</span>
                                {plan.save && <span className="plan-save">{plan.save}</span>}
                            </div>
                        ))}
                    </div>
                 </div>
             )
          )}

          <form id="checkoutForm" onSubmit={handlePayment}>
            <h3 style={{fontSize:'1.1rem', marginBottom:'1rem', fontFamily:'Cinzel, serif'}}>Billing Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" required placeholder="Enter your full name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" required placeholder="Enter your email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" required placeholder="10-digit mobile number" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Address (Optional)</label>
              <textarea name="address" rows="2" placeholder="Street area, City..." value={formData.address} onChange={handleInputChange}></textarea>
            </div>
          </form>
        </div>

        <div className="order-summary">
          <h3 style={{ marginTop: 0, fontFamily: 'Cinzel, serif', fontSize: '1.4rem' }}>Order Summary</h3>
          
          <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255, 165, 0, 0.1)', borderRadius: '8px', borderLeft: '4px solid #FFA500' }}>
            <strong style={{ display:'block', color: '#d97706' }}>{service.title}</strong>
            <span style={{ fontSize: '0.9rem' }}>{currentPlanLabel}</span>
            {bookingSlot && (
                <div style={{ marginTop:'8px', paddingTop:'8px', borderTop:'1px dashed #d97706', fontSize:'0.85rem', color:'#ea580c', fontWeight:'bold' }}>
                    Reserved: {bookingSlot.id}
                </div>
            )}
          </div>

          <div className="summary-row">
            <span>Duration Cost</span>
            <span>₹{finalPrice}</span>
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
            <span style={{ color: '#ea580c' }}>₹{finalPrice}</span>
          </div>

          <button type="submit" form="checkoutForm" className="checkout-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay ₹${finalPrice}`}
          </button>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'1rem', fontSize:'0.8rem', color:'#10b981', fontWeight:600 }}>
            <span>🔒</span> SSL Secure Payment
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ServiceCheckoutPage;