import React, { useState, useMemo } from 'react';
import {
    CircleDot,
    X,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    PlayCircle,
    PauseCircle,
    HelpCircle,
    ArrowRight,
    LucideIcon
} from 'lucide-react';

interface Collaborator {
    id: string;
    name: string;
    initials: string;
    color: string;
}

interface Node {
    id: string;
    text: string;
    completed?: boolean;
    collaborators?: string[];
    taskStatus?: string;
    statusDetail?: string;
    lastUpdated?: string;
    estimatedHours?: number;
    [key: string]: unknown;
}

interface Connection {
    id?: string;
    from: string;
    to: string;
}

interface AnalyzedTask extends Node {
    status: string;
    statusDetail?: string | null;
    blockedByCount?: number;
}

interface StatusConfig {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: LucideIcon;
}

interface EditStatusState {
    status: string;
    detail: string;
}

interface NextActionHighlighterProps {
    nodes?: Node[];
    connections?: Connection[];
    collaborators?: Collaborator[];
    onUpdateTaskStatus?: (taskId: string, status: string, detail: string) => void;
    onClose?: () => void;
}

/**
 * NextActionHighlighter - Shows clear status on every task
 * Eliminates ambiguity with status badges:
 * 🟢 Ready to start
 * 🟡 Waiting on someone/something  
 * 🔴 Blocked by specific issue
 * ⚪ Needs decision/approval
 */

const STATUS_TYPES: Record<string, StatusConfig> = {
    ready: {
        label: 'Ready to Start',
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        icon: PlayCircle
    },
    waiting: {
        label: 'Waiting On',
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        icon: Clock
    },
    blocked: {
        label: 'Blocked By',
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: AlertCircle
    },
    needsDecision: {
        label: 'Needs Decision',
        color: 'bg-gray-400',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        icon: HelpCircle
    },
    inProgress: {
        label: 'In Progress',
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: CircleDot
    },
    completed: {
        label: 'Completed',
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        icon: CheckCircle2
    },
    paused: {
        label: 'On Hold',
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        icon: PauseCircle
    }
};

