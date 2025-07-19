/**
 * @fileoverview Active Tasks Card component
 */

import React from 'react';
import { Clock } from 'lucide-react';
import type { TaskStats } from '../../types/dashboard';
import { CARD_STYLES } from '../../utils/dashboardUtils';

interface ActiveTasksCardProps {
  /** Task statistics data */
  stats: TaskStats;
}

/**
 * Active Tasks Card component showing tasks in progress
 * @param props - Component props
 * @returns JSX element representing the active tasks card
 */
const ActiveTasksCard: React.FC<ActiveTasksCardProps> = ({ stats }) => {
  return (
    <div className={CARD_STYLES} data-testid="active-tasks-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Tasks</h3>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p 
          className="text-3xl font-bold text-gray-900 mb-1"
          data-testid="active-tasks-count"
        >
          {stats.tasksInProgress}
        </p>
        <p className="text-sm text-gray-500">In Progress</p>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Status</span>
          <span className="text-xs text-orange-600 font-medium">Working</span>
        </div>
      </div>
    </div>
  );
};

export default ActiveTasksCard;
