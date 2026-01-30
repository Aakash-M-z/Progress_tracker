import React, { useState, useEffect } from 'react';
import { Activity } from '../types';

interface UserProfileProps {
  activities: Activity[];
}

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface LevelCriteria {
  level: SkillLevel;
  minProblems: number;
  minTopics: number;
  minStreak: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

const LEVEL_CRITERIA: LevelCriteria[] = [
  {
    level: 'beginner',
    minProblems: 0,
    minTopics: 0,
    minStreak: 0,
    title: 'Beginner',
    description: 'Just getting started with DSA journey',
    icon: '🌱',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
  },
  {
    level: 'intermediate',
    minProblems: 15,
    minTopics: 4,
    minStreak: 3,
    title: 'Intermediate',
    description: 'Making solid progress in problem solving',
    icon: '🚀',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
  },
  {
    level: 'advanced',
    minProblems: 50,
    minTopics: 8,
    minStreak: 7,
    title: 'Advanced',
    description: 'Expert problem solver with consistent practice',
    icon: '👑',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30'
  }
];

const UserProfile: React.FC<UserProfileProps> = ({ activities }) => {
  const [currentLevel, setCurrentLevel] = useState<LevelCriteria>(LEVEL_CRITERIA[0]);
  const [nextLevel, setNextLevel] = useState<LevelCriteria | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalProblems = activities.filter(a => a.problemSolved).length;
    const totalTopics = new Set(activities.map(a => a.category)).size;

    // Calculate streak
    const uniqueDates = [...new Set(activities.filter(a => a.date && typeof a.date === 'string').map(a => a.date.split('T')[0]))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
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

    // Determine current level
    let level = LEVEL_CRITERIA[0];
    for (let i = LEVEL_CRITERIA.length - 1; i >= 0; i--) {
      const criteria = LEVEL_CRITERIA[i];
      if (totalProblems >= criteria.minProblems &&
        totalTopics >= criteria.minTopics &&
        streak >= criteria.minStreak) {
        level = criteria;
        break;
      }
    }

    setCurrentLevel(level);

    // Find next level
    const currentIndex = LEVEL_CRITERIA.findIndex(l => l.level === level.level);
    const next = currentIndex < LEVEL_CRITERIA.length - 1 ? LEVEL_CRITERIA[currentIndex + 1] : null;
    setNextLevel(next);

    // Calculate progress to next level
    if (next) {
      const problemProgress = Math.min(totalProblems / next.minProblems, 1);
      const topicProgress = Math.min(totalTopics / next.minTopics, 1);
      const streakProgress = Math.min(streak / next.minStreak, 1);
      const avgProgress = (problemProgress + topicProgress + streakProgress) / 3;
      setProgress(avgProgress * 100);
    } else {
      setProgress(100);
    }
  }, [activities]);

  const totalProblems = activities.filter(a => a.problemSolved).length;
  const totalTopics = new Set(activities.map(a => a.category)).size;
  const uniqueDates = [...new Set(activities.filter(a => a.date && typeof a.date === 'string').map(a => a.date.split('T')[0]))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  if (uniqueDates.includes(today)) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      const prevDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) currentStreak++;
      else break;
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Level Card */}
      <div className={`bg-gradient-to-br ${currentLevel.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl animate-bounce">{currentLevel.icon}</div>
            <div>
              <h3 className={`text-2xl font-bold ${currentLevel.color}`}>{currentLevel.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{currentLevel.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${currentLevel.color}`}>Level {LEVEL_CRITERIA.findIndex(l => l.level === currentLevel.level) + 1}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">Current</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-xl font-bold ${currentLevel.color}`}>{totalProblems}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Problems Solved</div>
          </div>
          <div>
            <div className={`text-xl font-bold ${currentLevel.color}`}>{totalTopics}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Topics Covered</div>
          </div>
          <div>
            <div className={`text-xl font-bold ${currentLevel.color}`}>{currentStreak}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Progress to Next Level */}
      {nextLevel && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Progress to {nextLevel.title}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-700 dark:text-gray-300">
                {totalProblems}/{nextLevel.minProblems}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Problems</div>
              <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1`}>
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalProblems / nextLevel.minProblems) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700 dark:text-gray-300">
                {totalTopics}/{nextLevel.minTopics}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Topics</div>
              <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1`}>
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalTopics / nextLevel.minTopics) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-700 dark:text-gray-300">
                {currentStreak}/{nextLevel.minStreak}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Streak</div>
              <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1`}>
                <div
                  className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentStreak / nextLevel.minStreak) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Levels Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Level System
        </h3>
        <div className="space-y-3">
          {LEVEL_CRITERIA.map((level) => (
            <div
              key={level.level}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${level.level === currentLevel.level
                ? `bg-gradient-to-r ${level.bgColor} border-2 border-current`
                : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
            >
              <div className="text-2xl">{level.icon}</div>
              <div className="flex-1">
                <div className={`font-semibold ${level.level === currentLevel.level ? level.color : 'text-gray-700 dark:text-gray-300'}`}>
                  {level.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {level.minProblems}+ problems • {level.minTopics}+ topics • {level.minStreak}+ day streak
                </div>
              </div>
              {level.level === currentLevel.level && (
                <div className="text-green-500 text-xl">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;