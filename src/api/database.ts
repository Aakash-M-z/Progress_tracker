import { Activity, InsertActivity, User, InsertUser } from '../../shared/schema';

const API_BASE = '/api';

export class DatabaseAPI {
  // User operations
  async getUser(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/users/by-username/${username}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  async createUser(userData: InsertUser): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Activity operations
  async getUserActivities(userId: number): Promise<Activity[]> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/activities`);
      if (!response.ok) {
        console.error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  async createActivity(activityData: InsertActivity): Promise<Activity | null> {
    try {
      const response = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error creating activity:', error);
      return null;
    }
  }

  async updateActivity(id: number, activityData: Partial<Activity>): Promise<Activity | null> {
    try {
      const response = await fetch(`${API_BASE}/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error updating activity:', error);
      return null;
    }
  }

  async deleteActivity(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/activities/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  }
}

export const databaseAPI = new DatabaseAPI();