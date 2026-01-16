import React, { useState, useMemo } from 'react';
import { Activity } from '../types';

interface ProgressStatsProps {
  activities: Activity[];
}

interface CachedStats {
  totalActivities: number;
  totalTime: number;
  problemsSolved: number;
  totalProblems: number;
  difficultyStats: Record<string, number>;
  platformStats: Record<string, number>;
  topicStats: Record<string, number>;
  averageValue: string;
  successRate: number;
  recentActivities: Activity[];
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ activities }) => {
  const [visibleElements] = useState<number>(6); // Show all immediately

  // Memoized cached statistics calculation
  const cachedStats = useMemo<CachedStats>(() => {
    const totalActivities = activities.length;
    const totalTime = activities.reduce((sum, activity) => sum + activity.duration, 0);

    // DSA specific stats
    const problemsSolved = activities.filter(activity => activity.problemSolved).length;
    const totalProblems = activities.filter(activity => activity.dsaTopic).length;

    const difficultyStats = activities.reduce((acc, activity) => {
      if (activity.difficulty) {
        acc[activity.difficulty] = (acc[activity.difficulty] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const platformStats = activities.reduce((acc, activity) => {
      if (activity.platform) {
        acc[activity.platform] = (acc[activity.platform] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topicStats = activities.reduce((acc, activity) => {
      if (activity.category) {
        acc[activity.category] = (acc[activity.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const averageValue = activities.length > 0
      ? (activities.reduce((sum, activity) => sum + activity.value, 0) / activities.length).toFixed(1)
      : '0';

    const successRate = totalProblems > 0 ? (problemsSolved / totalProblems) * 100 : 0;

    const recentActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalActivities,
      totalTime,
      problemsSolved,
      totalProblems,
      difficultyStats,
      platformStats,
      topicStats,
      averageValue,
      successRate,
      recentActivities
    };
  }, [activities]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl transform hover:scale-105 transition-all duration-300 ${visibleElements >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '0ms' }}>
          <div className="text-2xl font-bold mb-1">{cachedStats.totalActivities}</div>
          <div className="text-xs opacity-90 font-medium">Total Sessions</div>
        </div>

        <div className={`bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl transform hover:scale-105 transition-all duration-300 ${visibleElements >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '100ms' }}>
          <div className="text-2xl font-bold mb-1">{cachedStats.problemsSolved}</div>
          <div className="text-xs opacity-90 font-medium">Problems Solved</div>
        </div>

        <div className={`bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl transform hover:scale-105 transition-all duration-300 ${visibleElements >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '200ms' }}>
          <div className="text-2xl font-bold mb-1">{formatTime(cachedStats.totalTime)}</div>
          <div className="text-xs opacity-90 font-medium">Total Time</div>
        </div>

        <div className={`bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl transform hover:scale-105 transition-all duration-300 ${visibleElements >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '300ms' }}>
          <div className="text-2xl font-bold mb-1">{cachedStats.averageValue}</div>
          <div className="text-xs opacity-90 font-medium">Avg. Understanding</div>
        </div>
      </div>

      {/* Success Rate */}
      {cachedStats.totalProblems > 0 && (
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${visibleElements >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🎯</span>
            Success Rate
            <span className="ml-2 text-sm bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
              Cached ⚡
            </span>
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${cachedStats.successRate}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(cachedStats.successRate)}%
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {cachedStats.problemsSolved} out of {cachedStats.totalProblems} problems solved
          </div>
        </div>
      )}

      {/* Difficulty Distribution */}
      {Object.keys(cachedStats.difficultyStats).length > 0 && (
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-500 delay-600 ${visibleElements >= 3 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">📊</span>
            Difficulty Distribution
            <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
              Cached ⚡
            </span>
          </h3>
          <div className="space-y-2">
            {Object.entries(cachedStats.difficultyStats).map(([difficulty, count], index) => (
              <div
                key={difficulty}
                className={`flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 ${visibleElements >= 3 ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
                  }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                    {difficulty}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {count} problems
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Usage */}
      {Object.keys(cachedStats.platformStats).length > 0 && (
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-500 delay-900 ${visibleElements >= 4 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🌐</span>
            Platform Usage
            <span className="ml-2 text-sm bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
              Cached ⚡
            </span>
          </h3>
          <div className="space-y-2">
            {Object.entries(cachedStats.platformStats)
              .sort(([, a], [, b]) => b - a)
              .map(([platform, count], index) => (
                <div
                  key={platform}
                  className={`flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 ${visibleElements >= 4 ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
                    }`}
                  style={{ transitionDelay: `${900 + index * 100}ms` }}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{platform}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${(count / Math.max(...Object.values(cachedStats.platformStats))) * 100}%`,
                          transitionDelay: `${900 + index * 100}ms`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Topics */}
      {Object.keys(cachedStats.topicStats).length > 0 && (
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-500 delay-1200 ${visibleElements >= 5 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">📚</span>
            Most Studied Topics
            <span className="ml-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
              Cached ⚡
            </span>
          </h3>
          <div className="space-y-2">
            {Object.entries(cachedStats.topicStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([topic, count], index) => (
                <div
                  key={topic}
                  className={`flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 ${visibleElements >= 5 ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
                    }`}
                  style={{ transitionDelay: `${1200 + index * 100}ms` }}
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{count} sessions</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {cachedStats.recentActivities.length > 0 && (
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-500 delay-1500 ${visibleElements >= 6 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🕒</span>
            Recent Activity
            <span className="ml-2 text-sm bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
              Cached ⚡
            </span>
          </h3>
          <div className="space-y-2">
            {cachedStats.recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 ${visibleElements >= 6 ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
                  }`}
                style={{ transitionDelay: `${1500 + index * 100}ms` }}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800 dark:text-white text-sm">
                    {activity.dsaTopic || activity.category}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {formatTime(activity.duration)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cache Info */}
      <div className={`text-center text-xs text-gray-400 dark:text-gray-500 transition-all duration-500 delay-1800 ${visibleElements >= 6 ? 'opacity-100' : 'opacity-0'
        }`}>
        ⚡ Statistics cached for optimal performance • Last calculated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ProgressStats;