import React, { useState, useEffect } from 'react';
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
  
  // --- STRICT PASSWORD RULES ---
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,  // Min 8 chars
    number: false,  // At least 1 number
    upper: false,   // At least 1 uppercase
    special: false  // At least 1 special char (!@#$%)
  });

  const [allCriteriaMet, setAllCriteriaMet] = useState(false);

  // Check rules whenever password changes
  useEffect(() => {
    const p = formData.password;
    const criteria = {
        length: p.length >= 8,
        number: /[0-9]/.test(p),
        upper: /[A-Z]/.test(p),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
    };
    setPasswordCriteria(criteria);
    setAllCriteriaMet(Object.values(criteria).every(Boolean));
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final Gatekeeping (Just in case they enabled the button via hack)
    if (!allCriteriaMet) {
        setModalState({ show: true, title: 'Weak Password', message: 'Please meet all password requirements.', type: 'error' });
        setIsSubmitting(false);
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setModalState({ show: true, title: 'Error', message: 'Passwords do not match.', type: 'error' });
        setIsSubmitting(false);
        return;
    }

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
      setModalState({
        show: true,
        title: '❌ Registration Failed',
        message: error.message,
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
                
                {/* Visual Checklist - The "Wanted Words" Enforcement */}
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
                    // CRITICAL: Button is DISABLED until all criteria met
                    disabled={isSubmitting || !allCriteriaMet || !formData.name || !formData.email || !formData.phone}
                    className={isSubmitting ? 'submitting' : ''}
                    style={{ 
                        flex: 1, 
                        opacity: allCriteriaMet ? 1 : 0.5, 
                        cursor: allCriteriaMet ? 'pointer' : 'not-allowed',
                        background: allCriteriaMet ? 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' : '#9ca3af'
                    }}
                >
                    {isSubmitting ? 'Creating Account...' : (allCriteriaMet ? 'Register Now' : 'Fix Password to Register')}
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
    </div>
  );
}

export default RegisterPage;