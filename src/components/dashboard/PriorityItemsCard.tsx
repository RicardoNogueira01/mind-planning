/**
 * @fileoverview Priority Items Card component
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { TaskStats } from '../../types/dashboard';
import { CARD_STYLES } from '../../utils/dashboardUtils';

interface PriorityItemsCardProps {
  /** Task statistics data */
  stats: TaskStats;
}

/**
 * Priority Items Card component showing high priority tasks
 * @param props - Component props
 * @returns JSX element representing the priority items card
 */
const PriorityItemsCard: React.FC<PriorityItemsCardProps> = ({ stats }) => {
  return (
    <div className={CARD_STYLES} data-testid="priority-items-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Priority Items</h3>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={14} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p 
          className="text-3xl font-bold text-gray-900 mb-1"
          data-testid="priority-items-count"
        >
          {stats.overdueTasks}
        </p>
        <p className="text-sm text-gray-500">Requires Attention</p>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Status</span>
          <span className="text-xs text-gray-600 font-medium">Review</span>
        </div>
      </div>
    </div>
  );
};

export default PriorityItemsCard;
