import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function HomePage({ setPage }) {
  const { t } = useTranslation();

  const slides = t('home.slides', { returnObjects: true });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(id);
  }, [slides.length]);

  const goTo = (index) => setCurrent(index);
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const active = slides[current];

  return (
    <div className="animate-fadeIn">
      {/* Top hero (static text + stats) */}
      <section className="home-hero">
        <div className="home-hero-inner animate-fadeIn">
          <div className="home-hero-text">
            <h1>{t('home.heroTitle')}</h1>
            <p>{t('home.heroSubtitle')}</p>
            <div className="home-hero-buttons">
              <button onClick={() => setPage({ name: 'register' })}>
                {t('home.heroPrimary')}
              </button>
              <button
                className="outline"
                onClick={() => setPage({ name: 'contact' })}
              >
                {t('home.heroSecondary')}
              </button>
            </div>
          </div>
          <div className="home-hero-highlight animate-fadeIn">
            <div className="home-hero-stat">
              <span className="home-hero-stat-number">
                {t('home.stats.membersNumber')}
              </span>
              <span className="home-hero-stat-label">
                {t('home.stats.membersLabel')}
              </span>
            </div>
            <div className="home-hero-stat">
              <span className="home-hero-stat-number">
                {t('home.stats.workshopsNumber')}
              </span>
              <span className="home-hero-stat-label">
                {t('home.stats.workshopsLabel')}
              </span>
            </div>
            <div className="home-hero-stat">
              <span className="home-hero-stat-number">
                {t('home.stats.yearsNumber')}
              </span>
              <span className="home-hero-stat-label">
                {t('home.stats.yearsLabel')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Slider with images */}
      <section className="home-hero-mid">
        <div className="home-hero-inner animate-fadeIn">
          <div className="home-hero-text">
            <h1>{active.title}</h1>
            <p>{active.text}</p>
            <div className="home-hero-buttons">
              <button onClick={() => setPage({ name: 'register' })}>
                {t('home.heroPrimary')}
              </button>
              <button
                className="outline"
                onClick={() => setPage({ name: 'contact' })}
              >
                {t('home.visitButton')}
              </button>
            </div>

            <div className="home-hero-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={i === current ? 'active' : ''}
                />
              ))}
            </div>
          </div>

          <div className="home-hero-panel animate-fadeIn">
            <div className="home-hero-image-wrap">
              <img src={active.image} alt={active.title} />
            </div>
            <div className="home-hero-panel-inner">
              <span>
                {t('home.slideCounter', {
                  current: current + 1,
                  total: slides.length,
                })}
              </span>
              <div className="home-hero-arrows">
                <button onClick={prev}>{'‹'}</button>
                <button onClick={next}>{'›'}</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services section - UPDATED LINKS */}
      <section className="home-section">
        <div className="home-section-header animate-fadeIn">
          <h2>{t('home.servicesTitle')}</h2>
          <p>{t('home.servicesSubtitle')}</p>
        </div>

        <div className="home-cards">
          <HomeCard
            title={t('home.cards.talim.title')}
            text={t('home.cards.talim.text')}
            onClick={() =>
              setPage({ name: 'service-detail', params: { id: 'talim' } })
            }
          />
          <HomeCard
            title={t('home.cards.hostel.title')}
            text={t('home.cards.hostel.text')}
            onClick={() =>
              setPage({ name: 'service-detail', params: { id: 'hostel' } })
            }
          />
          <HomeCard
            title={t('home.cards.library.title')}
            text={t('home.cards.library.text')}
            onClick={() =>
              setPage({ name: 'service-detail', params: { id: 'library' } })
            }
          />
          <HomeCard
            title={t('home.cards.social.title')}
            text={t('home.cards.social.text')}
            onClick={() => 
              setPage({ name: 'service-detail', params: { id: 'social' } })
            }
          />
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-inner animate-fadeIn">
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaSubtitle')}</p>
          <div className="home-hero-buttons">
            <button onClick={() => setPage({ name: 'register' })}>
              {t('home.ctaPrimary')}
            </button>
            <button
              className="outline"
              onClick={() => setPage({ name: 'contact' })}
            >
              {t('home.ctaSecondary')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeCard({ title, text, onClick }) {
  return (
    <div className="home-card animate-fadeIn" onClick={onClick}>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="home-card-link">Learn more →</span>
    </div>
  );
}

export default HomePage;