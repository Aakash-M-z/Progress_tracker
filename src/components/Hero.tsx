import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-slate-900/80 via-indigo-900/70 to-slate-950/80 px-6 py-14 text-white shadow-2xl sm:px-10 sm:py-16 opacity-90">
      <div className="absolute inset-0">
        <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-12 -bottom-24 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" aria-hidden="true" />
        <div className="absolute inset-0 bg-grid-white/3" aria-hidden="true" />
        <div className="absolute inset-x-10 top-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100/70 backdrop-blur-sm opacity-75">
          Dashboard • Productivity • Dev Friendly
        </div>

        <h1 className="hero-title-animate bg-gradient-to-r from-white/60 via-indigo-200/70 to-white/60 bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-5xl md:text-6xl cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:scale-102 active:scale-98 opacity-70 hover:opacity-85">
          Progress Tracker
        </h1>

        <p className="max-w-2xl text-base text-indigo-100/70 sm:text-lg opacity-80">
          A minimal, modern dashboard to visualize momentum, celebrate streaks, and keep shipping—built with a clean, developer-friendly UI.
        </p>

        <div className="flex items-center gap-3 rounded-full border border-white/8 bg-white/3 px-4 py-2 text-sm text-indigo-50/70 shadow-lg backdrop-blur-sm hero-loading-animate opacity-75" role="status" aria-live="polite">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400/80 animate-ping" aria-hidden="true" />
          <span className="font-semibold tracking-wide">Track Your Progress</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;

