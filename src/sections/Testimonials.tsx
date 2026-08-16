import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, fadeUp, fadeIn, scaleIn } from '@/animations/variants';

const TESTIMONIALS = [
  {
    id: 't1',
    quote: "AlgoAscent is the first platform that actually feels like it was built by engineers, for engineers. The AI interview practice is frighteningly accurate.",
    author: 'Priya Sharma',
    role: 'Software Engineer, Google',
    initials: 'PS',
  },
  {
    id: 't2',
    quote: "I went from 0 FAANG offers in 2 years to 3 offers in 6 weeks. The roadmap showed me exactly what I was missing. Nothing else comes close.",
    author: 'Marcus Chen',
    role: 'Senior Engineer, Meta',
    initials: 'MC',
  },
  {
    id: 't3',
    quote: "The system design modules alone are worth 10x the subscription. Clear, structured, and actually relevant to what interviewers care about.",
    author: 'Arjun Patel',
    role: 'Staff Engineer, Stripe',
    initials: 'AP',
  },
  {
    id: 't4',
    quote: "I've tried every platform. AlgoAscent is the only one that personalized my prep instead of just dumping problems at me.",
    author: 'Sarah Kim',
    role: 'Backend Engineer, Airbnb',
    initials: 'SK',
  },
  {
    id: 't5',
    quote: "The AI core gives feedback that's more useful than most human mock interviewers. It caught patterns I didn't even know I had.",
    author: 'David Laurent',
    role: 'Engineering Lead, Linear',
    initials: 'DL',
  },
  {
    id: 't6',
    quote: "Clean, focused, and brutally effective. This is what all interview prep platforms should aspire to be.",
    author: 'Neha Gupta',
    role: 'Senior SWE, Amazon',
    initials: 'NG',
  },
];

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      id="testimonials"
      className="relative py-32 lg:py-40 px-6 lg:px-12"
      data-testid="testimonials-section"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-20"
        >
          <motion.span
            variants={fadeIn}
            className="inline-block text-white/35 text-[11px] font-medium letter-widest uppercase tracking-[0.2em] mb-5"
          >
            From engineers
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-[40px] sm:text-[52px] font-bold leading-[1.0] letter-tight text-white"
          >
            The results speak.
          </motion.h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.id}
              variants={scaleIn}
              className="
                group p-7 rounded-2xl border border-white/[0.07] bg-white/[0.02]
                hover:bg-white/[0.04] hover:border-white/[0.12]
                transition-all duration-500
              "
              data-testid={`testimonial-${t.id}`}
            >
              {/* Quote mark */}
              <div className="text-white/15 text-4xl font-serif leading-none mb-4 select-none">"</div>

              {/* Quote text */}
              <p className="text-white/65 text-[15px] leading-relaxed mb-6">
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="
                  w-9 h-9 rounded-full border border-white/15
                  bg-white/[0.06] flex items-center justify-center
                  text-white/60 text-xs font-semibold
                ">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">{t.author}</p>
                  <p className="text-white/35 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
