import React, { useState, useMemo } from 'react';
import {
    Sun,
    X,
    Zap,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ChevronRight,
    Flame,
    Target,
    Coffee,
    Sparkles,
    Calendar,
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
    completedAt?: string;
    collaborators?: string[];
    priority?: string;
    dueDate?: string;
    estimatedHours?: number;
    [key: string]: unknown;
}

interface Connection {
    id?: string;
    from: string;
    to: string;
}

interface ThreeThing {
    task: Node;
    type: string;
    label: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
}

interface MemberDigest {
    member: Collaborator;
    highPriorityTask?: Node;
    blockingTask?: Node;
    blockingCount: number;
    quickWinTask?: Node;
    totalTasks: number;
    completedToday: number;
    threeThings: ThreeThing[];
}

interface DailyDigestProps {
    nodes?: Node[];
    connections?: Connection[];
    collaborators?: Collaborator[];
    currentUserId?: string;
    onClose?: () => void;
}

/**
 * DailyDigest - Personal "Your 3 Things" for today
 * Shows each team member their personalized priority list:
 * 1. High priority task
 * 2. Task blocking others
 * 3. Quick win
 */
export default function DailyDigest({
    nodes = [],
    connections = [],
    collaborators = [],
    currentUserId,
    onClose
}: DailyDigestProps) {
    const [selectedMember, setSelectedMember] = useState<string | undefined>(currentUserId || collaborators[0]?.id);

    // Get current date info
    const today = new Date();
    const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Calculate "3 things" for each team member
    const memberDigests = useMemo<Record<string, MemberDigest>>(() => {
        const digests: Record<string, MemberDigest> = {};

        collaborators.forEach(collab => {
            // Get tasks assigned to this member
            const myTasks = nodes.filter(n =>
                !n.completed &&
                Array.isArray(n.collaborators) &&
                n.collaborators.includes(collab.id)
            );

            // 1. High Priority Task (urgent, has deadline, or marked high priority)
            const highPriorityTask = myTasks.find(t => {
                const text = t.text.toLowerCase();
                const isUrgent = text.includes('urgent') || text.includes('asap') || text.includes('critical');
                const hasSoonDeadline = t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                const isHighPriority = t.priority === 'high' || t.priority === 'urgent';
                return isUrgent || hasSoonDeadline || isHighPriority;
            }) || myTasks[0]; // Fallback to first task

            // 2. Task Blocking Others (has outgoing connections to incomplete tasks)
            const blockingTask = myTasks.find(t => {
                const outgoingConnections = connections.filter(c => c.from === t.id);
                const blockedTasks = outgoingConnections
                    .map(c => nodes.find(n => n.id === c.to))
                    .filter(n => n && !n.completed);
                return blockedTasks.length > 0;
            });

            // Count how many tasks this blocking task unblocks
            const blockingCount = blockingTask ? connections.filter(c => {
                if (c.from !== blockingTask.id) return false;
                const targetNode = nodes.find(n => n.id === c.to);
                return targetNode && !targetNode.completed;
            }).length : 0;

            // 3. Quick Win (low estimated hours, simple task)
            const quickWinTask = myTasks
                .filter(t => t.id !== highPriorityTask?.id && t.id !== blockingTask?.id)
                .sort((a, b) => (a.estimatedHours || 2) - (b.estimatedHours || 2))
                .find(t => (t.estimatedHours || 2) <= 2);

            // Calculate overall stats
            const totalTasks = myTasks.length;
            const completedToday = nodes.filter(n =>
                n.completed &&
                Array.isArray(n.collaborators) &&
                n.collaborators.includes(collab.id) &&
                n.completedAt &&
                new Date(n.completedAt).toDateString() === today.toDateString()
            ).length;

            const threeThings: ThreeThing[] = [
                highPriorityTask && {
                    task: highPriorityTask,
                    type: 'priority',
                    label: 'High Priority',
                    icon: Flame,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                },
                blockingTask && {
                    task: blockingTask,
                    type: 'blocking',
                    label: `Unblocks ${blockingCount} task${blockingCount !== 1 ? 's' : ''}`,
                    icon: Target,
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200'
                },
                quickWinTask && {
                    task: quickWinTask,
                    type: 'quickwin',
                    label: 'Quick Win',
                    icon: Zap,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200'
                }
            ].filter((item): item is ThreeThing => Boolean(item));

            digests[collab.id] = {
                member: collab,
                highPriorityTask,
                blockingTask,
                blockingCount,
                quickWinTask,
                totalTasks,
                completedToday,
                threeThings
            };
        });

        return digests;
    }, [nodes, connections, collaborators, today]);

    const currentDigest = selectedMember ? memberDigests[selectedMember] : undefined;
    const currentMember = collaborators.find(c => c.id === selectedMember);

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-md md:w-[450px] max-h-[85vh] flex flex-col mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Sun className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Daily Digest</h3>
                            <p className="text-sm text-orange-100">{dateStr}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Member selector */}
            <div className="p-3 bg-orange-50 border-b border-orange-100 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {collaborators.map(collab => {
                        const digest = memberDigests[collab.id];
                        return (
                            <button
                                key={collab.id}
                                onClick={() => setSelectedMember(collab.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${selectedMember === collab.id
                                        ? 'bg-white shadow-sm border border-orange-200'
                                        : 'hover:bg-white/50'
                                    }`}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: collab.color }}
                                >
                                    {collab.initials}
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-medium text-gray-900">{collab.name.split(' ')[0]}</div>
                                    <div className="text-[10px] text-gray-500">{digest?.totalTasks || 0} tasks</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Greeting and stats */}
            {currentMember && currentDigest && (
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {greeting}, {currentMember.name.split(' ')[0]}! <Coffee className="w-5 h-5 inline text-amber-500" />
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {currentDigest.totalTasks} tasks today
                        </span>
                        {currentDigest.completedToday > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                {currentDigest.completedToday} done
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* The 3 Things */}
            <div className="flex-1 overflow-y-auto p-4">
                {currentDigest ? (
                    <>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h3 className="font-semibold text-gray-900">Your 3 Things Today</h3>
                        </div>

                        {currentDigest.threeThings.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-gray-900 font-medium">All caught up! 🎉</p>
                                <p className="text-sm text-gray-500 mt-1">No tasks assigned for today</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentDigest.threeThings.map((item, index) => {
                                    const ItemIcon = item.icon;
                                    return (
                                        <div
                                            key={item.task.id}
                                            className={`rounded-xl p-4 border ${item.borderColor} ${item.bgColor} transition-all hover:shadow-sm`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm ${item.color} shadow-sm`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <ItemIcon className={`w-4 h-4 ${item.color}`} />
                                                        <span className={`text-xs font-medium ${item.color}`}>{item.label}</span>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900">{item.task.text}</h4>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                        {item.task.estimatedHours && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {item.task.estimatedHours}h
                                                            </span>
                                                        )}
                                                        {item.task.dueDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(item.task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Motivational tip */}
                        {currentDigest.threeThings.length > 0 && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                                <p className="text-xs text-violet-700">
                                    💡 <span className="font-medium">Pro tip:</span> Start with #{currentDigest.threeThings[0]?.type === 'blocking' ? '1' : '2'}
                                    {currentDigest.blockingTask ? ' - completing it will unblock your teammates!' : ' to build momentum for the day.'}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Select a team member to view their digest</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Focus on what matters most</span>
                    <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-500" />
                        Updated {today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
}
