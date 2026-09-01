import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, ShieldCheck, Cpu } from 'lucide-react';
import { staggerContainer, fadeUp, fadeIn } from '@/animations/variants';
import { CinematicScene } from '@/three/CinematicScene';
import { SceneFallback } from '@/three/SceneFallback';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useWebGL } from '@/hooks/useWebGL';

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B1F] animate-ping" />
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const mouse = useMouseParallax({ strength: 1, ease: 0.06 });
  const { scrollY } = useScrollProgress();
  const scrollProgress = Math.min(scrollY / 600, 1);
  const webGLSupported = useWebGL();

  const TICKER_ITEMS = [
    '1,200+ CURATED DSA PROBLEMS',
    'CORE COMPUTER SCIENCE (OS, DBMS, CN)',
    'SYSTEM DESIGN DEEP DIVES',
    'AI MOCK TECHNICAL INTERVIEWS',
    'STRUCTURED ROADMAPS & BLIND 75',
    'LIVE CANDIDATE ASSESSMENTS',
    'MULTI-LANGUAGE CODE RUNNER',
    'ENTERPRISE QUESTION BANK',
    'ANALYTICS & STREAK TRACKING',
    'PRODUCTION READY'
  ];

  return (
    <section
      className="relative min-h-screen w-full bg-[#070709] text-white flex flex-col justify-between overflow-hidden pt-28 pb-0"
      id="hero"
      data-testid="hero-section"
    >
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 rig-grid-pattern pointer-events-none opacity-40 z-0" />

      {/* 3D Cinematic Monitor Scene — Right 60% of viewport */}
      <div
        className="absolute right-0 top-0 bottom-12 w-full lg:w-[62%] z-10 pointer-events-none transition-opacity duration-300"
        style={{
          display: scrollY > 1100 ? 'none' : 'block',
          opacity: scrollY > 900 ? 0 : 0.9,
          willChange: 'transform, opacity'
        }}
      >
        {webGLSupported ? (
          <Suspense fallback={<LoadingFallback />}>
            <CinematicScene
              scrollProgress={scrollProgress}
              mouseX={mouse.normalizedX}
              mouseY={mouse.normalizedY}
            />
          </Suspense>
        ) : (
          <SceneFallback
            mouseX={mouse.normalizedX}
            mouseY={mouse.normalizedY}
            scrollProgress={scrollProgress}
          />
        )}
      </div>

      {/* Left Edge Gradient Blend — Ensures text is 100% legible */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/85 to-transparent w-full lg:w-[58%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/40 via-transparent to-[#070709]" />
        {/* Subtle Crimson Ambient Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#FF3B1F]/10 blur-[140px] pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-16 my-auto">
        <div className="max-w-[620px]">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Top Label */}
            <motion.div variants={fadeIn} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/10 text-white/70 text-xs font-mono font-medium tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#FF3B1F] shadow-[0_0_8px_#FF3B1F]" />
                ALL-IN-ONE DSA & ENGINEERING MASTERY PLATFORM
              </span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-[72px] font-bold leading-[0.95] tracking-tight text-white mb-6"
              data-testid="hero-headline"
            >
              Master DSA & Systems.
              <br />
              <span className="bg-gradient-to-r from-white via-white/90 to-[#FF3B1F] bg-clip-text text-transparent">
                Ace Every Interview.
              </span>
            </motion.h1>

            {/* Subtitle Description */}
            <motion.p
              variants={fadeUp}
              className="text-white/65 text-lg sm:text-xl leading-relaxed mb-10 max-w-[520px]"
              data-testid="hero-description"
            >
              The complete technical preparation engine. Solve 1,200+ curated LeetCode problems, master Core CS (OS, DBMS, CN, System Design), train with AI mock interviewers, and launch live coding assessments.
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="
                  rig-chamfer-btn inline-flex items-center gap-2.5 px-8 py-4
                  bg-[#FF3B1F] text-black font-bold text-sm tracking-wide
                  hover:bg-[#E63219] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-[#FF3B1F]/20
                "
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/assessment/algoascent-test-assessment')}
                className="
                  inline-flex items-center gap-2.5 px-7 py-4
                  border border-white/15 bg-white/[0.03] text-white/85 text-sm font-bold
                  hover:border-white/30 hover:bg-white/[0.06] hover:text-white
                  transition-all duration-200
                "
              >
                <span>Try Live Assessment</span>
              </button>
            </motion.div>

            {/* Feature Metrics */}
            <motion.div
              variants={fadeUp}
              className="mt-12 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white/60 font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#FF3B1F]" />
                <span>1,200+ PROBLEMS</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#FF3B1F]" />
                <span>CORE CS & DESIGN</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF3B1F]" />
                <span>AI MOCK INTERVIEWS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B1F]" />
                <span>LIVE ASSESSMENTS</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Marquee Ticker Banner at Bottom of Hero */}
      <div className="relative z-20 w-full bg-[#0E0E14] text-[#FF3B1F] py-3 border-t border-b border-white/10 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8 font-mono text-xs font-bold tracking-widest uppercase">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 whitespace-nowrap">
              <span>{item}</span>
              <span className="text-white/20">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
