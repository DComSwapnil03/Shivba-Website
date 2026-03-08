import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

function RegisterPage({ setPage, setModalState }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. VALIDATION LOGIC ---
  const p = formData.password;
  const passwordCriteria = {
      length: p.length >= 8,
      number: /[0-9]/.test(p),
      upper: /[A-Z]/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  };
  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-format phone to allow only numbers and +
    if (name === 'phone' && !/^[0-9+]*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!allCriteriaMet) {
        setModalState({ show: true, title: 'Weak Password', message: 'Please meet all password requirements.', type: 'error' });
        return;
    }
    if (!passwordsMatch) {
        setModalState({ show: true, title: 'Mismatch', message: 'Passwords do not match.', type: 'error' });
        return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password
      };

      const res = await fetch(`${API_BASE_URL}/api/register-interest-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // --- THE FIX: INTERCEPT STATUS CODES BEFORE PARSING JSON ---
      if (res.status === 409) {
          setModalState({ 
              show: true, 
              title: 'Account Exists', 
              message: 'This email or phone number is already registered. Please log in instead.', 
              type: 'error' 
          });
          setIsSubmitting(false);
          return; // Stop execution here
      }

      if (!res.ok) {
          // If it's a 400 or 500 level error, try to extract a message safely
          let errorMessage = 'Registration failed due to a server error.';
          try {
              const errData = await res.json();
              errorMessage = errData.message || errorMessage;
          } catch (e) {
              // Ignore JSON parse errors on server crashes
          }
          throw new Error(errorMessage);
      }

      // If we made it here, it's a 200/201 Success. Now it is safe to parse JSON.
      const data = await res.json();

      // Success Modal
      setModalState({
        show: true,
        title: '🚀 Code Sent!',
        message: `Verification code sent to ${data.email || payload.email}. Check your inbox!`,
        type: 'success'
      });

      // Navigate after delay
      setTimeout(() => {
          setModalState(prev => ({ ...prev, show: false }));
          setPage({ 
              name: 'verify', 
              params: { 
                  email: data.email || payload.email, 
                  phone: payload.phone, 
                  name: payload.name 
              } 
          });
      }, 1500);

    } catch (error) {
      setModalState({ show: true, title: '❌ Failed', message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .register-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            font-family: 'Montserrat', sans-serif;
            padding: 1.5rem;
        }
        body.dark-mode .register-container { background: #0a0a0a; }

        .register-card {
            display: grid; grid-template-columns: 1fr 1.2fr;
            width: 100%; max-width: 1000px;
            background: white; border-radius: 24px; overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            min-height: 600px;
        }
        body.dark-mode .register-card { background: #171717; border: 1px solid #333; }

        @media (max-width: 900px) {
            .register-card { grid-template-columns: 1fr; }
            .register-visual { display: none; }
        }

        .register-visual {
            background: url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop') no-repeat center center/cover;
            position: relative;
            display: flex; flex-direction: column; justify-content: flex-end;
            padding: 3rem; color: white;
        }
        .visual-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%);
        }
        .visual-content { position: relative; z-index: 2; }
        .visual-content h2 {
            font-family: 'Cinzel', serif; font-size: 2.2rem; margin-bottom: 0.5rem;
            color: #FFA500; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .visual-content p { font-size: 1rem; color: #e5e5e5; line-height: 1.5; max-width: 90%; }

        .register-form-wrapper { padding: 3rem; display: flex; flex-direction: column; justify-content: center; }
        
        .register-header h1 {
            font-family: 'Cinzel', serif; font-size: 2rem; color: #1a1a1a; margin-bottom: 0.5rem;
        }
        body.dark-mode .register-header h1 { color: #ffffff; }
        .register-header p { color: #666; margin-bottom: 2rem; font-size: 0.95rem; }
        body.dark-mode .register-header p { color: #a3a3a3; }

        .reg-input-group { margin-bottom: 1.2rem; position: relative; }
        .reg-input-group label {
            display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.05em; color: #666; margin-bottom: 0.4rem;
        }
        body.dark-mode .reg-input-group label { color: #a3a3a3; }

        .input-wrapper { position: relative; }
        
        .reg-input {
            width: 100%; padding: 12px 16px; border: 1.5px solid #e5e7eb;
            border-radius: 8px; font-size: 0.95rem; background: #f9fafb;
            transition: all 0.2s; color: #1a1a1a;
        }
        .reg-input:focus {
            border-color: #FFA500; background: white; outline: none;
            box-shadow: 0 0 0 4px rgba(255, 165, 0, 0.1);
        }
        body.dark-mode .reg-input { background: #262626; border-color: #404040; color: white; }
        body.dark-mode .reg-input:focus { border-color: #FFA500; background: #262626; }

        /* REPLACED ICONS WITH TEXT/EMOJI BUTTONS */
        .icon-btn {
            position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
            background: none; border: none; cursor: pointer; color: #9ca3af;
            font-size: 1.2rem;
            display: flex; align-items: center; justify-content: center;
        }
        .icon-btn:hover { color: #FFA500; }

        .pwd-checklist {
            display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; font-size: 0.7rem;
        }
        .check-item {
            padding: 3px 8px; border-radius: 4px; background: #f3f4f6; color: #9ca3af;
            border: 1px solid transparent; transition: all 0.3s;
        }
        body.dark-mode .check-item { background: #262626; color: #737373; }
        
        .check-item.valid { 
            background: #fffbeb; color: #d97706; border-color: #fbbf24; font-weight: 500; 
        }
        body.dark-mode .check-item.valid { 
            background: rgba(217, 119, 6, 0.1); color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); 
        }

        .reg-btn {
            width: 100%; padding: 14px; background: #1a1a1a; color: white;
            border: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem;
            text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
            transition: all 0.3s; margin-top: 1.5rem;
        }
        .reg-btn:hover:not(:disabled) { background: #FFA500; color: black; transform: translateY(-1px); }
        .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        body.dark-mode .reg-btn { background: #FFA500; color: black; }
        body.dark-mode .reg-btn:hover:not(:disabled) { background: white; }

        .login-link {
            text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #666;
        }
        body.dark-mode .login-link { color: #a3a3a3; }
        .login-link button {
            background: none; border: none; color: #FFA500; font-weight: 600; 
            cursor: pointer; text-decoration: none; margin-left: 5px;
        }
        .login-link button:hover { text-decoration: underline; }

      `}</style>

      <motion.div 
        className="register-card"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* LEFT: VISUAL */}
        <div className="register-visual">
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <h2>Start Your Journey</h2>
            <p>Join a community dedicated to strength, culture, and growth. Your legacy begins here.</p>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="register-form-wrapper">
          <div className="register-header">
            <h1>Create Account</h1>
            <p>Please fill in your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <motion.div className="reg-input-group" variants={itemVariants}>
              <label>Full Name</label>
              <input type="text" name="name" className="reg-input" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </motion.div>

            <motion.div className="reg-input-group" variants={itemVariants}>
              <label>Email Address</label>
              <input type="email" name="email" className="reg-input" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
            </motion.div>

            <motion.div className="reg-input-group" variants={itemVariants}>
              <label>Phone Number</label>
              <input type="tel" name="phone" className="reg-input" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
            </motion.div>

            <motion.div className="reg-input-group" variants={itemVariants}>
              <label>Password</label>
              <div className="input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="reg-input" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    placeholder="Create a strong password"
                  />
                  <button type="button" className="icon-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "👁️" : "🔒"}
                  </button>
              </div>
              <div className="pwd-checklist">
                 <span className={`check-item ${passwordCriteria.length ? 'valid' : ''}`}>
                    {passwordCriteria.length ? "✔" : "○"} 8+ Chars
                 </span>
                 <span className={`check-item ${passwordCriteria.number ? 'valid' : ''}`}>
                    {passwordCriteria.number ? "✔" : "○"} Number
                 </span>
                 <span className={`check-item ${passwordCriteria.upper ? 'valid' : ''}`}>
                    {passwordCriteria.upper ? "✔" : "○"} Uppercase
                 </span>
                 <span className={`check-item ${passwordCriteria.special ? 'valid' : ''}`}>
                    {passwordCriteria.special ? "✔" : "○"} Symbol
                 </span>
              </div>
            </motion.div>

            <motion.div className="reg-input-group" variants={itemVariants}>
              <label>Confirm Password</label>
              <div className="input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    className="reg-input" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    placeholder="Confirm your password"
                    style={{ borderColor: (formData.confirmPassword && !passwordsMatch) ? '#ef4444' : (passwordsMatch && formData.confirmPassword ? '#22c55e' : '') }}
                  />
                  {formData.confirmPassword && (
                      <div className="icon-btn" style={{ pointerEvents: 'none', color: passwordsMatch ? '#22c55e' : '#ef4444' }}>
                          {passwordsMatch ? "✅" : "❌"}
                      </div>
                  )}
              </div>
            </motion.div>

            <motion.button 
              type="submit" 
              className="reg-btn"
              disabled={isSubmitting || !allCriteriaMet || !passwordsMatch}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Processing...' : 'Register & Verify'}
            </motion.button>

            <div className="login-link">
              Already have an account? <button type="button" onClick={() => setPage({ name: 'account' })}>Login here</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;