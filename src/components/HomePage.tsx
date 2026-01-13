import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Preload video for better performance
    const video = document.createElement('video');
    video.src = '/5485148-hd_1920_1080_25fps (1) (1).mp4';
    video.load();

    // Show loading animation for 3 seconds
    const loadingTimer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Enhanced sparkle effect function
  return (
    <>
      {/* Loading Screen */}
      {showLoading && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
          <div className="text-center animate-fadeIn">
            {/* Progress Tracker Logo */}
            <div className="mb-8">
              <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl animate-pulse">
                PT
              </div>
            </div>

            {/* Progress Tracker Title */}
            <h1 className="text-white font-black text-4xl md:text-5xl mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Progress Tracker
            </h1>

            {/* Loading Animation */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>

            {/* Loading Text */}
            <p className="text-gray-300 text-lg font-medium animate-pulse">
              Loading your journey...
            </p>

            {/* Progress Bar */}
            <div className="mt-8 w-64 mx-auto">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{
                  width: '100%',
                  animation: 'loadingProgress 3s ease-in-out'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`min-h-screen relative overflow-hidden transition-opacity duration-1000 ${showLoading ? 'opacity-0' : 'opacity-100'}`}>
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
              filter: 'brightness(0.8) contrast(1.1) saturate(1.0)',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
          >
            <source src="/5485148-hd_1920_1080_25fps (1) (1).mp4" type="video/mp4" />
          </video>

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
          {/* Start Your Journey Button - appears after loading */}
          {!showLoading && (
            <div className="animate-slideInFromBottom">
              {/* Decorative elements around button */}
              <div className="relative">
                {/* Subtle decorative elements */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>

                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-pulse"></div>

                {/* Reduced side dots */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-20">
                  <div className="flex flex-col space-y-4">
                    <div className="w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1 h-1 bg-indigo-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>

                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-20">
                  <div className="flex flex-col space-y-4">
                    <div className="w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-1 h-1 bg-indigo-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: '1.3s' }}></div>
                  </div>
                </div>

                <div className="relative floating-particles">
                  <button
                    onClick={onGetStarted}
                    className="group relative overflow-hidden bg-transparent backdrop-blur-none border-2 border-transparent text-white px-16 py-8 rounded-3xl font-bold text-2xl hover:bg-black/15 hover:border-gray-500/15 transition-all duration-500 hover:scale-110 active:scale-95 shadow-none hover:shadow-none min-w-[400px] max-w-[500px] dark-theme-button opacity-50 hover:opacity-80"
                  >
                    {/* Minimal glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    {/* Removed inner shadow for text-like appearance */}

                    {/* Button content */}
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      <span className="text-4xl group-hover:animate-bounce transition-transform duration-300">🚀</span>
                      <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-white group-hover:to-purple-300 transition-all duration-500 font-black tracking-wide">
                        Start Your Journey
                      </span>
                    </span>

                    {/* Minimal border glow */}
                    <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

                    {/* Subtle ripple effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/3 to-purple-400/3 scale-0 group-hover:scale-100 transition-transform duration-700 ease-out"></div>
                  </button>
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