import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 px-6 py-14 text-white shadow-2xl sm:px-10 sm:py-16">
      <div className="absolute inset-0">
        <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-12 -bottom-24 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl" aria-hidden="true" />
        <div className="absolute inset-0 bg-grid-white/5" aria-hidden="true" />
        <div className="absolute inset-x-10 top-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100 backdrop-blur-sm">
          Dashboard • Productivity • Dev Friendly
        </div>

        <h1 className="hero-title-animate bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-5xl md:text-6xl">
          Progress Tracker
        </h1>

        <p className="max-w-2xl text-base text-indigo-100/85 sm:text-lg">
          A minimal, modern dashboard to visualize momentum, celebrate streaks, and keep shipping—built with a clean, developer-friendly UI.
        </p>

        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-50/90 shadow-lg backdrop-blur-sm hero-loading-animate" role="status" aria-live="polite">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
          <span className="font-semibold tracking-wide">Loading Progress…</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;

