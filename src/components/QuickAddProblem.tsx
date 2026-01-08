import React, { useState } from 'react';
import { Activity } from '../types';

interface QuickAddProblemProps {
  onAddActivity: (activity: Omit<Activity, 'id' | 'date'>) => void;
}

const POPULAR_PROBLEMS = [
  { name: 'Two Sum', difficulty: 'Easy', platform: 'LeetCode', category: 'Arrays & Strings' },
  { name: 'Valid Parentheses', difficulty: 'Easy', platform: 'LeetCode', category: 'Stacks & Queues' },
  { name: 'Merge Two Sorted Lists', difficulty: 'Easy', platform: 'LeetCode', category: 'Linked Lists' },
  { name: 'Maximum Subarray', difficulty: 'Medium', platform: 'LeetCode', category: 'Dynamic Programming' },
  { name: 'Climbing Stairs', difficulty: 'Easy', platform: 'LeetCode', category: 'Dynamic Programming' },
  { name: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', platform: 'LeetCode', category: 'Greedy Algorithms' },
];

const QuickAddProblem: React.FC<QuickAddProblemProps> = ({ onAddActivity }) => {
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState<number>(15);
  const [solved, setSolved] = useState<boolean>(false);

  const handleQuickAdd = (problem: typeof POPULAR_PROBLEMS[0]) => {
    const newActivity: Omit<Activity, 'id' | 'date'> = {
      category: problem.category,
      duration: timeSpent,
      description: `Worked on ${problem.name}`,
      value: solved ? 3 : 2,
      dsaTopic: problem.name,
      difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard',
      platform: problem.platform,
      problemSolved: solved,
    };

    onAddActivity(newActivity);

    // Show success animation
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 animate-bounce';
    successDiv.innerHTML = `
      <div class="text-center">
        <div class="text-4xl mb-2">${solved ? '🎉' : '📚'}</div>
        <div class="font-bold text-lg">${solved ? 'Problem Solved!' : 'Progress Logged!'}</div>
        <div class="text-sm opacity-90">+${solved ? 15 : 10} points earned</div>
      </div>
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.style.transform = 'translate(-50%, -50%) scale(0)';
      setTimeout(() => document.body.removeChild(successDiv), 300);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
        <span className="text-xl">⚡</span>
        Quick Add Popular Problems
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Spent (min)
            </label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(Number(e.target.value))}
              min="5"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={solved}
                onChange={(e) => setSolved(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solved</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {POPULAR_PROBLEMS.map((problem, index) => (
            <button
              key={index}
              onClick={() => handleQuickAdd(problem)}
              className="p-3 text-left bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <div className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                {problem.name}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded text-xs font-medium ${problem.difficulty === 'Easy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : problem.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                  {problem.difficulty}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {problem.platform}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Click any problem to quickly log your practice session
        </div>
      </div>
    </div>
  );
};

export default QuickAddProblem;