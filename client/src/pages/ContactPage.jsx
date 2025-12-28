import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { API_BASE_URL } from '../config';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15 } 
  }
};

const popupVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

function ContactPage({ setModalState }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Local state for popup

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send message.');
      }

      // Success Logic
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setShowSuccessPopup(true); // Trigger local popup
      
      // Optional: Auto-close popup after 5 seconds
      setTimeout(() => setShowSuccessPopup(false), 5000);

    } catch (error) {
      // Fallback to prop-based modal for errors, or you can add a local error state too
      if(setModalState) {
        setModalState({ show: true, title: 'Submission Error', message: error.message, type: 'error' });
      } else {
        alert(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actions
  const openMaps = () => window.open('https://maps.google.com/?q=Shivba+Talim+Chakan', '_blank');
  const callPhone = () => window.location.href = 'tel:+919767234353';
  const openWhatsApp = () => window.open('https://wa.me/919767234353', '_blank');
  const sendEmail = () => window.location.href = 'mailto:revolution2020.saf@gmail.com';
  const scrollToForm = () => {
    const el = document.getElementById('contact-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div 
      className="contact-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* Typography */
        .contact-container h1, .contact-container h2, .contact-container h3 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }
        .contact-container p, .contact-container input, .contact-container textarea, .contact-container button, .contact-container span {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* Hero */
        .contact-hero {
            padding: 5rem 2rem; text-align: center;
            background: #1a1a1a; color: white;
            margin-bottom: 3rem;
        }
        .contact-hero h1 { font-size: 3.5rem; margin-bottom: 0.5rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .contact-hero p { font-size: 1.2rem; color: #ccc; max-width: 600px; margin: 0 auto; }

        /* Info Cards Grid */
        .info-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem; max-width: 1200px; margin: 0 auto 4rem; padding: 0 2rem;
        }
        .info-card {
            background: white; padding: 2rem; border-radius: 12px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05); text-align: center;
            cursor: pointer; border: 1px solid #eee;
            transition: all 0.3s ease;
        }
        .info-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); border-color: #FFA500; }
        body.dark-mode .info-card { background: #1e1e1e; border-color: #333; }
        body.dark-mode .info-card:hover { border-color: #FFA500; }

        .info-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .info-card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: #333; }
        body.dark-mode .info-card h3 { color: #fff; }
        .info-card p { color: #666; font-size: 0.9rem; }
        body.dark-mode .info-card p { color: #aaa; }
        .info-helper { font-size: 0.75rem; color: #999; margin-top: 10px; }

        /* Main Section: Form + Map */
        .contact-split {
            display: grid; grid-template-columns: 1fr 1fr;
            max-width: 1200px; margin: 0 auto 4rem; padding: 0 2rem;
            gap: 0; border-radius: 20px; overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            background: white;
        }
        body.dark-mode .contact-split { background: #1e1e1e; box-shadow: none; border: 1px solid #333; }
        
        @media (max-width: 900px) { .contact-split { grid-template-columns: 1fr; } }

        /* Form Side */
        .contact-form-wrapper { padding: 3rem; }
        .contact-form-wrapper h2 { font-size: 2rem; margin-bottom: 2rem; color: #1a1a1a; }
        body.dark-mode .contact-form-wrapper h2 { color: #fff; }
        
        .form-group { margin-bottom: 1.2rem; }
        .contact-input {
            width: 100%; padding: 12px 16px; border: 1px solid #ddd;
            border-radius: 8px; font-size: 1rem; transition: all 0.3s;
            background: #f9fafb;
        }
        .contact-input:focus { border-color: #FFA500; background: white; outline: none; box-shadow: 0 0 0 3px rgba(255,165,0,0.1); }
        body.dark-mode .contact-input { background: #2d2d2d; border-color: #444; color: white; }
        body.dark-mode .contact-input:focus { border-color: #FFA500; background: #222; }

        .submit-btn {
            width: 100%; padding: 14px; background: #1a1a1a; color: white;
            border: none; border-radius: 8px; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.1em; cursor: pointer; transition: background 0.3s;
            margin-top: 1rem;
        }
        .submit-btn:hover { background: #FFA500; color: black; }
        .submit-btn:disabled { background: #ccc; cursor: not-allowed; }

        /* Map Side */
        .contact-map-wrapper { position: relative; min-height: 400px; background: #ddd; }
        .map-frame { width: 100%; height: 100%; border: 0; filter: grayscale(20%); }
        .map-caption {
            position: absolute; bottom: 0; left: 0; width: 100%;
            background: rgba(0,0,0,0.8); color: white; padding: 15px;
            font-size: 0.8rem; text-align: center;
        }

        /* --- SUCCESS POPUP STYLES --- */
        .popup-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center;
            z-index: 9999; backdrop-filter: blur(4px);
        }
        .popup-content {
            background: white; padding: 2.5rem; border-radius: 16px; text-align: center;
            max-width: 400px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.1);
        }
        body.dark-mode .popup-content { background: #1e1e1e; border-color: #333; }
        
        .popup-icon-box {
            width: 80px; height: 80px; background: #28a745; color: white;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.5rem; font-size: 2.5rem; box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
        }
        .popup-content h3 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #1a1a1a; }
        body.dark-mode .popup-content h3 { color: white; }
        .popup-content p { color: #666; margin-bottom: 2rem; line-height: 1.5; }
        body.dark-mode .popup-content p { color: #aaa; }
        
        .popup-close-btn {
            background: #1a1a1a; color: white; border: none; padding: 12px 30px;
            border-radius: 30px; font-weight: 600; cursor: pointer; transition: all 0.3s;
            font-family: 'Montserrat', sans-serif;
        }
        .popup-close-btn:hover { background: #FFA500; color: black; transform: translateY(-2px); }

      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="contact-hero">
        <motion.div variants={itemVariants}>
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </motion.div>
      </section>

      {/* --- INFO CARDS --- */}
      <motion.div className="info-grid" variants={containerVariants}>
        <InfoCard 
          icon="📍" title="Visit Us" subtitle="Jadhav Commercial Centre, Pune" 
          onClick={openMaps} 
        />
        <InfoCard 
          icon="📞" title="Call Us" subtitle="+91 97672 34353" 
          onClick={callPhone} onAltClick={openWhatsApp} helper="Right-click for WhatsApp"
        />
        <InfoCard 
          icon="✉️" title="Email Us" subtitle="revolution2020.saf@gmail.com" 
          onClick={sendEmail} 
        />
        <InfoCard 
          icon="⏰" title="Opening Hours" subtitle="Mon - Sun: 6:00 AM - 10:00 PM" 
          onClick={scrollToForm} 
        />
      </motion.div>

      {/* --- FORM & MAP SPLIT --- */}
      <motion.section 
        id="contact-form-section" 
        className="contact-split"
        variants={itemVariants}
      >
        {/* Form Column */}
        <div className="contact-form-wrapper">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input type="text" name="name" className="contact-input" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="email" name="email" className="contact-input" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="tel" name="phone" className="contact-input" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <input type="text" name="subject" className="contact-input" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <textarea name="message" className="contact-input" placeholder="Your Message" rows={5} value={formData.message} onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Map Column */}
        <div className="contact-map-wrapper">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.508532298642!2d73.8600!3d18.7500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDQ1JzAwLjAiTiA3M8KwNTEnMzYuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
            className="map-frame"
            allowFullScreen="" 
            loading="lazy" 
            title="Shivba Location"
          ></iframe>
          <div className="map-caption">
            QV36+PQF, Chakan Shikrapur Rd, Manik Chowk, Chakan, Maharashtra 410501
          </div>
        </div>
      </motion.section>

      {/* --- SUCCESS POPUP MODAL --- */}
      <AnimatePresence>
        {showSuccessPopup && (
          <div className="popup-overlay" onClick={() => setShowSuccessPopup(false)}>
            <motion.div 
              className="popup-content"
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
            >
              <div className="popup-icon-box">✓</div>
              <h3>Message Sent!</h3>
              <p>Thank you for contacting us. We will get back to you shortly.</p>
              <button className="popup-close-btn" onClick={() => setShowSuccessPopup(false)}>
                Great, Thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// --- HELPER COMPONENT ---
function InfoCard({ icon, title, subtitle, onClick, onAltClick, helper }) {
  const handleClick = (e) => {
    if (onAltClick && (e.button === 2 || e.ctrlKey)) {
      e.preventDefault();
      onAltClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div 
      className="info-card" 
      onClick={handleClick}
      onContextMenu={(e) => {
        if (onAltClick) { e.preventDefault(); onAltClick(); }
      }}
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      <div className="info-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {helper && <p className="info-helper">{helper}</p>}
    </motion.div>
  );
}

export default ContactPage;