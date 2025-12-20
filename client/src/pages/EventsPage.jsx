import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. CONFIGURATION & HELPERS ---
const EVENT_CATEGORIES = ['All', 'Wellness', 'Education', 'Culture', 'Fitness'];
const getTodayStr = () => new Date().toISOString().split('T')[0];

/* --- Date/Time Parser Logic (Preserved) --- */
const calculateEventStatus = (dateStr, timeStr, currentTime) => {
    try {
        const dateParts = dateStr.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; 
        const day = parseInt(dateParts[2]);

        const times = timeStr.split(/[–-]/).map(t => t.trim());
        
        if (times.length < 2) {
            const evtDate = new Date(year, month, day);
            const today = new Date();
            evtDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            if (evtDate.getTime() === today.getTime()) return 'ongoing'; 
            return evtDate < today ? 'ended' : 'upcoming';
        }

        const parseTime = (timeString) => {
            const [time, modifier] = timeString.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            minutes = parseInt(minutes);
            if (hours === 12) hours = modifier.toUpperCase() === 'PM' ? 12 : 0;
            else if (modifier.toUpperCase() === 'PM') hours += 12;
            const d = new Date(year, month, day);
            d.setHours(hours, minutes, 0, 0);
            return d;
        };

        const startTime = parseTime(times[0]);
        const endTime = parseTime(times[1]);

        if (currentTime < startTime) return 'upcoming';
        if (currentTime >= startTime && currentTime <= endTime) return 'ongoing';
        return 'ended';

    } catch (error) {
        console.error("Time parse error", error);
        return 'upcoming'; 
    }
};

const INITIAL_EVENTS = [
  {
    id: 'fitness-zumba-live',
    title: 'Morning Zumba Blast',
    category: 'Fitness',
    date: getTodayStr(), 
    time: '6:00 AM – 11:59 PM', 
    location: 'Shivba Main Hall',
    imageUrl: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&w=800',
    shortDescription: 'High energy dance workout happening right now!',
    highlights: ['Live Instructor', 'Free Water', 'Music System'], 
    attendees: 20
  },
  {
    id: 'wellness-yoga-camp',
    title: 'Weekend Yoga Camp',
    category: 'Wellness',
    date: '2025-01-20',
    time: '7:00 AM – 10:00 AM',
    location: 'Shivba Talim Hall',
    imageUrl: 'https://images.pexels.com/photos/3823063/pexels-photo-3823063.jpeg?auto=compress&w=800',
    shortDescription: 'Guided yoga and breathing sessions for all levels.',
    highlights: ['Pranayama', 'Asana Practice', 'Healthy Breakfast'], 
    attendees: 45
  },
  {
    id: 'education-career-talk',
    title: 'Career Guidance Talk',
    category: 'Education',
    date: '2025-02-05',
    time: '5:30 PM – 7:00 PM',
    location: 'Community Library Room',
    imageUrl: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&w=800',
    shortDescription: 'Experts share tips on education and careers.',
    highlights: ['Expert Panel', 'Q&A Session', 'Free Resources'],
    attendees: 120
  },
  {
    id: 'past-marathon',
    title: 'Annual Shivba Marathon',
    category: 'Fitness',
    date: '2024-11-15',
    time: '6:00 AM – 11:00 AM',
    location: 'City Center Start Point',
    imageUrl: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&w=800',
    shortDescription: 'A 5k and 10k run for community health.',
    highlights: ['500+ Participants', 'Medal Distribution', 'Community Breakfast'],
    attendees: 520,
    status: 'ended'
  },
];

// --- 2. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

