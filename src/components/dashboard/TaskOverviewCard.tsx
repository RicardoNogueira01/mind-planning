/**
 * @fileoverview Task Overview Card component displaying completion percentage and task breakdown
 */

import React from 'react';
import { BarChart2 } from 'lucide-react';
import type { TaskStats } from '../../types/dashboard';
import { calculateCompletionPercentage, CARD_STYLES } from '../../utils/dashboardUtils';

interface TaskOverviewCardProps {
  /** Task statistics data */
  stats: TaskStats;
}

/**
 * Task Overview Card component showing completion percentage and task distribution
 * @param props - Component props
 * @returns JSX element representing the task overview card
 */
const TaskOverviewCard: React.FC<TaskOverviewCardProps> = ({ stats }) => {
  const completionPercentage = calculateCompletionPercentage(stats);

  return (
    <div className={CARD_STYLES} data-testid="task-overview-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Project Completion</h3>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart2 size={14} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p 
          className="text-3xl font-bold text-gray-900 mb-1"
          data-testid="completion-percentage"
        >
          {completionPercentage}%
        </p>
        <p className="text-sm text-gray-500">Overall Progress</p>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs text-emerald-600 font-medium">On Track</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-2 bg-emerald-500 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${completionPercentage}%` }}
            data-testid="progress-bar"
          />
        </div>
      </div>
    </div>
  );
};

export default TaskOverviewCard;
