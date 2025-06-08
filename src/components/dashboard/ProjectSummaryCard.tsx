/**
 * @fileoverview Project Summary Card component displaying project progress overview
 */

import React from 'react';
import { PieChart, Calendar } from 'lucide-react';
import type { TaskStats } from '../../types/dashboard';
import { calculateCompletionPercentage, CARD_STYLES, ICON_CONTAINER_STYLES } from '../../utils/dashboardUtils';

interface ProjectSummaryCardProps {
  /** Task statistics data */
  stats: TaskStats;
}

/**
 * Project Summary Card component showing project progress and key metrics
 * @param props - Component props
 * @returns JSX element representing the project summary card
 */
const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ stats }) => {
  const completionPercentage = calculateCompletionPercentage(stats);

  return (
    <div className={CARD_STYLES} data-testid="project-summary-card">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Project Summary</h2>
        <div className={`${ICON_CONTAINER_STYLES} bg-gradient-to-br from-emerald-500 to-teal-600`}>
          <PieChart size={22} />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Project Progress</h3>
            <span 
              className="text-lg font-bold text-indigo-600"
              data-testid="project-progress-percentage"
            >
              {completionPercentage}%
            </span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
              data-testid="project-progress-bar"
            />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Task Distribution</h3>
            <span 
              className="text-lg font-bold text-gray-700"
              data-testid="task-distribution-ratio"
            >
              {stats.tasksCompleted}/{stats.totalTasks}
            </span>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-gray-600">Done</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-gray-600">Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
              <span className="text-gray-600">Overdue</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Calendar size={18} />
                <span className="font-semibold">Next Deadline</span>
              </div>
              <span className="font-bold text-red-700" data-testid="next-deadline">
                Today
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex flex-col items-center text-center">
              <span className="text-blue-600 font-semibold mb-1">Team Focus</span>
              <span className="font-bold text-blue-700" data-testid="team-focus">
                Development
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummaryCard;
