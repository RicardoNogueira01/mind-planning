/**
 * @fileoverview Team Overview Card component displaying team member information
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import type { Collaborator } from '../../types/dashboard';
import { 
  getStatusText,
  CARD_STYLES
} from '../../utils/dashboardUtils';

interface TeamOverviewCardProps {
  /** Array of collaborators to display */
  collaborators: Collaborator[];
}

/**
 * Team Overview Card component showing team member statistics
 * @param props - Component props
 * @returns JSX element representing the team overview card
 */
const TeamOverviewCard: React.FC<TeamOverviewCardProps> = ({ collaborators }) => {
  return (
    <div className={CARD_STYLES} data-testid="team-overview-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users size={20} className="text-blue-600" />
          </div>
          Team Performance
        </h2>
        <Link 
          to="/team-members" 
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          data-testid="view-all-team-link"
        >
          View All Team Members
          <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="space-y-4">
        {collaborators.slice(0, 4).map(collab => {
          const statusText = getStatusText(collab.overdueTasks);
          
          return (
            <div 
              key={collab.id} 
              className="flex items-center gap-4"
              data-testid={`collaborator-${collab.id}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-blue-500`}
                data-testid="collaborator-avatar"
              >
                {collab.initials}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm" data-testid="collaborator-name">
                    {collab.name}
                  </h3>
                  <span 
                    className="text-xs text-gray-500"
                    data-testid="collaborator-status"
                  >
                    {statusText}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span data-testid="collaborator-tasks">
                    {collab.tasksCompleted} of {collab.tasksAssigned} tasks completed
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

export default TeamOverviewCard;
