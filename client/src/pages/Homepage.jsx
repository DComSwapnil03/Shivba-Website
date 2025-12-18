import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENT 1: EMOJI ORBIT ANIMATION (The "Real" Look) ---
const EmojiOrbitAnimation = () => {
  const emojis = ['🏋️', '🛌', '📚', '👥', '🧘', '💪', '🏆'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % emojis.length);
    }, 2500); // Change emoji every 2.5 seconds
    return () => clearInterval(timer);
  }, [emojis.length]);

  return (
    <div className="emoji-orbit-wrapper">
      {/* Outer Rotating Ring (Dashed) */}
      <motion.div
        className="orbit-ring-outer"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner Rotating Ring (Solid) */}
      <motion.div
        className="orbit-ring-inner"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* The Glowing Core Background */}
      <div className="orbit-core-glow" />

      {/* The Emoji Switcher */}
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

// --- COMPONENT 2: GRAVITY PLAYGROUND ---
// function GravitySection() {
//   const icons = [
//     { icon: '🏋️', label: 'Talim', color: '#ffe4e6', text: '#db2777' },
//     { icon: '🛌', label: 'Hostel', color: '#dbeafe', text: '#2563eb' },
//     { icon: '📚', label: 'Library', color: '#f3f4f6', text: '#4b5563' },
//     { icon: '👥', label: 'Social', color: '#fae8ff', text: '#a855f7' },
//     { icon: '🧘', label: 'Yoga', color: '#dcfce7', text: "#16a34a" },
//     { icon: '💪', label: 'Food', color: '#ffedd5', text: '#ea580c' },
//     { icon: '🏆', label: 'Sports', color: '#fef9c3', text: '#ca8a04' },
//   ];
//   const floatingItems = [...icons, ...icons, ...icons];

//   return (
//     <section className="gravity-container">
//       <div className="gravity-header animate-fadeIn">
//         <h2>Our Ecosystem</h2>
//         <p>A fluid network of services. Drag them to see the physics.</p>
//       </div>
//       <div className="gravity-box">
//         {floatingItems.map((item, i) => (
//           <FloatingBubble key={i} item={item} />
//         ))}
//       </div>
//     </section>
//   );
// }

// function FloatingBubble({ item }) {
//   const randomTop = Math.floor(Math.random() * 80) + 10;
//   const randomLeft = Math.floor(Math.random() * 80) + 10;
//   const durationX = Math.random() * 10 + 20;
//   const durationY = Math.random() * 10 + 15;

//   return (
//     <motion.div
//       className="gravity-bubble"
//       style={{
//         backgroundColor: item.color, color: item.text,
//         top: `${randomTop}%`, left: `${randomLeft}%`,
//       }}
//       animate={{
//         y: [0, -30, 0, 30, 0], x: [0, 20, 0, -20, 0], rotate: [0, 5, -5, 0],
//       }}
//       transition={{
//         y: { duration: durationY, repeat: Infinity, ease: 'easeInOut' },
//         x: { duration: durationX, repeat: Infinity, ease: 'easeInOut' },
//         rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
//       }}
//       whileHover={{ scale: 1.1, zIndex: 50, cursor: 'grab' }}
//       whileTap={{ scale: 1.05, cursor: 'grabbing' }}
//       drag dragElastic={0.2} dragMomentum={true}
//       dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
//       dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
//     >
//       <span className="bubble-icon">{item.icon}</span>
//       <span className="bubble-label">{item.label}</span>
//     </motion.div>
//   );
// }

// --- MAIN PAGE ---
function HomePage({ setPage }) {
  const { t } = useTranslation();
  const slides = t('home.slides', { returnObjects: true });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="home-container">
      {/* 1. Hero */}
      <section className="home-hero">
        {slides.map((slide, index) => (
          <div key={index} className={`hero-slide ${index === current ? 'active' : ''}`}>
            <div className="hero-overlay" />
            <img src={slide.image} alt="Background" />
          </div>
        ))}
        <div className="hero-content animate-fadeIn">
          <h1>{t('home.heroTitle')}</h1>
          <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setPage({ name: 'register' })}>
              {t('home.heroPrimary')}
            </button>
            <button className="btn-outline" onClick={() => setPage({ name: 'contact' })}>
              {t('home.heroSecondary')}
            </button>
          </div>
          <div className="hero-stats">
            <StatBox number={t('home.stats.membersNumber')} label={t('home.stats.membersLabel')} />
            <StatBox number={t('home.stats.workshopsNumber')} label={t('home.stats.workshopsLabel')} />
            <StatBox number={t('home.stats.yearsNumber')} label={t('home.stats.yearsLabel')} />
          </div>
        </div>
      </section>

      

      {/* 2. Services */}
      <section className="home-section">
        <div className="section-header ">
          <h2>{t('home.servicesTitle')}</h2>
          <p>{t('home.servicesSubtitle')}</p>
        </div>
        <div className="cards-grid ">
          <HomeCard title={t('home.cards.talim.title')} text={t('home.cards.talim.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'talim' } })} />
          <HomeCard title={t('home.cards.hostel.title')} text={t('home.cards.hostel.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'hostel' } })} />
          <HomeCard title={t('home.cards.library.title')} text={t('home.cards.library.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'library' } })} />
          <HomeCard title={t('home.cards.social.title')} text={t('home.cards.social.text')} onClick={() => setPage({ name: 'service-detail', params: { id: 'social' } })} />
        </div>
      </section>

      {/* 4. Register + NEW EMOJI ANIMATION */}
      <section className="particle-register-section">
        <div className="particle-content">
          <h2>Join the <br /> Revolution</h2>
          <p>Experience the new era of management. <br /> Sign up now to access exclusive services.</p>
          <div className="particle-buttons">
            <button className="btn-glow" onClick={() => setPage({ name: 'register' })}>
              Register Now
            </button>
            <button className="btn-text" onClick={() => setPage({ name: 'contact' })}>
              Contact Support
            </button>
          </div>
        </div>
        <div className="particle-visual">
          {/* Replaced IconMorph with EmojiOrbit */}
          <EmojiOrbitAnimation />
        </div>
      </section>
    </div>
  );
}

function StatBox({ number, label }) {
  return (
    <div className="stat-box">
      <span className="stat-number">{number}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function HomeCard({ title, text, onClick }) {
  return (
    <div className="info-card animate-fadeIn" onClick={onClick}>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="link">Learn more →</span>
    </div>
  );
}

export default HomePage;