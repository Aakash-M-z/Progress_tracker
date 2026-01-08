import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onGetStarted: () => void;
}

const motivationalQuotes = [
  "Every expert was once a beginner. Every pro was once an amateur.",
  "The journey of a thousand miles begins with one step.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Code is like humor. When you have to explain it, it's bad."
];

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    // Preload video for better performance
    const video = document.createElement('video');
    video.src = '/background-video.mp4';
    video.load();

    // Rotate quotes every 5 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" onClick={() => {
      // Manual play trigger on click if autoplay failed
      const video = document.querySelector('video');
      if (video && video.paused) {
        video.play().catch(err => console.log('Manual play failed:', err));
      }
    }}>
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
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
          style={{
            filter: 'brightness(1.1) contrast(1.4) saturate(1.3)',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
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
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* No overlay - full video visibility */}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation Header */}
        <header className="flex items-center justify-between px-8 py-6 backdrop-blur-md bg-white/80 border-b border-gray-200 opacity-85">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-xl">
              PT
            </div>
            <span className="text-gray-900 font-semibold text-lg">Progress Tracker</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium flex items-center gap-2">
              <span>🏠</span> Home
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium flex items-center gap-2">
              <span>📊</span> Plus Dashboard
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium flex items-center gap-2">
              <span>💎</span> Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg border border-gray-300">
              <span className="text-white text-xs font-semibold">U</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8 opacity-90">
          <div className="max-w-4xl text-center animate-fadeIn">
            {/* Learners Count Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-300 rounded-full px-5 py-2 mb-8 animate-slideIn opacity-75">
              <span className="text-gray-800 text-sm font-semibold">15,847+ Learners</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-gray-900 text-5xl md:text-6xl font-black leading-tight mb-8 animate-fadeIn opacity-90" style={{
              animationDelay: '0.2s',
              textShadow: '0 2px 4px rgba(255,255,255,0.9), 0 4px 8px rgba(255,255,255,0.7)'
            }}>
              ONE STOP<br />
              <span className="bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent font-black" style={{
                textShadow: '0 2px 4px rgba(255,255,255,0.9)'
              }}>Progress Platform</span><br />
              For <span className="bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent font-black" style={{
                textShadow: '0 2px 4px rgba(255,255,255,0.9)'
              }}>TECH Growth</span>
            </h1>

            {/* Motivational Quote */}
            <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <blockquote
                key={currentQuote}
                className="text-gray-800 text-xl md:text-2xl font-semibold italic text-center max-w-3xl mx-auto animate-fadeIn"
                style={{
                  textShadow: '0 2px 4px rgba(255,255,255,0.8)',
                  minHeight: '3rem'
                }}
              >
                {motivationalQuotes[currentQuote]}
              </blockquote>
              <p className="text-gray-600 text-sm text-center mt-3 font-medium">
                ✨ Start your journey today ✨
              </p>
            </div>

            {/* Action Buttons with Sparkle Effect */}
            <div className="flex items-center justify-center gap-4 mb-12 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={onGetStarted}
                className="relative overflow-hidden bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl border border-gray-700 sparkle-button"
                onMouseEnter={(e) => {
                  e.currentTarget.classList.add('sparkle-active');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove('sparkle-active');
                }}
              >
                <span className="relative z-10">Start Tracking for Free</span>
                <div className="sparkle-overlay absolute inset-0 opacity-0 transition-opacity duration-300"></div>
              </button>
              <button
                className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl sparkle-button"
                onMouseEnter={(e) => {
                  e.currentTarget.classList.add('sparkle-active');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove('sparkle-active');
                }}
              >
                <span className="relative z-10">Explore Premium →</span>
                <div className="sparkle-overlay absolute inset-0 opacity-0 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;