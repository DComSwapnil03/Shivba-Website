import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const accordionVariants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }
};

function FAQPage({ setPage }) {
  const { t } = useTranslation();
  const STATIC_FAQS = t('faq.items', { returnObjects: true });

  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return STATIC_FAQS;
    const q = searchTerm.toLowerCase();
    return STATIC_FAQS.filter((f) => {
      const question = f.question.toLowerCase();
      const answer = f.answer.toLowerCase();
      const category = (f.category || '').toLowerCase();
      return question.includes(q) || answer.includes(q) || category.includes(q);
    });
  }, [searchTerm, STATIC_FAQS]);

  const toggleFaq = (id) => setOpenId((prev) => (prev === id ? null : id));

  const handleChatAsk = (e) => {
    e.preventDefault();
    const q = chatInput.trim();
    if (!q) return;
    const lower = q.toLowerCase();
    const match = STATIC_FAQS.find((f) => f.question.toLowerCase().includes(lower)) ||
                  STATIC_FAQS.find((f) => (f.category || '').toLowerCase().includes(lower));
    setChatAnswer(match ? t('faq.chatMatch', { question: match.question, answer: match.answer }) : t('faq.chatNoMatch'));
  };

  const goContact = () => setPage({ name: 'contact' });

  return (
    <motion.div 
      className="faq-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* Typography */
        .faq-container h1, .faq-container h2, .faq-chat-card h2 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }
        .faq-container p, .faq-container span, .faq-container button, .faq-container input, .faq-container textarea {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* Hero */
        .faq-hero {
            padding: 4rem 2rem; text-align: center;
            background: #1a1a1a; color: white;
            margin-bottom: 3rem;
        }
        .faq-hero h1 { font-size: 3rem; margin-bottom: 0.5rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .faq-hero p { font-size: 1.1rem; color: #ccc; }

        /* Layout */
        .faq-main { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; gap: 3rem; flex-wrap: wrap; }
        .faq-list-col { flex: 2; min-width: 300px; }
        .faq-chat-col { flex: 1; min-width: 300px; }

        /* Search Bar */
        .faq-search input {
            width: 100%; padding: 15px 20px; font-size: 1rem;
            border: 1px solid #ddd; border-radius: 50px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            margin-bottom: 2rem; outline: none; transition: all 0.3s;
        }
        .faq-search input:focus { border-color: #FFA500; box-shadow: 0 6px 15px rgba(255, 165, 0, 0.1); }
        body.dark-mode .faq-search input { background: #333; color: white; border-color: #444; }

        /* Accordion Items */
        .faq-accordion { display: flex; flex-direction: column; gap: 15px; }
        .faq-item {
            background: white; border-radius: 12px; overflow: hidden;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: box-shadow 0.3s;
            border: 1px solid transparent;
        }
        .faq-item:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .faq-item.open { border-color: #FFA500; }
        body.dark-mode .faq-item { background: #1e1e1e; border-color: #333; }
        body.dark-mode .faq-item.open { border-color: #FFA500; }

        .faq-header {
            width: 100%; padding: 20px; text-align: left; background: none; border: none;
            display: flex; justify-content: space-between; align-items: center; cursor: pointer;
        }
        .faq-question-content { display: flex; flex-direction: column; gap: 5px; }
        .faq-category {
            font-size: 0.75rem; font-weight: bold; color: #FFA500; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .faq-question { font-size: 1.1rem; font-weight: 600; color: #333; }
        body.dark-mode .faq-question { color: #eee; }
        
        .faq-icon { font-size: 1.5rem; color: #ccc; transition: transform 0.3s; }
        .faq-item.open .faq-icon { transform: rotate(45deg); color: #FFA500; }

        .faq-body { padding: 0 20px 20px; color: #555; line-height: 1.6; }
        body.dark-mode .faq-body { color: #bbb; }

        /* Chat Widget */
        .faq-chat-card {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white; padding: 2rem; border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: sticky; top: 100px;
        }
        .faq-chat-card h2 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #FFA500; }
        .faq-chat-sub { font-size: 0.9rem; color: #aaa; margin-bottom: 1.5rem; }
        
        .faq-chat-form textarea {
            width: 100%; padding: 12px; border-radius: 8px; border: none;
            background: rgba(255,255,255,0.1); color: white; resize: none;
            margin-bottom: 1rem; font-size: 0.95rem; outline: none;
        }
        .faq-chat-form textarea::placeholder { color: #888; }
        .faq-chat-form textarea:focus { background: rgba(255,255,255,0.2); }
        
        .chat-btn {
            width: 100%; padding: 12px; background: #FFA500; color: black;
            border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
            text-transform: uppercase; letter-spacing: 0.05em; transition: transform 0.2s;
        }
        .chat-btn:hover { transform: translateY(-2px); background: #ffb700; }

        .chat-response {
            margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.05);
            border-left: 3px solid #FFA500; border-radius: 0 8px 8px 0;
        }
        .chat-response strong { display: block; color: #FFA500; font-size: 0.8rem; margin-bottom: 5px; }

        /* CTA */
        .faq-cta {
            margin-top: 4rem; padding: 4rem 2rem; text-align: center; background: #f9fafb;
        }
        body.dark-mode .faq-cta { background: #111; }
        .faq-cta h2 { font-size: 2rem; margin-bottom: 1rem; color: #333; }
        body.dark-mode .faq-cta h2 { color: white; }
        .faq-cta-btn {
            margin-top: 1.5rem; padding: 12px 30px; background: transparent;
            border: 2px solid #1a1a1a; color: #1a1a1a; font-weight: 600;
            border-radius: 50px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em;
            transition: all 0.3s;
        }
        .faq-cta-btn:hover { background: #1a1a1a; color: white; }
        body.dark-mode .faq-cta-btn { border-color: white; color: white; }
        body.dark-mode .faq-cta-btn:hover { background: white; color: black; }

        @media (max-width: 900px) { .faq-main { flex-direction: column; } }
      `}</style>

      {/* --- HERO --- */}
      <section className="faq-hero">
        <motion.div variants={itemVariants}>
          <h1>Frequently Asked Questions</h1>
          <p>{t('faq.heroSubtitle')}</p>
        </motion.div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <section className="faq-main">
        
        {/* LEFT: FAQ LIST */}
        <div className="faq-list-col">
          <div className="faq-search">
            <input 
                type="text" 
                placeholder={t('faq.searchPlaceholder')} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <motion.div className="faq-accordion" variants={containerVariants} initial="hidden" animate="visible">
            {filteredFaqs.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>{t('faq.noResults')}</p>
            ) : (
              filteredFaqs.map((item) => (
                <motion.div 
                    key={item.id} 
                    className={`faq-item ${openId === item.id ? 'open' : ''}`}
                    variants={itemVariants}
                >
                  <button className="faq-header" onClick={() => toggleFaq(item.id)}>
                    <div className="faq-question-content">
                      {item.category && <span className="faq-category">{item.category}</span>}
                      <span className="faq-question">{item.question}</span>
                    </div>
                    <span className="faq-icon">+</span>
                  </button>
                  <AnimatePresence>
                    {openId === item.id && (
                      <motion.div 
                        className="faq-body"
                        variants={accordionVariants}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                      >
                        <p>{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* RIGHT: CHAT WIDGET */}
        <div className="faq-chat-col">
          <motion.div className="faq-chat-card" variants={itemVariants}>
            <h2>{t('faq.chatTitle')}</h2>
            <p className="faq-chat-sub">{t('faq.chatSubtitle')}</p>
            
            <form onSubmit={handleChatAsk} className="faq-chat-form">
              <textarea 
                rows="3" 
                placeholder={t('faq.chatPlaceholder')} 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
              />
              <button type="submit" className="chat-btn">{t('faq.chatButton')}</button>
            </form>

            <AnimatePresence>
                {chatAnswer && (
                <motion.div 
                    className="chat-response"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <strong>{t('faq.chatLabel')}</strong>
                    <p>{chatAnswer}</p>
                </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        </div>

      </section>

      {/* --- CTA --- */}
      <section className="faq-cta">
        <div className="faq-cta-inner">
          <h2>{t('faq.ctaTitle')}</h2>
          <p>{t('faq.ctaSubtitle')}</p>
          <button className="faq-cta-btn" onClick={goContact}>{t('faq.ctaButton')}</button>
        </div>
      </section>

    </motion.div>
  );
}

export default FAQPage;