import React from 'react';
import { useTranslation } from 'react-i18next';

function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>{t('about.heroTitle')}</h1>
          <p>{t('about.heroSubtitle')}</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-block about-story">
        <div className="about-inner-narrow">
          <h2>{t('about.storyTitle')}</h2>
          <p>{t('about.storyParagraph1')}</p>
          <p>{t('about.storyParagraph2')}</p>
        </div>
      </section>

      {/* What Drives Us */}
      <section className="about-block about-values">
        <div className="about-inner-wide">
          <h2>{t('about.drivesTitle')}</h2>
          <div className="about-values-grid">
            <ValueCard
              icon="➜"
              title={t('about.missionTitle')}
              text={t('about.missionText')}
            />
            <ValueCard
              icon="◎"
              title={t('about.visionTitle')}
              text={t('about.visionText')}
            />
            <ValueCard
              icon="❤"
              title={t('about.valuesTitle')}
              text={t('about.valuesText')}
            />
            <ValueCard
              icon="★"
              title={t('about.commitmentTitle')}
              text={t('about.commitmentText')}
            />
          </div>
        </div>
      </section>

      {/* Leadership team */}
      <section className="about-block about-team">
        <div className="about-inner-wide">
          <h2>{t('about.teamTitle')}</h2>
          <div className="about-team-grid">
            <TeamCard
              name={t('about.team1.name')}
              role={t('about.team1.role')}
            />
            <TeamCard
              name={t('about.team2.name')}
              role={t('about.team2.role')}
            />
            <TeamCard
              name={t('about.team3.name')}
              role={t('about.team3.role')}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, text }) {
  return (
    <div className="about-value-card">
      <div className="about-value-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function TeamCard({ name, role }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="about-team-card">
      <div className="about-team-avatar">{initial}</div>
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}

export default AboutPage;
