/**
 * @fileoverview Task Overview Card component displaying completion percentage and task breakdown
 */

import React from 'react';
import { BarChart2 } from 'lucide-react';
import type { TaskStats } from '../../types/dashboard';
import { calculateCompletionPercentage, CARD_STYLES, ICON_CONTAINER_STYLES } from '../../utils/dashboardUtils';

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
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Task Overview</h2>
        <div className={`${ICON_CONTAINER_STYLES} bg-gradient-to-br from-indigo-500 to-blue-600`}>
          <BarChart2 size={22} />
        </div>
      </div>
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <p 
            className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
            data-testid="completion-percentage"
          >
            {completionPercentage}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Overall Completion</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600" data-testid="tasks-completed">
            +{stats.tasksCompleted}
          </p>
          <p className="text-sm text-gray-500 mt-1">Tasks Done</p>
        </div>
      </div>
      
      <div className="h-3 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${completionPercentage}%` }}
          data-testid="progress-bar"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-emerald-50 rounded-lg p-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
          <span className="text-xs text-gray-600 block">Done</span>
          <span className="text-sm font-semibold text-gray-800" data-testid="done-count">
            {stats.tasksCompleted}
          </span>
        </div>
        <div className="bg-amber-50 rounded-lg p-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
          <span className="text-xs text-gray-600 block">Progress</span>
          <span className="text-sm font-semibold text-gray-800" data-testid="progress-count">
            {stats.tasksInProgress}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="w-3 h-3 rounded-full bg-gray-400 mx-auto mb-1" />
          <span className="text-xs text-gray-600 block">Todo</span>
          <span className="text-sm font-semibold text-gray-800" data-testid="todo-count">
            {stats.tasksNotStarted}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskOverviewCard;
