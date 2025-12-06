import React from 'react';
import { useTranslation } from 'react-i18next';

function HelpPage() {
  const { t } = useTranslation();

  const shortcuts = [
    { keys: ['Alt', 'H'], action: t('help.shortcuts.home') },
    { keys: ['Alt', 'A'], action: t('help.shortcuts.about') },
    { keys: ['Alt', 'S'], action: t('help.shortcuts.services') },
    { keys: ['Alt', 'E'], action: t('help.shortcuts.events') },
    { keys: ['Alt', 'G'], action: t('help.shortcuts.gallery') },
    { keys: ['Alt', 'C'], action: t('help.shortcuts.contact') },
    { keys: ['Alt', 'R'], action: t('help.shortcuts.register') },
    { keys: ['Alt', 'L'], action: t('help.shortcuts.account') },
    { keys: ['Alt', '←'], action: t('help.shortcuts.back') },
    { keys: ['Alt', '→'], action: t('help.shortcuts.forward') },
    { keys: ['Alt', '1-4'], action: t('help.shortcuts.quickAccess') },
  ];

  const features = [
    {
      icon: '🏋️',
      title: t('help.features.talim.title'),
      desc: t('help.features.talim.desc'),
    },
    {
      icon: '🏠',
      title: t('help.features.hostel.title'),
      desc: t('help.features.hostel.desc'),
    },
    {
      icon: '📚',
      title: t('help.features.library.title'),
      desc: t('help.features.library.desc'),
    },
    {
      icon: '🤝',
      title: t('help.features.social.title'),
      desc: t('help.features.social.desc'),
    },
    {
      icon: '📅',
      title: t('help.features.events.title'),
      desc: t('help.features.events.desc'),
    },
    {
      icon: '👤',
      title: t('help.features.member.title'),
      desc: t('help.features.member.desc'),
    },
  ];

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>{t('help.hero.title')}</h1>
          <p>{t('help.hero.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-16">
        
        {/* Features Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">{t('help.sections.features')}</h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto rounded"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shortcuts Section */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-orange-500">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">⌨️ {t('help.sections.shortcuts')}</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{t('help.labels.proTip')}</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">{s.action}</span>
                <div className="flex gap-2">
                  {s.keys.map((k, j) => (
                    <span key={j} className="kbd">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accessibility Note */}
        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start gap-4">
            <div className="text-3xl">⚙️</div>
            <div>
                <h3 className="font-bold text-blue-900 mb-1">{t('help.accessibility.title')}</h3>
                <p className="text-blue-800 text-sm">
                  {t('help.accessibility.desc_pre')} <strong>{t('help.accessibility.darkMode')}</strong> {t('help.accessibility.desc_post')}
                </p>
            </div>
        </section>

      </div>
    </div>
  );
}

export default HelpPage;