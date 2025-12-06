import React, { useMemo, useState } from 'react';

const INITIAL_PHOTOS = [
  {
    id: 1,
    category: 'Facilities',
    title: 'Main Workout Area',
    url: 'https://images.pexels.com/photos/1552104/pexels-photo-1552104.jpeg?auto=compress&w=800',
  },
  {
    id: 2,
    category: 'Facilities',
    title: 'Yoga Studio',
    url: 'https://images.pexels.com/photos/3823063/pexels-photo-3823063.jpeg?auto=compress&w=800',
  },
  {
    id: 3,
    category: 'Events',
    title: 'Annual Fitness Challenge',
    url: 'https://images.pexels.com/photos/799165/pexels-photo-799165.jpeg?auto=compress&w=800',
  },
  {
    id: 4,
    category: 'Events',
    title: 'Cultural Night',
    url: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&w=800',
  },
  {
    id: 5,
    category: 'Community',
    title: 'Community Meetup',
    url: 'https://images.pexels.com/photos/1181395/pexels-photo-1181395.jpeg?auto=compress&w=800',
  },
  {
    id: 6,
    category: 'Community',
    title: 'Social Awareness Drive',
    url: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&w=800',
  },
];

const CATEGORIES = ['All', 'Facilities', 'Events', 'Community'];

function GalleryPage({ setPage }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    category: 'Facilities',
    url: '',
  });
  const [filePreview, setFilePreview] = useState(null);

  // --- 1. Check Login Status ---
  const isLoggedIn = !!localStorage.getItem('shivba_user_email');

  // --- 2. Permission Logic ---
  const canDelete = isLoggedIn;

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'All') return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory]);

  const handleAddClick = () => {
    if (isLoggedIn) {
      openAddModal();
    } else {
      const confirmLogin = window.confirm("You must be signed in to add/delete photos. Go to login page?");
      if (confirmLogin && setPage) {
        setPage({ name: 'account' }); 
      }
    }
  };

  const openAddModal = () => {
    setNewPhoto({ title: '', category: 'Facilities', url: '' });
    setFilePreview(null);
    setShowAddModal(true);
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
      setNewPhoto((prev) => ({
        ...prev,
        url: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhoto.title || !newPhoto.url) return;

    const nextId = photos.length ? Math.max(...photos.map((p) => p.id)) + 1 : 1;
    setPhotos((prev) => [
      ...prev,
      {
        id: nextId,
        title: newPhoto.title,
        category: newPhoto.category,
        url: newPhoto.url,
      },
    ]);
    setShowAddModal(false);
    setFilePreview(null);
  };

  const handleDeletePhoto = (id) => {
    if (!canDelete) return;
    
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (confirmDelete) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-gray-50">
      
      {/* --- INJECTED STYLES FOR MOBILE SLIDER --- */}
      <style>{`
        /* Default Grid (Desktop) */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding-bottom: 40px;
        }

        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
          .gallery-grid {
            display: flex !important; /* Switch to flex for sliding */
            overflow-x: auto; /* Enable horizontal scrolling */
            scroll-snap-type: x mandatory; /* Snap effect */
            gap: 15px;
            padding-bottom: 20px;
            /* Hide scrollbar for cleaner look */
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          
          .gallery-grid::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }

          .gallery-card {
            /* "4 line slider" logic: 
               If you want 4 items visible at once on mobile, use width: 22% 
               (roughly 100% / 4 minus margins).
               If you want them slightly larger to scroll through, stick to 40-80%.
               
               Below is set to show ~2.5 items to encourage scrolling, 
               or change flex: 0 0 23% for exactly 4 items per screen.
            */
            flex: 0 0 45%; 
            scroll-snap-align: start;
            min-width: 150px; /* Ensure they don't get too small */
          }

          /* If you explicitly want 4 tiny images across the screen: */
          /* .gallery-card {
             flex: 0 0 23%; 
          } 
          */

          .gallery-card-image {
            height: 150px; /* Smaller height for mobile */
          }
          
          .gallery-toolbar-inner {
            flex-direction: column;
            gap: 15px;
          }
          
          .gallery-filters {
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 5px;
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>

      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <h1>Gallery</h1>
          <p>Explore our facilities, events, and vibrant community.</p>
        </div>
      </section>

      {/* Filters + Add button */}
      <section className="gallery-toolbar">
        <div className="gallery-toolbar-inner">
          <div className="gallery-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={
                  'gallery-filter-chip' +
                  (activeCategory === cat ? ' active' : '')
                }
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
      </section>

      {/* Grid */}
      <section className="gallery-grid-section">
        <div className="gallery-grid-inner">
          {filteredPhotos.length === 0 ? (
            <div className="gallery-empty">
              No photos yet in this category.
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredPhotos.map((photo) => (
                <article key={photo.id} className="gallery-card">
                  <div className="gallery-card-image">
                    <img src={photo.url} alt={photo.title} loading="lazy" />
                    <div className="gallery-card-overlay">
                      <div className="gallery-card-overlay-inner">
                        <span className="gallery-tag overlay-tag">
                          {photo.category}
                        </span>
                        <h3>{photo.title}</h3>
                      </div>
                    </div>
                    
                    {/* DELETE BUTTON (Only shows if logged in) */}
                    {canDelete && (
                      <button
                        type="button"
                        className="gallery-delete-btn"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleDeletePhoto(photo.id);
                        }}
                        title="Delete Photo"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="gallery-card-body">
                    <span className="gallery-tag">{photo.category}</span>
                    <h3>{photo.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Photo modal */}
      {showAddModal && (
        <div
          className="gallery-modal-backdrop"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="gallery-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add New Photo</h2>
            <form className="gallery-modal-form" onSubmit={handleAddPhoto}>
              <label>
                Title
                <input
                  type="text"
                  name="title"
                  value={newPhoto.title}
                  onChange={handleAddPhotoChange}
                  required
                  placeholder="Short title"
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  value={newPhoto.category}
                  onChange={handleAddPhotoChange}
                >
                  <option value="Facilities">Facilities</option>
                  <option value="Events">Events</option>
                  <option value="Community">Community</option>
                </select>
              </label>

              <label>
                Upload image (Device)
                <div style={{border:'2px dashed #ccc', padding:'10px', borderRadius:'8px', marginTop:'5px', textAlign:'center', cursor:'pointer', background:'#fafafa'}}>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{width:'100%'}}
                    required={!newPhoto.url}
                    />
                </div>
              </label>
              
              <label>
                Or paste image URL
                <input
                  type="url"
                  name="url"
                  value={newPhoto.url}
                  onChange={handleAddPhotoChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </label>

              {filePreview && (
                <div className="gallery-preview-wrap">
                  <p>Preview:</p>
                  <img src={filePreview} alt="Preview" style={{width:'100%', height:'200px', objectFit:'cover', borderRadius:'8px'}} />
                </div>
              )}

              <div className="gallery-modal-actions">
                <button
                  type="button"
                  className="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Save Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryPage;