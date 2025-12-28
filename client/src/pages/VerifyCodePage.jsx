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
    // 1. Format Phone Number (Crucial for Twilio)
    let formattedPhone = phone ? phone.toString().trim() : '';
    
    // Add +91 if missing
    if (formattedPhone && !formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone;
    }

    console.log(`[Frontend] Requesting WhatsApp notification for: ${name} at ${formattedPhone}`);
    
    const res = await fetch(`${API_BASE_URL}/api/send-welcome-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone: formattedPhone, name })
    });

    const data = await res.json();
    if (res.ok) {
        console.log('[Frontend] Notification sent successfully:', data);
    } else {
        console.warn('[Frontend] Notification failed:', data);
    }
    return true;
  } catch (error) {
    console.error("[Frontend] Failed to contact notification server:", error);
    return false; 
  }
};

function VerifyCodePage({ defaultEmail = '', defaultName = '', defaultPhone = '', onVerified, setPage }) {
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

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
    if (codeInputRef.current && !isVerified) codeInputRef.current.focus();
  }, [defaultEmail, isVerified]);

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
      // Problem: Sometimes defaultPhone is empty if parent didn't pass it.
      // Solution: If empty, fetch user data from DB to get the phone number.
      
      let phoneToSend = defaultPhone;
      let nameToSend = defaultName;

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

      // 2. Trigger Backend Notification with the guaranteed phone number
      if (phoneToSend) {
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
      const payload = { name: defaultName || 'Member', email, phone: defaultPhone || '0000000000', password: 'dummy' };
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
        .verify-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); padding: 20px; font-family: 'Montserrat', sans-serif; position: relative; overflow: hidden; }
        body.dark-mode .verify-container { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); }
        
        .verify-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); width: 100%; max-width: 480px; padding: 3rem 2rem; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); text-align: center; border: 1px solid rgba(255,255,255,0.6); position: relative; z-index: 10; }
        body.dark-mode .verify-card { background: rgba(30,41,59,0.8); border-color: rgba(255,255,255,0.1); color: white; }
        
        .otp-box { width: 50px; height: 60px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: #1a1a1a; }
        .otp-box.active { border-color: #4f46e5; transform: translateY(-4px); box-shadow: 0 4px 12px rgba(79,70,229,0.2); }
        .otp-box.filled { background: #f5f3ff; border-color: #818cf8; }
        
        .verify-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 20px; font-size: 1rem; }
        
        .error-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .error-modal-content { background: white; padding: 2rem; border-radius: 20px; width: 90%; max-width: 350px; text-align: center; border-top: 5px solid #ef4444; }
        body.dark-mode .error-modal-content { background: #1e293b; color: white; }
        
        .retry-btn { background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 15px; }
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
                <h2>Verify Account</h2>
                <p style={{color: '#666', marginBottom: '2rem'}}>Code sent to <strong>{email}</strong></p>
                
                <form onSubmit={handleSubmit}>
                  <div style={{position: 'relative', marginBottom: '2rem'}}>
                    <input ref={codeInputRef} type="text" value={code} onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0,6))} maxLength={6} style={{position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'text', zIndex: 10}} autoFocus />
                    <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`otp-box ${code[i] ? 'filled' : ''} ${i === code.length ? 'active' : ''}`}>{code[i] || ''}</div>
                      ))}
                    </div>
                  </div>
                  {message && <div style={{color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '8px', marginBottom:'15px'}}>{message}</div>}
                  <button type="submit" disabled={isSubmitting || code.length !== 6} className="verify-btn">{isSubmitting ? 'Verifying...' : 'Verify Code'}</button>
                </form>

                <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem'}}>
                  <button onClick={() => setPage({name: 'register'})} style={{background:'none', border:'none', cursor:'pointer', color:'#666'}}>← Back</button>
                  {resendCountdown === 0 ? 
                    <button onClick={handleResend} style={{background:'none', border:'none', cursor:'pointer', color:'#4f46e5', fontWeight:'bold'}}>Resend Code</button> : 
                    <span style={{color:'#888'}}>Resend in {resendCountdown}s</span>
                  }
                </div>
            </>
        ) : (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎉</div>
                <h2 style={{color: '#166534'}}>Verified Successfully!</h2>
                
                <p style={{color: '#555', marginBottom: '1.5rem', fontSize:'0.9rem', lineHeight: '1.6'}}>
                    Welcome to the community! <br/>
                    We have sent a message to your <strong>WhatsApp</strong> and <strong>SMS</strong> with the group join links.
                    <br/><br/>
                    Please check your phone.
                </p>

                <button onClick={handleFinish} className="verify-btn" style={{background:'#1a1a1a', marginTop:'10px'}}>
                    Go to Dashboard
                </button>
            </motion.div>
        )}

      </motion.div>
    </div>
  );
}
export default VerifyCodePage;