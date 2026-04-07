import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

/* --- 1. DATA: SUCCESS STORIES --- */
// UPDATED: Only showing the two Maharashtra Police selections
const SUCCESS_STORIES = [
  {
    id: 1,
    name: "Supriya Jambukar",
    role: "Maharashtra Police",
    quote: "The rigorous physical training and focused environment at Shivba Talim were instrumental in my selection for the Maharashtra Police.",
    image: "/WhatsApp Image 2026-04-08 at 12.35.24 AM.jpeg"
  },
  {
    id: 2,
    name: "Pranjali Nagargoje",
    role: "Maharashtra Police",
    quote: "Discipline, expert guidance, and the best facilities at Shivba helped me achieve my dream of wearing the police uniform.",
    image: "/WhatsApp Image 2026-04-08 at 12.35.24 AM (1).jpeg"
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
      <svg className="orbit-svg" viewBox="0 0 300 300">
        
        {/* Outer Ring - Dashed and spinning slowly */}
        <motion.circle
          cx="150" cy="150" r="145"
          stroke="rgba(255, 165, 0, 0.3)"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray="8 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Inner Ring - Animates to complete itself, then shrinks, while spinning */}
        <motion.circle
          cx="150" cy="150" r="105"
          stroke="rgba(255, 165, 0, 0.8)"
          strokeWidth="3"
          fill="transparent"
          strokeLinecap="round"
          initial={{ pathLength: 0.1, rotate: 0 }}
          animate={{ 
            pathLength: [0.1, 1, 0.1], 
            rotate: -360 
          }}
          transition={{ 
            pathLength: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 12, repeat: Infinity, ease: "linear" }
          }}
          style={{ transformOrigin: "center" }}
        />
      </svg>

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
                {/* Added onError to fallback to a placeholder if the image path is broken */}
                <img 
                  src={SUCCESS_STORIES[active].image} 
                  alt={SUCCESS_STORIES[active].name} 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=200&auto=format&fit=crop' }}
                />
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

  // Auto-rotate hero slides
  useEffect(() => {
    const id = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <motion.div 
      className="home-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* Global Font Assignments */
        .home-container {
            background-color: #121212; 
            color: #e0e0e0;
            min-height: 100vh;
        }

        .home-container h1, .home-container h2, .home-container h3, .stat-number {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
            color: #ffffff !important;
        }

        .home-container p, button, span, .link, .stat-label, .story-quote {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* Buttons */
        .btn-primary, .btn-outline, .btn-glow {
            text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; border-radius: 0 !important; cursor: pointer;
        }

        /* Emoji Orbit CSS */
        .emoji-orbit-wrapper { 
            position: relative; width: 300px; height: 300px; 
            display: flex; justify-content: center; align-items: center; 
        }
        .orbit-svg { 
            position: absolute; width: 100%; height: 100%; z-index: 1; pointer-events: none; 
        }
        .orbit-core-glow { 
            position: absolute; width: 40%; height: 40%; 
            background: radial-gradient(circle, rgba(255,165,0,0.25) 0%, transparent 70%); 
            border-radius: 50%; filter: blur(10px); z-index: 0;
        }
        .emoji-display { font-size: 5rem; z-index: 10; }
        .real-emoji { display: block; }

        /* Hero Overrides */
        .hero-content h1 { text-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 3.5rem; }
        .hero-subtitle { font-weight: 300; letter-spacing: 0.1em; font-size: 1.1rem; color: #f0f0f0 !important; }

        /* Service Cards */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            padding: 0 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .info-card {
            background: #1e1e1e !important; 
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5); 
            cursor: pointer;
            border: 1px solid #333; 
            transition: transform 0.3s ease;
            text-align: left;
            color: #ffffff !important; 
        }

        .info-card h3, .home-container .info-card h3 {
            color: #ffffff !important;
            font-size: 1.25rem !important;
            margin-bottom: 1rem;
            font-weight: 700;
        }

        .info-card p, .home-container .info-card p {
            color: #bbbbbb !important; 
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }

        .info-card .link {
            color: #ea580c !important;
            font-weight: bold;
            font-size: 0.9rem;
            display: inline-block;
        }

        /* Voices of Victory */
        .stories-section {
            padding: 4rem 2rem;
            background-color: #121212 !important; 
            text-align: center;
        }

        .stories-section h2 {
            color: #ffffff !important; 
            font-family: 'Cinzel', serif !important;
            font-size: 2rem !important;
            margin-bottom: 10px !important;
            text-shadow: none !important; 
        }

        .stories-section p {
            color: #bbbbbb !important; 
            margin-bottom: 2rem !important;
            font-weight: 500 !important;
        }

        .story-card {
            background-color: #1e1e1e !important; 
            padding: 2rem;
            border-radius: 15px;
            border: 1px solid #333;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            text-align: center;
            width: 100%;
            max-width: 600px; 
            margin: 0 auto; 
        }

        .story-quote {
            color: #e0e0e0 !important; 
            font-style: italic;
            font-size: 1.1rem !important;
            line-height: 1.6 !important;
            margin-bottom: 1.5rem !important;
        }

        .story-meta h4 {
            color: #ea580c !important; 
            margin: 0 !important;
            font-size: 1.2rem !important;
            font-weight: 700 !important;
        }

        .story-meta span {
            color: #888888 !important; 
            font-size: 0.9rem !important;
        }

        /* Image & Dots */
        .story-img-wrapper img { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #ea580c; object-fit: cover; margin-bottom: 1rem; }
        .story-dots { display: flex; gap: 10px; margin-top: 1rem; justify-content: center; }
        .story-dots .dot { width: 10px; height: 10px; background: #555 !important; border-radius: 50%; cursor: pointer; transition: all 0.3s; }
        .story-dots .dot.active { background: #ea580c !important; transform: scale(1.2); }
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
      <section className="home-section" style={{ backgroundColor: '#121212' }}>
        <motion.div 
            className="section-header" 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 variants={itemVariants} style={{ color: '#fff' }}>{t('home.servicesTitle')}</motion.h2>
          <motion.p variants={itemVariants} style={{ color: '#ccc' }}>{t('home.servicesSubtitle')}</motion.p>
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

      {/* --- SECTION 3: SUCCESS STORIES --- */}
      <section className="stories-section">
         <motion.div
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
         >
            <motion.h2 
                style={{
                    fontFamily: 'Cinzel', 
                    fontSize: '2rem', 
                    marginBottom: '10px', 
                    color: '#ffffff',
                    textShadow: 'none' 
                }} 
                variants={itemVariants}
            >
                Voices of Victory
            </motion.h2>

            <motion.p 
                variants={itemVariants} 
                style={{
                    marginBottom: '2rem', 
                    color: '#bbbbbb',
                    fontWeight: '500'
                }}
            >
                Real stories from real people who transformed their lives.
            </motion.p>
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
        style={{ color: '#fff' }} 
      >
        <div className="particle-content">
          <motion.h2 variants={itemVariants} style={{ color: '#fff' }}>Join the <br /> Revolution</motion.h2>
          <motion.p variants={itemVariants} style={{ color: '#ddd' }}>Experience the new era of management. <br /> Sign up now to access exclusive services.</motion.p>
          <motion.div className="particle-buttons" variants={itemVariants}>
            <button className="btn-glow" onClick={() => setPage({ name: 'register' })}>
              Register Now
            </button>
            <button className="btn-text" onClick={() => setPage({ name: 'contact' })} style={{ color: '#fff' }}>
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
      <span className="stat-number" style={{color: '#fff'}}>{number}</span>
      <span className="stat-label" style={{color: '#ddd'}}>{label}</span>
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
            boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
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