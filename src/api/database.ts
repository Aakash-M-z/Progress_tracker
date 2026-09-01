import { Activity, InsertActivity, User, InsertUser, AdminLog, Task, InsertTask } from '../../shared/schema';
import { SessionManager } from '../utils/sessionManager';
import { fetchWithAuth } from './fetchWithAuth';
import { API_BASE } from './config';

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = SessionManager.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export class DatabaseAPI {

  // ── Auth (no token needed — plain fetch) ────────────────────────

  async login(email: string, password: string): Promise<AuthResponse | null> {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || data.error || `HTTP ${res.status}`);
      err.code = data.error;
      throw err;
    }
    return data;
  }

  async register(email: string, password: string, username: string): Promise<AuthResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
      return res.json();
    } catch (e) { console.error('register:', e); return null; }
  }

  async googleAuth(accessToken: string): Promise<AuthResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
      return res.json();
    } catch (e) { console.error('googleAuth:', e); return null; }
  }

  // ── Profile (authenticated — uses fetchWithAuth) ─────────────────

  async getProfile(): Promise<User | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/user/profile`, { headers: authHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async updateProfile(data: Partial<User>): Promise<User | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/user/profile`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  // ── Users ────────────────────────────────────────────────────────

  async getUser(id: string | number): Promise<User | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users/${id}`, { headers: authHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users/by-username/${username}`, { headers: authHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async createUser(userData: InsertUser): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) return null;
      const data: AuthResponse = await res.json();
      return data.user as User;
    } catch { return null; }
  }

  // ── Activities ───────────────────────────────────────────────────

  async getUserActivities(userId: string | number): Promise<Activity[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users/${userId}/activities`, { headers: authHeaders() });
      if (!res.ok) { console.error(`Failed to fetch activities: ${res.status}`); return []; }
      return res.json();
    } catch (e) { console.error('getUserActivities:', e); return []; }
  }

  async createActivity(activityData: InsertActivity): Promise<Activity | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/activities`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(activityData),
      });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async updateActivity(id: string | number, activityData: Partial<Activity>): Promise<Activity | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/activities/${id}`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify(activityData),
      });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async deleteActivity(id: string | number): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/activities/${id}`, { method: 'DELETE', headers: authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  // ── Tasks ────────────────────────────────────────────────────────

  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users/${userId}/tasks`, { headers: authHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  }

  async createTask(task: InsertTask): Promise<Task | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(task),
      });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks/${id}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE', headers: authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  // ── Admin ────────────────────────────────────────────────────────

  async adminGetUsers(): Promise<Omit<User, 'password'>[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch (e) { console.error('adminGetUsers:', e); return []; }
  }

  async adminDeleteUser(userId: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders() });
      return res.ok;
    } catch { return false; }
  }

  async adminChangeRole(userId: string, role: 'admin' | 'user'): Promise<Omit<User, 'password'> | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch (e) { console.error('adminChangeRole:', e); return null; }
  }

  async adminChangePlan(userId: string, plan: 'free' | 'premium'): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ plan }),
      });
      return res.ok;
    } catch { return false; }
  }

  async adminGetActivities(filters?: { userId?: string; date?: string }): Promise<Activity[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.set('userId', filters.userId);
      if (filters?.date) params.set('date', filters.date);
      const res = await fetchWithAuth(`${API_BASE}/api/admin/activities?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch (e) { console.error('adminGetActivities:', e); return []; }
  }

  async adminGetLogs(): Promise<AdminLog[]> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/logs`, { headers: authHeaders() });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    } catch (e) { console.error('adminGetLogs:', e); return []; }
  }

  // ── AI ───────────────────────────────────────────────────────────

  async analyzeProgress(activities: Activity[], username?: string): Promise<any | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/ai/analyze`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ activities, username }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
      return res.json();
    } catch (e) { console.error('analyzeProgress:', e); return null; }
  }

  async explainTopic(subject: string, topic: string, subtopics: string[], interviewQuestions: string[]): Promise<{ explanation: string | null; fallback?: boolean; errorCode?: string; keyPoints?: string[] }> {
    const res = await fetchWithAuth(`${API_BASE}/api/ai/explain-topic`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ subject, topic, subtopics, interviewQuestions }),
    });
    if (res.status === 403) {
      const e = await res.json().catch(() => ({}));
      const err: any = new Error(e.message || 'AI_LIMIT_REACHED');
      err.code = 'AI_LIMIT_REACHED';
      throw err;
    }
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      const err: any = new Error(e.message || e.error || `HTTP ${res.status}`);
      err.code = e.error || 'AI_UNAVAILABLE';
      throw err;
    }
    return res.json();
  }

  async getAiUsage(userId: string): Promise<{ plan: string; usageToday: number; limit: number; remaining: number | null } | null> {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/users/${userId}/ai-usage`, { headers: authHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async getRecommendations(activities: Activity[]): Promise<any | null> {
    try {
      const payload = (activities as any[]).map((a: any) => ({
        topic: a.topic || a.category || 'General',
        difficulty: a.difficulty || 'Medium',
        solved: a.solved ?? a.problemSolved ?? false,
        date: typeof a.date === 'string' ? a.date : new Date(a.date).toISOString(),
      }));
      const res = await fetchWithAuth(`${API_BASE}/api/recommendations`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ activities: payload }),
      });
      if (!res.ok) return null;
      return res.json();
    } catch (e) { console.error('getRecommendations:', e); return null; }
  }

  async getProblems(params: {
    difficulty?: string;
    topic?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    problems: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const query = new URLSearchParams();
      if (params.difficulty) query.set('difficulty', params.difficulty.toLowerCase());
      if (params.topic) query.set('topic', params.topic);
      if (params.search) query.set('search', params.search);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));

      const res = await fetchWithAuth(`${API_BASE}/api/problems?${query.toString()}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.problems && data.problems.length > 0) return data;
      }
    } catch (e) {
      console.warn('getProblems server fallback:', e);
    }

    // Built-in Curated LeetCode Problem Dataset Fallback
    const ALL_CURATED_PROBLEMS = [
      { leetcodeId: 1, title: 'Two Sum', slug: 'two-sum', difficulty: 'easy', topic: 'Arrays', url: 'https://leetcode.com/problems/two-sum/' },
      { leetcodeId: 2, title: 'Add Two Numbers', slug: 'add-two-numbers', difficulty: 'medium', topic: 'Linked Lists', url: 'https://leetcode.com/problems/add-two-numbers/' },
      { leetcodeId: 3, title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'medium', topic: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { leetcodeId: 15, title: '3Sum', slug: '3sum', difficulty: 'medium', topic: 'Two Pointers', url: 'https://leetcode.com/problems/3sum/' },
      { leetcodeId: 20, title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'easy', topic: 'Stacks', url: 'https://leetcode.com/problems/valid-parentheses/' },
      { leetcodeId: 21, title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'easy', topic: 'Linked Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { leetcodeId: 23, title: 'Merge k Sorted Lists', slug: 'merge-k-sorted-lists', difficulty: 'hard', topic: 'Heaps', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { leetcodeId: 33, title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'medium', topic: 'Binary Search', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { leetcodeId: 42, title: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'hard', topic: 'Two Pointers', url: 'https://leetcode.com/problems/trapping-rain-water/' },
      { leetcodeId: 53, title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'medium', topic: 'Dynamic Programming', url: 'https://leetcode.com/problems/maximum-subarray/' },
      { leetcodeId: 70, title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'easy', topic: 'Dynamic Programming', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { leetcodeId: 121, title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'easy', topic: 'Arrays', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { leetcodeId: 141, title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'easy', topic: 'Linked Lists', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { leetcodeId: 146, title: 'LRU Cache', slug: 'lru-cache', difficulty: 'medium', topic: 'Design', url: 'https://leetcode.com/problems/lru-cache/' },
      { leetcodeId: 200, title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'medium', topic: 'Graphs', url: 'https://leetcode.com/problems/number-of-islands/' },
      { leetcodeId: 206, title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'easy', topic: 'Linked Lists', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { leetcodeId: 226, title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'easy', topic: 'Trees', url: 'https://leetcode.com/problems/invert-binary-tree/' },
      { leetcodeId: 300, title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', difficulty: 'medium', topic: 'Dynamic Programming', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { leetcodeId: 322, title: 'Coin Change', slug: 'coin-change', difficulty: 'medium', topic: 'Dynamic Programming', url: 'https://leetcode.com/problems/coin-change/' },
      { leetcodeId: 994, title: 'Rotting Oranges', slug: 'rotting-oranges', difficulty: 'medium', topic: 'Graphs', url: 'https://leetcode.com/problems/rotting-oranges/' }
    ];

    let filtered = ALL_CURATED_PROBLEMS;
    if (params.difficulty) {
      filtered = filtered.filter(p => p.difficulty.toLowerCase() === params.difficulty?.toLowerCase());
    }
    if (params.topic) {
      filtered = filtered.filter(p => p.topic.toLowerCase() === params.topic?.toLowerCase());
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(s) || String(p.leetcodeId).includes(s));
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      problems: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.max(1, Math.ceil(filtered.length / limit))
      }
    };
  }
}

export const databaseAPI = new DatabaseAPI();
