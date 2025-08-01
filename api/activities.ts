import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { InsertActivity } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { id, userId } = req.query;

    if (req.method === 'GET') {
      if (userId) {
        const userActivities = await storage.getUserActivities(parseInt(userId as string));
        return res.json(userActivities);
      }
    } else if (req.method === 'POST') {
      const activityData: InsertActivity = req.body;
      const activity = await storage.createActivity(activityData);
      return res.status(201).json(activity);
    } else if (req.method === 'PUT' && id) {
      const activityId = parseInt(id as string);
      const activityData = req.body;
      const activity = await storage.updateActivity(activityId, activityData);
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      return res.json(activity);
    } else if (req.method === 'DELETE' && id) {
      const activityId = parseInt(id as string);
      const deleted = await storage.deleteActivity(activityId);
      if (!deleted) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      return res.status(204).send();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in activities API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 