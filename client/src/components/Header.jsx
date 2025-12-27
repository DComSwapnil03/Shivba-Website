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

        {/* 3. Header Actions */}
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
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* 4. NEW MOBILE SIDE DRAWER */}
      {/* Overlay Backdrop */}
      <div 
        className={`shivba-mobile-overlay ${open ? 'visible' : ''}`} 
        onClick={() => setOpen(false)}
      />

      {/* Sliding Drawer */}
      <div className={`shivba-mobile-drawer ${open ? 'open' : ''}`}>
        
        {/* DRAWER HEADER: Now contains the Logo/Brand Navigation */}
        <div className="drawer-header">
           <div 
             className="shivba-logo" 
             onClick={() => goto('home')} 
             style={{ fontSize: '1.5rem', cursor: 'pointer' }}
           >
             SHIVBA
           </div>
           <button className="drawer-close-btn" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* DRAWER CONTENT: Navigation Links */}
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

        {/* DRAWER FOOTER: Actions */}
        <div className="drawer-footer">
           <LanguageSwitcher />
           <button className="drawer-cta-btn" onClick={() => goto('register')}>{t('nav.register')}</button>
        </div>
      </div>
    </header>
  );
}

export default Header;