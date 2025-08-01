import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (activities: Activity[]) => boolean;
  reward: string;
  points: number;
}

interface BadgeSystemProps {
  activities: Activity[];
}

const BADGES: Badge[] = [
  {
    id: 'first_problem',
    name: 'First Steps',
    description: 'Solve your first DSA problem',
    icon: '🎯',
    rarity: 'common',
    condition: (activities) => activities.filter(a => a.problemSolved).length >= 1,
    reward: 'Beginner Badge',
    points: 10
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    rarity: 'rare',
    condition: (activities) => calculateStreak(activities) >= 7,
    reward: 'Streak Master Badge',
    points: 50
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Solve 100 problems',
    icon: '💯',
    rarity: 'epic',
    condition: (activities) => activities.filter(a => a.problemSolved).length >= 100,
    reward: 'Elite Solver Badge',
    points: 200
  },
  {
    id: 'hard_crusher',
    name: 'Hard Crusher',
    description: 'Solve 10 Hard problems',
    icon: '💪',
    rarity: 'epic',
    condition: (activities) => activities.filter(a => a.problemSolved && a.difficulty === 'Hard').length >= 10,
    reward: 'Expert Level Badge',
    points: 100
  },
  {
    id: 'all_rounder',
    name: 'All Rounder',
    description: 'Solve problems in 10+ categories',
    icon: '🌈',
    rarity: 'rare',
    condition: (activities) => new Set(activities.filter(a => a.problemSolved).map(a => a.category)).size >= 10,
    reward: 'Versatility Badge',
    points: 75
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Solve 5 problems in one day',
    icon: '⚡',
    rarity: 'rare',
    condition: (activities) => {
      const dailyCount = activities.reduce((acc, activity) => {
        if (activity.problemSolved) {
          const date = activity.date.split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      return Math.max(...Object.values(dailyCount), 0) >= 5;
    },
    reward: 'Lightning Badge',
    points: 60
  },
  {
    id: 'legendary_coder',
    name: 'Legendary Coder',
    description: 'Achieve 30-day streak with 500+ problems',
    icon: '👑',
    rarity: 'legendary',
    condition: (activities) => calculateStreak(activities) >= 30 && activities.filter(a => a.problemSolved).length >= 500,
    reward: 'Hall of Fame Entry',
    points: 1000
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Spend 100+ hours coding',
    icon: '🏃‍♂️',
    rarity: 'epic',
    condition: (activities) => activities.reduce((sum, a) => sum + a.duration, 0) >= 6000,
    reward: 'Endurance Badge',
    points: 150
  }
];

function calculateStreak(activities: Activity[]): number {
  if (activities.length === 0) return 0;
  
  const sortedDates = activities
    .map(activity => new Date(activity.date).toISOString().split('T')[0])
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const uniqueDates = [...new Set(sortedDates)];
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  
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
  }
  
  return streak;
}

const BadgeSystem: React.FC<BadgeSystemProps> = ({ activities }) => {
  const { user } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [showNewBadgeModal, setShowNewBadgeModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!user) return;

    const currentEarned = BADGES.filter(badge => badge.condition(activities));
    const previousEarned = JSON.parse(localStorage.getItem(`badges_${user.id}`) || '[]');
    const previousIds = previousEarned.map((b: Badge) => b.id);
    
    const newlyEarned = currentEarned.filter(badge => !previousIds.includes(badge.id));
    
    if (newlyEarned.length > 0) {
      setNewBadges(newlyEarned);
      setShowNewBadgeModal(true);
      localStorage.setItem(`badges_${user.id}`, JSON.stringify(currentEarned));
    }
    
    setEarnedBadges(currentEarned);
    setTotalPoints(currentEarned.reduce((sum, badge) => sum + badge.points, 0));
  }, [activities, user]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 dark:border-gray-600';
      case 'rare': return 'border-blue-300 dark:border-blue-600';
      case 'epic': return 'border-purple-300 dark:border-purple-600';
      case 'legendary': return 'border-yellow-300 dark:border-orange-500';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Points Display */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <span className="text-3xl">🏆</span>
                Achievement Points
              </h3>
              <p className="text-amber-600 dark:text-amber-400 text-sm">Earn points by unlocking badges</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">{totalPoints}</div>
              <div className="text-amber-500 dark:text-amber-500 text-sm">Total Points</div>
            </div>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.some(b => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  isEarned 
                    ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} ${getRarityBorder(badge.rarity)} shadow-lg` 
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50'
                }`}
              >
                {isEarned && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
                <div className="text-center space-y-2">
                  <div className={`text-4xl ${isEarned ? 'animate-bounce' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <h4 className={`font-bold text-sm ${
                    isEarned ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className={`text-xs ${
                    isEarned ? 'text-white/90' : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {badge.description}
                  </p>
                  <div className={`text-xs font-semibold ${
                    isEarned ? 'text-white' : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {badge.points} pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Badge Progress
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['common', 'rare', 'epic', 'legendary'].map((rarity) => {
              const totalRarity = BADGES.filter(b => b.rarity === rarity).length;
              const earnedRarity = earnedBadges.filter(b => b.rarity === rarity).length;
              return (
                <div key={rarity} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getRarityColor(rarity)} flex items-center justify-center text-white font-bold text-lg mb-2`}>
                    {earnedRarity}/{totalRarity}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {rarity}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Badge Modal */}
      {showNewBadgeModal && newBadges.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full animate-bounce">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-2xl text-white text-center">
                <div className="text-6xl mb-2">🎉</div>
                <h2 className="text-2xl font-bold">New Badge Earned!</h2>
                <p className="text-yellow-100">Congratulations on your achievement!</p>
              </div>
              
              <div className="p-6 space-y-4">
                {newBadges.map((badge) => (
                  <div key={badge.id} className={`p-4 rounded-xl bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white text-center`}>
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h3 className="text-xl font-bold">{badge.name}</h3>
                    <p className="text-sm opacity-90 mb-2">{badge.description}</p>
                    <div className="text-lg font-semibold">+{badge.points} points</div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 pt-0">
                <button
                  onClick={() => setShowNewBadgeModal(false)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Awesome! 🚀
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BadgeSystem;