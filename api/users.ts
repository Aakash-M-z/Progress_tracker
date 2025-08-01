import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';
import { InsertUser } from '../shared/schema';

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
    const { id, username } = req.query;

    if (req.method === 'GET') {
      if (id) {
        const userId = parseInt(id as string);
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
      } else if (username) {
        const user = await storage.getUserByUsername(username as string);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
      }
    } else if (req.method === 'POST') {
      const userData: InsertUser = req.body;
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 