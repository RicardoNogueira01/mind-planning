import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface Assignee {
    name: string;
    color?: string;
}

interface GanttNode {
    id: string;
    text?: string;
    dueDate?: string;
    progress?: number;
    assignee?: Assignee;
    priority?: string;
    bgColor?: string;
    [key: string]: unknown;
}

interface Connection {
    from: string;
    to: string;
    [key: string]: unknown;
}

interface GanttTask {
    id: string;
    name: string;
    startDate: Date | null;
    endDate: Date | null;
    progress: number;
    dependencies: string[];
    assignee?: Assignee;
    priority?: string;
    bgColor?: string;
}

interface TaskPosition {
    start: number;
    width: number;
}

interface GanttViewProps {
    nodes: GanttNode[];
    connections: Connection[];
}

type ViewMode = 'week' | 'month' | 'quarter';

/**
 * Gantt Chart View for Mind Map Tasks
 * Displays tasks on a timeline with dependencies
 */
const GanttView: React.FC<GanttViewProps> = ({ nodes, connections }) => {
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    // Calculate task data with dates and dependencies
    const tasks: GanttTask[] = useMemo(() => {
        return nodes.map(node => {
            const dueDate = node.dueDate ? new Date(node.dueDate) : null;
            const taskStartDate = dueDate ? new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000) : null;
            const progress = node.progress || 0;

            // Find dependencies (parent nodes)
            const dependencies = connections
                .filter(conn => conn.to === node.id)
                .map(conn => conn.from);

            return {
                id: node.id,
                name: node.text || '',
                startDate: taskStartDate,
                endDate: dueDate,
                progress,
                dependencies,
                assignee: node.assignee,
                priority: node.priority,
                bgColor: node.bgColor,
            };
        }).filter(task => task.startDate && task.endDate) as GanttTask[];
    }, [nodes, connections]);

    // Calculate critical path (longest dependency chain)
    const criticalPath: Set<string> = useMemo(() => {
        const calculatePath = (taskId: string, visited: Set<string> = new Set()): number => {
            if (visited.has(taskId)) return 0;
            visited.add(taskId);

            const task = tasks.find(t => t.id === taskId);
            if (!task || !task.dependencies.length) return 0;

            const maxDepPath = Math.max(
                ...task.dependencies.map(depId => calculatePath(depId, new Set(visited)))
            );

            return maxDepPath + 1;
        };

        const pathLengths = tasks.map(task => ({
            id: task.id,
            length: calculatePath(task.id)
        }));

        const maxLength = Math.max(...pathLengths.map(p => p.length));
        return new Set(pathLengths.filter(p => p.length === maxLength).map(p => p.id));
    }, [tasks]);

    // Calculate timeline grid
    const getTimelineColumns = (): Date[] => {
        const cols: Date[] = [];
        const date = new Date(startDate);

        if (viewMode === 'week') {
            for (let i = 0; i < 7; i++) {
                cols.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
        } else if (viewMode === 'month') {
            for (let i = 0; i < 30; i++) {
                cols.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
        } else if (viewMode === 'quarter') {
            for (let i = 0; i < 90; i++) {
                cols.push(new Date(date));
                date.setDate(date.getDate() + 1);
            }
        }

        return cols;
    };

    const columns = getTimelineColumns();

    const getTaskPosition = (task: GanttTask): TaskPosition | null => {
        if (!task.startDate || !task.endDate) return null;

        const start = columns.findIndex(col =>
            col.toDateString() === task.startDate!.toDateString()
        );
        const end = columns.findIndex(col =>
            col.toDateString() === task.endDate!.toDateString()
        );

        if (start === -1 || end === -1) return null;

        return {
            start: start < 0 ? 0 : start,
            width: Math.max(1, (end - start) + 1)
        };
    };

    const navigateDate = (direction: 'prev' | 'next'): void => {
        const newDate = new Date(startDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else if (viewMode === 'quarter') {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        }
        setStartDate(newDate);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Gantt Chart</h2>
                    {criticalPath.size > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center gap-1">
                            <AlertCircle size={12} />
                            Critical Path: {criticalPath.size} tasks
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* View Mode Selector */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'week' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${viewMode === 'month' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('quarter')}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${viewMode === 'quarter' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Quarter
                        </button>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateDate('prev')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
                            {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => navigateDate('next')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="flex-1 overflow-auto">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Calendar size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-600 font-medium">No tasks with dates</p>
                        <p className="text-sm text-gray-400 mt-2">Add due dates to your tasks to see them on the Gantt chart</p>
                    </div>
                ) : (
                    <div className="min-w-max">
                        {/* Timeline Header */}
                        <div className="flex sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                            <div className="w-48 p-3 font-medium text-sm text-gray-700 border-r border-gray-200">Task</div>
                            {columns.map((col, idx) => (
                                <div
                                    key={idx}
                                    className="w-10 p-2 text-xs text-center text-gray-600 border-r border-gray-100"
                                >
                                    {col.getDate()}
                                </div>
                            ))}
                        </div>

                        {/* Task Rows */}
                        {tasks.map((task) => {
                            const position = getTaskPosition(task);
                            const isCritical = criticalPath.has(task.id);

                            return (
                                <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50">
                                    {/* Task Name */}
                                    <div className="w-48 p-3 border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            {isCritical && (
                                                <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
                                            )}
                                            <span className="text-sm text-gray-900 truncate">{task.name}</span>
                                        </div>
                                        {task.assignee && (
                                            <span className="text-xs text-gray-500 mt-1 block">{task.assignee.name}</span>
                                        )}
                                    </div>

                                    {/* Timeline Grid */}
                                    <div className="flex flex-1 relative h-16">
                                        {columns.map((_, idx) => (
                                            <div key={idx} className="w-10 border-r border-gray-100" />
                                        ))}

                                        {/* Task Bar */}
                                        {position && (
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 h-8 rounded flex items-center px-2"
                                                style={{
                                                    left: `${position.start * 40}px`,
                                                    width: `${position.width * 40}px`,
                                                    backgroundColor: isCritical ? '#FEE2E2' : task.bgColor || '#E5E7EB',
                                                    border: isCritical ? '2px solid #DC2626' : 'none',
                                                }}
                                            >
                                                {/* Progress Bar */}
                                                <div
                                                    className="absolute inset-0 rounded"
                                                    style={{
                                                        width: `${task.progress}%`,
                                                        backgroundColor: isCritical ? '#DC2626' : '#3B82F6',
                                                        opacity: 0.3,
                                                    }}
                                                />
                                                <span className="text-xs font-medium text-gray-700 relative z-10 truncate">
                                                    {task.progress}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GanttView;
