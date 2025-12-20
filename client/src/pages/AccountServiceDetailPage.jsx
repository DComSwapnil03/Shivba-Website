import React from 'react';
import { motion } from 'framer-motion';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
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

// --- HELPER FUNCTIONS ---
function diffDays(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function percent(part, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

// --- MAIN COMPONENT ---
function AccountServiceDetailPage({ member, serviceIndex = 0, setPage }) {
  
  // --- HANDLE EMPTY STATE ---
  if (!member || !member.services || member.services.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>No Active Services</h2>
          <p style={{ fontFamily: 'Montserrat, sans-serif', color: '#666', marginBottom: '2rem' }}>
            It looks like you haven't joined any programs yet. Start your journey today!
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => setPage({ name: 'services' })} style={{ padding: '10px 20px', background: '#FFA500', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Explore Services
            </button>
            <button onClick={() => setPage({ name: 'account' })} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              Back to Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- DATA PREPARATION ---
  const svc = member.services[serviceIndex];
  if (!svc) return null; // Safety check

  const today = new Date();
  const totalDays = diffDays(svc.subscriptionDate, svc.expiryDate);
  const usedDays = diffDays(svc.subscriptionDate, today);
  const usedDaysClamped = Math.min(usedDays, totalDays || usedDays);
  const remainingDays = Math.max(0, totalDays - usedDaysClamped);

  const totalFee = svc.totalFee || 0;
  const paidFee = svc.feePaid || 0;
  const pendingFee = totalFee - paidFee;

  const dayPercent = percent(usedDaysClamped, totalDays || usedDaysClamped || 1);
  const feePercent = percent(paidFee, totalFee || paidFee || 1);

  // Status Logic
  let status = 'Active';
  let statusColor = '#10b981'; // Green
  if (remainingDays <= 5 && remainingDays > 0) {
      status = 'Expiring Soon';
      statusColor = '#f59e0b'; // Orange
  } else if (remainingDays === 0) {
      status = 'Expired';
      statusColor = '#ef4444'; // Red
  }

  return (
    <motion.div 
      className="account-detail-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .account-detail-container {
            font-family: 'Montserrat', sans-serif;
            background: #f9fafb; min-height: 100vh;
            padding-bottom: 4rem;
        }
        body.dark-mode .account-detail-container { background: #121212; }

        /* Hero */
        .ad-hero {
            background: #1a1a1a; padding: 4rem 2rem; color: white;
            text-align: center; margin-bottom: -3rem; padding-bottom: 6rem;
        }
        .ad-hero h1 {
            font-family: 'Cinzel', serif; font-size: 2.5rem; margin-bottom: 0.5rem; color: #fff;
        }
        .ad-hero p { color: #aaa; font-size: 1rem; }
        .back-link {
            color: #FFA500; cursor: pointer; font-size: 0.85rem; text-transform: uppercase;
            letter-spacing: 0.1em; margin-bottom: 1rem; display: inline-block;
        }

        /* Grid */
        .ad-grid {
            max-width: 1000px; margin: 0 auto; padding: 0 2rem;
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        /* Cards */
        .ad-card {
            background: white; border-radius: 16px; padding: 2rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08); position: relative; overflow: hidden;
        }
        body.dark-mode .ad-card { background: #1e1e1e; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }

        .ad-card h2 {
            font-family: 'Cinzel', serif; font-size: 1.2rem; color: #1a1a1a;
            margin-bottom: 1.5rem; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.8rem;
        }
        body.dark-mode .ad-card h2 { color: #fff; border-color: #333; }

        /* Data Rows */
        .data-row {
            display: flex; justify-content: space-between; margin-bottom: 1rem;
            font-size: 0.95rem; color: #555;
        }
        body.dark-mode .data-row { color: #ccc; }
        .data-label { font-weight: 500; }
        .data-value { font-weight: 600; color: #1a1a1a; }
        body.dark-mode .data-value { color: #fff; }

        /* Circular Progress */
        .progress-circle {
            position: relative; width: 120px; height: 120px; margin: 2rem auto;
        }
        .progress-circle svg { width: 100%; height: 100%; transform: rotate(-90deg); }
        .progress-bg { fill: none; stroke: #eee; stroke-width: 8; }
        body.dark-mode .progress-bg { stroke: #333; }
        .progress-bar { 
            fill: none; stroke-width: 8; stroke-linecap: round;
            stroke-dasharray: 283; /* 2 * PI * 45 (radius) */
            transition: stroke-dashoffset 1s ease-in-out;
        }
        .progress-text {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            text-align: center;
        }
        .progress-percent { font-size: 1.5rem; font-weight: bold; color: #1a1a1a; }
        body.dark-mode .progress-percent { color: #fff; }
        .progress-sub { font-size: 0.75rem; color: #888; text-transform: uppercase; }

        /* Status Badge */
        .status-badge {
            position: absolute; top: 20px; right: 20px;
            padding: 4px 12px; border-radius: 20px; font-size: 0.75rem;
            font-weight: bold; text-transform: uppercase; color: white;
        }

        .renew-btn {
            width: 100%; padding: 12px; background: #1a1a1a; color: white;
            border: none; border-radius: 8px; font-weight: 600;
            text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
            margin-top: 1.5rem; transition: background 0.3s;
        }
        .renew-btn:hover { background: #FFA500; color: black; }

      `}</style>

      {/* --- HERO --- */}
      <div className="ad-hero">
        <span className="back-link" onClick={() => setPage({ name: 'account' })}>← Back to Dashboard</span>
        <h1>{svc.serviceName}</h1>
        <p>Member: {member.name} • {member.phone || member.email}</p>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="ad-grid">
        
        {/* LEFT: TIMELINE CARD */}
        <motion.div className="ad-card" variants={itemVariants}>
          <span className="status-badge" style={{ backgroundColor: statusColor }}>{status}</span>
          <h2>Subscription Timeline</h2>
          
          <div className="data-row">
            <span className="data-label">Start Date</span>
            <span className="data-value">{formatDate(svc.subscriptionDate)}</span>
          </div>
          <div className="data-row">
            <span className="data-label">End Date</span>
            <span className="data-value">{formatDate(svc.expiryDate)}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Days Remaining</span>
            <span className="data-value" style={{ color: statusColor }}>{remainingDays} Days</span>
          </div>

          <div className="progress-circle">
            <svg>
              <circle className="progress-bg" cx="60" cy="60" r="45"></circle>
              <circle 
                className="progress-bar" 
                cx="60" cy="60" r="45" 
                stroke="#ec4899"
                style={{ strokeDashoffset: 283 - (283 * dayPercent) / 100 }}
              ></circle>
            </svg>
            <div className="progress-text">
              <div className="progress-percent">{dayPercent}%</div>
              <div className="progress-sub">Complete</div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: PAYMENT CARD */}
        <motion.div className="ad-card" variants={itemVariants}>
          <h2>Payment Overview</h2>
          
          <div className="data-row">
            <span className="data-label">Total Fee</span>
            <span className="data-value">₹{totalFee.toLocaleString('en-IN')}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Amount Paid</span>
            <span className="data-value" style={{ color: '#10b981' }}>₹{paidFee.toLocaleString('en-IN')}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Pending</span>
            <span className="data-value" style={{ color: pendingFee > 0 ? '#ef4444' : '#10b981' }}>
                ₹{pendingFee.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="progress-circle">
            <svg>
              <circle className="progress-bg" cx="60" cy="60" r="45"></circle>
              <circle 
                className="progress-bar" 
                cx="60" cy="60" r="45" 
                stroke={pendingFee > 0 ? '#f59e0b' : '#10b981'}
                style={{ strokeDashoffset: 283 - (283 * feePercent) / 100 }}
              ></circle>
            </svg>
            <div className="progress-text">
              <div className="progress-percent">{feePercent}%</div>
              <div className="progress-sub">Paid</div>
            </div>
          </div>

          <button 
            className="renew-btn" 
            onClick={() => setPage({ name: 'service-detail', params: { id: svc.serviceId } })}
          >
            Renew / Upgrade
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default AccountServiceDetailPage;