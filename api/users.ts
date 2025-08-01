import type { VercelRequest, VercelResponse } from '@vercel/node';

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
      // Simple response for now to avoid build issues
      return res.json({ 
        message: 'Users API endpoint', 
        method: req.method,
        query: { id, username },
        timestamp: new Date().toISOString()
      });
    } else if (req.method === 'POST') {
      return res.status(201).json({ 
        message: 'User creation endpoint',
        body: req.body,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in users API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 