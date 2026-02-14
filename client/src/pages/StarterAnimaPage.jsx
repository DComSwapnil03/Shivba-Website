import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const StarterAnimaPage = ({ setPage }) => {
    const [animationPhase, setAnimationPhase] = useState(0); 
    // Phases: 
    // 0: Initial (Hidden)
    // 1: Zooming Out (Text appears huge then shrinks)
    // 2: Landed (Text in place, Fireworks trigger)
    // 3: UI Reveal (Subtitle and Button appear)
    // 4: Exiting (Fade out)

    useEffect(() => {
        // Step 1: Start Zoom Out immediately
        const startTimer = setTimeout(() => setAnimationPhase(1), 100);

        // Step 2: Trigger Fireworks & Impact exactly when zoom ends (1.2s duration)
        const impactTimer = setTimeout(() => setAnimationPhase(2), 1300);

        // Step 3: Show Subtitle & Enter Button shortly after fireworks start
        const uiTimer = setTimeout(() => setAnimationPhase(3), 2000);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(impactTimer);
            clearTimeout(uiTimer);
        };
    }, []);

    // Generate random coordinates for firework sparks
    const sparks = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => {
            const angle = Math.random() * 360;
            const distance = 150 + Math.random() * 200; // Distance from center
            return {
                id: i,
                // Convert Polar to Cartesian coordinates for CSS transform
                tx: Math.cos(angle * (Math.PI / 180)) * distance,
                ty: Math.sin(angle * (Math.PI / 180)) * distance,
                delay: Math.random() * 0.2,
                color: Math.random() > 0.5 ? '#ffc107' : '#ffffff', // Gold or White
                size: Math.random() * 4 + 2
            };
        });
    }, []);

    const handleEnter = () => {
        setAnimationPhase(4); // Trigger Exit Fade
        setTimeout(() => setPage({ name: 'home' }), 1000);
    };

    return (
        <div className={`container-fluid vh-100 bg-black d-flex flex-column justify-content-center align-items-center overflow-hidden position-relative p-0 fade ${animationPhase === 4 ? '' : 'show'}`} 
             style={{ transition: 'opacity 1s ease' }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@400;500&display=swap');

                /* --- 1. ZOOM OUT ANIMATION --- */
                .shivba-title {
                    font-family: 'Cinzel', serif;
                    font-size: 8rem;
                    line-height: 1;
                    color: white;
                    text-transform: uppercase;
                    opacity: 0;
                    transform: scale(20); /* Start Huge */
                    filter: blur(20px);
                    letter-spacing: 50px;
                    transition: all 1.2s cubic-bezier(0.25, 1, 0.5, 1);
                    position: relative;
                    z-index: 10;
                    text-shadow: 0 0 10px rgba(0,0,0,0.5);
                }

                .shivba-title.zoom-active {
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(0);
                    letter-spacing: 10px;
                }

                /* Mobile Adjustment */
                @media (max-width: 768px) {
                    .shivba-title { font-size: 4rem; }
                    .shivba-title.zoom-active { letter-spacing: 5px; }
                }

                /* --- 2. FIREWORK PARTICLES --- */
                .firework-container {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 0; height: 0;
                    z-index: 1; /* Behind text */
                    pointer-events: none;
                }

                .spark {
                    position: absolute;
                    top: 0; left: 0;
                    border-radius: 50%;
                    opacity: 0;
                }

                .explode .spark {
                    animation: explosion 1.5s ease-out forwards;
                }

                @keyframes explosion {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                        box-shadow: 0 0 20px currentColor;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(0);
                        opacity: 0;
                    }
                }

                /* --- 3. UI FADE IN --- */
                .ui-element {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 1s ease;
                }
                .ui-element.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Button Hover Glow */
                .btn-glow:hover {
                    box-shadow: 0 0 20px #ffc107;
                    background: #ffc107;
                    color: black;
                }
            `}</style>

            {/* --- FIREWORKS LAYER (Behind Text) --- */}
            <div className={`firework-container ${animationPhase >= 2 ? 'explode' : ''}`}>
                {sparks.map(s => (
                    <div 
                        key={s.id} 
                        className="spark"
                        style={{
                            width: `${s.size}px`,
                            height: `${s.size}px`,
                            backgroundColor: s.color,
                            color: s.color, // used for box-shadow currentColor
                            '--tx': `${s.tx}px`,
                            '--ty': `${s.ty}px`,
                            animationDelay: `${s.delay}s`
                        }}
                    />
                ))}
                {/* Central Flash */}
                <div className="spark" style={{
                    width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,193,7,0.4) 0%, transparent 70%)',
                    left: '-150px', top: '-150px', '--tx': '0px', '--ty': '0px'
                }}></div>
            </div>

            {/* --- MAIN TITLE (Zooms Out) --- */}
            <h1 className={`shivba-title mb-0 ${animationPhase >= 1 ? 'zoom-active' : ''}`}>
                Shivba
            </h1>

            {/* --- SUBTITLE & BUTTON (Reveals After) --- */}
            <div className={`text-center z-1 mt-4 ui-element ${animationPhase >= 3 ? 'visible' : ''}`}>
                <p className="lead text-warning text-uppercase fw-light mb-5" 
                   style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.4em', fontSize: '1rem' }}>
                    Legacy • Strength • Future
                </p>

                <button 
                    onClick={handleEnter}
                    className="btn btn-outline-warning btn-lg rounded-0 px-5 py-3 text-uppercase btn-glow"
                    style={{ 
                        letterSpacing: '0.3em', 
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: '600'
                    }}
                >
                    Enter
                </button>
            </div>
        </div>
    );
};

export default StarterAnimaPage;