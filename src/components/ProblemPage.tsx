import React, { useState, useEffect } from 'react';
import { Activity } from '../types';

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  hints: string[];
  companies: string[];
  platforms: { name: string; url: string }[];
  timeComplexity: string;
  spaceComplexity: string;
}

interface ProblemPageProps {
  category: string;
  onBack: () => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'date'>) => void;
}

const PROBLEMS_BY_CATEGORY: Record<string, Problem[]> = {
  'Arrays': [
    {
      id: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      ],
      constraints: [
        '2 ≤ nums.length ≤ 10⁴',
        '-10⁹ ≤ nums[i] ≤ 10⁹',
        '-10⁹ ≤ target ≤ 10⁹',
        'Only one valid answer exists.'
      ],
      hints: [
        'Try using a hash map to store the complement of each number.',
        'For each number, check if its complement exists in the hash map.'
      ],
      companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
      platforms: [
        { name: 'LeetCode', url: 'https://leetcode.com/problems/two-sum/' },
        { name: 'HackerRank', url: 'https://www.hackerrank.com/challenges/ctci-array-left-rotation/' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    {
      id: 'best-time-buy-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'Easy',
      description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
      examples: [
        {
          input: 'prices = [7,1,5,3,6,4]',
          output: '5',
          explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
        }
      ],
      constraints: [
        '1 ≤ prices.length ≤ 10⁵',
        '0 ≤ prices[i] ≤ 10⁴'
      ],
      hints: [
        'Keep track of the minimum price seen so far.',
        'For each price, calculate the profit if we sell at that price.'
      ],
      companies: ['Facebook', 'Amazon', 'Microsoft'],
      platforms: [
        { name: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    }
  ],
  'Linked Lists': [
    {
      id: 'reverse-linked-list',
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      examples: [
        {
          input: 'head = [1,2,3,4,5]',
          output: '[5,4,3,2,1]',
          explanation: 'The linked list is reversed.'
        }
      ],
      constraints: [
        'The number of nodes in the list is the range [0, 5000].',
        '-5000 ≤ Node.val ≤ 5000'
      ],
      hints: [
        'Use three pointers: previous, current, and next.',
        'Iteratively reverse the links between nodes.'
      ],
      companies: ['Apple', 'Amazon', 'Microsoft'],
      platforms: [
        { name: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list/' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    }
  ],
  'Stacks and Queues': [
    {
      id: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
      examples: [
        {
          input: 's = "()"',
          output: 'true',
          explanation: 'The parentheses are properly matched.'
        }
      ],
      constraints: [
        '1 ≤ s.length ≤ 10⁴',
        's consists of parentheses only \'()[]{}\''
      ],
      hints: [
        'Use a stack to keep track of opening brackets.',
        'For each closing bracket, check if it matches the most recent opening bracket.'
      ],
      companies: ['Google', 'Amazon', 'Facebook'],
      platforms: [
        { name: 'LeetCode', url: 'https://leetcode.com/problems/valid-parentheses/' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)'
    }
  ],
  'Trees': [
    {
      id: 'maximum-depth-binary-tree',
      title: 'Maximum Depth of Binary Tree',
      difficulty: 'Easy',
      description: 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
      examples: [
        {
          input: 'root = [3,9,20,null,null,15,7]',
          output: '3',
          explanation: 'The maximum depth is 3.'
        }
      ],
      constraints: [
        'The number of nodes in the tree is in the range [0, 10⁴].',
        '-100 ≤ Node.val ≤ 100'
      ],
      hints: [
        'Use recursion to find the depth of left and right subtrees.',
        'The maximum depth is 1 + max(left_depth, right_depth).'
      ],
      companies: ['Microsoft', 'Amazon', 'Apple'],
      platforms: [
        { name: 'LeetCode', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h) where h is height'
    }
  ],
  'Dynamic Programming': [
    {
      id: 'climbing-stairs',
      title: 'Climbing Stairs',
      difficulty: 'Easy',
      description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      examples: [
        {
          input: 'n = 2',
          output: '2',
          explanation: 'There are two ways: 1. 1 step + 1 step 2. 2 steps'
        }
      ],
      constraints: [
        '1 ≤ n ≤ 45'
      ],
      hints: [
        'This is similar to the Fibonacci sequence.',
        'The number of ways to reach step n is the sum of ways to reach step n-1 and n-2.'
      ],
      companies: ['Amazon', 'Google', 'Adobe'],
      platforms: [
        { name: 'LeetCode', url: 'https://leetcode.com/problems/climbing-stairs/' }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    }
  ]
};

const ProblemPage: React.FC<ProblemPageProps> = ({ category, onBack, onAddActivity }) => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [solved, setSolved] = useState(false);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(30);

  const problems = PROBLEMS_BY_CATEGORY[category] || [];

  useEffect(() => {
    if (problems.length > 0) {
      setSelectedProblem(problems[0]);
    }
  }, [category, problems]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Medium': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'Hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const handleSolveProblem = () => {
    if (selectedProblem) {
      onAddActivity({
        description: `Solved: ${selectedProblem.title}`,
        category: category,
        dsaTopic: category,
        difficulty: selectedProblem.difficulty,
        platform: 'DSA Roadmap',
        timeComplexity: selectedProblem.timeComplexity,
        spaceComplexity: selectedProblem.spaceComplexity,
        duration: duration,
        problemSolved: solved,
        notes: notes || `Solved ${selectedProblem.title} from DSA Roadmap`,
        value: solved ? 3 : 1
      });

      // Reset form
      setSolved(false);
      setNotes('');
      setDuration(30);

      // Show success message
      alert(`Successfully logged ${selectedProblem.title}!`);
    }
  };

  if (!selectedProblem) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No Problems Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Problems for {category} are coming soon!</p>
          <button
            onClick={onBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-200"
          >
            Back to Roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Roadmap
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProblem.difficulty)}`}>
            {selectedProblem.difficulty}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{selectedProblem.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">Category: {category}</p>

        {/* Problem selector */}
        {problems.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {problems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => setSelectedProblem(problem)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedProblem.id === problem.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {problem.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Problem Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Problem Description</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedProblem.description}</p>
          </div>

          {/* Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Examples</h2>
            {selectedProblem.examples.map((example, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="mb-2">
                  <span className="font-semibold text-gray-800 dark:text-white">Input: </span>
                  <code className="text-blue-600 dark:text-blue-400">{example.input}</code>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-800 dark:text-white">Output: </span>
                  <code className="text-green-600 dark:text-green-400">{example.output}</code>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-white">Explanation: </span>
                  <span className="text-gray-700 dark:text-gray-300">{example.explanation}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Constraints */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Constraints</h2>
            <ul className="space-y-2">
              {selectedProblem.constraints.map((constraint, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <code className="text-sm">{constraint}</code>
                </li>
              ))}
            </ul>
          </div>

          {/* Hints */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Hints</h2>
              <button
                onClick={() => setShowHints(!showHints)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-all duration-200"
              >
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </button>
            </div>
            {showHints && (
              <ul className="space-y-2">
                {selectedProblem.hints.map((hint, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="text-yellow-500 mr-2">💡</span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Complexity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Complexity</h3>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Time: </span>
                <code className="text-blue-600 dark:text-blue-400">{selectedProblem.timeComplexity}</code>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Space: </span>
                <code className="text-green-600 dark:text-green-400">{selectedProblem.spaceComplexity}</code>
              </div>
            </div>
          </div>

          {/* Companies */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Asked by Companies</h3>
            <div className="flex flex-wrap gap-2">
              {selectedProblem.companies.map((company) => (
                <span
                  key={company}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Practice Links</h3>
            <div className="space-y-3">
              {selectedProblem.platforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="font-medium text-gray-800 dark:text-white">{platform.name}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Log Activity */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-green-200 dark:border-gray-600 p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Log Your Progress</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={solved}
                    onChange={(e) => setSolved(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Problem Solved</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Spent (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Your thoughts, approach, or learnings..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  rows={3}
                />
              </div>

              <button
                onClick={handleSolveProblem}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Log Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;