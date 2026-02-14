import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const StarterAnimaPage = ({ setPage }) => {
    const [phase, setPhase] = useState(0);
    // 0: Init
    // 1: Zoom Out (Text lands)
    // 2: Fireworks (Explosion)
    // 3: Typing (Subtitle appears)
    // 4: Button (Ready)
    // 5: Exit

    const [typedText, setTypedText] = useState('');
    const fullText = "Legacy • Strength • Future";

    useEffect(() => {
        // 1. Start Zoom
        const timer1 = setTimeout(() => setPhase(1), 100);

        // 2. Trigger Fireworks (just as zoom hits)
        const timer2 = setTimeout(() => setPhase(2), 1200);

        // 3. Start Typing Subtitle (after fireworks expand)
        const timer3 = setTimeout(() => setPhase(3), 2000);

        // 4. Show Button (after typing is mostly done)
        const timer4 = setTimeout(() => setPhase(4), 3500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, []);

    // Typing Effect Logic
    useEffect(() => {
        if (phase === 3) {
            let index = 0;
            const interval = setInterval(() => {
                setTypedText(fullText.slice(0, index + 1));
                index++;
                if (index >= fullText.length) clearInterval(interval);
            }, 50); // Speed of typing
            return () => clearInterval(interval);
        }
    }, [phase, fullText]);

    // Massive Fireworks Data
    const sparks = useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => {
            // Random direction in 360 degrees
            const angle = Math.random() * 360;
            // Random distance (Large to fill screen)
            const velocity = 40 + Math.random() * 60; // 40vmin to 100vmin
            
            return {
                id: i,
                angle: angle * (Math.PI / 180), // rads
                velocity: velocity,
                color: Math.random() > 0.3 ? '#ffc107' : '#ffffff', // Mostly Gold
                size: Math.random() * 6 + 2,
                delay: Math.random() * 0.2
            };
        });
    }, []);

    const handleEnter = () => {
        setPhase(5); // Exit Fade
        setTimeout(() => setPage({ name: 'home' }), 1000);
    };

    return (
        <div className={`container-fluid vh-100 bg-black d-flex flex-column justify-content-center align-items-center overflow-hidden position-relative p-0 fade ${phase === 5 ? '' : 'show'}`} 
             style={{ transition: 'opacity 1s ease' }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@400;500;600&display=swap');

                /* --- 1. ZOOM OUT TITLE --- */
                .shivba-title {
                    font-family: 'Cinzel', serif;
                    font-size: 9rem; /* Massive */
                    color: white;
                    text-transform: uppercase;
                    opacity: 0;
                    transform: scale(30); /* Starts Huge */
                    filter: blur(20px);
                    letter-spacing: 50px;
                    transition: all 1.2s cubic-bezier(0.19, 1, 0.22, 1); /* Dramatic ease */
                    position: relative;
                    z-index: 10;
                    text-shadow: 0 0 20px rgba(0,0,0,0.8);
                }

                .shivba-title.landed {
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(0);
                    letter-spacing: 15px;
                }

                @media (max-width: 768px) {
                    .shivba-title { font-size: 3.5rem; }
                    .shivba-title.landed { letter-spacing: 5px; }
                }

                /* --- 2. MASSIVE FIREWORKS --- */
                .firework-stage {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 0; height: 0;
                    z-index: 1; /* Behind text */
                }

                .spark {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0;
                }

                .explode .spark {
                    animation: bigBang 2s ease-out forwards;
                }

                @keyframes bigBang {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        /* Move based on CSS variables */
                        transform: translate(var(--tx), var(--ty)) scale(0);
                        opacity: 0;
                    }
                }

                /* --- 3. TYPING SUBTITLE --- */
                .typing-cursor::after {
                    content: '|';
                    animation: blink 1s step-end infinite;
                    color: #ffc107;
                }
                @keyframes blink { 50% { opacity: 0; } }

                .subtitle-text {
                    font-family: 'Montserrat', sans-serif;
                    letter-spacing: 0.3em;
                    font-size: 1.2rem;
                    min-height: 1.5em; /* Reserve space */
                    margin-top: 2rem;
                }

                /* --- 4. BUTTON FADE IN --- */
                .enter-btn-wrapper {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 1s ease;
                }
                .enter-btn-wrapper.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .btn-gold {
                    border: 1px solid #ffc107;
                    color: #ffc107;
                    background: transparent;
                    transition: all 0.3s;
                }
                .btn-gold:hover {
                    background: #ffc107;
                    color: black;
                    box-shadow: 0 0 30px #ffc107;
                }

            `}</style>

            {/* --- FIREWORKS LAYER --- */}
            <div className={`firework-stage ${phase >= 2 ? 'explode' : ''}`}>
                {sparks.map(s => {
                    // Calculate end position using trigonometry relative to Viewport Min (vmin)
                    // This ensures particles fly off towards the edges of the screen
                    
                    // REMOVED UNUSED 'dist' VARIABLE HERE
                    const x = Math.cos(s.angle) * s.velocity + 'vmin';
                    const y = Math.sin(s.angle) * s.velocity + 'vmin';

                    return (
                        <div 
                            key={s.id} 
                            className="spark"
                            style={{
                                width: `${s.size}px`,
                                height: `${s.size}px`,
                                backgroundColor: s.color,
                                boxShadow: `0 0 10px ${s.color}`,
                                '--tx': x,
                                '--ty': y,
                                animationDelay: `${s.delay}s`
                            }}
                        />
                    );
                })}
            </div>

            {/* --- MAIN TITLE (Zooms Out) --- */}
            <h1 className={`shivba-title mb-0 ${phase >= 1 ? 'landed' : ''}`}>
                Shivba
            </h1>

            {/* --- TYPING SUBTITLE --- */}
            <div className="z-1 text-center">
                <p className="subtitle-text text-white text-uppercase fw-light">
                    {phase >= 3 ? (
                        <span className="typing-cursor">{typedText}</span>
                    ) : (
                        <span style={{opacity:0}}>...</span> // Invisible placeholder
                    )}
                </p>

                {/* --- BUTTON (Reveals Last) --- */}
                <div className={`enter-btn-wrapper mt-5 ${phase >= 4 ? 'visible' : ''}`}>
                    <button 
                        onClick={handleEnter}
                        className="btn btn-lg rounded-0 px-5 py-3 text-uppercase btn-gold"
                        style={{ 
                            letterSpacing: '0.2em', 
                            fontWeight: '600'
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