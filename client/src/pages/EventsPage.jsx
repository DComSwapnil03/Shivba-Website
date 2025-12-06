import React, { useMemo, useState, useEffect } from 'react';

const EVENT_CATEGORIES = ['All', 'Wellness', 'Education', 'Culture', 'Fitness'];

// Helper to get today's date in YYYY-MM-DD format
const getTodayStr = () => new Date().toISOString().split('T')[0];

/* --- 1. NEW HELPER: PARSE DATE & TIME STRINGS ---
   This converts "2025-01-20" and "8:00 AM – 9:00 AM" into real Date objects.
   Returns: { start: Date, end: Date, status: 'upcoming'|'ongoing'|'ended' }
*/
const calculateEventStatus = (dateStr, timeStr, currentTime) => {
    try {
        // 1. Parse the Date
        const dateParts = dateStr.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2]);

        // 2. Parse the Time Range (Expected format: "8:00 AM – 9:00 AM")
        // We split by '–' (en-dash) or '-' (hyphen)
        const times = timeStr.split(/[–-]/).map(t => t.trim());
        
        if (times.length < 2) {
            // Fallback: If no end time provided, assume it lasts 1 hour or just check date
            // For this logic to work perfectly, we need a Start and End time.
            // Returning date-only status if format is bad:
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

            if (hours === 12) {
                hours = modifier.toUpperCase() === 'PM' ? 12 : 0;
            } else if (modifier.toUpperCase() === 'PM') {
                hours += 12;
            }
            
            const d = new Date(year, month, day);
            d.setHours(hours, minutes, 0, 0);
            return d;
        };

        const startTime = parseTime(times[0]);
        const endTime = parseTime(times[1]);

        // 3. Compare with Current Time
        if (currentTime < startTime) return 'upcoming';
        if (currentTime >= startTime && currentTime <= endTime) return 'ongoing';
        return 'ended';

    } catch (error) {
        console.error("Time parse error", error);
        return 'upcoming'; // Default fallback
    }
};

