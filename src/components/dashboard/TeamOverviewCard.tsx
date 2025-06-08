/**
 * @fileoverview Team Overview Card component displaying team member information
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import type { Collaborator } from '../../types/dashboard';
import { 
  getCollaboratorCompletionPercentage, 
  getStatusClasses, 
  getStatusText,
  CARD_STYLES,
  ICON_CONTAINER_STYLES
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
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Team Overview</h2>
        <div className={`${ICON_CONTAINER_STYLES} bg-gradient-to-br from-purple-500 to-pink-600`}>
          <Users size={22} />
        </div>
      </div>
      
      <div className="space-y-4">
        {collaborators.slice(0, 3).map(collab => {
          const completionPercentage = getCollaboratorCompletionPercentage(collab);
          const statusClasses = getStatusClasses(collab.overdueTasks);
          const statusText = getStatusText(collab.overdueTasks);
          
          return (
            <div 
              key={collab.id} 
              className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              data-testid={`collaborator-${collab.id}`}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg"
                style={{ backgroundColor: collab.color }}
                data-testid="collaborator-avatar"
              >
                {collab.initials}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800" data-testid="collaborator-name">
                    {collab.name}
                  </h3>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusClasses}`}
                    data-testid="collaborator-status"
                  >
                    {statusText}
                  </span>
                </div>
                <div className="flex mt-2 items-center text-sm text-gray-500 gap-2">
                  <span data-testid="collaborator-tasks">
                    {collab.tasksCompleted}/{collab.tasksAssigned} tasks
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-16">
                    <div 
                      className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                      data-testid="collaborator-progress"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Link 
        to="/team-members" 
        className="w-full mt-4 text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center justify-center gap-2 transition-colors py-2 px-4 bg-indigo-50 rounded-xl hover:bg-indigo-100"
        data-testid="view-all-team-link"
      >
        <span>View All Team Members</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

export default TeamOverviewCard;
