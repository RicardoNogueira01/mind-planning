/**
 * @fileoverview Upcoming Deadlines Card component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import type { UpcomingDeadline } from '../../types/dashboard';
import { CARD_STYLES } from '../../utils/dashboardUtils';

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
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock size={20} className="text-orange-600" />
          </div>
          Upcoming Deadlines
        </h2>
        <Link 
          to="/upcoming-deadlines" 
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
          data-testid="view-all-deadlines-link"
        >
          View All Deadlines
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {upcomingDeadlines.map(task => {
          const isUrgent = task.status === 'danger';
          
          return (
            <div 
              key={task.id} 
              className="flex items-start gap-3"
              data-testid={`deadline-task-${task.id}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${isUrgent ? 'bg-red-500' : 'bg-orange-500'}`} />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1" data-testid="task-title">
                  {task.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span data-testid="assigned-to">
                    Assigned to {task.assignedTo} • Due {task.dueDate}
                  </span>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isUrgent ? 'bg-gray-100 text-red-600' : 'bg-gray-100 text-orange-600'
                    }`}
                    data-testid="deadline-status"
                  >
                    {isUrgent ? 'Today' : 'Tomorrow'}
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
