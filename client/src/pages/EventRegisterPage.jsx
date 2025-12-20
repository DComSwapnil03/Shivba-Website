import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 50 } 
  }
};

function EventRegisterPage({ event, setPage, setModalState }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STYLE INJECTION ---
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

    .event-reg-container {
      font-family: 'Montserrat', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    }
    body.dark-mode .event-reg-container {
      background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
    }

    .reg-card {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      background: white;
      max-width: 900px;
      width: 100%;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    body.dark-mode .reg-card { background: #1e1e1e; border: 1px solid #333; }

    /* Left Side: Event Info */
    .reg-visual {
      position: relative;
      background: #1a1a1a;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 2rem;
      overflow: hidden;
    }
    .reg-img-bg {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
      opacity: 0.4; transition: transform 10s;
    }
    .reg-card:hover .reg-img-bg { transform: scale(1.1); }
    
    .reg-info-content { position: relative; z-index: 2; }
    .reg-title {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      margin-bottom: 0.5rem;
      line-height: 1.1;
      text-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }
    .reg-meta {
      font-size: 0.9rem;
      color: #ddd;
      margin-bottom: 1rem;
      display: flex; flex-direction: column; gap: 5px;
    }
    .reg-badge {
      display: inline-block;
      background: #FFA500;
      color: black;
      font-weight: bold;
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 4px;
      width: fit-content;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    /* Right Side: Form */
    .reg-form-section { padding: 3rem; }
    .reg-header h2 {
      font-family: 'Cinzel', serif;
      font-size: 1.8rem;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
    }
    body.dark-mode .reg-header h2 { color: white; }

    .input-group { margin-bottom: 1.5rem; }
    .input-group label {
      display: block; font-size: 0.85rem; font-weight: 600;
      color: #666; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;
    }
    body.dark-mode .input-group label { color: #aaa; }

    .input-group input {
      width: 100%; padding: 12px 16px;
      border: 1px solid #ddd; border-radius: 8px;
      background: #f9fafb; font-size: 1rem;
      transition: all 0.3s;
    }
    body.dark-mode .input-group input { background: #2d2d2d; border-color: #444; color: white; }
    .input-group input:focus {
      border-color: #FFA500; box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1); outline: none;
    }

    .submit-btn {
      width: 100%; padding: 14px;
      background: #1a1a1a; color: white;
      border: none; border-radius: 8px;
      font-size: 1rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.1em;
      cursor: pointer; transition: all 0.3s;
    }
    .submit-btn:hover { background: #FFA500; color: black; transform: translateY(-2px); }
    .submit-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }

    .cancel-btn {
      margin-top: 1rem; width: 100%; background: none; border: none;
      color: #666; cursor: pointer; font-size: 0.9rem; text-decoration: underline;
    }
    body.dark-mode .cancel-btn { color: #aaa; }
    .cancel-btn:hover { color: #1a1a1a; }

    @media (max-width: 768px) {
      .reg-card { grid-template-columns: 1fr; }
      .reg-visual { min-height: 200px; }
      .reg-form-section { padding: 2rem; }
    }
  `;

  // --- HANDLE NO EVENT ---
  if (!event) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>No Event Selected</h2>
          <button onClick={() => setPage({ name: 'events' })} style={{ padding: '10px 20px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, eventId: event.id, eventTitle: event.title }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register.');

      setModalState({
        show: true,
        title: '🎉 Registration Confirmed!',
        message: `You are successfully registered for "${event.title}". Check your email for details.`,
        type: 'success',
      });
      setPage({ name: 'events' });
    } catch (err) {
      setModalState({ show: true, title: 'Registration Error', message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="event-reg-container animate-fadeIn">
      <style>{styles}</style>
      
      <motion.div 
        className="reg-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT: VISUAL */}
        <div className="reg-visual">
          {event.imageUrl && <img src={event.imageUrl} alt="" className="reg-img-bg" />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}></div>
          
          <div className="reg-info-content">
            <span className="reg-badge">{event.category || 'Event'}</span>
            <h1 className="reg-title">{event.title}</h1>
            <div className="reg-meta">
              <span>📅 {event.date}</span>
              <span>⏰ {event.time}</span>
              <span>📍 {event.location}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="reg-form-section">
          <div className="reg-header">
            <h2>Secure Your Spot</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <motion.div className="input-group" variants={itemVariants}>
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
            </motion.div>

            <motion.div className="input-group" variants={itemVariants}>
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@example.com" />
            </motion.div>

            <motion.div className="input-group" variants={itemVariants}>
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Mobile number" />
            </motion.div>

            <motion.button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Registration'}
            </motion.button>

            <button type="button" className="cancel-btn" onClick={() => setPage({ name: 'events' })}>
              Cancel & Go Back
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default EventRegisterPage;