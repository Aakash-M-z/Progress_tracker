import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default');
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);

  useEffect(() => {
    // Preload video for better performance
    const video = document.createElement('video');
    video.src = '/27669-365224683_small.mp4';
    video.load();

    // Progress counter from 0 to 100 over 3 seconds
    const duration = 3000; // 3 seconds
    const interval = 30; // Update every 30ms for smooth animation
    const increment = 100 / (duration / interval);
    
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(progressTimer);
        // Hide loading screen after reaching 100
        setTimeout(() => {
          setShowLoading(false);
        }, 100);
      } else {
        setProgress(Math.floor(currentProgress));
      }
    }, interval);

    return () => clearInterval(progressTimer);
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

      {/* Loading Screen with circular progress - no video background */}
      {showLoading && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black">
          {/* Solid dark background - no video */}
          
          {/* Circular progress overlay */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="relative">
              {/* Circular progress indicator - increased clarity */}
              <svg className="w-72 h-72 md:w-96 md:h-96 transform -rotate-90" viewBox="0 0 200 200">
                {/* Background circle - more visible */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="10"
                />
                {/* Progress circle - brighter and thicker */}
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  style={{
                    transition: 'stroke-dashoffset 0.1s linear',
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
                  }}
                />
              </svg>
              
              {/* Progress number in center - increased clarity */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                key={progress}
              >
                <div 
                  className="text-white font-light text-7xl md:text-8xl tracking-tight"
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontWeight: 300,
                    letterSpacing: '-0.05em',
                    textShadow: '0 0 60px rgba(255, 255, 255, 0.6), 0 0 100px rgba(255, 255, 255, 0.3)',
                    animation: 'countdownFade 0.3s ease-out',
                  }}
                >
                  {String(Math.min(progress, 100)).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - only shown after loading completes */}
      {!showLoading && (
      <div
        className="homepage-container min-h-screen relative overflow-hidden transition-opacity duration-1000 opacity-100"
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
              filter: 'brightness(0.5) contrast(1.4) saturate(0.9)',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
          >
            <source src="/27669-365224683_small.mp4" type="video/mp4" />
          </video>

          {/* Enhanced overlay gradients for better text clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/50"></div>

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
              {/* Circular button without decorative elements */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    createRipple(e);
                    onGetStarted();
                  }}
                  className="group relative overflow-hidden bg-black/30 border border-yellow-600/50 text-yellow-100 w-80 h-80 rounded-full font-bold text-2xl hover:bg-black/50 hover:border-yellow-500/80 hover:text-yellow-50 transition-all duration-700 hover:scale-110 active:scale-95 shadow-lg shadow-black/50 hover:shadow-2xl hover:shadow-yellow-900/30 gold-theme-button opacity-100 clickable magnetic-cursor water-drop-button flex items-center justify-center animate-pulse-slow"
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
                  {/* Button content with enhanced visibility - Text Only */}
                  <span className="relative z-10 flex flex-col items-center justify-center">
                    <span className="text-yellow-50 group-hover:text-white transition-all duration-700 font-light tracking-widest text-center leading-relaxed text-3xl group-hover:animate-pulse" style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      textShadow: '0 4px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
                      filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8))',
                      letterSpacing: '0.15em',
                      transform: 'group-hover:scale(1.05)'
                    }}>
                      Start Your<br />Journey
                    </span>
                  </span>

                  {/* Golden dark theme interactive animations */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-900/20 via-yellow-600/30 to-yellow-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-spin-slow"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-500/10 via-black/20 to-transparent scale-0 group-hover:scale-100 transition-transform duration-700 ease-out animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full bg-yellow-800/30 scale-0 group-active:scale-100 transition-transform duration-200 ease-out"></div>

                  {/* Golden floating particles around button */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-yellow-500/70 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg shadow-yellow-500/50"
                        style={{
                          left: `${15 + i * 45}%`,
                          top: `${15 + (i % 3) * 35}%`,
                          animationDelay: `${i * 0.4}s`,
                          animationDuration: `${4 + i * 0.3}s`,
                          boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                        }}
                      ></div>
                    ))}
                  </div>

                  {/* Golden ring effect */}
                  <div className="absolute inset-2 rounded-full border border-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"></div>
                  <div className="absolute inset-4 rounded-full border border-yellow-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-spin-reverse"></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default HomePage;