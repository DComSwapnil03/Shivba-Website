import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 

// --- 2. Define Animation Variants ---

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
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Slider Animation Variants
const sliderVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.9
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
    scale: 0.9
  })
};

// --- Updated Configuration with Images ---
const SERVICE_CONFIG = {
  talim: {
    title: 'Shivba Talim – Fitness Center',
    subtitle: 'State-of-the-art equipment, expert trainers, and focused workout plans.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    priceLabel: 'Talim Membership',
    startingPrice: 1200, 
    plans: [
      { label: '1 Month', price: 1200 },
      { label: '3 Months', price: 3000, recommended: true },
      { label: '6 Months', price: 5500 },
      { label: '1 Year', price: 8000 },
      { label: '15 Months', price: 12000 },
    ],
    description: [
      'Modern strength and cardio equipment',
      'General training guidance',
      'Traditional & Modern workout fusion'
    ],
    benefits: [
      'Improved strength and stamina',
      'Disciplined fitness routine',
      'Supportive community of members'
    ]
  },
  library: {
    title: 'Shivba Library',
    subtitle: 'Books, digital resources, and quiet spaces for deep work.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1528&auto=format&fit=crop',
    priceLabel: 'Library Membership',
    startingPrice: 900,
    plans: [
      { label: '1 Month', price: 900 },
      { label: '3 Months', price: 2500, recommended: true },
      { label: '6 Months', price: 5000 },
      { label: '1 Year', price: 7000 },
      { label: '15 Months', price: 8000 },
    ],
    description: [
      'Extensive physical book collection',
      'Digital resources and newspapers',
      'Dedicated silent reading hall'
    ],
    benefits: [
      'Better concentration and knowledge',
      'Academic and competitive exam support',
      'Comfortable seating and lighting'
    ]
  },
  personal_training: {
    title: 'Personal Training',
    subtitle: 'One-on-one coaching for maximum results.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop',
    priceLabel: 'Personal Training',
    startingPrice: 6000,
    plans: [
      { label: '1 Month', price: 6000 },
      { label: '2 Months', price: 10000 },
      { label: '3 Months', price: 12000, recommended: true },
    ],
    description: [
        'Customized diet plans',
        '1-on-1 workout attention',
        'Weekly progress tracking'
    ],
    benefits: [
        'Faster results',
        'Injury prevention',
        'Personalized motivation'
    ]
  },
  hostel: {
    title: 'Shivba Hostel Room',
    subtitle: 'Safe, clean accommodation for focused study and growth.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop',
    priceLabel: 'Hostel Monthly Fee',
    startingPrice: 2499,
    plans: null, // No specific array, will fallback to startingPrice logic
    description: [
      'Comfortable shared and single rooms',
      '24×7 security and CCTV',
      'High‑speed internet and study zones'
    ],
    benefits: [
      'Peaceful environment for students',
      'Like‑minded roommates',
      'Easy access to Talim and Library'
    ]
  },
  social: {
    title: 'Social Awareness Program',
    subtitle: 'Workshops, events, and initiatives that build a better society.',
    image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=1470&auto=format&fit=crop',
    priceLabel: 'Program Support',
    startingPrice: 299,
    plans: null, 
    description: [
      'Weekly awareness workshops',
      'Community development projects',
      'Youth leadership and soft skills'
    ],
    benefits: [
      'Improved social awareness',
      'Real‑world impact opportunities',
      'Networking with mentors and peers'
    ]
  }
};

function ServiceDetailPage({ serviceId = 'talim', setPage }) {
  const cfg = SERVICE_CONFIG[serviceId] || SERVICE_CONFIG.talim;
  
  // --- SLIDER LOGIC ---
  // Normalize plans: if no plans array, create a single 'default' plan
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
      params: { 
        id: serviceId,
        selectedPlanIndex: activeIndex // Pass preference to checkout
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 overflow-hidden">
      
      {/* Hero Section */}
      <section className="service-detail-hero">
        <motion.div 
          className="service-detail-hero-inner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            className="service-detail-back"
            onClick={() => setPage({ name: 'services' })}
          >
            ← Back to Services
          </button>
          <h1>{cfg.title}</h1>
          <p>{cfg.subtitle}</p>
        </motion.div>
      </section>

      <section className="service-detail-main">
        <div className="service-detail-grid">
          
          {/* Left Card: Image + Information & Staggered Lists */}
          <motion.div 
            className="service-detail-card"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Content Image Section */}
            <motion.div 
              className="service-detail-image-wrapper"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden' }}
            >
              <img 
                src={cfg.image} 
                alt={cfg.title} 
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover',
                  display: 'block' 
                }} 
              />
            </motion.div>

            <h2>What you get</h2>
            
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {cfg.description.map((item, index) => (
                <motion.li key={index} variants={itemVariants}>
                  • {item}
                </motion.li>
              ))}
            </motion.ul>

            <h3 style={{ marginTop: '20px' }}>Benefits</h3>
            
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {cfg.benefits.map((item, index) => (
                <motion.li key={index} variants={itemVariants}>
                  • {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right Card: Pricing Slider */}
          <motion.div 
            className="service-detail-card pricing"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{cfg.priceLabel}</h2>
            
            {/* --- SLIDER CONTAINER --- */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', marginBottom: '20px' }}>
              
              {/* Left Arrow */}
              {plans.length > 1 && (
                <button 
                  onClick={prevPlan}
                  style={{
                    position: 'absolute', left: '-10px', zIndex: 10,
                    background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ❮
                </button>
              )}

              {/* Animated Slides */}
              <div style={{ width: '100%', overflow: 'hidden', height: '100%', position: 'relative' }}>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={sliderVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    style={{
                      position: 'absolute', width: '100%', height: '100%',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: '#fff7ed', borderRadius: '16px', border: '2px solid #ffedd5'
                    }}
                  >
                    {currentPlan.recommended && (
                      <span style={{ 
                        position: 'absolute', top: '10px', 
                        background: '#10b981', color: 'white', 
                        fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' 
                      }}>
                        BEST VALUE
                      </span>
                    )}
                    
                    <h3 style={{ fontSize: '1.2rem', color: '#666', marginBottom: '0.5rem' }}>
                      {currentPlan.label}
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ea580c' }}>
                      ₹{currentPlan.price}
                    </div>
                    {plans.length > 1 && (
                      <span style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>
                        Plan {activeIndex + 1} of {plans.length}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Arrow */}
              {plans.length > 1 && (
                <button 
                  onClick={nextPlan}
                  style={{
                    position: 'absolute', right: '-10px', zIndex: 10,
                    background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ❯
                </button>
              )}
            </div>
            
            {/* Dots Indicator */}
            {plans.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {plans.map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                        setDirection(idx > activeIndex ? 1 : -1);
                        setActiveIndex(idx);
                    }}
                    style={{
                      width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                      backgroundColor: idx === activeIndex ? '#ea580c' : '#e5e7eb',
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
            )}

            <p className="service-detail-note" style={{ textAlign: 'center', marginBottom: '20px' }}>
              Secure online payment powered by Razorpay.
            </p>
            
            <motion.button 
              className="service-detail-pay-btn" 
              onClick={handlePayNow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Proceed to Pay ₹{currentPlan.price}
            </motion.button>
            
            <button
              className="service-detail-secondary-btn"
              onClick={() =>
                setPage({ name: 'register', params: { serviceId: serviceId } })
              }
            >
              Register Interest Instead
            </button>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default ServiceDetailPage;