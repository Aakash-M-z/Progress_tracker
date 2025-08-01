# Vercel Deployment Guide

## Deploy to Vercel

This DSA Progress Tracker is configured for easy deployment to Vercel.

### Prerequisites

- A Vercel account
- Your code pushed to a GitHub repository

### Steps to Deploy

1. **Connect to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"

2. **Import Repository**

   - Select your GitHub repository containing this project
   - Vercel will automatically detect it's a Vite project

3. **Configure Build Settings**

   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**

   - No environment variables needed for this project

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Configuration Files

The project includes:

- `vercel.json` - Vercel configuration
- `vite.config.js` - Vite configuration optimized for Vercel
- `package.json` - Build scripts and dependencies

### Features After Deployment

- ✅ Automatic deployments on git push
- ✅ Custom domain support
- ✅ HTTPS enabled
- ✅ Global CDN
- ✅ Analytics and performance monitoring

### Troubleshooting

If deployment fails:

1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify the build command works locally: `npm run build`
4. Check that `dist` folder is generated after build

### Local Testing

Before deploying, test locally:

```bash
npm install
npm run build
npm run preview
```

Your DSA Progress Tracker will be live at your Vercel URL! 🚀
