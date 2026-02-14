import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; 

function Header({ setPage, activePage }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [open]);

  // Helper to change page and close mobile menu
  const goto = (name) => {
    setPage({ name });
    setOpen(false); 
  };

  const navClass = (name) =>
    activePage === name ? 'nav-btn active' : 'nav-btn';

  const mobileNavClass = (name) => 
    activePage === name ? 'drawer-link active' : 'drawer-link';

  return (
    <header className="shivba-header">
      {/* --- INJECTED STYLES FOR WHITE NAVIGATION TEXT --- */}
      <style>{`
        /* 1. Desktop Navigation Links -> White */
        .shivba-nav .nav-btn {
            color: #ffffff !important;
        }

        /* 2. Mobile Drawer Navigation Links -> White */
        /* We target .drawer-content specifically so we don't accidentally turn the Footer/Account buttons white */
        .drawer-content .drawer-link {
            color: #ffffff !important;
        }

        /* Optional: Hover effect for white links */
        .shivba-nav .nav-btn:hover,
        .drawer-content .drawer-link:hover {
            opacity: 0.8;
        }
      `}</style>

      <div className="shivba-header-inner">
        {/* 1. Logo (Desktop/Main) */}
        <div className="shivba-logo" onClick={() => goto('home')}>
          SHIVBA
        </div>

        {/* 2. Desktop Navigation */}
        <nav className="shivba-nav">
          <button className={navClass('home')} onClick={() => goto('home')}>{t('nav.home')}</button>
          <button className={navClass('about')} onClick={() => goto('about')}>{t('nav.about')}</button>
          <button className={navClass('services')} onClick={() => goto('services')}>{t('nav.services')}</button>
          <button className={navClass('events')} onClick={() => goto('events')}>{t('nav.events')}</button>
          <button className={navClass('gallery')} onClick={() => goto('gallery')}>{t('nav.gallery')}</button>
          <button className={navClass('faq')} onClick={() => goto('faq')}>{t('nav.faq')}</button>
          <button className={navClass('help')} onClick={() => goto('help')}>{t('nav.help') || 'Help'}</button>
          <button className={navClass('contact')} onClick={() => goto('contact')}>{t('nav.contact')}</button>
        </nav>

        {/* 3. Header Actions (Excluded from White Text Rule) */}
        <div className="shivba-header-actions">
          <div className="desktop-only">
             <LanguageSwitcher />
          </div>
          
          <button className="shivba-ghost-btn" onClick={() => goto('account')}>
            <span>👤</span> <span className="desktop-only">{t('nav.myAccount')}</span>
          </button>

          <button className="shivba-primary-btn desktop-only" onClick={() => goto('register')}>
            {t('nav.register')}
          </button>
          
          {/* Mobile Hamburger Toggle */}
          <button
            className={`shivba-menu-toggle ${open ? 'open' : ''}`}
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            style={{ color: '#fff' }} /* Ensure toggle is visible */
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* 4. MOBILE SIDE DRAWER */}
      {/* Overlay Backdrop */}
      <div 
        className={`shivba-mobile-overlay ${open ? 'visible' : ''}`} 
        onClick={() => setOpen(false)}
        style={{ zIndex: 999 }} 
      />

      {/* Sliding Drawer */}
      <div 
        className={`shivba-mobile-drawer ${open ? 'open' : ''}`}
        style={{ zIndex: 1000 }} 
      >
        
        {/* DRAWER HEADER */}
        <div className="drawer-header">
           <div 
             className="shivba-logo" 
             onClick={() => goto('home')} 
             style={{ fontSize: '1.5rem', cursor: 'pointer' }}
           >
             SHIVBA
           </div>
           <button 
             className="drawer-close-btn" 
             onClick={() => setOpen(false)}
             style={{ color: '#fff' }} /* Force close button white */
           >
             ✕
           </button>
        </div>

        {/* DRAWER CONTENT (Links here will be white) */}
        <div className="drawer-content">
          <button className={mobileNavClass('home')} onClick={() => goto('home')}>{t('nav.home')}</button>
          <button className={mobileNavClass('about')} onClick={() => goto('about')}>{t('nav.about')}</button>
          <button className={mobileNavClass('services')} onClick={() => goto('services')}>{t('nav.services')}</button>
          <button className={mobileNavClass('events')} onClick={() => goto('events')}>{t('nav.events')}</button>
          <button className={mobileNavClass('gallery')} onClick={() => goto('gallery')}>{t('nav.gallery')}</button>
          <button className={mobileNavClass('faq')} onClick={() => goto('faq')}>{t('nav.faq')}</button>
          <button className={mobileNavClass('help')} onClick={() => goto('help')}>{t('nav.help') || 'Help'}</button>
          <button className={mobileNavClass('contact')} onClick={() => goto('contact')}>{t('nav.contact')}</button>
        </div>

        {/* DRAWER FOOTER (Excluded from White Text Rule) */}
        <div className="drawer-footer">
           <div className="drawer-footer-top">
             <LanguageSwitcher />
             <button className="drawer-link account-link" onClick={() => goto('account')} style={{ color: 'inherit' }}>
               <span>👤</span> {t('nav.myAccount')}
             </button>
           </div>
           
           <button className="drawer-cta-btn" onClick={() => goto('register')}>
             {t('nav.register')}
           </button>
        </div>
      </div>
    </header>
  );
}

export default Header;