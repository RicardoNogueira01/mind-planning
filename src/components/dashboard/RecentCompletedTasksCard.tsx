/**
 * @fileoverview Recent Completed Tasks Card component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type { CompletedTask } from '../../types/dashboard';
import { getInitials, CARD_STYLES } from '../../utils/dashboardUtils';

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
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg shadow-md">
            <CheckCircle size={20} />
          </div>
          Recently Completed
        </h2>
        <Link 
          to="/completed-tasks" 
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-all duration-200 px-3 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          data-testid="view-all-completed-link"
        >
          <span className="font-medium">View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentCompletedTasks.map(task => (
          <div 
            key={task.id} 
            className="flex items-start gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            data-testid={`completed-task-${task.id}`}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg"
              style={{ backgroundColor: task.color }}
              data-testid="task-avatar"
            >
              {getInitials(task.completedBy)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1" data-testid="task-title">
                {task.title}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600" data-testid="completed-by">
                  Completed by {task.completedBy}
                </span>
                <span 
                  className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md"
                  data-testid="completed-at"
                >
                  {task.completedAt}
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
