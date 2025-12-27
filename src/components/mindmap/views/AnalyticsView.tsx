import React, { useMemo } from 'react';
import { Target, TrendingUp, Users, Clock, CheckCircle, LucideIcon } from 'lucide-react';

interface Assignee {
    name: string;
    color?: string;
}

interface AnalyticsNode {
    id: string;
    text?: string;
    status?: string;
    priority?: string;
    progress?: number;
    dueDate?: string;
    assignee?: Assignee;
    [key: string]: unknown;
}

interface Connection {
    from: string;
    to: string;
    [key: string]: unknown;
}

interface AssigneeWorkload {
    name: string;
    color: string;
    total: number;
    completed: number;
    inProgress: number;
}

interface AnalyticsData {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    avgProgress: number;
    completionRate: number;
    onTimeRate: number;
    overdueTasks: number;
    assigneeWorkload: AssigneeWorkload[];
    connectionsCount: number;
}

interface AnalyticsViewProps {
    nodes: AnalyticsNode[];
    connections: Connection[];
}

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
}

interface ProgressBarProps {
    label: string;
    value: number;
    total: number;
    color: string;
}

/**
 * Analytics View for Mind Map
 * Displays statistics and insights about tasks
 */
const AnalyticsView: React.FC<AnalyticsViewProps> = ({ nodes, connections }) => {
    const analytics: AnalyticsData = useMemo(() => {
        const total = nodes.length;
        const byStatus: Record<string, number> = {
            'not-started': 0,
            'in-progress': 0,
            'review': 0,
            'completed': 0,
        };
        const byPriority: Record<string, number> = { high: 0, medium: 0, low: 0, none: 0 };
        let totalProgress = 0;
        let tasksWithDueDates = 0;
        let overdueTasks = 0;
        let completedOnTime = 0;
        const assigneeWorkload: Record<string, AssigneeWorkload> = {};

        const now = new Date();

        nodes.forEach(node => {
            // Status
            const status = node.status || 'not-started';
            byStatus[status] = (byStatus[status] || 0) + 1;

            // Priority
            const priority = node.priority || 'none';
            byPriority[priority] = (byPriority[priority] || 0) + 1;

            // Progress
            totalProgress += node.progress || 0;

            // Due dates
            if (node.dueDate) {
                tasksWithDueDates++;
                const dueDate = new Date(node.dueDate);
                if (dueDate < now && status !== 'completed') {
                    overdueTasks++;
                }
                if (status === 'completed' && dueDate >= now) {
                    completedOnTime++;
                }
            }

            // Assignee workload
            if (node.assignee) {
                if (!assigneeWorkload[node.assignee.name]) {
                    assigneeWorkload[node.assignee.name] = {
                        name: node.assignee.name,
                        color: node.assignee.color || '#3B82F6',
                        total: 0,
                        completed: 0,
                        inProgress: 0,
                    };
                }
                assigneeWorkload[node.assignee.name].total++;
                if (status === 'completed') {
                    assigneeWorkload[node.assignee.name].completed++;
                } else if (status === 'in-progress') {
                    assigneeWorkload[node.assignee.name].inProgress++;
                }
            }
        });

        const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;
        const completionRate = total > 0 ? Math.round((byStatus.completed / total) * 100) : 0;
        const onTimeRate = tasksWithDueDates > 0 ? Math.round((completedOnTime / tasksWithDueDates) * 100) : 0;

        return {
            total,
            byStatus,
            byPriority,
            avgProgress,
            completionRate,
            onTimeRate,
            overdueTasks,
            assigneeWorkload: Object.values(assigneeWorkload),
            connectionsCount: connections.length,
        };
    }, [nodes, connections]);

    const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );

    const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, total, color }) => {
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
        return (
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm text-gray-600">{value} ({percentage}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${color}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Target size={24} className="text-gray-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={CheckCircle}
                        title="Total Tasks"
                        value={analytics.total}
                        subtitle={`${analytics.connectionsCount} connections`}
                        color="bg-blue-600"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Completion Rate"
                        value={`${analytics.completionRate}%`}
                        subtitle={`${analytics.byStatus.completed} completed`}
                        color="bg-green-600"
                    />
                    <StatCard
                        icon={Target}
                        title="Average Progress"
                        value={`${analytics.avgProgress}%`}
                        subtitle="Across all tasks"
                        color="bg-purple-600"
                    />
                    <StatCard
                        icon={Clock}
                        title="On-Time Rate"
                        value={`${analytics.onTimeRate}%`}
                        subtitle={analytics.overdueTasks > 0 ? `${analytics.overdueTasks} overdue` : 'All on track'}
                        color={analytics.overdueTasks > 0 ? 'bg-red-600' : 'bg-emerald-600'}
                    />
                </div>

                {/* Status & Priority Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Breakdown */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Status Breakdown</h3>
                        <ProgressBar
                            label="Not Started"
                            value={analytics.byStatus['not-started']}
                            total={analytics.total}
                            color="bg-gray-400"
                        />
                        <ProgressBar
                            label="In Progress"
                            value={analytics.byStatus['in-progress']}
                            total={analytics.total}
                            color="bg-blue-500"
                        />
                        <ProgressBar
                            label="In Review"
                            value={analytics.byStatus.review}
                            total={analytics.total}
                            color="bg-yellow-500"
                        />
                        <ProgressBar
                            label="Completed"
                            value={analytics.byStatus.completed}
                            total={analytics.total}
                            color="bg-green-500"
                        />
                    </div>

                    {/* Priority Breakdown */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Breakdown</h3>
                        <ProgressBar
                            label="High Priority"
                            value={analytics.byPriority.high}
                            total={analytics.total}
                            color="bg-red-500"
                        />
                        <ProgressBar
                            label="Medium Priority"
                            value={analytics.byPriority.medium}
                            total={analytics.total}
                            color="bg-yellow-500"
                        />
                        <ProgressBar
                            label="Low Priority"
                            value={analytics.byPriority.low}
                            total={analytics.total}
                            color="bg-green-500"
                        />
                        <ProgressBar
                            label="No Priority Set"
                            value={analytics.byPriority.none}
                            total={analytics.total}
                            color="bg-gray-400"
                        />
                    </div>
                </div>

                {/* Team Workload */}
                {analytics.assigneeWorkload.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={20} className="text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-900">Team Workload</h3>
                        </div>
                        <div className="space-y-4">
                            {analytics.assigneeWorkload.map((assignee, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                                        style={{ backgroundColor: assignee.color || '#3B82F6' }}
                                    >
                                        {assignee.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-gray-900">{assignee.name}</span>
                                            <span className="text-sm text-gray-600">
                                                {assignee.completed}/{assignee.total} completed
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                    style={{ width: `${(assignee.completed / assignee.total) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 min-w-[45px] text-right">
                                                {Math.round((assignee.completed / assignee.total) * 100)}%
                                            </span>
                                        </div>
                                        {assignee.inProgress > 0 && (
                                            <p className="text-xs text-blue-600 mt-1">{assignee.inProgress} in progress</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsView;
