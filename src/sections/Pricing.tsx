import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, fadeUp, fadeIn } from '@/animations/variants';
import type { PricingTier } from '@/types';

const TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started and explore the fundamentals.',
    features: [
      '50 coding challenges',
      'Basic roadmap access',
      '5 AI practice sessions / mo',
      'Community support',
    ],
    highlighted: false,
    ctaLabel: 'Start free',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'Everything you need to land your dream role.',
    features: [
      'Unlimited challenges',
      'Full roadmap + all tracks',
      'Unlimited AI practice',
      'System design deep-dives',
      'Analytics & insights',
      'Priority support',
      'Dedicated Discord channel',
    ],
    highlighted: true,
    ctaLabel: 'Start with Pro',
  },
  {
    name: 'Team',
    price: '$99',
    period: 'per month',
    description: 'Upskill your entire engineering team.',
    features: [
      'Up to 10 seats',
      'Everything in Pro',
      'Team analytics dashboard',
      'Custom learning paths',
      'Dedicated success manager',
      'SSO & advanced security',
    ],
    highlighted: false,
    ctaLabel: 'Contact sales',
  },
];

export function Pricing() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      id="pricing"
      className="relative py-32 lg:py-40 px-6 lg:px-12"
      data-testid="pricing-section"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-white/[0.012] blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeIn}
            className="inline-block text-white/35 text-[11px] font-medium letter-widest uppercase tracking-[0.2em] mb-5"
          >
            Pricing
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-[40px] sm:text-[52px] font-bold leading-[1.0] letter-tight text-white mb-5"
          >
            Invest in yourself.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50 text-lg max-w-md mx-auto">
            Less than a gym membership. Infinitely more career-defining.
          </motion.p>
        </motion.div>

        {/* Tiers */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"
        >
          {TIERS.map((tier) => (
            <motion.div
              key={tier.name}
              variants={fadeUp}
              className={`
                relative p-8 rounded-2xl
                ${tier.highlighted
                  ? 'border border-white/20 bg-white/[0.05] ring-1 ring-white/10'
                  : 'border border-white/[0.07] bg-white/[0.02]'
                }
              `}
              data-testid={`pricing-tier-${tier.name.toLowerCase()}`}
            >
              {tier.highlighted && (
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              )}

              {/* Tier name */}
              <p className="text-white/45 text-[11px] font-medium uppercase tracking-[0.18em] mb-5">
                {tier.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[44px] font-bold letter-tight text-white leading-none">
                  {tier.price}
                </span>
                <span className="text-white/35 text-sm">/ {tier.period}</span>
              </div>

              {/* Description */}
              <p className="text-white/45 text-sm mb-8 leading-relaxed">
                {tier.description}
              </p>

              {/* CTA */}
              <a
                href="/dashboard"
                onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
                className={`
                  block w-full py-3 rounded-xl text-sm font-semibold text-center mb-8
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                  ${tier.highlighted
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'border border-white/12 text-white/70 hover:border-white/25 hover:text-white'
                  }
                `}
                data-testid={`pricing-cta-${tier.name.toLowerCase()}`}
              >
                {tier.ctaLabel}
              </a>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 text-white/55 text-sm">
                    <svg className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center text-white/30 text-sm mt-10"
        >
          30-day money-back guarantee. No questions asked.
        </motion.p>
      </div>
    </section>
  );
}
