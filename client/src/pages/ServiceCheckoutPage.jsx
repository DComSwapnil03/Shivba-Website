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

    const RAZORPAY_KEY = import.meta.env?.VITE_RAZORPAY_KEY_ID || process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!RAZORPAY_KEY || RAZORPAY_KEY.includes("YOUR_RAZORPAY")) {
        alert("🚨 Razorpay Key is missing. Check .env file.");
        setIsProcessing(false);
        return;
    }

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay failed to load.');
      setIsProcessing(false);
      return;
    }

    try {
      const registrationData = {
        name: formData.name, email: formData.email, phone: formData.phone,
        eventName: service.title, planDuration: currentPlanLabel,
        amount: finalPrice * 100 
      };

      const orderResponse = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPrice * 100 })
      });
      
      const orderData = await orderResponse.json();

      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount, 
        currency: orderData.currency,
        order_id: orderData.id, 
        name: "Shivba",
        description: `${service.title} - ${currentPlanLabel}`,
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
              alert("Verification failed.");
              setIsProcessing(false);
            }
          } catch (err) {
            alert("Error updating account.");
            setIsProcessing(false);
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: "#ea580c" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* --- GLOBAL --- */
        .checkout-page { max-width: 1200px; margin: 0 auto; padding: 2rem; min-height: 80vh; transition: background 0.3s; }
        .checkout-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; width: 100%; }
        @media (max-width: 900px) { .checkout-grid { grid-template-columns: 1fr; } }

        /* --- FORMS & CARDS --- */
        .checkout-form-section { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border: 1px solid #eee; transition: all 0.3s; }
        h2, h3 { font-family: 'Cinzel', serif; color: #1a1a1a; transition: color 0.3s; }
        
        .form-group { margin-bottom: 1.2rem; text-align: left; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #444; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Montserrat'; font-size: 1rem; background: #fff; color: #333; }

        .plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-bottom: 1.5rem; }
        .plan-card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; cursor: pointer; text-align: center; background: #fafafa; transition: 0.3s; color: #555; }
        .plan-card.active { border-color: #ea580c; background: #fff7ed; color: #ea580c; font-weight: bold; }

        .month-counter { display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem; background: #f1f1f1; padding: 12px; border-radius: 8px; width: fit-content; }
        .counter-btn { width: 35px; height: 35px; border-radius: 50%; border: 1px solid #ccc; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        /* --- SUMMARY --- */
        .order-summary { background: #f9fafb; padding: 2rem; border-radius: 12px; border: 1px solid #e5e7eb; position: sticky; top: 120px; transition: all 0.3s; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #555; font-size: 0.95rem; }
        .total-row { display: flex; justify-content: space-between; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #ddd; font-weight: bold; font-size: 1.3rem; color: #1a1a1a; }
        
        .checkout-btn { width: 100%; padding: 18px; background: #1a1a1a; color: white; border: none; border-radius: 8px; font-weight: 700; text-transform: uppercase; cursor: pointer; margin-top: 1.5rem; transition: 0.3s; }
        .checkout-btn:hover { background: #ea580c; }
        .back-link { color: #888; cursor: pointer; text-decoration: underline; margin-bottom: 1rem; display: inline-block; }

        /* ================================================= */
        /* --- DARK MODE OVERRIDES (THE CRITICAL FIX) --- */
        /* ================================================= */
        
        body.dark-mode .checkout-form-section { background: #1e1e1e; border-color: #333; }
        body.dark-mode h2, body.dark-mode h3 { color: #ffffff; }
        body.dark-mode .form-group label { color: #ccc; }
        body.dark-mode .form-group input, body.dark-mode .form-group textarea { background: #2a2a2a; border-color: #444; color: #fff; }
        
        body.dark-mode .plan-card { background: #2a2a2a; border-color: #444; color: #bbb; }
        body.dark-mode .plan-card:hover { background: #333; }
        body.dark-mode .plan-card.active { background: #4d2a1a; border-color: #ea580c; color: #ffa500; }
        
        body.dark-mode .month-counter { background: #2a2a2a; }
        body.dark-mode .counter-btn { background: #333; border-color: #444; color: #fff; }
        body.dark-mode .month-val { color: #fff; }

        body.dark-mode .order-summary { background: #151515; border-color: #333; }
        body.dark-mode .summary-row { color: #aaa; }
        body.dark-mode .total-row { border-color: #333; color: #fff; }
        body.dark-mode .checkout-btn { background: #ea580c; color: #fff; }

        /* Success Popup */
        .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .success-box { background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 450px; width: 90%; }
        body.dark-mode .success-box { background: #1e1e1e; border: 1px solid #333; }
        body.dark-mode .success-box p { color: #ccc; }
      `}</style>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="success-overlay">
            <motion.div className="success-box" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <span style={{fontSize: '4rem'}}>🎉</span>
              <h2>Payment Successful!</h2>
              <p>You have successfully joined <strong>{service.title}</strong>.</p>
              <a href={GROUP_LINKS[serviceId]} target="_blank" rel="noreferrer" style={{background: '#25D366', color: 'white', padding: '15px 30px', borderRadius: '50px', display: 'inline-block', fontWeight: 'bold', textDecoration: 'none', marginTop: '20px'}}>
                Join WhatsApp Group
              </a>
              <p onClick={() => setPage({ name: 'account' })} style={{marginTop: '20px', textDecoration: 'underline', cursor: 'pointer', color: '#888'}}>Go to Dashboard</p>
            </motion.div>
          </div>
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
                <label className="form-group label">Select Rent Duration</label>
                <div className="month-counter">
                    <button className="counter-btn" onClick={() => setHostelMonths(Math.max(1, hostelMonths - 1))}>−</button>
                    <div className="month-val" style={{fontWeight: 'bold', width: '80px', textAlign: 'center'}}>{hostelMonths} Month{hostelMonths > 1 ? 's' : ''}</div>
                    <button className="counter-btn" onClick={() => setHostelMonths(Math.min(12, hostelMonths + 1))}>+</button>
                </div>
             </div>
          ) : (
             serviceId !== 'social' && (
                 <div style={{marginBottom:'2rem'}}>
                    <h3 style={{fontSize:'1rem', marginBottom:'10px'}}>Choose Plan Duration</h3>
                    <div className="plan-grid">
                        {service.plans.map((plan, idx) => (
                            <div key={idx} className={`plan-card ${selectedPlanIdx === idx ? 'active' : ''}`} onClick={() => setSelectedPlanIdx(idx)}>
                                <span style={{display:'block', fontSize:'0.8rem'}}>{plan.label}</span>
                                <strong>₹{plan.price}</strong>
                                {plan.save && <span style={{display:'block', fontSize:'0.6rem', color:'#16a34a'}}>{plan.save}</span>}
                            </div>
                        ))}
                    </div>
                 </div>
             )
          )}

          <form id="checkoutForm" onSubmit={handlePayment}>
            <h3>Billing Information</h3>
            <div className="form-group"><label>Full Name</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Email Address</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Address</label><textarea name="address" rows="2" value={formData.address} onChange={handleInputChange}></textarea></div>
          </form>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div style={{ padding: '15px', background: 'rgba(234, 88, 12, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ea580c', margin: '20px 0' }}>
            <strong style={{color: '#ea580c'}}>{service.title}</strong>
            <p style={{margin: '5px 0 0', fontSize: '0.9rem'}}>{currentPlanLabel}</p>
            {bookingSlot && <p style={{fontSize: '0.8rem', color: '#888'}}>Slot: {bookingSlot.id}</p>}
          </div>

          <div className="summary-row"><span>Cost</span><span>₹{finalPrice}</span></div>
          <div className="summary-row"><span>GST (included)</span><span>₹0.00</span></div>
          <div className="total-row"><span>Total</span><span>₹{finalPrice}</span></div>

          <button type="submit" form="checkoutForm" className="checkout-btn" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay ₹${finalPrice}`}
          </button>
          <p style={{fontSize: '0.7rem', textAlign: 'center', marginTop: '15px', color: '#10b981'}}>🔒 Secure SSL Encrypted Payment</p>
        </div>
      </div>
    </motion.div>
  );
}

export default ServiceCheckoutPage;