# Render Deployment Guide

## Frontend Deployment (Static Site)

### Step 1: Go to Render
1. Visit: https://render.com
2. Sign up/Login with your GitHub account

### Step 2: Create New Static Site
1. Click **"New +"**
2. Select **"Static Site"**
3. Connect your GitHub repository: `Aakash-M-z/Progress_tracker`

### Step 3: Configure Settings
- **Name**: `dsa-progress-tracker`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment**: `Node`

### Step 4: Add Environment Variables
Click **"Environment"** and add:
```
DATABASE_URL=postgresql://neondb_owner:npg_p4sWAzS3VPqc@ep-old-bread-ab8xt6kl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 5: Deploy
Click **"Create Static Site"**

## Backend Deployment (Web Service)

### Step 1: Create New Web Service
1. Click **"New +"**
2. Select **"Web Service"**
3. Connect the same GitHub repository

### Step 2: Configure Backend Settings
- **Name**: `dsa-progress-tracker-api`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 3: Add Environment Variables
```
DATABASE_URL=postgresql://neondb_owner:npg_p4sWAzS3VPqc@ep-old-bread-ab8xt6kl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=10000
```

### Step 4: Deploy
Click **"Create Web Service"**

## Update Frontend API URL
After backend deployment, update the frontend's `VITE_API_URL` to point to your backend URL.

## Benefits of Render
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Easy environment variable management
- ✅ Better error handling
- ✅ More reliable than Vercel for some projects 