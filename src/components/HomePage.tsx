import React from 'react';
import Hero from './Hero';

interface HomePageProps {
  onGetStarted: () => void;
}

const featureCards = [
  {
    title: 'Track Every Win',
    desc: 'Log DSA problems, notes, and time spent to keep your momentum visible.',
    icon: '📈',
    tone: 'from-emerald-500/20 to-emerald-400/10',
  },
  {
    title: 'Stay Consistent',
    desc: 'Daily streaks, badges, and reminders keep you accountable to your roadmap.',
    icon: '🔥',
    tone: 'from-orange-500/20 to-amber-400/10',
  },
  {
    title: 'Learn with Clarity',
    desc: 'Clean dashboards, heatmaps, and topic progress give instant signal on where to focus.',
    icon: '🧭',
    tone: 'from-indigo-500/20 to-purple-400/10',
  },
];

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="max-w-6xl mx-auto px-6 pt-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-lg font-bold">
            PT
          </div>
          <div>
            <p className="text-sm text-indigo-100/70">Progress Tracker</p>
            <p className="text-xs text-indigo-100/50">Built for focused devs</p>
          </div>
        </div>
        <button
          onClick={onGetStarted}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Get Started
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        <Hero />

        <section className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg transition transform hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.tone}`} aria-hidden="true" />
              <div className="relative space-y-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-2xl">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-sm text-indigo-50/80 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/60 via-indigo-700/40 to-slate-900/60 p-8 shadow-2xl backdrop-blur-lg">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/70 mb-4">Why builders love it</p>
            <h2 className="text-2xl font-bold mb-3">Developer-first productivity</h2>
            <p className="text-indigo-50/80 leading-relaxed">
              Progress Tracker blends dashboards, streaks, and clear roadmaps to help you ship more.
              Inspired by modern learning hubs like takeUforward’s focus on consistency and clarity, this UI keeps you in flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {['Clean dashboards', 'Heatmaps', 'Streaks', 'Topic progress', 'Role-aware access'].map((pill) => (
                <span key={pill} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-indigo-50/80">
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/70">Get started</p>
              <h3 className="text-xl font-semibold">Spin it up locally</h3>
              <p className="text-sm text-indigo-50/80 leading-relaxed">
                Run the backend on <span className="font-semibold">3001</span>, frontend on <span className="font-semibold">5000</span>, and keep your DATABASE_URL handy.
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="mt-6 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Continue to Login
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;

