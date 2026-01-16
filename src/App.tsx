import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import HomePage from './components/HomePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Activity } from './types';
import { databaseAPI } from './api/database';
import { SessionManager } from './utils/sessionManager';
import { dbToFrontendActivity, frontendToDbActivity } from './utils/activityTransform';

// Lazy load heavy components
const SimpleHeatmap = lazy(() => import('./components/SimpleHeatmap'));
const ProgressStats = lazy(() => import('./components/ProgressStats'));
const ActivityForm = lazy(() => import('./components/ActivityForm'));
const DSARoadmap = lazy(() => import('./components/DSARoadmap'));
const StreakTracker = lazy(() => import('./components/StreakTracker'));
const RoleBasedRoute = lazy(() => import('./components/RoleBasedRoute'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const DailyProblemNotification = lazy(() => import('./components/DailyProblemNotification'));
const NotificationSettings = lazy(() => import('./components/NotificationSettings'));
const BadgeSystem = lazy(() => import('./components/BadgeSystem'));
const SolutionResources = lazy(() => import('./components/SolutionResources'));
const QuickAddProblem = lazy(() => import('./components/QuickAddProblem'));
const DailyMotivation = lazy(() => import('./components/DailyMotivation'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const Hero = lazy(() => import('./components/Hero'));

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
      <Suspense fallback={null}>
        <DailyProblemNotification />
      </Suspense>
      {showDailyProblem && (
        <Suspense fallback={null}>
          <DailyProblemNotification
            forceShow={true}
            onClose={() => setShowDailyProblem(false)}
          />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <NotificationSettings onTriggerDailyProblem={() => setShowDailyProblem(true)} />
      </Suspense>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>}>
          <Hero />
        </Suspense>
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
        {activeTab === 'overview' && (
          <div className="animate-fadeIn space-y-8">
            {/* Daily Motivation at the top with enhanced glow effect */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-40 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 rounded-3xl blur-xl opacity-20 animate-ping"></div>
              <div className="relative transform hover:scale-105 transition-all duration-300">
                <Suspense fallback={<div className="bg-white dark:bg-gray-800 rounded-3xl p-8 animate-pulse"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div></div>}>
                  <DailyMotivation />
                </Suspense>
              </div>
            </div>

            {/* Welcome Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl animate-bounce">🚀</div>
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                      <p className="text-blue-100 text-lg">Ready to conquer more DSA challenges?</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{quickStats.totalActivities}</div>
                    <div className="text-blue-200 text-sm">Total Activities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 border border-green-200 dark:border-green-700 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-3">✅</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {quickStats.problemsSolved}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Problems Solved</div>
              </div>

              <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-700 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-3">🔥</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {quickStats.currentStreak}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Day Streak</div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-3">⏱️</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {quickStats.totalTime}h
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Time Invested</div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-3">📚</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {quickStats.topicsCovered}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Topics Covered</div>
              </div>
            </div>

            {/* Main Content Grid - Reorganized Layout */}
            <div className="space-y-8">
              {/* Analytics Section - Full Width */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Activity Heatmap</h2>
                  </div>
                  <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div></div>}>
                    <SimpleHeatmap activities={activities} />
                  </Suspense>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 card-hover group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                  {/* Glow effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-400/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl text-white group-hover:shadow-lg group-hover:shadow-green-500/30 transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">Progress Statistics</h2>
                    </div>
                    <Suspense fallback={<div className="animate-pulse space-y-3"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div><div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div></div>}>
                      <ProgressStats activities={activities} />
                    </Suspense>
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
                  <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>}>
                    <RoleBasedRoute allowedRoles={user?.role === 'admin' ? ['admin'] : ['admin', 'user']}>
                      <ActivityForm onAddActivity={addActivity} />
                    </RoleBasedRoute>
                  </Suspense>
                </div>

                <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>}>
                  <QuickAddProblem onAddActivity={addActivity} />
                </Suspense>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-xl border border-orange-200 dark:border-gray-600 p-6">
                  <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>}>
                    <StreakTracker activities={activities} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn">
            <div className="xl:col-span-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
                <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div></div>}>
                  <DSARoadmap activities={activities} onAddActivity={addActivity} />
                </Suspense>
              </div>
            </div>
            <div className="xl:col-span-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-green-200 dark:border-gray-600 p-6 sticky top-24 card-hover">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                  <span className="mr-3 text-2xl">📝</span>
                  Log New Activity
                </h2>
                <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>}>
                  <RoleBasedRoute allowedRoles={['admin', 'user']}>
                    <ActivityForm onAddActivity={addActivity} />
                  </RoleBasedRoute>
                </Suspense>
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
                <Suspense fallback={<div className="animate-pulse space-y-3"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div><div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div></div>}>
                  <RoleBasedRoute allowedRoles={['admin', 'user']}>
                    <ProgressStats activities={activities} />
                  </RoleBasedRoute>
                </Suspense>
              </div>
            </div>
            <div className="xl:col-span-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl border border-purple-200 dark:border-gray-600 p-6 sticky top-24 card-hover">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                  <span className="mr-3 text-2xl">📝</span>
                  Log New Activity
                </h2>
                <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>}>
                  <RoleBasedRoute allowedRoles={['admin', 'user']}>
                    <ActivityForm onAddActivity={addActivity} />
                  </RoleBasedRoute>
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fadeIn">
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>}>
              <UserProfile activities={activities} />
            </Suspense>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="animate-fadeIn">
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>}>
              <BadgeSystem activities={activities} />
            </Suspense>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="animate-fadeIn">
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>}>
              <SolutionResources />
            </Suspense>
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
              <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>}>
                <AdminPanel />
              </Suspense>
            </div>
          </div>
        )}
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