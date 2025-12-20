import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types'; // Optional: Good practice for larger apps

/**
 * StarterAnimaPage
 * A cinematic 3D entrance portal for the Shivba application.
 * * Features:
 * - 3D Gyroscopic CSS animation
 * - Performance optimized particle system
 * - Accessible markup
 * - Smooth transition handling
 */
const StarterAnimaPage = ({ setPage }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Trigger entrance animations after mount
    useEffect(() => {
        const timer = setTimeout(() => setAnimateIn(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Memoize particles to prevent recalculation on re-renders (Performance)
    const particles = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            delay: Math.random() * 5 + 's',
            duration: 6 + Math.random() * 8 + 's',
            size: Math.random() * 3 + 1 + 'px'
        }));
    }, []);

    const handleEnter = () => {
        setIsExiting(true);
        // Wait for the exit animation (1.2s) before unmounting
        const timer = setTimeout(() => {
            setPage({ name: 'home' });
        }, 1200);
        
        // Cleanup function in case user closes tab/component unmounts
        return () => clearTimeout(timer);
    };

    return (
        <div className={`intro-container ${isExiting ? 'fade-out' : ''}`}>
            {/* Scoped Styles
               Note: In a large enterprise app, we would move this to a CSS Module 
               (StarterAnimaPage.module.css), but for this architecture, 
               embedded styles keep the component portable.
            */}

            {/* Noise Texture Overlay for film look */}
            <div className="intro-noise"></div>

            {/* Background Particles (Aria-hidden for accessibility) */}
            <div className="particles-wrapper" aria-hidden="true">
                {particles.map(p => (
                    <div 
                        key={p.id} 
                        className="particle" 
                        style={{ 
                            left: p.left, 
                            width: p.size, 
                            height: p.size,
                            '--delay': p.delay, 
                            '--duration': p.duration 
                        }} 
                    />
                ))}
            </div>

            {/* 3D Gyroscope Element */}
            <div className={`gyro-scene ${animateIn ? 'visible' : ''}`} aria-hidden="true">
                <div className="ring ring-outer"></div>
                <div className="ring ring-middle"></div>
                <div className="ring ring-inner"></div>
                <div className="core"></div>
            </div>

            {/* Main Content */}
            <div className={`content-wrap ${animateIn ? 'anim-active' : ''}`}>
                <h1 className="brand-title">Shivba</h1>
                <p className="brand-subtitle">Legacy • Strength • Future</p>
                
                <div className="cta-container">
                    <button 
                        className="enter-btn" 
                        onClick={handleEnter}
                        aria-label="Enter the Shivba website"
                    >
                        Enter
                    </button>
                </div>
            </div>
        </div>
    );
};

StarterAnimaPage.propTypes = {
    setPage: PropTypes.func.isRequired
};

export default StarterAnimaPage;