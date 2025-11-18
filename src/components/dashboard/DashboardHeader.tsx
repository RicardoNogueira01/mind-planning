/**
 * @fileoverview Dashboard header component with title and action buttons
 */

import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Dashboard header component containing title and action buttons
 * @returns JSX element representing the dashboard header
 */
const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 md:mb-8">
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
              Project Management Dashboard
            </h1>
            <p className="text-xs md:text-base text-gray-500 mt-1">Monitor your team's progress and key performance indicators</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button 
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap touch-manipulation"
              aria-label="Strategy board"
            >
              <Activity size={16} />
              Strategy Board
            </button>
            <button 
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap touch-manipulation"
              aria-label="Calendar view"
            >
              Calendar
            </button>
            <button 
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap touch-manipulation"
              aria-label="Team management"
            >
              Team
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
