import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'; 

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000'; 

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const Dashboard = () => {
  // --- DASHBOARD STATE ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); 
  const [tableData, setTableData] = useState([]); 
  const [stats, setStats] = useState({ userCount: 0, eventCount: 0, msgCount: 0 });
  const [loadingData, setLoadingData] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '', subText: '' });
  const fileInputRef = useRef(null);

  // --- SHORTCUTS ---
  useKeyboardShortcut('s', () => setIsSearchOpen(true));
  useKeyboardShortcut('Escape', () => {
      setIsSearchOpen(false);
      setSelectedUser(null);
  });

  // --- API FUNCTIONS ---
  const fetchStats = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/data/list`); 
        const data = await res.json();
        if (data.userCount !== undefined) setStats(data);
    } catch (err) { console.error("Stats error", err); }
  };

  const fetchData = async (type) => {
    setLoadingData(true);
    setTableData([]); 
    try {
        const res = await fetch(`${API_BASE_URL}/api/data/list?type=${type}`);
        const data = await res.json();
        if (Array.isArray(data)) setTableData(data);
    } catch (error) {
        console.error("Failed to load data", error);
    } finally {
        setLoadingData(false);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchStats();
    fetchData(activeTab);
  }, [activeTab]);

  // --- MOCK DATA GENERATOR ---
  const generateMockUserDetails = (user) => {
    const hasGym = Math.random() > 0.5;
    const hasHostel = Math.random() > 0.5;
    const hasLibrary = Math.random() > 0.5;
    const equipped = [];
    const notEquipped = [];
    if (hasGym) equipped.push('Gym'); else notEquipped.push('Gym');
    if (hasHostel) equipped.push('Hostel'); else notEquipped.push('Hostel');
    if (hasLibrary) equipped.push('Library'); else notEquipped.push('Library');

    const gymPending = hasGym && Math.random() > 0.7 ? 500 : 0;
    const hostelPending = hasHostel && Math.random() > 0.8 ? 2000 : 0;
    const libraryPending = hasLibrary && Math.random() > 0.6 ? 200 : 0;
    const totalPending = gymPending + hostelPending + libraryPending;

    const generateHistory = (service) => {
        if (!equipped.includes(service)) return [];
        return [
            { date: '2023-12-01', amount: 500, status: 'Paid' },
            { date: '2023-11-01', amount: 500, status: 'Paid' },
        ];
    };

    return {
        ...user,
        details: {
            equipped,
            notEquipped,
            pendingBreakdown: { gym: gymPending, hostel: hostelPending, library: libraryPending },
            totalPending,
            history: { gym: generateHistory('Gym'), hostel: generateHistory('Hostel'), library: generateHistory('Library') }
        }
    };
  };

  const handleUserClick = (user) => {
      const fullUserDetails = generateMockUserDetails(user);
      setSelectedUser(fullUserDetails);
  };

  // --- DELETE HANDLER ---
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
        } else {
            alert("Error deleting record");
        }
    } catch (error) { alert("Network Error"); }
  };

  // --- IMPORT EXCEL HANDLER ---
  const handleImportClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setStatusMsg({ type: 'info', text: 'Uploading Excel file...', subText: 'Processing user data...' });

    try {
        const response = await fetch(`${API_BASE_URL}/api/data/import`, { method: 'POST', body: formData });
        const data = await response.json();
        if (response.ok) {
            setStatusMsg({ type: 'success', text: `✅ Import Successful`, subText: `${data.count || 'Users'} records added.` });
            if (activeTab === 'users') fetchData('users'); 
            fetchStats(); 
        } else {
            setStatusMsg({ type: 'error', text: `⚠️ Import Failed: ${data.message}` });
        }
    } catch (error) {
        setStatusMsg({ type: 'error', text: '❌ Network Error', subText: 'Ensure server is running.' });
    } finally {
        setUploading(false);
        e.target.value = null; 
    }
  };

  const handleExportClick = () => {
    window.open(`${API_BASE_URL}/api/data/export?type=${activeTab}`, '_blank');
  };

  // --- RENDER HELPERS ---
  const renderTableHeaders = () => {
    const style = { padding: '12px', fontWeight: '600' };
    const common = <><th style={style}>Actions</th></>;
    if (activeTab === 'users') return <><th style={style}>Name</th><th style={style}>Email</th><th style={style}>Phone</th><th style={style}>Status</th>{common}</>;
    if (activeTab === 'events') return <><th style={style}>Participant</th><th style={style}>Event</th><th style={style}>Email</th><th style={style}>Date</th>{common}</>;
    if (activeTab === 'messages') return <><th style={style}>Sender</th><th style={style}>Subject</th><th style={style}>Message</th><th style={style}>Sent At</th>{common}</>;
  };

  const renderTableRows = () => {
    const style = { padding: '12px', verticalAlign: 'top' };
    const btnStyle = { background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

    return tableData.map((row) => {
        const rowStyle = { borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem', cursor: activeTab === 'users' ? 'pointer' : 'default' };
        const deleteCell = (
            <td style={style}>
                <button onClick={(e) => handleDelete(e, row._id)} style={btnStyle}>🗑️ Delete</button>
            </td>
        );

        if (activeTab === 'users') return (
            <tr key={row._id} style={rowStyle} onClick={() => handleUserClick(row)} className="hover-row">
                <td style={style}><strong>{row.name}</strong></td>
                <td style={style}>{row.email}</td>
                <td style={style}>{row.phone}</td>
                <td style={style}>{row.isVerified ? '✅ Verified' : '⏳ Pending'}</td>
                {deleteCell}
            </tr>
        );
        if (activeTab === 'events') return <tr key={row._id} style={rowStyle}><td style={style}><strong>{row.name}</strong></td><td style={style}>{row.eventTitle || row.eventId}</td><td style={style}>{row.email}</td><td style={style}>{new Date(row.registeredAt).toLocaleDateString()}</td>{deleteCell}</tr>;
        if (activeTab === 'messages') return <tr key={row._id} style={rowStyle}><td style={style}><strong>{row.name}</strong></td><td style={style}>{row.subject}</td><td style={style}>{row.message?.substring(0, 20)}...</td><td style={style}>{new Date(row.createdAt).toLocaleDateString()}</td>{deleteCell}</tr>;
        return null;
    });
  };

  const renderPaymentList = (title, history, pendingAmount) => {
      const isPending = pendingAmount > 0;
      const boxStyle = { border: isPending ? '2px solid #ef4444' : '1px solid #eee', background: isPending ? '#fff5f5' : 'white', borderRadius: '8px', padding: '15px' };
      const headerStyle = { borderBottom: isPending ? '1px solid #fca5a5' : '2px solid #eee', paddingBottom:'5px', color: isPending ? '#b91c1c' : '#555', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

      return (
        <div className="payment-column" style={boxStyle}>
            <h4 style={headerStyle}>{title} {isPending && <span style={{fontSize:'0.7rem', background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:'4px'}}>⚠️ Pending: ₹{pendingAmount}</span>}</h4>
            {history && history.length > 0 ? (
                <ul style={{listStyle:'none', padding:0}}>
                    {history.map((pay, i) => (
                        <li key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px dashed #eee', fontSize:'0.85rem'}}>
                            <span>{pay.date}</span><span style={{fontWeight:'bold', color:'#065f46'}}>₹{pay.amount}</span>
                        </li>
                    ))}
                </ul>
            ) : (<p style={{fontStyle:'italic', color:'#999', fontSize:'0.85rem'}}>No payment history</p>)}
        </div>
      );
  };

  return (
    <motion.div className="dashboard-container" initial="hidden" animate="visible" variants={containerVariants}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .dashboard-container { min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f3f4f6; padding: 2rem; }
        body.dark-mode .dashboard-container { background: #111; }
        h1, h2, h3 { font-family: 'Cinzel', serif; letter-spacing: 0.05em; color: #1a1a1a; }
        .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .stat-val { font-size: 2rem; font-weight: 700; color: #1a1a1a; margin: 5px 0; }
        .content-split { display: grid; grid-template-columns: 3fr 1fr; gap: 2rem; }
        @media (max-width: 1000px) { .content-split { grid-template-columns: 1fr; } }
        .content-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); min-height: 400px; }
        .tabs { display: flex; gap: 20px; border-bottom: 2px solid #eee; margin-bottom: 20px; }
        .tab-btn { background: none; border: none; padding-bottom: 10px; cursor: pointer; font-family: 'Cinzel', serif; font-weight: bold; font-size: 1rem; color: #888; border-bottom: 3px solid transparent; transition: all 0.3s; }
        .tab-btn.active { color: #FFA500; border-bottom-color: #FFA500; }
        .action-btn { padding: 12px; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; margin-bottom: 10px; border: 1px solid #ddd; background: white; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .action-btn:hover { background: #f9f9f9; }
        .status-msg { margin-top: 15px; padding: 10px; border-radius: 6px; font-size: 0.85rem; }
        .status-success { background: #d1fae5; color: #065f46; }
        .status-error { background: #fee2e2; color: #991b1b; }
        .hover-row:hover { background-color: #f9fafb; transition: background 0.2s; }
        .search-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .search-modal { background: white; width: 90%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .user-detail-modal { background: white; width: 90%; max-width: 900px; max-height:90vh; overflow-y:auto; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); padding: 0; }
        .ud-header { background: #1a1a1a; color: white; padding: 2rem; position: relative; }
        .ud-close { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; }
        .ud-body { padding: 2rem; }
        .ud-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .ud-card { background: #f9fafb; padding: 1.5rem; border-radius: 12px; border: 1px solid #eee; }
        .ud-tag { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-right: 5px; margin-bottom: 5px; }
        .ud-tag.green { background: #d1fae5; color: #065f46; }
        .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 1rem; }
        @media (max-width: 768px) { .ud-grid, .payment-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header and Stats */}
      <div className="dash-header">
        <div>
          <p style={{color:'#888', fontSize:'0.9rem', textTransform:'uppercase'}}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Admin Dashboard</h1>
        </div>
        <div style={{background:'#eee', padding:'8px 15px', borderRadius:'8px', fontSize:'0.8rem', color:'#555'}}>Search: <strong>S</strong></div>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card" variants={itemVariants}>
            <div style={{color:'#888', textTransform:'uppercase', fontSize:'0.8rem'}}>Total Members</div>
            <div className="stat-val">{stats.userCount}</div>
        </motion.div>
        <motion.div className="stat-card" variants={itemVariants}>
            <div style={{color:'#888', textTransform:'uppercase', fontSize:'0.8rem'}}>Event Registrations</div>
            <div className="stat-val" style={{color:'#FFA500'}}>{stats.eventCount}</div>
        </motion.div>
        <motion.div className="stat-card" variants={itemVariants}>
            <div style={{color:'#888', textTransform:'uppercase', fontSize:'0.8rem'}}>Messages</div>
            <div className="stat-val" style={{color:'#4f46e5'}}>{stats.msgCount}</div>
        </motion.div>
      </div>

      <div className="content-split">
        <motion.div className="content-card" variants={itemVariants}>
          <div className="tabs">
            <button className={`tab-btn ${activeTab==='users'?'active':''}`} onClick={()=>setActiveTab('users')}>Users</button>
            <button className={`tab-btn ${activeTab==='events'?'active':''}`} onClick={()=>setActiveTab('events')}>Event Registrations</button>
            <button className={`tab-btn ${activeTab==='messages'?'active':''}`} onClick={()=>setActiveTab('messages')}>Messages</button>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
             <h3 style={{fontSize:'1.2rem', margin:0}}>Recent {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
             <button onClick={()=>fetchData(activeTab)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem'}} title="Refresh">🔄</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loadingData ? <p style={{textAlign:'center', padding:'20px'}}>Loading...</p> : 
             tableData.length === 0 ? <p style={{textAlign:'center', padding:'20px', color:'#999'}}>No data found.</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd', color: '#888' }}>{renderTableHeaders()}</tr></thead>
                <tbody>{renderTableRows()}</tbody>
              </table>
            )}
          </div>
        </motion.div>

        <motion.div className="content-card" variants={itemVariants} style={{ height: 'fit-content' }}>
          <h3>Actions</h3>
          <p style={{color:'#666', fontSize:'0.9rem', marginBottom:'20px'}}>Manage data for <strong>{activeTab}</strong>.</p>
          
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
          {activeTab === 'users' && <button className="action-btn" onClick={handleImportClick} disabled={uploading}>📂 {uploading ? 'Importing...' : 'Import Users (Excel)'}</button>}
          <button className="action-btn" onClick={handleExportClick}>⬇ Export {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (Excel)</button>

          <AnimatePresence>
            {statusMsg.text && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={`status-msg status-${statusMsg.type}`}>
                    <strong>{statusMsg.text}</strong>
                    {statusMsg.subText && <div style={{marginTop:'5px', fontSize:'0.8em'}}>{statusMsg.subText}</div>}
                </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* --- SEARCH MODAL --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div className="search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchOpen(false)}>
            <motion.div className="search-modal" onClick={(e) => e.stopPropagation()} variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <div className="search-header"><span style={{ fontSize: '1.5rem', color: '#ccc' }}>🔍</span><input autoFocus type="text" placeholder="Search database..." className="search-input" /></div>
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
                        <h2 style={{color:'white', margin:0, fontSize:'1.8rem'}}>{selectedUser.name}</h2>
                        <p style={{opacity:0.8, margin:'5px 0 0 0'}}>{selectedUser.email} | {selectedUser.phone}</p>
                    </div>

                    <div className="ud-body">
                        {/* Status Cards */}
                        <div className="ud-grid">
                            <div className="ud-card">
                                <h4 style={{margin:'0 0 10px 0', color:'#888'}}>Equipped Services</h4>
                                <div>
                                    {selectedUser.details.equipped.length > 0 ? 
                                     selectedUser.details.equipped.map(s => <span key={s} className="ud-tag green">✅ {s}</span>) : 
                                     <span style={{color:'#999'}}>None</span>}
                                </div>
                            </div>
                            <div className="ud-card">
                                <h4 style={{margin:'0 0 10px 0', color:'#888'}}>Not Equipped</h4>
                                <div>
                                    {selectedUser.details.notEquipped.length > 0 ? 
                                     selectedUser.details.notEquipped.map(s => <span key={s} className="ud-tag" style={{background:'#eee', color:'#555'}}>❌ {s}</span>) : 
                                     <span style={{color:'#999'}}>All services active</span>}
                                </div>
                            </div>
                            <div className="ud-card" style={{border: selectedUser.details.totalPending > 0 ? '1px solid #fca5a5' : '1px solid #eee', background: selectedUser.details.totalPending > 0 ? '#fff1f2' : '#f9fafb'}}>
                                <h4 style={{margin:'0 0 10px 0', color:'#888'}}>Total Pending Fees</h4>
                                <div style={{fontSize:'1.5rem', fontWeight:'bold', color: selectedUser.details.totalPending > 0 ? '#b91c1c' : '#065f46'}}>
                                    ₹{selectedUser.details.totalPending}
                                </div>
                            </div>
                        </div>

                        {/* Payment History Section */}
                        <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'10px'}}>Payment & Status</h3>
                        <div className="payment-grid">
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