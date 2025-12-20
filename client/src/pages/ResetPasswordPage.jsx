import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const inputVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 } 
  }
};

function ResetPasswordPage({ setPage }) {
  // State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  
  // URL Params
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validate Token on Mount
  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid link. Please check your email again.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!newPassword || newPassword.length < 6) {
      setStatus('error'); setMessage('Password must be at least 6 characters.'); return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error'); setMessage('Passwords do not match.'); return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
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
          // Clear URL to prevent re-use
          window.history.replaceState({}, document.title, window.location.pathname);
          setPage && setPage({ name: 'account' });
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
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .reset-container {
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Montserrat', sans-serif;
            background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
            padding: 20px;
        }
        body.dark-mode .reset-container {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }

        .reset-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            width: 100%; max-width: 450px;
            padding: 3rem; border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            text-align: center;
            border: 1px solid rgba(255,255,255,0.5);
        }
        body.dark-mode .reset-card {
            background: rgba(30, 41, 59, 0.8);
            border-color: rgba(255,255,255,0.1);
            color: white;
        }

        .reset-icon { font-size: 3rem; margin-bottom: 1rem; display: inline-block; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }

        .reset-card h2 {
            font-family: 'Cinzel', serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #1a1a1a;
        }
        body.dark-mode .reset-card h2 { color: white; }
        .reset-card p { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
        body.dark-mode .reset-card p { color: #aaa; }

        .input-group { position: relative; margin-bottom: 1.5rem; text-align: left; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 5px; letter-spacing: 0.05em; }
        body.dark-mode .input-label { color: #aaa; }

        .reset-input {
            width: 100%; padding: 12px 16px; border-radius: 8px; border: 1px solid #ddd;
            font-size: 1rem; transition: all 0.3s; background: #f9fafb;
        }
        .reset-input:focus {
            border-color: #FFA500; background: white; outline: none; box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
        }
        body.dark-mode .reset-input { background: #0f172a; border-color: #334155; color: white; }
        body.dark-mode .reset-input:focus { border-color: #FFA500; }

        .eye-btn {
            position: absolute; right: 12px; top: 32px; background: none; border: none;
            cursor: pointer; font-size: 1.2rem; color: #999;
        }
        .eye-btn:hover { color: #333; }
        body.dark-mode .eye-btn:hover { color: white; }

        .reset-btn {
            width: 100%; padding: 14px; background: #1a1a1a; color: white;
            border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s; margin-top: 1rem;
        }
        .reset-btn:hover:not(:disabled) { background: #FFA500; color: black; transform: translateY(-2px); }
        .reset-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .status-msg { margin-bottom: 1.5rem; padding: 10px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }
        .status-error { background: #fee2e2; color: #991b1b; }
        .status-success { background: #dcfce7; color: #166534; }

      `}</style>

      <motion.div 
        className="reset-card"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="reset-icon">🔐</div>
        <h2>Reset Password</h2>
        
        {status === 'success' ? (
          <motion.div 
            className="status-msg status-success"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            {message}
            <p style={{marginTop: '10px', fontSize: '0.8rem', fontWeight: 'normal'}}>Redirecting to login...</p>
          </motion.div>
        ) : (
          <>
            <p>
              Create a strong password for <br />
              <strong style={{color: '#FFA500'}}>{email || 'your account'}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <motion.div className="input-group" variants={inputVariants}>
                <label className="input-label">New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="reset-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
          </>
        )}
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;