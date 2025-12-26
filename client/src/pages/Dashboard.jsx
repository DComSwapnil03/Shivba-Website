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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // --- DATA STATE ---
  const [activeTab, setActiveTab] = useState('users'); 
  const [tableData, setTableData] = useState([]); 
  const [stats, setStats] = useState({ userCount: 0, eventCount: 0, msgCount: 0 });
  const [loadingData, setLoadingData] = useState(false);

  // --- IMPORT/EXPORT STATE ---
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '', subText: '' });
  const fileInputRef = useRef(null);

  // --- SHORTCUTS ---
  useKeyboardShortcut('s', () => setIsSearchOpen(true));
  useKeyboardShortcut('Escape', () => setIsSearchOpen(false));

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

  useEffect(() => {
    fetchStats();
    fetchData(activeTab);
  }, [activeTab]);

  // --- DELETE HANDLER (NEW) ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record? This cannot be undone.")) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/data/delete/${id}?type=${activeTab}`, {
            method: 'DELETE',
        });
        const data = await res.json();

        if (res.ok) {
            // Remove item from UI instantly (Optimistic UI)
            setTableData(prev => prev.filter(item => item._id !== id));
            fetchStats(); // Update counts
            setStatusMsg({ type: 'success', text: 'Deleted successfully' });
            // Clear message after 3 seconds
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        alert("Network Error: Could not delete.");
    }
  };

  // --- IMPORT/EXPORT HANDLERS ---
  const handleImportClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setStatusMsg({ type: 'info', text: 'Uploading users...', subText: '' });

    try {
        const response = await fetch(`${API_BASE_URL}/api/data/import`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        if (response.ok) {
            setStatusMsg({ type: 'success', text: `✅ ${data.message}`, subText: data.warning ? `⚠️ ${data.warning}` : '' });
            if (activeTab === 'users') fetchData('users'); 
            fetchStats(); 
        } else {
            setStatusMsg({ type: 'error', text: `⚠️ Upload Failed: ${data.message}` });
        }
    } catch (error) {
        setStatusMsg({ type: 'error', text: '❌ Network Error', subText: 'Check backend.' });
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
    const common = <><th style={style}>Actions</th></>; // Action Header

    if (activeTab === 'users') return <><th style={style}>Name</th><th style={style}>Email</th><th style={style}>Phone</th><th style={style}>Status</th>{common}</>;
    if (activeTab === 'events') return <><th style={style}>Participant</th><th style={style}>Event</th><th style={style}>Email</th><th style={style}>Date</th>{common}</>;
    if (activeTab === 'messages') return <><th style={style}>Sender</th><th style={style}>Subject</th><th style={style}>Message</th><th style={style}>Sent At</th>{common}</>;
  };

  const renderTableRows = () => {
    const style = { padding: '12px', verticalAlign: 'top' };
    const btnStyle = { background: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' };

    return tableData.map((row) => {
        const rowStyle = { borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' };
        
        // Delete Button
        const deleteCell = (
            <td style={style}>
                <button onClick={() => handleDelete(row._id)} style={btnStyle} title="Delete Record">
                    🗑️ Delete
                </button>
            </td>
        );

        if (activeTab === 'users') return (
            <tr key={row._id} style={rowStyle}>
                <td style={style}><strong>{row.name}</strong></td>
                <td style={style}>{row.email}</td>
                <td style={style}>{row.phone}</td>
                <td style={style}>{row.isVerified ? '✅ Verified' : '⏳ Pending'}</td>
                {deleteCell}
            </tr>
        );
        if (activeTab === 'events') return (
            <tr key={row._id} style={rowStyle}>
                <td style={style}><strong>{row.name}</strong></td>
                <td style={style}>{row.eventTitle || row.eventId}</td>
                <td style={style}>{row.email}</td>
                <td style={style}>{new Date(row.registeredAt).toLocaleDateString()}</td>
                {deleteCell}
            </tr>
        );
        if (activeTab === 'messages') return (
            <tr key={row._id} style={rowStyle}>
                <td style={style}><strong>{row.name}</strong><br/><small style={{color:'#888'}}>{row.email}</small></td>
                <td style={style}>{row.subject}</td>
                <td style={style} title={row.message}>{row.message?.substring(0, 40)}...</td>
                <td style={style}>{new Date(row.createdAt).toLocaleDateString()}</td>
                {deleteCell}
            </tr>
        );
        return null;
    });
  };

  return (
    <motion.div className="dashboard-container" initial="hidden" animate="visible" variants={containerVariants}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .dashboard-container { min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f3f4f6; padding: 2rem; }
        body.dark-mode .dashboard-container { background: #111; }
        h1, h2, h3 { font-family: 'Cinzel', serif; letter-spacing: 0.05em; color: #1a1a1a; }
        body.dark-mode h1, body.dark-mode h2, body.dark-mode h3 { color: white; }
        .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .dash-header h1 { font-size: 2.5rem; margin: 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        body.dark-mode .stat-card { background: #1e1e1e; border: 1px solid #333; }
        .stat-val { font-size: 2rem; font-weight: 700; color: #1a1a1a; margin: 5px 0; }
        body.dark-mode .stat-val { color: white; }
        .content-split { display: grid; grid-template-columns: 3fr 1fr; gap: 2rem; }
        @media (max-width: 1000px) { .content-split { grid-template-columns: 1fr; } }
        .content-card { background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); min-height: 400px; }
        body.dark-mode .content-card { background: #1e1e1e; }
        .tabs { display: flex; gap: 20px; border-bottom: 2px solid #eee; margin-bottom: 20px; }
        .tab-btn { background: none; border: none; padding-bottom: 10px; cursor: pointer; font-family: 'Cinzel', serif; font-weight: bold; font-size: 1rem; color: #888; border-bottom: 3px solid transparent; transition: all 0.3s; }
        .tab-btn.active { color: #FFA500; border-bottom-color: #FFA500; }
        .action-btn { padding: 12px; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; margin-bottom: 10px; border: 1px solid #ddd; background: white; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .action-btn:hover { background: #f9f9f9; }
        .status-msg { margin-top: 15px; padding: 10px; border-radius: 6px; font-size: 0.85rem; }
        .status-success { background: #d1fae5; color: #065f46; }
        .status-error { background: #fee2e2; color: #991b1b; }
        .search-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .search-modal { background: white; width: 90%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        body.dark-mode .search-modal { background: #1e1e1e; border: 1px solid #333; }
        .search-header { padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 1rem; }
        body.dark-mode .search-header { border-color: #333; }
        .search-input { width: 100%; border: none; font-size: 1.2rem; outline: none; background: transparent; font-family: 'Montserrat', sans-serif; color: #333; }
        body.dark-mode .search-input { color: white; }
        .search-footer { padding: 1rem; background: #f9fafb; font-size: 0.8rem; color: #888; display: flex; justify-content: space-between; }
        body.dark-mode .search-footer { background: #111; border-top: 1px solid #333; }
      `}</style>

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

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div className="search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSearchOpen(false)}>
            <motion.div className="search-modal" onClick={(e) => e.stopPropagation()} variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <div className="search-header"><span style={{ fontSize: '1.5rem', color: '#ccc' }}>🔍</span><input autoFocus type="text" placeholder="Search database..." className="search-input" /></div>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}><p>Type to search...</p></div>
              <div className="search-footer"><span><strong>Enter</strong> to select</span><span><strong>Esc</strong> to close</span></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;