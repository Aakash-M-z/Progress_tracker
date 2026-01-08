import React, { useState } from 'react';
import { DSATopic, Activity } from '../types';
import ProblemPage from './ProblemPage';

interface DSARoadmapProps {
  activities: Activity[];
  onAddActivity?: (activity: Omit<Activity, 'id' | 'date'>) => void;
}

const DSA_ROADMAP: DSATopic[] = [
  // Data Structures
  { name: 'Arrays & Strings', category: 'Data Structures', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 20 },
  { name: 'Linked Lists', category: 'Data Structures', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Stacks & Queues', category: 'Data Structures', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
  { name: 'Trees & Binary Trees', category: 'Data Structures', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 25 },
  { name: 'Graphs', category: 'Data Structures', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 20 },
  { name: 'Heap/Priority Queue', category: 'Data Structures', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 10 },
  { name: 'Trie', category: 'Data Structures', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 8 },
  { name: 'Union Find', category: 'Data Structures', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 6 },

  // Algorithms
  { name: 'Binary Search', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Two Pointers', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
  { name: 'Sliding Window', category: 'Algorithms', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Sorting', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 10 },
  { name: 'Recursion', category: 'Algorithms', difficulty: 'Beginner', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
  { name: 'Backtracking', category: 'Algorithms', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 15 },
  { name: 'Dynamic Programming', category: 'Algorithms', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 30 },
  { name: 'Greedy Algorithms', category: 'Algorithms', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 18 },
  { name: 'Bit Manipulation', category: 'Algorithms', difficulty: 'Advanced', status: 'Not Started', problemsSolved: 0, totalProblems: 8 },
  { name: 'Math', category: 'Algorithms', difficulty: 'Intermediate', status: 'Not Started', problemsSolved: 0, totalProblems: 12 },
];

const DSARoadmap: React.FC<DSARoadmapProps> = ({ activities, onAddActivity }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Data Structures' | 'Algorithms'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Calculate progress for each topic based on activities
  const roadmapWithProgress = DSA_ROADMAP.map(topic => {
    const topicActivities = activities.filter(activity =>
      activity.category === topic.name || activity.dsaTopic?.includes(topic.name)
    );

    const problemsSolved = topicActivities.filter(activity => activity.problemSolved).length;
    const totalProblems = topicActivities.length;

    let status: DSATopic['status'] = 'Not Started';
    if (problemsSolved > 0) {
      if (problemsSolved >= topic.totalProblems * 0.8) status = 'Mastered';
      else if (problemsSolved >= topic.totalProblems * 0.5) status = 'Completed';
      else status = 'In Progress';
    }

    return {
      ...topic,
      problemsSolved,
      totalProblems: Math.max(totalProblems, topic.totalProblems),
      status
    };
  });

  const filteredRoadmap = roadmapWithProgress.filter(topic => {
    const categoryMatch = selectedCategory === 'All' || topic.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || topic.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mastered': return 'bg-green-500 text-white';
      case 'Completed': return 'bg-blue-500 text-white';
      case 'In Progress': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Structures': return '🏗️';
      case 'Algorithms': return '⚡';
      default: return '📚';
    }
  };

  const totalProgress = roadmapWithProgress.reduce((acc, topic) => {
    acc.totalProblems += topic.totalProblems;
    acc.solvedProblems += topic.problemsSolved;
    return acc;
  }, { totalProblems: 0, solvedProblems: 0 });

  const overallProgress = totalProgress.totalProblems > 0
    ? (totalProgress.solvedProblems / totalProgress.totalProblems) * 100
    : 0;

  // If a topic is selected, show the problem page
  if (selectedTopic) {
    return (
      <ProblemPage
        category={selectedTopic}
        onBack={() => setSelectedTopic(null)}
        onAddActivity={onAddActivity || (() => { })}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-3 flex items-center">
          <span className="mr-3">🗺️</span>
          DSA Learning Roadmap
        </h2>
        <p className="text-blue-100 mb-6 text-lg">Track your progress through the complete DSA curriculum</p>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg">Overall Progress</span>
            <span className="text-2xl font-bold">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4">
            <div
              className="bg-white h-4 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <div className="text-lg text-blue-100">
            {totalProgress.solvedProblems} of {totalProgress.totalProblems} problems completed
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Algorithms">Algorithms</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-colors"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRoadmap.map((topic, index) => (
          <div
            key={index}
            onClick={() => setSelectedTopic(topic.name)}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(topic.category)}</span>
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{topic.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(topic.status)}`}>
                {topic.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(topic.difficulty)}`}>
                  {topic.difficulty}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {topic.problemsSolved}/{topic.totalProblems}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round((topic.problemsSolved / topic.totalProblems) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(topic.problemsSolved / topic.totalProblems) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {topic.category} • {topic.totalProblems} problems
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium">
                  Click to practice →
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRoadmap.length === 0 && (
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📚</div>
          <h3 className="text-2xl font-medium text-gray-800 dark:text-white mb-3">No topics found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Try adjusting your filters to see more topics</p>
        </div>
      )}
    </div>
  );
};

export default DSARoadmap; 