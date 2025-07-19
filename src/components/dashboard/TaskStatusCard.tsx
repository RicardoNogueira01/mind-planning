/**
 * @fileoverview Task Status Card component displaying detailed task statistics
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { TaskStats } from '../../types/dashboard';
import { CARD_STYLES } from '../../utils/dashboardUtils';

interface TaskStatusCardProps {
  /** Task statistics data */
  stats: TaskStats;
}

/**
 * Task Status Card component showing detailed breakdown of task statuses
 * @param props - Component props
 * @returns JSX element representing the task status card
 */
const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ stats }) => {
  return (
    <div className={CARD_STYLES} data-testid="task-status-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Tasks Completed</h3>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p 
          className="text-3xl font-bold text-gray-900 mb-1"
          data-testid="tasks-completed-count"
        >
          {stats.tasksCompleted}
        </p>
        <p className="text-sm text-gray-500">Finished Tasks</p>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Status</span>
          <span className="text-xs text-gray-600 font-medium">On Track</span>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusCard;
