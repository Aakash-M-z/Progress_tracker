import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import HomePage from './components/HomePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Activity } from './types';
import { databaseAPI } from './api/database';
import { SessionManager } from './utils/sessionManager';
import { dbToFrontendActivity, frontendToDbActivity } from './utils/activityTransform';

// Eager load critical components (no lazy loading for better UX)
import SimpleHeatmap from './components/SimpleHeatmap';
import ProgressStats from './components/ProgressStats';
import ActivityForm from './components/ActivityForm';
import DSARoadmap from './components/DSARoadmap';
import StreakTracker from './components/StreakTracker';
import RoleBasedRoute from './components/RoleBasedRoute';
import AdminPanel from './components/AdminPanel';
import DailyProblemNotification from './components/DailyProblemNotification';
import NotificationSettings from './components/NotificationSettings';
import BadgeSystem from './components/BadgeSystem';
import SolutionResources from './components/SolutionResources';
import QuickAddProblem from './components/QuickAddProblem';
import DailyMotivation from './components/DailyMotivation';
import UserProfile from './components/UserProfile';
import Hero from './components/Hero';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'roadmap' | 'stats' | 'badges' | 'resources' | 'admin'>('overview');
  const [showDailyProblem, setShowDailyProblem] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadActivities();
    } else {
      // Clear activities when user logs out
      setActivities([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Reset showLogin when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  // Session refresh mechanism
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh session every 30 minutes
      const interval = setInterval(() => {
        SessionManager.refreshSession();
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadActivities = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const dbActivities = await databaseAPI.getUserActivities(user.id);
      const frontendActivities = dbActivities.map(dbToFrontendActivity);
      setActivities(frontendActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
      // Fallback to localStorage for backward compatibility
      const savedActivities = localStorage.getItem(`activities_${user.id}`);
      if (savedActivities) {
        try {
          setActivities(JSON.parse(savedActivities));
        } catch (parseError) {
          console.error('Failed to parse saved activities:', parseError);
          setActivities([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addActivity = async (activity: Omit<Activity, 'id' | 'date'>) => {
    if (!user) return;

    // Generate the missing fields
    const fullActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    try {
      const dbActivityData = frontendToDbActivity(fullActivity, user.id);
      const newDbActivity = await databaseAPI.createActivity(dbActivityData);

      if (newDbActivity) {
        const newFrontendActivity = dbToFrontendActivity(newDbActivity);
        setActivities([...activities, newFrontendActivity]);
      } else {
        // Fallback to localStorage
        setActivities([...activities, fullActivity]);
        localStorage.setItem(`activities_${user.id}`, JSON.stringify([...activities, fullActivity]));
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      // Fallback to localStorage
      setActivities([...activities, fullActivity]);
      localStorage.setItem(`activities_${user.id}`, JSON.stringify([...activities, fullActivity]));
    }
  };

  // Memoize expensive calculations
  const quickStats = useMemo(() => ({
    totalActivities: activities.length,
    problemsSolved: activities.filter(a => a.problemSolved).length,
    totalTime: Math.round(activities.reduce((sum, a) => sum + a.duration, 0) / 60),
    topicsCovered: new Set(activities.map(a => a.category)).size,
    currentStreak: (() => {
      const uniqueDates = [...new Set(activities.map(a => a.date.split('T')[0]))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      if (uniqueDates.includes(today)) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i - 1]);
          const prevDate = new Date(uniqueDates[i]);
          const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) streak++;
          else break;
        }
      }
      return streak;
    })()
  }), [activities]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'roadmap', name: 'DSA Roadmap', icon: '🗺️' },
    { id: 'stats', name: 'Statistics', icon: '📈' },
    { id: 'badges', name: 'Badges', icon: '🏆' },
    { id: 'resources', name: 'Resources', icon: '🎓' },
    ...(user?.role === 'admin' ? [{ id: 'admin', name: 'Admin Panel', icon: '⚙️' }] : []),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showLogin ? (
      <Login
        onLogin={(user) => {
          console.log('User logged in:', user);
        }}
        onBack={() => setShowLogin(false)}
      />
    ) : (
      <HomePage onGetStarted={() => setShowLogin(true)} />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 animate-fadeIn">
      <Header />
      <DailyProblemNotification />
      {showDailyProblem && (
        <DailyProblemNotification
          forceShow={true}
          onClose={() => setShowDailyProblem(false)}
        />
      )}
      <NotificationSettings onTriggerDailyProblem={() => setShowDailyProblem(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Hero />
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            <nav className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 font-medium text-sm flex items-center space-x-2 rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          <ErrorBoundary key={activeTab}>
            {activeTab === 'overview' && (
              <div className="animate-fadeIn space-y-8">
                {/* Daily Motivation at the top with enhanced glow effect */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 rounded-3xl blur-xl opacity-20 animate-ping"></div>
                  <div className="relative transform hover:scale-105 transition-all duration-300">
                    <DailyMotivation />
                  </div>
                </div>

                {/* Welcome Hero Section */}
                <div className="relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gray-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-10 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/40 animate-float">
                          🚀
                        </div>
                        <div>
                          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{user?.name?.split(' ')[0]}!</span>
                          </h1>
                          <p className="text-gray-400 text-lg font-medium flex items-center gap-2">
                            Ready to conquer more <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 text-sm">DSA Challenges</span> today?
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="text-center">
                          <div className="text-4xl font-black text-white mb-1 tracking-tight">{quickStats.totalActivities}</div>
                          <div className="text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.2em]">Total Activities</div>
                        </div>
                        <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                        <div className="text-center">
                          <div className="text-4xl font-black text-white mb-1 tracking-tight">{quickStats.problemsSolved}</div>
                          <div className="text-[10px] font-bold text-green-400/60 uppercase tracking-[0.2em]">Solved</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Problems Solved', value: quickStats.problemsSolved, icon: '✅', color: 'green' },
                    { label: 'Day Streak', value: quickStats.currentStreak, icon: '🔥', color: 'orange' },
                    { label: 'Time Invested', value: `${quickStats.totalTime}h`, icon: '⏱️', color: 'purple' },
                    { label: 'Topics Covered', value: quickStats.topicsCovered, icon: '📚', color: 'blue' }
                  ].map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden">
                      <div className={`absolute inset-0 bg-${stat.color}-500/5 blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors duration-500`}></div>
                      <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl hover:-translate-y-2 transition-all duration-300">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                        <div className={`text-4xl font-black text-white mb-2 tracking-tight group-hover:text-${stat.color}-400 transition-colors`}>
                          {stat.value}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main Content Grid - Reorganized Layout */}
                <div className="space-y-8">
                  {/* Analytics Section - Full Width */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/5 p-8 hover:bg-gray-900/50 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-white tracking-tight">Activity Heatmap</h2>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Consistency Tracker</p>
                        </div>
                      </div>
                      <SimpleHeatmap activities={activities} />
                    </div>

                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/5 p-8 group relative overflow-hidden transition-all duration-300 hover:bg-gray-900/50">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-green-500/20">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Progress Stats</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Detailed Analytics</p>
                          </div>
                        </div>
                        <ProgressStats activities={activities} />
                      </div>
                    </div>
                  </div>

                  {/* Center Section - Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-xl border border-blue-200 dark:border-gray-600 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl text-white">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Log Activity</h2>
                      </div>
                      <RoleBasedRoute allowedRoles={user?.role === 'admin' ? ['admin'] : ['admin', 'user']}>
                        <ActivityForm onAddActivity={addActivity} />
                      </RoleBasedRoute>
                    </div>

                    <QuickAddProblem onAddActivity={addActivity} />

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-xl border border-orange-200 dark:border-gray-600 p-6">
                      <StreakTracker activities={activities} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn">
                <div className="xl:col-span-8">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
                    <DSARoadmap activities={activities} onAddActivity={addActivity} />
                  </div>
                </div>
                <div className="xl:col-span-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-green-200 dark:border-gray-600 p-6 sticky top-24 card-hover">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                      <span className="mr-3 text-2xl">📝</span>
                      Log New Activity
                    </h2>
                    <RoleBasedRoute allowedRoles={['admin', 'user']}>
                      <ActivityForm onAddActivity={addActivity} />
                    </RoleBasedRoute>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn">
                <div className="xl:col-span-8">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                      <span className="mr-3 text-3xl">📈</span>
                      Detailed Analytics
                    </h2>
                    <RoleBasedRoute allowedRoles={['admin', 'user']}>
                      <ProgressStats activities={activities} />
                    </RoleBasedRoute>
                  </div>
                </div>
                <div className="xl:col-span-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-purple-200 dark:border-gray-600 p-6 sticky top-24 card-hover">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                      <span className="mr-3 text-2xl">📝</span>
                      Log New Activity
                    </h2>
                    <RoleBasedRoute allowedRoles={['admin', 'user']}>
                      <ActivityForm onAddActivity={addActivity} />
                    </RoleBasedRoute>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-fadeIn">
                <UserProfile activities={activities} />
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="animate-fadeIn">
                <BadgeSystem activities={activities} />
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="animate-fadeIn">
                <SolutionResources />
              </div>
            )}

            {activeTab === 'admin' && user?.role === 'admin' && (
              <div className="animate-fadeIn">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
                  <AdminPanel />
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;