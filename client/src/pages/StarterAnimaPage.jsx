import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported in your project

const StarterAnimaPage = ({ setPage }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Trigger Entrance
    useEffect(() => {
        const timer = setTimeout(() => setAnimateIn(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Optimized Particles Data
    const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.floor(Math.random() * 100), // 0-100%
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 8,
        size: Math.random() * 4 + 2
    })), []);

    const handleEnter = () => {
        setIsExiting(true);
        setTimeout(() => setPage({ name: 'home' }), 1000); // Matches CSS transition
    };

    return (
        <div className={`container-fluid vh-100 bg-black d-flex flex-column justify-content-center align-items-center overflow-hidden position-relative p-0 fade ${isExiting ? '' : 'show'}`} 
             style={{ transition: 'opacity 1s ease' }}>

            {/* --- CUSTOM CSS FOR ANIMATIONS (Bootstrap doesn't support keyframes natively) --- */}
            <style>{`
                /* Fonts */
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@400;500&display=swap');

                :root {
                    --bs-warning-rgb: 255, 193, 7; /* Bootstrap Warning Color (Goldish) */
                }

                /* 3D Scene Setup */
                .gyro-scene {
                    width: 260px; height: 260px;
                    perspective: 1000px;
                    transform: scale(0.8);
                    transition: transform 1.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.5s ease;
                    opacity: 0;
                }
                .gyro-scene.active { transform: scale(1); opacity: 1; }

                /* Rings */
                .ring {
                    position: absolute; border-radius: 50%;
                    transform-style: preserve-3d;
                    box-shadow: 0 0 15px rgba(var(--bs-warning-rgb), 0.2);
                }
                .ring-outer {
                    inset: 0; border: 1px solid #ffc107;
                    border-top-color: transparent; border-bottom-color: transparent;
                    animation: spin3d 18s infinite linear;
                }
                .ring-middle {
                    inset: 30px; border: 2px solid rgba(255,255,255,0.1);
                    border-left-color: #ffc107; border-right-color: #ffc107;
                    animation: spin3dReverse 12s infinite linear;
                }
                .ring-inner {
                    inset: 60px; border: 4px solid #b38600;
                    border-top-color: #ffc107;
                    animation: spinFlat 8s infinite linear;
                }
                
                /* Core */
                .core {
                    width: 50px; height: 50px;
                    background: radial-gradient(circle at 30% 30%, white, #ffc107);
                    border-radius: 50%;
                    box-shadow: 0 0 40px #ffc107;
                    animation: pulse 3s infinite ease-in-out;
                    z-index: 10;
                }

                /* Animations */
                @keyframes spin3d { to { transform: rotateX(360deg) rotateY(360deg); } }
                @keyframes spin3dReverse { 
                    from { transform: rotateX(360deg) rotateY(0deg); } 
                    to { transform: rotateX(0deg) rotateY(360deg); } 
                }
                @keyframes spinFlat { 
                    from { transform: rotateZ(0deg) rotateX(60deg); } 
                    to { transform: rotateZ(360deg) rotateX(60deg); } 
                }
                @keyframes pulse { 
                    0%, 100% { transform: scale(1); } 
                    50% { transform: scale(1.2); box-shadow: 0 0 60px #ffc107; } 
                }

                /* Particle Animation */
                .particle {
                    position: absolute; bottom: -20px;
                    background: #ffc107; border-radius: 50%;
                    animation: floatUp var(--dur) infinite ease-in;
                    animation-delay: var(--del);
                    opacity: 0;
                }
                @keyframes floatUp {
                    0% { bottom: -20px; opacity: 0; transform: translateX(0); }
                    20% { opacity: 0.6; }
                    100% { bottom: 100vh; opacity: 0; transform: translateX(20px); }
                }

                /* Text Transition */
                .text-reveal {
                    transform: translateY(20px); opacity: 0;
                    transition: all 1s ease 0.5s;
                }
                .text-reveal.active { transform: translateY(0); opacity: 1; }
            `}</style>

            {/* --- PARTICLES BACKGROUND --- */}
            <div className="position-absolute w-100 h-100 start-0 top-0 pe-none">
                {particles.map(p => (
                    <div 
                        key={p.id} 
                        className="particle"
                        style={{ 
                            left: `${p.left}%`, 
                            width: `${p.size}px`, 
                            height: `${p.size}px`,
                            '--del': `${p.delay}s`,
                            '--dur': `${p.duration}s`
                        }}
                    />
                ))}
            </div>

            {/* --- 3D GYROSCOPE CONTAINER --- */}
            <div className={`gyro-scene d-flex align-items-center justify-content-center mb-5 ${animateIn ? 'active' : ''}`}>
                <div className="ring ring-outer"></div>
                <div className="ring ring-middle"></div>
                <div className="ring ring-inner"></div>
                <div className="core"></div>
            </div>

            {/* --- TEXT CONTENT (BOOTSTRAP TYPOGRAPHY) --- */}
            <div className={`text-center z-1 text-reveal ${animateIn ? 'active' : ''}`}>
                <h1 className="display-1 fw-bold text-uppercase text-white mb-0" 
                    style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.2em' }}>
                    Shivba
                </h1>
                <p className="lead text-warning text-uppercase fw-light" 
                   style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.5em', fontSize: '1rem' }}>
                    Legacy • Strength • Future
                </p>

                {/* --- BUTTON (BOOTSTRAP CLASSES) --- */}
                <div className="mt-5">
                    <button 
                        onClick={handleEnter}
                        className="btn btn-outline-warning btn-lg rounded-0 px-5 py-3 text-uppercase"
                        style={{ 
                            letterSpacing: '0.3em', 
                            transition: 'all 0.3s ease' 
                        }}
                    >
                        Enter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StarterAnimaPage;