import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'; 
import AdminDataPanel from './AdminDataPanel';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; 
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } } };
const modalVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };

const Dashboard = ({ setPage }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for Admin

  const [activeTab, setActiveTab] = useState('users'); 
  const [tableData, setTableData] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [stats, setStats] = useState({ userCount: 0, eventCount: 0, msgCount: 0, libUserCount: 0, issuedBooksCount: 0 });
  const [loadingData, setLoadingData] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '', subText: '' });

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newEvent, setNewEvent] = useState({
      title: '', category: 'Wellness', date: '', time: '', location: '', imageUrl: '', shortDescription: ''
  });

  const searchInputRef = useRef(null); 

  useKeyboardShortcut('s', () => { if (isAuthenticated && searchInputRef.current) searchInputRef.current.focus(); });
  useKeyboardShortcut('Escape', () => {
      setSelectedUser(null);
      setIsPublishModalOpen(false);
      if (searchInputRef.current && document.activeElement === searchInputRef.current) searchInputRef.current.blur();
  });

  const handleLogin = (e) => {
      e.preventDefault();
      if (passwordInput === ADMIN_PASSWORD) { setIsAuthenticated(true); setLoginError(''); } 
      else { setLoginError('Incorrect password.'); setPasswordInput(''); }
  };

  const fetchStats = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/data/list`); 
        const data = await res.json();
        setStats({ ...data, libUserCount: data.libUserCount || 0, issuedBooksCount: data.issuedBooksCount || 0 });
    } catch (err) { console.error("Stats error", err); }
  };

  const fetchData = async (type) => {
    setLoadingData(true);
    setTableData([]); 
    try {
        const res = await fetch(`${API_BASE_URL}/api/data/list?type=${type}`);
        const data = await res.json();
        if (Array.isArray(data)) setTableData(data);
    } catch (error) { console.error("Failed to load data.", error); } 
    finally { setLoadingData(false); }
  };

  useEffect(() => {
    if (isAuthenticated) { fetchStats(); fetchData(activeTab); setSearchTerm(''); }
  }, [activeTab, isAuthenticated]);

  const handleDataRefresh = (importedCategory) => {
      if (importedCategory === activeTab) fetchData(activeTab);
      fetchStats();
  };

  const handlePublishEvent = async (e) => {
      e.preventDefault();
      setIsPublishing(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/data/publish-event`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEvent)
          });
          if (res.ok) {
              setStatusMsg({ type: 'success', text: 'Event Published Successfully!' });
              setIsPublishModalOpen(false);
              setNewEvent({ title: '', category: 'Wellness', date: '', time: '', location: '', imageUrl: '', shortDescription: '' });
              setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
          } else {
              const errorData = await res.json();
              alert(`Error: ${errorData.error || 'Failed to publish'}`);
          }
      } catch (err) { alert("Network error."); } finally { setIsPublishing(false); }
  };

  const filteredData = tableData.filter((row) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      if (activeTab === 'users') return (row.name?.toLowerCase().includes(term) || row.email?.toLowerCase().includes(term) || row.phone?.toString().includes(term));
      if (activeTab === 'library_users') return (row.name?.toLowerCase().includes(term) || row.seatNo?.toString().includes(term));
      if (activeTab === 'library_books') return (row.borrowerName?.toLowerCase().includes(term) || row.bookTitle?.toLowerCase().includes(term) || row.bookId?.toString().includes(term) || row.status?.toLowerCase().includes(term));
      if (activeTab === 'events') return (row.name?.toLowerCase().includes(term) || row.eventTitle?.toLowerCase().includes(term) || row.email?.toLowerCase().includes(term));
      if (activeTab === 'messages') return (row.name?.toLowerCase().includes(term) || row.subject?.toLowerCase().includes(term) || row.message?.toLowerCase().includes(term));
      return true;
  });

  const handleUserClick = (user) => {
      if (activeTab === 'users') {
          const ALL_SERVICES = ['Gym', 'Hostel', 'Library'];
          const programs = user.programs || [];
          const payments = user.payments || [];
          const equipped = programs.filter(p => p.status === 'active').map(p => p.name);
          const notEquipped = ALL_SERVICES.filter(service => !equipped.includes(service));
          const getHistory = (serviceName) => payments.filter(pay => pay.eventName && pay.eventName.toLowerCase().includes(serviceName.toLowerCase())).map(pay => ({ date: new Date(pay.date).toLocaleDateString(), amount: pay.amount, status: pay.status }));

          setSelectedUser({
              ...user, details: { equipped, notEquipped, pendingBreakdown: { gym: 0, hostel: 0, library: 0 }, totalPending: 0, history: { gym: getHistory('Gym'), hostel: getHistory('Hostel'), library: getHistory('Library') } }
          });
      }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/data/delete/${id}?type=${activeTab}`, { method: 'DELETE' });
        if (res.ok) {
            setTableData(prev => prev.filter(item => item._id !== id));
            fetchStats();
            setStatusMsg({ type: 'success', text: 'Deleted successfully' });
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
            if (selectedUser && selectedUser._id === id) setSelectedUser(null);
        } else { alert("Error deleting record"); }
    } catch (error) { alert("Network Error"); }
  };

  const renderTableHeaders = () => {
    const style = { padding: '12px', fontWeight: '600' };
    const common = <><th style={style}>Actions</th></>;
    if (activeTab === 'users') return <><th style={style}>Name</th><th style={style}>Email</th><th style={style}>Phone</th><th style={style}>Status</th>{common}</>;
    if (activeTab === 'library_users') return <><th style={style}>Seat No</th><th style={style}>Name</th><th style={style}>Enroll Date</th>{common}</>;
    if (activeTab === 'library_books') return <><th style={style}>Borrower</th><th style={style}>Book Title</th><th style={style}>Book ID</th><th style={style}>Status</th>{common}</>;
    if (activeTab === 'events') return <><th style={style}>Participant</th><th style={style}>Event</th><th style={style}>Email</th><th style={style}>Date</th>{common}</>;
    if (activeTab === 'messages') return <><th style={style}>Sender</th><th style={style}>Subject</th><th style={style}>Message</th><th style={style}>Sent At</th>{common}</>;
  };

  const renderTableRows = () => {
    const style = { padding: '12px', verticalAlign: 'top' };
    const btnStyle = { background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

    return filteredData.map((row) => {
        const rowStyle = { borderBottom: isDarkMode ? '1px solid #333' : '1px solid #f3f4f6', fontSize: '0.9rem', cursor: activeTab === 'users' ? 'pointer' : 'default' };
        const deleteCell = (<td style={style}><button onClick={(e) => handleDelete(e, row._id || row.id)} style={btnStyle}>🗑️ Delete</button></td>);

        if (activeTab === 'users') return <tr key={row._id} style={rowStyle} onClick={() => handleUserClick(row)} className="hover-row"><td style={style}><strong>{row.name}</strong></td><td style={style}>{row.email}</td><td style={style}>{row.phone}</td><td style={style}>{row.isVerified ? '✅ Verified' : '⏳ Pending'}</td>{deleteCell}</tr>;
        if (activeTab === 'library_users') return <tr key={row._id || row.seatNo} style={rowStyle} className="hover-row"><td style={{...style, fontWeight: 'bold', color: '#ea580c'}}>Seat {row.seatNo}</td><td style={style}><strong>{row.name}</strong></td><td style={style}>{row.enrollDate ? new Date(row.enrollDate).toLocaleDateString() : 'N/A'}</td>{deleteCell}</tr>;
        if (activeTab === 'library_books') return <tr key={row._id || row.issueId} style={rowStyle} className="hover-row"><td style={style}><strong>{row.borrowerName}</strong></td><td style={style}>{row.bookTitle}</td><td style={{...style, color: '#666'}}>ID: {row.bookId}</td><td style={style}><span style={{background: row.status === 'Returned' ? '#dcfce7' : '#fee2e2', color: row.status === 'Returned' ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>{row.status || 'Issued'}</span></td>{deleteCell}</tr>;
        if (activeTab === 'events') return <tr key={row._id} style={rowStyle}><td style={style}><strong>{row.name}</strong></td><td style={style}>{row.eventTitle || row.eventId}</td><td style={style}>{row.email}</td><td style={style}>{row.registeredAt ? new Date(row.registeredAt).toLocaleDateString() : 'N/A'}</td>{deleteCell}</tr>;
        if (activeTab === 'messages') return <tr key={row._id} style={rowStyle}><td style={style}><strong>{row.name}</strong></td><td style={style}>{row.subject}</td><td style={style}>{row.message?.substring(0, 20)}...</td><td style={style}>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</td>{deleteCell}</tr>;
        return null;
    });
  };

  const renderPaymentList = (title, history, pendingAmount) => {
      const isPending = pendingAmount > 0;
      const boxStyle = { border: isPending ? '2px solid #ef4444' : (isDarkMode ? '1px solid #333' : '1px solid #eee'), background: isPending ? (isDarkMode ? '#2d1a1a' : '#fff5f5') : (isDarkMode ? '#222' : 'white'), borderRadius: '8px', padding: '15px' };
      return (
        <div className="payment-column" style={boxStyle}>
            <h4 style={{ borderBottom: isPending ? '1px solid #fca5a5' : (isDarkMode ? '1px solid #444' : '2px solid #eee'), paddingBottom:'5px', color: isPending ? '#ef4444' : (isDarkMode ? '#eee' : '#555'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title} {isPending && <span style={{fontSize:'0.7rem', background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:'4px'}}>⚠️ Pending: ₹{pendingAmount}</span>}
            </h4>
            {history && history.length > 0 ? (
                <ul style={{listStyle:'none', padding:0}}>
                    {history.map((pay, i) => <li key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: isDarkMode ? '1px dashed #444' : '1px dashed #eee', fontSize:'0.85rem'}}><span>{pay.date}</span><span style={{fontWeight:'bold', color: isDarkMode ? '#4ade80' : '#065f46'}}>₹{pay.amount}</span></li>)}
                </ul>
            ) : (<p style={{fontStyle:'italic', color:'#888', fontSize:'0.85rem'}}>No payment history</p>)}
        </div>
      );
  };

  if (!isAuthenticated) {
      return (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', fontFamily: 'Montserrat, sans-serif' }}>
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#1e1e1e', padding: '3rem', borderRadius: '16px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #333' }}>
                  <h1 style={{ fontFamily: 'Cinzel, serif', color: '#ea580c', marginBottom: '10px' }}>SHIVBA ADMIN</h1>
                  <p style={{ color: '#aaa', marginBottom: '2rem' }}>Please enter the master password.</p>
                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <input type="password" placeholder="Admin Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ padding: '15px', borderRadius: '8px', border: '2px solid #333', background: '#111', color: '#fff', fontSize: '1rem', outline: 'none' }} autoFocus />
                      {loginError && <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>{loginError}</span>}
                      <button type="submit" style={{ padding: '15px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>UNLOCK DASHBOARD</button>
                  </form>
              </motion.div>
          </div>
      );
  }

  return (
    <motion.div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`} initial="hidden" animate="visible" variants={containerVariants}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .dashboard-container { min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f3f4f6; padding: 2rem; transition: background 0.3s ease; }
        .dashboard-container.dark-mode { background: #111; color: #e0e0e0; }
        
        h1, h2, h3 { font-family: 'Cinzel', serif; letter-spacing: 0.05em; color: #1a1a1a; transition: color 0.3s; }
        .dark-mode h1, .dark-mode h2, .dark-mode h3 { color: #ffffff; }

        .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        
        .stat-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid transparent; transition: all 0.3s; }
        .dark-mode .stat-card { background: #1e1e1e; border-color: #333; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
        
        .stat-val { font-size: 2rem; font-weight: 700; color: #1a1a1a; margin: 5px 0; }
        .dark-mode .stat-val { color: #fff; }

        .content-split { display: grid; grid-template-columns: 3fr 1fr; gap: 2rem; }
        @media (max-width: 1000px) { .content-split { grid-template-columns: 1fr; } }

        .content-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); min-height: 400px; border: 1px solid transparent; transition: all 0.3s; }
        .dark-mode .content-card { background: #1e1e1e; border-color: #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }

        .tabs { display: flex; gap: 15px; border-bottom: 2px solid #eee; margin-bottom: 20px; overflow-x: auto; white-space: nowrap; padding-bottom: 5px; }
        .dark-mode .tabs { border-bottom-color: #333; }
        
        .tab-btn { background: none; border: none; padding-bottom: 10px; cursor: pointer; font-family: 'Cinzel', serif; font-weight: bold; font-size: 0.95rem; color: #888; border-bottom: 3px solid transparent; transition: all 0.3s; }
        .tab-btn.active { color: #ea580c; border-bottom-color: #ea580c; }

        .search-bar { padding: 8px 15px; border-radius: 8px; border: 1px solid #ddd; outline: none; font-family: 'Montserrat'; width: 250px; font-size: 0.95rem; transition: all 0.3s; }
        .dark-mode .search-bar { background: #111; border-color: #444; color: #fff; }
        .search-bar:focus { border-color: #ea580c; box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.1); }

        .hover-row:hover { background-color: #f9fafb; transition: background 0.2s; }
        .dark-mode .hover-row:hover { background-color: #252525; }

        /* Modals */
        .search-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .user-detail-modal { background: white; width: 90%; max-width: 900px; max-height:90vh; overflow-y:auto; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid transparent; }
        .dark-mode .user-detail-modal { background: #1e1e1e; border-color: #444; }
        
        .ud-header { background: #1a1a1a; color: white; padding: 2rem; position: relative; }
        .ud-body { padding: 2rem; }
        .ud-card { background: #f9fafb; padding: 1.5rem; border-radius: 12px; border: 1px solid #eee; transition: all 0.3s; }
        .dark-mode .ud-card { background: #111; border-color: #333; }

        .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; font-family: 'Montserrat'; transition: all 0.3s; }
        .dark-mode .form-input { background: #111; border-color: #444; color: #fff; }
        .form-label { font-weight: bold; margin-bottom: 5px; display: block; font-size: 0.9rem; color: #444; }
        .dark-mode .form-label { color: #aaa; }

        .theme-toggle { background: #333; color: #fff; border: none; padding: 8px 12px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; font-weight: 700; margin-right: 10px; }
        .dark-mode .theme-toggle { background: #ea580c; }
      `}</style>

      <div className="dash-header">
        <div>
          <p style={{color:'#888', fontSize:'0.9rem', textTransform:'uppercase'}}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Admin Dashboard</h1>
        </div>
        <div style={{background: isDarkMode ? '#1e1e1e' : '#eee', padding:'8px 15px', borderRadius:'8px', fontSize:'0.8rem', color: isDarkMode ? '#aaa' : '#555', display: 'flex', alignItems: 'center', gap: '10px', border: isDarkMode ? '1px solid #333' : 'none'}}>
            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '☀️ Light' : '🌙 Dark'}</button>
            <span>Search: <strong>S</strong></span>
            <button onClick={() => setIsAuthenticated(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card" variants={itemVariants}><div style={{color:'#888', textTransform:'uppercase', fontSize:'0.8rem'}}>Total App Users</div><div className="stat-val">{stats.userCount}</div></motion.div>
        <motion.div className="stat-card" variants={itemVariants}><div style={{color:'#888', textTransform:'uppercase', fontSize:'0.8rem'}}>Library Seats Taken</div><div className="stat-val" style={{color:'#ea580c'}}>{stats.libUserCount}</div></motion.div>
        <motion.div className="stat-card" variants={itemVariants}><div style={{color:'#888', textTransform:'uppercase', fontSize:'0.8rem'}}>Books Issued</div><div className="stat-val" style={{color: isDarkMode ? '#4ade80' : '#059669'}}>{stats.issuedBooksCount}</div></motion.div>
        <motion.div className="stat-card" variants={itemVariants}><div style={{color:'#888', textTransform:'uppercase', fontSize:'0.8rem'}}>Event Registrations</div><div className="stat-val" style={{color:'#FFA500'}}>{stats.eventCount}</div></motion.div>
      </div>

      <div className="content-split">
        <motion.div className="content-card" variants={itemVariants}>
          <div className="tabs">
            <button className={`tab-btn ${activeTab==='users'?'active':''}`} onClick={()=>setActiveTab('users')}>All Users</button>
            <button className={`tab-btn ${activeTab==='library_users'?'active':''}`} onClick={()=>setActiveTab('library_users')}>Library Users</button>
            <button className={`tab-btn ${activeTab==='library_books'?'active':''}`} onClick={()=>setActiveTab('library_books')}>Issued Books</button>
            <button className={`tab-btn ${activeTab==='events'?'active':''}`} onClick={()=>setActiveTab('events')}>Events</button>
            <button className={`tab-btn ${activeTab==='messages'?'active':''}`} onClick={()=>setActiveTab('messages')}>Messages</button>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:'15px', flexWrap: 'wrap', gap: '10px'}}>
             <h3 style={{fontSize:'1.2rem', margin:0}}>Recent {activeTab === 'library_users' ? 'Library Users' : activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
             <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                 <input ref={searchInputRef} type="text" placeholder={`Search ${activeTab.replace('_', ' ')}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-bar" />
                 <button onClick={()=>fetchData(activeTab)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}} title="Refresh Data">🔄</button>
             </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loadingData ? <p style={{textAlign:'center', padding:'20px'}}>Loading...</p> : 
             filteredData.length === 0 ? <p style={{textAlign:'center', padding:'20px', color:'#888'}}>No matches found.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead><tr style={{ textAlign: 'left', borderBottom: isDarkMode ? '1px solid #333' : '1px solid #ddd', color: '#888' }}>{renderTableHeaders()}</tr></thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
            )}
          </div>
        </motion.div>

        <motion.div className="content-card" variants={itemVariants} style={{ height: 'fit-content', padding: '1rem' }}>
          <button className="action-btn library-nav-btn" onClick={() => setPage && setPage('library_dashboard')} style={{ width: '100%', border: 'none' }}>📚 Open Library Dashboard</button>
          
          {activeTab === 'events' && (
              <button className="action-btn" onClick={() => setIsPublishModalOpen(true)} style={{ background: '#10b981', color: 'white', border: 'none', marginBottom: '20px', width: '100%', padding: '12px', borderRadius: '8px' }}>📢 Publish New Event</button>
          )}

          <hr style={{border:'none', borderTop: isDarkMode ? '1px solid #333' : '1px solid #eee', marginBottom:'10px'}}/>
          <AdminDataPanel refreshDashboard={handleDataRefresh} />
          
          <AnimatePresence>
            {statusMsg.text && (
                <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className={`status-msg status-${statusMsg.type}`} style={{ background: statusMsg.type === 'success' ? '#065f46' : '#991b1b', color: '#fff', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
                    <strong>{statusMsg.text}</strong>
                </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* --- PUBLISH EVENT MODAL --- */}
      <AnimatePresence>
        {isPublishModalOpen && (
            <motion.div className="search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPublishModalOpen(false)}>
                <motion.div className="user-detail-modal" onClick={(e) => e.stopPropagation()} variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={{ maxWidth: '600px' }}>
                    <div className="ud-header" style={{ padding: '1.5rem 2rem' }}>
                        <button className="ud-close" onClick={() => setIsPublishModalOpen(false)}>✕</button>
                        <h2 style={{color:'white', margin:0, fontSize:'1.5rem'}}>📢 Publish New Event</h2>
                    </div>
                    <div className="ud-body" style={{ padding: '2rem' }}>
                        <form onSubmit={handlePublishEvent}>
                            <label className="form-label">Event Title</label>
                            <input required type="text" className="form-input" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g., Morning Zumba Blast" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label className="form-label">Category</label><select className="form-input" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}><option value="Wellness">Wellness</option><option value="Education">Education</option><option value="Culture">Culture</option><option value="Fitness">Fitness</option></select></div>
                                <div><label className="form-label">Date</label><input required type="date" className="form-input" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label className="form-label">Time Frame</label><input required type="text" className="form-input" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} placeholder="e.g., 10:00 AM" /></div>
                                <div><label className="form-label">Location</label><input required type="text" className="form-input" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} placeholder="Location..." /></div>
                            </div>
                            <label className="form-label">Image URL</label>
                            <input required type="url" className="form-input" value={newEvent.imageUrl} onChange={e => setNewEvent({...newEvent, imageUrl: e.target.value})} placeholder="https://..." />
                            <label className="form-label">Short Description</label>
                            <textarea required className="form-input" rows="3" value={newEvent.shortDescription} onChange={e => setNewEvent({...newEvent, shortDescription: e.target.value})} placeholder="Description..."></textarea>
                            <button type="submit" disabled={isPublishing} style={{ width: '100%', padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: isPublishing ? 'not-allowed' : 'pointer' }}>{isPublishing ? 'Publishing...' : 'Publish to Live Website'}</button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- USER DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedUser && (
            <motion.div className="search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)}>
                <motion.div className="user-detail-modal" onClick={(e) => e.stopPropagation()} variants={modalVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="ud-header">
                        <button className="ud-close" onClick={() => setSelectedUser(null)}>✕</button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '40px' }}>
                            <div>
                                <h2 style={{color:'white', margin:0, fontSize:'1.8rem', display: 'flex', alignItems: 'center', gap: '10px'}}>{selectedUser.name} <span style={{ fontSize:'0.8rem', background: selectedUser.isVerified ? '#166534' : '#991b1b', padding:'4px 10px', borderRadius:'20px', fontWeight: 'bold'}}>{selectedUser.isVerified ? '✅ Active' : '⏳ Pending'}</span></h2>
                                <p style={{opacity:0.8, margin:'5px 0 0 0'}}>{selectedUser.email} | {selectedUser.phone}</p>
                            </div>
                            <div style={{textAlign: 'right'}}><p style={{margin:0, opacity:0.8, fontSize: '0.8rem', textTransform: 'uppercase'}}>Joined Date</p><p style={{margin:0, fontWeight:'bold', fontSize:'1.1rem'}}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p></div>
                        </div>
                    </div>
                    <div className="ud-body">
                        <div className="ud-grid">
                            <div className="ud-card"><h4>Joined Services</h4><div>{selectedUser.details.equipped.length > 0 ? selectedUser.details.equipped.map(s => <span key={s} className="ud-tag green" style={{background:'#065f46', color:'#fff', padding:'4px 10px', borderRadius:'20px', fontSize:'0.7rem', marginRight:'5px'}}>✅ {s}</span>) : <span style={{color:'#888'}}>None</span>}</div></div>
                            <div className="ud-card"><h4>Remaining Services</h4><div>{selectedUser.details.notEquipped.length > 0 ? selectedUser.details.notEquipped.map(s => <span key={s} style={{background: isDarkMode ? '#333' : '#eee', color: isDarkMode ? '#aaa' : '#666', padding:'4px 10px', borderRadius:'20px', fontSize:'0.7rem', marginRight:'5px'}}>❌ {s}</span>) : <span style={{color:'#888'}}>All active</span>}</div></div>
                            <div className="ud-card" style={{border: selectedUser.details.totalPending > 0 ? '1px solid #ef4444' : (isDarkMode ? '1px solid #333' : '1px solid #eee')}}><h4>Total Pending Fees</h4><div style={{fontSize:'1.5rem', fontWeight:'bold', color: selectedUser.details.totalPending > 0 ? '#ef4444' : '#4ade80'}}>₹{selectedUser.details.totalPending}</div></div>
                        </div>
                        <h3 style={{borderBottom: isDarkMode ? '1px solid #333' : '1px solid #eee', paddingBottom:'10px', marginBottom:'20px'}}>Payment & Status</h3>
                        <div className="payment-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px'}}>
                            {renderPaymentList('🏋️‍♂️ Gym', selectedUser.details.history.gym, selectedUser.details.pendingBreakdown.gym)}
                            {renderPaymentList('🛏️ Hostel', selectedUser.details.history.hostel, selectedUser.details.pendingBreakdown.hostel)}
                            {renderPaymentList('📚 Library', selectedUser.details.history.library, selectedUser.details.pendingBreakdown.library)}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;