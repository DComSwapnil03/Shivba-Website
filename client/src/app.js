import React, { useState, useEffect, useCallback, useRef } from 'react';
import './app.css';
import { useTranslation } from 'react-i18next';

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
import LanguageSwitcher from './components/LanguageSwitcher';

/* ------------ Dark Mode & FAB Styles (Injected) ------------- */
const GlobalStyles = () => (
  <style>{`
    /* 1. Base Dark Mode Defaults */
    body.dark-mode {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
    }

    /* 2. HEADER & FOOTER */
    body.dark-mode .shivba-header {
      background-color: #1e1e1e !important;
      border-bottom: 1px solid #333;
    }
    body.dark-mode .shivba-footer {
      background-color: #000000 !important;
      border-top: 1px solid #333;
      color: #ccc;
    }
    body.dark-mode .nav-btn { color: #aaa; }
    body.dark-mode .nav-btn:hover,
    body.dark-mode .nav-btn.active { color: #FFA500; }

    /* 3. HOME PAGE SECTIONS - FORCE DARK BACKGROUNDS */
    body.dark-mode .home-hero,
    body.dark-mode .home-hero-mid,
    body.dark-mode .home-section,
    body.dark-mode .home-cta,
    body.dark-mode .home-hero-inner {
      background-color: #121212 !important; /* Main Dark Background */
      color: #ffffff !important;
    }

    /* 4. HOME PAGE TEXT - FORCE BRIGHT TEXT */
    body.dark-mode h1, 
    body.dark-mode h2, 
    body.dark-mode h3, 
    body.dark-mode h4,
    body.dark-mode .home-hero-text h1,
    body.dark-mode .home-hero-text p,
    body.dark-mode .home-section-header h2,
    body.dark-mode .home-section-header p,
    body.dark-mode .home-cta h2,
    body.dark-mode .home-cta p {
      color: #ffffff !important; /* Pure White Text */
    }

    /* 5. CARDS & BOXES (Services, etc.) */
    body.dark-mode .home-card,
    body.dark-mode .service-row,
    body.dark-mode .modal,
    body.dark-mode .home-hero-panel {
      background-color: #1e1e1e !important; /* Lighter Dark for cards */
      border: 1px solid #333;
      box-shadow: 0 4px 6px rgba(0,0,0,0.5);
    }
    
    /* Text inside Cards */
    body.dark-mode .home-card h3 { color: #FFA500 !important; } /* Orange title */
    body.dark-mode .home-card p { color: #dddddd !important; } /* Light Grey text */
    body.dark-mode .home-card-link { color: #4db6ac !important; }

    /* 6. STATS (Numbers) */
    body.dark-mode .home-hero-stat-number { color: #FFA500 !important; }
    body.dark-mode .home-hero-stat-label { color: #bbb !important; }

    /* 7. BUTTONS */
    body.dark-mode button.outline {
      border: 2px solid #ffffff;
      color: #ffffff;
      background: transparent;
    }
    body.dark-mode button.outline:hover {
      background-color: #ffffff;
      color: #000;
    }

    /* 8. INPUTS */
    body.dark-mode input,
    body.dark-mode textarea {
      background-color: #2d2d2d !important;
      color: #ffffff !important;
      border: 1px solid #555;
    }

    /* --- FAB Styles (Unchanged) --- */
    .fab-container {
      position: fixed; bottom: 30px; right: 30px; z-index: 9999;
      display: flex; flex-direction: column; align-items: center; gap: 15px;
    }
    .fab-main {
      width: 60px; height: 60px; border-radius: 50%;
      background-color: #FF5722; color: white; border: none; font-size: 24px;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s;
    }
    .fab-main:hover { transform: scale(1.1); }
    .fab-main.active { transform: rotate(45deg); background-color: #333; }
    
    .fab-item {
      width: 50px; height: 50px; border-radius: 50%;
      background-color: white; color: #333; border: none; font-size: 20px;
      cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transform: translateY(20px) scale(0.8);
      transition: all 0.3s ease; pointer-events: none; position: relative;
    }
    body.dark-mode .fab-item { background-color: #333; color: #fff; }
    
    .fab-container.open .fab-item { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .fab-container.open .fab-item:nth-child(3) { transition-delay: 0s; }
    .fab-container.open .fab-item:nth-child(2) { transition-delay: 0.05s; }
    .fab-container.open .fab-item:nth-child(1) { transition-delay: 0.1s; }
    
    .fab-item::after {
      content: attr(data-tooltip); position: absolute; right: 60px;
      background: rgba(0,0,0,0.7); color: white; padding: 4px 8px;
      border-radius: 4px; font-size: 12px; white-space: nowrap;
      opacity: 0; pointer-events: none; transition: opacity 0.2s;
    }
    .fab-item:hover::after { opacity: 1; }
  `}</style>
);

/* ------------ Header ------------- */
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
            <span className="shivba-user-circle">👤</span> <span>{t('nav.myAccount')}</span>
          </button>
          <button className="shivba-primary-btn" onClick={() => goto('register')}>{t('nav.register')}</button>
        </div>
      </div>
    </header>
  );
}

