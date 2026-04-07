import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion'; // Removed AnimatePresence

// IMPORT DATA
import { BOOKS_DATA } from './booksData'; 
import { ADMISSION_DATA } from './admissionData'; 

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
};

// --- CONFIGURATION ---
const SERVICE_CONFIG = {
  talim: {
    title: 'Shivba Talim',
    subtitle: 'Building authentic strength through tradition and modern science.',
    image: '/IMG-20251226-WA0024.jpg',
    description: ['Access to modern equipment', 'General training guidance', 'Traditional Kusti fusion'],
    benefits: ['Expert wrestling guidance', 'Imported machines', 'Fitness community'],
    processSteps: ["Proceed to Admission.", "Fill out your details.", "Secure checkout.", "Activate membership."],
    showPricing: false,
    actionLabel: "Proceed to Admission ➜",
  },
  library: {
    title: 'Shivba Library',
    subtitle: 'A sanctuary for focus, knowledge, and growth.',
    image: '/IMG-20251226-WA0006.jpg',
    description: ['Extensive book collection', 'High-speed WiFi', 'Ergonomic seating'],
    benefits: ['Zero-noise environment', 'Power backup', 'Locker facilities'],
    processSteps: ["Verify seat availability.", "Open Interactive Map below.", "Click on an available seat.", "Proceed to final payment."],
    showPricing: false,
    actionLabel: "Open Interactive Seat Map ➜",
  },
  hostel: {
    title: 'Shivba Hostel',
    subtitle: 'Safe, secure, and community-driven accommodation.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop',
    description: ['Shared & single rooms', '24/7 CCTV security', 'Hygienic mess facility'],
    benefits: ['Ventilated rooms', 'Student network', 'Near Library & Gym'],
    processSteps: ["Review guidelines.", "View Room Layout.", "Select your Bed.", "Pay booking amount."],
    showPricing: false,
    actionLabel: "Open Room Layout ➜",
  },
  social: {
    title: 'Social Awareness',
    subtitle: 'Build a better society through meaningful action.',
    image: '/IMG-20251226-WA0012.jpg',
    description: ['Youth leadership', 'Community outreach', 'Fort restoration'],
    benefits: ['Real-world impact', 'Earn certificates', 'Soft skills'],
    processSteps: ["Register interest.", "Join WhatsApp group.", "Pay nominal fee.", "Participate in event."],
    showPricing: true,
    priceLabel: "Program Contribution",
    plans: [{ label: 'Member Registration', price: 299 }],
    actionLabel: "Proceed to Registration ➜",
  }
};

