export interface Activity {
  id: string;
  date: string; // ISO string format
  category: string;
  duration: number; // in minutes
  description: string;
  value: number; // intensity or value for heatmap (1-4)
  // DSA specific fields
  dsaTopic?: string; // e.g., "Arrays", "Linked Lists", "Trees"
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  platform?: string; // e.g., "LeetCode", "HackerRank", "CodeForces"
  problemSolved?: boolean;
  timeComplexity?: string; // e.g., "O(n)", "O(log n)"
  spaceComplexity?: string; // e.g., "O(1)", "O(n)"
  notes?: string; // Additional notes about the problem/solution
}

export interface HeatmapValue {
  date: string;
  count: number;
  value: number;
}

export interface CategorySummary {
  category: string;
  totalDuration: number;
  activityCount: number;
  averageValue: number;
}

// DSA specific types
export interface DSATopic {
  name: string;
  category: 'Data Structures' | 'Algorithms' | 'Techniques';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Mastered';
  problemsSolved: number;
  totalProblems: number;
}

export interface DSAProgress {
  topics: DSATopic[];
  totalProblemsSolved: number;
  totalTimeSpent: number; // in minutes
  streakDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Problem {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: string;
  status: 'Not Attempted' | 'Attempted' | 'Solved' | 'Mastered';
  dateSolved?: string;
  timeSpent?: number; // in minutes
  notes?: string;
  solution?: string;
}