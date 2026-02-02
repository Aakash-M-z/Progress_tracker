import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { storage } from './storage.js';
import { InsertUser, InsertActivity } from '../shared/schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const api = express.Router();

app.use(cors());
// Convert JSON bodies
app.use(express.json());

// Health check endpoint
api.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
api.post('/login', async (req, res) => {
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
api.get('/users/:id', async (req, res) => {
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

api.get('/users/by-username/:username', async (req, res) => {
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

api.post('/register', async (req, res) => {
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

api.post('/auth/google', async (req, res) => {
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

        if (user) {
            // **Force Update Role if it matches the specific admin email**
            if (email === 'aakashleo420@gmail.com' && user.role !== 'admin') {
                user = await storage.updateUser(user.id, { role: 'admin' });
            }
        } else {
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
                role: email === 'aakashleo420@gmail.com' ? 'admin' : 'user'
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
api.post('/users', async (req, res) => {
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
api.get('/users/:userId/activities', async (req, res) => {
    try {
        const userId = req.params.userId;
        const activities = await storage.getUserActivities(userId);
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

api.post('/activities', async (req, res) => {
    try {
        const activityData: InsertActivity = req.body;
        const activity = await storage.createActivity(activityData);
        res.status(201).json(activity);
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

api.put('/activities/:id', async (req, res) => {
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

api.delete('/activities/:id', async (req, res) => {
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

// Register the API router
// Mount at /api for standard requests
app.use('/api', api);
// Mount at / for requests where /api has been stripped by Vercel rewrites
app.use('/', api);


// Serve static files in production (BUT SKIP if running in Vercel)
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));

    // Handle SPA routing: serve index.html for all non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(distPath, 'index.html'));
        }
    });
}

export default app;
