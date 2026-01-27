import React, { useState } from 'react';
import { User } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import ParticleBackground from './ParticleBackground';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo users for testing
  const demoUsers = [
    { id: 1, email: 'admin@demo.com', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
    { id: 2, email: 'user@demo.com', password: 'user123', role: 'user' as const, name: 'Regular User' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for demo users first (client-side simulation)
    const demoUser = demoUsers.find(u => u.email === email && u.password === password);
    if (demoUser && isLogin) {
      setTimeout(() => {
        const userData: User = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role
        };
        login(userData);
        onLogin(userData);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body = isLogin
        ? { email, password }
        : { email, password, username };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        name: data.username,
        role: data.role as 'admin' | 'user'
      };

      login(userData);
      onLogin(userData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden animate-fadeIn">
      {/* Split Screen Layout */}
      <div className="w-full h-screen flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 animate-slideInFromLeft">
          {/* Subtle Particle Background for Left Side */}
          <ParticleBackground
            particleCount={50}
            particleColor="rgba(255, 215, 0, 0.5)"
            lineColor="rgba(255, 215, 0, 0.15)"
            particleSpeed={0.2}
            lineDistance={100}
            className="z-0"
          />

          <div className="max-w-md w-full relative z-10">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-700/50 transform transition-all duration-500">
              {onBack && (
                <button
                  onClick={onBack}
                  className="mb-6 flex items-center text-gray-400 hover:text-white transition-all duration-300 group"
                >
                  <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Back to Home</span>
                </button>
              )}

              <div className="text-center mb-10">
                <div className="text-7xl mb-6 animate-bounce inline-block">🚀</div>
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-gray-400 text-lg">
                  {isLogin ? 'Sign in to continue your DSA journey' : 'Start your DSA journey today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="group animate-fadeIn">
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-800/50 border border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-300 hover:bg-gray-800/70"
                      placeholder="Choose a username"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="group">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-800/50 border border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-300 hover:bg-gray-800/70"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="group">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-800/50 border border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-300 hover:bg-gray-800/70"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-xl animate-shake backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      {isLogin ? 'Signing in...' : 'Creating Account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Sign Up'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
                <p className="text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={toggleMode}
                    className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-300 ml-1 hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>

                {isLogin && (
                  <div className="mt-8 pt-6 border-t border-gray-700/50 text-left animate-fadeIn">
                    <div className="text-sm text-gray-400">
                      <p className="mb-3 font-semibold text-gray-300">Demo Accounts:</p>
                      <div className="space-y-2 text-xs bg-gray-800/30 p-4 rounded-xl">
                        <p className="flex items-center justify-between">
                          <span className="text-yellow-400 font-bold">Admin:</span>
                          <span className="text-gray-300">admin@demo.com / admin123</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-blue-400 font-bold">User:</span>
                          <span className="text-gray-300">user@demo.com / user123</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Animated Background */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'brightness(0.85) contrast(1.15) saturate(1.2)',
            }}
          >
            <source src="/56376-479358463_small.mp4" type="video/mp4" />
          </video>

          {/* Overlay Gradients - Lighter for better video visibility */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40"></div>

          {/* Interactive Particle Network */}
          <ParticleBackground
            particleCount={100}
            particleColor="rgba(255, 215, 0, 0.9)"
            lineColor="rgba(255, 215, 0, 0.25)"
            particleSpeed={0.3}
            lineDistance={120}
            className="z-10"
          />

          {/* Floating Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-6xl font-bold text-white mb-4 tracking-tight">
                Start Your
                <br />
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  Journey
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-md mx-auto">
                Master Data Structures & Algorithms with focused practice
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;