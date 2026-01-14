import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

/* --- 1. DATA: SUCCESS STORIES --- */
const SUCCESS_STORIES = [
  {
    id: 1,
    name: "Rahul Patil",
    role: "State Level Wrestler",
    quote: "The combination of traditional Kusti and modern gym equipment at Shivba Talim gave me the edge I needed to win gold.",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    name: "Priya Deshmukh",
    role: "MPSC Aspirant",
    quote: "The silence and resources in the Shivba Library helped me clear my prelims. It's not just a library, it's a temple of focus.",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    name: "Amit & Team",
    role: "Social Volunteers",
    quote: "Through the Shivba Social initiatives, we restored 3 local forts. The feeling of serving our heritage is indescribable.",
    image: "https://randomuser.me/api/portraits/men/86.jpg"
  }
];

/* --- 2. ANIMATION VARIANTS --- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

const popupVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.6 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } }
};

/* --- 3. SUB-COMPONENTS --- */

const EmojiOrbitAnimation = () => {
  const emojis = ['🏋️', '🛌', '📚', '👥', '🧘', '💪', '🏆'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % emojis.length);
    }, 2500); 
    return () => clearInterval(timer);
  }, [emojis.length]);

  return (
    <div className="emoji-orbit-wrapper">
      <motion.div className="orbit-ring-outer" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
      <motion.div className="orbit-ring-inner" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
      <div className="orbit-core-glow" />
      <div className="emoji-display">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="real-emoji"
          >
            {emojis[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- UPDATED: OFFERS POPUP WITH IMAGE ---
const OffersPopup = ({ onClose, setPage }) => (
  <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="modal-box" variants={popupVariants} initial="hidden" animate="visible" exit="exit">
      <button className="modal-close" onClick={onClose}>&times;</button>
      
      {/* NEW IMAGE BANNER */}
      <div className="modal-image-container">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" alt="Offer" />
        <div className="modal-badge">LIMITED TIME</div>
      </div>
      
      <div className="modal-content">
        <h3>Grand Opening Offer!</h3>
        <p>Join <strong>Shivba Talim + Library</strong> combo pack and get flat <span style={{color: '#ea580c', fontWeight: 'bold'}}>20% OFF</span>.</p>
        <div className="modal-timer">Offer ends in: 24:00:00</div>
        
        <div className="modal-actions">
            <button className="btn-glow" onClick={() => { onClose(); setPage({ name: 'service-detail', params: { id: 'talim' }}); }} style={{flex: 1}}>
                Claim Now
            </button>
            <button className="btn-outline-small" onClick={() => { onClose(); setPage({ name: 'offers' }); }} style={{flex: 1}}>
                View All Offers
            </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// --- SUCCESS STORIES CAROUSEL ---
const SuccessStories = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive(prev => (prev + 1) % SUCCESS_STORIES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="stories-wrapper">
       <AnimatePresence mode="wait">
         <motion.div 
           key={active}
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -50 }}
           transition={{ duration: 0.5 }}
           className="story-card"
         >
            <div className="story-img-wrapper">
                <img src={SUCCESS_STORIES[active].image} alt={SUCCESS_STORIES[active].name} />
            </div>
            <p className="story-quote">"{SUCCESS_STORIES[active].quote}"</p>
            <div className="story-meta">
               <h4>{SUCCESS_STORIES[active].name}</h4>
               <span>{SUCCESS_STORIES[active].role}</span>
            </div>
         </motion.div>
       </AnimatePresence>
       
       <div className="story-dots">
         {SUCCESS_STORIES.map((_, i) => (
           <span key={i} className={`dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}></span>
         ))}
       </div>
    </div>
  );
};

/* --- 4. MAIN HOMEPAGE COMPONENT --- */
function HomePage({ setPage }) {
  const { t } = useTranslation();
  
  // Slide Config
  const slides = [
    { image: '/IMG-20251226-WA0024.jpg', alt: 'Gym Facilities' },
    { image: '/IMG-20251226-WA0005.jpg', alt: 'Library Area' },
    { image: '/social.jpg', alt: 'Social Awareness Programs' }
  ];

  const [current, setCurrent] = useState(0);
  const [showOffer, setShowOffer] = useState(false);

  // Auto-rotate hero slides
  useEffect(() => {
    const id = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  // Trigger Popup after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOffer(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="home-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- POPUP INTEGRATION --- */}
      <AnimatePresence>
        {showOffer && <OffersPopup onClose={() => setShowOffer(false)} setPage={setPage} />}
      </AnimatePresence>

      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* Global Font Assignments */
        .home-container h1, .home-container h2, .home-container h3, .stat-number, .modal-box h3 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }

        .home-container p, button, span, .link, .stat-label, .story-quote, .modal-box p {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* Buttons */
        .btn-primary, .btn-outline, .btn-glow {
            text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; border-radius: 0 !important; cursor: pointer;
        }

        /* Emoji Orbit CSS */
        .emoji-orbit-wrapper { position: relative; width: 300px; height: 300px; display: flex; justify-content: center; align-items: center; }
        .orbit-ring-outer { position: absolute; width: 100%; height: 100%; border: 2px dashed rgba(255, 165, 0, 0.3); border-radius: 50%; }
        .orbit-ring-inner { position: absolute; width: 70%; height: 70%; border: 2px solid rgba(255, 165, 0, 0.6); border-left-color: transparent; border-radius: 50%; }
        .orbit-core-glow { position: absolute; width: 40%; height: 40%; background: radial-gradient(circle, rgba(255,165,0,0.2) 0%, transparent 70%); border-radius: 50%; filter: blur(10px); }
        .emoji-display { font-size: 5rem; z-index: 10; }
        .real-emoji { display: block; }

        /* Hero Overrides */
        .hero-content h1 { text-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 3.5rem; }
        .hero-subtitle { font-weight: 300; letter-spacing: 0.1em; font-size: 1.1rem; }

        /* --- SUCCESS STORIES STYLES --- */
        .stories-section { padding: 4rem 2rem; background: #f9f9f9; text-align: center; }
        .stories-wrapper { max-width: 800px; margin: 2rem auto; position: relative; min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .story-card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; width: 100%; }
        .story-img-wrapper img { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #ea580c; object-fit: cover; margin-bottom: 1rem; }
        .story-quote { font-style: italic; font-size: 1.1rem; color: #555; margin-bottom: 1.5rem; }
        .story-meta h4 { color: #ea580c; margin: 0; font-size: 1.2rem; }
        .story-meta span { font-size: 0.9rem; color: #888; }
        .story-dots { display: flex; gap: 10px; margin-top: 1rem; }
        .story-dots .dot { width: 10px; height: 10px; background: #ccc; border-radius: 50%; cursor: pointer; transition: all 0.3s; }
        .story-dots .dot.active { background: #ea580c; transform: scale(1.2); }

        /* --- UPDATED MODAL POPUP STYLES --- */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px); }
        .modal-box { background: white; padding: 0; border-radius: 15px; max-width: 400px; width: 90%; text-align: center; position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.3); overflow: hidden; }
        .modal-close { position: absolute; top: 10px; right: 15px; font-size: 2rem; border: none; background: rgba(0,0,0,0.5); width: 35px; height: 35px; border-radius: 50%; color: white; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; }
        
        .modal-image-container { position: relative; height: 200px; width: 100%; }
        .modal-image-container img { width: 100%; height: 100%; object-fit: cover; }
        .modal-badge { position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); background: #ea580c; color: white; padding: 5px 20px; font-size: 0.8rem; font-weight: bold; border-radius: 20px; letter-spacing: 0.1em; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

        .modal-content { padding: 2rem; padding-top: 1.5rem; }
        .modal-box h3 { font-size: 1.6rem; margin-bottom: 0.5rem; color: #1a1a1a; margin-top: 10px; }
        .modal-box p { color: #555; line-height: 1.5; margin-bottom: 1.5rem; font-size: 0.95rem; }
        .modal-timer { font-family: 'monospace', sans-serif; background: #fff7ed; padding: 8px; border-radius: 5px; color: #c2410c; font-weight: bold; font-size: 0.9rem; margin-bottom: 1.5rem; border: 1px dashed #fdba74; }
        
        .modal-actions { display: flex; gap: 10px; }
        .btn-outline-small { background: transparent; border: 1px solid #ddd; padding: 10px; font-weight: bold; border-radius: 5px; cursor: pointer; color: #555; }
        .btn-outline-small:hover { background: #f9f9f9; color: black; }
      `}</style>

      {/* --- SECTION 1: HERO --- */}
      <section className="home-hero">
        {slides.map((slide, index) => (
          <div key={index} className={`hero-slide ${index === current ? 'active' : ''}`}>
            <div className="hero-overlay" />
            <img src={slide.image} alt={slide.alt} />
          </div>
        ))}
        
        <motion.div className="hero-content" variants={containerVariants}>
          <motion.h1 variants={itemVariants}>{t('home.heroTitle')}</motion.h1>
          <motion.p className="hero-subtitle" variants={itemVariants}>{t('home.heroSubtitle')}</motion.p>
          
          <motion.div className="hero-buttons" variants={itemVariants}>
            <button className="btn-primary" onClick={() => setPage({ name: 'register' })}>
              {t('home.heroPrimary')}
            </button>
            <button className="btn-outline" onClick={() => setPage({ name: 'contact' })}>
              {t('home.heroSecondary')}
            </button>
          </motion.div>

          <motion.div className="hero-stats" variants={containerVariants}>
            <StatBox number={t('home.stats.membersNumber')} label={t('home.stats.membersLabel')} />
            <StatBox number={t('home.stats.workshopsNumber')} label={t('home.stats.workshopsLabel')} />
            <StatBox number={t('home.stats.yearsNumber')} label={t('home.stats.yearsLabel')} />
          </motion.div>
        </motion.div>
      </section>

      {/* --- SECTION 2: SERVICES --- */}
      <section className="home-section">
        <motion.div 
            className="section-header" 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={itemVariants}>{t('home.servicesTitle')}</motion.h2>
          <motion.p variants={itemVariants}>{t('home.servicesSubtitle')}</motion.p>
        </motion.div>
        
        <motion.div 
            className="cards-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
        >
          <HomeCard title={t('home.cards.talim.title')} text={t('home.cards.talim.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'talim' } })} />
          <HomeCard title={t('home.cards.hostel.title')} text={t('home.cards.hostel.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'hostel' } })} />
          <HomeCard title={t('home.cards.library.title')} text={t('home.cards.library.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'library' } })} />
          <HomeCard title={t('home.cards.social.title')} text={t('home.cards.social.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'social' } })} />
        </motion.div>
      </section>

      {/* --- NEW SECTION 3: SUCCESS STORIES --- */}
      <section className="stories-section">
         <motion.div
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
         >
            <motion.h2 style={{fontFamily: 'Cinzel', fontSize: '2rem', marginBottom: '10px'}} variants={itemVariants}>Voices of Victory</motion.h2>
            <motion.p variants={itemVariants} style={{marginBottom: '2rem'}}>Real stories from real people who transformed their lives.</motion.p>
            <SuccessStories />
         </motion.div>
      </section>

      {/* --- SECTION 4: REGISTER / REVOLUTION --- */}
      <motion.section 
        className="particle-register-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="particle-content">
          <motion.h2 variants={itemVariants}>Join the <br /> Revolution</motion.h2>
          <motion.p variants={itemVariants}>Experience the new era of management. <br /> Sign up now to access exclusive services.</motion.p>
          <motion.div className="particle-buttons" variants={itemVariants}>
            <button className="btn-glow" onClick={() => setPage({ name: 'register' })}>
              Register Now
            </button>
            <button className="btn-text" onClick={() => setPage({ name: 'contact' })}>
              Contact Support
            </button>
          </motion.div>
        </div>
        
        {/* Right Side: Emoji Orbit */}
        <motion.div className="particle-visual" variants={itemVariants}>
          <EmojiOrbitAnimation />
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

/* --- HELPER COMPONENTS --- */
function StatBox({ number, label }) {
  return (
    <motion.div className="stat-box" variants={itemVariants}>
      <span className="stat-number">{number}</span>
      <span className="stat-label">{label}</span>
    </motion.div>
  );
}

function HomeCard({ title, text, onClick }) {
  return (
    <motion.div 
        className="info-card" 
        onClick={onClick}
        variants={itemVariants}
        whileHover={{ 
            y: -10, 
            boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
            borderColor: "#FFA500"
        }}
        whileTap={{ scale: 0.98 }}
    >
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="link">Learn more →</span>
    </motion.div>
  );
}

export default HomePage;