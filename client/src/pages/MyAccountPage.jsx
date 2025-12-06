import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

function MyAccountPage({ defaultEmail = '', setPage, onLoaded }) {
  // View State: 'login', 'forgot-password'
  const [view, setView] = useState('login'); 

  // Form States
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  
  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true); 
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [account, setAccount] = useState(null);
  
  // Detail Modal State
  const [selectedProgram, setSelectedProgram] = useState(null);

  // --- HELPER: Normalize Data ---
  // Ensures we always have arrays, even if DB returns null
  const normalizeUserData = (data) => {
    return {
      ...data,
      programs: data.programs || data.services || [], // Fallback to 'services' if 'programs' is empty
      payments: data.payments || []
    };
  };

  // --- HELPER: Date Formatter (India) ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // --- 1. FETCH PROFILE ---
  const fetchProfile = useCallback(async (storedEmail) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/members/profile?email=${storedEmail}`);
      const data = await res.json();

      if (res.ok) {
        const cleanData = normalizeUserData(data);
        setAccount(cleanData);
        if (onLoaded) onLoaded(cleanData);
      } else {
        console.warn("Stored user not found in DB, logging out.");
        localStorage.removeItem('shivba_user_email');
        setAccount(null);
      }
    } catch (err) {
      console.error("Auto-login network error:", err);
    } finally {
      setIsCheckingSession(false);
    }
  }, [onLoaded]);

  // --- 2. INITIAL EFFECT ---
  useEffect(() => {
    const storedEmail = localStorage.getItem('shivba_user_email');
    if (storedEmail) {
      setEmail(storedEmail);
      fetchProfile(storedEmail);
    } else {
      setIsCheckingSession(false);
    }
  }, [fetchProfile]);

  // --- 3. HANDLE MANUAL LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAccount(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      const cleanData = normalizeUserData(data);
      setAccount(cleanData);
      
      localStorage.setItem('shivba_user_email', email);
      if (onLoaded) onLoaded(cleanData);
    } catch (err) {
      setError(err.message);
      // Only clear storage if it's a hard auth error, not network
      if (err.message !== 'Network request failed') {
         localStorage.removeItem('shivba_user_email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. HANDLE FORGOT PASSWORD ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setSuccessMsg('✅ Reset link sent! Check your email to set your password.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. HANDLE SIGN OUT ---
  const handleSignOut = () => {
    setAccount(null);
    setEmail('');
    setPassword('');
    setError('');
    localStorage.removeItem('shivba_user_email');
    if (onLoaded) onLoaded(null);
    setPage({ name: 'home' });
  };

  // --- 6. HANDLE REFRESH ---
  const handleRefresh = () => {
      if(email) fetchProfile(email);
  };

  // --- HELPER: Navigation ---
  const openProgramDetail = (program) => setSelectedProgram(program);
  const closeProgramDetail = () => setSelectedProgram(null);
  const navigateToServices = () => setPage({ name: 'services' });

  // --- STYLES ---
  const styles = {
    gradientBg: { background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #fff7ed 100%)', minHeight: '100vh' },
    heroCard: { background: 'linear-gradient(120deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', borderRadius: '1.5rem', border: 'none' },
    avatar: { width: '90px', height: '90px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', fontSize: '2.5rem' },
    hoverCard: { transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer', borderRadius: '1rem' },
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 },
    modalContent: { background: 'white', borderRadius: '1.5rem', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeIn 0.3s ease-out' }
  };

  if (isCheckingSession) {
    return (
        <div style={styles.gradientBg} className="d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  // --- RENDER: DASHBOARD (If Logged In) ---
  if (account) {
    const programs = account.programs || [];
    const payments = account.payments || [];
    const hasPrograms = programs.length > 0;
    const hasPayments = payments.length > 0;
    
    // Stats Chart
    const renderStatsChart = () => {
        const total = programs.length;
        if (total === 0) return null;
        const active = programs.filter(p => p.status === 'active' || p.status === 'registered').length;
        const completed = total - active;
        const activePct = (active / total) * 100;
        const completedPct = (completed / total) * 100;
    
        return (
          <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                 <h5 className="card-title text-muted mb-0 fw-bold text-uppercase small letter-spacing-1">Activity Overview</h5>
                 <span className="badge bg-light text-dark rounded-pill px-3">Total: {total}</span>
              </div>
              <div className="progress mb-3" style={{ height: '12px', borderRadius: '6px' }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${activePct}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }} />
                <div className="progress-bar bg-light" role="progressbar" style={{ width: `${completedPct}%`, backgroundColor: '#e5e7eb' }} />
              </div>
              <div className="d-flex justify-content-between text-muted small fw-bold">
                <span style={{ color: '#10b981' }}>● Active ({active})</span>
                <span style={{ color: '#9ca3af' }}>● Expired/Completed ({completed})</span>
              </div>
            </div>
          </div>
        );
    };

    // Payment History Renderer
    const renderPaymentHistory = () => (
      <div className="mt-5">
        <h5 className="fw-bold text-dark mb-3 ps-2 border-start border-4 border-warning">Payment History</h5>
        {hasPayments ? (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 ps-4 text-uppercase text-muted small fw-bold">Date</th>
                    <th className="py-3 text-uppercase text-muted small fw-bold">Service</th>
                    <th className="py-3 text-uppercase text-muted small fw-bold">Amount</th>
                    <th className="py-3 text-uppercase text-muted small fw-bold">Status</th>
                    <th className="py-3 text-end pe-4 text-uppercase text-muted small fw-bold">Ref ID</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice().reverse().map((pay, idx) => ( // Reverse to show newest first
                    <tr key={idx}>
                      <td className="ps-4 py-3 fw-bold text-dark">
                        {formatDate(pay.date)}
                      </td>
                      <td className="py-3 text-secondary">{pay.eventName || 'Service'}</td>
                      <td className="py-3 fw-bold">₹{pay.amount}</td>
                      <td className="py-3">
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2">
                          Success
                        </span>
                      </td>
                      <td className="text-end pe-4 py-3">
                        <span className="text-muted small font-monospace">
                          {pay.paymentId ? pay.paymentId.slice(-6).toUpperCase() : '---'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="alert alert-light border-0 shadow-sm text-center py-4 rounded-3">
            <p className="text-muted mb-0">No payment history found.</p>
          </div>
        )}
      </div>
    );

    return (
      <div style={styles.gradientBg} className="py-5 animate-fadeIn">
        <div className="container">
          {/* Header Card */}
          <div className="card shadow-lg mb-4" style={styles.heroCard}>
            <div className="card-body p-4 p-lg-5">
              <div className="row align-items-center">
                <div className="col-lg-8 d-flex flex-column flex-md-row align-items-center text-center text-md-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold mb-3 mb-md-0 me-md-4 shadow-sm" style={styles.avatar}>
                    {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h2 className="fw-bold mb-2 display-6">
                        {account.name}
                        <button onClick={handleRefresh} className="btn btn-sm btn-outline-light rounded-circle ms-3" title="Refresh Data">↻</button>
                    </h2>
                    <div className="d-flex flex-column flex-md-row gap-3 gap-md-4 opacity-90">
                      <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1 rounded-pill"><span>📧</span><span className="fw-medium">{account.email}</span></div>
                      <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1 rounded-pill"><span>📱</span><span className="fw-medium">{account.mobileNumber || account.phone || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 mt-4 mt-lg-0 text-center text-lg-end">
                    <div className="bg-white bg-opacity-10 p-3 rounded-4 backdrop-blur-sm border border-white border-opacity-10 d-inline-block d-lg-block">
                      <small className="d-block text-uppercase letter-spacing-2 opacity-75 mb-2">Account Status</small>
                      {account.isVerified ? <div className="badge bg-white text-success fw-bold px-3 py-2 rounded-pill shadow-sm fs-6">✅ Verified</div> : <div className="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill shadow-sm fs-6">⏳ Pending</div>}
                      <div className="mt-3 small opacity-75 border-top border-white border-opacity-20 pt-2">Member since {formatDate(account.createdAt)}</div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Stats Column */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '1rem' }}>
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-5">
                  <div className="mb-3 p-3 rounded-circle bg-primary bg-opacity-10 text-primary"><span className="fs-1">📊</span></div>
                  <h6 className="text-muted text-uppercase fw-bold letter-spacing-1">Total Programs</h6>
                  <h1 className="display-3 fw-bold text-dark mb-0">{programs.length}</h1>
                  <p className="text-muted small mt-2">Registered Services</p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="col-lg-8">
              {hasPrograms && renderStatsChart()}
              
              <h5 className="fw-bold text-dark mb-3 ps-2 border-start border-4 border-primary">Your Services</h5>
              {hasPrograms ? (
                <div className="row g-3">
                  {programs.map((prog, idx) => {
                    // Logic for Status Badge Color & Text
                    const status = (prog.status || 'active').toLowerCase();
                    let badgeClass = 'bg-secondary';
                    let statusText = status.charAt(0).toUpperCase() + status.slice(1);

                    if (status === 'active' || status === 'registered') {
                        badgeClass = 'bg-success';
                        statusText = 'Active';
                    } else if (status === 'expired') {
                        badgeClass = 'bg-danger';
                    } else if (status === 'completed') {
                        badgeClass = 'bg-primary';
                    }

                    const endDate = prog.endDate ? formatDate(prog.endDate) : 'Ongoing';

                    return (
                        <div key={idx} className="col-md-6">
                        <div className="card h-100 border-0 shadow-sm service-card" style={styles.hoverCard} onClick={() => openProgramDetail(prog)}>
                            <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-3">
                                <div className="bg-info bg-opacity-10 text-info p-2 rounded-3">🏷️</div>
                                <span className={`badge ${badgeClass} border align-self-start`}>{statusText}</span>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">{prog.name}</h5>
                            <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <div>
                                    <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>START DATE</small>
                                    <span className="fw-bold small">{formatDate(prog.registrationDate)}</span>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>EXPIRY</small>
                                    <span className={`fw-bold small ${status === 'expired' ? 'text-danger' : 'text-dark'}`}>{endDate}</span>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 card border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
                  <div className="card-body">
                    <div className="display-1 mb-3 opacity-50">🧘</div>
                    <h4 className="fw-bold text-dark">No Active Services</h4>
                    <p className="text-muted col-md-8 mx-auto">It looks empty here! Explore our Talim, Hostel, and Event programs to get started.</p>
                    <button onClick={navigateToServices} className="btn btn-primary btn-lg rounded-pill px-5 shadow-lg mt-3">Browse Programs</button>
                  </div>
                </div>
              )}

              {/* PAYMENT HISTORY SECTION */}
              {renderPaymentHistory()}
            </div>
          </div>
          <div className="text-center mt-5">
              <button onClick={handleSignOut} className="btn btn-link text-muted text-decoration-none fw-bold">← Sign Out</button>
          </div>
        </div>

        {/* Modal Logic */}
        {selectedProgram && (
          <div style={styles.modalBackdrop} onClick={closeProgramDetail}>
             <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className="modal-header border-bottom p-4">
                  <h5 className="modal-title fw-bold text-primary">{selectedProgram.name}</h5>
                  <button type="button" className="btn-close" onClick={closeProgramDetail}></button>
                </div>
                <div className="modal-body p-4">
                    <div className="mb-4 text-center">
                      <div className="d-inline-block p-3 rounded-circle bg-light mb-2"><span className="fs-1">📅</span></div>
                      <h4 className="fw-bold mb-0">Service Details</h4>
                    </div>
                    <div className="card bg-light border-0 rounded-3 mb-3">
                      <div className="card-body d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-secondary">Current Status</span>
                          <span className="badge bg-primary rounded-pill px-3">{selectedProgram.status || 'Active'}</span>
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-6"><div className="border rounded-3 p-3 text-center h-100"><small className="text-uppercase text-muted fw-bold letter-spacing-1 d-block mb-1">Entry Date</small><span className="fw-bold fs-5 text-dark">{formatDate(selectedProgram.registrationDate)}</span></div></div>
                      <div className="col-6"><div className="border rounded-3 p-3 text-center h-100"><small className="text-uppercase text-muted fw-bold letter-spacing-1 d-block mb-1">Exit Date</small><span className="fw-bold fs-5 text-dark">{selectedProgram.endDate ? formatDate(selectedProgram.endDate) : 'Ongoing'}</span></div></div>
                    </div>
                    {selectedProgram.paymentId && (
                        <div className="text-center mt-4 pt-3 border-top">
                             <small className="text-muted">Payment Reference: <span className="font-monospace">{selectedProgram.paymentId}</span></small>
                        </div>
                    )}
                </div>
                <div className="modal-footer border-0 p-4 pt-0"><button className="btn btn-primary w-100 rounded-pill fw-bold" onClick={closeProgramDetail}>Close</button></div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER: LOGIN FORM (If Not Logged In) ---
  return (
    <div style={styles.gradientBg} className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: '2rem' }}>
          <div className="row g-0">
            {/* Left Side: Illustration */}
            <div className="col-lg-5 text-white p-5 d-flex flex-column justify-content-center align-items-center text-center position-relative"
                 style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-white opacity-10" style={{ width: '200px', height: '200px' }}></div>
              <div className="position-absolute bottom-0 end-0 translate-middle rounded-circle bg-white opacity-10" style={{ width: '150px', height: '150px' }}></div>
              <h2 className="fw-bold mb-3 position-relative">Welcome Back!</h2>
              <p className="lead mb-4 opacity-75 position-relative">Access your dashboard to manage your Talim, Hostel, and Event registrations.</p>
              <div className="d-flex gap-3 mt-3 position-relative">
                <div className="bg-white bg-opacity-20 p-3 rounded-4 backdrop-blur-sm"><div className="fs-3">🏋️</div></div>
                <div className="bg-white bg-opacity-20 p-3 rounded-4 backdrop-blur-sm"><div className="fs-3">🏠</div></div>
                <div className="bg-white bg-opacity-20 p-3 rounded-4 backdrop-blur-sm"><div className="fs-3">📚</div></div>
              </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="col-lg-7 p-5 bg-white">
              {view === 'login' && (
                <div className="animate-fadeIn">
                  <div className="text-center mb-5">
                    <h3 className="fw-bold text-dark mb-1">Sign In</h3>
                    <p className="text-muted">Enter email and password to access account</p>
                  </div>
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-secondary small text-uppercase letter-spacing-1">Email Address</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0 text-muted ps-3">✉️</span>
                        <input
                          type="email"
                          className="form-control bg-light border-0 shadow-none"
                          style={{ fontSize: '1rem' }}
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label fw-bold text-secondary small text-uppercase letter-spacing-1">Password</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0 text-muted ps-3">🔑</span>
                        <input
                          type="password"
                          className="form-control bg-light border-0 shadow-none"
                          style={{ fontSize: '1rem' }}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button 
                            type="button" 
                            onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); setEmail(email || ''); }} 
                            className="btn btn-link text-decoration-none text-muted small p-0"
                        >
                            Forgot Password?
                        </button>
                        
                        {/* GUEST USER HELPER */}
                        <button 
                            type="button" 
                            onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }} 
                            className="btn btn-link text-decoration-none text-primary small p-0 fw-bold"
                            style={{fontSize: '0.85rem'}}
                        >
                            Paid but no password?
                        </button>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100 fw-bold rounded-3 shadow-lg hover-scale"
                      style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
                      disabled={isLoading}
                    >
                      {isLoading ? <span><span className="spinner-border spinner-border-sm me-2"/>Authenticating...</span> : 'Sign In →'}
                    </button>
                  </form>
                  <div className="mt-5 text-center pt-4 border-top">
                    <p className="text-muted small mb-2">New to Shivba?</p>
                    <button className="btn btn-outline-dark btn-sm rounded-pill px-4 fw-bold" onClick={navigateToServices}>
                      Register for a Program
                    </button>
                  </div>
                </div>
              )}

              {view === 'forgot' && (
                <div className="animate-fadeIn">
                    <div className="text-center mb-5">
                    <h3 className="fw-bold text-dark mb-1">Reset Password</h3>
                    <p className="text-muted">Enter your email to receive a reset link</p>
                  </div>
                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-4">
                      <label className="form-label fw-bold text-secondary small text-uppercase letter-spacing-1">Email Address</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-0 text-muted ps-3">✉️</span>
                        <input
                          type="email"
                          className="form-control bg-light border-0 shadow-none"
                          style={{ fontSize: '1rem' }}
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-warning btn-lg w-100 fw-bold rounded-3 shadow-lg text-white mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                      className="btn btn-light w-100 rounded-3 text-muted"
                    >
                      Cancel & Back to Login
                    </button>
                  </form>
                </div>
              )}

              {error && (
                <div className="alert alert-danger mt-4 text-center border-0 rounded-3 bg-danger bg-opacity-10 text-danger animate-fadeIn">
                  <small className="fw-bold">⚠️ {error}</small>
                </div>
              )}
              {successMsg && (
                <div className="alert alert-success mt-4 text-center border-0 rounded-3 bg-success bg-opacity-10 text-success animate-fadeIn">
                  <small className="fw-bold">{successMsg}</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAccountPage;