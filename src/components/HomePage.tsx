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

  // Enhanced sparkle effect function
  const createSparkleEffect = (button: HTMLButtonElement) => {
    const sparkles = ['✨', '⭐'];
    const sparkleCount = 3;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('span');
      sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      sparkle.style.position = 'absolute';
      sparkle.style.pointerEvents = 'none';
      sparkle.style.fontSize = '1.2rem';
      sparkle.style.zIndex = '50';
      sparkle.style.opacity = '0';
      sparkle.style.transition = 'all 0.6s ease-out';

      // Simple position around button
      const angle = (i / sparkleCount) * 2 * Math.PI;
      const radius = 40;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      sparkle.style.left = `calc(50% + ${x}px)`;
      sparkle.style.top = `calc(50% + ${y}px)`;
      sparkle.style.transform = 'translate(-50%, -50%) scale(0)';

      button.appendChild(sparkle);

      // Simple animation
      setTimeout(() => {
        sparkle.style.opacity = '0.8';
        sparkle.style.transform = `translate(-50%, -50%) scale(1)`;
      }, i * 100);

      // Remove sparkle
      setTimeout(() => {
        sparkle.style.opacity = '0';
        sparkle.style.transform = `translate(-50%, -50%) scale(0)`;
        setTimeout(() => {
          if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
          }
        }, 600);
      }, 800 + i * 100);
    }
  };

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
            filter: 'brightness(0.7) contrast(1.2) saturate(1.1)',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>

        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40"
          style={{ opacity: videoLoaded ? 1 : 0 }}></div>

        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          style={{ opacity: videoLoaded ? 0 : 1 }}></div>

        {/* Loading indicator */}
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-white/80 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/80 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Loading experience...</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation Header */}
        <header className="flex items-center justify-center px-8 py-8 backdrop-blur-xl bg-white/95 border-b border-white/30 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-xl shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-blue-500/30">
              PT
            </div>
            <div className="text-center">
              <h1 className="text-gray-900 font-black text-2xl md:text-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-500">
                Progress Tracker
              </h1>
              <p className="text-gray-600 text-sm font-medium">Master Your DSA Journey</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="max-w-5xl text-center animate-fadeIn">
            {/* Main Heading */}
            <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-12 animate-fadeIn" style={{
              animationDelay: '0.2s',
              textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 8px 16px rgba(0,0,0,0.6), 0 12px 24px rgba(0,0,0,0.4)'
            }}>
              ONE STOP<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-black drop-shadow-2xl">
                Progress Platform
              </span><br />
              For <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent font-black drop-shadow-2xl">
                TECH Growth
              </span>
            </h1>

            {/* Motivational Quote */}
            <div className="mb-12 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-4xl mx-auto">
                <blockquote
                  key={currentQuote}
                  className="text-white text-xl md:text-2xl lg:text-3xl font-semibold italic text-center animate-fadeIn"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    minHeight: '4rem'
                  }}
                >
                  "{motivationalQuotes[currentQuote]}"
                </blockquote>
                <p className="text-cyan-300 text-lg text-center mt-6 font-semibold">
                  ✨ Start your journey today ✨
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-center mb-16 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={onGetStarted}
                className="sparkle-button relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl border-2 border-white/20 min-w-[320px]"
                onMouseEnter={(e) => {
                  e.currentTarget.classList.add('sparkle-active');
                  createSparkleEffect(e.currentTarget);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove('sparkle-active');
                }}
              >
                <span className="relative z-40 flex items-center justify-center gap-3">
                  <span>🚀</span>
                  Start Your Journey
                </span>
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