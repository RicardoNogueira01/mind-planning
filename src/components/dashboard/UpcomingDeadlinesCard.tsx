/**
 * @fileoverview Upcoming Deadlines Card component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import type { UpcomingDeadline } from '../../types/dashboard';
import { getInitials, getDeadlineStatusClasses, CARD_STYLES } from '../../utils/dashboardUtils';

interface UpcomingDeadlinesCardProps {
  /** Array of upcoming deadlines */
  upcomingDeadlines: UpcomingDeadline[];
}

/**
 * Upcoming Deadlines Card component showing tasks with approaching deadlines
 * @param props - Component props
 * @returns JSX element representing the upcoming deadlines card
 */
const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({ upcomingDeadlines }) => {
  return (
    <div className={CARD_STYLES} data-testid="upcoming-deadlines-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg shadow-md">
            <Clock size={20} />
          </div>
          Upcoming Deadlines
        </h2>
        <Link 
          to="/upcoming-deadlines" 
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-all duration-200 px-3 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          data-testid="view-all-deadlines-link"
        >
          <span className="font-medium">View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {upcomingDeadlines.map(task => {
          const statusClasses = getDeadlineStatusClasses(task.status);
          
          return (
            <div 
              key={task.id} 
              className="flex items-start gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              data-testid={`deadline-task-${task.id}`}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg"
                style={{ backgroundColor: task.color }}
                data-testid="task-avatar"
              >
                {getInitials(task.assignedTo)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1" data-testid="task-title">
                  {task.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600" data-testid="assigned-to">
                    Assigned to {task.assignedTo}
                  </span>
                  <span 
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${statusClasses}`}
                    data-testid="due-date"
                  >
                    Due {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingDeadlinesCard;
