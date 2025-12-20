import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

// --- 1. ANIMATION VARIANTS ---
// Merged 'shake' into the main variants object so it works with the 'animate' prop
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" } 
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

function VerifyCodePage({ defaultEmail = '', defaultName = '', defaultPhone = '', onVerified, setPage }) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const codeInputRef = useRef(null);

  // Auto-focus & Timer
  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
    if (codeInputRef.current) codeInputRef.current.focus();
  }, [defaultEmail]);

  useEffect(() => {
    let interval;
    if (resendCountdown > 0) {
      interval = setInterval(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!code || code.length !== 6) return;

    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code.trim() })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Verification failed.');

      setMessage('Verified! Redirecting...');
      setMessageType('success');

      setTimeout(() => {
        if (onVerified) onVerified(email);
      }, 1500);

    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
      setCode('');
      if (codeInputRef.current) codeInputRef.current.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setResendCountdown(60); 

    try {
      const payload = {
        name: defaultName || 'Member',
        email, 
        phone: defaultPhone || '0000000000',
        password: 'dummy' 
      };

      const res = await fetch(`${API_BASE_URL}/api/register-interest-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok && res.status !== 409) {
         if(res.status !== 201) throw new Error(data.message || 'Failed to resend code.');
      }

      setMessage('New code sent!');
      setMessageType('success');
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
      setResendCountdown(0); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.length === 6) handleSubmit(e);
  };

  return (
    <div className="verify-container">
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .verify-container {
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Montserrat', sans-serif;
            background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
            padding: 20px;
            position: relative;
            overflow: hidden;
        }
        body.dark-mode .verify-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }

        /* Abstract Background Shapes */
        .blob {
            position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; z-index: 0;
        }
        .blob-1 { top: -10%; left: -10%; width: 400px; height: 400px; background: #818cf8; }
        .blob-2 { bottom: -10%; right: -10%; width: 300px; height: 300px; background: #c084fc; }

        .verify-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            width: 100%; max-width: 480px;
            padding: 3rem 2rem;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            text-align: center;
            border: 1px solid rgba(255,255,255,0.6);
            position: relative; z-index: 10;
        }
        body.dark-mode .verify-card {
            background: rgba(30, 41, 59, 0.8); border-color: rgba(255,255,255,0.1); color: white;
        }

        .verify-icon { font-size: 3.5rem; margin-bottom: 1rem; display: inline-block; }
        .verify-title {
            font-family: 'Cinzel', serif; font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a1a;
        }
        body.dark-mode .verify-title { color: white; }
        .verify-subtitle { color: #666; font-size: 0.95rem; margin-bottom: 2rem; }
        body.dark-mode .verify-subtitle { color: #aaa; }
        .highlight-email { font-weight: 600; color: #4f46e5; background: rgba(79, 70, 229, 0.1); padding: 2px 8px; border-radius: 4px; }

        /* OTP Input Styling */
        .otp-container { position: relative; margin-bottom: 2rem; }
        .input-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 10px; display: block; letter-spacing: 0.1em; }
        
        .otp-real-input {
            position: absolute; opacity: 0; width: 100%; height: 100%; top: 0; left: 0; cursor: text; z-index: 10;
        }
        .otp-visuals { display: flex; justify-content: center; gap: 10px; }
        .otp-box {
            width: 50px; height: 60px;
            border: 2px solid #e5e7eb; border-radius: 12px;
            background: white;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; font-weight: bold; color: #1a1a1a;
            transition: all 0.2s ease;
        }
        body.dark-mode .otp-box { background: #1e293b; border-color: #334155; color: white; }
        
        .otp-box.active {
            border-color: #4f46e5; transform: translateY(-4px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .otp-box.filled { background: #f5f3ff; border-color: #818cf8; }
        body.dark-mode .otp-box.filled { background: #312e81; border-color: #6366f1; }

        /* Buttons & Feedback */
        .verify-btn {
            width: 100%; padding: 14px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white; border: none; border-radius: 12px;
            font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
            cursor: pointer; transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }
        .verify-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5); }
        .verify-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; background: #ccc; }

        .status-msg { margin-bottom: 1.5rem; padding: 10px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; }
        .status-msg.error { background: #fee2e2; color: #991b1b; }
        .status-msg.success { background: #dcfce7; color: #166534; }

        .verify-footer { margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
        .back-link { background: none; border: none; color: #666; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 600; }
        body.dark-mode .back-link { color: #aaa; }
        .back-link:hover { color: #1a1a1a; }
        
        .resend-btn { background: none; border: none; color: #4f46e5; font-weight: 700; cursor: pointer; }
        .resend-btn:hover { text-decoration: underline; }
        .resend-timer { color: #888; font-variant-numeric: tabular-nums; }

      `}</style>

      {/* --- BACKGROUND BLOBS --- */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <AnimatePresence mode="wait">
        <motion.div 
          key="card"
          className="verify-card"
          variants={cardVariants} // Updated: Uses single variants object
          initial="hidden"
          animate={messageType === 'error' ? "shake" : "visible"}
          exit="exit"
        >
          {/* Header */}
          <div className="verify-header">
            <div className="verify-icon">🔐</div>
            <h2 className="verify-title">Verify Account</h2>
            <p className="verify-subtitle">
              We sent a 6-digit code to<br/>
              <span className="highlight-email">{email || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* OTP Code Input */}
            <div className="otp-container">
              <label className="input-label">Enter Verification Code</label>
              
              <div style={{ position: 'relative' }}>
                <input
                  ref={codeInputRef}
                  type="text"
                  value={code}
                  onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setCode(val);
                  }}
                  onKeyDown={handleKeyPress}
                  maxLength={6}
                  className="otp-real-input"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
                
                <div className="otp-visuals">
                  {[...Array(6)].map((_, idx) => (
                    <div 
                      key={idx}
                      className={`otp-box ${code[idx] ? 'filled' : ''} ${idx === code.length ? 'active' : ''}`}
                    >
                      {code[idx] || ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {message && (
              <motion.div 
                className={`status-msg ${messageType}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="verify-btn"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          {/* Footer Actions */}
          <div className="verify-footer">
            <button onClick={() => setPage({ name: 'register' })} className="back-link">
              ← Back
            </button>

            {resendCountdown === 0 ? (
              <button onClick={handleResend} className="resend-btn">
                Resend Code
              </button>
            ) : (
              <span className="resend-timer">
                Resend in {resendCountdown}s
              </span>
            )}
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default VerifyCodePage;