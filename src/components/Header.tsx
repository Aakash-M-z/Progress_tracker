import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🚀</span>
              <span>DSA Progress Tracker</span>
            </h1>
            <p className="text-blue-100 mt-1 text-xs sm:text-sm">Master Data Structures & Algorithms with systematic tracking</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right flex-1 sm:flex-none">
              <div className="text-xs text-blue-100">Welcome, {user?.name}</div>
              <div className="text-sm font-semibold capitalize">{user?.role} Access</div>
            </div>
            <button 
              className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium btn-hover border border-white/30 text-sm transition-all duration-200 hover:bg-white/30 active:scale-95"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <span className="mr-1">{isDark ? '☀️' : '🌙'}</span>
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <button 
              className="bg-red-500/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg font-medium btn-hover border border-red-400/30 text-sm transition-all duration-200 hover:bg-red-600/80 active:scale-95"
              onClick={logout}
              title="Sign out"
            >
              <span className="mr-1">🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;