import React, { useMemo, useState } from 'react';
import { Users, AlertTriangle, TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp, Clock, X } from 'lucide-react';

interface Collaborator {
    id: string;
    name?: string;
    initials?: string;
    color?: string;
}

interface Node {
    id: string;
    text?: string;
    collaborators?: (string | { id: string })[];
    assignedTo?: string | { id: string };
    dueDate?: string;
    completed?: boolean;
    estimatedHours?: number;
    duration?: number;
    [key: string]: unknown;
}

interface MemberWorkload extends Collaborator {
    tasks: Node[];
    taskCount: number;
    completedCount: number;
    totalHours: number;
    overdueTasks: number;
    upcomingDeadlines: number;
    workloadScore: number;
    status: 'overloaded' | 'busy' | 'balanced' | 'available';
}

interface TeamStats {
    overloaded: number;
    available: number;
    avgWorkload: number;
    totalOverdue: number;
}

interface SortOption {
    key: string;
    label: string;
}

interface WorkloadHeatmapProps {
    nodes: Node[];
    collaborators: Collaborator[];
    onReassignTask?: (taskId: string, newCollaboratorId: string) => void;
    onClose?: () => void;
}

type SortByType = 'workload' | 'name' | 'tasks';

/**
 * WorkloadHeatmap - Team workload visualization component
 * Displays workload distribution across team members with visual indicators
 * to help prevent burnout and optimize resource allocation.
 */
