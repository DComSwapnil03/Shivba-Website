import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50 } 
  }
};

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
  const normalizeUserData = (data) => {
    return {
      ...data,
      programs: data.programs || data.services || [], 
      payments: data.payments || []
    };
  };

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

  // --- 3. HANDLERS ---
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

      if (!res.ok) throw new Error(data.message || 'Login failed.');

      const cleanData = normalizeUserData(data);
      setAccount(cleanData);
      localStorage.setItem('shivba_user_email', email);
      if (onLoaded) onLoaded(cleanData);
    } catch (err) {
      setError(err.message);
      if (err.message !== 'Network request failed') localStorage.removeItem('shivba_user_email');
    } finally {
      setIsLoading(false);
    }
  };

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
      setSuccessMsg('✅ Reset link sent! Check your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setAccount(null); setEmail(''); setPassword(''); setError('');
    localStorage.removeItem('shivba_user_email');
    if (onLoaded) onLoaded(null);
    setPage({ name: 'home' });
  };

  const openProgramDetail = (program) => setSelectedProgram(program);
  const closeProgramDetail = () => setSelectedProgram(null);

  // --- LOADING STATE ---
  if (isCheckingSession) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #ddd', borderTopColor: '#FFA500', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
  }

  // --- RENDER: DASHBOARD (Logged In) ---
  if (account) {
    const programs = account.programs || [];
    const payments = account.payments || [];
    
    return (
      <motion.div 
        className="account-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

            .account-container { font-family: 'Montserrat', sans-serif; background: #f9fafb; min-height: 100vh; padding-bottom: 4rem; }
            body.dark-mode .account-container { background: #111; }

            .dashboard-header { background: #1a1a1a; padding: 4rem 2rem 6rem; color: white; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; position: relative; }
            .header-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 2rem; }
            .user-welcome h1 { font-family: 'Cinzel', serif; font-size: 2.5rem; margin-bottom: 0.5rem; color: white; }
            .user-welcome p { color: #aaa; }
            .signout-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: background 0.3s; }
            .signout-btn:hover { background: rgba(255,255,255,0.2); }

            .dashboard-grid { max-width: 1200px; margin: -4rem auto 0; padding: 0 2rem; display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; position: relative; z-index: 10; }
            @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }

            .dash-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            body.dark-mode .dash-card { background: #1e1e1e; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
            .dash-card h3 { font-family: 'Cinzel', serif; margin-bottom: 1.5rem; color: #1a1a1a; border-left: 4px solid #FFA500; padding-left: 10px; }
            body.dark-mode .dash-card h3 { color: white; }

            /* Profile Summary */
            .profile-stat { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            body.dark-mode .profile-stat { border-color: #333; }
            .stat-label { color: #666; font-size: 0.9rem; }
            body.dark-mode .stat-label { color: #aaa; }
            .stat-val { font-weight: 600; color: #1a1a1a; }
            body.dark-mode .stat-val { color: white; }

            /* Programs List */
            .program-item { background: #f9fafb; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #eee; cursor: pointer; transition: transform 0.2s; display: flex; justify-content: space-between; align-items: center; }
            body.dark-mode .program-item { background: #2d2d2d; border-color: #444; }
            .program-item:hover { transform: translateY(-3px); border-color: #FFA500; }
            .prog-name { font-weight: bold; font-size: 1.1rem; color: #1a1a1a; }
            body.dark-mode .prog-name { color: white; }
            .prog-dates { font-size: 0.85rem; color: #666; margin-top: 5px; }
            .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
            .status-active { background: #dcfce7; color: #166534; }
            .status-expired { background: #fee2e2; color: #991b1b; }

            /* Payments Table */
            .pay-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
            .pay-table th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #888; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
            .pay-table td { padding: 12px; border-bottom: 1px solid #eee; color: #333; }
            body.dark-mode .pay-table th { border-color: #444; }
            body.dark-mode .pay-table td { border-color: #333; color: #ccc; }

            /* Modal */
            .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1050; backdrop-filter: blur(4px); }
            .modal-content { background: white; padding: 2rem; border-radius: 16px; width: 90%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
            body.dark-mode .modal-content { background: #1e1e1e; }
        `}</style>

        {/* --- HEADER --- */}
        <div className="dashboard-header">
            <div className="header-content">
                <div className="user-welcome">
                    <h1>Welcome, {account.name.split(' ')[0]}</h1>
                    <p>{account.email}</p>
                </div>
                <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
            </div>
        </div>

        {/* --- DASHBOARD GRID --- */}
        <div className="dashboard-grid">
            
            {/* LEFT COL: PROFILE & STATS */}
            <motion.div className="dash-card" variants={itemVariants}>
                <h3>My Profile</h3>
                <div className="profile-stat">
                    <span className="stat-label">Phone</span>
                    <span className="stat-val">{account.phone || 'N/A'}</span>
                </div>
                <div className="profile-stat">
                    <span className="stat-label">Member Since</span>
                    <span className="stat-val">{formatDate(account.createdAt)}</span>
                </div>
                <div className="profile-stat">
                    <span className="stat-label">Active Programs</span>
                    <span className="stat-val" style={{color: '#10b981'}}>{programs.filter(p => p.status !== 'expired').length}</span>
                </div>
                <div className="profile-stat" style={{border:0}}>
                    <span className="stat-label">Account Status</span>
                    <span className="stat-val">{account.isVerified ? '✅ Verified' : '⏳ Pending'}</span>
                </div>
            </motion.div>

            {/* RIGHT COL: PROGRAMS & PAYMENTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Programs List */}
                <motion.div className="dash-card" variants={itemVariants}>
                    <h3>Active Services</h3>
                    {programs.length === 0 ? (
                        <div style={{textAlign:'center', padding:'2rem', color:'#888'}}>
                            <p>No active services found.</p>
                            <button onClick={() => setPage({ name: 'services' })} style={{marginTop:'10px', padding:'8px 16px', background:'#FFA500', border:'none', color:'white', borderRadius:'6px', cursor:'pointer'}}>Browse Services</button>
                        </div>
                    ) : (
                        programs.map((prog, idx) => (
                            <div key={idx} className="program-item" onClick={() => openProgramDetail(prog)}>
                                <div>
                                    <div className="prog-name">{prog.name}</div>
                                    <div className="prog-dates">Valid until: {prog.endDate ? formatDate(prog.endDate) : 'Ongoing'}</div>
                                </div>
                                <span className={`status-badge ${prog.status === 'expired' ? 'status-expired' : 'status-active'}`}>
                                    {prog.status || 'Active'}
                                </span>
                            </div>
                        ))
                    )}
                </motion.div>

                {/* Payments History */}
                <motion.div className="dash-card" variants={itemVariants}>
                    <h3>Payment History</h3>
                    {payments.length === 0 ? (
                        <p style={{color:'#888', fontStyle:'italic'}}>No payment records found.</p>
                    ) : (
                        <div style={{overflowX: 'auto'}}>
                            <table className="pay-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Service</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.slice().reverse().map((pay, idx) => (
                                        <tr key={idx}>
                                            <td>{formatDate(pay.date)}</td>
                                            <td>{pay.eventName || 'Service'}</td>
                                            <td style={{fontWeight:'bold'}}>₹{pay.amount}</td>
                                            <td style={{color:'#10b981'}}>Success</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

            </div>
        </div>

        {/* --- MODAL --- */}
        <AnimatePresence>
            {selectedProgram && (
                <motion.div className="modal-backdrop" onClick={closeProgramDetail} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{y:20}} animate={{y:0}}>
                        <h2 style={{fontFamily:'Cinzel, serif', marginBottom:'1rem', color:'#1a1a1a'}}>{selectedProgram.name}</h2>
                        
                        <div style={{background:'#f9fafb', padding:'15px', borderRadius:'8px', marginBottom:'15px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                <span style={{color:'#666', fontSize:'0.9rem'}}>Start Date</span>
                                <span style={{fontWeight:'bold'}}>{formatDate(selectedProgram.registrationDate)}</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                <span style={{color:'#666', fontSize:'0.9rem'}}>Expiry Date</span>
                                <span style={{fontWeight:'bold'}}>{selectedProgram.endDate ? formatDate(selectedProgram.endDate) : 'Ongoing'}</span>
                            </div>
                        </div>

                        {selectedProgram.paymentId && (
                            <p style={{fontSize:'0.85rem', color:'#888', textAlign:'center', marginBottom:'20px'}}>
                                Ref ID: {selectedProgram.paymentId}
                            </p>
                        )}

                        <button onClick={closeProgramDetail} style={{width:'100%', padding:'12px', background:'#1a1a1a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>Close Details</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

      </motion.div>
    );
  }

  // --- RENDER: LOGIN FORM (Not Logged In) ---
  return (
    <div className="login-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; font-family: 'Montserrat', sans-serif; padding: 2rem; }
        .login-card { display: grid; grid-template-columns: 1fr 1.2fr; width: 100%; max-width: 900px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.15); min-height: 550px; }
        
        .login-visual { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); position: relative; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; text-align: center; }
        .login-visual h2 { font-family: 'Cinzel', serif; font-size: 2rem; margin-bottom: 1rem; }
        .login-visual p { color: #aaa; max-width: 300px; line-height: 1.6; }
        
        .login-form-wrapper { padding: 3rem; display: flex; flex-direction: column; justify-content: center; }
        .login-header h3 { font-family: 'Cinzel', serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #1a1a1a; }
        .login-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; background: #f9fafb; font-size: 1rem; }
        .login-btn { width: 100%; padding: 12px; background: #1a1a1a; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
        .login-btn:hover { background: #FFA500; color: black; }
        
        .toggle-link { color: #FFA500; cursor: pointer; font-weight: bold; background: none; border: none; padding: 0; margin-left: 5px; }
        @media (max-width: 768px) { .login-card { grid-template-columns: 1fr; } .login-visual { display: none; } }
      `}</style>

      <motion.div className="login-card" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration:0.5}}>
        <div className="login-visual">
            <h2>Welcome Back</h2>
            <p>Access your dashboard to manage your subscriptions and profile.</p>
        </div>
        
        <div className="login-form-wrapper">
            {view === 'login' ? (
                <form onSubmit={handleLogin}>
                    <div className="login-header">
                        <h3>Sign In</h3>
                        <p style={{color:'#666', marginBottom:'2rem', fontSize:'0.9rem'}}>Enter your credentials to continue.</p>
                    </div>
                    <input type="email" placeholder="Email Address" className="login-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="login-input" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', fontSize:'0.85rem'}}>
                        <button type="button" onClick={() => setView('forgot')} style={{background:'none', border:'none', color:'#666', cursor:'pointer'}}>Forgot Password?</button>
                        <button type="button" onClick={() => setView('forgot')} style={{background:'none', border:'none', color:'#FFA500', cursor:'pointer', fontWeight:'bold'}}>No Password?</button>
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>{isLoading ? 'Loading...' : 'Sign In'}</button>
                    
                    {error && <div style={{marginTop:'1rem', color:'#ef4444', background:'#fee2e2', padding:'10px', borderRadius:'6px', fontSize:'0.9rem', textAlign:'center'}}>{error}</div>}
                </form>
            ) : (
                <form onSubmit={handleForgotPassword}>
                    <div className="login-header">
                        <h3>Reset Password</h3>
                        <p style={{color:'#666', marginBottom:'2rem', fontSize:'0.9rem'}}>Enter your email to receive a reset link.</p>
                    </div>
                    <input type="email" placeholder="Email Address" className="login-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    
                    <button type="submit" className="login-btn" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Reset Link'}</button>
                    <button type="button" onClick={() => setView('login')} style={{width:'100%', padding:'12px', background:'white', border:'1px solid #ddd', color:'#666', borderRadius:'8px', marginTop:'10px', cursor:'pointer'}}>Back to Login</button>

                    {successMsg && <div style={{marginTop:'1rem', color:'#166534', background:'#dcfce7', padding:'10px', borderRadius:'6px', fontSize:'0.9rem', textAlign:'center'}}>{successMsg}</div>}
                    {error && <div style={{marginTop:'1rem', color:'#ef4444', background:'#fee2e2', padding:'10px', borderRadius:'6px', fontSize:'0.9rem', textAlign:'center'}}>{error}</div>}
                </form>
            )}
        </div>
      </motion.div>
    </div>
  );
}

export default MyAccountPage;