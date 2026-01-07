# DSA Progress Tracker 🚀

A comprehensive web application designed to help you track your Data Structures and Algorithms learning journey with detailed analytics, progress visualization, and a structured roadmap.

## Features

###  **Activity Tracking**

- Log DSA problems with detailed information
- Track time complexity and space complexity
- Record problem difficulty (Easy, Medium, Hard)
- Add notes and insights for each problem
- Support for multiple platforms (LeetCode, HackerRank, CodeForces, etc.)

###  **DSA Roadmap**

- Structured learning path covering all major DSA topics
- Progress tracking for each topic category
- Filter by difficulty level and topic category
- Visual progress indicators

###  **Analytics & Statistics**

- Activity heatmap showing daily progress
- Success rate tracking
- Platform usage statistics
- Difficulty distribution analysis
- Most studied topics overview

### 🔥 **Streak & Motivation**

- Daily streak tracking
- Achievement system with badges
- Motivational quotes
- Progress milestones

### **Modern UI/UX**

- Responsive design for all devices
- Dark/Light theme support
- Beautiful gradients and animations
- Intuitive navigation with tabs

## DSA Topics Covered

### Data Structures

- Arrays & Strings
- Linked Lists
- Stacks & Queues
- Trees & Binary Trees
- Graphs
- Heap/Priority Queue
- Trie
- Union Find

### Algorithms

- Binary Search
- Two Pointers
- Sliding Window
- Sorting
- Recursion
- Backtracking
- Dynamic Programming
- Greedy Algorithms
- Bit Manipulation
- Math

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Neon Database account (for production)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Aakash-M-z/Dsa-ProgressTracker.git
cd Progress_tracker
```

2. Install dependencies (frontend):

```bash
npm install
```

3. Install dependencies (backend):

```bash
cd server
npm install
cd ..
```

4. Set up environment variables:

Create a `.env` file in the root directory:

```bash
DATABASE_URL=your_neon_database_url_here
VITE_API_URL=http://localhost:3001
```

Create a `.env` file in the `server/` directory:

```bash
DATABASE_URL=your_neon_database_url_here
PORT=3001
```

5. Start the backend server (from `server/`):

```bash
cd server
npm run dev
```

6. Start the frontend (new terminal in project root):

```bash
npm run dev
```

7. Open your browser and navigate to `http://localhost:5000`

### Building for Production

```bash
npm run build
```

## Deployment

### Vercel Deployment

1. **Frontend Deployment:**

   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository: `https://github.com/Aakash-M-z/Dsa-ProgressTracker.git`
   - Vercel will automatically detect it's a Vite project
   - Add environment variables in Vercel dashboard:
     - `DATABASE_URL`: Your Neon database connection string
     - `VITE_API_URL`: Your backend API URL

2. **Backend Deployment:**
   - Deploy the backend separately to Vercel or other platforms
   - Update the `VITE_API_URL` in frontend environment variables

### Environment Variables

**Required for Production:**

- `DATABASE_URL`: Neon PostgreSQL connection string
- `VITE_API_URL`: Backend API URL

**Local Development:**

- `DATABASE_URL`: Your local or development database URL
- `VITE_API_URL`: `http://localhost:3001`

## Usage

### Logging Activities

1. Navigate to any tab (Overview, DSA Roadmap, or Statistics)
2. Use the "Log DSA Activity" form on the right sidebar
3. Fill in the required information:
   - Date
   - DSA Category
   - Specific Topic/Problem
   - Difficulty Level
   - Platform
   - Time Spent
   - Problem Description
   - Notes & Insights

### Tracking Progress

- **Overview Tab**: See your activity heatmap, quick stats, and streak information
- **DSA Roadmap Tab**: View your progress through the structured learning path
- **Statistics Tab**: Detailed analytics and performance metrics

### Features

- **Dark/Light Theme**: Toggle theme using the button in the header
- **Local Storage**: All data is saved locally in your browser
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Charts**: React Calendar Heatmap
- **Date Handling**: date-fns
- **Deployment**: GitHub Pages

## Project Structure

```
src/
├── components/
│   ├── ActivityForm.tsx      # DSA activity logging form
│   ├── DSARoadmap.tsx        # Learning roadmap component
│   ├── Header.tsx            # Application header
│   ├── ProgressStats.tsx     # Statistics and analytics
│   ├── SimpleHeatmap.tsx     # Activity heatmap
│   └── StreakTracker.tsx     # Streak and achievements
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
├── types.ts                  # TypeScript type definitions
└── style.css                 # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by GitHub's contribution graph
- Built with modern web technologies
- Designed for DSA enthusiasts and competitive programmers

---

**Happy Coding! 🎉**

Track your DSA progress, stay motivated, and become a better problem solver!

Track your DSA progress, stay motivated, and become a better problem solver!
