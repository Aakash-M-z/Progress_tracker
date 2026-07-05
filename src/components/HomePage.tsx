import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

interface HomePageProps {
    onGetStarted: () => void;
}

interface HologramCard {
    name: string;
    tx: number;
    ty: number;
    rot: number;
    swayX: number;
    swayY: number;
    swayRot: number;
    delay: number;
}

const HOLOGRAMS: HologramCard[] = [
    { name: 'React', tx: -50, ty: -150, rot: -5, swayX: 10, swayY: -12, swayRot: 3, delay: 0 },
    { name: 'Next.js', tx: 70, ty: -170, rot: 8, swayX: -12, swayY: 10, swayRot: -4, delay: 1.5 },
    { name: 'Java', tx: -130, ty: -110, rot: -12, swayX: 8, swayY: 14, swayRot: 5, delay: 3.0 },
    { name: 'Python', tx: 130, ty: -100, rot: 15, swayX: -8, swayY: -14, swayRot: -6, delay: 4.5 },
    { name: 'Node.js', tx: -30, ty: -220, rot: 3, swayX: 15, swayY: -6, swayRot: 2, delay: 0.8 },
    { name: 'DSA', tx: 60, ty: -230, rot: -6, swayX: -10, swayY: 16, swayRot: -3, delay: 2.3 },
    { name: 'Operating Systems', tx: -110, ty: -180, rot: 10, swayX: 14, swayY: 12, swayRot: 4, delay: 3.8 },
    { name: 'DBMS', tx: 120, ty: -170, rot: -8, swayX: -14, swayY: -10, swayRot: -5, delay: 5.3 },
    { name: 'Computer Networks', tx: -90, ty: -80, rot: 6, swayX: 10, swayY: -10, swayRot: 3, delay: 1.2 },
    { name: 'OOP', tx: 90, ty: -80, rot: -10, swayX: -10, swayY: 10, swayRot: -4, delay: 2.7 },
    { name: 'System Design', tx: 0, ty: -100, rot: 2, swayX: 12, swayY: -12, swayRot: -2, delay: 4.2 },
    { name: 'AI', tx: 15, ty: -50, rot: -4, swayX: -14, swayY: 14, swayRot: 3, delay: 5.7 },
    { name: 'Docker', tx: -150, ty: -210, rot: -15, swayX: 12, swayY: -14, swayRot: -5, delay: 0.4 },
    { name: 'Git', tx: 160, ty: -220, rot: 12, swayX: -12, swayY: -16, swayRot: 6, delay: 1.9 }
];

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX - window.innerWidth / 2) * 0.015;
            const y = (e.clientY - window.innerHeight / 2) * 0.015;
            setMouseOffset({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div 
            className="w-screen h-screen bg-[#030305] text-[#eaeaea] relative overflow-hidden flex flex-col md:flex-row select-none font-sans"
            style={{
                fontFamily: '"Inter", sans-serif'
            }}
        >
            {/* Google Fonts Preloader */}
            <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet" />

            {/* Custom Embedded CSS Styles for Holograms, Fog, and Particles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes hologram-glow-pulse {
                    0%, 100% {
                        box-shadow: 0 0 15px rgba(59, 130, 246, 0.25), inset 0 0 10px rgba(59, 130, 246, 0.15);
                        border-color: rgba(59, 130, 246, 0.45);
                    }
                    50% {
                        box-shadow: 0 0 25px rgba(59, 130, 246, 0.45), inset 0 0 15px rgba(59, 130, 246, 0.25);
                        border-color: rgba(59, 130, 246, 0.7);
                    }
                }
                
                @keyframes hologram-float-up {
                    0% {
                        transform: translate(0px, 0px) scale(0.1) rotate(0deg);
                        opacity: 0;
                        filter: blur(6px);
                    }
                    8% {
                        opacity: 0.85;
                        filter: blur(0px);
                    }
                    35% {
                        transform: translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot));
                        opacity: 0.95;
                    }
                    70% {
                        transform: translate(calc(var(--tx) + var(--sway-x)), calc(var(--ty) + var(--sway-y))) scale(1) rotate(calc(var(--rot) + var(--sway-rot)));
                        opacity: 0.95;
                    }
                    85% {
                        opacity: 0.8;
                        filter: blur(1.5px);
                    }
                    100% {
                        transform: translate(calc(var(--tx) + var(--sway-x) * 1.6), calc(var(--ty) - 50px)) scale(0.75) rotate(calc(var(--rot) + var(--sway-rot) * 1.6));
                        opacity: 0;
                        filter: blur(8px);
                    }
                }

                @keyframes screen-flicker {
                    0%, 100% { opacity: 0.92; }
                    50% { opacity: 1; }
                    80% { opacity: 0.94; }
                }

                @keyframes particle-drift {
                    0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
                    20% { opacity: 0.35; }
                    80% { opacity: 0.35; }
                    100% { transform: translateY(-10vh) translateX(50px); opacity: 0; }
                }

                @keyframes ambient-fog {
                    0%, 100% { opacity: 0.35; transform: scale(1) translate(0px, 0px); }
                    50% { opacity: 0.55; transform: scale(1.15) translate(-20px, 15px); }
                }

                @keyframes keyboard-typing {
                    0%, 100% { opacity: 0.2; }
                    25% { opacity: 0.8; }
                    50% { opacity: 0.4; }
                    75% { opacity: 0.9; }
                }

                .hologram-card {
                    background: rgba(8, 12, 28, 0.35);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(59, 130, 246, 0.35);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2), inset 0 0 10px rgba(59, 130, 246, 0.1);
                    animation: hologram-float-up 9s infinite linear, hologram-glow-pulse 4s infinite ease-in-out;
                    transition: filter 0.3s;
                }

                .hologram-card:hover {
                    filter: brightness(1.25) drop-shadow(0 0 15px rgba(59, 130, 246, 0.6)) !important;
                }
            ` }} />

            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Ambient Deep Blue Volumetric Fog */}
                <div 
                    style={{
                        position: 'absolute',
                        top: '-10%', left: '-10%', width: '120%', height: '120%',
                        background: 'radial-gradient(circle at 75% 50%, rgba(29, 78, 216, 0.18) 0%, rgba(3, 3, 5, 0) 65%)',
                        animation: 'ambient-fog 12s infinite ease-in-out',
                        transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`
                    }}
                />
                <div 
                    style={{
                        position: 'absolute',
                        top: '-10%', left: '-10%', width: '120%', height: '120%',
                        background: 'radial-gradient(circle at 25% 60%, rgba(15, 23, 42, 0.7) 0%, rgba(3, 3, 5, 1) 80%)',
                    }}
                />

                {/* Floating Volumetric Particles */}
                {[...Array(25)].map((_, idx) => {
                    const delay = idx * 0.5;
                    const left = Math.random() * 100;
                    const size = Math.random() * 3 + 1.5;
                    const duration = Math.random() * 8 + 10;
                    return (
                        <div 
                            key={idx}
                            className="absolute rounded-full bg-blue-400/30"
                            style={{
                                left: `${left}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                filter: 'blur(0.5px) drop-shadow(0 0 5px rgba(96, 165, 250, 0.4))',
                                animation: `particle-drift ${duration}s infinite linear`,
                                animationDelay: `${delay}s`,
                                transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`
                            }}
                        />
                    );
                })}
            </div>

            {/* LEFT SIDE (45%) */}
            <div 
                className="w-full md:w-[45%] h-full flex flex-col justify-center px-8 sm:px-12 md:px-20 z-10 relative transition-transform duration-300"
                style={{
                    transform: `translate(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px)`
                }}
            >
                {/* Glowing Badge */}
                <div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 w-fit"
                    style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        color: '#60a5fa',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.1)'
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-ping" />
                    🚀 AI Powered Interview Preparation
                </div>

                {/* Headline */}
                <h1 
                    style={{ 
                        fontFamily: '"Orbitron", "Inter", sans-serif',
                        lineHeight: '1.05',
                        letterSpacing: '-0.02em'
                    }} 
                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#eaeaea] mb-8"
                >
                    MASTER<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-blue-500">TECHNICAL</span><br />
                    INTERVIEWS<br />
                    <span className="text-[#3b82f6]" style={{ textShadow: '0 0 30px rgba(59, 130, 246, 0.35)' }}>WITH AI</span>
                </h1>

                {/* Description */}
                <p className="text-white/60 text-sm md:text-base max-w-md leading-relaxed mb-8 font-light">
                    Master DSA, Operating Systems, DBMS, Computer Networks, OOP, System Design, AI Mock Interviews, and Resources in one immersive platform.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-12">
                    <button 
                        onClick={onGetStarted}
                        className="px-8 py-4 rounded-xl font-extrabold text-xs tracking-wider uppercase bg-white text-black hover:bg-[#3b82f6] hover:text-white transition-all duration-500 shadow-[0_4px_20px_rgba(255,255,255,0.06)] hover:shadow-[0_4px_30px_rgba(59,130,246,0.55)] flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Start Learning <ArrowRight size={14} />
                    </button>
                    <button 
                        className="px-8 py-4 rounded-xl font-extrabold text-xs tracking-wider uppercase border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300 flex items-center gap-2"
                    >
                        <Play size={12} fill="#fff" /> Watch Demo
                    </button>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 gap-4 max-w-sm text-xs font-semibold text-white/40">
                    <div className="flex items-center gap-2">
                        <span className="text-[#3b82f6]">✓</span> AI Mentor
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#3b82f6]">✓</span> Personalized Roadmaps
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#3b82f6]">✓</span> Mock Interviews
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#3b82f6]">✓</span> Interview Ready
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE (55%) */}
            <div 
                className="w-full md:w-[55%] h-full flex items-center justify-center relative overflow-visible z-10"
                style={{
                    transform: `translate(${mouseOffset.x * 1.1}px, ${mouseOffset.y * 1.1}px)`
                }}
            >
                {/* SVG Cinematic Studio workspace */}
                <div className="w-full max-w-[560px] aspect-[4/3] relative flex items-center justify-center">
                    <svg viewBox="0 0 600 450" className="w-full h-full object-contain filter drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                        <defs>
                            {/* Blue ambient spotlight */}
                            <radialGradient id="desk-spot" cx="50%" cy="80%" r="50%">
                                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.65" />
                                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                            </radialGradient>
                            {/* Laptop screen volumetric light */}
                            <linearGradient id="laptop-beam" x1="0.5" y1="0.8" x2="0.5" y2="0">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                                <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                            {/* External monitor screen code */}
                            <pattern id="screen-code" width="40" height="40" patternUnits="userSpaceOnUse">
                                <rect width="30" height="2" fill="#2563eb" opacity="0.3" y="5" />
                                <rect width="20" height="2" fill="#3b82f6" opacity="0.4" y="15" />
                                <rect width="35" height="2" fill="#60a5fa" opacity="0.3" y="25" />
                                <rect width="15" height="2" fill="#2563eb" opacity="0.4" y="35" />
                            </pattern>
                        </defs>

                        {/* Subtle ambient wall glow */}
                        <circle cx="380" cy="180" r="140" fill="url(#desk-spot)" />

                        {/* LED Desk Lamp Volumetric Light Beam */}
                        <polygon points="120,110 50,450 250,450" fill="rgba(59, 130, 246, 0.08)" style={{ filter: 'blur(10px)' }} />

                        {/* Modern Desk top */}
                        <polygon points="80,380 520,380 570,410 30,410" fill="#080c18" stroke="#1d4ed8" strokeWidth="1" strokeOpacity="0.3" />

                        {/* External Widescreen Monitor */}
                        <rect x="220" y="100" width="220" height="130" rx="8" fill="#05070c" stroke="#1e293b" strokeWidth="3" />
                        <rect x="226" y="106" width="208" height="118" rx="4" fill="#020306" />
                        {/* Monitor Content: Glowing matrix code line patterns */}
                        <rect x="236" y="116" width="188" height="98" fill="url(#screen-code)" style={{ animation: 'screen-flicker 5s infinite' }} />
                        {/* Monitor Stand */}
                        <path d="M315,230 L320,300 L340,300 L345,230 Z" fill="#0e172c" />
                        <ellipse cx="330" cy="300" rx="25" ry="5" fill="#0b0f19" />

                        {/* Soft LED lamp on left */}
                        <path d="M120,380 L120,120 A 100,100 0 0,1 210,90" fill="none" stroke="#0e172c" strokeWidth="6" strokeLinecap="round" />
                        <rect x="180" y="85" width="40" height="15" rx="3" fill="#1e3a8a" transform="rotate(-15, 200, 92)" style={{ filter: 'drop-shadow(0 0 5px #3b82f6)' }} />

                        {/* Plant decoration on right */}
                        <rect x="470" y="340" width="25" height="40" rx="2" fill="#0f172a" />
                        <path d="M472,340 C465,310 455,315 450,290 C470,305 478,320 482,340" fill="#0a1224" />
                        <path d="M492,340 C500,310 510,315 515,290 C495,305 488,320 482,340" fill="#080e1c" />

                        {/* Coffee Mug & Mouse */}
                        <rect x="420" y="365" width="14" height="16" rx="2" fill="#1e293b" />
                        <path d="M434,369 C438,369 438,377 434,377" fill="none" stroke="#1e293b" strokeWidth="2" />
                        <ellipse cx="380" cy="378" rx="8" ry="4" fill="#0a0f1d" />

                        {/* Mechanical Keyboard */}
                        <polygon points="240,372 350,372 346,382 236,382" fill="#090d1a" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.4" />
                        <line x1="244" y1="377" x2="342" y2="377" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.8" style={{ animation: 'keyboard-typing 1.8s infinite' }} />

                        {/* The Developer sitting in ergonomic chair (Back profile) */}
                        <path d="M290,260 C265,260 250,285 245,310 C240,335 255,420 255,450 L385,450 C385,420 395,335 390,310 C385,285 375,260 350,260 Z" fill="#05070c" />
                        {/* Head */}
                        <circle cx="320" cy="225" r="22" fill="#05070c" />
                        {/* Shoulders / Neck */}
                        <path d="M305,247 L335,247 L340,265 L300,265 Z" fill="#05070c" />
                        {/* Futuristic ergonomic chair back spine design */}
                        <path d="M320,260 L320,400" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
                        <path d="M285,280 C300,270 340,270 355,280" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                        <path d="M280,315 C300,305 340,305 360,315" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />

                        {/* Glowing Laptop (Opened in front of developer) */}
                        <polygon points="285,342 355,342 360,348 280,348" fill="#1e293b" />
                        <polygon points="290,310 350,310 355,342 285,342" fill="#020306" stroke="#2563eb" strokeWidth="1" />
                        {/* Laptop screen glowing content area */}
                        <polygon points="293,313 347,313 351,340 289,340" fill="#1d4ed8" opacity="0.3" style={{ animation: 'screen-flicker 2.5s infinite' }} />
                        {/* Screen blue glow beam overlay */}
                        <polygon points="290,310 350,310 420,180 220,180" fill="url(#laptop-beam)" style={{ animation: 'screen-flicker 3s infinite' }} />

                        {/* Illuminating glow on Developer's face profile */}
                        <path d="M308,206 C308,206 312,216 316,218 C320,220 326,218 326,218" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.4" style={{ filter: 'blur(1px)' }} />
                    </svg>

                    {/* Holographic thoughts cards stream (DREAM EFFECT) */}
                    <div 
                        style={{
                            position: 'absolute',
                            left: '53.5%', // align directly over the open laptop screen
                            top: '73%',
                            width: '0px',
                            height: '0px',
                            overflow: 'visible'
                        }}
                    >
                        {HOLOGRAMS.map((card, idx) => (
                            <div
                                key={idx}
                                className="hologram-card absolute flex items-center justify-center px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider text-[#60a5fa] border border-blue-500/30 whitespace-nowrap"
                                style={{
                                    '--tx': `${card.tx}px`,
                                    '--ty': `${card.ty}px`,
                                    '--rot': `${card.rot}deg`,
                                    '--sway-x': `${card.swayX}px`,
                                    '--sway-y': `${card.swayY}px`,
                                    '--sway-rot': `${card.swayRot}deg`,
                                    animationDelay: `${card.delay}s`,
                                    transformOrigin: 'bottom center',
                                    left: '-50px', // offset center
                                    width: '100px',
                                    height: '28px',
                                    cursor: 'pointer'
                                } as React.CSSProperties}
                            >
                                <span className="drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">{card.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;