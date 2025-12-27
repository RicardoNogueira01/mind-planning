/**
 * TaskCard Component
 * Reusable card component for displaying tasks (upcoming, completed, etc.)
 */

import React, { KeyboardEvent } from 'react';
import { Clock, User, Tag, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { TaskCardProps, Task, Priority, TaskStatus } from './types';

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onClick,
    showProgress = false,
    showStatus = false,
    showPriority = true,
    showDueDate = true,
    showAssignee = true
}) => {
    const getPriorityColor = (priority: Priority | undefined): string => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getUrgencyIcon = (urgency: string | undefined): React.ReactNode => {
        if (urgency === 'critical') return <AlertTriangle size={14} className="text-red-500" />;
        if (urgency === 'high') return <TrendingUp size={14} className="text-orange-500" />;
        return null;
    };

    const getStatusColor = (status: string | undefined): string => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50';
            case 'in-progress': return 'text-blue-600 bg-blue-50';
            case 'pending': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(task);
        }
    };

    const getAssigneeName = (): string => {
        if (!task.assignedTo) return '';
        if (typeof task.assignedTo === 'string') return task.assignedTo;
        return task.assignedTo.name || '';
    };

    return (
        <div
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onClick?.(task)}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                        {task.urgencyLevel && getUrgencyIcon(task.urgencyLevel)}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                </div>
                {showPriority && task.priority && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                )}
            </div>

            {/* Progress */}
            {showProgress && task.progress !== undefined && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {showDueDate && task.dueDate && (
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{task.timeUntilDue || 'Due soon'}</span>
                    </div>
                )}

                {showAssignee && task.assignedTo && (
                    <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{getAssigneeName()}</span>
                    </div>
                )}

                {showStatus && task.status && (
                    <span className={`px-2 py-0.5 rounded ${getStatusColor(task.status)}`}>
                        {task.status}
                    </span>
                )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {task.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            <Tag size={10} className="mr-1" />
                            {tag}
                        </span>
                    ))}
                    {task.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{task.tags.length - 3} more</span>
                    )}
                </div>
            )}

            {/* Completion indicator */}
            {task.status === 'completed' && (
                <div className="mt-3 flex items-center gap-1 text-green-600 text-xs">
                    <CheckCircle size={14} />
                    <span>Completed</span>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
