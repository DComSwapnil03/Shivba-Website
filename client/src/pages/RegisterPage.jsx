import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function RegisterPage({ setPage, setModalState }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instant Validation
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
        setModalState({ show: true, title: 'Weak Password', message: 'Please meet all requirements.', type: 'error' });
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

      // 1. Send Request
      const res = await fetch(`${API_BASE_URL}/api/register-interest-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // 2. Handle Errors
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      // 3. SUCCESS - Redirect Logic
      // We show the modal, but we navigate immediately in the background
      setModalState({
        show: true,
        title: '🚀 Success!',
        message: `Code sent to ${data.email}. Redirecting...`,
        type: 'success'
      });

      // Clear form
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

      // FORCE NAVIGATION after 1 second (gives user time to read "Success")
      setTimeout(() => {
          setModalState(prev => ({ ...prev, show: false })); // Close modal
          setPage({ name: 'verify', params: { email: data.email } });
      }, 1000);

    } catch (error) {
      setModalState({
        show: true,
        title: '❌ Failed',
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
          <form onSubmit={handleSubmit} className="register-form">
            
            <div className="register-field">
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="register-field">
              <label>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="register-field">
              <label>Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="register-field">
                <label>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required 
                   style={{ borderColor: allCriteriaMet ? '#10b981' : '' }} />
                
                {/* Simple Checklist */}
                <div style={{fontSize: '0.75rem', marginTop: '5px', color: '#666', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                   <span style={{color: passwordCriteria.length ? 'green' : '#ccc'}}>8+ Chars</span>
                   <span style={{color: passwordCriteria.number ? 'green' : '#ccc'}}>Number</span>
                   <span style={{color: passwordCriteria.upper ? 'green' : '#ccc'}}>Uppercase</span>
                   <span style={{color: passwordCriteria.special ? 'green' : '#ccc'}}>Symbol</span>
                </div>
            </div>

            <div className="register-field">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || !allCriteriaMet}
                style={{ 
                    marginTop: '20px', 
                    padding: '12px', 
                    width: '100%', 
                    background: isSubmitting ? '#ccc' : '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: isSubmitting ? 'wait' : 'pointer'
                }}
            >
                {isSubmitting ? 'Processing...' : 'Register & Verify'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;