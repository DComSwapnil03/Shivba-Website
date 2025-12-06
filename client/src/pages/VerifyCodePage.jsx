import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';

function VerifyCodePage({ defaultEmail = '', defaultName = '', defaultPhone = '', onVerified, setPage }) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const codeInputRef = useRef(null);

  // Auto-focus code input and prefill email
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

      // Notify parent and navigate after short delay
      setTimeout(() => {
        if (onVerified) {
          onVerified(email);
        }
      }, 1500);

    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
      setCode(''); // Clear code on error
      codeInputRef.current?.focus();
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
        password: 'dummy' // Required by backend validation but ignored for existing users
      };

      const res = await fetch(`${API_BASE_URL}/api/register-interest-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok && res.status !== 409) { // 409 means user exists, which is fine for resend
         // If it's a true error, throw it
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
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && !e.ctrlKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #FFF1EB 0%, #ACE0F9 100%)' }}>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-50px] left-[20%] w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 m-4">
        
        {/* Icon Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto shadow-md flex items-center justify-center mb-4 transform rotate-3">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Verify Account</h2>
          <p className="text-gray-500 text-sm">
            We sent a 6-digit code to<br/>
            <span className="font-semibold text-gray-700 bg-white/50 px-2 py-0.5 rounded mt-1 inline-block">
              {email || 'your email'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Input (Hidden or Read-only mostly) */}
          <div className="mb-6 relative group">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Email</label>
             <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/60 border-none rounded-xl py-3 px-4 text-gray-700 font-medium focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-inner"
              placeholder="name@email.com"
            />
            <div className="absolute right-3 top-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">✏️</div>
          </div>

          {/* Code Input */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 text-center">
              Enter Verification Code
            </label>
            
            <div className="relative">
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
                className="w-full bg-transparent text-transparent caret-indigo-500 absolute inset-0 z-10 text-center text-3xl cursor-text focus:outline-none"
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-sm
                      ${code[idx] 
                        ? 'border-indigo-500 bg-white text-indigo-600 scale-105 shadow-md' 
                        : 'border-gray-200 bg-white/40 text-gray-300'
                      }
                      ${idx === code.length && !isSubmitting ? 'border-indigo-300 ring-2 ring-indigo-100' : ''}
                    `}
                  >
                    {code[idx] || ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`mb-6 p-3 rounded-xl text-center text-sm font-semibold animate-fadeIn
              ${messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}
            `}>
              {message}
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 active:scale-95
              ${isSubmitting || code.length !== 6 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:translate-y-[-2px]'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : 'Verify Code'}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center text-sm px-2">
          <button 
            onClick={() => setPage({ name: 'register' })}
            className="text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>

          {resendCountdown === 0 ? (
            <button 
              onClick={handleResend}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Resend Code
            </button>
          ) : (
            <span className="text-gray-400 font-medium cursor-default">
              Resend in {resendCountdown}s
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

export default VerifyCodePage;