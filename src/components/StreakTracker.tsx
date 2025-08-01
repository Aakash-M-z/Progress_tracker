import React from 'react';
import { Activity } from '../types';

interface StreakTrackerProps {
  activities: Activity[];
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ activities }) => {
  // Calculate current streak
  const calculateStreak = () => {
    if (activities.length === 0) return 0;
    
    const sortedActivities = activities
      .map(activity => new Date(activity.date).toISOString().split('T')[0])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const uniqueDates = [...new Set(sortedActivities)];
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Check if user has activity today or yesterday
    if (uniqueDates.includes(today)) {
      streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i - 1]);
        const prevDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    } else if (uniqueDates.includes(yesterday)) {
      // Check if the last activity was yesterday
      const lastActivityDate = new Date(uniqueDates[0]);
      const yesterdayDate = new Date(yesterday);
      const diffDays = Math.floor((lastActivityDate.getTime() - yesterdayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i - 1]);
          const prevDate = new Date(uniqueDates[i]);
          const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();
  
  // Calculate achievements
  const totalProblems = activities.filter(activity => activity.problemSolved).length;
  const totalTime = activities.reduce((sum, activity) => sum + activity.duration, 0);
  const uniqueTopics = new Set(activities.map(activity => activity.category)).size;
  
  const achievements = [
    { name: 'First Problem', description: 'Solve your first DSA problem', achieved: totalProblems >= 1, icon: '🎯' },
    { name: '10 Problems', description: 'Solve 10 DSA problems', achieved: totalProblems >= 10, icon: '🔥' },
    { name: '50 Problems', description: 'Solve 50 DSA problems', achieved: totalProblems >= 50, icon: '💪' },
    { name: '100 Problems', description: 'Solve 100 DSA problems', achieved: totalProblems >= 100, icon: '🏆' },
    { name: '1 Hour', description: 'Spend 1 hour on DSA', achieved: totalTime >= 60, icon: '⏰' },
    { name: '10 Hours', description: 'Spend 10 hours on DSA', achieved: totalTime >= 600, icon: '📚' },
    { name: '3-Day Streak', description: 'Practice for 3 consecutive days', achieved: currentStreak >= 3, icon: '🔥' },
    { name: '7-Day Streak', description: 'Practice for 7 consecutive days', achieved: currentStreak >= 7, icon: '⚡' },
    { name: '30-Day Streak', description: 'Practice for 30 consecutive days', achieved: currentStreak >= 30, icon: '🌟' },
    { name: '5 Topics', description: 'Study 5 different DSA topics', achieved: uniqueTopics >= 5, icon: '📖' },
  ];

  const achievedCount = achievements.filter(achievement => achievement.achieved).length;

  return (
    <div className="space-y-4">
      {/* Current Streak */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1 flex items-center">
              <span className="mr-2">🔥</span>
              Current Streak
            </h2>
            <p className="text-orange-100 text-xs sm:text-sm">Keep the momentum going!</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl sm:text-4xl font-bold">{currentStreak}</div>
            <div className="text-orange-100 text-xs sm:text-sm">days</div>
          </div>
        </div>
        
        {currentStreak === 0 && (
          <div className="mt-3 p-3 bg-white/20 rounded-lg">
            <p className="text-xs sm:text-sm">Start your DSA journey today! Log your first activity to begin your streak.</p>
          </div>
        )}
        
        {currentStreak > 0 && (
          <div className="mt-3 p-3 bg-white/20 rounded-lg">
            <p className="text-xs sm:text-sm">
              {currentStreak === 1 
                ? "Great start! Come back tomorrow to continue your streak."
                : `Amazing! You've been practicing for ${currentStreak} consecutive days.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalProblems}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Problems Solved</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{Math.floor(totalTime / 60)}h</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Time</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🏆</span>
            Achievements
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {achievedCount}/{achievements.length} unlocked
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                achievement.achieved
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-xl ${achievement.achieved ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium text-xs ${
                    achievement.achieved 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {achievement.description}
                  </div>
                </div>
                {achievement.achieved && (
                  <div className="text-green-500 text-lg">✓</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Daily Motivation
        </h3>
        <p className="text-purple-100 mb-3 text-xs sm:text-sm">
          "The only way to learn a new programming language is by writing programs in it."
        </p>
        <p className="text-xs text-purple-200">- Dennis Ritchie</p>
      </div>

      {/* Next Milestone */}
      {achievedCount < achievements.length && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🎯</span>
            Next Milestone
          </h3>
          {(() => {
            const nextAchievement = achievements.find(achievement => !achievement.achieved);
            if (nextAchievement) {
              return (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xl opacity-50">{nextAchievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-white text-sm">{nextAchievement.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{nextAchievement.description}</div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};

export default StreakTracker; 