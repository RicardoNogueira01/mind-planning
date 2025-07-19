/**
 * @fileoverview Recent Completed Tasks Card component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { CompletedTask } from '../../types/dashboard';
import { CARD_STYLES } from '../../utils/dashboardUtils';

interface RecentCompletedTasksCardProps {
  /** Array of recently completed tasks */
  recentCompletedTasks: CompletedTask[];
}

/**
 * Recent Completed Tasks Card component showing the latest completed tasks
 * @param props - Component props
 * @returns JSX element representing the recent completed tasks card
 */
const RecentCompletedTasksCard: React.FC<RecentCompletedTasksCardProps> = ({ recentCompletedTasks }) => {
  return (
    <div className={CARD_STYLES} data-testid="recent-completed-tasks-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          Recently Completed
        </h2>
        <Link 
          to="/completed-tasks" 
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
          data-testid="view-all-completed-link"
        >
          View All Completed Tasks
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentCompletedTasks.map(task => (
          <div 
            key={task.id} 
            className="flex items-start gap-3"
            data-testid={`completed-task-${task.id}`}
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1" data-testid="task-title">
                {task.title}
              </h3>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span data-testid="completed-by">
                  Completed by {task.completedBy} • {task.completedAt}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCompletedTasksCard;
