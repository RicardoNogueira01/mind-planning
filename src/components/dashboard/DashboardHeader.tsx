/**
 * @fileoverview Dashboard header component with title and action buttons
 */

import React from 'react';
import { CheckSquare, Activity } from 'lucide-react';

/**
 * Dashboard header component containing title and action buttons
 * @returns JSX element representing the dashboard header
 */
const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Project Management Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Monitor your team's progress and key performance indicators</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              aria-label="Create new task"
            >
              <CheckSquare size={16} />
              Create Task
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              aria-label="Strategy board"
            >
              <Activity size={16} />
              Strategy Board
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              aria-label="Calendar view"
            >
              Calendar
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
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
