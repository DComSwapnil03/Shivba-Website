import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'; // Adjust path if needed

// --- 1. MOCK DATA (For Visualization) ---
const STATS = [
  { label: 'Total Users', value: '1,240', change: '+12%', icon: '👥', color: '#4f46e5' },
  { label: 'Revenue', value: '₹4.2L', change: '+8%', icon: '📈', color: '#10b981' },
  { label: 'Active Sessions', value: '34', change: '-2%', icon: '⚡', color: '#f59e0b' },
  { label: 'Pending Tasks', value: '12', change: '0%', icon: '📝', color: '#ef4444' },
];

const RECENT_ACTIVITY = [
  { user: 'Amit Sharma', action: 'Registered for Talim', time: '2 mins ago' },
  { user: 'Priya P.', action: 'Paid Hostel Fee', time: '15 mins ago' },
  { user: 'Admin', action: 'Updated Event Gallery', time: '1 hour ago' },
  { user: 'Rahul D.', action: 'Submitted Feedback', time: '3 hours ago' },
];

// --- 2. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const Dashboard = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- KEYBOARD SHORTCUTS ---
  useKeyboardShortcut('s', () => {
    setIsSearchOpen(true);
  });
  
  // Close on Escape
  useKeyboardShortcut('Escape', () => {
    setIsSearchOpen(false);
  });

  return (
    <motion.div 
      className="dashboard-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .dashboard-container {
            min-height: 100vh; font-family: 'Montserrat', sans-serif;
            background: #f3f4f6; padding: 2rem;
        }
        body.dark-mode .dashboard-container { background: #111; }

        /* Typography */
        h1, h2, h3 { font-family: 'Cinzel', serif; letter-spacing: 0.05em; color: #1a1a1a; }
        body.dark-mode h1, body.dark-mode h2, body.dark-mode h3 { color: white; }
        p, span, div { color: #555; }
        body.dark-mode p, body.dark-mode span, body.dark-mode div { color: #aaa; }

        /* Header */
        .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .dash-header h1 { font-size: 2.5rem; margin: 0; }
        .dash-date { font-size: 0.9rem; color: #888; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .hint-badge {
            background: #e5e7eb; color: #555; padding: 6px 12px; border-radius: 8px;
            font-size: 0.75rem; font-weight: bold; border: 1px solid #d1d5db;
            display: flex; align-items: center; gap: 6px;
        }
        body.dark-mode .hint-badge { background: #333; border-color: #444; color: #ccc; }
        .kbd { background: white; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 0 rgba(0,0,0,0.2); color: black; }

        /* Stats Grid */
        .stats-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem; margin-bottom: 2rem;
        }
        .stat-card {
            background: white; padding: 1.5rem; border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);
            display: flex; justify-content: space-between; align-items: flex-start;
            transition: transform 0.2s;
        }
        body.dark-mode .stat-card { background: #1e1e1e; border-color: #333; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
        
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 10px; }
        .stat-val { font-size: 1.8rem; font-weight: 700; color: #1a1a1a; margin: 5px 0; }
        body.dark-mode .stat-val { color: white; }
        .stat-label { font-size: 0.85rem; text-transform: uppercase; color: #888; font-weight: 600; }
        .stat-change { font-size: 0.8rem; font-weight: bold; }
        .change-pos { color: #10b981; } .change-neg { color: #ef4444; }

        /* Main Content Split */
        .content-split { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        @media (max-width: 900px) { .content-split { grid-template-columns: 1fr; } }

        .content-card {
            background: white; border-radius: 16px; padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); height: 100%;
        }
        body.dark-mode .content-card { background: #1e1e1e; }

        .activity-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 1rem 0; border-bottom: 1px solid #f3f4f6;
        }
        body.dark-mode .activity-item { border-color: #333; }
        .user-name { font-weight: 600; color: #1a1a1a; display: block; }
        body.dark-mode .user-name { color: white; }
        .user-action { font-size: 0.9rem; color: #666; }
        .activity-time { font-size: 0.8rem; color: #999; }

        /* Search Modal */
        .search-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.6);
            backdrop-filter: blur(5px); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
        }
        .search-modal {
            background: white; width: 90%; max-width: 600px;
            border-radius: 16px; overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        body.dark-mode .search-modal { background: #1e1e1e; border: 1px solid #333; }
        
        .search-header {
            padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 1rem;
        }
        body.dark-mode .search-header { border-color: #333; }
        .search-input {
            width: 100%; border: none; font-size: 1.2rem; outline: none; background: transparent;
            font-family: 'Montserrat', sans-serif; color: #333;
        }
        body.dark-mode .search-input { color: white; }
        .search-footer { padding: 1rem; background: #f9fafb; font-size: 0.8rem; color: #888; display: flex; justify-content: space-between; }
        body.dark-mode .search-footer { background: #111; border-top: 1px solid #333; }

      `}</style>

      {/* --- HEADER --- */}
      <div className="dash-header">
        <div>
          <p className="dash-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Dashboard</h1>
        </div>
        <div className="hint-badge">
          <span>Press</span> <span className="kbd">S</span> <span>to Search</span>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <motion.div 
            key={i} 
            className="stat-card"
            variants={itemVariants}
          >
            <div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-val">{stat.value}</div>
              <span className={`stat-change ${stat.change.includes('+') ? 'change-pos' : 'change-neg'}`}>
                {stat.change} vs last month
              </span>
            </div>
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="content-split">
        {/* Recent Activity */}
        <motion.div className="content-card" variants={itemVariants}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Recent Activity</h3>
          <div>
            {RECENT_ACTIVITY.map((item, idx) => (
              <div key={idx} className="activity-item">
                <div>
                  <span className="user-name">{item.user}</span>
                  <span className="user-action">{item.action}</span>
                </div>
                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="content-card" variants={itemVariants} style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)', color: 'white' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <button style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>+ Add New Member</button>
            <button style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Create Report</button>
            <button style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Settings</button>
          </div>
        </motion.div>
      </div>

      {/* --- SEARCH MODAL (Triggered by 's') --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            className="search-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div 
              className="search-modal"
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden" animate="visible" exit="exit"
            >
              <div className="search-header">
                <span style={{ fontSize: '1.5rem', color: '#ccc' }}>🔍</span>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search members, events, or invoices..." 
                  className="search-input"
                />
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                <p>Start typing to see results...</p>
              </div>
              <div className="search-footer">
                <span><strong>Enter</strong> to select</span>
                <span><strong>Esc</strong> to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Dashboard;