export default function WorkloadHeatmap({ nodes, collaborators, onReassignTask, onClose }: WorkloadHeatmapProps) {
    const [expandedMember, setExpandedMember] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortByType>('workload');

    const workloadData = useMemo<MemberWorkload[]>(() => {
        if (!collaborators || collaborators.length === 0) return [];

        const data = collaborators.map(collab => {
            // Find tasks assigned to this collaborator
            const assignedTasks = nodes.filter(node => {
                if (node.collaborators && Array.isArray(node.collaborators)) {
                    return node.collaborators.some(c =>
                        (typeof c === 'string' && c === collab.id) ||
                        (typeof c === 'object' && c.id === collab.id)
                    );
                }
                if (node.assignedTo) {
                    return node.assignedTo === collab.id ||
                        (typeof node.assignedTo === 'object' && node.assignedTo.id === collab.id);
                }
                return false;
            });

            // Calculate total estimated hours
            const totalHours = assignedTasks.reduce((sum, task) => {
                const hours = task.estimatedHours || task.duration || 2; // Default 2 hours
                return sum + hours;
            }, 0);

            // Find overdue tasks
            const now = new Date();
            const overdueTasks = assignedTasks.filter(task => {
                if (!task.dueDate || task.completed) return false;
                return new Date(task.dueDate) < now;
            });

            // Find tasks due within 3 days
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            const upcomingDeadlines = assignedTasks.filter(task => {
                if (!task.dueDate || task.completed) return false;
                const dueDate = new Date(task.dueDate);
                return dueDate >= now && dueDate <= threeDaysFromNow;
            });

            // Count completed tasks
            const completedTasks = assignedTasks.filter(task => task.completed);

            // Calculate workload score (0-100)
            const maxHoursPerWeek = 40;
            const baseScore = (totalHours / maxHoursPerWeek) * 100;

            // Add penalty for overdue tasks
            const overduepenalty = overdueTasks.length * 10;

            // Add penalty for many upcoming deadlines
            const deadlinePenalty = upcomingDeadlines.length * 5;

            const workloadScore = Math.min(baseScore + overduepenalty + deadlinePenalty, 100);

            // Determine status
            let status: MemberWorkload['status'];
            if (workloadScore > 80) status = 'overloaded';
            else if (workloadScore > 60) status = 'busy';
            else if (workloadScore > 30) status = 'balanced';
            else status = 'available';

            return {
                ...collab,
                id: collab.id,
                name: collab.name || 'Unknown',
                initials: collab.initials || collab.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?',
                color: collab.color || '#6366F1',
                tasks: assignedTasks,
                taskCount: assignedTasks.length,
                completedCount: completedTasks.length,
                totalHours,
                overdueTasks: overdueTasks.length,
                upcomingDeadlines: upcomingDeadlines.length,
                workloadScore: Math.round(workloadScore),
                status
            };
        });

        // Sort data
        switch (sortBy) {
            case 'name':
                return data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'tasks':
                return data.sort((a, b) => b.taskCount - a.taskCount);
            case 'workload':
            default:
                return data.sort((a, b) => b.workloadScore - a.workloadScore);
        }
    }, [nodes, collaborators, sortBy]);

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'overloaded': return 'bg-red-500';
            case 'busy': return 'bg-amber-500';
            case 'balanced': return 'bg-green-500';
            case 'available': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusBadge = (status: string): string => {
        switch (status) {
            case 'overloaded': return 'text-red-700 bg-red-100';
            case 'busy': return 'text-amber-700 bg-amber-100';
            case 'balanced': return 'text-green-700 bg-green-100';
            case 'available': return 'text-blue-700 bg-blue-100';
            default: return 'text-gray-700 bg-gray-100';
        }
    };

    const getBarColor = (score: number): string => {
        if (score > 80) return 'bg-gradient-to-r from-red-400 to-red-600';
        if (score > 60) return 'bg-gradient-to-r from-amber-400 to-amber-600';
        if (score > 30) return 'bg-gradient-to-r from-green-400 to-green-600';
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    };

    const teamStats = useMemo<TeamStats | null>(() => {
        if (workloadData.length === 0) return null;

        const overloaded = workloadData.filter(m => m.status === 'overloaded').length;
        const available = workloadData.filter(m => m.status === 'available').length;
        const avgWorkload = Math.round(
            workloadData.reduce((sum, m) => sum + m.workloadScore, 0) / workloadData.length
        );
        const totalOverdue = workloadData.reduce((sum, m) => sum + m.overdueTasks, 0);

        return { overloaded, available, avgWorkload, totalOverdue };
    }, [workloadData]);

    const sortOptions: SortOption[] = [
        { key: 'workload', label: 'Workload' },
        { key: 'tasks', label: 'Tasks' },
        { key: 'name', label: 'Name' }
    ];

    if (!collaborators || collaborators.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No team members to display</p>
                <p className="text-xs text-gray-400 mt-1">Add collaborators to see workload distribution</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-md md:w-96 max-h-[80vh] flex flex-col mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Team Workload</h3>
                            <p className="text-sm text-indigo-100">
                                {workloadData.length} team member{workloadData.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Team stats summary */}
            {teamStats && (
                <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 border-b border-gray-100">
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{teamStats.avgWorkload}%</p>
                        <p className="text-xs text-gray-500">Avg Load</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{teamStats.overloaded}</p>
                        <p className="text-xs text-gray-500">Overloaded</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{teamStats.available}</p>
                        <p className="text-xs text-gray-500">Available</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-amber-600">{teamStats.totalOverdue}</p>
                        <p className="text-xs text-gray-500">Overdue</p>
                    </div>
                </div>
            )}

            {/* Sort options */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Sort by:</span>
                <div className="flex gap-1">
                    {sortOptions.map(option => (
                        <button
                            key={option.key}
                            onClick={() => setSortBy(option.key as SortByType)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${sortBy === option.key
                                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Member list */}
            <div className="flex-1 overflow-y-auto">
                {workloadData.map((member) => (
                    <div key={member.id} className="border-b border-gray-100 last:border-b-0">
                        {/* Member row */}
                        <div
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0"
                                    style={{ backgroundColor: member.color }}
                                >
                                    {member.initials}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm text-gray-900 truncate">
                                            {member.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {member.overdueTasks > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {member.overdueTasks}
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(member.status)}`}>
                                                {member.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Workload bar */}
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${getBarColor(member.workloadScore)}`}
                                            style={{ width: `${member.workloadScore}%` }}
                                        />
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-500">
                                            {member.taskCount} tasks · {member.totalHours}h estimated
                                        </span>
                                        <span className="text-xs font-medium text-gray-600">
                                            {member.workloadScore}%
                                        </span>
                                    </div>
                                </div>

                                {/* Expand indicator */}
                                {expandedMember === member.id ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                            </div>
                        </div>

                        {/* Expanded task list */}
                        {expandedMember === member.id && member.tasks.length > 0 && (
                            <div className="px-4 pb-4">
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                                    {member.tasks.slice(0, 10).map(task => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? 'bg-green-500' :
                                                    task.dueDate && new Date(task.dueDate) < new Date() ? 'bg-red-500' :
                                                        'bg-gray-300'
                                                }`} />
                                            <span className={`flex-1 truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {task.text}
                                            </span>
                                            {task.estimatedHours && (
                                                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {task.estimatedHours}h
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {member.tasks.length > 10 && (
                                        <p className="text-xs text-gray-400 text-center pt-1">
                                            +{member.tasks.length - 10} more tasks
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer insights */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-start gap-2">
                    {teamStats && teamStats.overloaded > 0 ? (
                        <>
                            <TrendingDown className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-amber-600">{teamStats.overloaded}</span> team member{teamStats.overloaded !== 1 ? 's are' : ' is'} overloaded.
                                Consider redistributing tasks.
                            </p>
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                                Team workload is well balanced.
                                <span className="font-medium text-blue-600"> {teamStats?.available || 0}</span> member{teamStats?.available !== 1 ? 's have' : ' has'} capacity.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
