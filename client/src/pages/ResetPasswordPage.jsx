import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const inputVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100 } 
  }
};

function ResetPasswordPage({ setPage }) {
  // --- STATE ---
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  
  // --- INITIALIZE FROM URL ---
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token'); 
    const urlEmail = searchParams.get('email');

    if (urlToken) setOtp(urlToken);
    if (urlEmail) setEmail(urlEmail);
  }, []);

  // --- HANDLER: BACK TO LOGIN ---
  const handleBack = () => {
    if (setPage) {
        setPage({ name: 'account' }); // Swaps back to Login/Register view
    } else {
        window.location.href = '/login'; // Fallback
    }
  };

  // --- HANDLER: SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!email) {
        setStatus('error'); setMessage('Email is missing.'); return;
    }
    if (!otp) {
        setStatus('error'); setMessage('Please enter the verification code.'); return;
    }
    if (!newPassword || newPassword.length < 6) {
      setStatus('error'); setMessage('Password must be at least 6 characters.'); return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error'); setMessage('Passwords do not match.'); return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email.trim(),
            otp: otp.trim(),
            newPassword 
        }),
      });

      const ct = res.headers.get('content-type') || '';
      let data;
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || `Server error: ${res.status}` };
      }

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset successful.');
        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          handleBack();
        }, 2000);
      } else {
        throw new Error(data.message || 'Request failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Unexpected error');
    }
  };

  return (
    <div className="reset-container">
      {/* --- CSS STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .reset-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); padding: 20px; }
        body.dark-mode .reset-container { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); }
        .reset-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); width: 100%; max-width: 450px; padding: 3rem; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); text-align: center; border: 1px solid rgba(255,255,255,0.5); position: relative; }
        body.dark-mode .reset-card { background: rgba(30, 41, 59, 0.9); border-color: rgba(255,255,255,0.1); color: white; }
        .reset-icon { font-size: 3rem; margin-bottom: 1rem; display: inline-block; }
        .reset-card h2 { font-family: 'Cinzel', serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #1a1a1a; }
        body.dark-mode .reset-card h2 { color: white; }
        .input-group { position: relative; margin-bottom: 1.2rem; text-align: left; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 5px; }
        body.dark-mode .input-label { color: #aaa; }
        .reset-input { width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #ddd; font-size: 1rem; background: #f9fafb; transition: all 0.3s; }
        .reset-input:focus { border-color: #FFA500; background: white; outline: none; }
        body.dark-mode .reset-input { background: #0f172a; border-color: #334155; color: white; }
        .eye-btn { position: absolute; right: 12px; top: 32px; background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #999; }
        .reset-btn { width: 100%; padding: 14px; background: #1a1a1a; color: white; border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase; cursor: pointer; margin-top: 1rem; transition: 0.3s; }
        .reset-btn:hover:not(:disabled) { background: #FFA500; color: black; }
        
        /* BACK BUTTON STYLES */
        .back-btn { background: none; border: none; color: #666; font-size: 0.9rem; margin-top: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 100%; gap: 8px; transition: color 0.3s; }
        .back-btn:hover { color: #1a1a1a; text-decoration: underline; }
        body.dark-mode .back-btn { color: #aaa; }
        body.dark-mode .back-btn:hover { color: white; }

        .status-msg { margin-bottom: 1.5rem; padding: 10px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }
        .status-error { background: #fee2e2; color: #991b1b; }
        .status-success { background: #dcfce7; color: #166534; }
      `}</style>

      <motion.div className="reset-card" initial="hidden" animate="visible" variants={containerVariants}>
        <div className="reset-icon">🔐</div>
        <h2>Reset Password</h2>

        {status === 'success' ? (
          <motion.div className="status-msg status-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {message}
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            <motion.div className="input-group" variants={inputVariants}>
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="reset-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </motion.div>

            <motion.div className="input-group" variants={inputVariants}>
              <label className="input-label">Verification Code</label>
              <input 
                type="text" 
                className="reset-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                required
              />
            </motion.div>

            <motion.div className="input-group" variants={inputVariants}>
              <label className="input-label">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="reset-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </motion.div>

            <motion.div className="input-group" variants={inputVariants}>
              <label className="input-label">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="reset-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
              />
            </motion.div>

            {status === 'error' && (
              <motion.div className="status-msg status-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ⚠️ {message}
              </motion.div>
            )}

            <motion.button 
              type="submit" 
              className="reset-btn"
              disabled={status === 'loading'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === 'loading' ? 'Resetting...' : 'Set New Password'}
            </motion.button>
          </form>
        )}

        {/* --- BACK BUTTON --- */}
        <button type="button" className="back-btn" onClick={handleBack}>
           ← Back to Login
        </button>

      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;