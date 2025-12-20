import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 

// --- 1. ANIMATION VARIANTS (Cinematic) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 60, damping: 15 }
  }
};

const sliderVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.95
  })
};

// --- 2. CONFIGURATION (Same Data, Better Presentation) ---
const SERVICE_CONFIG = {
  talim: {
    title: 'Shivba Talim',
    subtitle: 'Forging strength through tradition and modern science.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', // Gym Image
    priceLabel: 'Membership Plans',
    startingPrice: 1200, 
    plans: [
      { label: '1 Month', price: 1200 },
      { label: '3 Months', price: 3000, recommended: true },
      { label: '6 Months', price: 5500 },
      { label: '1 Year', price: 8000 },
    ],
    description: [
      'Access to modern strength & cardio equipment',
      'General training guidance included',
      'Fusion of traditional Kusti & modern gym'
    ],
    benefits: [
      'Build authentic strength',
      'Disciplined routine & community',
      'Expert guidance available'
    ]
  },
  library: {
    title: 'Shivba Library',
    subtitle: 'A sanctuary for focus, knowledge, and growth.',
    image: 'https://images.unsplash.com/photo-1507842217121-9e96e44303f0?q=80&w=2070&auto=format&fit=crop', // Library Image
    priceLabel: 'Library Access',
    startingPrice: 900,
    plans: [
      { label: '1 Month', price: 900 },
      { label: '3 Months', price: 2500, recommended: true },
      { label: '6 Months', price: 5000 },
      { label: '1 Year', price: 7000 },
    ],
    description: [
      'Extensive physical book collection',
      'High-speed WiFi & digital resources',
      'Dedicated silent reading zones'
    ],
    benefits: [
      'Uninterrupted focus',
      'Competitive exam preparation support',
      'Ergonomic seating & lighting'
    ]
  },
  hostel: {
    title: 'Shivba Hostel',
    subtitle: 'Safe, secure, and community-driven accommodation.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop', // Hostel Image
    priceLabel: 'Monthly Rent',
    startingPrice: 2499,
    plans: null, // Single plan fallback
    description: [
      'Comfortable shared & single options',
      '24/7 Security & CCTV surveillance',
      'High-speed internet included'
    ],
    benefits: [
      'Peaceful study environment',
      'Network with like-minded peers',
      'Proximity to Library & Talim'
    ]
  },
  social: {
    title: 'Social Awareness',
    subtitle: 'Building a better society through action and education.',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1470&auto=format&fit=crop', // Social Image
    priceLabel: 'Contribution',
    startingPrice: 299,
    plans: null, 
    description: [
      'Weekly awareness workshops',
      'Community clean-up & aid drives',
      'Youth leadership development'
    ],
    benefits: [
      'Real-world impact',
      'Develop soft skills & leadership',
      'Certificate of participation'
    ]
  }
};

