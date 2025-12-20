import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function RegisterPage({ setPage, setModalState }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- OPTIMIZATION: DERIVED STATE (No useEffect needed) ---
  // Calculating this on the fly makes typing instant and removes input lag.
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

  const handleCancel = () => {
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
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

      // Set a 15-second timeout so the user isn't stuck forever if the server hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_BASE_URL}/api/register-interest-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout if successful

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit registration.');
      }

      handleCancel(); 

      setModalState({
        show: true,
        title: '✅ Registration Successful!',
        message: `Verification code sent to ${data.email}! Check your inbox.`,
        type: 'success'
      });

      setPage({ name: 'verify', params: { email: data.email } });

    } catch (error) {
      let errorMsg = error.message;
      if (error.name === 'AbortError') {
          errorMsg = "Server took too long to respond. Please check your connection.";
      }
      
      setModalState({
        show: true,
        title: '❌ Registration Failed',
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50 py-16">
      <div className="register-page-wrapper">
        <div className="register-card">
          <h1 className="register-title">Create Account</h1>
          <div className="register-section-title">Your Information</div>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Standard Fields */}
            <div className="register-field">
              <label>Full Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting} />
            </div>

            <div className="register-field">
              <label>Email Address <span className="required">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting} />
            </div>

            <div className="register-field">
              <label>Phone Number <span className="required">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required disabled={isSubmitting} />
            </div>

            {/* --- STRICT PASSWORD SECTION --- */}
            <div className="register-field">
                <label>Create Password <span className="required">*</span></label>
                <input
                    type="password"
                    name="password"
                    placeholder="Enter strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    style={{ 
                        border: allCriteriaMet ? '2px solid #10b981' : '1px solid #d1d5db',
                        backgroundColor: allCriteriaMet ? '#f0fdf4' : 'white'
                    }}
                />
                
                {/* Visual Checklist */}
                <div style={{ marginTop: '10px', background: '#f9fafb', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px', color: '#374151' }}>
                        Password must contain:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        <li style={{ color: passwordCriteria.length ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {passwordCriteria.length ? '✅' : '❌'} 8+ Characters
                        </li>
                        <li style={{ color: passwordCriteria.number ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {passwordCriteria.number ? '✅' : '❌'} A Number (0-9)
                        </li>
                        <li style={{ color: passwordCriteria.upper ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {passwordCriteria.upper ? '✅' : '❌'} Uppercase (A-Z)
                        </li>
                        <li style={{ color: passwordCriteria.special ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {passwordCriteria.special ? '✅' : '❌'} Symbol (!@#$)
                        </li>
                    </ul>
                </div>
            </div>

            <div className="register-field">
                <label>Confirm Password <span className="required">*</span></label>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Retype password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>⚠️ Passwords do not match</div>
                )}
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !allCriteriaMet || !formData.name || !formData.email || !formData.phone}
                    className={isSubmitting ? 'submitting' : ''}
                    style={{ 
                        flex: 1, 
                        opacity: allCriteriaMet ? 1 : 0.5, 
                        cursor: (allCriteriaMet && !isSubmitting) ? 'pointer' : 'not-allowed',
                        background: allCriteriaMet ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' : '#9ca3af',
                        position: 'relative',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    {isSubmitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                         <span className="spinner-border"></span> Processing...
                      </span>
                    ) : (
                      allCriteriaMet ? 'Register Now' : 'Fix Password to Register'
                    )}
                </button>

                <button 
                    type="button" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    style={{ flex: 0.5, backgroundColor: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' }}
                >
                    Clear
                </button>
            </div>

          </form>

          <p className="register-note">
            <span className="required">*</span> Required fields
          </p>
        </div>
      </div>
      
      {/* INJECTED CSS FOR SPINNER */}
      <style>{`
        .spinner-border {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default RegisterPage;