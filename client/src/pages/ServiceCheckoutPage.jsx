import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Pricing Structure
const SERVICE_PRICING = {
  talim: {
    title: 'Shivba Talim (General)',
    icon: '🏋️',
    plans: [
      { duration: '1 Month', amount: 1200 },
      { duration: '3 Months', amount: 3000, recommended: true },
      { duration: '6 Months', amount: 5500 },
      { duration: '12 Months', amount: 8000 },
      { duration: '15 Months', amount: 12000 },
    ]
  },
  library: {
    title: 'Shivba Library',
    icon: '📚',
    plans: [
      { duration: '1 Month', amount: 900 },
      { duration: '3 Months', amount: 2500, recommended: true },
      { duration: '6 Months', amount: 5000 },
      { duration: '12 Months', amount: 7000 },
      { duration: '15 Months', amount: 8000 },
    ]
  },
  personal_training: {
    title: 'Personal Training',
    icon: '💪',
    plans: [
      { duration: '1 Month', amount: 6000 },
      { duration: '2 Months', amount: 10000 },
      { duration: '3 Months', amount: 12000, recommended: true },
    ]
  },
  hostel: {
    title: 'Shivba Hostel',
    icon: '🏠',
    plans: [
      { duration: 'Monthly Fee', amount: 2200 }
    ]
  }
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function ServiceCheckoutPage({ serviceId = 'talim', userInfo = {}, setPage }) {
  const serviceCategory = SERVICE_PRICING[serviceId] || SERVICE_PRICING.talim;
  
  // State for Plan
  const [selectedPlan, setSelectedPlan] = useState(serviceCategory.plans[0]);
  
  // State for User Details (Editable form state)
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  // 1. Reset plan when service changes
  useEffect(() => {
     setSelectedPlan(serviceCategory.plans[0]);
  }, [serviceId, serviceCategory]);

  // 2. ATTEMPT TO AUTO-FILL (But don't block if fails)
  // This just makes it easier for returning users, but allows guests too.
  useEffect(() => {
    const fetchUserSession = async () => {
      let emailToCheck = userInfo.email;
      if (!emailToCheck) emailToCheck = localStorage.getItem('shivba_user_email');

      if (!emailToCheck) return; // No saved user, just leave form blank

      try {
        const response = await fetch(`${API_BASE_URL}/account/find`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToCheck })
        });
        
        const data = await response.json();

        if (response.ok) {
          setUserData({
            name: data.fullName || data.name || '',
            email: data.email || '',
            phone: data.mobileNumber || data.phone || ''
          });
        }
      } catch (err) {
        console.warn("Could not auto-fill user details. User can type manually.");
      }
    };

    fetchUserSession();
  }, [userInfo.email]);

  // Handle Input Changes (For Guest Users)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleBack = () => {
    setPage({ name: 'service-detail', params: { id: serviceId } });
  };

  const handlePayNow = async () => {
    try {
      setError('');

      // VALIDATION: Ensure fields are filled before paying
      if (!userData.name || !userData.email || !userData.phone) {
        throw new Error('Please fill in your Name, Email, and Phone Number.');
      }

      setIsPaying(true);

      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Unable to load Razorpay. Check your internet connection.');

      const createRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedPlan.amount * 100 }) 
      });

      const order = await createRes.json();
      if (!createRes.ok) throw new Error(order.message || 'Failed to create Razorpay order.');

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Shivba',
        description: `${serviceCategory.title} - ${selectedPlan.duration}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                registrationData: {
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  eventName: serviceCategory.title,
                  planDuration: selectedPlan.duration,
                  amount: selectedPlan.amount
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.signatureIsValid) {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }

            alert('Payment successful! Welcome to Shivba.');
            setPage({ name: 'account' });
          } catch (err) {
            alert(err.message);
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone
        },
        theme: { color: '#fd7e14' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      <style>{`
        .shivba-gradient {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        }
        .plan-card {
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid #dee2e6;
        }
        .plan-card:hover {
          border-color: #fd7e14;
          background-color: #fff7ed;
        }
        .plan-card.active {
          border-color: #fd7e14;
          background-color: #fff7ed;
          box-shadow: 0 4px 6px rgba(253, 126, 20, 0.2);
          transform: translateY(-2px);
        }
        .btn-shivba-dark {
          background-color: #212529;
          color: white;
          border: none;
        }
        .btn-shivba-dark:hover {
          background-color: #000;
          color: white;
        }
        .form-control:focus {
          border-color: #fd7e14;
          box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
        }
      `}</style>

      <div className="container py-5 min-vh-100 d-flex align-items-center justify-content-center animate-fadeIn">
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '900px', width: '100%' }}>
          <div className="row g-0">
            
            {/* --- Left Column: Summary & Gradient --- */}
            <div className="col-lg-5 shivba-gradient text-white p-5 d-flex flex-column justify-content-between relative">
              <div>
                <button onClick={handleBack} className="btn btn-link text-white text-decoration-none p-0 mb-4 fw-bold">
                  <i className="bi bi-arrow-left me-2"></i> Back
                </button>
                
                <div className="display-3 mb-3">{serviceCategory.icon || '✨'}</div>
                <h2 className="fw-bold mb-3">{serviceCategory.title}</h2>
                <p className="text-white-50 small">
                  Complete your registration to access world-class facilities and join the Shivba community.
                </p>
              </div>

              <div className="mt-4 pt-4 border-top border-white-50">
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <span className="text-white-50 text-uppercase small d-block mb-1">Total Payable</span>
                    <h1 className="fw-bold m-0">₹{selectedPlan.amount}</h1>
                  </div>
                  <div className="text-end">
                    <span className="text-white-50 small d-block">Duration</span>
                    <span className="fw-bold fs-5">{selectedPlan.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Right Column: Form & Selection --- */}
            <div className="col-lg-7 bg-white p-5">
              
              {/* Step 1: Plan Selection */}
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
                  <span className="badge rounded-circle bg-warning text-dark me-2 d-flex align-items-center justify-content-center" style={{width:'30px', height:'30px'}}>1</span>
                  Select Your Plan
                </h5>

                <div className="row g-3">
                  {serviceCategory.plans.map((plan, index) => {
                    const isSelected = selectedPlan.duration === plan.duration;
                    return (
                      <div className="col-6 col-md-4" key={index}>
                        <div 
                          className={`card plan-card h-100 text-center py-3 px-2 ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          {plan.recommended && (
                            <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success" style={{fontSize: '0.65rem'}}>
                              BEST VALUE
                            </span>
                          )}
                          <div className="card-body p-0">
                            <small className={`d-block fw-bold mb-1 ${isSelected ? 'text-warning' : 'text-muted'}`}>
                              {plan.duration}
                            </small>
                            <h5 className="card-title fw-bold m-0 text-dark">₹{plan.amount}</h5>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Enter Details (Guest or Logged In) */}
              <div className="mb-4">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                  <span className="badge rounded-circle bg-warning text-dark me-2 d-flex align-items-center justify-content-center" style={{width:'30px', height:'30px'}}>2</span>
                  Enter Your Details
                </h5>
                
                <div className="bg-light p-4 rounded-3 border">
                    <div className="mb-3">
                        <label className="form-label small text-muted fw-bold">Full Name</label>
                        <input 
                            type="text" 
                            className="form-control border-0 shadow-sm"
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Rahul Patil"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small text-muted fw-bold">Email Address</label>
                        <input 
                            type="email" 
                            className="form-control border-0 shadow-sm"
                            name="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            placeholder="e.g. rahul@example.com"
                        />
                    </div>
                    <div className="mb-0">
                        <label className="form-label small text-muted fw-bold">Phone Number</label>
                        <input 
                            type="tel" 
                            className="form-control border-0 shadow-sm"
                            name="phone"
                            value={userData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. 9876543210"
                        />
                    </div>
                    
                    <div className="d-flex justify-content-between border-top pt-3 mt-3">
                      <span className="text-muted small">Selected Service</span>
                      <span className="fw-bold text-warning small">{serviceCategory.title} ({selectedPlan.duration})</span>
                    </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-shivba-dark py-3 fw-bold shadow-sm" 
                  onClick={handlePayNow}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
                  ) : (
                    <span>Pay Securely <span className="badge bg-light text-dark ms-2">₹{selectedPlan.amount}</span></span>
                  )}
                </button>
              </div>

              <div className="text-center mt-3">
                <small className="text-muted d-flex align-items-center justify-content-center">
                  <i className="bi bi-shield-lock-fill me-1"></i> SSL Secured Payment via Razorpay
                </small>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServiceCheckoutPage;