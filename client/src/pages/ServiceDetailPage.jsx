import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// IMPORT YOUR DECOUPLED DATA FILES HERE
import { BOOKS_DATA } from './booksData'; 
import { ADMISSION_DATA } from './admissionData'; 

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 60, damping: 15 }
  }
};

const sliderVariants = {
  enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0, scale: 0.95 })
};

// --- 2. CONFIGURATION ---
const SERVICE_CONFIG = {
  talim: {
    title: 'Shivba Talim',
    subtitle: 'Forging strength through tradition and modern science.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    priceLabel: 'Membership Plans',
    startingPrice: 1200,
    plans: [
      { label: '1 Month', price: 1200 },
      { label: '3 Months', price: 3000, recommended: true },
      { label: '6 Months', price: 5500 },
      { label: '1 Year', price: 8000 },
    ],
    description: ['Access to modern strength & cardio equipment', 'General training guidance included', 'Fusion of traditional Kusti & modern gym'],
    benefits: ['Build authentic strength', 'Disciplined routine & community', 'Expert guidance available'],
    detailedFeatures: [
      { title: "Equipment Quality", desc: "Imported biomechanical machines designed to prevent injury and maximize muscle hypertrophy." },
      { title: "Desi Diet Plans", desc: "We provide traditional diet charts (milk, almonds, ghee) blended with modern protein requirements." },
      { title: "Mud Wrestling (Kusti)", desc: "Weekend special sessions for traditional mud wrestling techniques under senior wrestlers." }
    ],
    processSteps: ["Select duration.", "Click 'Proceed to Pay'.", "Complete payment.", "Receive Digital ID."]
  },
  library: {
    title: 'Shivba Library',
    subtitle: 'A sanctuary for focus, knowledge, and growth.',
    image: 'https://images.unsplash.com/photo-1507842217121-9e96e44303f0?q=80&w=2070&auto=format&fit=crop',
    priceLabel: 'Seat Subscription',
    startingPrice: 900,
    plans: [
      { label: '1 Month Seat', price: 900 },
      { label: '3 Months Seat', price: 2500, recommended: true },
    ],
    description: ['Extensive physical book collection', 'High-speed WiFi & digital resources', 'Dedicated silent reading zones'],
    benefits: ['Uninterrupted focus', 'Competitive exam preparation support', 'Ergonomic seating & lighting'],
    detailedFeatures: [
      { title: "Silence Policy", desc: "Strict noise-cancellation zones enforced." },
      { title: "Book Request", desc: "Members can request specific books." },
      { title: "Power Backup", desc: "24/7 Inverter backup." }
    ],
    processSteps: ["Choose plan.", "Pay online.", "Collect Seat Number.", "Start studying."]
  },
  hostel: {
    title: 'Shivba Hostel',
    subtitle: 'Safe, secure, and community-driven accommodation.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop',
    priceLabel: 'Monthly Rent',
    startingPrice: 2499,
    plans: null,
    description: ['Comfortable shared & single options', '24/7 Security & CCTV', 'High-speed internet included'],
    benefits: ['Peaceful study environment', 'Network with peers', 'Proximity to Library & Talim'],
    detailedFeatures: [
      { title: "Hygiene First", desc: "Daily housekeeping services included." },
      { title: "Mess Facility", desc: "Healthy, home-cooked Maharashtrian meals available." },
      { title: "Rector Support", desc: "Dedicated warden available 24/7." }
    ],
    processSteps: ["Select Bed.", "Pay booking amount.", "Upload verification docs.", "Move in."]
  },
  social: {
    title: 'Social Awareness',
    subtitle: 'Building a better society through action.',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1470&auto=format&fit=crop',
    priceLabel: 'Contribution',
    startingPrice: 299,
    plans: null,
    description: ['Weekly workshops', 'Community clean-up', 'Youth leadership'],
    benefits: ['Real-world impact', 'Soft skills', 'Certificate'],
    detailedFeatures: [
      { title: "Fort Restoration", desc: "Quarterly treks." },
      { title: "Blood Donation", desc: "Mega blood donation camps." },
      { title: "Skill Workshops", desc: "Free coding bootcamps." }
    ],
    processSteps: ["Contribute fee.", "Join WhatsApp Group.", "Participate.", "Earn Certificate."]
  }
};

// --- 3. SUB-COMPONENT: LIBRARY BOOK SYSTEM ---
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
        <h3>Shivba Digital Catalog</h3>
        <p>Browse our collection or check availability before visiting.</p>
      </div>

      {/* Controls */}
      <div className="lbs-controls">
        <input 
          type="text" 
          placeholder="Search by Title or Author..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="lbs-search"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="lbs-select">
          <option value="All">All Categories</option>
          <option value="History">History</option>
          <option value="Tech">Technology</option>
          <option value="Exam Prep">Exam Prep</option>
          <option value="Misc">Miscellaneous</option>
        </select>
      </div>

      {/* Book Grid */}
      <div className="lbs-grid">
        {filteredBooks.map(book => (
          <motion.div layout key={book.id} className="book-card">
            <div className="book-status-dot" data-status={book.status}></div>
            <div className="book-info">
               <h4>{book.title}</h4>
               <span className="book-author">{book.author}</span>
               <span className="book-category">{book.category}</span>
            </div>
            <div className="book-footer">
               <span className={`status-badge ${book.status.toLowerCase().replace(' ', '-')}`}>{book.status}</span>
               <button className="borrow-btn" disabled={book.status !== 'Available'}>
                 {book.status === 'Available' ? 'Reserve' : 'Notify'}
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- 4. MAIN PAGE COMPONENT ---
function ServiceDetailPage({ serviceId = 'hostel', setPage }) {
  const cfg = SERVICE_CONFIG[serviceId] || SERVICE_CONFIG.talim;
  const detailsRef = useRef(null);

  // --- STATE ---
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Library Specific State: 'study' or 'books'
  const [libraryTab, setLibraryTab] = useState('study');

  // Pricing Logic
  const plans = cfg.plans && cfg.plans.length > 0 ? cfg.plans : [{ label: 'Standard Booking', price: cfg.startingPrice }];
  const currentPlan = plans[activeIndex];

  const nextPlan = () => { setDirection(1); setActiveIndex((prev) => (prev + 1) % plans.length); };
  const prevPlan = () => { setDirection(-1); setActiveIndex((prev) => (prev - 1 + plans.length) % plans.length); };

  // --- NAVIGATION HANDLER ---
  const handleBookingAction = () => {
    if (serviceId === 'hostel' || serviceId === 'library') {
        setPage({
            name: 'booking-selection',
            params: { serviceId, selectedPlanIndex: activeIndex, admissionData: ADMISSION_DATA }
        });
    } else {
        setPage({
            name: 'service-checkout',
            params: { id: serviceId, selectedPlanIndex: activeIndex }
        });
    }
  };

  const scrollToDetails = () => { detailsRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <motion.div
      className="service-detail-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');
        .service-detail-container { font-family: 'Montserrat', sans-serif; background: #f4f4f4; min-height: 100vh; }
        .service-detail-container h1, .service-detail-container h2, .service-detail-container h3 { font-family: 'Cinzel', serif; letter-spacing: 0.05em; }
        
        .service-detail-hero { padding: 4rem 2rem; text-align: center; background: #1a1a1a; color: white; margin-bottom: 2rem; }
        .service-detail-hero h1 { font-size: 3rem; margin: 0; }

        .service-detail-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; padding: 0 20px; }
        @media (max-width: 900px) { .service-detail-grid { grid-template-columns: 1fr; } }
        
        .service-detail-card { background: white; border-radius: 15px; padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .service-detail-image { width: 100%; height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 1.5rem; }
        .service-list li { margin-bottom: 0.5rem; display: flex; gap: 10px; color: #555; }

        .pay-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 1rem; }
        .pay-btn:disabled { background: #ccc; cursor: not-allowed; }
        .secondary-btn { width: 100%; padding: 12px; background: transparent; border: 1px solid #ddd; margin-top: 10px; border-radius: 8px; cursor: pointer; color: #666; }
        .know-more-btn { display: block; width: fit-content; margin: 1rem auto 0; padding: 8px 20px; border: 1px dashed #FFA500; color: #ea580c; background: transparent; border-radius: 30px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s; }
        .know-more-btn:hover { background: #fff7ed; transform: translateY(-2px); }

        .selection-cta { margin-top: 2rem; text-align: center; padding: 2rem; background: #f9fafb; border-radius: 12px; border: 1px dashed #ccc; }
        .cta-button { padding: 12px 30px; background: #1a1a1a; color: white; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; display: inline-flex; alignItems: center; gap: 10px; transition: all 0.3s; }
        .cta-button:hover { background: #ea580c; transform: translateY(-2px); }

        .lib-tabs { display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
        .lib-tab-btn { padding: 10px 24px; border-radius: 30px; border: none; cursor: pointer; font-weight: 600; font-family: 'Cinzel', serif; transition: all 0.3s; }
        .lib-tab-btn.active { background: #ea580c; color: white; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }
        .lib-tab-btn.inactive { background: white; color: #666; border: 1px solid #ddd; }

        .library-book-system { background: white; border-radius: 15px; padding: 2rem; margin: 0 auto; max-width: 1100px; }
        .lbs-controls { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .lbs-search { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Montserrat'; }
        .lbs-select { padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Montserrat'; }
        
        .lbs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
        .book-card { border: 1px solid #eee; border-radius: 10px; padding: 1rem; position: relative; background: #fff; transition: transform 0.2s; }
        .book-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .book-info h4 { margin: 0 0 5px 0; font-size: 1rem; color: #333; }
        .book-author { display: block; font-size: 0.85rem; color: #666; margin-bottom: 5px; }
        .book-category { font-size: 0.75rem; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; color: #555; }
        .book-footer { margin-top: 1rem; display: flex; justify-content: space-between; alignItems: center; }
        .status-badge { font-size: 0.75rem; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
        .status-badge.available { color: #166534; background: #dcfce7; }
        .status-badge.issued { color: #991b1b; background: #fee2e2; }
        .status-badge.maintenance { color: #854d0e; background: #fef9c3; }
        .borrow-btn { border: none; background: #1a1a1a; color: white; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
        .borrow-btn:disabled { background: #eee; color: #aaa; cursor: not-allowed; }
      `}</style>

      {/* --- HERO --- */}
      <section className="service-detail-hero">
        <button onClick={() => setPage({ name: 'services' })} style={{background:'none', border:'none', color:'#ccc', cursor:'pointer', marginBottom:'10px'}}>← BACK</button>
        <h1>{cfg.title}</h1>
        <p>{cfg.subtitle}</p>
      </section>

      {/* --- LIBRARY SPECIFIC TABS --- */}
      {serviceId === 'library' && (
          <div className="lib-tabs">
              <button 
                className={`lib-tab-btn ${libraryTab === 'study' ? 'active' : 'inactive'}`}
                onClick={() => setLibraryTab('study')}
              >
                Study Space
              </button>
              <button 
                className={`lib-tab-btn ${libraryTab === 'books' ? 'active' : 'inactive'}`}
                onClick={() => setLibraryTab('books')}
              >
                Book Repository
              </button>
          </div>
      )}

      {/* --- CONDITIONAL RENDERING --- */}
      
      {/* VIEW 1: STANDARD SERVICE VIEW */}
      {(serviceId !== 'library' || libraryTab === 'study') && (
        <>
            <div className="service-detail-grid">
                <motion.div className="service-detail-card" variants={itemVariants}>
                <img src={cfg.image} alt={cfg.title} className="service-detail-image" />
                
                <h2>Overview</h2>
                <ul className="service-list">
                    {cfg.description.map((item, i) => <li key={i}>➜ {item}</li>)}
                </ul>

                <button className="know-more-btn" onClick={scrollToDetails}>
                    ▼ View Details & Process
                </button>

                {(serviceId === 'hostel' || serviceId === 'library') && (
                    <div className="selection-cta">
                        <h3>Select Your Space</h3>
                        <p>View the interactive layout to choose your preferred {serviceId === 'hostel' ? 'room & bed' : 'study seat'}.</p>
                        <button className="cta-button" onClick={handleBookingAction}>
                            Open Interactive Map ➜
                        </button>
                    </div>
                )}
                </motion.div>

                <motion.div className="service-detail-card" style={{ height: 'fit-content', position: 'sticky', top: '20px' }} variants={itemVariants}>
                <h2 style={{ textAlign: 'center', fontSize: '1.4rem' }}>{cfg.priceLabel}</h2>
                
                <div style={{ position: 'relative', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff7ed', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #ffedd5', overflow: 'hidden' }}>
                    {plans.length > 1 && <button onClick={prevPlan} style={{zIndex: 10, border:'none', background:'none', cursor:'pointer', padding:'10px', position:'absolute', left: 0}}>❮</button>}
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={activeIndex}
                            custom={direction}
                            variants={sliderVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            style={{position:'absolute', width:'100%', textAlign:'center'}}
                        >
                            <div style={{fontSize:'0.9rem', color:'#666'}}>{currentPlan.label}</div>
                            <div style={{fontSize:'1.8rem', fontWeight:'bold', color:'#ea580c'}}>₹{currentPlan.price}</div>
                        </motion.div>
                    </AnimatePresence>
                    {plans.length > 1 && <button onClick={nextPlan} style={{zIndex: 10, border:'none', background:'none', cursor:'pointer', padding:'10px', position:'absolute', right: 0}}>❯</button>}
                </div>

                <motion.button
                    className="pay-btn"
                    onClick={handleBookingAction}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {(serviceId === 'hostel' || serviceId === 'library')
                        ? `Select ${serviceId === 'hostel' ? 'Bed' : 'Seat'} to Continue`
                        : `Proceed to Pay ₹${currentPlan.price}`}
                </motion.button>
                
                <button className="secondary-btn">Register Interest Only</button>
                </motion.div>
            </div>

            <div ref={detailsRef} style={{margin:'3rem auto', maxWidth:'1100px', padding:'0 2rem'}}>
                <h3>Process Steps</h3>
                {cfg.processSteps.map((step, idx) => (
                    <div key={idx} style={{display:'flex', gap:'1rem', marginBottom:'1rem', background:'#fff', padding:'1rem', borderRadius:'8px'}}>
                        <div style={{background:'#ea580c', color:'white', width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', flexShrink:0}}>{idx + 1}</div>
                        <div>{step}</div>
                    </div>
                ))}
                
                <h3 style={{marginTop:'2rem'}}>Detailed Features</h3>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem'}}>
                    {cfg.detailedFeatures.map((f, i) => (
                    <div key={i}>
                        <h4 style={{color:'#ea580c', marginBottom:'0.5rem'}}>{f.title}</h4>
                        <p style={{fontSize:'0.9rem', color:'#555'}}>{f.desc}</p>
                    </div>
                    ))}
                </div>
            </div>
        </>
      )}

      {/* VIEW 2: LIBRARY BOOK SYSTEM */}
      {serviceId === 'library' && libraryTab === 'books' && (
          <div style={{padding: '0 20px'}}>
              <BookLibrarySection />
          </div>
      )}

    </motion.div>
  );
}

export default ServiceDetailPage;