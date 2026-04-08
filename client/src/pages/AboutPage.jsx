import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

/* --- 1. ANIMATION VARIANTS  --- */
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
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        .about-container h1, .about-container h2, .about-container h3 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
            color: #1a1a1a;
        }

        .about-container p, .about-container span {
            font-family: 'Montserrat', sans-serif !important;
            color: #4a4a4a;
            line-height: 1.6;
        }

        /* Dark Mode */
        body.dark-mode .about-container h1,
        body.dark-mode .about-container h2,
        body.dark-mode .about-container h3 { color: #ffffff !important; }
        body.dark-mode .about-container p { color: #cccccc !important; }

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
        .about-hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); }
        .about-hero-inner { position: relative; z-index: 2; color: white; max-width: 800px; padding: 0 20px; }
        .about-hero h1 { font-size: 3.5rem; color: #ffffff; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }

        .about-block { padding: 4rem 1.5rem; max-width: 1200px; margin: 0 auto; }
        .about-inner-narrow { max-width: 800px; margin: 0 auto; text-align: center; }
        
        .about-values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .about-value-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0,0,0,0.1); padding: 2rem; border-radius: 15px; text-align: center; transition: all 0.3s ease; }
        body.dark-mode .about-value-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); }

        /* Team Section */
        .about-team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; justify-content: center; }
        .about-team-card { text-align: center; }
        .about-team-avatar {
            width: 150px; /* Slightly larger for photos */
            height: 150px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #1a1a1a, #333);
            color: #FFA500;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            border: 3px solid #FFA500;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            overflow: hidden; /* Added to keep image circular */
        }
        .about-team-img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* Ensures image isn't stretched */
        }
        .role-text { color: #888; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; }

        /* Success Stories */
        .success-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .success-card { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); transition: transform 0.3s ease; text-align: center; border: 1px solid #eee; }
        body.dark-mode .success-card { background: #1a1a1a; border: 1px solid #333; }
        .success-image { width: 100%; height: 280px; object-fit: cover; border-bottom: 3px solid #FFA500; }
        .success-badge { display: inline-block; background: #fdf6e3; color: #d97706; padding: 6px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; margin-top: 15px; border: 1px solid #fde68a; }
      `}</style>

      {/* --- HERO --- */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <motion.div className="about-hero-inner" variants={itemVariants}>
          <h1>{t('about.heroTitle')}</h1>
          <p>{t('about.heroSubtitle')}</p>
        </motion.div>
      </section>

      {/* --- OUR STORY --- */}
      <motion.section className="about-block" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="about-inner-narrow">
          <h2>{t('about.storyTitle')}</h2>
          <p style={{ fontSize: '1.1rem' }}>{t('about.storyParagraph1')}</p>
        </div>
      </motion.section>

      {/* --- SUCCESS STORIES --- */}
      <motion.section className="about-block" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 style={{textAlign:'center'}}>Success Stories</h2>
          <div className="success-grid">
            <SuccessStoryCard name="AKSHADA VATEKAR" achievement="..." badge="🛡️ Maharashtra Police" imageUrl="/WhatsApp Image 2026-04-08 at 12.35.24 AM (1).jpeg" />
            <SuccessStoryCard name="SACHIN & SAURABH" achievement="..." badge="⚔️ MUMBAI POLICE" imageUrl="/SACHIN JADHAV & SAURABH JADHAV.jpeg" />
            <SuccessStoryCard name="HAKIM, SUNIL & AKSHAY" achievement="..." badge="⚔️ MAHARASHTRA POLICE" imageUrl="/HAKIM SUTAR, SUNIL HANDE & AKSHAY MORE.jpeg" />
            <SuccessStoryCard name="SUPRIYA JAMBUKAR" achievement="..." badge="🌟 MAHARASHTRA POLICE" imageUrl="/WhatsApp Image 2026-04-08 at 12.35.24 AM.jpeg" />
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
          <motion.h2 variants={itemVariants} style={{textAlign:'center'}}>{t('about.teamTitle')}</motion.h2>
          <div className="about-team-grid">
            
            {/* UPDATED TEAM CARDS WITH YOUR PICTURES */}
            <TeamCard 
              name="Aniket Thakur" 
              role="Founder & Head Coach" 
              imageUrl="/ANIKET THAKUR.png" 
            />
            
            <TeamCard 
              name="Harshada Thakur" 
              role="Co-Founder & Administrator" 
              imageUrl="/HARSHADA THAKUR.png" 
            />
            
            <TeamCard 
              name={t('about.team3.name')} 
              role={t('about.team3.role')} 
              imageUrl={null} /* Generic fallback for others */
            />

          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

/* --- HELPER COMPONENTS --- */

function TeamCard({ name, role, imageUrl }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <motion.div className="about-team-card" variants={itemVariants} whileHover={{ scale: 1.05 }}>
      <div className="about-team-avatar">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="about-team-img" />
        ) : (
          initial
        )}
      </div>
      <h3>{name}</h3>
      <p className="role-text">{role}</p>
    </motion.div>
  );
}

function SuccessStoryCard({ name, achievement, badge, imageUrl }) {
  return (
    <motion.div className="success-card" variants={itemVariants}>
      <img src={imageUrl} alt={name} className="success-image" loading="lazy" />
      <div className="success-content">
        <h3>{name}</h3>
        <p>{achievement}</p>
        <div className="success-badge">{badge}</div>
      </div>
    </motion.div>
  );
}

export default AboutPage;