function EventsPage({ setPage, setSelectedEvent }) {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndedModal, setShowEndedModal] = useState(false);
  const [selectedEndedEvent, setSelectedEndedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [now, setNow] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '', category: 'Wellness', date: '', time: '', location: '', imageUrl: '', shortDescription: '', notifyUsers: false 
  });

  const isLoggedIn = !!localStorage.getItem('shivba_user_email');

  useEffect(() => {
    try {
        const stored = JSON.parse(localStorage.getItem('shivba_registrations') || '[]');
        setRegisteredEventIds(stored);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => { setNow(new Date()); }, 30000); 
    return () => clearInterval(timer);
  }, []);

  const { ongoingEvents, upcomingEvents, pastEvents } = useMemo(() => {
    let filtered = events;
    if (activeCategory !== 'All') {
      filtered = events.filter((e) => e.category === activeCategory);
    }

    const ongoing = [];
    const upcoming = [];
    const past = [];

    filtered.forEach(evt => {
      const status = calculateEventStatus(evt.date, evt.time, now);
      if (status === 'ongoing') ongoing.push(evt);
      else if (status === 'upcoming') upcoming.push(evt);
      else past.push(evt);
    });

    ongoing.sort((a, b) => new Date(a.date) - new Date(b.date)); 
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)); 
    past.sort((a, b) => new Date(b.date) - new Date(a.date)); 

    return { ongoingEvents: ongoing, upcomingEvents: upcoming, pastEvents: past };
  }, [events, activeCategory, now]);

  const handleAddClick = () => {
    if (isLoggedIn) {
      setNewEvent({ title: '', category: 'Wellness', date: '', time: '', location: '', imageUrl: '', shortDescription: '', notifyUsers: false });
      setShowAddModal(true);
    } else {
      const confirmLogin = window.confirm("You must be signed in to add an event. Go to login page?");
      if (confirmLogin) setPage({ name: 'account' });
    }
  };

  const handleNewEventChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setNewEvent((prev) => ({ ...prev, imageUrl: reader.result })); };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.imageUrl) return;
    if (!newEvent.time.includes('-') && !newEvent.time.includes('–')) {
        alert("Please use the time format: 'Start – End' (e.g., 6:00 PM – 7:00 PM)");
        return;
    }

    setIsSubmitting(true);
    try {
        const id = newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
        if (newEvent.notifyUsers) {
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            alert(`Success! Event published and notifications sent.`);
        }
        setEvents((prev) => [...prev, { id, ...newEvent, highlights: [], attendees: 0 }]);
        setShowAddModal(false);
    } catch (err) { alert("Error publishing event."); } finally { setIsSubmitting(false); }
  };

  const handleRegisterClick = (event) => {
    if (registeredEventIds.includes(event.id)) return;
    setSelectedEvent(event);
    setPage({ name: 'event-register' });
    window.scrollTo(0, 0);
  };

  const handlePastEventClick = (event) => {
    setSelectedEndedEvent(event);
    setShowEndedModal(true);
  };

  const handleHostClick = () => { setPage({ name: 'contact' }); };

  const renderEventButton = (event, isOngoing = false) => {
    const isRegistered = registeredEventIds.includes(event.id);
    if (isRegistered) {
        return <button className="event-btn registered" disabled>✓ Registered</button>;
    }
    return (
        <button
            className={`event-btn ${isOngoing ? 'pulse-btn' : ''}`}
            onClick={() => handleRegisterClick(event)}
        >
            {isOngoing ? 'Join Now' : 'Register Now'}
        </button>
    );
  };

  return (
    <motion.div 
      className="events-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        /* 1. Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* 2. Global Type */
        .events-container h1, 
        .events-container h2,
        .events-container h3,
        .gallery-modal h2 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }

        .events-container p, 
        .events-container span, 
        .events-container button, 
        .events-container label, 
        .events-container input,
        .gallery-filter-chip {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* 3. Hero */
        .events-hero {
            padding: 4rem 2rem;
            text-align: center;
            background: #1a1a1a;
            color: white;
            margin-bottom: 2rem;
        }
        .events-hero h1 { font-size: 3rem; margin-bottom: 0.5rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .events-hero p { font-size: 1.1rem; color: #ccc; max-width: 600px; margin: 0 auto; }

        /* 4. Toolbar */
        .gallery-toolbar {
            padding: 1rem 2rem;
            max-width: 1200px; margin: 0 auto 2rem;
            display: flex; justify-content: space-between; align-items: center;
            flex-wrap: wrap; gap: 1rem;
        }
        .gallery-filters { display: flex; gap: 10px; flex-wrap: wrap; }
        .gallery-filter-chip {
            padding: 8px 16px; border-radius: 20px; border: 1px solid #ddd;
            background: white; cursor: pointer; transition: all 0.3s;
            font-size: 0.9rem;
        }
        .gallery-filter-chip.active, .gallery-filter-chip:hover {
            background: #1a1a1a; color: white; border-color: #1a1a1a;
        }
        body.dark-mode .gallery-filter-chip { background: #333; color: #ccc; border-color: #444; }
        body.dark-mode .gallery-filter-chip.active { background: #FFA500; color: #000; }

        .add-event-btn {
            background: #FFA500; color: white; border: none; padding: 10px 20px;
            border-radius: 8px; font-weight: 600; cursor: pointer; text-transform: uppercase;
            font-size: 0.85rem; letter-spacing: 0.05em; transition: transform 0.2s;
        }
        .add-event-btn:hover { transform: translateY(-2px); }

        /* 5. Grid Layout */
        .events-section { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        .events-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        /* 6. Event Card */
        .event-card {
            background: white; border-radius: 12px; overflow: hidden;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            display: flex; flex-direction: column; height: 100%;
        }
        .event-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
        
        body.dark-mode .event-card { background: #1e1e1e; border: 1px solid #333; }

        .event-image { height: 200px; width: 100%; object-fit: cover; }
        .event-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        
        .event-meta { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.8rem; color: #666; }
        .event-category { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
        
        .event-card h3 { font-size: 1.4rem; margin-bottom: 0.5rem; color: #1a1a1a; }
        body.dark-mode .event-card h3 { color: #fff; }
        
        .event-location { font-size: 0.9rem; color: #888; margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }
        .event-desc { font-size: 0.95rem; color: #555; margin-bottom: 1.5rem; flex: 1; line-height: 1.5; }
        body.dark-mode .event-desc { color: #aaa; }

        .event-btn {
            width: 100%; padding: 12px; border: none; border-radius: 6px;
            background: #1a1a1a; color: white; font-weight: 600; cursor: pointer;
            text-transform: uppercase; letter-spacing: 0.05em; transition: background 0.3s;
        }
        .event-btn:hover { background: #FFA500; color: black; }
        .event-btn.registered { background: #10b981; cursor: default; color: white; }
        .event-btn.pulse-btn { 
            background: #ef4444; animation: pulse-shadow 2s infinite; 
        }
        @keyframes pulse-shadow {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        /* 7. Badges */
        .badge-live { 
            background: #ef4444; color: white; padding: 4px 10px; 
            border-radius: 20px; font-size: 0.7rem; font-weight: bold; 
            text-transform: uppercase; animation: pulse 2s infinite; 
        }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .badge-ended {
            background: #6b7280; color: white; padding: 4px 8px;
            border-radius: 4px; font-size: 0.7rem; font-weight: bold;
            text-transform: uppercase;
        }
        .past-card { opacity: 0.8; filter: grayscale(0.5); }
        .past-card:hover { opacity: 1; filter: grayscale(0); }

        /* 8. Modal Styles */
        .modal-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7);
            display: flex; align-items: center; justify-content: center; z-index: 1000;
            backdrop-filter: blur(5px);
        }
        .gallery-modal {
            background: white; width: 90%; max-width: 500px; padding: 2rem;
            border-radius: 16px; position: relative; max-height: 90vh; overflow-y: auto;
        }
        body.dark-mode .gallery-modal { background: #1e1e1e; color: white; }
        
        .gallery-modal input, .gallery-modal select {
            width: 100%; padding: 10px; margin-top: 5px; margin-bottom: 15px;
            border: 1px solid #ddd; border-radius: 6px;
        }
        .gallery-modal label { font-size: 0.9rem; font-weight: 600; display: block; }
        
        /* 9. CTA */
        .events-cta {
            background: #f9fafb; padding: 4rem 2rem; text-align: center; margin-top: 4rem;
        }
        body.dark-mode .events-cta { background: #111; }
      `}</style>

      {/* --- HERO --- */}
      <section className="events-hero">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <h1>Events & Workshops</h1>
          <p>Join us for upcoming gatherings or browse our successful past events.</p>
        </motion.div>
      </section>

      {/* --- TOOLBAR --- */}
      <div className="gallery-toolbar">
        <div className="gallery-filters">
          {EVENT_CATEGORIES.map((cat) => (
            <button 
                key={cat} 
                className={`gallery-filter-chip ${activeCategory === cat ? 'active' : ''}`} 
                onClick={() => setActiveCategory(cat)}
            >
                {cat}
            </button>
          ))}
        </div>
        <button className="add-event-btn" onClick={handleAddClick}>
          {isLoggedIn ? '+ Add Event' : '🔒 Add Event'}
        </button>
      </div>

      {/* --- ONGOING EVENTS --- */}
      {ongoingEvents.length > 0 && (
        <section className="events-section" style={{ background: '#fff7ed', borderRadius: '16px', marginBottom: '2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'15px', marginBottom:'1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#ea580c', margin: 0 }}>Happening Now</h2>
                <span className="badge-live">LIVE</span>
            </div>
            <motion.div className="events-grid" variants={containerVariants} initial="hidden" animate="visible">
                {ongoingEvents.map((event) => (
                    <motion.article key={event.id} className="event-card" style={{ border: '2px solid #ef4444' }} variants={cardVariants}>
                        <img src={event.imageUrl} alt={event.title} className="event-image" />
                        <div className="event-body">
                            <div className="event-meta">
                                <span className="event-category">{event.category}</span>
                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Ends: {event.time.split('–')[1] || 'Soon'}</span>
                            </div>
                            <h3>{event.title}</h3>
                            <p className="event-location">📍 {event.location}</p>
                            <p className="event-desc">{event.shortDescription}</p>
                            {renderEventButton(event, true)}
                        </div>
                    </motion.article>
                ))}
            </motion.div>
        </section>
      )}

      {/* --- UPCOMING EVENTS --- */}
      <section className="events-section">
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', borderLeft: '5px solid #1a1a1a', paddingLeft: '15px' }}>Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No upcoming events currently scheduled.</p>
        ) : (
            <motion.div className="events-grid" variants={containerVariants} initial="hidden" animate="visible">
                {upcomingEvents.map((event) => (
                    <motion.article key={event.id} className="event-card" variants={cardVariants}>
                        <img src={event.imageUrl} alt={event.title} className="event-image" />
                        <div className="event-body">
                            <div className="event-meta">
                                <span className="event-category">{event.category}</span>
                                <span>{event.date}</span>
                            </div>
                            <h3>{event.title}</h3>
                            <p className="event-location">📍 {event.location} • {event.time}</p>
                            <p className="event-desc">{event.shortDescription}</p>
                            {renderEventButton(event, false)}
                        </div>
                    </motion.article>
                ))}
            </motion.div>
        )}
      </section>

      {/* --- PAST EVENTS --- */}
      {pastEvents.length > 0 && (
        <section className="events-section" style={{ borderTop: '1px solid #eee', paddingTop: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#666' }}>Past Events</h2>
            <div className="events-grid">
                {pastEvents.map((event) => (
                    <article key={event.id} className="event-card past-card">
                        <div style={{ position: 'relative' }}>
                            <img src={event.imageUrl} alt={event.title} className="event-image" />
                            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>ENDED</div>
                        </div>
                        <div className="event-body">
                            <div className="event-meta">
                                <span className="event-category">{event.category}</span>
                                <span>{event.date}</span>
                            </div>
                            <h3 style={{ color: '#666' }}>{event.title}</h3>
                            <p className="event-desc">{event.shortDescription}</p>
                            <button className="event-btn" style={{ background: 'transparent', color: '#1a1a1a', border: '1px solid #ddd' }} onClick={() => handlePastEventClick(event)}>
                                View Summary
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
      )}

      {/* --- CTA --- */}
      <section className="events-cta">
        <h2>Want to Host an Event?</h2>
        <button className="add-event-btn" style={{ fontSize: '1rem', marginTop: '1rem' }} onClick={handleHostClick}>Get in Touch</button>
      </section>

      {/* --- ADD MODAL --- */}
      <AnimatePresence>
        {showAddModal && (
            <motion.div className="modal-backdrop" onClick={() => !isSubmitting && setShowAddModal(false)} initial="hidden" animate="visible" exit="exit">
                <motion.div className="gallery-modal" onClick={e => e.stopPropagation()} variants={modalVariants}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Publish New Event</h2>
                    <form onSubmit={handleAddEvent}>
                        <label>Event Title</label>
                        <input type="text" name="title" value={newEvent.title} onChange={handleNewEventChange} required disabled={isSubmitting} />
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label>Category</label>
                                <select name="category" value={newEvent.category} onChange={handleNewEventChange} disabled={isSubmitting}>
                                    {EVENT_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Date</label>
                                <input type="date" name="date" value={newEvent.date} onChange={handleNewEventChange} required disabled={isSubmitting} />
                            </div>
                        </div>

                        <label>Time (Format: 2:00 PM – 4:00 PM)</label>
                        <input type="text" name="time" value={newEvent.time} onChange={handleNewEventChange} placeholder="Start PM – End PM" required disabled={isSubmitting} />

                        <label>Location</label>
                        <input type="text" name="location" value={newEvent.location} onChange={handleNewEventChange} required disabled={isSubmitting} />

                        <label>Image Upload</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ border: '1px dashed #ccc', padding: '20px' }} required={!newEvent.imageUrl} disabled={isSubmitting} />
                        
                        <label style={{ marginTop: '10px' }}>Short Description</label>
                        <input type="text" name="shortDescription" value={newEvent.shortDescription} onChange={handleNewEventChange} required disabled={isSubmitting} />

                        <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px', marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input type="checkbox" name="notifyUsers" checked={newEvent.notifyUsers} onChange={handleNewEventChange} style={{ width: '20px', margin: 0 }} disabled={isSubmitting} />
                            <div>
                                <strong style={{ fontSize: '0.9rem' }}>Notify Members?</strong>
                                <p style={{ fontSize: '0.75rem', margin: 0, color: '#166534' }}>Send email blast to all users.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#eee', color: '#333' }} disabled={isSubmitting}>Cancel</button>
                            <button type="submit" style={{ flex: 1, background: '#1a1a1a', color: 'white' }} disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Publish'}</button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- PAST EVENT MODAL --- */}
      <AnimatePresence>
        {showEndedModal && selectedEndedEvent && (
            <motion.div className="modal-backdrop" onClick={() => setShowEndedModal(false)} initial="hidden" animate="visible" exit="exit">
                <motion.div className="gallery-modal" onClick={e => e.stopPropagation()} variants={modalVariants}>
                    <img src={selectedEndedEvent.imageUrl} alt={selectedEndedEvent.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                    <h2>{selectedEndedEvent.title}</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Ended on {selectedEndedEvent.date}</p>
                    <p style={{ lineHeight: '1.6' }}>{selectedEndedEvent.shortDescription}</p>
                    
                    <h3 style={{ fontSize: '1rem', marginTop: '1.5rem' }}>Highlights</h3>
                    <ul style={{ paddingLeft: '20px', color: '#555' }}>
                        {selectedEndedEvent.highlights && selectedEndedEvent.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>

                    <button onClick={() => setShowEndedModal(false)} style={{ width: '100%', background: '#1a1a1a', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', marginTop: '1.5rem', cursor: 'pointer' }}>Close</button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default EventsPage;