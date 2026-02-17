# Progress Tracker

<p align="center">
  <img src="./public/demo.gif" alt="Progress Tracker - Demo" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
</p>

<p align="center">
  <strong>A modern, elegant dashboard to track your Data Structures & Algorithms learning journey</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.3.5-blue?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-7.0.4-purple?style=flat-square&logo=vite" alt="Vite" />
</p>

---

## ✨ Features

### 📊 **Activity Tracking**
- Log solved problems with difficulty, platform, time spent, and notes
- Topic-wise and problem-type categorization
- Multi-platform support (LeetCode, CodeForces, HackerRank, etc.)

### 🗺️ **Learning Roadmap**
- Structured DSA roadmap from fundamentals to advanced topics
- Visual progress indicators for completed and in-progress topics
- Smart filters for difficulty and topic categories

### 📈 **Analytics & Visualization**
- Daily activity heatmap for consistency tracking
- Difficulty-wise and topic-wise performance statistics
- Insights into learning patterns and progress trends

### 🎯 **Motivation & Productivity**
- Daily streak tracking with visual indicators
- Milestone-based progress monitoring
- Daily motivational quotes to keep you inspired

### 🎨 **User Experience**
- Fully responsive layout for desktop and mobile
- Beautiful dark theme with golden accents
- Clean, intuitive user interface
- Smooth animations and transitions

---

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite for lightning-fast development
- **State Management**: React Context API
- **Visualization**: Custom charts and heatmaps
- **Backend**: Express.js with file-based storage
- **Authentication**: Google OAuth integration

---

## 📦 Getting Started

### Prerequisites
- Node.js v16 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Aakash-M-z/Progress_tracker.git

# Navigate to project directory
cd Progress_tracker

# Install dependencies
npm install
# or
yarn install
```

### Running the Application

```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5000`

---

## 🎯 Usage

1. **Sign In**: Use Google OAuth or create an account
2. **Log Activities**: Add solved problems using the Activity Form
3. **Track Progress**: Monitor your progress via the DSA Roadmap
4. **Analyze Performance**: View detailed statistics and trends
5. **Stay Motivated**: Check daily motivational quotes and track your streak

---

## 🏗️ Build for Production

```bash
npm run build
# or
yarn build
```

Deploy the generated `dist` directory to any static hosting provider.

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── ActivityForm.tsx        # Handles problem logging
│   ├── DSARoadmap.tsx          # Displays DSA topic roadmap
│   ├── Header.tsx              # Application header
│   ├── ProgressStats.tsx       # Analytics and statistics
│   ├── SimpleHeatmap.tsx       # Daily activity heatmap
│   ├── StreakTracker.tsx       # Streak and consistency tracking
│   ├── DailyMotivation.tsx     # Daily motivational quotes
│   ├── BadgeSystem.tsx         # Achievement badges
│   └── UserProfile.tsx         # User profile management
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── api/
│   └── database.ts             # API client
├── utils/
│   └── sessionManager.ts       # Session management
├── App.tsx                     # Root application component
├── main.tsx                    # Application entry point
├── types.ts                    # Global TypeScript types
└── style.css                   # Global styles

server/
├── app.ts                      # Express application
├── index.ts                    # Server entry point
├── file-storage.ts             # File-based storage
└── models.ts                   # Data models
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📧 Contact

For questions, issues, or feedback, please use the [GitHub repository issue tracker](https://github.com/Aakash-M-z/Progress_tracker/issues).

---

<p align="center">Made with ❤️ by developers, for developers</p>
