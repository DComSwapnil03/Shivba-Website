import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; 

function Header({ setPage, activePage }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // Helper to change page and close mobile menu
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

        {/* 2. Desktop Navigation */}
        {/* CSS will hide this on mobile screens */}
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
          {/* CSS will show this ONLY on mobile screens */}
          <button
            className={`shivba-menu-toggle ${open ? 'open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* 4. Mobile Dropdown Menu (Visible only when 'open' is true) */}
      {open && (
        <div className="shivba-mobile-menu animate-fadeUp">
          <button className={navClass('home')} onClick={() => goto('home')}>{t('nav.home')}</button>
          <button className={navClass('about')} onClick={() => goto('about')}>{t('nav.about')}</button>
          <button className={navClass('services')} onClick={() => goto('services')}>{t('nav.services')}</button>
          <button className={navClass('events')} onClick={() => goto('events')}>{t('nav.events')}</button>
          <button className={navClass('gallery')} onClick={() => goto('gallery')}>{t('nav.gallery')}</button>
          <button className={navClass('faq')} onClick={() => goto('faq')}>{t('nav.faq')}</button>
          <button className={navClass('help')} onClick={() => goto('help')}>{t('nav.help') || 'Help'}</button>
          <button className={navClass('contact')} onClick={() => goto('contact')}>{t('nav.contact')}</button>
          
          <hr style={{ borderColor: '#eee', margin: '15px 0', width: '100%' }} />
          
          <div className="mobile-actions">
             <LanguageSwitcher />
             <button className="mobile-reg-btn" onClick={() => goto('register')}>{t('nav.register')}</button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;