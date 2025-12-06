import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="lang-switcher">
      <button
        className={i18n.language === 'en' ? 'active' : ''}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={i18n.language === 'mr' ? 'active' : ''}
        onClick={() => changeLanguage('mr')}
      >
        MR
      </button>
      <button
        className={i18n.language === 'hi' ? 'active' : ''}
        onClick={() => changeLanguage('hi')}
      >
        HI
      </button>
    </div>
  );
}

export default LanguageSwitcher;
