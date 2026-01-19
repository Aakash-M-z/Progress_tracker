DSA Progress Tracker
Overview

DSA Progress Tracker is a comprehensive web application built to help users track their learning journey in Data Structures and Algorithms (DSA). The application provides detailed analytics, visual progress indicators, and an organized roadmap to support structured study and consistent improvement across multiple platforms such as LeetCode, CodeForces, and HackerRank.

Features
Activity Logging

Record solved problems with detailed attributes including difficulty, platform, time spent, and notes.

Support for categorizing activities by topic and problem type.

Multi-platform problem tracking and categorization.

Learning Roadmap

Structured DSA topic roadmap to guide learning from fundamentals to advanced concepts.

Visual indicators for completed and in-progress topics.

Filters for difficulty and topic categories.

Analytics and Visualization

Daily activity heatmap to show progress over time.

Visual statistics including difficulty distribution and success rates.

Insights on most studied topics and performance patterns.

Motivation Tools

Tracking of daily streaks to support consistent engagement.

Custom milestones and achievement tracking.

Responsive Design

Adaptive layout for desktop and mobile experiences.

Dark and light theme support.

Modern UI with intuitive navigation.

Technology Stack

The project uses the following technologies:

Frontend: React with TypeScript

Styling: Tailwind CSS

Build Tool: Vite

Hosting / Deployment: Static hosting of frontend with optional backend integration

Data Visualization: Visual charts and heatmaps

Project Structure
src/
├── components/
│   ├── ActivityForm.tsx
│   ├── DSARoadmap.tsx
│   ├── Header.tsx
│   ├── ProgressStats.tsx
│   ├── SimpleHeatmap.tsx
│   └── StreakTracker.tsx
├── App.tsx
├── main.tsx
├── types.ts
└── style.css

Getting Started
Prerequisites

Node.js (v16 or higher)

npm or yarn

Installation

Clone the repository:

git clone https://github.com/Aakash-M-z/Progress_tracker.git
cd Progress_tracker


Install dependencies:

npm install
# or
yarn install


Start development server:

npm run dev
# or
yarn dev


Open your browser and navigate to:

http://localhost:3000

Usage

Use the Activity Logging interface to add new problem entries.

Navigate the DSA Roadmap to monitor your topic-wise progress.

View the Statistics section to analyze your performance trends.

Toggle dark/light themes as needed.

Deployment

To build the application for production:

npm run build
# or
yarn build


Deploy the generated build folder to a static hosting provider of your choice.

Contributing

Contributions are welcome. To propose improvements or fixes:

Fork the repository

Create a feature branch

Commit your changes with descriptive messages

Open a pull request for review

License

This project is licensed under the MIT License.

Contact

For questions or feedback, refer to the main repository on GitHub.