const INITIAL_EVENTS = [
  // --- ONGOING EVENT EXAMPLE (Dynamic Time) ---
  // This calculates a time range covering "Now" so you can see it in "Ongoing" immediately
  {
    id: 'fitness-zumba-live',
    title: 'Morning Zumba Blast',
    category: 'Fitness',
    date: getTodayStr(), 
    // Setting time to encompass "now" for demonstration purposes
    time: '6:00 AM – 11:59 PM', 
    location: 'Shivba Main Hall',
    imageUrl: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&w=800',
    shortDescription: 'High energy dance workout happening right now!',
    highlights: ['Live Instructor', 'Free Water', 'Music System'], 
    attendees: 20
  },
  // --- UPCOMING EVENTS ---
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
  // --- PAST EVENT EXAMPLE ---
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

function EventsPage({ setPage, setSelectedEvent }) {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Registration Persistence State
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndedModal, setShowEndedModal] = useState(false);
  const [selectedEndedEvent, setSelectedEndedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // --- 2. NEW STATE: CURRENT TIME TICKER ---
  const [now, setNow] = useState(new Date());

  const [newEvent, setNewEvent] = useState({
    title: '', category: 'Wellness', date: '', time: '', location: '', imageUrl: '', shortDescription: '', notifyUsers: false 
  });

  const isLoggedIn = !!localStorage.getItem('shivba_user_email');

  // --- Load Registered Events ---
  useEffect(() => {
    try {
        const stored = JSON.parse(localStorage.getItem('shivba_registrations') || '[]');
        setRegisteredEventIds(stored);
    } catch (e) { console.error(e); }
  }, []);

  // --- 3. NEW EFFECT: UPDATE TIME EVERY MINUTE ---
  useEffect(() => {
    const timer = setInterval(() => {
        setNow(new Date()); // Update "now" every 30 seconds to refresh the UI
    }, 30000); 

    return () => clearInterval(timer);
  }, []);

  // --- 4. UPDATED MEMO: FILTER BASED ON EXACT TIME ---
  const { ongoingEvents, upcomingEvents, pastEvents } = useMemo(() => {
    let filtered = events;
    if (activeCategory !== 'All') {
      filtered = events.filter((e) => e.category === activeCategory);
    }

    const ongoing = [];
    const upcoming = [];
    const past = [];

    filtered.forEach(evt => {
      // Use the new helper with the "now" state
      const status = calculateEventStatus(evt.date, evt.time, now);
      
      if (status === 'ongoing') {
          ongoing.push(evt);
      } else if (status === 'upcoming') {
          upcoming.push(evt);
      } else {
          past.push(evt);
      }
    });

    // Sorting
    ongoing.sort((a, b) => new Date(a.date) - new Date(b.date)); 
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)); 
    past.sort((a, b) => new Date(b.date) - new Date(a.date)); 

    return { 
        ongoingEvents: ongoing, 
        upcomingEvents: upcoming, 
        pastEvents: past 
    };
  }, [events, activeCategory, now]); // Added 'now' to dependencies

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
    
    // VALIDATION: Ensure time format is correct for our parser
    if (!newEvent.time.includes('-') && !newEvent.time.includes('–')) {
        alert("Please use the time format: 'Start – End' (e.g., 6:00 PM – 7:00 PM) so we can track when it ends.");
        return;
    }

    setIsSubmitting(true);
    try {
        const id = newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
        if (newEvent.notifyUsers) {
            console.log("📨 Sending notifications...");
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
        return (
            <button className="event-register-btn registered" disabled>
               ✓ Registered
            </button>
        );
    }

    return (
        <button
            className={`event-register-btn ${isOngoing ? 'pulse-btn' : ''}`}
            onClick={() => handleRegisterClick(event)}
        >
            {isOngoing ? 'Join Now' : 'Register Now'}
        </button>
    );
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50">
      <style>{`
        .past-event-card { opacity: 0.85; filter: grayscale(30%); transition: all 0.3s ease; }
        .past-event-card:hover { opacity: 1; filter: grayscale(0%); transform: translateY(-5px); }
        .badge-ended { background-color: #6b7280; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
        .badge-ongoing { background-color: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; animation: pulse 2s infinite; }
        
        .event-register-btn.registered { background-color: #10b981; border-color: #10b981; color: white; cursor: default; }
        .event-register-btn.pulse-btn { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); animation: pulse-shadow 2s infinite; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        @keyframes pulse-shadow { 
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); } 
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(234, 88, 12, 0); } 
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); } 
        }

        .event-highlights-list { list-style: none; padding: 0; margin: 15px 0; }
        .event-highlights-list li { padding: 5px 0; border-bottom: 1px solid #eee; font-size: 0.95rem; color: #555; }
        .event-highlights-list li:before { content: '✓'; color: #10b981; margin-right: 10px; font-weight: bold; }
        .file-upload-wrapper { border: 2px dashed #ccc; padding: 20px; text-align: center; border-radius: 8px; cursor: pointer; background: #fafafa; margin-top: 5px; }
        .file-upload-wrapper:hover { border-color: #f97316; background: #fff7ed; }
        .image-preview { width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 10px; border: 1px solid #ddd; }
        
        .notify-checkbox-wrapper { display: flex; align-items: center; gap: 10px; background: #eef2ff; padding: 15px; border-radius: 8px; border: 1px solid #c7d2fe; margin-top: 15px; }
        .notify-checkbox-wrapper input[type="checkbox"] { width: 20px; height: 20px; accent-color: #4f46e5; }
      `}</style>

      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>Events & Workshops</h1>
          <p>Join us for upcoming gatherings or browse our successful past events.</p>
        </div>
      </section>

      <section className="gallery-toolbar">
        <div className="gallery-toolbar-inner">
          <div className="gallery-filters">
            {EVENT_CATEGORIES.map((cat) => (
              <button key={cat} className={'gallery-filter-chip' + (activeCategory === cat ? ' active' : '')} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
          <button className="gallery-add-btn" onClick={handleAddClick}>
            {isLoggedIn ? '+ Add Event' : '🔒 Add Event'}
          </button>
        </div>
      </section>

      {/* --- SECTION 1: ONGOING EVENTS --- */}
      {ongoingEvents.length > 0 && (
        <section className="events-grid-section" style={{background: '#fff7ed'}}>
            <div className="events-grid-inner">
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.5rem'}}>
                    <h2 className="text-2xl font-bold border-l-4 border-red-500 pl-3 m-0">Happening Now</h2>
                    <span className="badge-ongoing">LIVE</span>
                </div>
                
                <div className="events-grid">
                {ongoingEvents.map((event) => (
                    <article key={event.id} className="event-card" style={{border: '2px solid #ef4444'}}>
                    <div className="event-card-image"><img src={event.imageUrl} alt={event.title} loading="lazy" /></div>
                    <div className="event-card-body">
                        <div className="event-card-header-row">
                        <span className="gallery-tag">{event.category}</span>
                        <span className="event-date-pill" style={{color:'#ef4444', fontWeight:'bold'}}>TODAY • {event.time}</span>
                        </div>
                        <h3>{event.title}</h3>
                        <p className="event-location">📍 {event.location}</p>
                        <p className="event-desc">{event.shortDescription}</p>
                        {renderEventButton(event, true)}
                    </div>
                    </article>
                ))}
                </div>
            </div>
        </section>
      )}

      {/* --- SECTION 2: UPCOMING EVENTS --- */}
      <section className="events-grid-section">
        <div className="events-grid-inner">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-orange-500 pl-3">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="gallery-empty">No upcoming events scheduled.</div>
          ) : (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="event-card">
                  <div className="event-card-image"><img src={event.imageUrl} alt={event.title} loading="lazy" /></div>
                  <div className="event-card-body">
                    <div className="event-card-header-row">
                      <span className="gallery-tag">{event.category}</span>
                      <span className="event-date-pill">{event.date} • {event.time}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p className="event-location">📍 {event.location}</p>
                    <p className="event-desc">{event.shortDescription}</p>
                    {renderEventButton(event, false)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 3: PAST EVENTS --- */}
      {pastEvents.length > 0 && (
        <section className="events-grid-section bg-gray-100 pt-10 border-t">
          <div className="events-grid-inner">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-gray-500 pl-3 text-gray-700">Past Events</h2>
            <div className="events-grid">
              {pastEvents.map((event) => (
                <article key={event.id} className="event-card past-event-card">
                  <div className="event-card-image">
                    <img src={event.imageUrl} alt={event.title} loading="lazy" />
                    <div style={{position:'absolute', top:'10px', right:'10px', backgroundColor:'rgba(0,0,0,0.6)', color:'white', padding:'4px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>COMPLETED</div>
                  </div>
                  <div className="event-card-body">
                    <div className="event-card-header-row">
                      <span className="gallery-tag" style={{backgroundColor:'#9ca3af'}}>{event.category}</span>
                      <span className="badge-ended">Ended</span>
                    </div>
                    <h3 className="text-gray-600">{event.title}</h3>
                    <p className="event-location text-gray-500">{event.date} • {event.time}</p>
                    <p className="event-desc text-gray-500">{event.shortDescription}</p>
                    <button className="event-register-btn" style={{ backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }} onClick={() => handlePastEventClick(event)}>View Summary</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="home-cta">
        <div className="home-cta-inner">
          <h2>Want to Host an Event?</h2>
          <div className="home-hero-buttons"><button onClick={handleHostClick}>Get in Touch</button></div>
        </div>
      </section>

      {/* --- ADD EVENT MODAL --- */}
      {showAddModal && (
        <div className="gallery-modal-backdrop" onClick={() => !isSubmitting && setShowAddModal(false)}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Event</h2>
            <form className="gallery-modal-form" onSubmit={handleAddEvent}>
              <label>Title <input type="text" name="title" value={newEvent.title} onChange={handleNewEventChange} required disabled={isSubmitting} /></label>
              <label>Category
                <select name="category" value={newEvent.category} onChange={handleNewEventChange} disabled={isSubmitting}>
                  {EVENT_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div style={{display:'flex', gap:'10px'}}>
                  <label style={{flex:1}}>Date <input type="date" name="date" value={newEvent.date} onChange={handleNewEventChange} required disabled={isSubmitting} /></label>
                  <label style={{flex:1}}>Time (e.g. 2:00 PM – 3:00 PM) <input type="text" name="time" value={newEvent.time} onChange={handleNewEventChange} placeholder="Start PM – End PM" disabled={isSubmitting} /></label>
              </div>
              <label>Location <input type="text" name="location" value={newEvent.location} onChange={handleNewEventChange} disabled={isSubmitting} /></label>
              <label>Event Image
                <div className="file-upload-wrapper">
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: newEvent.imageUrl ? 'none' : 'block'}} required={!newEvent.imageUrl} disabled={isSubmitting} />
                    {newEvent.imageUrl ? (
                        <div style={{position: 'relative'}}>
                            <img src={newEvent.imageUrl} alt="Preview" className="image-preview" />
                            <button type="button" onClick={() => setNewEvent(prev => ({...prev, imageUrl: ''}))} style={{position: 'absolute', top: '15px', right: '5px', background: 'red', color:'white', border:'none', borderRadius:'50%', width:'25px', height:'25px', cursor:'pointer'}} disabled={isSubmitting}>✕</button>
                        </div>
                    ) : (
                        <span style={{color:'#888', fontSize:'0.9rem'}}>Click to upload photo</span>
                    )}
                </div>
              </label>
              <label>Description <input type="text" name="shortDescription" value={newEvent.shortDescription} onChange={handleNewEventChange} disabled={isSubmitting} /></label>
              <div className="notify-checkbox-wrapper">
                  <input type="checkbox" name="notifyUsers" checked={newEvent.notifyUsers} onChange={handleNewEventChange} disabled={isSubmitting} />
                  <div><strong style={{color:'#1e1b4b'}}>Notify All Members?</strong><p style={{fontSize:'0.8rem', color:'#6366f1', margin:0}}>Send an email blast to all registered users.</p></div>
              </div>
              <div className="gallery-modal-actions">
                <button type="button" className="outline" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Publish Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ENDED EVENT MODAL --- */}
      {showEndedModal && selectedEndedEvent && (
        <div className="gallery-modal-backdrop" onClick={() => setShowEndedModal(false)}>
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth:'600px'}}>
            <div style={{position: 'relative'}}>
                <img src={selectedEndedEvent.imageUrl} alt={selectedEndedEvent.title} style={{width:'100%', height:'200px', objectFit:'cover', borderRadius:'8px 8px 0 0', marginBottom:'20px'}} />
                <button onClick={() => setShowEndedModal(false)} style={{position:'absolute', top:'-10px', right:'-10px', background:'white', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer', boxShadow:'0 2px 5px rgba(0,0,0,0.2)'}}>✕</button>
            </div>
            <h2 style={{marginBottom:'5px'}}>{selectedEndedEvent.title}</h2>
            <div style={{display:'flex', gap:'15px', color:'#666', fontSize:'0.9rem', marginBottom:'20px'}}><span>📅 {selectedEndedEvent.date}</span><span>📍 {selectedEndedEvent.location}</span></div>
            <p style={{lineHeight:'1.6', color:'#444'}}>{selectedEndedEvent.shortDescription}</p>
            <div className="gallery-modal-actions" style={{marginTop:'20px'}}>
              <button onClick={() => setShowEndedModal(false)} style={{width:'100%'}}>Close Summary</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;