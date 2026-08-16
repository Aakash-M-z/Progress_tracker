import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, fadeIn } from '../animations/variants';

interface HeroProps {
    onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
    return (
        <section
            className="relative min-h-screen w-full flex items-center overflow-hidden"
            id="hero"
            data-testid="hero-section"
        >
            {/* Gradient overlay — left side for text readability */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
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
                                <span className="w-1.5 h-1.5 rounded-full bg-white landing-animate-breathe" />
                                <span className="text-white/55 text-[11px] font-medium landing-letter-widest uppercase tracking-[0.18em]">
                                    AI POWERED LEARNING PLATFORM
                                </span>
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={fadeUp}
                            className="text-[52px] sm:text-[64px] lg:text-[76px] font-bold leading-[0.95] landing-letter-tighter text-white mb-6"
                            data-testid="hero-headline"
                        >
                            Master Every
                            <br />
                            <span
                                className="inline-block"
                                style={{
                                    background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #e879f9 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Interview.
                            </span>
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
                            <button
                                onClick={onGetStarted}
                                className="
                  inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full
                  bg-white text-black text-sm font-semibold
                  hover:bg-white/90 active:scale-[0.98]
                  transition-all duration-200 hover:scale-[1.02]
                "
                                data-testid="hero-cta-primary"
                            >
                                Start Learning
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <button
                                className="
                  inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full
                  border border-white/12 text-white/70 text-sm font-medium
                  hover:border-white/25 hover:text-white
                  transition-all duration-300
                "
                                data-testid="hero-cta-secondary"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5 3.5L10 7L5 10.5V3.5Z" fill="currentColor" />
                                </svg>
                                Watch Demo
                            </button>
                        </motion.div>

                        {/* Trust badge */}
                        <motion.div
                            variants={fadeUp}
                            className="mt-10 flex items-center gap-5"
                            data-testid="hero-trust"
                        >
                            <div className="flex items-center gap-1">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <svg
                                        key={i}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="#fbbf24"
                                        className="drop-shadow-sm"
                                    >
                                        <path d="M8 0L10.163 5.656L16 6.572L12 10.489L12.897 16.172L8 13.656L3.103 16.172L4 10.489L0 6.572L5.837 5.656L8 0Z" />
                                    </svg>
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
                <span className="text-white/25 text-[10px] font-medium landing-letter-widest uppercase tracking-[0.2em]">
                    Scroll
                </span>
            </motion.div>
        </section>
    );
}
