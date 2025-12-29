import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 25, stiffness: 500 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

// --- BACKEND API TRIGGER ---
const triggerNotificationAPI = async (email, phone, name) => {
  try {
    // 1. Format Phone Number (Crucial for Twilio/WhatsApp)
    let formattedPhone = phone ? phone.toString().trim() : '';
    
    // Basic clean up (remove spaces/dashes)
    formattedPhone = formattedPhone.replace(/[\s-]/g, '');

    // Add +91 if missing (Assuming India based on context)
    if (formattedPhone && !formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
    }

    console.log(`[Frontend] Requesting WhatsApp notification for: ${name} at ${formattedPhone}`);
    
    const res = await fetch(`${API_BASE_URL}/api/send-welcome-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone: formattedPhone, name })
    });

    if (res.ok) {
        console.log('[Frontend] Notification sent successfully');
    } else {
        console.warn('[Frontend] Notification API returned error status');
    }
    return true;
  } catch (error) {
    console.error("[Frontend] Failed to contact notification server:", error);
    return false; 
  }
};

function VerifyCodePage({ defaultEmail = '', name = '', phone = '', onVerified, setPage }) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  // States for Success/Error
  const [isVerified, setIsVerified] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState('');

  const [resendCountdown, setResendCountdown] = useState(0);
  const codeInputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
    if (codeInputRef.current && !isVerified) codeInputRef.current.focus();
  }, [defaultEmail, isVerified]);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (resendCountdown > 0) interval = setInterval(() => setResendCountdown(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!code || code.length !== 6) return;

    setIsSubmitting(true);
    setMessage('');
    
    try {
      // 1. Verify OTP
      const res = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed.');

      // --- FAILSAFE LOGIC START ---
      let phoneToSend = phone; // Uses the prop passed from RegisterPage
      let nameToSend = name;

      // If phone is missing from props (rare, but possible), fetch from DB
      if (!phoneToSend) {
        console.log("⚠️ Phone missing in props. Fetching from Database...");
        try {
            const profileRes = await fetch(`${API_BASE_URL}/api/members/profile?email=${email}`);
            const profileData = await profileRes.json();
            if (profileRes.ok && profileData.phone) {
                phoneToSend = profileData.phone;
                nameToSend = profileData.name || nameToSend;
                console.log("✅ Fetched phone from DB:", phoneToSend);
            }
        } catch (fetchErr) {
            console.error("Failed to fetch profile for phone number:", fetchErr);
        }
      }

      // 2. Trigger Backend Notification
      if (phoneToSend) {
          // Fire and forget (don't await strictly if you want UI to be snappy, 
          // but awaiting ensures log consistency)
          await triggerNotificationAPI(email, phoneToSend, nameToSend);
      } else {
          console.error("❌ Could not find phone number. WhatsApp message skipped.");
      }
      // --- FAILSAFE LOGIC END ---

      setIsVerified(true); 

    } catch (err) {
      setErrorModalMsg(err.message || 'Invalid Verification Code');
      setShowErrorModal(true);
      setCode(''); 
      setIsSubmitting(false);
      // Refocus after error
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  };

  const handleFinish = () => {
    if (onVerified) onVerified(email);
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setResendCountdown(60); 

    try {
      const payload = { name: name || 'Member', email, phone: phone || '0000000000', password: 'dummy' };
      const res = await fetch(`${API_BASE_URL}/api/register-interest-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok && res.status !== 409 && res.status !== 201) throw new Error('Failed to resend.');
      setMessage('New code sent!');
    } catch (err) {
      setMessage(err.message);
      setResendCountdown(0); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verify-container">
      <style>{`
        /* MAIN CONTAINER (Matching Shivba/App.js Theme) */
        .verify-container { 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: #f3f4f6; 
            font-family: 'Montserrat', sans-serif; 
            position: relative; 
            overflow: hidden; 
            padding: 20px;
        }
        body.dark-mode .verify-container { 
            background: #111; 
        }
        
        /* GLASS CARD */
        .verify-card { 
            background: rgba(255, 255, 255, 0.95); 
            width: 100%; 
            max-width: 450px; 
            padding: 3rem 2rem; 
            border-radius: 20px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.1); 
            text-align: center; 
            border: 1px solid rgba(0,0,0,0.05);
            position: relative; 
            z-index: 10; 
        }
        body.dark-mode .verify-card { 
            background: #1e1e1e; 
            border: 1px solid #333; 
            color: white; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }
        
        /* OTP BOXES */
        .otp-box { 
            width: 50px; 
            height: 60px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            background: #f9fafb; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 1.5rem; 
            font-weight: 600; 
            color: #1a1a1a; 
            transition: all 0.3s;
        }
        .otp-box.active { 
            border-color: #FFA500; 
            transform: translateY(-4px); 
            box-shadow: 0 4px 12px rgba(255, 165, 0, 0.2); 
            background: white;
        }
        .otp-box.filled { 
            background: #fffdf5; /* Light Gold Tint */
            border-color: #eab308; 
        }

        /* Dark Mode OTP Boxes */
        body.dark-mode .otp-box {
            background: #2d2d2d;
            border-color: #444;
            color: white;
        }
        body.dark-mode .otp-box.active {
            border-color: #FFA500;
            background: #222;
        }
        body.dark-mode .otp-box.filled {
            background: rgba(255, 165, 0, 0.1);
            color: #FFA500;
        }
        
        /* BUTTONS */
        .verify-btn { 
            width: 100%; 
            padding: 14px; 
            background: #1a1a1a; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.1em;
            cursor: pointer; 
            margin-top: 25px; 
            font-size: 0.95rem; 
            transition: all 0.3s;
        }
        .verify-btn:hover:not(:disabled) {
            background: #FFA500;
            color: black;
            transform: translateY(-2px);
        }
        .verify-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        body.dark-mode .verify-btn {
            background: #FFA500;
            color: black;
        }
        body.dark-mode .verify-btn:hover:not(:disabled) {
            background: white;
        }
        
        /* MODAL */
        .error-modal-overlay { 
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.6); z-index: 9999; 
            display: flex; align-items: center; justify-content: center; 
            backdrop-filter: blur(4px); 
        }
        .error-modal-content { 
            background: white; padding: 2rem; border-radius: 16px; 
            width: 90%; max-width: 350px; text-align: center; 
            border-top: 5px solid #ef4444; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        body.dark-mode .error-modal-content { background: #1e1e1e; color: white; border: 1px solid #333; border-top: 5px solid #ef4444; }
        
        .retry-btn { 
            background: #ef4444; color: white; border: none; 
            padding: 12px 24px; border-radius: 6px; font-weight: 700; 
            cursor: pointer; width: 100%; margin-top: 15px; 
            text-transform: uppercase; letter-spacing: 0.05em;
        }
        .retry-btn:hover { background: #dc2626; }
      `}</style>
      
      {/* ERROR POPUP */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div className="error-modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowErrorModal(false)}>
            <motion.div className="error-modal-content" variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()}>
              <div style={{fontSize: '3rem', marginBottom: '10px'}}>🚫</div>
              <h3 style={{color: '#ef4444', margin: '0 0 10px 0'}}>Incorrect Code</h3>
              <p>{errorModalMsg}</p>
              <button className="retry-btn" onClick={() => { setShowErrorModal(false); codeInputRef.current?.focus(); }}>Try Again</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="verify-card" variants={cardVariants} initial="hidden" animate="visible">
        
        {!isVerified ? (
            <>
                <div style={{fontSize: '3.5rem', marginBottom: '1rem'}}>🔐</div>
                <h2 style={{ fontFamily: 'Cinzel, serif', marginBottom: '0.5rem' }}>Verify Account</h2>
                <p style={{color: '#888', marginBottom: '2rem', fontSize: '0.9rem'}}>Code sent to <strong>{email}</strong></p>
                
                <form onSubmit={handleSubmit}>
                  <div style={{position: 'relative', marginBottom: '2rem'}}>
                    {/* Invisible Input for Mobile Keyboards */}
                    <input 
                        ref={codeInputRef} 
                        type="text" 
                        value={code} 
                        onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0,6))} 
                        maxLength={6} 
                        style={{position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'text', zIndex: 10}} 
                        autoFocus 
                    />
                    {/* Visual Boxes */}
                    <div style={{display: 'flex', justifyContent: 'center', gap: '8px'}}>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`otp-box ${code[i] ? 'filled' : ''} ${i === code.length ? 'active' : ''}`}>
                            {code[i] || ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {message && <div style={{color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '8px', marginBottom:'15px', fontSize: '0.9rem'}}>{message}</div>}
                  
                  <button type="submit" disabled={isSubmitting || code.length !== 6} className="verify-btn">
                    {isSubmitting ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>

                <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500'}}>
                  <button onClick={() => setPage({name: 'register'})} style={{background:'none', border:'none', cursor:'pointer', color:'#888', textDecoration: 'underline'}}>← Back</button>
                  {resendCountdown === 0 ? 
                    <button onClick={handleResend} style={{background:'none', border:'none', cursor:'pointer', color:'#FFA500', fontWeight:'bold', textTransform:'uppercase'}}>Resend Code</button> : 
                    <span style={{color:'#888'}}>Resend in {resendCountdown}s</span>
                  }
                </div>
            </>
        ) : (
            /* SUCCESS STATE */
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎉</div>
                <h2 style={{color: '#166534', fontFamily: 'Cinzel, serif'}}>Verified!</h2>
                
                <p style={{color: '#666', marginBottom: '1.5rem', fontSize:'0.95rem', lineHeight: '1.6', marginTop: '1rem'}}>
                    Welcome to the <strong>Shivba</strong> family. <br/>
                    We have sent a message to your <strong>WhatsApp</strong> with the exclusive group link.
                </p>

                <button onClick={handleFinish} className="verify-btn" style={{marginTop:'10px'}}>
                    Go to Dashboard
                </button>
            </motion.div>
        )}

      </motion.div>
    </div>
  );
}
export default VerifyCodePage;