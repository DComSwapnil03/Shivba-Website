import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15 } 
  }
};

function HelpPage() {
  const { t } = useTranslation();

  const shortcuts = [
    { keys: ['Alt', 'H'], action: t('help.shortcuts.home') },
    { keys: ['Alt', 'A'], action: t('help.shortcuts.about') },
    { keys: ['Alt', 'S'], action: t('help.shortcuts.services') },
    { keys: ['Alt', 'E'], action: t('help.shortcuts.events') },
    { keys: ['Alt', 'G'], action: t('help.shortcuts.gallery') },
    { keys: ['Alt', 'C'], action: t('help.shortcuts.contact') },
    { keys: ['Alt', 'R'], action: t('help.shortcuts.register') },
    { keys: ['Alt', 'L'], action: t('help.shortcuts.account') },
    { keys: ['Alt', '←'], action: t('help.shortcuts.back') },
    { keys: ['Alt', '→'], action: t('help.shortcuts.forward') },
    { keys: ['Alt', '1-4'], action: t('help.shortcuts.quickAccess') },
  ];

  const features = [
    { icon: '🏋️', title: t('help.features.talim.title'), desc: t('help.features.talim.desc') },
    { icon: '🏠', title: t('help.features.hostel.title'), desc: t('help.features.hostel.desc') },
    { icon: '📚', title: t('help.features.library.title'), desc: t('help.features.library.desc') },
    { icon: '🤝', title: t('help.features.social.title'), desc: t('help.features.social.desc') },
    { icon: '📅', title: t('help.features.events.title'), desc: t('help.features.events.desc') },
    { icon: '👤', title: t('help.features.member.title'), desc: t('help.features.member.desc') },
  ];

  return (
    <motion.div 
      className="help-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* Typography */
        .help-container h1, .help-container h2, .help-container h3 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }
        .help-container p, .help-container span, .help-container div {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* Hero */
        .help-hero {
            padding: 4rem 2rem; text-align: center;
            background: #1a1a1a; color: white;
            margin-bottom: 3rem;
        }
        .help-hero h1 { font-size: 3rem; margin-bottom: 0.5rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .help-hero p { font-size: 1.1rem; color: #ccc; }

        /* Sections */
        .help-section { margin-bottom: 4rem; padding: 0 2rem; max-width: 1200px; margin-left: auto; margin-right: auto; }
        .section-header { text-align: center; margin-bottom: 2.5rem; }
        .section-title { font-size: 2rem; color: #333; margin-bottom: 0.5rem; }
        .section-divider { width: 60px; height: 4px; background: #FFA500; margin: 0 auto; border-radius: 2px; }
        body.dark-mode .section-title { color: white; }

        /* Feature Cards */
        .features-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        .feature-card {
            background: white; padding: 2rem; border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eee;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        body.dark-mode .feature-card { background: #1e1e1e; border-color: #333; }
        
        .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .feature-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #1a1a1a; }
        body.dark-mode .feature-title { color: #fff; }
        .feature-desc { color: #666; line-height: 1.6; }
        body.dark-mode .feature-desc { color: #aaa; }

        /* Shortcuts Section */
        .shortcuts-panel {
            background: white; padding: 2.5rem; border-radius: 16px;
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.15);
            border-top: 4px solid #FFA500;
        }
        body.dark-mode .shortcuts-panel { background: #1e1e1e; border-color: #FFA500; }

        .shortcuts-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem 4rem;
        }
        .shortcut-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 0.8rem 0; border-bottom: 1px solid #f0f0f0;
        }
        body.dark-mode .shortcut-row { border-color: #333; }
        .shortcut-action { font-weight: 600; color: #444; }
        body.dark-mode .shortcut-action { color: #ccc; }
        
        .key-group { display: flex; gap: 0.5rem; }
        .kbd-key {
            background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
            border: 1px solid #d1d5db; border-bottom-width: 3px;
            border-radius: 6px; padding: 4px 10px;
            font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 0.85rem;
            color: #374151; min-width: 2rem; text-align: center;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        body.dark-mode .kbd-key {
            background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
            border-color: #4b5563; color: #f3f4f6;
        }

        /* Accessibility Note */
        .a11y-card {
            background: #eff6ff; border: 1px solid #bfdbfe;
            padding: 1.5rem; border-radius: 12px; display: flex; gap: 1rem; align-items: start;
        }
        body.dark-mode .a11y-card { background: #172554; border-color: #1e3a8a; }
        .a11y-icon { font-size: 2rem; }
        .a11y-content h3 { color: #1e3a8a; margin-bottom: 0.5rem; font-size: 1.1rem; }
        body.dark-mode .a11y-content h3 { color: #bfdbfe; }
        .a11y-content p { color: #1e40af; font-size: 0.95rem; line-height: 1.5; }
        body.dark-mode .a11y-content p { color: #93c5fd; }

      `}</style>

      {/* --- HERO --- */}
      <section className="help-hero">
        <motion.div variants={itemVariants}>
          <h1>{t('help.hero.title')}</h1>
          <p>{t('help.hero.subtitle')}</p>
        </motion.div>
      </section>

      {/* --- FEATURES --- */}
      <motion.section className="help-section" variants={containerVariants}>
        <div className="section-header">
          <h2 className="section-title">{t('help.sections.features')}</h2>
          <div className="section-divider"></div>
        </div>
        
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="feature-card" variants={itemVariants}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* --- SHORTCUTS --- */}
      <motion.section className="help-section" variants={itemVariants}>
        <div className="shortcuts-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', margin: 0 }}>⌨️ {t('help.sections.shortcuts')}</h2>
            <span style={{ fontSize: '0.8rem', background: '#f3f4f6', padding: '4px 12px', borderRadius: '20px', color: '#666', fontWeight: 'bold' }}>
              {t('help.labels.proTip')}
            </span>
          </div>
          
          <div className="shortcuts-grid">
            {shortcuts.map((s, i) => (
              <div key={i} className="shortcut-row">
                <span className="shortcut-action">{s.action}</span>
                <div className="key-group">
                  {s.keys.map((k, j) => (
                    <span key={j} className="kbd-key">{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- ACCESSIBILITY --- */}
      <motion.section className="help-section" variants={itemVariants}>
        <div className="a11y-card">
          <div className="a11y-icon">⚙️</div>
          <div className="a11y-content">
            <h3>{t('help.accessibility.title')}</h3>
            <p>
              {t('help.accessibility.desc_pre')} <strong>{t('help.accessibility.darkMode')}</strong> {t('help.accessibility.desc_post')}
            </p>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}

export default HelpPage;