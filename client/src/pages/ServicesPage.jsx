import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

/* --- 1. DATA & CONFIGURATION --- */
const services = [
  {
    id: 'talim',
    title: 'Shivba Talim',
    // UPDATED: Using your local image for Gym
    imageUrl: '/IMG-20251226-WA0024.jpg',
    icon: '⚡',
    tagline: 'State-of-the-art equipment for the modern warrior.',
    bullets: [
      'Modern fitness equipment',
      'Personal training sessions',
      'Group workout classes'
    ],
    cta: 'Join Talim',
    layout: 'image-left',
    shortcut: '1'
  },
  {
    id: 'hostel',
    title: 'Shivba Hostel',
    // Keeping original Unsplash image for Hostel
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop',
    icon: '🏠',
    tagline: 'Connect with like-minded individuals in comfort.',
    bullets: [
      'Comfortable accommodation',
      '24/7 security & surveillance',
      'High-speed internet access'
    ],
    cta: 'Explore Hostel',
    layout: 'image-right',
    shortcut: '2'
  },
  {
    id: 'library',
    title: 'Shivba Library',
    // Using local image from public folder (previously updated)
    imageUrl: '/IMG-20251226-WA0006.jpg',
    icon: '📚',
    tagline: 'Expand your mind with our extensive collection.',
    bullets: [
      'Extensive book collection',
      'Digital resources & archives',
      'Quiet study spaces'
    ],
    cta: 'Visit Library',
    layout: 'image-left',
    shortcut: '3'
  },
  {
    id: 'awareness',
    title: 'Social Awareness',
    // Using local image from public folder (previously updated)
    imageUrl: '/IMG-20251226-WA0012.jpg',
    icon: '🤝',
    tagline: 'Participate in workshops, seminars, and change.',
    bullets: [
      'Weekly workshops',
      'Community outreach events',
      'Skill development programs'
    ],
    cta: 'View Events',
    layout: 'image-right',
    shortcut: '4',
    externalLink: 'https://socialawarenessfoundation.com/' 
  }
];

