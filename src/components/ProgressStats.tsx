import React from 'react';
import { Activity } from '../types';

interface ProgressStatsProps {
  activities: Activity[];
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ activities }) => {
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
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl">
          <div className="text-xl font-bold">{totalActivities}</div>
          <div className="text-xs opacity-90">Total Sessions</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-xl">
          <div className="text-xl font-bold">{problemsSolved}</div>
          <div className="text-xs opacity-90">Problems Solved</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-xl">
          <div className="text-xl font-bold">{formatTime(totalTime)}</div>
          <div className="text-xs opacity-90">Total Time</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 rounded-xl">
          <div className="text-xl font-bold">{averageValue}</div>
          <div className="text-xs opacity-90">Avg. Understanding</div>
        </div>
      </div>

      {/* Success Rate */}
      {totalProblems > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🎯</span>
            Success Rate
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(problemsSolved / totalProblems) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round((problemsSolved / totalProblems) * 100)}%
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {problemsSolved} out of {totalProblems} problems solved
          </div>
        </div>
      )}

      {/* Difficulty Distribution */}
      {Object.keys(difficultyStats).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">📊</span>
            Difficulty Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(difficultyStats).map(([difficulty, count]) => (
              <div key={difficulty} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
      {Object.keys(platformStats).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🌐</span>
            Platform Usage
          </h3>
          <div className="space-y-2">
            {Object.entries(platformStats)
              .sort(([,a], [,b]) => b - a)
              .map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{platform}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / Math.max(...Object.values(platformStats))) * 100}%` }}
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
      {Object.keys(topicStats).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">📚</span>
            Most Studied Topics
          </h3>
          <div className="space-y-2">
            {Object.entries(topicStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([topic, count]) => (
                <div key={topic} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{count} sessions</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🕒</span>
            Recent Activity
          </h3>
          <div className="space-y-2">
            {activities
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
    </div>
  );
};

export default ProgressStats;