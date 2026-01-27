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

  const demoUsers = [
    { id: 1, email: 'admin@demo.com', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
    { id: 2, email: 'user@demo.com', password: 'user123', role: 'user' as const, name: 'Regular User' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      if (demoUser) {
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
        }, 1000);
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body = isLogin ? { email, password } : { email, password, username };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');

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
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="w-full h-screen flex">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
          <ParticleBackground
            particleCount={50}
            particleColor="rgba(255, 215, 0, 0.5)"
            lineColor="rgba(255, 215, 0, 0.15)"
            particleSpeed={0.2}
            lineDistance={100}
            className="z-0"
          />

          <div className="max-w-md w-full relative z-10">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-700/50">
              {onBack && (
                <button onClick={onBack} className="mb-6 text-gray-400 hover:text-white">
                  ← Back to Home
                </button>
              )}

              <div className="text-center mb-10">
                <div className="text-7xl mb-6">🚀</div>
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-gray-400">
                  {isLogin ? 'Sign in to continue your DSA journey' : 'Start your DSA journey today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl"
                    required
                  />
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl"
                  required
                />

                {error && <div className="text-red-400">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl"
                >
                  {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleMode} className="text-blue-400 ml-2">
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
            <source src="/56376-479358463_small.mp4" type="video/mp4" />
          </video>

          <ParticleBackground
            particleCount={100}
            particleColor="rgba(255, 215, 0, 0.9)"
            lineColor="rgba(255, 215, 0, 0.25)"
            particleSpeed={0.3}
            lineDistance={120}
            className="z-10"
          />

          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <h2 className="text-6xl font-bold text-white mb-4">
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
