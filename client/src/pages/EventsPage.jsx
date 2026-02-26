import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION & HELPERS ---
const EVENT_CATEGORIES = ['All', 'Wellness', 'Education', 'Culture', 'Fitness'];

const calculateEventStatus = (dateStr, timeStr, currentTime) => {
    try {
        const dateParts = dateStr.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);

        const times = timeStr.split(/[–-]/).map(t => t.trim());
        
        if (times.length < 2) {
            const evtDate = new Date(year, month, day);
            evtDate.setHours(0,0,0,0);
            const today = new Date(currentTime);
            today.setHours(0,0,0,0);
            if (evtDate.getTime() === today.getTime()) return 'ongoing';
            return evtDate < today ? 'ended' : 'upcoming';
        }

        const parseTime = (timeString) => {
            const [time, modifier] = timeString.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            minutes = parseInt(minutes || 0);
            if (hours === 12) hours = modifier?.toUpperCase() === 'PM' ? 12 : 0;
            else if (modifier?.toUpperCase() === 'PM') hours += 12;
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
        return 'upcoming';
    }
};

// --- SUB-COMPONENT: EVENT CARD ---
const EventCard = ({ event, status, onAction, viewMode }) => {
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleString('default', { month: 'short' });

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`pro-card ${status === 'ongoing' ? 'border-live' : ''}`}
        >
            <div className="card-date-side">
                <span className="month">{month}</span>
                <span className="day">{day}</span>
                {status === 'ongoing' && <div className="live-dot-container"><span className="live-dot" /> LIVE</div>}
            </div>

            <div className="card-image-box">
                <img src={event.imageUrl} alt={event.title} loading="lazy" />
                <span className="category-tag">{event.category}</span>
            </div>

            <div className="card-content">
                <div className="card-header-meta">
                    <span className="time-meta">🕒 {event.time}</span>
                    <span className="location-meta">📍 {event.location}</span>
                </div>
                <h3 className="card-title">{event.title}</h3>
                <p className="card-desc">{event.shortDescription}</p>
                
                <div className="card-footer">
                    {viewMode === 'upcoming' ? (
                        <button className="primary-action-btn" onClick={() => onAction(event)}>
                            {status === 'ongoing' ? 'Join Event' : 'Register Now'}
                        </button>
                    ) : (
                        <button className="secondary-action-btn" onClick={() => onAction(event)}>
                            View Summary
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN PAGE COMPONENT ---
const EventsPage = ({ setPage, setSelectedEvent }) => {
    const [events] = useState(INITIAL_EVENTS);
    const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming' or 'past'
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const status = calculateEventStatus(e.date, e.time, now);
            const categoryMatch = activeCategory === 'All' || e.category === activeCategory;
            const searchMatch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (viewMode === 'upcoming') {
                return categoryMatch && searchMatch && (status === 'ongoing' || status === 'upcoming');
            }
            return categoryMatch && searchMatch && status === 'ended';
        }).sort((a, b) => viewMode === 'upcoming' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
    }, [events, activeCategory, viewMode, searchQuery, now]);

    return (
        <div className="pro-events-container">
            <style>{`
                .pro-events-container { background: #f8f9fa; min-height: 100vh; padding-bottom: 100px; font-family: 'Montserrat', sans-serif; }
                
                /* Hero Section */
                .hero-section { padding: 100px 20px 60px; text-align: center; background: white; border-bottom: 1px solid #eee; }
                .hero-section h1 { font-family: 'Cinzel', serif; font-size: 3rem; color: #1a1a1a; margin-bottom: 15px; }
                
                /* Controls Toolbar */
                .controls-bar { 
                    max-width: 1100px; margin: -30px auto 40px; background: white; 
                    padding: 20px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between;
                }

                .view-tabs { display: flex; background: #f1f1f1; padding: 5px; border-radius: 10px; }
                .tab-btn { padding: 8px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s; color: #666; }
                .tab-btn.active { background: white; color: #000; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

                .search-input { border: 1px solid #ddd; padding: 10px 15px; border-radius: 8px; width: 250px; outline: none; }

                /* Event List */
                .events-list { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 25px; padding: 0 20px; }

                /* Card Design */
                .pro-card { 
                    display: flex; background: white; border-radius: 20px; overflow: hidden; 
                    border: 1px solid #eef0f2; transition: transform 0.3s ease;
                }
                .pro-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(0,0,0,0.07); }
                .border-live { border: 2px solid #ff4757; }

                .card-date-side { 
                    width: 100px; background: #fdfdfd; display: flex; flex-direction: column; 
                    align-items: center; justify-content: center; border-right: 1px solid #f0f0f0;
                }
                .card-date-side .month { color: #ff4757; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; }
                .card-date-side .day { font-size: 2rem; font-weight: 700; color: #2f3542; }

                .card-image-box { width: 240px; position: relative; overflow: hidden; }
                .card-image-box img { width: 100%; height: 100%; object-fit: cover; }
                .category-tag { 
                    position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.9);
                    padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; 
                }

                .card-content { flex: 1; padding: 25px; display: flex; flex-direction: column; }
                .card-header-meta { display: flex; gap: 15px; font-size: 0.8rem; color: #747d8c; margin-bottom: 10px; }
                .card-title { font-size: 1.4rem; color: #2f3542; margin-bottom: 12px; font-family: 'Cinzel', serif; }
                .card-desc { color: #57606f; font-size: 0.95rem; line-height: 1.6; flex: 1; }

                .card-footer { margin-top: 20px; }
                .primary-action-btn { 
                    background: #1a1a1a; color: white; border: none; padding: 12px 25px; 
                    border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s;
                }
                .primary-action-btn:hover { background: #ff4757; }
                .secondary-action-btn { background: none; border: 1px solid #ddd; padding: 10px 20px; border-radius: 8px; cursor: pointer; }

                /* Live Animations */
                .live-dot { height: 8px; width: 8px; background: #ff4757; border-radius: 50%; display: inline-block; margin-right: 5px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

                @media (max-width: 768px) {
                    .pro-card { flex-direction: column; }
                    .card-date-side { width: 100%; flex-direction: row; gap: 10px; padding: 10px; }
                    .card-image-box { width: 100%; height: 200px; }
                }
            `}</style>

            <section className="hero-section">
                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Event Calendar</motion.h1>
                <p>Discover workshops, fitness sessions, and community gatherings.</p>
            </section>

            <div className="controls-bar">
                <div className="view-tabs">
                    <button className={`tab-btn ${viewMode === 'upcoming' ? 'active' : ''}`} onClick={() => setViewMode('upcoming')}>Upcoming</button>
                    <button className={`tab-btn ${viewMode === 'past' ? 'active' : ''}`} onClick={() => setViewMode('past')}>Past Archive</button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="search-input" style={{ width: 'auto' }}>
                        {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                        type="text" 
                        placeholder="Search events..." 
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <main className="events-list">
                <AnimatePresence mode="popLayout">
                    {filteredEvents.map(event => (
                        <EventCard 
                            key={event.id}
                            event={event}
                            status={calculateEventStatus(event.date, event.time, now)}
                            viewMode={viewMode}
                            onAction={(evt) => {
                                setSelectedEvent(evt);
                                setPage({ name: viewMode === 'upcoming' ? 'event-register' : 'event-summary' });
                            }}
                        />
                    ))}
                </AnimatePresence>
                
                {filteredEvents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                        No events found for this selection.
                    </div>
                )}
            </main>
        </div>
    );
};

const INITIAL_EVENTS = [
    {
        id: '1',
        title: 'Morning Zumba Blast',
        category: 'Fitness',
        date: new Date().toISOString().split('T')[0], 
        time: '06:00 AM – 11:59 PM', 
        location: 'Shivba Main Hall',
        imageUrl: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&w=800',
        shortDescription: 'High energy dance workout happening right now in the main hall. Open for all members!',
    },
    {
        id: '2',
        title: 'Tech Career Seminar',
        category: 'Education',
        date: '2026-03-15',
        time: '10:00 AM – 12:00 PM',
        location: 'Virtual Zoom',
        imageUrl: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&w=800',
        shortDescription: 'Join industry experts to discuss the future of MERN stack development.',
    }
];

export default EventsPage;