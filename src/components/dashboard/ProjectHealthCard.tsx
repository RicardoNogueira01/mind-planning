import React, { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle, Users, TrendingDown } from 'lucide-react';

interface Collaborator {
    id: string;
    name?: string;
    [key: string]: unknown;
}

interface Task {
    id: string;
    completed?: boolean;
    dueDate?: string;
    priority?: string;
    collaborators?: string[];
    estimatedHours?: number;
    dependencies?: string[];
    [key: string]: unknown;
}

interface Project {
    id: string;
    name: string;
    tasks?: Task[];
    collaborators?: Collaborator[];
    [key: string]: unknown;
}

interface Issue {
    type: string;
    severity: 'critical' | 'warning';
    message: string;
}

interface ProjectHealthMetrics extends Project {
    healthScore: number;
    issues: Issue[];
    completionRate: number;
    status: 'healthy' | 'at-risk' | 'critical';
}

interface ProjectHealthCardProps {
    projects: Project[];
    onViewDetails?: (project?: ProjectHealthMetrics) => void;
}

export default function ProjectHealthCard({ projects, onViewDetails }: ProjectHealthCardProps) {
    const healthMetrics = useMemo<ProjectHealthMetrics[]>(() => {
        return projects.map(project => {
            let score = 100;
            const issues: Issue[] = [];

            // Check schedule health (30 points)
            const overdueTasks = project.tasks?.filter(t => {
                if (!t.dueDate || t.completed) return false;
                return new Date(t.dueDate) < new Date();
            }).length || 0;

            if (overdueTasks > 0) {
                const scheduleDeduction = Math.min(30, overdueTasks * 5);
                score -= scheduleDeduction;
                issues.push({
                    type: 'schedule',
                    severity: overdueTasks > 3 ? 'critical' : 'warning',
                    message: `${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`
                });
            }

            // Check team workload (25 points)
            const teamMembers = project.collaborators || [];
            const overloadedMembers = teamMembers.filter(m => {
                const tasks = project.tasks?.filter(t => t.collaborators?.includes(m.id));
                const totalHours = tasks?.reduce((sum, t) => sum + (t.estimatedHours || 2), 0) || 0;
                return totalHours > 40;
            }).length;

            if (overloadedMembers > 0) {
                score -= Math.min(25, overloadedMembers * 10);
                issues.push({
                    type: 'workload',
                    severity: overloadedMembers > 2 ? 'critical' : 'warning',
                    message: `${overloadedMembers} team member${overloadedMembers > 1 ? 's' : ''} overloaded`
                });
            }

            // Check risk level (20 points)
            const highRiskTasks = project.tasks?.filter(t =>
                !t.completed && t.priority === 'high' && (!t.collaborators || t.collaborators.length === 0)
            ).length || 0;

            if (highRiskTasks > 0) {
                score -= Math.min(20, highRiskTasks * 5);
                issues.push({
                    type: 'risk',
                    severity: highRiskTasks > 2 ? 'critical' : 'warning',
                    message: `${highRiskTasks} high-priority task${highRiskTasks > 1 ? 's' : ''} unassigned`
                });
            }

            // Check completion rate (15 points)
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter(t => t.completed).length || 0;
            const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;

            if (completionRate < 30) {
                score -= 15;
                issues.push({
                    type: 'progress',
                    severity: 'warning',
                    message: `Only ${completionRate.toFixed(0)}% of tasks completed`
                });
            }

            // Check blockers (10 points)
            const blockedTasks = project.tasks?.filter(t =>
                !t.completed && t.dependencies?.some(depId => {
                    const dep = project.tasks?.find(dt => dt.id === depId);
                    return dep && !dep.completed;
                })
            ).length || 0;

            if (blockedTasks > 2) {
                score -= 10;
                issues.push({
                    type: 'blockers',
                    severity: 'warning',
                    message: `${blockedTasks} task${blockedTasks > 1 ? 's' : ''} blocked`
                });
            }

            return {
                ...project,
                healthScore: Math.max(0, score),
                issues,
                completionRate,
                status: score >= 80 ? 'healthy' : score >= 60 ? 'at-risk' : 'critical'
            };
        });
    }, [projects]);

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreGradient = (score: number): string => {
        if (score >= 80) return 'from-green-500 to-emerald-600';
        if (score >= 60) return 'from-amber-500 to-orange-600';
        return 'from-red-500 to-rose-600';
    };

    const getStatusBadge = (status: string): string => {
        const styles: Record<string, string> = {
            healthy: 'bg-green-100 text-green-700',
            'at-risk': 'bg-amber-100 text-amber-700',
            critical: 'bg-red-100 text-red-700'
        };
        return styles[status] || styles.healthy;
    };

    const overallHealth = useMemo<number>(() => {
        if (healthMetrics.length === 0) return 0;
        return healthMetrics.reduce((sum, p) => sum + p.healthScore, 0) / healthMetrics.length;
    }, [healthMetrics]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-gradient-to-r ${getScoreGradient(overallHealth)} rounded-lg`}>
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Project Health</h3>
                            <p className="text-xs sm:text-sm text-gray-500">Real-time status monitoring</p>
                        </div>
                    </div>
                </div>

                {/* Overall score */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className={`text-3xl font-bold ${getScoreColor(overallHealth)}`}>
                            {overallHealth.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Overall Health Score</div>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="text-center">
                            <div className="font-bold text-green-600">
                                {healthMetrics.filter(p => p.status === 'healthy').length}
                            </div>
                            <div className="text-gray-500">Healthy</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-amber-600">
                                {healthMetrics.filter(p => p.status === 'at-risk').length}
                            </div>
                            <div className="text-gray-500">At Risk</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-red-600">
                                {healthMetrics.filter(p => p.status === 'critical').length}
                            </div>
                            <div className="text-gray-500">Critical</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project list */}
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {healthMetrics.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No active projects
                    </div>
                ) : (
                    healthMetrics.map((project) => (
                        <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewDetails?.(project)}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm text-gray-900 truncate">
                                            {project.name}
                                        </h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(project.status)}`}>
                                            {project.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {project.completionRate.toFixed(0)}% complete
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {project.collaborators?.length || 0} members
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                                    <div className={`text-2xl font-bold ${getScoreColor(project.healthScore)}`}>
                                        {project.healthScore}
                                    </div>
                                    {project.healthScore < 100 && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <TrendingDown className="w-3 h-3" />
                                            -{100 - project.healthScore}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full bg-gradient-to-r ${getScoreGradient(project.healthScore)} transition-all duration-500`}
                                    style={{ width: `${project.healthScore}%` }}
                                />
                            </div>

                            {/* Issues */}
                            {project.issues.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {project.issues.slice(0, 3).map((issue, idx) => (
                                        <span
                                            key={idx}
                                            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${issue.severity === 'critical'
                                                ? 'bg-red-50 text-red-700'
                                                : 'bg-amber-50 text-amber-700'
                                                }`}
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                            {issue.message}
                                        </span>
                                    ))}
                                    {project.issues.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                            +{project.issues.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
                <button
                    onClick={() => onViewDetails?.()}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    View Details →
                </button>
            </div>
        </div>
    );
}