// --- SUB-COMPONENT: LIBRARY BOOK SYSTEM ---
const BookLibrarySection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredBooks = BOOKS_DATA.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || book.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div variants={itemVariants} className="library-book-system">
      <div className="lbs-header">
        <h3 style={{fontFamily: 'Cinzel', color: '#ea580c'}}>Digital Book Repository</h3>
        <p>Browse our collection or search for specific study materials.</p>
      </div>

      <div className="lbs-controls">
        <input type="text" placeholder="Search Title or Author..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="lbs-search" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="lbs-select">
          <option value="All">All Genres</option>
          <option value="History">History</option>
          <option value="Exam Prep">Exam Prep</option>
          <option value="Tech">Tech</option>
        </select>
      </div>

      <div className="lbs-grid">
        {filteredBooks.map(book => (
          <motion.div layout key={book.id} className="book-card">
            <h4>{book.title}</h4>
            <span className="book-author">{book.author}</span>
            <div className={`status-tag ${book.status.toLowerCase()}`}>{book.status}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
function ServiceDetailPage({ serviceId = 'library', setPage }) {
  const cfg = SERVICE_CONFIG[serviceId] || SERVICE_CONFIG.talim;
  const bottomSectionRef = useRef(null);
  const [activeIndex] = useState(0); // Removed unused setActiveIndex
  const [libraryTab, setLibraryTab] = useState('study');

  const handleAction = () => {
    if (serviceId === 'hostel' || serviceId === 'library') {
        setPage({ name: 'booking-selection', params: { serviceId, admissionData: ADMISSION_DATA } });
    } else {
        setPage({ name: 'service-checkout', params: { id: serviceId, selectedPlanIndex: activeIndex } });
    }
  };

  return (
    <motion.div className="service-detail-container" initial="hidden" animate="visible" variants={containerVariants}>
      <style>{`
        .service-detail-container { font-family: 'Montserrat', sans-serif; background: #f8f9fa; min-height: 100vh; padding-bottom: 5rem; transition: background 0.3s; }
        body.dark-mode .service-detail-container { background: #121212; color: #e0e0e0; }
        .service-detail-hero { padding: 4rem 2rem; text-align: center; background: #1a1a1a; color: white; }
        .service-detail-hero h1 { font-family: 'Cinzel', serif; font-size: 3rem; margin-bottom: 10px; }
        .content-wrap { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
        .lib-tabs { display: flex; gap: 1rem; justify-content: center; margin: 2rem 0; }
        .tab-btn { padding: 10px 25px; border-radius: 50px; border: none; cursor: pointer; font-weight: bold; font-family: 'Cinzel'; transition: 0.3s; }
        .tab-btn.active { background: #ea580c; color: white; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3); }
        .tab-btn.inactive { background: #eee; color: #666; }
        body.dark-mode .tab-btn.inactive { background: #222; color: #aaa; }
        .brief-image { width: 100%; height: 400px; object-fit: cover; border-radius: 20px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); margin: 3rem 0; }
        .brief-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; text-align: left; }
        @media (max-width: 600px) { .brief-grid { grid-template-columns: 1fr; } }
        .brief-card h3 { font-family: 'Cinzel'; color: #ea580c; border-bottom: 2px solid #ea580c; display: inline-block; padding-bottom: 5px; margin-bottom: 1rem; }
        .brief-card p { margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px; font-size: 0.95rem; }
        .steps-section { margin-top: 5rem; text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        body.dark-mode .steps-section { background: #1e1e1e; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .step-num { width: 45px; height: 45px; background: #ea580c; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin: 0 auto 15px; }
        .final-stage-action { margin-top: 5rem; padding: 5rem 2rem; background: #1a1a1a; color: white; border-radius: 30px; text-align: center; }
        .action-button { padding: 18px 45px; background: #ea580c; color: white; border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; text-transform: uppercase; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 88, 12, 0.4); }
        .action-button:hover { transform: translateY(-5px); background: #ff7722; }
        .library-book-system { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        body.dark-mode .library-book-system { background: #1e1e1e; border: 1px solid #333; }
        .lbs-controls { display: flex; gap: 1rem; margin: 2rem 0; }
        .lbs-search, .lbs-select { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
        body.dark-mode .lbs-search, body.dark-mode .lbs-select { background: #111; border-color: #444; color: #fff; }
        .lbs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
        .book-card { padding: 1.5rem; border: 1px solid #eee; border-radius: 12px; background: #fdfdfd; transition: 0.3s; }
        body.dark-mode .book-card { background: #111; border-color: #333; }
        .book-card h4 { margin: 0 0 5px 0; color: #1a1a1a; }
        body.dark-mode .book-card h4 { color: #fff; }
        .status-tag { font-size: 0.7rem; font-weight: bold; text-transform: uppercase; margin-top: 10px; display: inline-block; padding: 2px 8px; border-radius: 4px; }
        .status-tag.available { background: #dcfce7; color: #166534; }
        .status-tag.issued { background: #fee2e2; color: #991b1b; }
      `}</style>

      <section className="service-detail-hero">
        <div className="content-wrap">
          <button onClick={() => setPage({ name: 'services' })} style={{background:'none', border:'none', color:'#888', cursor:'pointer', fontWeight:'bold', marginBottom:'10px'}}>← BACK</button>
          <motion.h1 initial={{ opacity: 0 }}>{cfg.title}</motion.h1>
          <p style={{ opacity: 0.8 }}>{cfg.subtitle}</p>
        </div>
      </section>

      {serviceId === 'library' && (
          <div className="lib-tabs">
              <button className={`tab-btn ${libraryTab === 'study' ? 'active' : 'inactive'}`} onClick={() => setLibraryTab('study')}>Study Space & Booking</button>
              <button className={`tab-btn ${libraryTab === 'books' ? 'active' : 'inactive'}`} onClick={() => setLibraryTab('books')}>Digital Book Catalog</button>
          </div>
      )}

      <div className="content-wrap">
        {(serviceId !== 'library' || libraryTab === 'study') && (
          <>
            <motion.img variants={itemVariants} src={cfg.image} className="brief-image" alt="Service" />
            <div className="brief-grid">
                <div className="brief-card">
                    <h3>Overview</h3>
                    {cfg.description.map((item, i) => <p key={i}><span>✔</span> {item}</p>)}
                </div>
                <div className="brief-card">
                    <h3>Benefits</h3>
                    {cfg.benefits.map((item, i) => <p key={i}><span>⭐</span> {item}</p>)}
                </div>
            </div>

            <section className="steps-section">
                <h2 style={{fontFamily:'Cinzel'}}>How to Join</h2>
                <div className="steps-grid">
                    {cfg.processSteps.map((step, idx) => (
                        <div key={idx}><div className="step-num">{idx + 1}</div><p style={{fontSize:'0.9rem'}}>{step}</p></div>
                    ))}
                </div>
            </section>

            <section ref={bottomSectionRef} className="final-stage-action">
                <h2 style={{fontFamily:'Cinzel', fontSize:'2.2rem', color:'#FFA500', marginBottom:'1rem'}}>Ready to Secure Your Spot?</h2>
                <p style={{marginBottom:'2.5rem', opacity:0.7}}>Follow the official process to confirm your admission.</p>
                <button className="action-button" onClick={handleAction}>{cfg.actionLabel}</button>
            </section>
          </>
        )}

        {serviceId === 'library' && libraryTab === 'books' && (
            <div style={{marginTop: '3rem'}}>
                <BookLibrarySection />
            </div>
        )}
      </div>
    </motion.div>
  );
}

export default ServiceDetailPage;