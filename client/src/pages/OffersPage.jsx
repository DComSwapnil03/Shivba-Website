import React, { useState } from 'react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---
const OFFERS = [
  {
    id: 1,
    title: "Student Power Pack",
    desc: "Get 3 Months Library + Gym access at a flat rate.",
    discount: "30% OFF",
    code: "SHIVBA30",
    color: "linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)",
    expiry: "Valid till 30th Dec"
  },
  {
    id: 2,
    title: "Early Bird Hostel",
    desc: "Book your bed 2 months in advance and save on deposit.",
    discount: "₹1000 OFF",
    code: "EARLY1000",
    color: "linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)",
    expiry: "Limited Seats"
  },
  {
    id: 3,
    title: "Social Warrior",
    desc: "Join 3 social events and get 1 month Gym membership free.",
    discount: "FREE MONTH",
    code: "WARRIOR",
    color: "linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)",
    expiry: "Always Active"
  },
  {
    id: 4,
    title: "Annual Membership",
    desc: "Pay for 1 year upfront and get 2 months extra validity.",
    discount: "12+2 MONTHS",
    code: "YEARLYPRO",
    color: "linear-gradient(135deg, #feca57 0%, #ff9f43 100%)",
    expiry: "Valid till 31st Jan"
  }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const OfferCard = ({ offer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div variants={cardVariants} className="offer-card">
      <div className="offer-header" style={{ background: offer.color }}>
        <span className="offer-discount">{offer.discount}</span>
      </div>
      <div className="offer-body">
        <h3>{offer.title}</h3>
        <p>{offer.desc}</p>
        <div className="offer-meta">
          <span className="expiry">🕒 {offer.expiry}</span>
        </div>
        
        <div className="coupon-row">
            <div className="coupon-code">{offer.code}</div>
            <button onClick={handleCopy} className="copy-btn">
                {copied ? 'COPIED!' : 'COPY'}
            </button>
        </div>
      </div>
    </motion.div>
  );
};

function OffersPage({ setPage }) {
  return (
    <motion.div 
      className="offers-page-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@400;600;700&display=swap');
        
        .offers-page-container {
            font-family: 'Montserrat', sans-serif;
            background: #f4f4f4;
            min-height: 100vh;
            padding-bottom: 4rem;
        }
        
        .offers-hero {
            background: #1a1a1a;
            color: white;
            text-align: center;
            padding: 4rem 2rem;
            margin-bottom: 2rem;
        }
        .offers-hero h1 { font-family: 'Cinzel', serif; font-size: 3rem; margin: 0; color: #ea580c; }
        .offers-hero p { color: #ccc; margin-top: 10px; }

        .offers-grid {
            max-width: 1000px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 0 20px;
        }

        .offer-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
            position: relative;
        }
        .offer-card:hover { transform: translateY(-5px); }

        .offer-header {
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .offer-discount {
            font-size: 1.8rem;
            font-weight: 800;
            text-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .offer-body { padding: 1.5rem; text-align: center; }
        .offer-body h3 { margin: 0 0 10px 0; color: #333; font-weight: 700; }
        .offer-body p { color: #666; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; }
        
        .offer-meta { margin-bottom: 1.5rem; font-size: 0.8rem; color: #999; font-weight: 600; text-transform: uppercase; }

        .coupon-row {
            background: #f3f4f6;
            border: 2px dashed #ddd;
            border-radius: 8px;
            padding: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .coupon-code {
            flex: 1;
            font-family: monospace;
            font-weight: bold;
            font-size: 1.1rem;
            letter-spacing: 1px;
            color: #333;
        }
        .copy-btn {
            background: #1a1a1a;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 0.8rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .copy-btn:hover { background: #ea580c; }
        .back-btn { background: none; border: 1px solid #555; color: #ccc; padding: 8px 20px; border-radius: 30px; cursor: pointer; margin-top: 20px; }
        .back-btn:hover { background: white; color: black; }

      `}</style>

      <div className="offers-hero">
          <h1>Exclusive Deals</h1>
          <p>Grab the best discounts on Talim, Library, and Hostel services.</p>
          <button className="back-btn" onClick={() => setPage({ name: 'home' })}>← Back to Home</button>
      </div>

      <motion.div className="offers-grid">
          {OFFERS.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
          ))}
      </motion.div>

    </motion.div>
  );
}

export default OffersPage;