/* --- 2. ANIMATION VARIANTS --- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 } 
  }
};

function ServicesPage({ setPage }) {
  
  // --- LOGIC PRESERVED FROM ORIGINAL ---
  const handlePrimaryClick = useCallback((service) => {
      if (service.id === 'awareness') {
        setPage({ name: 'events' });
      } else {
        setPage({ name: 'service-detail', params: { id: service.id } });
      }
    }, [setPage]);

  const handleLearnMore = useCallback((service) => {
      if (service.externalLink) {
        window.open(service.externalLink, '_blank');
        return;
      }
      if (service.id === 'awareness') {
        setPage({ name: 'events' });
      } else {
        setPage({ name: 'service-detail', params: { id: service.id } });
      }
    }, [setPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.altKey) {
        const svc = services.find((s) => s.shortcut === e.key);
        if (svc) {
          e.preventDefault();
          handlePrimaryClick(svc);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrimaryClick]);

  const handleContactClick = () => {
    setPage({ name: 'contact' });
  };

  return (
    <motion.div 
      className="services-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        /* 1. Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* 2. Global Type */
        .services-container h1, 
        .services-container h2, 
        .service-shortcut-tag {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }

        .services-container p, 
        .services-container li, 
        .services-container button {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* 3. Hero Section */
        .services-hero {
            position: relative;
            height: 50vh;
            min-height: 400px;
            background: url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop') no-repeat center center/cover;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            margin-bottom: 4rem;
        }
        .services-hero-overlay {
            position: absolute; inset: 0; background: rgba(0,0,0,0.6);
        }
        .services-hero-inner {
            position: relative; z-index: 2; color: white; padding: 20px;
        }
        .services-hero h1 {
            font-size: 3.5rem; color: #fff; margin-bottom: 1rem;
            text-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        .services-hero p {
            font-size: 1.2rem; color: #e0e0e0; max-width: 600px; margin: 0 auto;
        }

        /* 4. Service Row Layout */
        .services-list {
            max-width: 1200px; margin: 0 auto; padding: 0 20px;
        }
        .service-row {
            display: flex;
            align-items: center;
            gap: 4rem;
            margin-bottom: 6rem;
        }
        /* Mobile Stack */
        @media (max-width: 900px) {
            .service-row { flex-direction: column !important; gap: 2rem; margin-bottom: 4rem; }
            .service-image-wrapper { width: 100% !important; height: 300px !important; }
        }

        /* 5. Image Styling */
        .service-image-wrapper {
            flex: 1;
            height: 400px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            position: relative;
        }
        .service-image {
            width: 100%; height: 100%; object-fit: cover;
            transition: transform 0.6s ease;
        }
        .service-image-wrapper:hover .service-image {
            transform: scale(1.1);
        }

        /* 6. Text Styling */
        .service-text {
            flex: 1;
        }
        .service-icon-circle {
            width: 60px; height: 60px;
            background: #FFA500;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 10px 20px rgba(255, 165, 0, 0.3);
        }
        .service-text h2 {
            font-size: 2.5rem; margin-bottom: 1rem; color: #1a1a1a;
            display: flex; align-items: center; gap: 15px;
        }
        .service-shortcut-tag {
            font-size: 0.8rem;
            background: #eee; color: #666;
            padding: 4px 8px; border-radius: 4px;
            border: 1px solid #ddd;
        }
        .service-tagline {
            font-size: 1.1rem; color: #666; font-style: italic; margin-bottom: 1.5rem;
            border-left: 3px solid #FFA500; padding-left: 15px;
        }
        .service-bullets {
            list-style: none; padding: 0; margin-bottom: 2rem;
        }
        .service-bullets li {
            margin-bottom: 0.5rem; color: #444; display: flex; align-items: center; gap: 10px;
        }
        
        /* 7. Buttons */
        .btn-cinematic-primary {
            background: #1a1a1a; color: white;
            padding: 12px 24px; border: none; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s;
        }
        .btn-cinematic-primary:hover {
            background: #FFA500; transform: translateY(-2px);
        }
        .btn-cinematic-secondary {
            background: transparent; color: #1a1a1a;
            padding: 12px 24px; border: 2px solid #1a1a1a; font-weight: 600; text-transform: uppercase;
            letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s; margin-left: 15px;
        }
        .btn-cinematic-secondary:hover {
            background: #1a1a1a; color: white;
        }

        /* 8. Dark Mode Overrides */
        body.dark-mode .service-text h2 { color: white; }
        body.dark-mode .service-bullets li { color: #ccc; }
        body.dark-mode .service-tagline { color: #aaa; }
        body.dark-mode .btn-cinematic-primary { background: #FFA500; color: #000; }
        body.dark-mode .btn-cinematic-primary:hover { background: white; }
        body.dark-mode .btn-cinematic-secondary { border-color: white; color: white; }
        body.dark-mode .btn-cinematic-secondary:hover { background: white; color: black; }
      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="services-hero">
        <div className="services-hero-overlay" />
        <motion.div className="services-hero-inner" variants={itemVariants}>
          <h1>Our Services</h1>
          <p>
            Comprehensive programs designed to nurture your physical, mental,
            and social well-being.
          </p>
        </motion.div>
      </section>

      {/* --- SERVICES LIST --- */}
      <section className="services-list">
        {services.map((service) => (
          <ServiceRow
            key={service.id}
            service={service}
            onPrimaryClick={handlePrimaryClick}
            onLearnMore={handleLearnMore}
          />
        ))}
      </section>

      {/* --- CTA SECTION --- */}
      <motion.section 
        className="home-cta" // Reusing home-cta class for consistency, but managed by global CSS
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{ padding: '6rem 2rem', textAlign: 'center', background: '#f9fafb' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Get Started?</h2>
          <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: '#666' }}>
            Join thousands of satisfied members who have transformed their lives with Shivba.
          </p>
          <div>
            <button className="btn-cinematic-primary" onClick={() => setPage({ name: 'register' })}>
              Contact Us Today
            </button>
            <button className="btn-cinematic-secondary" onClick={handleContactClick}>
              Talk to Team
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

/* --- SERVICE ROW COMPONENT --- */
function ServiceRow({ service, onPrimaryClick, onLearnMore }) {
  const isImageLeft = service.layout === 'image-left';

  const imageBlock = (
    <motion.div 
      className="service-image-wrapper"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
    >
      <img src={service.imageUrl} alt={service.title} className="service-image" />
    </motion.div>
  );

  const textBlock = (
    <motion.div className="service-text" variants={itemVariants}>
      <div className="service-icon-circle">{service.icon}</div>
      <h2>
        {service.title}
        {service.shortcut && (
          <span className="service-shortcut-tag">Alt+{service.shortcut}</span>
        )}
      </h2>
      <p className="service-tagline">{service.tagline}</p>
      <ul className="service-bullets">
        {service.bullets.map((item) => (
          <li key={item}>➜ {item}</li>
        ))}
      </ul>
      <div className="service-links">
        <button
          className="btn-cinematic-primary"
          onClick={() => onPrimaryClick(service)}
        >
          {service.cta}
        </button>
        <button
          className="btn-cinematic-secondary"
          onClick={() => onLearnMore(service)}
        >
          Learn more
        </button>
      </div>
    </motion.div>
  );

  return (
    <motion.article 
        className="service-row"
        style={{ flexDirection: isImageLeft ? 'row' : 'row-reverse' }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
    >
      {imageBlock}
      {textBlock}
    </motion.article>
  );
}

export default ServicesPage;