import React, { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const StarterAnimaPage = ({ setPage }) => {
    const [phase, setPhase] = useState(0);
    // 0: Init
    // 1: Zoom Out (Text lands)
    // 2: Fireworks (Explosion)
    // 3: Typing (Subtitle appears)
    // 4: Button & Emoji Rain (Final State)
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

        // 4. Show Button & Start Emoji Rain (after typing is done)
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
            }, 50);
            return () => clearInterval(interval);
        } else if (phase >= 4) {
            setTypedText(fullText); // Ensure full text is shown in final phase
        }
    }, [phase, fullText]);

    // Massive Fireworks Data
    const sparks = useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => {
            const angle = Math.random() * 360;
            const velocity = 40 + Math.random() * 60; // 40vmin to 100vmin
            return {
                id: i,
                angle: angle * (Math.PI / 180),
                velocity: velocity,
                color: Math.random() > 0.3 ? '#ffc107' : '#ffffff',
                size: Math.random() * 6 + 2,
                delay: Math.random() * 0.2
            };
        });
    }, []);

    // Falling Emojis Data (Gym, Library, Hostel)
    const backgroundEmojis = useMemo(() => {
        const icons = ['💪', '📚', '🛏️'];
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            icon: icons[Math.floor(Math.random() * icons.length)],
            left: Math.floor(Math.random() * 100) + '%', // Random horizontal pos
            animationDuration: 5 + Math.random() * 10 + 's', // Random fall speed
            animationDelay: Math.random() * 5 + 's', // Random start
            fontSize: 1.5 + Math.random() * 2 + 'rem', // Random size
            opacity: 0.1 + Math.random() * 0.3 // Random opacity (subtle)
        }));
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
                    font-size: 9rem;
                    color: white;
                    text-transform: uppercase;
                    opacity: 0;
                    transform: scale(30);
                    filter: blur(20px);
                    letter-spacing: 50px;
                    transition: all 1.2s cubic-bezier(0.19, 1, 0.22, 1);
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
                    z-index: 1;
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
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
                }

                /* --- 3. EMOJI RAIN (BACKGROUND) --- */
                .emoji-container {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 0; /* Behind everything */
                    pointer-events: none;
                    overflow: hidden;
                }
                .falling-emoji {
                    position: absolute;
                    top: -10vh;
                    animation: dropDown linear infinite;
                }
                @keyframes dropDown {
                    0% { transform: translateY(0) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(360deg); }
                }

                /* --- 4. TYPING SUBTITLE --- */
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
                    min-height: 1.5em;
                    margin-top: 2rem;
                    position: relative; z-index: 10;
                }

                /* --- 5. BUTTON --- */
                .enter-btn-wrapper {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 1s ease;
                    position: relative; z-index: 20; /* On top of emojis */
                }
                .enter-btn-wrapper.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .btn-gold {
                    border: 1px solid #ffc107;
                    color: #ffc107;
                    background: rgba(0,0,0,0.5); /* Slight dark bg to read over emojis */
                    transition: all 0.3s;
                    backdrop-filter: blur(2px);
                }
                .btn-gold:hover {
                    background: #ffc107;
                    color: black;
                    box-shadow: 0 0 30px #ffc107;
                }
            `}</style>

            {/* --- EMOJI RAIN LAYER (Triggers at Phase 4) --- */}
            {phase >= 4 && (
                <div className="emoji-container">
                    {backgroundEmojis.map((item) => (
                        <div 
                            key={item.id}
                            className="falling-emoji"
                            style={{
                                left: item.left,
                                fontSize: item.fontSize,
                                opacity: item.opacity,
                                animationDuration: item.animationDuration,
                                animationDelay: item.animationDelay
                            }}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>
            )}

            {/* --- FIREWORKS LAYER --- */}
            <div className={`firework-stage ${phase >= 2 ? 'explode' : ''}`}>
                {sparks.map(s => {
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

            {/* --- MAIN TITLE --- */}
            <h1 className={`shivba-title mb-0 ${phase >= 1 ? 'landed' : ''}`}>
                Shivba
            </h1>

            {/* --- TYPING SUBTITLE & BUTTON --- */}
            <div className="z-1 text-center">
                <p className="subtitle-text text-white text-uppercase fw-light">
                    {phase >= 3 ? (
                        <span className="typing-cursor">{typedText}</span>
                    ) : (
                        <span style={{opacity:0}}>...</span>
                    )}
                </p>

                <div className={`enter-btn-wrapper mt-5 ${phase >= 4 ? 'visible' : ''}`}>
                    <button 
                        onClick={handleEnter}
                        className="btn btn-lg rounded-0 px-5 py-3 text-uppercase btn-gold"
                        style={{ letterSpacing: '0.2em', fontWeight: '600' }}
                    >
                        Enter
                    </button>
                </div>
            </div>

        </div>
    );
};

export default StarterAnimaPage;