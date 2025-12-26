import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

/* --- 1. ANIMATION VARIANTS (The "Cinematic" Motion) --- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Cascading effect (items appear one by one)
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 }, // Start 40px lower
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 } // Smooth slide up
  }
};

/* --- 2. EMOJI ORBIT COMPONENT --- */
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
      {/* Outer Dashed Ring */}
      <motion.div
        className="orbit-ring-outer"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner Solid Ring */}
      <motion.div
        className="orbit-ring-inner"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      {/* Glow Core */}
      <div className="orbit-core-glow" />
      
      {/* Changing Emoji */}
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

/* --- 3. MAIN HOMEPAGE COMPONENT --- */
function HomePage({ setPage }) {
  const { t } = useTranslation();
  
  // --- UPDATED SLIDES CONFIGURATION ---
  // Using the local images you provided
  const slides = [
    { image: '/IMG-20251226-WA0024.jpg', alt: 'Gym Facilities' },        // Gym
    { image: '/IMG-20251226-WA0005.jpg', alt: 'Library Area' },          // Library
    { image: '/social.jpg', alt: 'Social Awareness Programs' }           // Social Awareness
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
      {/* --- INJECTED CSS: FONTS & ORBIT ANIMATION STYLES --- */}
      <style>{`
        /* 1. Import Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* 2. Global Font Assignments for Home */
        .home-container h1, 
        .home-container h2, 
        .home-container h3,
        .stat-number {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }

        .home-container p, 
        .home-container button, 
        .home-container span, 
        .home-container .link,
        .stat-label {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* 3. Button Styling (Sharp & Cinematic) */
        .btn-primary, .btn-outline, .btn-glow {
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 600;
            border-radius: 0 !important;
        }

        /* 4. Emoji Orbit CSS (Embedded for portability) */
        .emoji-orbit-wrapper {
            position: relative;
            width: 300px;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .orbit-ring-outer {
            position: absolute;
            width: 100%; height: 100%;
            border: 2px dashed rgba(255, 165, 0, 0.3); /* Orange tint */
            border-radius: 50%;
        }
        .orbit-ring-inner {
            position: absolute;
            width: 70%; height: 70%;
            border: 2px solid rgba(255, 165, 0, 0.6);
            border-left-color: transparent;
            border-radius: 50%;
        }
        .orbit-core-glow {
            position: absolute;
            width: 40%; height: 40%;
            background: radial-gradient(circle, rgba(255,165,0,0.2) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(10px);
        }
        .emoji-display {
            font-size: 5rem;
            z-index: 10;
        }
        .real-emoji {
            display: block;
        }

        /* 5. Hero Overrides */
        .hero-content h1 {
            text-shadow: 0 4px 10px rgba(0,0,0,0.5);
            font-size: 3.5rem;
        }
        .hero-subtitle {
            font-weight: 300;
            letter-spacing: 0.1em;
            font-size: 1.1rem;
        }
      `}</style>

      {/* --- SECTION 1: HERO --- */}
      <section className="home-hero">
        {/* Background Slides */}
        {slides.map((slide, index) => (
          <div key={index} className={`hero-slide ${index === current ? 'active' : ''}`}>
            <div className="hero-overlay" />
            <img src={slide.image} alt={slide.alt} />
          </div>
        ))}
        
        {/* Animated Content */}
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

      {/* --- SECTION 3: REGISTER / REVOLUTION --- */}
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