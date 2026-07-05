import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, fadeIn } from '@/animations/variants';
import { CinematicScene } from '@/three/CinematicScene';
import { SceneFallback } from '@/three/SceneFallback';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useWebGL } from '@/hooks/useWebGL';

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-white/40 animate-breathe" />
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const mouse = useMouseParallax({ strength: 1, ease: 0.06 });
  const { scrollY } = useScrollProgress();
  const scrollProgress = Math.min(scrollY / 600, 1);
  const webGLSupported = useWebGL();

  return (
    <section
      className="relative min-h-screen w-full flex items-center overflow-hidden"
      id="hero"
      data-testid="hero-section"
    >
      {/* Scene — right 62% of viewport only, never overlaps hero text */}
      <div className="absolute right-0 top-0 bottom-0 w-[62%] z-0">
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

      {/* Left edge fade — blends seamlessly into the 3D scene */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" style={{ width: '52%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-24">
        <div className="max-w-[560px]">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Label */}
            <motion.div variants={fadeIn} className="mb-8">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]"
                data-testid="hero-label"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-breathe" />
                <span className="text-white/55 text-[11px] font-medium letter-widest uppercase tracking-[0.18em]">
                  AlgoAscent
                </span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-[52px] sm:text-[64px] lg:text-[76px] font-bold leading-[0.95] letter-tighter text-white mb-6"
              data-testid="hero-headline"
            >
              Master Every
              <br />
              <span className="text-gradient">Interview.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-white/55 text-lg sm:text-xl leading-relaxed mb-10 max-w-[420px]"
              data-testid="hero-description"
            >
              AI-powered interview prep, interactive roadmaps, and deep coding challenges — built for engineers who refuse to settle.
            </motion.p>

            {/* CTA Group */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <a
                href="/dashboard"
                onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
                className="
                  inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full
                  bg-white text-black text-sm font-semibold
                  hover:bg-white/90 active:scale-[0.98]
                  transition-all duration-200 hover:scale-[1.02]
                "
                data-testid="hero-cta-primary"
              >
                Start for free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <a
                href="#platform"
                className="
                  inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full
                  border border-white/12 text-white/70 text-sm font-medium
                  hover:border-white/25 hover:text-white
                  transition-all duration-300
                "
                data-testid="hero-cta-secondary"
              >
                See how it works
              </a>
            </motion.div>

            {/* Trust badge */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-center gap-5"
              data-testid="hero-trust"
            >
              <div className="flex -space-x-2.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border border-black/40 bg-gradient-to-br from-white/20 to-white/5 ring-1 ring-white/10"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
              </div>
              <p className="text-white/40 text-sm">
                <span className="text-white/70 font-medium">12,000+</span>{' '}
                engineers already ascending
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        data-testid="hero-scroll-indicator"
      >
        <div className="w-px h-12 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full bg-white/40"
            style={{ height: '100%' }}
            animate={{ scaleY: [0, 1], opacity: [1, 0], transformOrigin: 'top' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-white/10" />
        </div>
        <span className="text-white/25 text-[10px] font-medium letter-widest uppercase tracking-[0.2em]">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
