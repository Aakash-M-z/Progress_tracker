import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SimpleHeatmap from './components/SimpleHeatmap';
import ProgressStats from './components/ProgressStats';
import ActivityForm from './components/ActivityForm';
import DSARoadmap from './components/DSARoadmap';
import StreakTracker from './components/StreakTracker';
import Login from './components/Login';
import RoleBasedRoute from './components/RoleBasedRoute';
import AdminPanel from './components/AdminPanel';
import DailyProblemNotification from './components/DailyProblemNotification';
import NotificationSettings from './components/NotificationSettings';
import BadgeSystem from './components/BadgeSystem';
import SolutionResources from './components/SolutionResources';
import QuickAddProblem from './components/QuickAddProblem';
import DailyMotivation from './components/DailyMotivation';
import UserProfile from './components/UserProfile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Activity } from './types';
import { databaseAPI } from './api/database';
import { dbToFrontendActivity, frontendToDbActivity } from './utils/activityTransform';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'roadmap' | 'stats' | 'badges' | 'resources' | 'admin'>('overview');
  const [showDailyProblem, setShowDailyProblem] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadActivities();
    }
  }, [isAuthenticated, user]);

  const loadActivities = async () => {
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
        setActivities(JSON.parse(savedActivities));
      }
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activity: Activity) => {
    if (!user) return;
    
    try {
      const dbActivityData = frontendToDbActivity(activity, user.id);
      const newDbActivity = await databaseAPI.createActivity(dbActivityData);
      
      if (newDbActivity) {
        const newFrontendActivity = dbToFrontendActivity(newDbActivity);
        setActivities([...activities, newFrontendActivity]);
      } else {
        // Fallback to localStorage
        setActivities([...activities, activity]);
        localStorage.setItem(`activities_${user.id}`, JSON.stringify([...activities, activity]));
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      // Fallback to localStorage
      setActivities([...activities, activity]);
      localStorage.setItem(`activities_${user.id}`, JSON.stringify([...activities, activity]));
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'roadmap', name: 'DSA Roadmap', icon: '🗺️' },
    { id: 'stats', name: 'Statistics', icon: '📈' },
    { id: 'badges', name: 'Badges', icon: '🏆' },
    { id: 'resources', name: 'Resources', icon: '🎓' },
    ...(user?.role === 'admin' ? [{ id: 'admin', name: 'Admin Panel', icon: '⚙️' }] : []),
  ];

  if (!isAuthenticated) {
    return <Login onLogin={(user) => {
      // Handle login logic here if needed
      console.log('User logged in:', user);
    }} />;
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
        <DailyMotivation />
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
            <nav className="flex space-x-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 font-medium text-sm flex items-center space-x-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
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
                    <div className="text-3xl font-bold">{activities.length}</div>
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
                  {activities.filter(a => a.problemSolved).length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Problems Solved</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-700 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-3">🔥</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {(() => {
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
                  })()}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Day Streak</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-3">⏱️</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(activities.reduce((sum, a) => sum + a.duration, 0) / 60)}h
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Time Invested</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-3">📚</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {new Set(activities.map(a => a.category)).size}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Topics Covered</div>
              </div>
            </div>

            {/* Main Content Grid - Fixed Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column - Analytics (Takes 2/3 width) */}
              <div className="xl:col-span-2 space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Activity Heatmap</h2>
                  </div>
                  <SimpleHeatmap activities={activities} />
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 card-hover">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Progress Statistics</h2>
                  </div>
                  <ProgressStats activities={activities} />
                </div>
              </div>

              {/* Right Column - Tools & Forms (Takes 1/3 width) */}
              <div className="xl:col-span-1 space-y-6">
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