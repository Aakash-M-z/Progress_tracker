import React, { useState } from 'react';

interface SolutionResource {
  id: string;
  problemName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  resources: {
    type: 'video' | 'article' | 'website';
    title: string;
    url: string;
    author: string;
    platform: string;
    duration?: string;
    quality: 'beginner' | 'intermediate' | 'advanced';
  }[];
}

const SOLUTION_RESOURCES: SolutionResource[] = [
  {
    id: 'two-sum',
    problemName: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    resources: [
      {
        type: 'video',
        title: 'Two Sum - LeetCode Solution Explained',
        url: 'https://www.youtube.com/watch?v=KLlXCFG5TnA',
        author: 'NeetCode',
        platform: 'YouTube',
        duration: '5:32',
        quality: 'beginner'
      },
      {
        type: 'article',
        title: 'Two Sum Problem - Multiple Approaches',
        url: 'https://leetcode.com/problems/two-sum/solution/',
        author: 'LeetCode',
        platform: 'LeetCode',
        quality: 'intermediate'
      },
      {
        type: 'video',
        title: 'Two Sum Solution in Multiple Languages',
        url: 'https://www.youtube.com/watch?v=Ivyh3V4HuGc',
        author: 'Tech With Tim',
        platform: 'YouTube',
        duration: '8:15',
        quality: 'beginner'
      }
    ]
  },
  {
    id: 'valid-parentheses',
    problemName: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks & Queues',
    resources: [
      {
        type: 'video',
        title: 'Valid Parentheses - Stack Solution',
        url: 'https://www.youtube.com/watch?v=WTzjTskDFMg',
        author: 'NeetCode',
        platform: 'YouTube',
        duration: '6:45',
        quality: 'beginner'
      },
      {
        type: 'article',
        title: 'Understanding Stack-based Solutions',
        url: 'https://www.geeksforgeeks.org/check-for-balanced-parentheses-in-an-expression/',
        author: 'GeeksforGeeks',
        platform: 'GeeksforGeeks',
        quality: 'intermediate'
      }
    ]
  },
  {
    id: 'merge-sorted-lists',
    problemName: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked Lists',
    resources: [
      {
        type: 'video',
        title: 'Merge Two Sorted Lists - Recursive & Iterative',
        url: 'https://www.youtube.com/watch?v=XIdigk956u0',
        author: 'NeetCode',
        platform: 'YouTube',
        duration: '7:22',
        quality: 'beginner'
      },
      {
        type: 'article',
        title: 'Linked List Merging Techniques',
        url: 'https://www.programiz.com/dsa/merge-sort',
        author: 'Programiz',
        platform: 'Programiz',
        quality: 'intermediate'
      }
    ]
  },
  {
    id: 'maximum-subarray',
    problemName: 'Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    resources: [
      {
        type: 'video',
        title: 'Kadane\'s Algorithm Explained',
        url: 'https://www.youtube.com/watch?v=5WZl3MMT0Eg',
        author: 'NeetCode',
        platform: 'YouTube',
        duration: '9:15',
        quality: 'intermediate'
      },
      {
        type: 'article',
        title: 'Dynamic Programming - Maximum Subarray',
        url: 'https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/',
        author: 'GeeksforGeeks',
        platform: 'GeeksforGeeks',
        quality: 'advanced'
      },
      {
        type: 'video',
        title: 'Kadane\'s Algorithm Visualization',
        url: 'https://www.youtube.com/watch?v=86CQq3pKSUw',
        author: 'Back To Back SWE',
        platform: 'YouTube',
        duration: '12:30',
        quality: 'advanced'
      }
    ]
  },
  {
    id: 'binary-tree-traversal',
    problemName: 'Binary Tree Inorder Traversal',
    difficulty: 'Easy',
    category: 'Trees & Binary Trees',
    resources: [
      {
        type: 'video',
        title: 'Tree Traversals - Inorder, Preorder, Postorder',
        url: 'https://www.youtube.com/watch?v=BHB0B1jFKUE',
        author: 'NeetCode',
        platform: 'YouTube',
        duration: '11:45',
        quality: 'beginner'
      },
      {
        type: 'article',
        title: 'Binary Tree Traversal Methods',
        url: 'https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/',
        author: 'GeeksforGeeks',
        platform: 'GeeksforGeeks',
        quality: 'intermediate'
      }
    ]
  }
];

const SolutionResources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredResources = SOLUTION_RESOURCES.filter((resource) => {
    const matchesSearch = resource.problemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || resource.difficulty === selectedDifficulty;
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📖';
      case 'website': return '🌐';
      default: return '📄';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const categories = [...new Set(SOLUTION_RESOURCES.map(r => r.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-2">
          <span className="text-3xl">🎓</span>
          Solution Resources
        </h2>
        <p className="text-indigo-700 dark:text-indigo-300 text-sm">
          Video tutorials, articles, and guides to help you understand DSA problems better
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Problems
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by problem name or category..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="space-y-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{resource.problemName}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm">{resource.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {resource.resources.length} resources
                  </span>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {resource.resources.map((res, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getResourceIcon(res.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1 truncate">
                          {res.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            by {res.author} • {res.platform}
                          </span>
                          {res.duration && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                              {res.duration}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getQualityColor(res.quality)}`}>
                            {res.quality}
                          </span>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium hover:underline"
                          >
                            View Resource →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No resources found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search filters to find more resources
          </p>
        </div>
      )}
    </div>
  );
};

export default SolutionResources;