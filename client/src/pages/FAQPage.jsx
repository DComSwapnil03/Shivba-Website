import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const accordionVariants = {
  collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }
};

// --- TYPEWRITER COMPONENT ---
const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    index.current = 0;
    setDisplayedText('');
    const intervalId = setInterval(() => {
      if (index.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 20); 
    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
};

// --- THINKING BUBBLE ---
const ThinkingBubble = () => (
  <div className="thinking-dots">
    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
    <style>{`
      .thinking-dots { display: flex; gap: 4px; padding: 12px; background: #222; border-radius: 12px; width: fit-content; border: 1px solid #333; }
      .dot { width: 6px; height: 6px; background: #888; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
      .dot:nth-child(1) { animation-delay: -0.32s; }
      .dot:nth-child(2) { animation-delay: -0.16s; }
      @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    `}</style>
  </div>
);

function FAQPage({ setPage }) {
  const { t } = useTranslation();

  // --- FIX: Wrapped in useMemo to prevent re-render loop ---
  const STATIC_FAQS = useMemo(() => {
    return t('faq.items', { returnObjects: true }) || [];
  }, [t]);

  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- CHATBOT STATE ---
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: "Welcome to Shivba! I am your virtual assistant. Ask me anything about the gym, library, or events.", isTyping: false }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const SUGGESTIONS = [
    { label: "📄 Register", action: "register" },
    { label: "🏆 Gym Fees", action: "gym_fees" },
    { label: "📞 Contact", action: "contact" },
  ];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotThinking]);

  // Filter Logic for FAQ List
  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return STATIC_FAQS;
    const q = searchTerm.toLowerCase();
    return STATIC_FAQS.filter((f) => {
      const question = f.question.toLowerCase();
      const answer = f.answer.toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [searchTerm, STATIC_FAQS]);

  const toggleFaq = (id) => setOpenId((prev) => (prev === id ? null : id));

  // --- CHAT LOGIC ---
  const handleChatSubmit = (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    
    // Add user message
    addMessage('user', text);
    setChatInput('');
    setIsBotThinking(true);
    
    // Process response (API Call)
    processBotResponse(text);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addMessage('user', `📂 Uploaded: ${file.name}`);
      setIsBotThinking(true);
      setTimeout(() => {
        setIsBotThinking(false);
        addMessage('bot', "File received. I'm analyzing it now...", true);
      }, 1500);
    }
  };

  const handleSuggestion = (action, label) => {
    addMessage('user', label);
    setIsBotThinking(true);
    setTimeout(() => {
        setIsBotThinking(false);
        if (action === 'register') {
            addMessage('bot', "Redirecting you to the registration page...", true);
            setTimeout(() => setPage({ name: 'register' }), 2000);
        } else if (action === 'contact') {
            addMessage('bot', "You can contact us at +91 97672 34353. Redirecting...", true);
            setTimeout(() => setPage({ name: 'contact' }), 2500);
        } else if (action === 'gym_fees') {
            addMessage('bot', "Our gym plans start at ₹500/month. We also have yearly discounts.", true);
        }
    }, 1000);
  };

  const addMessage = (sender, text, isTyping = false) => {
    setChatMessages(prev => [...prev, { id: Date.now(), sender, text, isTyping }]);
  };

  // --- API INTEGRATION FUNCTION ---
  const processBotResponse = async (text) => {
    
    // 1. Prepare history for context (Last 5 messages)
    // We convert our state format to OpenAI's format
    const history = chatMessages
      .slice(-5) // Grab last 5
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

    try {
      // 2. Call the Backend API
      const response = await fetch('http://localhost:5000/api/chat', { // Check your port number!
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: text, 
            history: history,
            userId: "guest_user_123" // Optional: You can pass real user ID here
        }),
      });

      const data = await response.json();

      setIsBotThinking(false);

      if (data.reply) {
        addMessage('bot', data.reply, true); // True enables typewriter effect
      } else {
        throw new Error("Invalid response");
      }

    } catch (error) {
      console.error("Chatbot Error:", error);
      setIsBotThinking(false);
      
      // Fallback to local hardcoded check if server fails
      const lower = text.toLowerCase();
      const match = STATIC_FAQS.find(f => f.question.toLowerCase().includes(lower)) || 
                    STATIC_FAQS.find(f => f.answer.toLowerCase().includes(lower));
      
      const fallbackText = match 
        ? match.answer 
        : "I'm having trouble connecting to the server. Please check your internet or contact support directly.";
      
      addMessage('bot', fallbackText, true);
    }
  };

  const goContact = () => setPage({ name: 'contact' });

  return (
    <motion.div 
      className="faq-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* --- GLOBAL LAYOUT --- */
        .faq-container { padding-bottom: 50px; background-color: #f9f9f9; min-height: 100vh; }
        body.dark-mode .faq-container { background-color: #121212; }
        
        .faq-container h1, .faq-container h2 { font-family: 'Cinzel', serif !important; letter-spacing: 0.05em; }
        .faq-container p, span, button, input { font-family: 'Montserrat', sans-serif !important; }

        /* HERO */
        .faq-hero { padding: 4rem 2rem; text-align: center; background: #1a1a1a; color: white; margin-bottom: 2rem; }
        .faq-hero h1 { font-size: 3rem; margin-bottom: 0.5rem; }
        
        /* --- MAIN GRID LAYOUT --- */
        .faq-structure {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
            align-items: start;
        }

        /* LEFT COLUMN: FAQ List */
        .faq-left-col { display: flex; flex-direction: column; gap: 25px; }
        
        .faq-search input {
            width: 100%; padding: 15px 20px; font-size: 1rem; border: 2px solid #ddd; 
            border-radius: 8px; outline: none; transition: border-color 0.3s;
        }
        .faq-search input:focus { border-color: #FFA500; }
        body.dark-mode .faq-search input { background: #1e1e1e; border-color: #333; color: white; }

        .faq-list { display: flex; flex-direction: column; gap: 20px; }

        .faq-item { 
            background: white; border: 2px solid #eee; border-radius: 8px; overflow: hidden; 
            transition: all 0.3s;
        }
        .faq-item:hover { border-color: #ddd; transform: translateX(5px); }
        .faq-item.open { border-color: #FFA500; box-shadow: 0 4px 15px rgba(255, 165, 0, 0.1); }
        
        body.dark-mode .faq-item { background: #1e1e1e; border-color: #333; }
        body.dark-mode .faq-item.open { border-color: #FFA500; }

        .faq-header { width: 100%; padding: 22px 25px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background:none; border:none; text-align:left; }
        .faq-question { font-size: 1.05rem; font-weight: 600; color: #333; }
        body.dark-mode .faq-question { color: #eee; }
        .faq-icon { font-size: 1.5rem; color: #ccc; transition: transform 0.3s; }
        .faq-item.open .faq-icon { transform: rotate(45deg); color: #FFA500; }
        .faq-body { padding: 0 25px 25px; color: #666; line-height: 1.6; font-size: 0.95rem; }
        body.dark-mode .faq-body { color: #aaa; }

        /* RIGHT COLUMN: Embedded Chatbot */
        .faq-right-col {
            position: sticky; top: 100px; 
            height: 650px; 
        }

        .embedded-chat-card {
            height: 100%; width: 100%;
            background: #111; 
            border-radius: 12px;
            border: 2px solid #333;
            display: flex; flex-direction: column;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .chat-header {
            background: #1a1a1a; padding: 15px 20px; border-bottom: 2px solid #FFA500;
            display: flex; justify-content: space-between; align-items: center;
        }
        .chat-header h3 { color: white; margin: 0; font-size: 1.1rem; }
        .chat-status { font-size: 0.8rem; color: #4ade80; display: flex; align-items: center; gap: 5px; }
        .chat-status::before { content: ''; width: 8px; height: 8px; background: #4ade80; border-radius: 50%; display: block; }

        .chat-content {
            flex: 1; padding: 20px; overflow-y: auto; background: #000;
            display: flex; flex-direction: column; gap: 15px;
        }
        .chat-content::-webkit-scrollbar { width: 6px; }
        .chat-content::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

        .message { max-width: 85%; padding: 12px 16px; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; }
        .message.bot { background: #222; color: #ddd; align-self: flex-start; border-bottom-left-radius: 2px; }
        .message.user { background: #FFA500; color: #000; align-self: flex-end; border-bottom-right-radius: 2px; font-weight: 600; }

        .chat-suggestions { padding: 10px; background: #111; display: flex; gap: 8px; overflow-x: auto; border-top: 1px solid #222; }
        .suggestion-chip { padding: 6px 12px; background: #222; border: 1px solid #444; color: #ccc; border-radius: 20px; font-size: 0.75rem; cursor: pointer; white-space: nowrap; transition: 0.2s; }
        .suggestion-chip:hover { background: #333; border-color: #FFA500; color: white; }

        .chat-input-box {
            padding: 15px; background: #1a1a1a; display: flex; gap: 10px; align-items: center; border-top: 1px solid #333;
        }
        .chat-input-box input {
            flex: 1; background: #333; border: none; color: white; padding: 10px 15px; border-radius: 20px; outline: none;
        }
        .file-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #888; }
        .file-btn:hover { color: white; }
        .send-btn { background: #FFA500; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        /* BOTTOM SECTION */
        .faq-bottom-bar {
            max-width: 1400px; margin: 4rem auto 0; padding: 0 2rem;
        }
        .still-questions-box {
            border: 2px solid #333; padding: 2rem 3rem;
            display: flex; justify-content: space-between; align-items: center;
            background: #fff; border-radius: 12px;
        }
        body.dark-mode .still-questions-box { background: #1e1e1e; border-color: #444; }
        
        .sq-text h2 { margin: 0 0 5px; font-size: 1.8rem; color: #333; }
        .sq-text p { margin: 0; color: #666; }
        body.dark-mode .sq-text h2 { color: white; }
        body.dark-mode .sq-text p { color: #aaa; }

        .sq-btn {
            padding: 12px 30px; background: #FFA500; color: black; font-weight: 700;
            border: none; border-radius: 50px; cursor: pointer; text-transform: uppercase;
            letter-spacing: 0.05em; transition: transform 0.2s;
        }
        .sq-btn:hover { transform: scale(1.05); background: #ffb700; }

        @media (max-width: 900px) {
            .faq-structure { grid-template-columns: 1fr; }
            .faq-right-col { height: 500px; position: static; margin-top: 2rem; }
            .still-questions-box { flex-direction: column; text-align: center; gap: 20px; }
        }
      `}</style>

      {/* --- HERO --- */}
      <section className="faq-hero">
        <motion.div variants={itemVariants}>
          <h1>FAQ & Support</h1>
          <p>Find answers instantly or chat with Shivba AI.</p>
        </motion.div>
      </section>

      {/* --- MAIN STRUCTURE --- */}
      <div className="faq-structure">
        
        {/* LEFT: FAQ List */}
        <div className="faq-left-col">
            <div className="faq-search">
                <input 
                    type="text" 
                    placeholder="Search for questions..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>

            <motion.div className="faq-list" variants={containerVariants} initial="hidden" animate="visible">
                {filteredFaqs.length === 0 ? <p>No results found.</p> : 
                    filteredFaqs.map((item) => (
                    <motion.div key={item.id} className={`faq-item ${openId === item.id ? 'open' : ''}`} variants={itemVariants}>
                        <button className="faq-header" onClick={() => toggleFaq(item.id)}>
                            <span className="faq-question">{item.question}</span>
                            <span className="faq-icon">+</span>
                        </button>
                        <AnimatePresence>
                        {openId === item.id && (
                            <motion.div className="faq-body" variants={accordionVariants} initial="collapsed" animate="open" exit="collapsed">
                                <p>{item.answer}</p>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </motion.div>
                    ))
                }
            </motion.div>
        </div>

        {/* RIGHT: Chatbot */}
        <div className="faq-right-col">
            <motion.div className="embedded-chat-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <div className="chat-header">
                    <h3>Shivba Chatbot</h3>
                    <div className="chat-status">Online</div>
                </div>
                
                <div className="chat-content">
                    {chatMessages.map((msg) => (
                        <motion.div key={msg.id} className={`message ${msg.sender}`} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                            {msg.sender === 'bot' && msg.isTyping ? <Typewriter text={msg.text} /> : msg.text}
                        </motion.div>
                    ))}
                    {isBotThinking && <ThinkingBubble />}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-suggestions">
                    {SUGGESTIONS.map((s, idx) => (
                        <span key={idx} className="suggestion-chip" onClick={() => handleSuggestion(s.action, s.label)}>{s.label}</span>
                    ))}
                </div>

                <form className="chat-input-box" onSubmit={handleChatSubmit}>
                    <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileUpload} />
                    <button type="button" className="file-btn" onClick={() => fileInputRef.current.click()}>📎</button>
                    <input type="text" placeholder="Type your message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
                    <button type="submit" className="send-btn">➤</button>
                </form>
            </motion.div>
        </div>

      </div>

      {/* --- BOTTOM: CTA --- */}
      <section className="faq-bottom-bar">
        <motion.div className="still-questions-box" variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="sq-text">
                <h2>Still have questions?</h2>
                <p>Can't find the answer you're looking for? Please contact our friendly team.</p>
            </div>
            <button className="sq-btn" onClick={goContact}>Contact Us</button>
        </motion.div>
      </section>

    </motion.div>
  );
}

export default FAQPage;