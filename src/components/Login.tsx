import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
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

  // Demo users removed as per request

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for demo users removed

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

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        if (!response.ok) {
          throw new Error(`Server Error (${response.status}). Is the backend running?`);
        }
        throw new Error('Received invalid response from server');
      }

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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          if (!res.ok) {
            throw new Error(`Server Error (${res.status}). Check backend status.`);
          }
          throw new Error('Received invalid response from server');
        }

        if (!res.ok) {
          throw new Error(data.error || 'Google login failed');
        }

        const userData: User = {
          id: data.id,
          email: data.email,
          name: data.username || data.name,
          role: data.role as 'admin' | 'user'
        };

        login(userData);
        onLogin(userData);
      } catch (err: any) {
        console.error('Google login error detail:', err);
        setError(err.message || 'Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed');
      setLoading(false);
    }
  });

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      googleLogin();
      return;
    }

    setLoading(true);
    setError('');

    // Simulate successful OAuth login flow for other providers
    setTimeout(() => {
      const mockUser: User = {
        id: `social-${provider.toLowerCase()}-${Date.now()}`,
        email: `user.${provider.toLowerCase()}@example.com`,
        name: `${provider} User`,
        role: 'user'
      };

      login(mockUser);
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden animate-fadeIn">
      {/* Split Screen Layout */}
      <div className="w-full h-screen flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 animate-slideInFromLeft">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-8 left-8 text-white/50 hover:text-white transition-all duration-300 flex items-center group z-30"
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/10 transition-all duration-300 mr-3 group-hover:scale-110">
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium text-lg tracking-wide">Back</span>
            </button>
          )}

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

                {/* Social Login Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#1a1c23] text-gray-400 rounded">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center p-3 bg-gray-800/50 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all duration-300 group hover:scale-105"
                    aria-label="Sign in with Google"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Facebook')}
                    className="flex items-center justify-center p-3 bg-gray-800/50 border border-gray-600 rounded-xl hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 transition-all duration-300 group hover:scale-105"
                    aria-label="Sign in with Facebook"
                  >
                    <svg className="w-6 h-6 text-white group-hover:text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Apple')}
                    className="flex items-center justify-center p-3 bg-gray-800/50 border border-gray-600 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 group hover:scale-105"
                    aria-label="Sign in with Apple"
                  >
                    <svg className="w-6 h-6 text-white group-hover:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.7.79 3.49 1.95-3.07 1.67-2.55 6.07.6 7.32-.23 1.25-.97 3.04-2.68 3.76zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.54 4.33-3.74 4.25z" />
                    </svg>
                  </button>
                </div>
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
                      {/* Demo accounts removed */}
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