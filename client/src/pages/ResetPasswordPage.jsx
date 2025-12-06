import React, { useEffect, useState } from 'react';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function ResetPasswordPage({ setPage }) {
  // State for form fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New: Toggle visibility
  
  // State for UI feedback
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  
  // Extract Query Params (Token & Email) from URL
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validate URL immediately
  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid or missing reset token/email.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    // 1. Client-side Validation
    if (!newPassword || newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    try {
      // 2. Send to Backend
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });

      // Robust response parsing: support JSON and plain text (404 HTML, etc.)
      const ct = res.headers.get('content-type') || '';
      let data;
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || `Server responded with status ${res.status}` };
      }

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset successful.');
        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setPage && setPage({ name: 'account' });
        }, 1500);
      } else {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Unexpected error');
    }
  };

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #fff7ed 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      background: 'white',
      padding: '2.5rem',
      borderRadius: '1.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%',
      maxWidth: '450px',
      textAlign: 'center'
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '15px'
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    button: {
      width: '100%',
      padding: '12px',
      background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      opacity: status === 'loading' ? 0.7 : 1
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: '15px',
      fontSize: '0.9rem',
      color: '#666',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="animate-fadeIn">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h2 className="fw-bold mb-3">Set New Password</h2>
        
        {status === 'success' ? (
          <div className="alert alert-success">
            {message}
          </div>
        ) : (
          <>
            <p className="text-muted mb-4 small">
              Enter your new password below for <br/><strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="text-start mb-1">
                <label className="small fw-bold text-secondary">New Password</label>
              </div>
              <div style={styles.inputGroup}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  style={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-start mb-1">
                <label className="small fw-bold text-secondary">Confirm Password</label>
              </div>
              <div style={styles.inputGroup}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  style={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <label style={styles.checkboxContainer}>
                <input 
                  type="checkbox" 
                  checked={showPassword} 
                  onChange={() => setShowPassword(!showPassword)} 
                  style={{ marginRight: '8px' }}
                />
                Show Password
              </label>

              {status === 'error' && (
                <div className="alert alert-danger py-2 small mb-3">
                  {message}
                </div>
              )}

              <button type="submit" style={styles.button} disabled={status === 'loading'}>
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;