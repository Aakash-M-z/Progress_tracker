import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, fadeUp, fadeIn, scaleIn } from '@/animations/variants';

const FEATURES = [
  {
    id: 'ai-practice',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.41 1.41M14.36 14.36l1.41 1.41M4.22 15.78l1.41-1.41M14.36 5.64l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'AI Interview Practice',
    title: 'Practice with intelligence.',
    description: 'Conversational AI that adapts to your level, gives precise feedback, and simulates real interview environments from top tech companies.',
  },
  {
    id: 'roadmap',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 7v11h14V7L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Interactive Roadmaps',
    title: 'Know exactly where you stand.',
    description: 'Dynamic learning paths across DSA, system design, and full-stack. Every step is tracked, every gap is surfaced.',
  },
  {
    id: 'challenges',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 4h12v8H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 16h6M10 12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 7l1.5 1.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Coding Challenges',
    title: 'Problems that actually matter.',
    description: 'Curated challenges mirroring real FAANG interviews. Detailed explanations, multiple approaches, and time complexity breakdowns.',
  },
  {
    id: 'system-design',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="7" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8v2M15 8v2M10 12V10M5 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'System Design',
    title: 'Think at scale.',
    description: 'Master distributed systems, scalability patterns, and architectural decisions that define senior engineering interviews.',
  },
  {
    id: 'personalized',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'Personalized Learning',
    title: 'Built around you.',
    description: 'AI identifies your weak spots, builds a custom curriculum, and adjusts difficulty as you improve. No generic one-size-fits-all.',
  },
  {
    id: 'analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 14l4-4 3 3 4-5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: 'Deep Analytics',
    title: 'Measure what matters.',
    description: 'Track solve times, pattern recognition speed, consistency, and interview readiness with precision metrics that don\'t lie.',
  },
];

export function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      id="platform"
      className="relative py-32 lg:py-40 px-6 lg:px-12"
      data-testid="features-section"
    >
      {/* Section header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-xl mb-20 lg:mb-28"
        >
          <motion.span
            variants={fadeIn}
            className="inline-block text-white/35 text-[11px] font-medium letter-widest uppercase tracking-[0.2em] mb-5"
          >
            Platform
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-[40px] sm:text-[52px] font-bold leading-[1.0] letter-tight text-white mb-5"
          >
            Everything you need.
            <br />
            <span className="text-white/40">Nothing you don't.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 text-lg leading-relaxed">
            A complete interview preparation system, engineered for depth over breadth.
          </motion.p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              variants={fadeUp}
              className="
                group relative p-8 bg-black
                hover:bg-white/[0.02] transition-colors duration-500 cursor-default
              "
              data-testid={`feature-${feature.id}`}
            >
              {/* Icon */}
              <div className="
                w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04]
                flex items-center justify-center text-white/60 mb-6
                group-hover:border-white/20 group-hover:text-white/80
                transition-all duration-300
              ">
                {feature.icon}
              </div>

              {/* Label */}
              <p className="text-white/30 text-[11px] font-medium uppercase tracking-[0.16em] mb-3">
                {feature.label}
              </p>

              {/* Title */}
              <h3 className="text-white text-lg font-semibold leading-snug mb-3 letter-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-white/45 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover border accent */}
              <div className="
                absolute bottom-0 left-8 right-8 h-px
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-500
              " />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
