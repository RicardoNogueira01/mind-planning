/**
 * @fileoverview Dashboard header component with title and action buttons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Activity } from 'lucide-react';

/**
 * Dashboard header component containing title and action buttons
 * @returns JSX element representing the dashboard header
 */
const DashboardHeader: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 -mx-[27px] -mt-[27px] mb-6">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Project Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              aria-label="Create new task"
            >
              <CheckSquare size={18} />
              New Task
            </button>
            <Link 
              to="/mindmaps" 
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
              aria-label="Go to mind maps"
            >
              <Activity size={18} />
              Mind Maps
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
