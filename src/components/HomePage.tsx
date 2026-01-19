import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default');
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);

  useEffect(() => {
    // Preload video for better performance
    const video = document.createElement('video');
    video.src = '/27669-365224683_small.mp4';
    video.load();

    // Show loading animation for 3 seconds
    const loadingTimer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Custom cursor logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setCursorState('click');
      setTimeout(() => setCursorState('default'), 200);
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.classList.contains('clickable')) {
        setCursorState('hover');
      }
    };

    const handleMouseLeave = () => {
      setCursorState('default');
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);

    const interactiveElements = document.querySelectorAll('button, .clickable, input, textarea');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      interactiveElements.forEach(element => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [showLoading]);

  // Create water drop ripple effect
  const createRipple = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      timestamp: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  };

  // Handle page click for water drop effect
  const handlePageClick = (e: React.MouseEvent) => {
    const newRipple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  };

  // Enhanced sparkle effect function
  return (
    <>
      {/* Custom Cursor */}
      <div
        className={`custom-cursor ${cursorState} ${showLoading ? 'loading' : ''}`}
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
        }}
      />

      {/* Loading Screen with enhanced clarity */}
      {showLoading && (
        <div className="fixed inset-0 z-50 loading-enhanced flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            {/* Progress Tracker Logo with better visibility */}
            <div className="mb-8">
              <div className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-white/20 via-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl animate-enhanced-glow border-2 border-white/30">
                PT
              </div>
            </div>

            {/* Progress Tracker Title with enhanced readability */}
            <h1 className="text-white font-black text-5xl md:text-6xl mb-6 text-shadow-enhanced animate-pulse">
              Progress Tracker
            </h1>

            {/* Loading Animation with cosmic colors and better visibility */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg shadow-white/50" style={{ animationDelay: '0ms', boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)' }}></div>
                <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50" style={{ animationDelay: '150ms', boxShadow: '0 0 15px rgba(59, 130, 246, 0.6)' }}></div>
                <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '300ms', boxShadow: '0 0 15px rgba(147, 51, 234, 0.6)' }}></div>
              </div>
            </div>

            {/* Loading Text with better contrast */}
            <p className="text-white/90 text-xl font-semibold animate-pulse text-shadow-enhanced">
              Loading your journey...
            </p>

            {/* Progress Bar with enhanced visibility */}
            <div className="mt-10 w-80 mx-auto">
              <div className="w-full bg-black/50 rounded-full h-3 border border-white/20">
                <div className="bg-gradient-to-r from-white via-blue-400 to-purple-500 h-3 rounded-full animate-pulse shadow-lg" style={{
                  width: '100%',
                  animation: 'loadingProgress 3s ease-in-out',
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`homepage-container min-h-screen relative overflow-hidden transition-opacity duration-1000 ${showLoading ? 'opacity-0' : 'opacity-100'}`}
        onClick={handlePageClick}
      >
        {/* Water Drop Ripples */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="water-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}

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
              filter: 'brightness(0.7) contrast(1.3) saturate(1.0)',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
          >
            <source src="/27669-365224683_small.mp4" type="video/mp4" />
          </video>

          {/* Reduced overlay gradients for better video visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/15 to-black/40"></div>

          {/* Animated floating particles with cosmic colors */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float opacity-40"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              >
                <div className={`w-2 h-2 rounded-full ${i % 4 === 0 ? 'bg-purple-400 shadow-purple-400/50' :
                  i % 4 === 1 ? 'bg-blue-400 shadow-blue-400/50' :
                    i % 4 === 2 ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-white shadow-white/50'
                  } animate-pulse shadow-lg`} style={{
                    boxShadow: `0 0 10px currentColor`
                  }}></div>
              </div>
            ))}
          </div>

          {/* Enhanced shooting stars effect with cosmic colors */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-shooting-star opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  animationDelay: `${i * 2.5 + Math.random() * 2}s`,
                  animationDuration: '3.5s'
                }}
              >
                <div className={`w-1 h-24 transform rotate-45 ${i % 3 === 0 ? 'bg-gradient-to-b from-white via-purple-300 to-transparent' :
                  i % 3 === 1 ? 'bg-gradient-to-b from-white via-blue-300 to-transparent' :
                    'bg-gradient-to-b from-white via-cyan-300 to-transparent'
                  }`} style={{
                    boxShadow: `0 0 20px rgba(255, 255, 255, 0.6)`
                  }}></div>
              </div>
            ))}
          </div>

          {/* Fallback dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950"
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

        {/* Content Layer - Enhanced button layout */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Pulsing rings */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-blue-400/20 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-purple-400/20 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>

            {/* Floating geometric shapes */}
            <div className="absolute top-1/3 right-1/5 w-8 h-8 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 transform rotate-45 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/3 left-1/5 w-6 h-6 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          {/* Start Your Journey Button - appears after loading */}
          {!showLoading && (
            <div className="animate-slideInFromBottom">
              {/* Enhanced decorative elements */}
              <div className="relative">
                {/* Glowing lines */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse"></div>
                <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent animate-pulse"></div>

                {/* Enhanced side elements */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-24">
                  <div className="flex flex-col space-y-6">
                    <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>

                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-24">
                  <div className="flex flex-col space-y-6">
                    <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                    <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '1.3s' }}></div>
                  </div>
                </div>

                {/* Enhanced button with cosmic effects */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      createRipple(e);
                      onGetStarted();
                    }}
                    className="group relative overflow-hidden bg-black/50 backdrop-blur-lg border-2 border-white/40 text-white px-16 py-8 rounded-3xl font-bold text-2xl hover:bg-black/30 hover:border-white/60 transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-white/30 min-w-[420px] max-w-[520px] cosmic-button opacity-95 hover:opacity-100 clickable magnetic-cursor water-drop-button"
                    onMouseEnter={(e) => {
                      setCursorState('hover');
                      // Enhanced magnetic effect
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      setCursorPosition({ x: centerX, y: centerY });
                    }}
                    onMouseLeave={() => {
                      setCursorState('default');
                    }}
                    onMouseMove={(e) => {
                      // Enhanced magnetic pull
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      const mouseX = e.clientX;
                      const mouseY = e.clientY;

                      const magneticX = mouseX + (centerX - mouseX) * 0.08;
                      const magneticY = mouseY + (centerY - mouseY) * 0.08;

                      setCursorPosition({ x: magneticX, y: magneticY });
                    }}
                  >
                    {/* Enhanced glow effects with better contrast */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-blue-400/10 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/3 via-cyan-400/8 to-white/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl blur-xl"></div>

                    {/* Enhanced border effect */}
                    <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-white/20 via-blue-400/30 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

                    {/* Button content with enhanced text clarity */}
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      <span className="text-4xl group-hover:animate-bounce transition-transform duration-300 filter drop-shadow-lg">🚀</span>
                      <span className="text-white group-hover:text-white transition-all duration-500 font-black tracking-wide filter drop-shadow-lg" style={{
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 4px 16px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 255, 255, 0.3)'
                      }}>
                        Start Your Journey
                      </span>
                    </span>

                    {/* Enhanced ripple effects */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/5 to-purple-400/5 scale-0 group-hover:scale-100 transition-transform duration-700 ease-out"></div>
                    <div className="absolute inset-0 rounded-3xl bg-white/5 scale-0 group-active:scale-100 transition-transform duration-200 ease-out"></div>
                  </button>

                  {/* Orbiting particles around button with cosmic colors */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-1.5 h-1.5 rounded-full animate-orbit ${i % 4 === 0 ? 'bg-purple-400/70 shadow-purple-400/50' :
                          i % 4 === 1 ? 'bg-blue-400/70 shadow-blue-400/50' :
                            i % 4 === 2 ? 'bg-cyan-400/70 shadow-cyan-400/50' :
                              'bg-white/80 shadow-white/50'
                          }`}
                        style={{
                          animationDelay: `${i * 0.4}s`,
                          animationDuration: '10s',
                          boxShadow: `0 0 8px currentColor`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;