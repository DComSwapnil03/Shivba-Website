import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

/* --- 1. ANIMATION VARIANTS --- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 } 
  }
};

function AboutPage() {
  const { t } = useTranslation();

  return (
    <motion.div 
      className="about-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS: FONTS & STYLES --- */}
      <style>{`
        /* 1. Import Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* 2. Global Typography */
        .about-container h1, 
        .about-container h2, 
        .about-container h3 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
            color: #1a1a1a;
        }

        .about-container p, 
        .about-container span {
            font-family: 'Montserrat', sans-serif !important;
            color: #4a4a4a;
            line-height: 1.6;
        }

        /* Dark Mode Overrides (Handled by GlobalStyles usually, but ensuring specific text visibility) */
        body.dark-mode .about-container h1,
        body.dark-mode .about-container h2,
        body.dark-mode .about-container h3,
        body.dark-mode .about-team-avatar {
             color: #ffffff !important;
        }
        body.dark-mode .about-container p {
             color: #cccccc !important;
        }

        /* 3. Hero Section */
        .about-hero {
            position: relative;
            height: 60vh;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop') no-repeat center center/cover;
            margin-bottom: 4rem;
        }
        .about-hero-overlay {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.6);
        }
        .about-hero-inner {
            position: relative;
            z-index: 2;
            color: white;
            max-width: 800px;
            padding: 0 20px;
        }
        .about-hero h1 {
            font-size: 3.5rem;
            color: #ffffff;
            margin-bottom: 1rem;
            text-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        .about-hero p {
            font-size: 1.25rem;
            color: #f0f0f0;
            font-weight: 300;
        }

        /* 4. Sections Layout */
        .about-block {
            padding: 4rem 1.5rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .about-inner-narrow {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        .about-block h2 {
            font-size: 2.5rem;
            text-align: center;
            margin-bottom: 3rem;
            position: relative;
            display: inline-block;
            width: 100%;
        }
        
        /* 5. Values Grid */
        .about-values-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        .about-value-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0,0,0,0.1);
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            transition: all 0.3s ease;
        }
        body.dark-mode .about-value-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .about-value-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #FFA500; /* Shivba Gold */
        }

        /* 6. Team Grid */
        .about-team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 3rem;
            justify-content: center;
        }
        .about-team-card {
            text-align: center;
        }
        .about-team-avatar {
            width: 120px;
            height: 120px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #1a1a1a, #333);
            color: #FFA500;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            font-family: 'Cinzel', serif;
            border: 3px solid #FFA500;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .role-text {
            color: #888;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 0.5rem;
        }

      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <motion.div className="about-hero-inner" variants={itemVariants}>
          <motion.h1 variants={itemVariants}>{t('about.heroTitle')}</motion.h1>
          <motion.p variants={itemVariants}>{t('about.heroSubtitle')}</motion.p>
        </motion.div>
      </section>

      {/* --- OUR STORY --- */}
      <motion.section 
        className="about-block about-story"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="about-inner-narrow">
          <motion.h2 variants={itemVariants}>{t('about.storyTitle')}</motion.h2>
          <motion.p variants={itemVariants} style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            {t('about.storyParagraph1')}
          </motion.p>
          <motion.p variants={itemVariants} style={{ fontSize: '1.1rem' }}>
            {t('about.storyParagraph2')}
          </motion.p>
        </div>
      </motion.section>

      {/* --- WHAT DRIVES US (VALUES) --- */}
      <motion.section 
        className="about-block about-values"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="about-inner-wide">
          <motion.h2 variants={itemVariants}>{t('about.drivesTitle')}</motion.h2>
          <div className="about-values-grid">
            <ValueCard icon="➜" title={t('about.missionTitle')} text={t('about.missionText')} />
            <ValueCard icon="◎" title={t('about.visionTitle')} text={t('about.visionText')} />
            <ValueCard icon="❤" title={t('about.valuesTitle')} text={t('about.valuesText')} />
            <ValueCard icon="★" title={t('about.commitmentTitle')} text={t('about.commitmentText')} />
          </div>
        </div>
      </motion.section>

      {/* --- LEADERSHIP TEAM --- */}
      <motion.section 
        className="about-block about-team"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="about-inner-wide">
          <motion.h2 variants={itemVariants}>{t('about.teamTitle')}</motion.h2>
          <div className="about-team-grid">
            <TeamCard name={t('about.team1.name')} role={t('about.team1.role')} />
            <TeamCard name={t('about.team2.name')} role={t('about.team2.role')} />
            <TeamCard name={t('about.team3.name')} role={t('about.team3.role')} />
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}

/* --- HELPER COMPONENTS WITH MOTION --- */

function ValueCard({ icon, title, text }) {
  return (
    <motion.div 
      className="about-value-card"
      variants={itemVariants}
      whileHover={{ 
        y: -10, 
        boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
        borderColor: "#FFA500"
      }}
    >
      <div className="about-value-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </motion.div>
  );
}

function TeamCard({ name, role }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <motion.div 
      className="about-team-card"
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
    >
      <div className="about-team-avatar">{initial}</div>
      <h3>{name}</h3>
      <p className="role-text">{role}</p>
    </motion.div>
  );
}

export default AboutPage;