import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. CONFIGURATION & DATA ---
const CATEGORIES = ['All', 'Gym', 'Event', 'Library', 'Community'];

const ACHIEVERS_DATA = [
  { id: 'a1', name: "Akshay Gaikwad", role: "PSI (MPSC)", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.26 AM.jpeg" },
  { id: 'a2', name: "Vaibhav Munde", role: "Assistant Engineer", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.27 AM (1).jpeg" },
  { id: 'a3', name: "Sachin Shinde", role: "Prison Department", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.27 AM (2).jpeg" },
  // { id: 'a4', name: "Somnath Gite", role: "Tax Assistant", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.27 AM (3).jpeg" },
  { id: 'a5', name: "SHUBHAM DATTATRAY", role: "REVENUE ASSISTANT", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.27 AM.jpeg" },
  { id: 'a6', name: "RUTUJA KAD ", role: "ASO", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.28 AM (1).jpeg" },
  { id: 'a7', name: "PRIYANKA GITE", role: "CONSTABLE", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.28 AM (2).jpeg" },
  { id: 'a8', name: "Hakim, Sunil & Akshay", role: "MAHARASHTRA POLICE", imageUrl: "/HAKIM SUTAR, SUNIL HANDE & AKSHAY MORE.jpeg" },
  { id: 'a9', name: "Sachin & Saurabh", role: "MAHARASHTRA POLICE", imageUrl: "/SACHIN JADHAV & SAURABH JADHAV.jpeg" },
  { id: 'a10', name: "Kishor Phad", role: "MAHARASHTRA POLICE", imageUrl: "/WhatsApp Image 2026-04-08 at 12.35.08 AM.jpeg" }
];

const INITIAL_PHOTOS = [
  { id: 7, category: 'Library', title: 'Library Area', url: '/IMG-20251226-WA0005.jpg' },
  { id: 26, category: 'Library', title: 'Select on MPSC', url: '/IMG-20251226-WA0018.jpg' },
  { id: 11, category: 'Gym', title: 'Equipment Tour', url: '/VID-20251226-WA0006.mp4' },
  { id: 18, category: 'Gym', title: 'Entrance View', url: '/IMG-20251226-WA0026.jpg' },
  { id: 19, category: 'Gym', title: 'Reception Area', url: '/IMG-20251226-WA0025.jpg' },
  { id: 20, category: 'Gym', title: 'Gym Interior', url: '/IMG-20251226-WA0024.jpg' },
  { id: 21, category: 'Gym', title: 'Cardio Section', url: '/IMG-20251226-WA0023.jpg' },
  { id: 27, category: 'Event', title: 'Award Distribution', url: '/IMG-20251226-WA0017.jpg' },
  { id: 33, category: 'Community', title: 'Office', url: '/IMG-20251226-WA0012.jpg' },
  { id: 39, category: 'Library', title: 'Overview', url: '/IMG-20251226-WA0006.jpg' },
  { id: 8, category: 'Event', title: 'Event Highlight', url: '/VID-20251226-WA0009.mp4' },
  { id: 9, category: 'Event', title: 'Training Session', url: '/VID-20251226-WA0008.mp4' },
  { id: 12, category: 'Event', title: 'Opening Ceremony', url: '/VID-20251226-WA0005.mp4' },
  { id: 15, category: 'Event', title: 'Stage Performance', url: '/IMG-20251226-WA0028.jpg' },
  { id: 16, category: 'Event', title: 'Yoga', url: '/IMG-20251226-WA0027.jpg' },
  { id: 17, category: 'Event', title: 'Crowd Cheering', url: '/VID-20251226-WA0004.mp4' },
  { id: 23, category: 'Event', title: 'Preparation', url: '/IMG-20251226-WA0021.jpg' },
  { id: 24, category: 'Event', title: 'Lighting Ceremony', url: '/IMG-20251226-WA0020.jpg' },
  { id: 25, category: 'Event', title: 'Audience', url: '/IMG-20251226-WA0019.jpg' },
  { id: 30, category: 'Event', title: 'Prize Giving', url: '/IMG-20251226-WA0014.jpg' },
  { id: 31, category: 'Event', title: 'Highlights', url: '/VID-20251226-WA0003.mp4' },
  { id: 34, category: 'Event', title: 'Flash Mob', url: '/VID-20251226-WA0002.mp4' },
  { id: 37, category: 'Event', title: 'Setup Day', url: '/IMG-20251226-WA0009.jpg' },
  { id: 38, category: 'Event', title: 'Evening View', url: '/IMG-20251226-WA0007.jpg' },
  { id: 10, category: 'Community', title: 'Group Activity', url: '/VID-20251226-WA0007.mp4' },
  { id: 13, category: 'Community', title: 'Member Gathering', url: '/IMG-20251226-WA0030.jpg' },
  { id: 14, category: 'Community', title: 'Shivba', url: '/IMG-20251226-WA0029.jpg' },
  { id: 22, category: 'Community', title: 'Volunteers', url: '/IMG-20251226-WA0022.jpg' },
  { id: 28, category: 'Community', title: 'Maharashtra Police', url: '/IMG-20251226-WA0016.jpg' },
  { id: 29, category: 'Community', title: 'Celebration', url: '/IMG-20251226-WA0015.jpg' },
  { id: 32, category: 'Community', title: 'Social Activity', url: '/IMG-20251226-WA0013.jpg' },
  { id: 35, category: 'Community', title: 'Blood Donation', url: '/IMG-20251226-WA0011.jpg' },
  { id: 36, category: 'Community', title: 'Health Camp', url: '/IMG-20251226-WA0010.jpg' },
];

// --- 2. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const floatingBarVariants = {
  hidden: { y: 150, x: "-50%", opacity: 0 },
  visible: { y: 0, x: "-50%", opacity: 1, transition: { type: "spring", stiffness: 250, damping: 25 } },
  exit: { y: 150, x: "-50%", opacity: 0, transition: { duration: 0.3 } }
};

function GalleryPage({ setPage }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [newPhoto, setNewPhoto] = useState({ title: '', category: 'Gym', url: '' });
  const [filePreview, setFilePreview] = useState(null);
  
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const toolbarRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem('shivba_user_email');
  const canDelete = isLoggedIn;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" } 
    );

    if (toolbarRef.current) {
      observer.observe(toolbarRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'All') return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory]);

  const handleAddClick = () => {
    if (isLoggedIn) {
      setNewPhoto({ title: '', category: 'Gym', url: '' });
      setFilePreview(null);
      setShowAddModal(true);
    } else {
      const confirmLogin = window.confirm("You must be signed in to add/delete photos. Go to login page?");
      if (confirmLogin && setPage) setPage({ name: 'account' });
    }
  };

  const handleAddPhotoChange = (e) => {
    const { name, value } = e.target;
    setNewPhoto((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
      setNewPhoto((prev) => ({ ...prev, url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhoto.title || !newPhoto.url) return;
    const nextId = photos.length ? Math.max(...photos.map((p) => p.id)) + 1 : 1;
    setPhotos((prev) => [{ id: nextId, ...newPhoto }, ...prev]);
    setShowAddModal(false);
  };

  const handleDeletePhoto = (id) => {
    if (!canDelete) return;
    if (window.confirm("Are you sure you want to delete this photo?")) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        if(selectedMedia?.id === id) setSelectedMedia(null);
    }
  };

  const isVideo = (url) => {
    return url && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm'));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* --- GLOBAL & HERO --- */
        .gallery-container { min-height: 100vh; padding-bottom: 120px; }
        .gallery-container h1, .gallery-container h2, .gallery-card h3, .achievers-section h2 { font-family: 'Cinzel', serif !important; letter-spacing: 0.05em; }
        .gallery-container p, button, span, label, input, select { font-family: 'Montserrat', sans-serif !important; }

        .gallery-hero {
            padding: 5rem 2rem 3rem; text-align: center;
            background: #121212; color: white;
            position: relative; overflow: hidden;
        }
        .gallery-hero::before {
            content: ''; position: absolute; top:0; left:0; width:100%; height:100%;
            background: radial-gradient(circle at center, #222 0%, #121212 70%); opacity: 0.5;
        }
        .gallery-hero h1 { font-size: 3.5rem; margin-bottom: 0.5rem; position: relative; z-index: 2; color: #fff; }
        .gallery-hero p { font-size: 1.2rem; color: #aaa; position: relative; z-index: 2; }

        /* --- NEW: UPGRADED ACHIEVERS HALL OF FAME --- */
        .achievers-section {
            padding: 4rem 2rem 5rem;
            background: #fdfdfd;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        body.dark-mode .achievers-section { background: #111; border-color: #222; }
        
        .achievers-section h2 { color: #1a1a1a; font-size: 2.5rem; margin-bottom: 0.5rem; }
        body.dark-mode .achievers-section h2 { color: #fff; }
        
        .achievers-section p { color: #666; margin-bottom: 3rem; font-size: 1.1rem; }
        body.dark-mode .achievers-section p { color: #aaa; }

        .achievers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 3rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        .achiever-card {
            background: white;
            border: 1px solid #eee;
            border-radius: 16px;
            position: relative; /* Needed for overlapping badge */
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            cursor: pointer;
        }
        body.dark-mode .achiever-card { background: #1e1e1e; border-color: #333; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .achiever-card:hover { transform: translateY(-10px); box-shadow: 0 15px 35px rgba(234, 88, 12, 0.2); }
        
        .achiever-img-wrap {
            position: relative;
            width: 100%;
            height: 340px;
            background: linear-gradient(135deg, #1a1a1a, #333); /* Premium dark background behind flyer */
            padding: 20px; 
            border-radius: 16px 16px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* THE SPECIAL GOLD GLOWING BORDER FOR THE IMAGE */
        .achiever-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain; 
            border-radius: 6px;
            border: 3px solid #FFA500; /* Gold frame */
            box-shadow: 0 0 25px rgba(255, 165, 0, 0.5); /* Glowing effect */
            background: white; /* In case the flyer has transparent parts */
        }
        
        /* THE OVERLAPPING MEDAL BADGE */
        .achiever-badge-special {
            position: absolute;
            bottom: -18px; /* Pulled down so it overlaps the image and the text area */
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ea580c, #ffb700);
            color: white;
            padding: 8px 24px;
            border-radius: 30px;
            font-size: 0.95rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            box-shadow: 0 6px 15px rgba(234, 88, 12, 0.4);
            border: 3px solid #fff; /* Thick white border to punch out from the background */
            white-space: nowrap;
            z-index: 2;
        }
        body.dark-mode .achiever-badge-special { border-color: #1e1e1e; }

        .achiever-info { 
            padding: 2.5rem 1.5rem 1.5rem; /* Extra top padding to make room for the overlapping badge */
            text-align: center; 
        }
        .achiever-info h3 { margin: 0; color: #1a1a1a; font-size: 1.4rem; font-weight: 700; }
        body.dark-mode .achiever-info h3 { color: #fff; }

        /* --- MAIN TOOLBAR --- */
        .gallery-toolbar {
            padding: 3rem 2rem 2rem; max-width: 1400px; margin: 0 auto;
            display: flex; justify-content: center; align-items: center;
            flex-wrap: wrap; gap: 1.5rem; 
            position: relative; z-index: 10;
        }
        .gallery-filters { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
        .gallery-filter-chip {
            padding: 8px 20px; border-radius: 50px; border: 1px solid #ddd;
            background: white; cursor: pointer; transition: all 0.3s; font-size: 0.9rem; 
            font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #333;
        }
        .gallery-filter-chip:hover { border-color: #aaa; color: #000; transform: translateY(-2px); }
        .gallery-filter-chip.active { background: #1a1a1a; color: white; border-color: #1a1a1a; }
        
        body.dark-mode .gallery-filter-chip { background: #222; border-color: #444; color: #bbb; }
        body.dark-mode .gallery-filter-chip:hover { color: #fff; }
        body.dark-mode .gallery-filter-chip.active { background: #FFA500; color: #000; border-color: #FFA500; }

        /* --- FLOATING BAR --- */
        .floating-pill-container {
            position: fixed; bottom: 30px; left: 50%;
            background: #ffffff; padding: 6px 8px; border-radius: 9999px; 
            display: flex; align-items: center; gap: 5px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05); z-index: 2147483647;
        }
        body.dark-mode .floating-pill-container { background: #1e1e1e; box-shadow: 0 4px 25px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1); }
        .pill-btn {
            padding: 10px 18px; border-radius: 999px; border: none; background: transparent; 
            color: #5f6368; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
        }
        .pill-btn:hover { background: #f1f3f4; color: #202124; }
        .pill-btn.active { background: #e8f0fe; color: #1967d2; font-weight: 700; }
        body.dark-mode .pill-btn { color: #aaa; }
        body.dark-mode .pill-btn:hover { background: #333; color: #fff; }
        body.dark-mode .pill-btn.active { background: #333; color: #FFA500; }
        .pill-add-btn {
            width: 36px; height: 36px; border-radius: 50%; background: #ea580c; color: white; border: none;
            display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; margin-left: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .pill-add-btn:hover { transform: scale(1.1); background: #c2410c; }
        .gallery-add-btn {
            background: #ea580c; color: white; border: none; padding: 10px 24px; border-radius: 50px; font-weight: 700; cursor: pointer; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; transition: all 0.3s; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
        }
        .gallery-add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(234, 88, 12, 0.4); }

        /* --- MASONRY LAYOUT --- */
        .gallery-masonry { column-count: 4; column-gap: 24px; max-width: 1600px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 1400px) { .gallery-masonry { column-count: 3; } }
        @media (max-width: 900px) { .gallery-masonry { column-count: 2; column-gap: 16px; padding: 0 16px; } }
        @media (max-width: 500px) { .gallery-masonry { column-count: 1; } }

        /* --- GALLERY CARD --- */
        .gallery-card {
            break-inside: avoid; margin-bottom: 24px; position: relative; border-radius: 12px; overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); cursor: pointer; background: #f0f0f0; transform: translateZ(0);
        }
        body.dark-mode .gallery-card { background: #2a2a2a; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .gallery-img { width: 100%; display: block; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .gallery-card:hover .gallery-img { transform: scale(1.08); }
        .video-indicator { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); z-index: 5; }
        .gallery-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%); opacity: 0; transition: opacity 0.3s ease; display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; }
        .gallery-card:hover .gallery-overlay { opacity: 1; }
        .gallery-tag { background: #ea580c; color: white; font-size: 0.65rem; padding: 4px 10px; border-radius: 20px; align-self: flex-start; margin-bottom: 8px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
        .gallery-card h3 { color: white; font-size: 1.1rem; margin: 0; line-height: 1.4; transform: translateY(10px); transition: transform 0.3s ease; }
        .gallery-card:hover h3 { transform: translateY(0); }
        .delete-btn { position: absolute; top: 10px; left: 10px; background: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; color: #dc2626; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s; z-index: 10; }
        .gallery-card:hover .delete-btn { opacity: 1; }
        .delete-btn:hover { transform: scale(1.1); background: #fee2e2; }

        /* --- LIGHTBOX --- */
        .lightbox-backdrop { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
        .lightbox-content { max-width: 90vw; max-height: 90vh; position: relative; }
        .lightbox-media { max-width: 100%; max-height: 90vh; border-radius: 8px; box-shadow: 0 0 50px rgba(0,0,0,0.5); object-fit: contain; }
        .lightbox-close { position: absolute; top: 30px; right: 30px; background: rgba(255,255,255,0.1); color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .lightbox-close:hover { background: rgba(255,255,255,0.3); }
        .lightbox-info { position: absolute; bottom: -50px; left: 0; width: 100%; text-align: center; color: white; }
        .lightbox-info h3 { font-size: 1.5rem; margin: 0; }
        .lightbox-info span { color: #aaa; font-size: 0.9rem; text-transform: uppercase; }

        /* --- MODAL --- */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(5px); }
        .gallery-modal { background: white; width: 90%; max-width: 500px; padding: 2rem; border-radius: 16px; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        body.dark-mode .gallery-modal { background: #1e1e1e; color: white; border: 1px solid #333; }
        .gallery-modal input, .gallery-modal select { width: 100%; padding: 12px; margin-top: 5px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; background: #f9f9f9; }
        body.dark-mode .gallery-modal input, body.dark-mode .gallery-modal select { background: #2a2a2a; border-color: #444; color: white; }
        .modal-actions { display: flex; gap: 15px; margin-top: 10px; }
        .btn-cancel { flex: 1; padding: 14px; border: 1px solid #ddd; background: transparent; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-submit { flex: 1; padding: 14px; border: none; background: #1a1a1a; color: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
        body.dark-mode .btn-cancel { color: #fff; border-color: #444; }
        body.dark-mode .btn-submit { background: #ea580c; color: #fff; }
        .gallery-empty { text-align: center; padding: 4rem; color: #888; font-style: italic; width: 100%; }
      `}</style>

      {/* --- PAGE CONTENT --- */}
      <motion.div 
        className="gallery-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* HERO */}
        <section className="gallery-hero">
          <motion.div variants={itemVariants}>
            <h1>Our Gallery & Wall of Fame</h1>
            <p>Witness the strength, spirit, and success stories of Shivba.</p>
          </motion.div>
        </section>

        {/* --- UPGRADED ACHIEVERS HALL OF FAME --- */}
        <section className="achievers-section">
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
                <motion.h2 variants={itemVariants}>Hall of Fame</motion.h2>
                <motion.p variants={itemVariants}>Celebrating our proud members selected in MPSC, UPSC, and Defense.</motion.p>
                
                <div className="achievers-grid">
                    {ACHIEVERS_DATA.map((achiever) => (
                        <motion.div 
                            key={achiever.id} 
                            className="achiever-card" 
                            variants={itemVariants}
                            onClick={() => setSelectedMedia({ url: achiever.imageUrl, title: achiever.name, category: achiever.role })}
                        >
                            <div className="achiever-img-wrap">
                                <img 
                                    src={achiever.imageUrl} 
                                    alt={achiever.name} 
                                    className="achiever-img" 
                                    loading="lazy"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=600&auto=format&fit=crop' }} 
                                />
                                {/* THE OVERLAPPING MEDAL BADGE */}
                                <div className="achiever-badge-special">
                                   {achiever.role.includes('Police') ? '🛡️ ' : achiever.role.includes('Army') ? '⚔️ ' : '🎓 '} 
                                   {achiever.role}
                                </div>
                            </div>
                            <div className="achiever-info">
                                <h3>{achiever.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>

        {/* MAIN TOOLBAR (For Masonry Gallery) */}
        <div className="gallery-toolbar" ref={toolbarRef}>
          <div className="gallery-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`gallery-filter-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="gallery-add-btn" onClick={handleAddClick}>
            {isLoggedIn ? '+ Add Photo' : '🔒 Add Media'}
          </button>
        </div>

        {/* MASONRY GRID (General Photos) */}
        <div className="gallery-masonry">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gallery-empty">
                No photos found in this category.
              </motion.div>
            ) : (
              filteredPhotos.map((photo) => (
                <motion.article 
                  key={photo.id} 
                  className="gallery-card"
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedMedia(photo)}
                >
                  {isVideo(photo.url) && <div className="video-indicator">▶</div>}

                  {isVideo(photo.url) ? (
                      <video 
                          src={photo.url} 
                          className="gallery-img" 
                          muted 
                          playsInline
                          onMouseOver={event => event.target.play()}
                          onMouseOut={event => { event.target.pause(); event.target.currentTime = 0; }}
                          style={{ objectFit: 'cover', minHeight: '200px' }}
                      />
                  ) : (
                      <img src={photo.url} alt={photo.title} className="gallery-img" loading="lazy" />
                  )}
                  
                  <div className="gallery-overlay">
                    <span className="gallery-tag">{photo.category}</span>
                    <h3>{photo.title}</h3>
                    {canDelete && (
                      <button 
                          className="delete-btn" 
                          onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                          title="Delete Photo"
                      >🗑️</button>
                    )}
                  </div>
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- COPILOT-STYLE FLOATING BAR --- */}
      <AnimatePresence>
        {showFloatingBar && (
            <motion.div 
                className="floating-pill-container"
                variants={floatingBarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {CATEGORIES.map((cat) => (
                    <button
                    key={cat}
                    className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => { setActiveCategory(cat); window.scrollTo({ top: document.querySelector('.gallery-toolbar').offsetTop - 50, behavior: 'smooth' }); }}
                    >
                    {cat}
                    </button>
                ))}
                
                <button className="pill-add-btn" onClick={handleAddClick} title="Add Media">
                    +
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {selectedMedia && (
            <motion.div 
                className="lightbox-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedMedia(null)}
            >
                <button className="lightbox-close">✕</button>
                <motion.div 
                    className="lightbox-content"
                    initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isVideo(selectedMedia.url) ? (
                        <video src={selectedMedia.url} className="lightbox-media" controls autoPlay />
                    ) : (
                        <img 
                          src={selectedMedia.url} 
                          alt={selectedMedia.title} 
                          className="lightbox-media" 
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=600&auto=format&fit=crop' }}
                        />
                    )}
                    <div className="lightbox-info">
                        <h3>{selectedMedia.title}</h3>
                        <span>{selectedMedia.category}</span>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD PHOTO MODAL --- */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="modal-backdrop" 
            onClick={() => setShowAddModal(false)}
            initial="hidden" animate="visible" exit="exit"
          >
            <motion.div 
                className="gallery-modal" 
                onClick={(e) => e.stopPropagation()}
                variants={modalVariants}
            >
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Add New Media</h2>
              <form onSubmit={handleAddPhoto}>
                <label>Title</label>
                <input type="text" name="title" value={newPhoto.title} onChange={handleAddPhotoChange} required placeholder="E.g. Summer Camp" />
                
                <label>Category</label>
                <select name="category" value={newPhoto.category} onChange={handleAddPhotoChange}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <label>Upload Media (Image or Video)</label>
                <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.02)' }}>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ width: '100%', marginBottom: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginTop: '10px' }}>or paste URL below</span>
                </div>

                <input type="url" name="url" value={newPhoto.url} onChange={handleAddPhotoChange} placeholder="https://..." />

                {filePreview && (
                  isVideo(filePreview) ? 
                    <video src={filePreview} controls style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} /> :
                    <img src={filePreview} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Media</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GalleryPage;