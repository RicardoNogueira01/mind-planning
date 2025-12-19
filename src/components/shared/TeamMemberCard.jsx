import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail } from 'lucide-react';

/**
 * Reusable team member card component
 * Used in TeamHierarchy and other team-related views
 */
const TeamMemberCard = ({
    member,
    colorClass,
    showActions = true,
    onMessageClick
}) => {
    const getPerformanceColor = (performance) => {
        switch (performance) {
            case 'excellent': return 'bg-green-100 text-green-700';
            case 'good': return 'bg-blue-100 text-blue-700';
            case 'needs-improvement': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden">
            {/* Colored top bar */}
            <div className={`h-2 bg-gradient-to-br ${colorClass}`}></div>

            <div className="p-5">
                {/* Avatar and Name */}
                <div className="flex items-start gap-3 mb-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md relative flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                    >
                        {member.initials}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate">{member.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{member.role}</p>
                        {member.performance && (
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPerformanceColor(member.performance)}`}>
                                {member.performance.replace('-', ' ')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Contact Info */}
                {(member.email || member.phone) && (
                    <div className="space-y-2 mb-4">
                        {member.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{member.email}</span>
                            </div>
                        )}
                        {member.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                <span>{member.phone}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Task Stats */}
                {(member.tasksCompleted !== undefined || member.tasksInProgress !== undefined || member.overdueTasks !== undefined) && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {member.tasksCompleted !== undefined && (
                            <div className="bg-green-50 rounded-lg p-2 text-center">
                                <div className="text-green-600 font-bold text-sm">{member.tasksCompleted}</div>
                                <div className="text-[10px] text-gray-500">Done</div>
                            </div>
                        )}
                        {member.tasksInProgress !== undefined && (
                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                                <div className="text-blue-600 font-bold text-sm">{member.tasksInProgress}</div>
                                <div className="text-[10px] text-gray-500">Active</div>
                            </div>
                        )}
                        {member.overdueTasks !== undefined && (
                            <div className="bg-red-50 rounded-lg p-2 text-center">
                                <div className="text-red-600 font-bold text-sm">{member.overdueTasks}</div>
                                <div className="text-[10px] text-gray-500">Overdue</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                {showActions && (
                    <div className="flex gap-2">
                        <Link
                            to={`/profile/${member.id}`}
                            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2"
                        >
                            <User size={14} />
                            Profile
                        </Link>
                        <button
                            onClick={onMessageClick}
                            className="flex-1 px-3 py-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2"
                        >
                            <Mail size={14} />
                            Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamMemberCard;
