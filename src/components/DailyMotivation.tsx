import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MotivationQuote {
  text: string;
  author: string;
  icon: string;
  color: string;
}

const MOTIVATION_QUOTES: MotivationQuote[] = [
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    icon: "🌱",
    color: "from-green-500 to-emerald-600"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
    icon: "😄",
    color: "from-blue-500 to-indigo-600"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    icon: "🧠",
    color: "from-purple-500 to-violet-600"
  },
  {
    text: "Practice doesn't make perfect. Perfect practice makes perfect.",
    author: "Vince Lombardi",
    icon: "🎯",
    color: "from-orange-500 to-red-600"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    icon: "💫",
    color: "from-pink-500 to-rose-600"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    icon: "💻",
    color: "from-cyan-500 to-blue-600"
  },
  {
    text: "It's not about how hard you hit. It's about how hard you can get hit and keep moving forward.",
    author: "Rocky Balboa",
    icon: "🥊",
    color: "from-yellow-500 to-orange-600"
  }
];

const DailyMotivation: React.FC = () => {
  const { user } = useAuth();
  const [currentQuote, setCurrentQuote] = useState<MotivationQuote>(MOTIVATION_QUOTES[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Get quote based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % MOTIVATION_QUOTES.length;
    setCurrentQuote(MOTIVATION_QUOTES[quoteIndex]);

    // Auto-rotate quotes every 15 seconds for better readability
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuote(prev => {
          const currentIndex = MOTIVATION_QUOTES.findIndex(q => q.text === prev.text);
          const nextIndex = (currentIndex + 1) % MOTIVATION_QUOTES.length;
          return MOTIVATION_QUOTES[nextIndex];
        });
        setIsAnimating(false);
      }, 400);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative mb-6 overflow-hidden">
      <div className={`bg-gradient-to-r ${currentQuote.color} rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-bounce"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce">{currentQuote.icon}</div>
              <div>
                <h3 className="text-xl font-bold">Daily Motivation</h3>
                <p className="text-white/80 text-sm">Hello, {user?.name?.split(' ')[0]}! 👋</p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            <blockquote className="text-lg font-medium mb-3 italic">
              "{currentQuote.text}"
            </blockquote>
            <cite className="text-white/90 text-sm font-semibold">
              — {currentQuote.author}
            </cite>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              {MOTIVATION_QUOTES.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === MOTIVATION_QUOTES.findIndex(q => q.text === currentQuote.text)
                      ? 'bg-white'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
            <div className="text-white/70 text-xs">
              Auto-rotating every 15s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyMotivation;