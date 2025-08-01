# DSA Progress Tracker

## Overview

This is a comprehensive web application designed to help users track their Data Structures and Algorithms (DSA) learning journey. The app provides detailed analytics, progress visualization, and a structured roadmap for systematic DSA study.

**Recent Changes (July 31, 2025):**
- Added PostgreSQL database with users and activities tables
- Created API server with Express.js for database operations
- Implemented database storage layer replacing localStorage
- Set up Drizzle ORM for type-safe database queries
- Configured frontend-backend communication with API proxy
- **NEW:** Implemented complete role-based authentication system with admin/user roles
- **NEW:** Added comprehensive animations throughout the UI (buttons, cards, page transitions)
- **NEW:** Created admin panel with user management and activity monitoring
- **NEW:** Enhanced button functionality with hover effects and fixed all JavaScript issues
- **NEW:** Implemented React Context for authentication state management
- **NEW:** Added daily problem notification popup system with curated DSA challenges
- **NEW:** Created comprehensive badge and achievement system with points and rewards
- **NEW:** Integrated solution resources with video tutorials and learning materials
- **NEW:** Added quick problem logging feature for popular DSA problems
- **LATEST:** Fixed home page layout overlay issues with elegant 3-column design
- **LATEST:** Implemented animated daily motivation component with rotating inspirational quotes
- **LATEST:** Created user skill level profiling system (beginner/intermediate/advanced)
- **LATEST:** Added hero welcome section with quick stats cards and smooth animations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling with dark/light theme support
- **State Management**: React Context for authentication + React hooks for local state
- **Authentication**: Role-based access control with admin and user permissions
- **Animations**: CSS animations and Tailwind transitions for enhanced UX
- **UI Components**: Custom components with responsive design and accessibility features

### Key Components
1. **Header**: Navigation with user info, theme toggle, and logout functionality
2. **Activity Tracking**: Form for logging DSA problems with detailed metadata
3. **Analytics Dashboard**: Visual progress tracking with heatmaps and statistics
4. **DSA Roadmap**: Structured learning path with progress indicators
5. **Progress Stats**: Comprehensive analytics including difficulty distribution and platform usage
6. **Login System**: Role-based authentication with demo admin/user accounts
7. **Admin Panel**: User management, activity monitoring, and system administration
8. **Role-Based Routes**: Component-level access control for different user permissions
9. **Daily Problem System**: Popup notifications with curated DSA challenges and direct links
10. **Badge System**: Achievement tracking with points, rarity levels, and reward notifications  
11. **Solution Resources**: Integrated video tutorials, articles, and learning materials
12. **Quick Add Feature**: One-click logging for popular DSA problems
13. **Daily Motivation**: Animated component with rotating inspirational quotes and personalized greetings
14. **User Profile System**: Skill level tracking with beginner/intermediate/advanced progression
15. **Hero Dashboard**: Welcome section with quick stats cards and elegant layout design

## Data Flow

### Data Storage
- **Client-side persistence**: localStorage for all user data
- **Data structure**: JSON serialization of activity arrays
- **No backend**: Fully client-side application with immediate data persistence

### Activity Tracking System
- Users log DSA problems with comprehensive metadata:
  - Problem details (difficulty, platform, time/space complexity)
  - Study session information (duration, category, notes)
  - Success tracking (problem solved status, insights)
- Real-time updates to all dashboard components
- Automatic streak calculation and progress metrics

### Progress Calculation
- **Heatmap visualization**: 365-day activity grid showing daily engagement
- **Topic progress**: Dynamic calculation based on problems solved per DSA category
- **Streak tracking**: Consecutive day calculation with today/yesterday logic
- **Statistics aggregation**: Platform usage, difficulty distribution, time investment

## Key Components

### Activity Management
- **ActivityForm**: Comprehensive form for logging DSA practice sessions
- **Predefined categories**: 19 DSA topics from basic (Arrays) to advanced (Dynamic Programming)
- **Platform support**: LeetCode, HackerRank, CodeForces, and other major platforms
- **Metadata tracking**: Time/space complexity, difficulty level, problem status

### Visualization Components
- **SimpleHeatmap**: GitHub-style contribution heatmap for daily activity
- **ProgressStats**: Detailed analytics dashboard with multiple metrics
- **DSARoadmap**: Interactive learning path with 18+ predefined topics
- **StreakTracker**: Motivation system with current and longest streak tracking

### UI/UX Features
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Dark/light themes**: System preference detection with manual toggle
- **Tab navigation**: Overview, Roadmap, and Statistics sections
- **Progress indicators**: Visual feedback for topic mastery levels

## Data Flow

### Input Flow
1. User logs activity through ActivityForm
2. Data validation and enrichment (auto-generated ID, date formatting)
3. Addition to activities array in React state
4. Automatic persistence to localStorage
5. Real-time update of all visualization components

### Display Flow
1. Activities loaded from localStorage on app initialization
2. Data transformation for each visualization component
3. Real-time calculations for streaks, progress percentages, and statistics
4. Responsive rendering based on screen size and theme preference

## External Dependencies

### Core Dependencies
- **React ecosystem**: react, react-dom, @types/react for the main framework
- **Vite**: Modern build tool for fast development and optimized production builds
- **TypeScript**: Static typing for better code quality and development experience
- **Tailwind CSS**: Utility-first CSS framework with PostCSS integration

### Visualization Libraries
- **react-calendar-heatmap**: GitHub-style heatmap for activity visualization
- **react-tooltip**: Enhanced tooltips for better user interaction
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **ESLint configuration**: Built into Vite for code quality
- **TypeScript compiler**: Strict mode enabled for type safety
- **PostCSS**: CSS processing with autoprefixer for browser compatibility

## Deployment Strategy

### Vercel Deployment
- **Platform**: Vercel with automatic GitHub integration
- **Build process**: Vite production build generating static files
- **Configuration**: SPA routing with catch-all rewrites to index.html
- **No environment variables**: Fully client-side application

### Build Configuration
- **Output**: Static files in `dist/` directory
- **Asset optimization**: Vite handles bundling, minification, and tree-shaking
- **TypeScript compilation**: Strict type checking during build process
- **CSS processing**: Tailwind purging and PostCSS optimization

### Development Workflow
- **Local development**: `npm run dev` with hot module replacement
- **Build process**: `npm run build` with TypeScript compilation
- **Preview**: `npm run preview` for production build testing
- **Deployment**: Automatic on git push to connected repository

### Performance Considerations
- **Code splitting**: Vite automatic splitting for optimal loading
- **Asset optimization**: Automatic compression and caching headers
- **Bundle size**: Minimal dependencies focused on essential functionality
- **Client-side storage**: localStorage eliminates need for database infrastructure