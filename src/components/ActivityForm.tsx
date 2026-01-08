import React, { useState } from 'react';
import { Activity } from '../types';

interface ActivityFormProps {
  onAddActivity: (activity: Omit<Activity, 'id' | 'date'>) => void;
}

const DSA_CATEGORIES = [
  'Arrays & Strings',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & Binary Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy Algorithms',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Backtracking',
  'Heap/Priority Queue',
  'Trie',
  'Union Find',
  'Bit Manipulation',
  'Math',
  'Sorting',
  'Recursion',
  'Other'
];

const PLATFORMS = [
  'LeetCode',
  'HackerRank',
  'CodeForces',
  'AtCoder',
  'CodeChef',
  'GeeksforGeeks',
  'InterviewBit',
  'Other'
];

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

const ActivityForm: React.FC<ActivityFormProps> = ({ onAddActivity }) => {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number>(2);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // DSA specific fields
  const [dsaTopic, setDsaTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');
  const [platform, setPlatform] = useState('');
  const [problemSolved, setProblemSolved] = useState(false);
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = category === 'Other' ? customCategory : category;

    if (!finalCategory || !duration || !description || !date) {
      alert('Please fill in all required fields');
      return;
    }

    const newActivity: Omit<Activity, 'id' | 'date'> = {
      category: finalCategory,
      duration: parseInt(duration, 10),
      description,
      value: value,
      dsaTopic: dsaTopic || undefined,
      difficulty: difficulty || undefined,
      platform: platform || undefined,
      problemSolved: problemSolved || undefined,
      timeComplexity: timeComplexity || undefined,
      spaceComplexity: spaceComplexity || undefined,
      notes: notes || undefined
    };

    onAddActivity(newActivity);

    // Show success message for solved problems
    if (problemSolved) {
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      successMessage.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-xl">🎉</span>
          <span class="font-medium">Problem solved! Check your badges!</span>
        </div>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    }

    // Reset form
    setCategory('');
    setCustomCategory('');
    setDuration('');
    setDescription('');
    setValue(2);
    setDsaTopic('');
    setDifficulty('');
    setPlatform('');
    setProblemSolved(false);
    setTimeComplexity('');
    setSpaceComplexity('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date *
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white field-focus"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          DSA Category *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
          required
        >
          <option value="">Select a DSA category</option>
          {DSA_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {category === 'Other' && (
        <div>
          <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Category *
          </label>
          <input
            type="text"
            id="customCategory"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="dsaTopic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Specific Topic/Problem
        </label>
        <input
          type="text"
          id="dsaTopic"
          value={dsaTopic}
          onChange={(e) => setDsaTopic(e.target.value)}
          placeholder="e.g., Two Sum, Binary Tree Traversal"
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard' | '')}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
          >
            <option value="">Select difficulty</option>
            {DIFFICULTY_LEVELS.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Platform
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
          >
            <option value="">Select platform</option>
            {PLATFORMS.map((plat) => (
              <option key={plat} value={plat}>{plat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <input
          type="checkbox"
          id="problemSolved"
          checked={problemSolved}
          onChange={(e) => setProblemSolved(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="problemSolved" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Problem Solved
        </label>
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Spent (minutes) *
        </label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
          placeholder="Time spent on this problem/topic"
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="timeComplexity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Complexity
          </label>
          <input
            type="text"
            id="timeComplexity"
            value={timeComplexity}
            onChange={(e) => setTimeComplexity(e.target.value)}
            placeholder="e.g., O(n), O(log n)"
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
          />
        </div>

        <div>
          <label htmlFor="spaceComplexity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Space Complexity
          </label>
          <input
            type="text"
            id="spaceComplexity"
            value={spaceComplexity}
            onChange={(e) => setSpaceComplexity(e.target.value)}
            placeholder="e.g., O(1), O(n)"
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Problem Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief description of the problem or what you worked on"
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors resize-none"
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes & Insights
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Key insights, approach used, mistakes made, lessons learned"
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Understanding Level (1-4)
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="1"
              max="4"
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300 w-8 text-center">{value}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Basic</span>
            <span>Mastered</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg btn-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium text-base animate-glow"
      >
        📝 Log DSA Activity
      </button>
    </form>
  );
};

export default ActivityForm;