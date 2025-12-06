import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

function EventRegisterPage({ event, setPage, setModalState }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user lands here directly without selecting an event
  if (!event) {
    return (
      <div className="animate-fadeIn min-h-screen bg-gray-50 py-16">
        <div className="register-page-wrapper">
          <div className="register-card">
            <h1>Event Not Selected</h1>
            <button onClick={() => setPage({ name: 'events' })}>Back to Events</button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          eventId: event.id,
          eventTitle: event.title,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to register.');
      }

      // Success
      setModalState({
        show: true,
        title: 'Registration Successful!',
        message: `Your details for "${event.title}" have been saved to our records.`,
        type: 'success',
      });

      setPage({ name: 'events' });
    } catch (err) {
      setModalState({
        show: true,
        title: 'Registration Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50 py-16">
      <div className="register-page-wrapper">
        <div className="register-card">
          <h1 className="register-title">Register for: {event.title}</h1>
          <p style={{marginBottom:'20px', color:'#666'}}>
            {event.date} • {event.time}
          </p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-field">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="register-field">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="register-field">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Confirm Registration'}
            </button>
            
            <button type="button" className="outline" onClick={() => setPage({ name: 'events' })} style={{marginTop:'10px'}}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EventRegisterPage;