/* ------------ Marquee ------------- */
function MarqueeBar() {
  const { t } = useTranslation();
  return (
    // Adjusted top margin to ensure visibility
    <div className="shivba-marquee" style={{ marginTop: '3px' }}>
      <div className="shivba-marquee-label">{t('hero.latestUpdates')}</div>
      <div className="shivba-marquee-window">
        <div className="shivba-marquee-track">
          <span>{t('hero.tickerText')}</span>
          <span>{t('hero.tickerText')}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------ Modal ------------- */
function Modal({ show, title, message, content, type, onClose }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className={`modal ${type}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
        <h2>{title}</h2>
        {content ? content : <p>{message}</p>}
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <button onClick={onClose} className="shivba-primary-btn">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ------------ Footer ------------- */
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
          <p className="shivba-footer-text">Strengthening bodies, minds, and communities through talim, education, and cultural programs.</p>
          <div className="shivba-footer-social">
            <a href="https://www.instagram.com/iin_education_hub/" aria-label="Instagram"><i className="bi bi-instagram" /></a>
            <a href="https://www.instagram.com/shivbastalim/" aria-label="Instagram"><i className="bi bi-instagram" /></a>
            <a href="https://www.facebook.com/profile.php?id=100017188563264" aria-label="Facebook"><i className="bi bi-facebook" /></a>
          </div>
        </div>
        <div className="shivba-footer-col">
          <h4>Explore</h4>
          <button onClick={() => setPage({ name: 'home' })}>Home</button>
          <button onClick={() => setPage({ name: 'about' })}>About Us</button>
          <button onClick={() => setPage({ name: 'services' })}>Services</button>
          <button onClick={() => setPage({ name: 'events' })}>Events</button>
          <button onClick={() => setPage({ name: 'gallery' })}>Gallery</button>
          <button onClick={() => setPage({ name: 'faq' })}>FAQ</button>
          <button onClick={() => setPage({ name: 'help' })}>Help</button>
        </div>
        <div className="shivba-footer-col">
          <h4>Contact</h4>
          <p>Jadhav Commercial Centre, Manik Chowk, Chakan – 410501, Pune.</p>
          <p>revolution2020.saf@gmail.com</p>
          <p>+91 97672 34353</p>
        </div>
        <div className="shivba-footer-col newsletter">
          <h4>Stay Updated</h4>
          <p>Get updates about new batches, workshops, and events.</p>
          <div className="shivba-footer-input-wrap">
            <input type="email" placeholder="Enter your email" />
            <button className="shivba-footer-subscribe" onClick={handleSubscribeClick}>Subscribe</button>
          </div>
        </div>
      </div>
      <div className="shivba-footer-bottom">
        <span>© {new Date().getFullYear()} Shivba. All rights reserved.</span>
        <span className="shivba-footer-bottom-right">Crafted with care in Pune, India.</span>
      </div>
    </footer>
  );
}

/* ------------ App ------------- */
function App() {
  const [page, setPage] = useState(() => {
    const path = window.location.pathname;
    
    // 1. Check URL for Reset Password Route (Critical functionality)
    if (path === '/reset-password') {
      return { name: 'reset-password' };
    }
    
    // 2. CHECK SESSION STORAGE
    // If the key 'shivba_intro_shown' exists, the user has been here this session -> Go Home.
    // If it does not exist, this is a fresh entry -> Show Animation.
    const hasSeenIntro = sessionStorage.getItem('shivba_intro_shown');

    if (!hasSeenIntro) {
      // Mark as seen so next refresh/nav skips animation
      sessionStorage.setItem('shivba_intro_shown', 'true');
      return { name: 'starter-anima' };
    }

    // Default: User has already entered, show home
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

  /* Dark mode toggling */
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
    // We still save to localStorage so internal navigation feels persistent if we need it,
    // but the initialization logic ignores it.
    try { localStorage.setItem('shivba_page', JSON.stringify(page)); } catch {}
  }, [page]);

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === 'Escape') closeModal();
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === '<')) {
        e.preventDefault(); goBack();
      }
      if (e.altKey && (e.key === 'ArrowRight' || e.key === '>')) {
        e.preventDefault(); goForward();
      }
      if (e.altKey) {
        if(e.key.toLowerCase() === 'h') handleSetPage({ name: 'home' });
        if(e.key.toLowerCase() === 'a') handleSetPage({ name: 'about' });
        if(e.key.toLowerCase() === 's') handleSetPage({ name: 'services' });
        if(e.key.toLowerCase() === 'e') handleSetPage({ name: 'events' });
        if(e.key.toLowerCase() === 'g') handleSetPage({ name: 'gallery' });
        if(e.key.toLowerCase() === 'c') handleSetPage({ name: 'contact' });
        if(e.key.toLowerCase() === 'l') handleSetPage({ name: 'account' });
        if(e.key.toLowerCase() === 'r') handleSetPage({ name: 'register' });
        if(e.key.toLowerCase() === 'p') handleSetPage({ name: 'help' });
        // --- OWNER SHORTCUT (ALT + O) ---
        if(e.key.toLowerCase() === 'o') handleSetPage({ name: 'owner' });
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [handleSetPage, closeModal, goBack, goForward]);

  let content;
  // Special Handling for Starter Page: Render immediately
  if (page.name === 'starter-anima') {
    return (
      <div className="App">
        <GlobalStyles />
        <StarterAnimaPage setPage={handleSetPage} />
      </div>
    );
  }

  switch (page.name) {
    case 'home': content = <HomePage setPage={handleSetPage} />; break;
    case 'about': content = <AboutPage />; break;
    case 'services': content = <ServicesPage setPage={handleSetPage} />; break;
    case 'service-detail': content = <ServiceDetailPage serviceId={page.params?.id || 'talim'} setPage={handleSetPage} />; break;
    case 'service-checkout': content = <ServiceCheckoutPage serviceId={page.params?.id || 'talim'} userInfo={{ email: verifiedEmail }} setPage={handleSetPage} />; break;
    case 'account-service-detail': content = <AccountServiceDetailPage member={accountMember} serviceIndex={page.params?.index || 0} setPage={handleSetPage} />; break;
    case 'gallery': content = <GalleryPage />; break;
    case 'events': content = <EventsPage setPage={handleSetPage} setSelectedEvent={setSelectedEvent} />; break;
    case 'event-register': content = <EventRegisterPage event={selectedEvent} setPage={handleSetPage} setModalState={setModalState} />; break;
    case 'contact': content = <ContactPage setModalState={setModalState} />; break;
    case 'register': content = <RegisterPage setPage={handleSetPage} setModalState={setModalState} params={page.params} />; break;
    case 'faq': content = <FAQPage setPage={handleSetPage} />; break;
    case 'help': content = <HelpPage setPage={handleSetPage} />; break;
    case 'verify': content = <VerifyCodePage defaultEmail={page.params?.email || ''} onVerified={(email) => { setVerifiedEmail(email); handleSetPage({ name: 'account' }); }} setPage={handleSetPage} />; break;
    case 'account': content = <MyAccountPage defaultEmail={verifiedEmail} setPage={handleSetPage} onLoaded={setAccountMember} />; break;
    case 'reset-password': content = <ResetPasswordPage setPage={handleSetPage} />; break;
    
    default: content = <HomePage setPage={handleSetPage} />;
  }

  // Debugging: log page and content type to help locate invalid component errors
  try {
    // eslint-disable-next-line no-console
    console.debug('Rendering page:', page.name, 'contentType:', typeof content, content && content.type ? content.type : null);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error inspecting content before render', e);
  }

  // If `content` isn't a valid React element, render a helpful diagnostic UI
  if (!React.isValidElement(content)) {
    let contentType = typeof content;
    let compType = null;
    try { compType = content && content.type ? content.type : null; } catch (e) { compType = null; }
    const diag = (
      <div style={{ padding: 24, color: '#b91c1c', background: '#fff6f6' }}>
        <h3 style={{ marginTop: 0 }}>App Render Error — Invalid Component</h3>
        <p>The page <strong>{String(page?.name)}</strong> produced an invalid React element.</p>
        <p><strong>content typeof:</strong> {contentType}</p>
        <p><strong>content.type:</strong> {String(compType)}</p>
        <p>Please check the component import/export (default vs named export) for this page.</p>
        <p style={{ fontSize: 12, color: '#6b7280' }}>Open the browser console for more details.</p>
      </div>
    );
    content = diag;
  }

  // Main Return for Standard Pages
  return (
    <div className="App">
      <GlobalStyles />
      <Modal show={modalState.show} title={modalState.title} message={modalState.message} content={modalState.content} type={modalState.type} onClose={closeModal} />
      
      {/* Hide Header on Owner Page */}
      {page.name !== 'owner' && <Header setPage={handleSetPage} activePage={page.name} />}
      
      {/* Hide Marquee on Owner Page */}
      {page.name !== 'owner' && <MarqueeBar />}
      
      <main className="animate-fadeIn">{content}</main>
      
      {/* Hide Footer on Owner Page */}
      {page.name !== 'owner' && <Footer setPage={handleSetPage} />}

      <div className={`fab-container ${settingsOpen ? 'open' : ''}`}>
        <button className="fab-item" onClick={scrollToTop} data-tooltip="Scroll Top" tabIndex={settingsOpen ? 0 : -1}>⬆️</button>
        <button className="fab-item" onClick={toggleDarkMode} data-tooltip="Dark Mode" tabIndex={settingsOpen ? 0 : -1}>{darkMode ? '☀️' : '🌙'}</button>
        <button className="fab-item" onClick={showShortcuts} data-tooltip="Help" tabIndex={settingsOpen ? 0 : -1}>❓</button>
        <button className={`fab-main ${settingsOpen ? 'active' : ''}`} onClick={() => setSettingsOpen(!settingsOpen)}>⚙️</button>
      </div>
    </div>
  );
}

export default App;
<link rel="stylesheet" href="%PUBLIC_URL%/vendor/bootstrap-icons/bootstrap-icons.css" />