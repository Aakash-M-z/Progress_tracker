import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DailyProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  platform: string;
  description: string;
  url?: string;
}

const DAILY_PROBLEMS: DailyProblem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    platform: 'LeetCode',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    url: 'https://leetcode.com/problems/two-sum/'
  },
  {
    id: '2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks & Queues',
    platform: 'LeetCode',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    url: 'https://leetcode.com/problems/valid-parentheses/'
  },
  {
    id: '3',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked Lists',
    platform: 'LeetCode',
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted list.',
    url: 'https://leetcode.com/problems/merge-two-sorted-lists/'
  },
  {
    id: '4',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    platform: 'LeetCode',
    description: 'Given an integer array nums, find the subarray which has the largest sum and return its sum.',
    url: 'https://leetcode.com/problems/maximum-subarray/'
  },
  {
    id: '5',
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'Easy',
    category: 'Trees & Binary Trees',
    platform: 'LeetCode',
    description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
    url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/'
  },
  {
    id: '6',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Greedy Algorithms',
    platform: 'LeetCode',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.',
    url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/'
  },
  {
    id: '7',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    category: 'Math',
    platform: 'LeetCode',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    url: 'https://leetcode.com/problems/palindrome-number/'
  }
];

interface DailyProblemNotificationProps {
  forceShow?: boolean;
  onClose?: () => void;
}

const DailyProblemNotification: React.FC<DailyProblemNotificationProps> = ({ forceShow = false, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dailyProblem, setDailyProblem] = useState<DailyProblem | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Get problem for today (rotate based on day of year)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const problemIndex = dayOfYear % DAILY_PROBLEMS.length;
    setDailyProblem(DAILY_PROBLEMS[problemIndex]);

    if (forceShow) {
      setIsVisible(true);
      return;
    }

    // Check if user has already seen today's problem
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem(`dailyProblem_${user.id}_lastShown`);
    const dismissed = localStorage.getItem(`dailyProblem_${user.id}_dismissed_${today}`);
    const notificationSettings = localStorage.getItem(`notifications_${user.id}`);
    const settings = notificationSettings ? JSON.parse(notificationSettings) : { dailyNotifications: true };

    if (settings.dailyNotifications && lastShown !== today && !dismissed) {
      // Show popup after a short delay
      setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem(`dailyProblem_${user.id}_lastShown`, today);
      }, 2000);
    }
  }, [user, forceShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (!forceShow && user && dailyProblem) {
      const today = new Date().toDateString();
      localStorage.setItem(`dailyProblem_${user.id}_dismissed_${today}`, 'true');
    }
    onClose?.();
  };

  const handleAccept = () => {
    setIsVisible(false);
    if (dailyProblem?.url) {
      window.open(dailyProblem.url, '_blank');
    }
    onClose?.();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  if (!isVisible || !dailyProblem) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn" onClick={handleDismiss} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 animate-fadeIn transform">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-bounce">🎯</div>
                <div>
                  <h2 className="text-xl font-bold">Daily Challenge</h2>
                  <p className="text-blue-100 text-sm">Ready to level up?</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {dailyProblem.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(dailyProblem.difficulty)}`}>
                  {dailyProblem.difficulty}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-blue-500">📚</span>
                <span>{dailyProblem.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500">💻</span>
                <span>{dailyProblem.platform}</span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {dailyProblem.description}
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700/50">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span className="text-lg">💡</span>
                <span className="font-medium">Pro Tip: Solve this problem to maintain your streak and improve your skills!</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Maybe Later
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Solve Now! 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyProblemNotification;