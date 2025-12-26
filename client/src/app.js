import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './app.css'; 

/* --- Page Imports --- */
import HomePage from './pages/Homepage';
import ContactPage from './pages/ContactPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import EventsPage from './pages/EventsPage';
import EventRegisterPage from './pages/EventRegisterPage';
import FAQPage from './pages/FAQPage';
import MyAccountPage from './pages/MyAccountPage';
import VerifyCodePage from './pages/VerifyCodePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ServiceCheckoutPage from './pages/ServiceCheckoutPage';
import AccountServiceDetailPage from './pages/AccountServiceDetailPage';
import StarterAnimaPage from './pages/StarterAnimaPage';
import HelpPage from './pages/HelpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard'; // <--- [NEW] Imported Dashboard
import LanguageSwitcher from './components/LanguageSwitcher';

/* ------------ Global Styles ------------- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cinzel+Decorative:wght@700;900&family=Montserrat:wght@300;400;500;600&display=swap');

    :root {
      --c-gold: #FFA500;
      --c-dark: #1a1a1a;
      --c-darker: #111;
      --c-light: #f9fafb;
      --font-heading: 'Cinzel', serif;
      --font-body: 'Montserrat', sans-serif;
      --font-logo: 'Cinzel Decorative', cursive;
      --marquee-height: 32px;
      --header-height: 80px;
    }

    body {
      font-family: var(--font-body);
      margin: 0; padding: 0;
      background-color: var(--c-light);
      color: black;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4 { font-family: var(--font-heading); letter-spacing: 0.02em; }

    /* Page Animation */
    @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
    
    /* Standard Page Animation (Offset for Header) */
    .animate-fadeUp { 
        animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        width: 100%; position: relative; z-index: 1; 
        padding-top: calc(var(--marquee-height) + var(--header-height)); 
    }

    /* Dashboard Page Animation (No Offset) */
    .animate-dashboard {
        animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        width: 100%; position: relative; z-index: 1; 
        padding-top: 0; /* Dashboard is full screen */
    }

    /* Utilities */
    .desktop-only { display: none; }
    @media (min-width: 1200px) { .desktop-only { display: inline; } }

    /* Marquee */
    .shivba-marquee { position: fixed; top: 0; left: 0; width: 100%; height: var(--marquee-height); z-index: 1001; background: var(--c-dark); color: white; display: flex; font-size: 0.85rem; border-bottom: 1px solid #333; overflow: hidden; }
    .shivba-marquee-label { background: var(--c-gold); color: black; padding: 0 20px; display: flex; align-items: center; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; position: relative; z-index: 2; box-shadow: 4px 0 10px rgba(0,0,0,0.3); height: 100%; }
    .shivba-marquee-window { flex: 1; overflow: hidden; display: flex; align-items: center; position: relative; }
    .shivba-marquee-track { display: flex; gap: 40px; white-space: nowrap; padding-left: 20px; font-family: var(--font-body); font-weight: 500; animation: marquee 20s linear infinite; }
    @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }

    /* Header */
    .shivba-header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #eaeaea; position: fixed; top: var(--marquee-height); left: 0; width: 100%; height: var(--header-height); z-index: 1000; transition: all 0.3s ease; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .shivba-header-inner { max-width: 1400px; margin: 0 auto; padding: 0 30px; height: 100%; display: flex; align-items: center; justify-content: space-between; }
    .shivba-logo { font-family: var(--font-logo); font-size: 2rem; font-weight: 900; color: black; cursor: pointer; text-transform: uppercase; letter-spacing: 0.15em; text-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
    .shivba-logo:hover { transform: scale(1.02); }
    .shivba-nav { display: flex; gap: 25px; align-items: center; }
    .nav-btn { background: none; border: none; font-family: var(--font-body); font-size: 0.85rem; font-weight: 700; color: black; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.05em; position: relative; }
    .nav-btn::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: var(--c-gold); transition: width 0.3s ease; }
    .nav-btn:hover::after, .nav-btn.active::after { width: 100%; }
    .nav-btn:hover, .nav-btn.active { color: black; } 
    .shivba-header-actions { display: flex; align-items: center; gap: 15px; }
    .shivba-primary-btn { background: black; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
    .shivba-primary-btn:hover { background: var(--c-gold); color: black; transform: translateY(-2px); }
    .shivba-ghost-btn { background: transparent; border: 1px solid black; padding: 10px 20px; border-radius: 4px; color: black; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; font-weight: 600; text-transform: uppercase; transition: all 0.3s; }
    .shivba-ghost-btn:hover { background: black; color: white; }

    /* Footer */
    .shivba-footer { background: #0a0a0a; color: #888; padding: 5rem 2rem 2rem; font-size: 0.9rem; border-top: 1px solid #222; position: relative; z-index: 2; }
    .shivba-footer-inner { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 4rem; }
    .shivba-footer-logo { font-family: var(--font-logo); font-size: 2.5rem; color: white; margin-bottom: 1rem; opacity: 0.9; }
    .shivba-footer-text { margin-bottom: 1.5rem; line-height: 1.6; max-width: 300px; }
    
    .shivba-footer-social { display: flex; gap: 15px; margin-top: 1rem; }
    .shivba-social-link { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); color: white; transition: all 0.3s ease; text-decoration: none; }
    .shivba-social-link svg { width: 20px; height: 20px; fill: currentColor; }
    .shivba-social-link:hover { background: var(--c-gold); color: black; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(255, 165, 0, 0.3); }

    .shivba-footer-col h4 { color: #fff; margin-bottom: 1.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.2em; }
    .shivba-footer-col button, .shivba-footer-col a { display: block; background: none; border: none; color: #888; cursor: pointer; padding: 0; margin-bottom: 0.8rem; text-align: left; transition: color 0.3s; text-decoration: none; font-size: 0.9rem; font-family: var(--font-body); }
    .shivba-footer-col button:hover, .shivba-footer-col a:hover { color: var(--c-gold); padding-left: 5px; }

    .shivba-footer-input-wrap { display: flex; gap: 0; margin-top: 1.2rem; background: #151515; border: 1px solid #333; border-radius: 6px; overflow: hidden; transition: border-color 0.3s; }
    .shivba-footer-input-wrap:focus-within { border-color: var(--c-gold); }
    .shivba-footer-input-wrap input { padding: 14px 18px; border: none; background: transparent; color: white; flex: 1; outline: none; font-family: var(--font-body); font-size: 0.9rem; }
    .shivba-footer-subscribe { background: var(--c-gold); color: black; border: none; padding: 0 28px; cursor: pointer; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; transition: all 0.3s ease; }
    .shivba-footer-subscribe:hover { background: white; color: black; }

    .shivba-footer-bottom { max-width: 1400px; margin: 4rem auto 0; padding-top: 2rem; border-top: 1px solid #222; display: flex; justify-content: space-between; color: #555; font-size: 0.8rem; }

    /* FAB */
    .fab-container { position: fixed; bottom: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; align-items: center; gap: 15px; }
    .fab-main { width: 60px; height: 60px; border-radius: 50%; background: var(--c-gold); color: black; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 10px 25px rgba(255, 165, 0, 0.4); transition: transform 0.3s; display: flex; align-items: center; justify-content: center; }
    .fab-main:hover { transform: scale(1.1) rotate(90deg); }
    .fab-main.active { transform: rotate(45deg); background: var(--c-dark); color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .fab-item { width: 48px; height: 48px; border-radius: 50%; background: white; color: var(--c-dark); border: none; font-size: 18px; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.1); opacity: 0; transform: translateY(20px) scale(0.8); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; }
    .fab-container.open .fab-item { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .fab-item::after { content: attr(data-tooltip); position: absolute; right: 60px; background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 4px; font-size: 11px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s; top: 12px; font-family: var(--font-body); font-weight: 600; }
    .fab-item:hover::after { opacity: 1; }

    /* Dark Mode */
    body.dark-mode { background-color: #050505 !important; color: #e0e0e0 !important; }
    body.dark-mode .shivba-header { background-color: rgba(20, 20, 20, 0.95); border-bottom: 1px solid #333; }
    body.dark-mode .shivba-logo { color: white; text-shadow: 0 2px 10px rgba(255, 165, 0, 0.3); }
    body.dark-mode .nav-btn { color: white; }
    body.dark-mode .nav-btn:hover, body.dark-mode .nav-btn.active { color: var(--c-gold); }
    body.dark-mode .shivba-ghost-btn { border-color: white; color: white; }
    body.dark-mode .shivba-ghost-btn:hover { border-color: white; background: white; color: black; }
    body.dark-mode .shivba-primary-btn { background: var(--c-gold); color: black; }
    body.dark-mode .shivba-primary-btn:hover { background: white; }

    @media (max-width: 1024px) {
      .shivba-nav { display: none; } 
      .shivba-header-inner { justify-content: space-between; }
      .shivba-footer-inner { grid-template-columns: 1fr; gap: 3rem; text-align: center; }
      .shivba-footer-social { justify-content: center; }
      .shivba-footer-logo { margin: 0 auto 1.5rem; display: block; }
      .shivba-footer-bottom { flex-direction: column; gap: 15px; text-align: center; }
      .shivba-footer-col button, .shivba-footer-col a { text-align: center; }
    }
  `}</style>
);

/* ------------ Components ------------- */

function Header({ setPage, activePage }) {
  const { t } = useTranslation();
  const goto = (name) => setPage({ name });
  const navClass = (name) => activePage === name ? 'nav-btn active' : 'nav-btn';

  return (
    <header className="shivba-header">
      <div className="shivba-header-inner">
        <div className="shivba-logo" onClick={() => goto('home')}>SHIVBA</div>
        
        <nav className="shivba-nav">
          <button className={navClass('home')} onClick={() => goto('home')}>{t('nav.home')}</button>
          <button className={navClass('about')} onClick={() => goto('about')}>{t('nav.about')}</button>
          <button className={navClass('services')} onClick={() => goto('services')}>{t('nav.services')}</button>
          <button className={navClass('events')} onClick={() => goto('events')}>{t('nav.events')}</button>
          <button className={navClass('gallery')} onClick={() => goto('gallery')}>{t('nav.gallery')}</button>
          <button className={navClass('faq')} onClick={() => goto('faq')}>{t('nav.faq')}</button>
          <button className={navClass('help')} onClick={() => goto('help')}>Help</button>
          <button className={navClass('contact')} onClick={() => goto('contact')}>{t('nav.contact')}</button>
        </nav>
        
        <div className="shivba-header-actions">
          <LanguageSwitcher />
          <button className="shivba-ghost-btn" onClick={() => goto('account')}>
            <span>👤</span> <span className="desktop-only">{t('nav.myAccount')}</span>
          </button>
          <button className="shivba-primary-btn" onClick={() => goto('register')}>{t('nav.register')}</button>
        </div>
      </div>
    </header>
  );
}

function MarqueeBar() {
  const { t } = useTranslation();
  return (
    <div className="shivba-marquee">
      <div className="shivba-marquee-label">{t('hero.latestUpdates')}</div>
      <div className="shivba-marquee-window">
        <div className="shivba-marquee-track">
          <span>{t('hero.tickerText')}</span>
          <span>•</span>
          <span>Admissions Open for 2025 Batch</span>
          <span>•</span>
          <span>New Hostel Wing Opening Soon</span>
          <span>•</span>
          <span>{t('hero.tickerText')}</span>
        </div>
      </div>
    </div>
  );
}

function Modal({ show, title, message, content, type, onClose }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)'
    }}>
      <div className={`modal ${type}`} onClick={(e) => e.stopPropagation()} style={{ 
          background: 'white', padding: '2.5rem', borderRadius: '16px', maxWidth: '500px', width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{marginTop:0, fontFamily:'Cinzel, serif', fontSize:'1.8rem', color:'#1a1a1a'}}>{title}</h2>
        {content ? content : <p style={{lineHeight:1.6, color:'#555', fontFamily:'Montserrat, sans-serif'}}>{message}</p>}
        <div style={{ marginTop: '25px', textAlign: 'right' }}>
          <button onClick={onClose} className="shivba-primary-btn">Close</button>
        </div>
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  const handleSubscribeClick = () => {
    setPage({ name: 'register' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="shivba-footer">
      <div className="shivba-footer-inner">
        <div className="shivba-footer-col brand">
          <div className="shivba-footer-logo">SHIVBA</div>
          <p className="shivba-footer-text">Forging legacy through strength, culture, and community excellence. Join the revolution today.</p>
        </div>
        <div className="shivba-footer-col">
          <h4>Explore</h4>
          <button onClick={() => setPage({ name: 'home' })}>Home</button>
          <button onClick={() => setPage({ name: 'about' })}>About Us</button>
          <button onClick={() => setPage({ name: 'services' })}>Services</button>
          <button onClick={() => setPage({ name: 'events' })}>Events</button>
          <button onClick={() => setPage({ name: 'gallery' })}>Gallery</button>
          <button onClick={() => setPage({ name: 'faq' })}>FAQ</button>
        </div>
        <div className="shivba-footer-col">
          <h4>Contact</h4>
          <p>Jadhav Commercial Centre, Manik Chowk, Chakan – 410501, Pune.</p>
          <p>revolution2020.saf@gmail.com</p>
          <p>+91 97672 34353</p>
        </div>
        <div className="shivba-footer-col newsletter">
          <h4>Stay Connected</h4>
          <p>Receive updates on new batches and community events.</p>
          <div className="shivba-footer-input-wrap">
            <input type="email" placeholder="Your email address" />
            <button className="shivba-footer-subscribe" onClick={handleSubscribeClick}>Join</button>
          </div>
        </div>
      </div>
      <div className="shivba-footer-bottom">
        <span>© {new Date().getFullYear()} Shivba Group. All rights reserved.</span>
        <span className="shivba-footer-bottom-right">Designed with precision in Pune, India.</span>
      </div>
    </footer>
  );
}

/* ------------ App ------------- */
function App() {
  const [page, setPage] = useState(() => {
    const path = window.location.pathname;
    if (path === '/reset-password') return { name: 'reset-password' };
    
    const hasSeenIntro = sessionStorage.getItem('shivba_intro_shown');
    if (!hasSeenIntro) {
      sessionStorage.setItem('shivba_intro_shown', 'true');
      return { name: 'starter-anima' };
    }

    try {
      const savedPage = localStorage.getItem('shivba_page');
      if (savedPage) {
        const parsed = JSON.parse(savedPage);
        if (parsed && parsed.name && parsed.name !== 'starter-anima') return parsed;
      }
    } catch (e) { console.error("Page restore failed", e); }

    return { name: 'home' };
  });

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [modalState, setModalState] = useState({ show: false, title: '', message: '', content: null, type: 'info' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('shivba_theme') === 'dark'; } catch { return false; }
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const isFirstRender = useRef(true);
  const [accountMember, setAccountMember] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('shivba_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('shivba_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const showShortcuts = () => { setPage({ name: 'help' }); setSettingsOpen(false); };
  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setSettingsOpen(false); };

  const handleSetPage = useCallback((nextPage) => {
    if (page.name === nextPage.name && JSON.stringify(page.params) === JSON.stringify(nextPage.params)) return;
    setHistory((prev) => [...prev, page]);
    setFuture([]);
    setPage(nextPage);
  }, [page]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const previousPage = history[history.length - 1];
    setFuture((prev) => [...prev, page]);
    setHistory(history.slice(0, -1));
    setPage(previousPage);
  }, [history, page]);

  const goForward = useCallback(() => {
    if (future.length === 0) return;
    const nextPage = future[future.length - 1];
    setHistory((prev) => [...prev, page]);
    setFuture(future.slice(0, -1));
    setPage(nextPage);
  }, [future, page]);

  const closeModal = useCallback(() => {
    setModalState({ show: false, title: '', message: '', content: null, type: 'info' });
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    window.scrollTo(0, 0);
  }, [page.name]);

  useEffect(() => {
    if (page.name !== 'starter-anima') {
      try { localStorage.setItem('shivba_page', JSON.stringify(page)); } catch {}
    }
  }, [page]);

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === 'Escape') closeModal();
      
      // Ignore input fields (except for shortcuts that use Alt/Ctrl)
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !e.altKey) return;

      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'Backspace')) { e.preventDefault(); goBack(); }
      if (e.altKey && (e.key === 'ArrowRight')) { e.preventDefault(); goForward(); }
      
      if (e.altKey) {
        if(e.key.toLowerCase() === 'h') handleSetPage({ name: 'home' });
        if(e.key.toLowerCase() === 'a') handleSetPage({ name: 'about' });
        if(e.key.toLowerCase() === 's') handleSetPage({ name: 'services' });
        if(e.key.toLowerCase() === 'e') handleSetPage({ name: 'events' });
        if(e.key.toLowerCase() === 'g') handleSetPage({ name: 'gallery' });
        if(e.key.toLowerCase() === 'c') handleSetPage({ name: 'contact' });
        
        // --- [NEW] Dashboard Shortcut (Alt + D) ---
        if(e.key.toLowerCase() === 'd') {
            e.preventDefault();
            handleSetPage({ name: 'dashboard' });
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [handleSetPage, closeModal, goBack, goForward]);

  let content;
  if (page.name === 'starter-anima') {
    return <div className="App"><GlobalStyles /><StarterAnimaPage setPage={handleSetPage} /></div>;
  }

  // --- ROUTING LOGIC ---
  switch (page.name) {
    case 'home': content = <HomePage setPage={handleSetPage} />; break;
    case 'about': content = <AboutPage />; break;
    case 'services': content = <ServicesPage setPage={handleSetPage} />; break;
    case 'service-detail': content = <ServiceDetailPage serviceId={page.params?.id || 'talim'} setPage={handleSetPage} />; break;
    case 'service-checkout': content = <ServiceCheckoutPage serviceId={page.params?.id || 'talim'} userInfo={{ email: verifiedEmail }} setPage={handleSetPage} />; break;
    case 'account-service-detail': content = <AccountServiceDetailPage member={accountMember} serviceIndex={page.params?.index || 0} setPage={handleSetPage} />; break;
    case 'gallery': content = <GalleryPage setPage={handleSetPage} />; break;
    case 'events': content = <EventsPage setPage={handleSetPage} setSelectedEvent={setSelectedEvent} />; break;
    case 'event-register': content = <EventRegisterPage event={selectedEvent} setPage={handleSetPage} setModalState={setModalState} />; break;
    case 'contact': content = <ContactPage setModalState={setModalState} />; break;
    case 'register': content = <RegisterPage setPage={handleSetPage} setModalState={setModalState} params={page.params} />; break;
    case 'faq': content = <FAQPage setPage={handleSetPage} />; break;
    case 'help': content = <HelpPage setPage={handleSetPage} />; break;
    case 'verify': content = <VerifyCodePage defaultEmail={page.params?.email || ''} onVerified={(email) => { setVerifiedEmail(email); handleSetPage({ name: 'account' }); }} setPage={handleSetPage} />; break;
    case 'account': content = <MyAccountPage defaultEmail={verifiedEmail} setPage={handleSetPage} onLoaded={setAccountMember} />; break;
    case 'reset-password': content = <ResetPasswordPage setPage={handleSetPage} />; break;
    
    // --- [NEW] Dashboard Route ---
    case 'dashboard': content = <Dashboard setPage={handleSetPage} />; break;
    
    default: content = <HomePage setPage={handleSetPage} />;
  }

  // --- LAYOUT LOGIC (Hide Header/Footer for Dashboard/Owner pages) ---
  const isFullScreenPage = ['owner', 'dashboard'].includes(page.name);
  const containerClass = isFullScreenPage ? 'animate-dashboard' : 'animate-fadeUp';

  return (
    <div className="App">
      <GlobalStyles />
      <Modal show={modalState.show} title={modalState.title} message={modalState.message} content={modalState.content} type={modalState.type} onClose={closeModal} />
      
      {/* Hide Marquee & Header on Dashboard */}
      {!isFullScreenPage && <MarqueeBar />}
      {!isFullScreenPage && <Header setPage={handleSetPage} activePage={page.name} />}
      
      <main className={containerClass} key={page.name}>
        {content}
      </main>
      
      {/* Hide Footer on Dashboard */}
      {!isFullScreenPage && <Footer setPage={handleSetPage} />}

      <div className={`fab-container ${settingsOpen ? 'open' : ''}`}>
        <button className="fab-item" onClick={scrollToTop} data-tooltip="Scroll Top">⬆️</button>
        <button className="fab-item" onClick={toggleDarkMode} data-tooltip="Dark Mode">{darkMode ? '☀️' : '🌙'}</button>
        <button className="fab-item" onClick={showShortcuts} data-tooltip="Help">❓</button>
        <button className={`fab-main ${settingsOpen ? 'active' : ''}`} onClick={() => setSettingsOpen(!settingsOpen)}>⚙️</button>
      </div>
    </div>
  );
}

export default App;