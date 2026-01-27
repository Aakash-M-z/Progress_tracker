import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply theme on component mount
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = !html.classList.contains('dark');

    if (newIsDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    setIsDark(newIsDark);
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/40 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              🚀
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Tracker</span>
              </h1>
              <p className="text-gray-400 mt-0.5 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em]">Mastering Algorithms</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="hidden md:block text-right mr-4 border-r border-white/10 pr-6">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Authenticated as</div>
              <div className="text-sm font-bold text-white flex items-center gap-2 justify-end">
                {user?.name}
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase text-blue-400">
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-95"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-300 active:scale-95 group"
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                  }
                }}
              >
                <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;