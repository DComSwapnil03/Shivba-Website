import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 50 } 
  }
};

function RegisterPage({ setPage, setModalState }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instant Validation Logic
  const p = formData.password;
  const passwordCriteria = {
      length: p.length >= 8,
      number: /[0-9]/.test(p),
      upper: /[A-Z]/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  };
  const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!allCriteriaMet) {
        setModalState({ show: true, title: 'Weak Password', message: 'Please meet all password requirements.', type: 'error' });
        return;
    }
    if (formData.password !== formData.confirmPassword) {
        setModalState({ show: true, title: 'Error', message: 'Passwords do not match.', type: 'error' });
        return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
      };

      const res = await fetch(`${API_BASE_URL}/api/register-interest-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Registration failed.');

      // Success
      setModalState({
        show: true,
        title: '🚀 Code Sent!',
        message: `Verification code sent to ${data.email}. Check your inbox!`,
        type: 'success'
      });

      // Clear form securely
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

      // Navigate after short delay
      setTimeout(() => {
          setModalState(prev => ({ ...prev, show: false }));
          
          // --- CRITICAL UPDATE HERE ---
          // We pass phone and name so the Verify Page can use them for WhatsApp
          setPage({ 
              name: 'verify', 
              params: { 
                  email: data.email, 
                  phone: payload.phone,  // PASSING PHONE
                  name: payload.name     // PASSING NAME
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
            padding: 2rem;
        }
        body.dark-mode .register-container { background: #111; }

        /* Split Layout */
        .register-card {
            display: grid; grid-template-columns: 1fr 1.2fr;
            width: 100%; max-width: 1000px;
            background: white; border-radius: 20px; overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            min-height: 600px;
        }
        body.dark-mode .register-card { background: #1e1e1e; border: 1px solid #333; }

        @media (max-width: 900px) {
            .register-card { grid-template-columns: 1fr; }
            .register-visual { display: none; }
        }

        /* Left Side: Visual */
        .register-visual {
            background: url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop') no-repeat center center/cover;
            position: relative;
            display: flex; flex-direction: column; justify-content: flex-end;
            padding: 3rem; color: white;
        }
        .visual-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3));
        }
        .visual-content { position: relative; z-index: 2; }
        .visual-content h2 {
            font-family: 'Cinzel', serif; font-size: 2.5rem; margin-bottom: 1rem;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        .visual-content p { font-size: 1.1rem; color: #ddd; line-height: 1.6; }

        /* Right Side: Form */
        .register-form-wrapper { padding: 3rem; display: flex; flex-direction: column; justify-content: center; }
        
        .register-header h1 {
            font-family: 'Cinzel', serif; font-size: 2.2rem; color: #1a1a1a; margin-bottom: 0.5rem;
        }
        body.dark-mode .register-header h1 { color: white; }
        .register-header p { color: #666; margin-bottom: 2rem; }
        body.dark-mode .register-header p { color: #aaa; }

        .reg-input-group { margin-bottom: 1.2rem; position: relative; }
        .reg-input-group label {
            display: block; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.05em; color: #666; margin-bottom: 0.5rem;
        }
        body.dark-mode .reg-input-group label { color: #aaa; }

        .reg-input {
            width: 100%; padding: 12px 16px; border: 1px solid #ddd;
            border-radius: 8px; font-size: 1rem; background: #f9fafb;
            transition: all 0.3s;
        }
        .reg-input:focus {
            border-color: #FFA500; background: white; outline: none;
            box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
        }
        body.dark-mode .reg-input { background: #2d2d2d; border-color: #444; color: white; }
        body.dark-mode .reg-input:focus { border-color: #FFA500; background: #222; }

        /* Password Checklist */
        .pwd-checklist {
            display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; font-size: 0.75rem;
        }
        .check-item {
            padding: 2px 8px; border-radius: 4px; background: #eee; color: #888; transition: all 0.3s;
        }
        .check-item.valid { background: #dcfce7; color: #166534; font-weight: bold; }

        /* Button */
        .reg-btn {
            width: 100%; padding: 14px; background: #1a1a1a; color: white;
            border: none; border-radius: 8px; font-weight: 600; font-size: 1rem;
            text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
            transition: all 0.3s; margin-top: 1.5rem;
        }
        .reg-btn:hover:not(:disabled) { background: #FFA500; color: black; transform: translateY(-2px); }
        .reg-btn:disabled { background: #ccc; cursor: not-allowed; }

        .login-link {
            text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #666;
        }
        .login-link button {
            background: none; border: none; color: #FFA500; font-weight: bold; cursor: pointer; text-decoration: underline;
        }

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
            <p>Enter your details to register.</p>
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
              <input type="tel" name="phone" className="reg-input" value={formData.phone} onChange={handleChange} required placeholder="+91 00000 00000" />
            </motion.div>

            <motion.div className="reg-input-group" variants={itemVariants}>
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                className="reg-input" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                placeholder="••••••••"
                style={{ borderColor: allCriteriaMet ? '#10b981' : '' }}
              />
              <div className="pwd-checklist">
                 <span className={`check-item ${passwordCriteria.length ? 'valid' : ''}`}>8+ Chars</span>
                 <span className={`check-item ${passwordCriteria.number ? 'valid' : ''}`}>Number</span>
                 <span className={`check-item ${passwordCriteria.upper ? 'valid' : ''}`}>Uppercase</span>
                 <span className={`check-item ${passwordCriteria.special ? 'valid' : ''}`}>Symbol</span>
              </div>
            </motion.div>

            <motion.div className="reg-input-group" variants={itemVariants}>
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" className="reg-input" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
            </motion.div>

            <motion.button 
              type="submit" 
              className="reg-btn"
              disabled={isSubmitting || !allCriteriaMet}
              whileHover={{ scale: 1.02 }}
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