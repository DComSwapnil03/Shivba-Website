import React, { useEffect, useCallback } from 'react';

const services = [
  {
    id: 'talim',
    title: 'Shivba Talim',
    imageLabel: 'Fitness Center',
    icon: '⚡',
    tagline: 'State-of-the-art equipment…',
    bullets: [
      'Modern fitness equipment',
      'Personal training sessions',
      'Group workout classes'
    ],
    cta: 'Join Talim',
    layout: 'image-left',
    shortcut: '1'
  },
  {
    id: 'hostel',
    title: 'Shivba Hostel',
    imageLabel: 'Hostel Room',
    icon: '🏠',
    tagline: 'Connect with like-minded individuals…',
    bullets: [
      'Comfortable accommodation',
      '24/7 security',
      'High-speed internet'
    ],
    cta: 'Explore Hostel',
    layout: 'image-right',
    shortcut: '2'
  },
  {
    id: 'library',
    title: 'Shivba Library',
    imageLabel: 'Library Books',
    icon: '📚',
    tagline: 'Expand your mind with our collection…',
    bullets: [
      'Extensive book collection',
      'Digital resources',
      'Quiet study spaces'
    ],
    cta: 'Visit Library',
    layout: 'image-left',
    shortcut: '3'
  },
  {
    id: 'awareness',
    title: 'Social Awareness',
    imageLabel: 'Community Event',
    icon: '🤝',
    tagline: 'Participate in workshops, seminars…',
    bullets: [
      'Weekly workshops',
      'Community events',
      'Skill development'
    ],
    cta: 'View Events',
    layout: 'image-right',
    shortcut: '4',
    // ADDED: The external link for this specific service
    externalLink: 'https://socialawarenessfoundation.com/' 
  }
];

function ServicesPage({ setPage }) {
  const handlePrimaryClick = useCallback(
    (service) => {
      if (service.id === 'awareness') {
        setPage({ name: 'events' });
      } else {
        setPage({
          name: 'service-detail',
          params: { id: service.id }
        });
      }
    },
    [setPage]
  );

  // UPDATED: Logic to handle external links
  const handleLearnMore = useCallback(
    (service) => {
      // Check if this service has an external link configured
      if (service.externalLink) {
        window.open(service.externalLink, '_blank');
        return;
      }

      // Default behavior for other services
      if (service.id === 'awareness') {
        setPage({ name: 'events' });
      } else {
        setPage({
          name: 'service-detail',
          params: { id: service.id }
        });
      }
    },
    [setPage]
  );

  // Keyboard shortcuts only on Services page
  useEffect(() => {
    const handler = (e) => {
      // ignore when typing
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      // Alt + 1/2/3/4 => trigger primary button for each service
      if (e.altKey) {
        const svc = services.find((s) => s.shortcut === e.key);
        if (svc) {
          e.preventDefault();
          handlePrimaryClick(svc);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrimaryClick]);

  const handleContactClick = () => {
    setPage({ name: 'contact' });
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50">
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>Our Services</h1>
          <p>
            Comprehensive programs designed to nurture your physical, mental,
            and social well-being.
          </p>
        </div>
      </section>

      <section className="services-list">
        <div className="services-list-inner">
          {services.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onPrimaryClick={handlePrimaryClick}
              onLearnMore={handleLearnMore}
            />
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta-inner">
          <h2>Ready to Get Started?</h2>
          <p>
            Join thousands of satisfied members who have transformed their lives
            with Shivba.
          </p>
          <div className="home-hero-buttons">
            <button onClick={() => setPage({ name: 'register' })}>
              Contact Us Today
            </button>
            <button className="outline" onClick={handleContactClick}>
              Talk to Our Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceRow({ service, onPrimaryClick, onLearnMore }) {
  const isImageLeft = service.layout === 'image-left';

  const imageBlock = (
    <div className="service-image">
      <div className="service-image-placeholder">{service.imageLabel}</div>
    </div>
  );

  const textBlock = (
    <div className="service-text">
      <div className="service-icon-circle">{service.icon}</div>
      <h2>
        {service.title}{' '}
        {service.shortcut && (
          <span className="service-shortcut-tag">Alt+{service.shortcut}</span>
        )}
      </h2>
      <p className="service-tagline">{service.tagline}</p>
      <ul>
        {service.bullets.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <div className="service-links">
        <button
          className="service-primary-btn"
          onClick={() => onPrimaryClick(service)}
        >
          {service.cta}
        </button>
        <button
          className="service-secondary-link"
          onClick={() => onLearnMore(service)}
        >
          Learn more →
        </button>
      </div>
    </div>
  );

  return (
    <article className="service-row">
      {isImageLeft ? (
        <>
          {imageBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {imageBlock}
        </>
      )}
    </article>
  );
}

export default ServicesPage;