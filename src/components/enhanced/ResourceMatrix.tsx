import React, { useState, useMemo } from 'react';
import { Users, AlertCircle, X } from 'lucide-react';

interface Collaborator {
    id: string;
    name?: string;
    initials?: string;
    color?: string;
}

interface Node {
    id: string;
    text?: string;
    dueDate?: string;
    estimatedHours?: number;
    collaborators?: string[];
    priority?: string;
    [key: string]: unknown;
}

interface PeriodTask {
    id: string;
    text?: string;
    hours: number;
    priority?: string;
}

interface PeriodAllocation {
    hours: number;
    tasks: PeriodTask[];
}

interface Period {
    label: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
}

interface MemberAllocation extends Collaborator {
    periods: PeriodAllocation[];
    totalHours: number;
    utilizationRate: number;
}

interface ResourceMatrixProps {
    nodes: Node[];
    collaborators: Collaborator[];
    dateRange?: 'week' | 'month' | 'quarter';
    onReassignTask?: (taskId: string, newCollaboratorId: string) => void;
    onClose?: () => void;
}

type PeriodType = 'week' | 'month' | 'quarter';

export default function ResourceMatrix({
    nodes,
    collaborators,
    dateRange = 'week',
    onReassignTask,
    onClose
}: ResourceMatrixProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(dateRange);

    // Generate time periods
    const periods = useMemo<Period[]>(() => {
        const result: Period[] = [];
        const today = new Date();
        const periodCount = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 4 : 12;

        for (let i = 0; i < periodCount; i++) {
            const date = new Date(today);
            if (selectedPeriod === 'week') {
                date.setDate(today.getDate() + i);
                result.push({
                    label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    date: date.toISOString().split('T')[0]
                });
            } else if (selectedPeriod === 'month') {
                date.setDate(today.getDate() + (i * 7));
                result.push({
                    label: `Week ${i + 1}`,
                    startDate: date.toISOString().split('T')[0],
                    endDate: new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
            } else {
                date.setMonth(today.getMonth() + i);
                result.push({
                    label: date.toLocaleDateString('en-US', { month: 'short' }),
                    month: date.getMonth(),
                    year: date.getFullYear()
                });
            }
        }
        return result;
    }, [selectedPeriod]);

    // Calculate allocation matrix
    const allocationData = useMemo<MemberAllocation[]>(() => {
        const matrix: Record<string, MemberAllocation> = {};
        const maxHoursPerDay = 8;

        collaborators.forEach(collab => {
            matrix[collab.id] = {
                ...collab,
                periods: periods.map(() => ({ hours: 0, tasks: [] })),
                totalHours: 0,
                utilizationRate: 0
            };
        });

        nodes.forEach(node => {
            if (!node.dueDate || !node.collaborators?.length) return;

            const dueDate = new Date(node.dueDate);
            const hours = node.estimatedHours || 2;

            node.collaborators.forEach(collabId => {
                if (!matrix[collabId]) return;

                // Find which period this task falls into
                let periodIndex = -1;

                if (selectedPeriod === 'week') {
                    periodIndex = periods.findIndex(p => p.date === dueDate.toISOString().split('T')[0]);
                } else if (selectedPeriod === 'month') {
                    periodIndex = periods.findIndex(p => {
                        if (!p.startDate || !p.endDate) return false;
                        const start = new Date(p.startDate);
                        const end = new Date(p.endDate);
                        return dueDate >= start && dueDate <= end;
                    });
                } else {
                    periodIndex = periods.findIndex(p =>
                        p.month === dueDate.getMonth() && p.year === dueDate.getFullYear()
                    );
                }

                if (periodIndex >= 0) {
                    const hoursPerMember = hours / node.collaborators!.length;
                    matrix[collabId].periods[periodIndex].hours += hoursPerMember;
                    matrix[collabId].periods[periodIndex].tasks.push({
                        id: node.id,
                        text: node.text,
                        hours: hoursPerMember,
                        priority: node.priority
                    });
                    matrix[collabId].totalHours += hoursPerMember;
                }
            });
        });

        // Calculate utilization rates
        Object.values(matrix).forEach(member => {
            const workingDays = selectedPeriod === 'week' ? 5 : selectedPeriod === 'month' ? 20 : 60;
            const availableHours = workingDays * maxHoursPerDay;
            member.utilizationRate = (member.totalHours / availableHours) * 100;
        });

        return Object.values(matrix);
    }, [nodes, collaborators, periods, selectedPeriod]);

    const getCapacityColor = (hours: number): string => {
        const maxHours = 8;
        const utilizationRate = (hours / maxHours) * 100;

        if (utilizationRate > 100) return 'bg-red-500';
        if (utilizationRate > 80) return 'bg-amber-500';
        if (utilizationRate > 50) return 'bg-green-500';
        return 'bg-blue-400';
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Resource Allocation</h3>
                            <p className="text-sm text-indigo-100">Team capacity planning</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Period selector */}
                        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                            {(['week', 'month', 'quarter'] as PeriodType[]).map(period => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedPeriod === period
                                            ? 'bg-white text-indigo-600'
                                            : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </button>
                            ))}
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary stats */}
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Total Team Members</div>
                        <div className="text-2xl font-bold text-gray-900">{collaborators.length}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Avg Utilization</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {allocationData.length > 0 ? (allocationData.reduce((sum, m) => sum + m.utilizationRate, 0) / allocationData.length).toFixed(0) : 0}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Overallocated</div>
                        <div className="text-2xl font-bold text-red-600">
                            {allocationData.filter(m => m.utilizationRate > 100).length}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-600 mb-1">Available Capacity</div>
                        <div className="text-2xl font-bold text-green-600">
                            {allocationData.filter(m => m.utilizationRate < 50).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix */}
            <div className="flex-1 overflow-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 min-w-[180px]">
                                Team Member
                            </th>
                            {periods.map((period, idx) => (
                                <th key={idx} className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 min-w-[100px]">
                                    {period.label}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-b border-gray-200 min-w-[100px]">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocationData.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                            style={{ backgroundColor: member.color }}
                                        >
                                            {member.initials}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {member.utilizationRate.toFixed(0)}% utilized
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {member.periods.map((period, idx) => (
                                    <td key={idx} className="px-3 py-3 border-b border-gray-100">
                                        <div className="flex flex-col items-center gap-1">
                                            <div
                                                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getCapacityColor(period.hours)}`}
                                                title={`${period.hours.toFixed(1)}h`}
                                            >
                                                {period.hours > 0 ? period.hours.toFixed(0) : '-'}
                                            </div>
                                            {period.tasks.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    {period.tasks.length} task{period.tasks.length > 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                                <td className="px-4 py-3 border-b border-gray-100 text-center">
                                    <div className="font-bold text-gray-900">{member.totalHours.toFixed(0)}h</div>
                                    <div className={`text-xs ${member.utilizationRate > 100 ? 'text-red-600' :
                                            member.utilizationRate > 80 ? 'text-amber-600' :
                                                'text-green-600'
                                        }`}>
                                        {member.utilizationRate.toFixed(0)}%
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400 rounded"></div>
                            <span className="text-gray-600">Available (0-50%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-gray-600">Optimal (50-80%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                            <span className="text-gray-600">Busy (80-100%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span className="text-gray-600">Overloaded (&gt;100%)</span>
                        </div>
                    </div>

                    {allocationData.filter(m => m.utilizationRate > 100).length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Review overallocated resources</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
