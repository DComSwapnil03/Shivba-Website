import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function ContactPage({ setModalState }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send message.');
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      setModalState({
        show: true,
        title: 'Message Sent!',
        message: 'Thank you for contacting us. We will get back to you soon.',
        type: 'success'
      });
    } catch (error) {
      setModalState({
        show: true,
        title: 'Submission Error',
        message: error.message,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMaps = () => {
    const url =
      'https://www.google.com/maps/place/Indian+innovators+education+hub/@18.7511673,73.825898,14z/data=!4m10!1m2!2m1!1sQV36+PQF,+Chakan+Shikrapur+Rd,+Manik+Chowk,+Chakan,+Maharashtra+410501!3m6!1s0x3bc2c9afeabaa667:0x26590d8b0a09bc5!8m2!3d18.7543005!4d73.8619113!15sCkZRVjM2IFBRRiwgQ2hha2FuIFNoaWtyYXB1ciBSZCwgTWFuaWsgQ2hvd2ssIENoYWthbiwgTWFoYXJhc2h0cmEgNDEwNTAxWkQiQnF2MzYgcHFmIGNoYWthbiBzaGlrcmFwdXIgcmQgbWFuaWsgY2hvd2sgY2hha2FuIG1haGFyYXNodHJhIDQxMDUwMZIBB2xpYnJhcnmaASNDaFpEU1VoTk1HOW5TMFZKUTBGblNVUnRORGN5ZFdKQkVBReABAPoBBAgWECo!16s%2Fg%2F11ppp6mx7m?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D';
    window.open(url, '_blank');
  };

  const callPhone = () => {
    window.location.href = 'tel:+919767234353';
  };

  const openWhatsApp = () => {
    const url = 'https://wa.me/919767234353';
    window.open(url, '_blank');
  };

  const sendEmail = () => {
    window.location.href = 'mailto:revolution2020.saf@gmail.com';
  };

  const scrollToForm = () => {
    const el = document.getElementById('contact-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>Get In Touch</h1>
          <p>
            We&apos;d love to hear from you. Send us a message and we&apos;ll
            respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Four info cards row */}
      <section className="contact-info-row">
        <div className="contact-info-inner">
          <InfoCard
            title="Visit Us"
            subtitle="Jadhav Commercial Centre, Pune"
            icon="📍"
            onClick={openMaps}
            variant="primary"
          />
          <InfoCard
            title="Call Us"
            subtitle="+91 97672 34353"
            icon="📞"
            onClick={callPhone}
            onAltClick={openWhatsApp}
            helper="Right‑click / long press for WhatsApp"
          />
          <InfoCard
            title="Email Us"
            subtitle="revolution2020.saf@gmail.com"
            icon="✉️"
            onClick={sendEmail}
          />
          <InfoCard
            title="Opening Hours"
            subtitle="Mon - Sun: 6:00 AM - 10:00 PM"
            icon="⏰"
            onClick={scrollToForm}
          />
        </div>
      </section>

      {/* Form + map section */}
      <section id="contact-form-section" className="contact-main">
        <div className="contact-main-inner">
          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form-grid">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="contact-map-card">
            <h2>Find Us On The Map</h2>
            <div className="contact-map-frame">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.601712079144!2d73.81890161489585!3d18.72596998728867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c9e64e33f3c3%3A0x6a0f12836c2f306!2sJadhav%20Commercial%20Complex!5e0!3m2!1sen!2sin!4v1678888888888!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shivba Location Map"
              ></iframe>
            </div>
            <p className="contact-map-caption">
              QV36+PQF, Chakan Shikrapur Rd, Manik Chowk, Chakan, Maharashtra 410501
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, subtitle, onClick, onAltClick, helper, variant }) {
  const handleClick = (e) => {
    if (onAltClick && (e.button === 2 || e.ctrlKey)) {
      // right click / ctrl+click
      e.preventDefault();
      onAltClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={
        'contact-info-card' + (variant === 'primary' ? ' contact-info-card-primary' : '')
      }
      onClick={handleClick}
      onContextMenu={(e) => {
        if (onAltClick) {
          e.preventDefault();
          onAltClick();
        }
      }}
    >
      <div className="contact-info-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      {helper && <p className="contact-info-helper">{helper}</p>}
    </div>
  );
}

export default ContactPage;
