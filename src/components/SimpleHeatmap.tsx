import React, { useState } from 'react';
import { Activity } from '../types';

interface SimpleHeatmapProps {
  activities: Activity[];
}

const SimpleHeatmap: React.FC<SimpleHeatmapProps> = ({ activities }) => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year'>('1year');

  // Generate days based on selected period
  const generateDays = () => {
    const days = [];
    const today = new Date();
    const daysCount = selectedPeriod === '3months' ? 90 : selectedPeriod === '6months' ? 180 : 365;

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const days = generateDays();

  // Count activities per day
  const getActivityCount = (date: string) => {
    return activities.filter(activity =>
      activity.date.startsWith(date)
    ).length;
  };

  const getActivityValue = (date: string) => {
    const dayActivities = activities.filter(activity =>
      activity.date.startsWith(date)
    );
    if (dayActivities.length === 0) return 0;
    return Math.min(dayActivities.reduce((sum, activity) => sum + (activity.value || 1), 0), 4);
  };

  const getColorClass = (value: number, isHovered: boolean = false) => {
    const baseClasses = isHovered ? 'scale-110 shadow-lg' : '';
    if (value === 0) return `bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 ${baseClasses}`;
    if (value <= 1) return `bg-emerald-200 dark:bg-emerald-900 hover:bg-emerald-300 dark:hover:bg-emerald-800 ${baseClasses}`;
    if (value <= 2) return `bg-emerald-300 dark:bg-emerald-800 hover:bg-emerald-400 dark:hover:bg-emerald-700 ${baseClasses}`;
    if (value <= 3) return `bg-emerald-400 dark:bg-emerald-700 hover:bg-emerald-500 dark:hover:bg-emerald-600 ${baseClasses}`;
    return `bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 ${baseClasses}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const totalActivities = activities.length;
  const currentStreak = calculateStreak();

  function calculateStreak() {
    if (activities.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      if (getActivityCount(dateString) > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 mt-2 text-sm text-gray-400">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Total Activities</span>
            <span className="text-xl font-black text-white">{totalActivities}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Current Streak</span>
            <span className="text-xl font-black text-orange-400">{currentStreak} days</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
          </select>

          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ml-4">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-800 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-700 rounded-sm"></div>
              <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-600 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-1 min-w-max p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {week.map((day) => {
                  const count = getActivityCount(day);
                  const value = getActivityValue(day);
                  const isToday = day === new Date().toISOString().split('T')[0];
                  const isHovered = hoveredDay === day;

                  return (
                    <div
                      key={day}
                      className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer transform ${getColorClass(value, isHovered)
                        } ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={`${formatDate(day)}: ${count} activities`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {hoveredDay && (
          <div className="absolute bottom-full left-4 mb-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm shadow-lg z-10">
            <div className="font-semibold">{formatDate(hoveredDay)}</div>
            <div>{getActivityCount(hoveredDay)} activities</div>
          </div>
        )}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="text-6xl mb-4 animate-bounce">📅</div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No activities logged yet</h4>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Start logging your DSA activities to see your progress visualized in this beautiful heatmap!
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleHeatmap;