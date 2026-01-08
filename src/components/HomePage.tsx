import React, { useState, useEffect } from 'react';
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
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Preload video for better performance
    const video = document.createElement('video');
    video.src = '/background-video.mp4';
    video.load();
  }, []);
  return (
    <div className="min-h-screen relative overflow-hidden transition-all duration-300 hover:bg-slate-900/5" onClick={() => {
      // Manual play trigger on click if autoplay failed
      const video = document.querySelector('video');
      if (video && video.paused) {
        video.play().catch(err => console.log('Manual play failed:', err));
      }
    }}>
      {/* Compressed Video Background with Effects */}
      <div className="absolute inset-0 z-0">
        {/* Video Element */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          onLoadedData={() => {
            console.log('Video loaded successfully');
            setVideoLoaded(true);
          }}
          onError={(e) => {
            console.error('Video error:', e);
            setVideoError(true);
          }}
          onCanPlay={() => {
            console.log('Video can play');
            setVideoLoaded(true);
          }}
          onLoadStart={() => {
            console.log('Video load started');
          }}
          onPlaying={() => {
            console.log('Video is playing');
          }}
          style={{
            filter: 'brightness(0.7) contrast(1.0) saturate(1.1)',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 1s ease-in-out'
          }}
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>

        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          style={{ opacity: videoLoaded ? 0 : 1 }}></div>

        {/* Loading indicator */}
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-white/60 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-2"></div>
              <p className="text-sm">Loading background video...</p>
            </div>
          </div>
        )}

        {/* Video overlay effects for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/40 via-slate-900/20 to-slate-950/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20"></div>

        {/* Subtle animated overlay for depth */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-slow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-500/8 blur-3xl animate-float" />
        </div>
      </div>

      {/* Content - Left Aligned with Reduced Opacity */}
      <div className="relative z-10 text-white" style={{ opacity: 0.9 }}>
        <header className="px-8 pt-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-3 cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95 hover:opacity-100 opacity-80">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-lg font-bold backdrop-blur-sm border border-white/10 transition-all duration-200 hover:shadow-indigo-500/50 hover:border-white/20">
              PT
            </div>
            <div>
              <p className="text-sm text-indigo-100/90 font-medium">Progress Tracker</p>
              <p className="text-xs text-indigo-100/70">Built for focused devs</p>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-950 backdrop-blur-sm border border-white/10 hover:border-white/20"
          >
            Get Started
          </button>
        </header>

        <main className="px-8 pb-16 w-full">
          {/* Left-aligned Hero Section */}
          <div className="mt-8 mb-12 text-left max-w-4xl opacity-85 transform transition-all duration-300 hover:opacity-100 hover:scale-[1.01] cursor-pointer">
            <Hero />
          </div>

          {/* Left-aligned Feature Cards */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mb-12">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:bg-white/15 active:scale-95 cursor-pointer opacity-80 hover:opacity-100 hover:border-white/30`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone}`} aria-hidden="true" />
                <div className="relative space-y-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm transition-all duration-200 hover:bg-white/30 hover:scale-110">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-indigo-50/90 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Left-aligned Bottom Section */}
          <section className="grid gap-6 lg:grid-cols-2 max-w-6xl">
            <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-600/40 via-indigo-700/30 to-slate-900/40 p-8 shadow-2xl backdrop-blur-lg opacity-85 hover:opacity-100 transform transition-all duration-300 hover:scale-[1.02] hover:border-white/30 cursor-pointer">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/80 mb-4">Why builders love it</p>
              <h2 className="text-2xl font-bold mb-3 text-white">Developer-first productivity</h2>
              <p className="text-indigo-50/90 leading-relaxed">
                Progress Tracker blends dashboards, streaks, and clear roadmaps to help you ship more.
                Inspired by modern learning hubs like takeUforward's focus on consistency and clarity, this UI keeps you in flow.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {['Clean dashboards', 'Heatmaps', 'Streaks', 'Topic progress', 'Role-aware access'].map((pill) => (
                  <span key={pill} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-indigo-50/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/40 hover:scale-105 cursor-pointer">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg flex flex-col justify-between opacity-85 hover:opacity-100 transform transition-all duration-300 hover:scale-[1.02] hover:border-white/30 cursor-pointer">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/80">Get started</p>
                <h3 className="text-xl font-semibold text-white">Spin it up locally</h3>
                <p className="text-sm text-indigo-50/90 leading-relaxed">
                  Run the backend on <span className="font-semibold text-white">3001</span>, frontend on <span className="font-semibold text-white">5000</span>, and keep your DATABASE_URL handy.
                </p>
              </div>
              <button
                onClick={onGetStarted}
                className="mt-6 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-slate-950 backdrop-blur-sm"
              >
                Continue to Login
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomePage;