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
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;500&display=swap');

                :root {
                    --c-gold: #FFD700;
                    --c-gold-dim: #998100;
                    --c-black: #050505;
                    --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
                }

                .intro-container {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100vh;
                    background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    overflow: hidden;
                    perspective: 1200px; /* Enhanced depth */
                }

                /* Film Noise Texture (Professional Touch) */
                .intro-noise {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 1;
                }

                .intro-container.fade-out {
                    opacity: 0;
                    transform: scale(1.05);
                    transition: opacity 1.2s ease, transform 1.2s ease;
                    pointer-events: none;
                }

                /* --- PARTICLES --- */
                .particles-wrapper {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 2;
                    pointer-events: none;
                }

                .particle {
                    position: absolute;
                    bottom: -10px;
                    background: var(--c-gold);
                    border-radius: 50%;
                    opacity: 0;
                    animation: rise var(--duration) infinite ease-in;
                    animation-delay: var(--delay);
                    box-shadow: 0 0 10px var(--c-gold);
                }

                @keyframes rise {
                    0% { bottom: -20px; opacity: 0; transform: translateX(0); }
                    20% { opacity: 0.5; }
                    50% { transform: translateX(15px); }
                    100% { bottom: 110vh; opacity: 0; transform: translateX(-15px); }
                }

                /* --- 3D GYROSCOPE --- */
                .gyro-scene {
                    width: 280px;
                    height: 280px;
                    position: relative;
                    transform-style: preserve-3d;
                    margin-bottom: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    opacity: 0;
                    transform: scale(0.8);
                    transition: opacity 1.5s ease, transform 1.5s var(--ease-out-expo);
                }
                
                .gyro-scene.visible {
                    opacity: 1;
                    transform: scale(1);
                }

                .ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 215, 0, 0.4);
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
                    transform-style: preserve-3d;
                    will-change: transform; /* Hint to browser for performance */
                }

                .ring-outer {
                    width: 100%; height: 100%;
                    border-width: 1px;
                    border-top-color: var(--c-gold);
                    border-bottom-color: var(--c-gold);
                    animation: spin-3d 18s infinite linear;
                }

                .ring-middle {
                    width: 75%; height: 75%;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-left: 2px solid var(--c-gold);
                    border-right: 2px solid var(--c-gold);
                    animation: spin-3d-reverse 12s infinite linear;
                }

                .ring-inner {
                    width: 50%; height: 50%;
                    border: 4px solid var(--c-gold-dim);
                    border-top: 4px solid var(--c-gold);
                    animation: spin-flat 8s infinite linear;
                }

                .core {
                    width: 60px; height: 60px;
                    background: radial-gradient(circle at 30% 30%, #fff, var(--c-gold));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 50px var(--c-gold);
                    animation: pulse-glow 4s infinite ease-in-out;
                    z-index: 15;
                }

                @keyframes spin-3d { 
                    0% { transform: rotateX(0deg) rotateY(0deg); } 
                    100% { transform: rotateX(360deg) rotateY(360deg); } 
                }
                @keyframes spin-3d-reverse { 
                    0% { transform: rotateX(360deg) rotateY(0deg); } 
                    100% { transform: rotateX(0deg) rotateY(360deg); } 
                }
                @keyframes spin-flat { 
                    0% { transform: rotateZ(0deg) rotateX(60deg); } 
                    100% { transform: rotateZ(360deg) rotateX(60deg); } 
                }
                @keyframes pulse-glow { 
                    0%, 100% { transform: scale(1); box-shadow: 0 0 30px var(--c-gold-dim); } 
                    50% { transform: scale(1.2); box-shadow: 0 0 70px var(--c-gold); background: #fff; } 
                }

                /* --- TYPOGRAPHY --- */
                .content-wrap {
                    text-align: center;
                    z-index: 20;
                }

                .brand-title {
                    font-family: 'Cinzel', serif;
                    font-size: 4rem;
                    font-weight: 700;
                    background: linear-gradient(to bottom, #fff 0%, #aaa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                    letter-spacing: 0.5em;
                    text-transform: uppercase;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 1s var(--ease-out-expo) 0.3s;
                    text-shadow: 0 20px 40px rgba(0,0,0,0.8);
                }
                
                .brand-subtitle {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.85rem;
                    color: var(--c-gold);
                    letter-spacing: 0.8em;
                    text-transform: uppercase;
                    margin-top: 1rem;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 1s var(--ease-out-expo) 0.6s;
                }

                .anim-active .brand-title,
                .anim-active .brand-subtitle {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* --- BUTTON --- */
                .cta-container {
                    margin-top: 60px;
                    opacity: 0;
                    transition: opacity 1s ease 1s;
                }
                .anim-active .cta-container { opacity: 1; }

                .enter-btn {
                    position: relative;
                    padding: 18px 60px;
                    background: transparent;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                    color: #fff;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.3em;
                    cursor: pointer;
                    transition: all 0.4s ease;
                    overflow: hidden;
                }

                .enter-btn::after {
                    content: '';
                    position: absolute;
                    width: 0%;
                    height: 100%;
                    top: 0; left: 0;
                    background: var(--c-gold);
                    z-index: -1;
                    transition: width 0.3s ease;
                }

                .enter-btn:hover {
                    color: #000;
                    border-color: var(--c-gold);
                    box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
                }
                
                .enter-btn:hover::after {
                    width: 100%;
                }

                /* Mobile Optimization */
                @media (max-width: 768px) {
                    .gyro-scene { width: 220px; height: 220px; margin-bottom: 40px; }
                    .brand-title { font-size: 2.5rem; letter-spacing: 0.3em; }
                    .brand-subtitle { font-size: 0.7rem; letter-spacing: 0.5em; }
                }
            `}</style>

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