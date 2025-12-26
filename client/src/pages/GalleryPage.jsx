import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. CONFIGURATION ---
const INITIAL_PHOTOS = [
  // Existing Data
  { id: 1, category: 'Facilities', title: 'Main Workout Area', url: 'https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&w=800' },
  { id: 2, category: 'Facilities', title: 'Yoga Studio', url: 'https://images.pexels.com/photos/3823063/pexels-photo-3823063.jpeg?auto=compress&w=800' },
  { id: 3, category: 'Events', title: 'Annual Fitness Challenge', url: 'https://images.pexels.com/photos/799165/pexels-photo-799165.jpeg?auto=compress&w=800' },
  { id: 4, category: 'Events', title: 'Cultural Night', url: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&w=800' },
  { id: 5, category: 'Community', title: 'Community Meetup', url: 'https://images.pexels.com/photos/1181395/pexels-photo-1181395.jpeg?auto=compress&w=800' },
  { id: 6, category: 'Community', title: 'Social Awareness Drive', url: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&w=800' },
  
  // New Uploads (WhatsApp Dump) - Categories rotated for variety
  { id: 7, category: 'Facilities', title: 'Gym Interior', url: '/IMG-20251226-WA0005.jpg' },
  { id: 8, category: 'Events', title: 'Event Highlight (Video)', url: '/VID-20251226-WA0009.mp4' },
  { id: 9, category: 'Events', title: 'Training Session (Video)', url: '/VID-20251226-WA0008.mp4' },
  { id: 10, category: 'Community', title: 'Group Activity (Video)', url: '/VID-20251226-WA0007.mp4' },
  { id: 11, category: 'Facilities', title: 'Equipment Tour (Video)', url: '/VID-20251226-WA0006.mp4' },
  { id: 12, category: 'Events', title: 'Opening Ceremony (Video)', url: '/VID-20251226-WA0005.mp4' },
  { id: 13, category: 'Community', title: 'Member Gathering', url: '/IMG-20251226-WA0030.jpg' },
  { id: 14, category: 'Community', title: 'shivba', url: '/IMG-20251226-WA0029.jpg' },
  { id: 15, category: 'Events', title: 'Stage Performance', url: '/IMG-20251226-WA0028.jpg' },
  { id: 16, category: 'Events', title: 'Yoga', url: '/IMG-20251226-WA0027.jpg' },
  { id: 17, category: 'Events', title: 'Crowd Cheering (Video)', url: '/VID-20251226-WA0004.mp4' },
  { id: 18, category: 'Facilities', title: 'Entrance View', url: '/IMG-20251226-WA0026.jpg' },
  { id: 19, category: 'Facilities', title: 'Reception Area', url: '/IMG-20251226-WA0025.jpg' },
  { id: 20, category: 'Facilities', title: 'Cardio Section', url: '/IMG-20251226-WA0024.jpg' },
  { id: 21, category: 'Community', title: 'Team Photo', url: '/IMG-20251226-WA0023.jpg' },
  { id: 22, category: 'Community', title: 'Volunteers', url: '/IMG-20251226-WA0022.jpg' },
  { id: 23, category: 'Events', title: 'Preparation', url: '/IMG-20251226-WA0021.jpg' },
  { id: 24, category: 'Events', title: 'Lighting Ceremony', url: '/IMG-20251226-WA0020.jpg' },
  { id: 25, category: 'Events', title: 'Audience', url: '/IMG-20251226-WA0019.jpg' },
  { id: 26, category: 'Facilities', title: 'Select on MPSC', url: '/IMG-20251226-WA0018.jpg' },
  { id: 27, category: 'Facilities', title: 'Lockers', url: '/IMG-20251226-WA0017.jpg' },
  { id: 28, category: 'Community', title: 'Maharastra police', url: '/IMG-20251226-WA0016.jpg' },
  { id: 29, category: 'Community', title: 'Celebration', url: '/IMG-20251226-WA0015.jpg' },
  { id: 30, category: 'Events', title: 'Prize Giving', url: '/IMG-20251226-WA0014.jpg' },
  { id: 31, category: 'Events', title: 'Highlights (Video)', url: '/VID-20251226-WA0003.mp4' },
  { id: 32, category: 'Facilities', title: 'Parking Area', url: '/IMG-20251226-WA0013.jpg' },
  { id: 33, category: 'Facilities', title: 'Office', url: '/IMG-20251226-WA0012.jpg' },
  { id: 34, category: 'Events', title: 'Flash Mob (Video)', url: '/VID-20251226-WA0002.mp4' },
  { id: 35, category: 'Community', title: 'Breakfast Meet', url: '/IMG-20251226-WA0011.jpg' },
  { id: 36, category: 'Community', title: 'Social Gathering', url: '/IMG-20251226-WA0010.jpg' },
  { id: 37, category: 'Events', title: 'Setup Day', url: '/IMG-20251226-WA0009.jpg' },
  { id: 38, category: 'Events', title: 'Evening View', url: '/IMG-20251226-WA0007.jpg' },
  { id: 39, category: 'Facilities', title: 'Overview', url: '/IMG-20251226-WA0006.jpg' },
];

const CATEGORIES = ['All', 'Facilities', 'Events', 'Community'];

// --- 2. ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.5 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

function GalleryPage({ setPage }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', category: 'Facilities', url: '' });
  const [filePreview, setFilePreview] = useState(null);

  const isLoggedIn = !!localStorage.getItem('shivba_user_email');
  const canDelete = isLoggedIn;

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'All') return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory]);

  const handleAddClick = () => {
    if (isLoggedIn) {
      setNewPhoto({ title: '', category: 'Facilities', url: '' });
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
    setPhotos((prev) => [...prev, { id: nextId, ...newPhoto }]);
    setShowAddModal(false);
  };

  const handleDeletePhoto = (id) => {
    if (!canDelete) return;
    if (window.confirm("Are you sure you want to delete this photo?")) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Helper to check if url is a video
  const isVideo = (url) => {
    return url && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm'));
  };

  return (
    <motion.div 
      className="gallery-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;500;600&display=swap');

        /* Typography */
        .gallery-container h1, .gallery-container h2, .gallery-card h3 {
            font-family: 'Cinzel', serif !important;
            letter-spacing: 0.05em;
        }
        .gallery-container p, .gallery-container button, .gallery-container span, .gallery-container label {
            font-family: 'Montserrat', sans-serif !important;
        }

        /* Hero */
        .gallery-hero {
            padding: 4rem 2rem; text-align: center;
            background: #1a1a1a; color: white;
            margin-bottom: 2rem;
        }
        .gallery-hero h1 { font-size: 3rem; margin-bottom: 0.5rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .gallery-hero p { font-size: 1.1rem; color: #ccc; }

        /* Toolbar */
        .gallery-toolbar {
            padding: 1rem 2rem; max-width: 1200px; margin: 0 auto 2rem;
            display: flex; justify-content: space-between; align-items: center;
            flex-wrap: wrap; gap: 1rem;
        }
        .gallery-filters { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
        .gallery-filter-chip {
            padding: 8px 16px; border-radius: 20px; border: 1px solid #ddd;
            background: white; cursor: pointer; transition: all 0.3s; font-size: 0.9rem; white-space: nowrap;
        }
        .gallery-filter-chip.active, .gallery-filter-chip:hover {
            background: #1a1a1a; color: white; border-color: #1a1a1a;
        }
        body.dark-mode .gallery-filter-chip { background: #333; color: #ccc; border-color: #444; }
        body.dark-mode .gallery-filter-chip.active { background: #FFA500; color: #000; }

        .gallery-add-btn {
            background: #FFA500; color: white; border: none; padding: 10px 20px;
            border-radius: 8px; font-weight: 600; cursor: pointer; text-transform: uppercase;
            font-size: 0.85rem; letter-spacing: 0.05em; transition: transform 0.2s;
        }
        .gallery-add-btn:hover { transform: translateY(-2px); }

        /* Masonry Grid */
        .gallery-masonry {
            column-count: 3; column-gap: 20px;
            max-width: 1200px; margin: 0 auto; padding: 0 20px 40px;
        }
        @media (max-width: 900px) { .gallery-masonry { column-count: 2; } }
        @media (max-width: 600px) { .gallery-masonry { column-count: 1; } }

        /* Card */
        .gallery-card {
            break-inside: avoid; margin-bottom: 20px;
            position: relative; border-radius: 12px; overflow: hidden;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            cursor: pointer;
            background: #000; /* For videos */
        }
        .gallery-img {
            width: 100%; display: block; transition: transform 0.5s ease;
        }
        /* Only zoom images, not videos on hover if handled differently, but here we zoom both */
        .gallery-card:hover .gallery-img { transform: scale(1.05); }
        
        .gallery-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            opacity: 0; transition: opacity 0.3s ease;
            display: flex; flex-direction: column; justify-content: flex-end; padding: 20px;
            pointer-events: none; /* Allows clicking play on video if needed */
        }
        .gallery-card:hover .gallery-overlay { opacity: 1; }
        
        .gallery-tag {
            background: #FFA500; color: white; font-size: 0.7rem; padding: 4px 8px;
            border-radius: 4px; align-self: flex-start; margin-bottom: 5px; text-transform: uppercase; fontWeight: bold;
        }
        .gallery-card h3 { color: white; font-size: 1.2rem; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

        .delete-btn {
            position: absolute; top: 10px; right: 10px;
            background: rgba(255, 255, 255, 0.9); border: none; border-radius: 50%;
            width: 30px; height: 30px; cursor: pointer; color: #ef4444; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s;
            pointer-events: auto;
        }
        .gallery-card:hover .delete-btn { opacity: 1; }

        /* Modal */
        .modal-backdrop {
            position: fixed; inset: 0; background: rgba(0,0,0,0.8);
            display: flex; align-items: center; justify-content: center; z-index: 1000;
            backdrop-filter: blur(5px);
        }
        .gallery-modal {
            background: white; width: 90%; max-width: 500px; padding: 2rem;
            border-radius: 16px; position: relative;
        }
        body.dark-mode .gallery-modal { background: #1e1e1e; color: white; }
        
        .gallery-modal input, .gallery-modal select {
            width: 100%; padding: 12px; margin-top: 5px; margin-bottom: 15px;
            border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;
        }
        .gallery-modal label { font-size: 0.9rem; font-weight: 600; display: block; }
        
        .modal-actions { display: flex; gap: 10px; margin-top: 10px; }
        .btn-cancel { flex: 1; padding: 12px; border: 1px solid #ddd; background: transparent; border-radius: 8px; cursor: pointer; }
        .btn-submit { flex: 1; padding: 12px; border: none; background: #1a1a1a; color: white; border-radius: 8px; cursor: pointer; }
        body.dark-mode .btn-cancel { color: #fff; border-color: #444; }
        body.dark-mode .btn-submit { background: #FFA500; color: #000; }

        .gallery-empty { text-align: center; padding: 4rem; color: #888; font-style: italic; }
      `}</style>

      {/* --- HERO --- */}
      <section className="gallery-hero">
        <motion.div variants={itemVariants}>
          <h1>Gallery</h1>
          <p>Explore our facilities, events, and vibrant community.</p>
        </motion.div>
      </section>

      {/* --- TOOLBAR --- */}
      <div className="gallery-toolbar">
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
          {isLoggedIn ? '+ Add Photo' : '🔒 Add/Edit'}
        </button>
      </div>

      {/* --- MASONRY GRID --- */}
      <div className="gallery-masonry">
        <AnimatePresence>
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
              >
                {/* --- CHANGED: CONDITIONAL RENDERING FOR VIDEO OR IMAGE --- */}
                {isVideo(photo.url) ? (
                    <video 
                        src={photo.url} 
                        className="gallery-img" 
                        controls 
                        preload="metadata"
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <img 
                        src={photo.url} 
                        alt={photo.title} 
                        className="gallery-img" 
                        loading="lazy" 
                    />
                )}
                
                <div className="gallery-overlay">
                  <span className="gallery-tag">{photo.category}</span>
                  <h3>{photo.title}</h3>
                  {canDelete && (
                    <button 
                        className="delete-btn" 
                        onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                        title="Delete Photo"
                    >✕</button>
                  )}
                </div>
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* --- ADD MODAL --- */}
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
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Add New Photo</h2>
              <form onSubmit={handleAddPhoto}>
                <label>Title</label>
                <input type="text" name="title" value={newPhoto.title} onChange={handleAddPhotoChange} required placeholder="Enter photo title" />
                
                <label>Category</label>
                <select name="category" value={newPhoto.category} onChange={handleAddPhotoChange}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <label>Upload Image</label>
                <div style={{ border: '2px dashed #ccc', padding: '15px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ width: '100%', marginBottom: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>or paste URL below</span>
                </div>

                <label>Image/Video URL (Optional)</label>
                <input type="url" name="url" value={newPhoto.url} onChange={handleAddPhotoChange} placeholder="https://..." />

                {filePreview && (
                  isVideo(filePreview) ? 
                    <video src={filePreview} controls style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} /> :
                    <img src={filePreview} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Photo</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default GalleryPage;