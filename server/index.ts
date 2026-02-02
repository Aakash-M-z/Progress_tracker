import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { storage } from './storage.js';
import { InsertUser, InsertActivity } from '../shared/schema.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);

    // In a real app, use bcrypt or similar for password hashing comparison
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/by-username/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const userData: InsertUser = req.body;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(409).json({ error: 'User with this username already exists' });
    }

    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    // Fetch user info from Google
    const googleUserRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!googleUserRes.ok) {
      return res.status(401).json({ error: 'Failed to authenticate with Google' });
    }

    const googleUser = await googleUserRes.json();
    const { email, name } = googleUser;

    if (!email) {
      return res.status(400).json({ error: 'Google account has no email' });
    }

    // Check if user exists
    let user = await storage.getUserByEmail(email);

    if (!user) {
      // Create new user
      // Generate a unique username based on email
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Check for uniqueness
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const newUser: InsertUser = {
        username,
        email,
        password: Math.random().toString(36).slice(-10), // Dummy password
        role: 'user'
      };

      user = await storage.createUser(newUser);
    }

    res.json(user);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deprecated or internal use only
app.post('/api/users', async (req, res) => {
  try {
    const userData: InsertUser = req.body;
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activity routes
app.get('/api/users/:userId/activities', async (req, res) => {
  try {
    const userId = req.params.userId;
    const activities = await storage.getUserActivities(userId);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const activityData: InsertActivity = req.body;
    const activity = await storage.createActivity(activityData);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const activityData = req.body;
    const activity = await storage.updateActivity(id, activityData);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await storage.deleteActivity(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});