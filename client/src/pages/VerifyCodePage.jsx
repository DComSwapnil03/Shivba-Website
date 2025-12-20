import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import '../index.css';

function VerifyCodePage({ defaultEmail = '', defaultName = '', defaultPhone = '', onVerified, setPage }) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const codeInputRef = useRef(null);

  // Auto-focus code input
  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
    if (codeInputRef.current) codeInputRef.current.focus();
  }, [defaultEmail]);

  // Resend countdown timer
  useEffect(() => {
    let interval;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed.');
      }

      setMessage('🎉 Verified! Redirecting...');
      setMessageType('success');

      setTimeout(() => {
        if (onVerified) {
          onVerified(email);
        }
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

      setMessage('📨 New code sent!');
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
      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="verify-card">
        
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
          
          {/* Email Input */}
          <div className="email-display-group">
             <label className="input-label">Email</label>
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="email-input-readonly"
               placeholder="name@email.com"
             />
          </div>

          {/* OTP Code Input */}
          <div className="otp-container">
            <label className="input-label" style={{textAlign: 'center'}}>Enter Verification Code</label>
            
            <div style={{ position: 'relative' }}>
              {/* Invisible Real Input for Accessibility & Mobile typing */}
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
              
              {/* Visual Boxes */}
              <div className="otp-visuals">
                {[...Array(6)].map((_, idx) => (
                  <div 
                    key={idx}
                    className={`otp-box ${code[idx] || (idx === code.length) ? 'active' : ''}`}
                  >
                    {code[idx] || ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`status-msg ${messageType}`}>
              {message}
            </div>
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

      </div>
    </div>
  );
}

export default VerifyCodePage;