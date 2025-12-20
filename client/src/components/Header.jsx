import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; 

function Header({ setPage, activePage }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // Helper to change page and close mobile menu automatically
  const goto = (name) => {
    setPage({ name });
    setOpen(false); 
  };

  const navClass = (name) =>
    activePage === name ? 'nav-btn active' : 'nav-btn';

  return (
    <header className="shivba-header">
      <div className="shivba-header-inner">
        {/* 1. Logo */}
        <div className="shivba-logo" onClick={() => goto('home')}>
          SHIVBA
        </div>

        {/* 2. Desktop Navigation (Hidden on Mobile via CSS) */}
        <nav className="shivba-nav">
          <button className={navClass('home')} onClick={() => goto('home')}>
            {t('nav.home')}
          </button>
          <button className={navClass('about')} onClick={() => goto('about')}>
            {t('nav.about')}
          </button>
          <button className={navClass('services')} onClick={() => goto('services')}>
            {t('nav.services')}
          </button>
          <button className={navClass('events')} onClick={() => goto('events')}>
            {t('nav.events')}
          </button>
          <button className={navClass('gallery')} onClick={() => goto('gallery')}>
            {t('nav.gallery')}
          </button>
          <button className={navClass('faq')} onClick={() => goto('faq')}>
            {t('nav.faq')}
          </button>
          <button className={navClass('help')} onClick={() => goto('help')}>
            {t('nav.help') || 'Help'}
          </button>
          <button className={navClass('contact')} onClick={() => goto('contact')}>
            {t('nav.contact')}
          </button>
        </nav>

        {/* 3. Header Actions (Right Side) */}
        <div className="shivba-header-actions">
          <LanguageSwitcher /> 
          
          <button
            className="shivba-ghost-btn"
            onClick={() => goto('account')}
          >
            <span className="shivba-user-circle">👤</span>
            
            {/* FIX: Replaced inline style error with CSS class */}
            <span className="desktop-only">{t('nav.myAccount')}</span>
          </button>

          <button
            className="shivba-primary-btn"
            onClick={() => goto('register')}
          >
            {t('nav.register')}
          </button>
          
          {/* Mobile Hamburger Toggle */}
          <button
            className="shivba-menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* 4. Mobile Dropdown Menu */}
      {open && (
        <div className="shivba-mobile-menu">
          <button className={navClass('home')} onClick={() => goto('home')}>
            {t('nav.home')}
          </button>
          <button className={navClass('about')} onClick={() => goto('about')}>
            {t('nav.about')}
          </button>
          <button className={navClass('services')} onClick={() => goto('services')}>
            {t('nav.services')}
          </button>
          <button className={navClass('events')} onClick={() => goto('events')}>
            {t('nav.events')}
          </button>
          <button className={navClass('gallery')} onClick={() => goto('gallery')}>
            {t('nav.gallery')}
          </button>
          <button className={navClass('faq')} onClick={() => goto('faq')}>
            {t('nav.faq')}
          </button>
          <button className={navClass('help')} onClick={() => goto('help')}>
            {t('nav.help') || 'Help'}
          </button>
          <button className={navClass('contact')} onClick={() => goto('contact')}>
            {t('nav.contact')}
          </button>

          <hr />
          
          {/* Mobile Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', gap: '10px' }}>
             <LanguageSwitcher />
          </div>
          <button onClick={() => goto('account')}>{t('nav.myAccount')}</button>
          <button onClick={() => goto('register')}>{t('nav.register')}</button>
        </div>
      )}
    </header>
  );
}

export default Header;