export default function NextActionHighlighter({
    nodes = [],
    connections = [],
    collaborators = [],
    onUpdateTaskStatus,
    onClose
}: NextActionHighlighterProps) {
    const [filter, setFilter] = useState<string>('all');
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editStatus, setEditStatus] = useState<EditStatusState>({ status: '', detail: '' });

    // Analyze each task and determine its status
    const analyzedTasks = useMemo<AnalyzedTask[]>(() => {
        return nodes.map(node => {
            // If completed
            if (node.completed) {
                return { ...node, status: 'completed', statusDetail: null };
            }

            // Check if task has explicit status set
            if (node.taskStatus) {
                return {
                    ...node,
                    status: node.taskStatus,
                    statusDetail: node.statusDetail || null
                };
            }

            // Check for dependencies (blocked)
            const incomingConnections = connections.filter(c => c.to === node.id);
            const blockedByTasks = incomingConnections
                .map(c => nodes.find(n => n.id === c.from))
                .filter(n => n && !n.completed);

            if (blockedByTasks.length > 0) {
                return {
                    ...node,
                    status: 'blocked',
                    statusDetail: blockedByTasks[0]?.text,
                    blockedByCount: blockedByTasks.length
                };
            }

            // Check if has assignee and is being worked on
            if (node.collaborators && node.collaborators.length > 0) {
                // Check if recently updated (in last 24 hours) - assume in progress
                const lastUpdate = node.lastUpdated ? new Date(node.lastUpdated) : null;
                const isRecent = lastUpdate && (Date.now() - lastUpdate.getTime()) < 24 * 60 * 60 * 1000;

                if (isRecent) {
                    return { ...node, status: 'inProgress', statusDetail: null };
                }
            }

            // Check for keywords that suggest waiting/needs decision
            const textLower = node.text.toLowerCase();
            if (textLower.includes('waiting') || textLower.includes('pending')) {
                return { ...node, status: 'waiting', statusDetail: 'Pending response' };
            }
            if (textLower.includes('decision') || textLower.includes('approve') || textLower.includes('review')) {
                return { ...node, status: 'needsDecision', statusDetail: 'Approval required' };
            }

            // Default: Ready to start
            return { ...node, status: 'ready', statusDetail: null };
        });
    }, [nodes, connections]);

    // Filter tasks
    const filteredTasks = useMemo<AnalyzedTask[]>(() => {
        if (filter === 'all') return analyzedTasks.filter(t => !t.completed);
        return analyzedTasks.filter(t => t.status === filter);
    }, [analyzedTasks, filter]);

    // Count by status
    const statusCounts = useMemo<Record<string, number>>(() => {
        const counts: Record<string, number> = {};
        Object.keys(STATUS_TYPES).forEach(status => {
            counts[status] = analyzedTasks.filter(t => t.status === status).length;
        });
        return counts;
    }, [analyzedTasks]);

    const handleSaveStatus = (taskId: string): void => {
        onUpdateTaskStatus?.(taskId, editStatus.status, editStatus.detail);
        setEditingTask(null);
        setEditStatus({ status: '', detail: '' });
    };

    const getCollaborator = (id: string): Collaborator | undefined =>
        collaborators.find(c => c.id === id);

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-lg md:w-[520px] max-h-[85vh] flex flex-col mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <CircleDot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Next Actions</h3>
                            <p className="text-sm text-teal-100">
                                {filteredTasks.length} tasks • Clear status for everyone
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Status filter pills */}
            <div className="p-3 bg-gray-50 border-b border-gray-200 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === 'all'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        All Active ({analyzedTasks.filter(t => !t.completed).length})
                    </button>
                    {Object.entries(STATUS_TYPES).filter(([key]) => key !== 'completed').map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${filter === key
                                    ? `${config.bgColor} ${config.textColor} ${config.borderColor} border`
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${config.color}`} />
                            {statusCounts[key]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-2 bg-white border-b border-gray-100 text-xs text-gray-500">
                <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Ready</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Waiting</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Blocked</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Needs Decision</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress</span>
                </div>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No tasks in this category</p>
                    </div>
                ) : (
                    filteredTasks.map(task => {
                        const statusConfig = STATUS_TYPES[task.status];
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={task.id}
                                className={`rounded-xl p-3 border ${statusConfig.borderColor} ${statusConfig.bgColor} transition-all hover:shadow-sm`}
                            >
                                {editingTask === task.id ? (
                                    /* Edit mode */
                                    <div className="space-y-3">
                                        <div className="text-sm font-medium text-gray-900">{task.text}</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(STATUS_TYPES).filter(([k]) => k !== 'completed').map(([key, config]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setEditStatus(prev => ({ ...prev, status: key }))}
                                                    className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${editStatus.status === key
                                                            ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${config.color}`} />
                                                    {config.label}
                                                </button>
                                            ))}
                                        </div>
                                        {(editStatus.status === 'waiting' || editStatus.status === 'blocked' || editStatus.status === 'needsDecision') && (
                                            <input
                                                type="text"
                                                value={editStatus.detail}
                                                onChange={(e) => setEditStatus(prev => ({ ...prev, detail: e.target.value }))}
                                                placeholder={editStatus.status === 'waiting' ? 'Waiting on...' : editStatus.status === 'blocked' ? 'Blocked by...' : 'What decision is needed?'}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingTask(null)}
                                                className="flex-1 py-2 text-gray-600 hover:bg-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleSaveStatus(task.id)}
                                                disabled={!editStatus.status}
                                                className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Display mode */
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1.5 rounded-lg ${statusConfig.color} text-white flex-shrink-0`}>
                                            <StatusIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{task.text}</h4>
                                                <button
                                                    onClick={() => {
                                                        setEditingTask(task.id);
                                                        setEditStatus({ status: task.status, detail: task.statusDetail || '' });
                                                    }}
                                                    className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                                                >
                                                    Edit
                                                </button>
                                            </div>

                                            {/* Status detail */}
                                            {task.statusDetail && (
                                                <div className={`flex items-center gap-1 mt-1 text-xs ${statusConfig.textColor}`}>
                                                    <ArrowRight className="w-3 h-3" />
                                                    {task.statusDetail}
                                                    {task.blockedByCount && task.blockedByCount > 1 && (
                                                        <span className="text-gray-400 ml-1">+{task.blockedByCount - 1} more</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Assignee and meta */}
                                            <div className="flex items-center gap-2 mt-2">
                                                {task.collaborators && task.collaborators.length > 0 ? (
                                                    <div className="flex -space-x-1">
                                                        {task.collaborators.slice(0, 3).map(collabId => {
                                                            const collab = getCollaborator(collabId);
                                                            return collab ? (
                                                                <div
                                                                    key={collabId}
                                                                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold border-2 border-white"
                                                                    style={{ backgroundColor: collab.color }}
                                                                    title={collab.name}
                                                                >
                                                                    {collab.initials}
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <User className="w-3 h-3" /> Unassigned
                                                    </span>
                                                )}
                                                {task.estimatedHours && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {task.estimatedHours}h
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 font-medium">{statusCounts.ready} ready to start</span>
                    <span className="text-amber-600 font-medium">{statusCounts.waiting + statusCounts.blocked} blocked/waiting</span>
                    <span className="text-gray-500">{statusCounts.needsDecision} need decisions</span>
                </div>
            </div>
        </div>
    );
}
