import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <img
                src="/logo.png"
                alt="Progress Tracker Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to rocket emoji if logo image not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 border border-white/10">🚀</div>';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight" style={{ fontFamily: '"Orbitron", "Exo 2", "Rajdhani", sans-serif' }}>
                Progress <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400">Tracker</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em]">Mastering Algorithms</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 active:scale-95"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold-400 to-gold-600 p-[1px]">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-xs font-bold text-gold-200">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gold-400 font-medium uppercase tracking-wider">{user?.role || 'Member'}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 transform origin-top-right rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gold-500/20 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-scaleIn z-50">
                    <div className="p-2 space-y-1">
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Signed in as</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>

                      {[
                        { label: 'Profile', icon: '👤', action: () => console.log('Profile') },
                        { label: 'Edit Profile', icon: '✏️', action: () => console.log('Edit Profile') },
                        { label: 'Settings', icon: '⚙️', action: () => console.log('Settings') }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.action();
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gold-200 transition-colors group"
                        >
                          <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                          {item.label}
                        </button>
                      ))}

                      <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          if (window.confirm('Are you sure you want to logout?')) logout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
                      >
                        <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;