function ServiceDetailPage({ serviceId = 'talim', setPage }) {
  const cfg = SERVICE_CONFIG[serviceId] || SERVICE_CONFIG.talim;
  
  // Slider Logic
  const plans = cfg.plans && cfg.plans.length > 0 
    ? cfg.plans 
    : [{ label: 'Standard Plan', price: cfg.startingPrice }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextPlan = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % plans.length);
  };

  const prevPlan = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + plans.length) % plans.length);
  };

  const currentPlan = plans[activeIndex];

  const handlePayNow = () => {
    setPage({
      name: 'service-checkout',
      params: { id: serviceId, selectedPlanIndex: activeIndex }
    });
  };

  return (
    <motion.div 
      className="service-detail-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        /* 1. Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* 2. Typography */
        .service-detail-container h1, 
        .service-detail-container h2,
        .service-detail-container h3,
        .price-amount {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }

        .service-detail-container p, 
        .service-detail-container li, 
        .service-detail-container button,
        .price-label {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* 3. Hero */
        .service-detail-hero {
            position: relative;
            padding: 4rem 2rem;
            text-align: center;
            background: #1a1a1a;
            color: white;
            overflow: hidden;
        }
        .service-detail-back {
            background: none; border: none; color: #aaa; 
            cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em;
            font-size: 0.8rem; margin-bottom: 1rem; transition: color 0.3s;
        }
        .service-detail-back:hover { color: #FFA500; }
        .service-detail-hero h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #fff; }
        .service-detail-hero p { font-size: 1.1rem; color: #ccc; max-width: 600px; margin: 0 auto; }

        /* 4. Layout */
        .service-detail-grid {
            max-width: 1100px;
            margin: -50px auto 50px; /* Overlap Hero */
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
            padding: 0 20px;
            position: relative;
            z-index: 10;
        }
        @media (max-width: 800px) {
            .service-detail-grid { grid-template-columns: 1fr; margin-top: 2rem; }
        }

        /* 5. Cards */
        .service-detail-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid rgba(0,0,0,0.05);
        }
        body.dark-mode .service-detail-card {
            background: #1e1e1e; border-color: #333;
        }

        /* 6. Content Styling */
        .service-detail-image-wrapper {
            border-radius: 12px; overflow: hidden; margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .service-detail-image {
            width: 100%; height: 350px; object-fit: cover;
            transition: transform 0.5s;
        }
        .service-detail-image:hover { transform: scale(1.03); }

        .service-list { list-style: none; padding: 0; margin-bottom: 2rem; }
        .service-list li {
            margin-bottom: 0.8rem; color: #444; display: flex; align-items: flex-start; gap: 10px;
        }
        body.dark-mode .service-list li { color: #ccc; }

        /* 7. Pricing Slider */
        .pricing-slider-container {
            position: relative; height: 180px; 
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 1.5rem;
        }
        .pricing-card {
            position: absolute; width: 100%; height: 100%;
            background: #fff7ed; border: 2px solid #ffedd5;
            border-radius: 16px;
            display: flex; flexDirection: column; align-items: center; justify-content: center;
            box-shadow: 0 10px 20px rgba(234, 88, 12, 0.1);
        }
        body.dark-mode .pricing-card {
            background: #2a1c15; border-color: #5a3a2a;
        }
        
        .arrow-btn {
            position: absolute; z-index: 20;
            background: rgba(0,0,0,0.05); border: none; border-radius: 50%;
            width: 36px; height: 36px; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .arrow-btn:hover { background: #FFA500; color: white; }
        .arrow-left { left: -10px; }
        .arrow-right { right: -10px; }

        /* 8. Action Buttons */
        .pay-btn {
            width: 100%; padding: 14px;
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
            color: white; border: none; border-radius: 8px;
            font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
            cursor: pointer; margin-bottom: 10px;
            box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4);
        }
        .secondary-btn {
            width: 100%; padding: 12px;
            background: transparent; color: #666;
            border: 1px solid #ddd; border-radius: 8px;
            cursor: pointer; font-size: 0.9rem;
        }
        body.dark-mode .secondary-btn { color: #aaa; border-color: #444; }
        body.dark-mode .secondary-btn:hover { border-color: #fff; color: #fff; }

      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="service-detail-hero">
        <motion.div variants={itemVariants}>
          <button className="service-detail-back" onClick={() => setPage({ name: 'services' })}>
            ← Back to Services
          </button>
          <h1>{cfg.title}</h1>
          <p>{cfg.subtitle}</p>
        </motion.div>
      </section>

      <section className="service-detail-main">
        <div className="service-detail-grid">
          
          {/* --- LEFT CARD: INFO --- */}
          <motion.div 
            className="service-detail-card"
            variants={itemVariants}
          >
            <div className="service-detail-image-wrapper">
              <img src={cfg.image} alt={cfg.title} className="service-detail-image" />
            </div>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', borderLeft: '4px solid #FFA500', paddingLeft: '15px' }}>What You Get</h2>
            <ul className="service-list">
              {cfg.description.map((item, idx) => (
                <li key={idx}>➜ {item}</li>
              ))}
            </ul>

            <h3 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Key Benefits</h3>
            <ul className="service-list">
              {cfg.benefits.map((item, idx) => (
                <li key={idx}>★ {item}</li>
              ))}
            </ul>
          </motion.div>

          {/* --- RIGHT CARD: PRICING --- */}
          <motion.div 
            className="service-detail-card"
            style={{ height: 'fit-content', position: 'sticky', top: '100px' }}
            variants={itemVariants}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{cfg.priceLabel}</h2>
            
            <div className="pricing-slider-container">
              {plans.length > 1 && (
                <button className="arrow-btn arrow-left" onClick={prevPlan}>❮</button>
              )}

              <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={sliderVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="pricing-card"
                  >
                    {currentPlan.recommended && (
                      <span style={{ 
                        position: 'absolute', top: '10px', 
                        background: '#10b981', color: 'white', 
                        fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' 
                      }}>
                        BEST VALUE
                      </span>
                    )}
                    <div className="price-label" style={{ fontSize: '1.2rem', color: '#888', marginBottom: '0.5rem' }}>{currentPlan.label}</div>
                    <div className="price-amount" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ea580c' }}>₹{currentPlan.price}</div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {plans.length > 1 && (
                <button className="arrow-btn arrow-right" onClick={nextPlan}>❯</button>
              )}
            </div>

            {/* Dots */}
            {plans.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {plans.map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => { setDirection(idx > activeIndex ? 1 : -1); setActiveIndex(idx); }}
                    style={{
                      width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                      backgroundColor: idx === activeIndex ? '#ea580c' : '#ccc',
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999', marginBottom: '1rem' }}>
              Secure online payment powered by Razorpay.
            </p>

            <motion.button 
              className="pay-btn" 
              onClick={handlePayNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Proceed to Pay ₹{currentPlan.price}
            </motion.button>
            
            <button
              className="secondary-btn"
              onClick={() => setPage({ name: 'register', params: { serviceId: serviceId } })}
            >
              Register Interest Instead
            </button>
          </motion.div>

        </div>
      </section>
    </motion.div>
  );
}

export default ServiceDetailPage;