import React, { useState, useMemo } from 'react';
import {
    Layers,
    X,
    Search,
    ChevronLeft,
    ChevronRight,
    Filter,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Circle,
    Eye,
    EyeOff,
    Maximize2,
    Minimize2
} from 'lucide-react';

interface Collaborator {
    id: string;
    name: string;
    initials: string;
    color: string;
}

interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    assignee: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

interface Project {
    id: string;
    name: string;
    color: string;
    tasks: Task[];
}

interface TaskWithProject extends Task {
    projectId: string;
    projectName: string;
    projectColor: string;
}

interface Conflict {
    assignee: string;
    tasks: TaskWithProject[];
}

interface TaskPosition {
    left: number;
    width: number;
}

interface Stats {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
}

interface PriorityStyle {
    bg: string;
    text: string;
    border: string;
}

interface CrossProjectTimelineProps {
    collaborators?: Collaborator[];
    onClose?: () => void;
}

type ZoomLevel = 'day' | 'week' | 'month';

const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-1',
        name: 'Website Redesign',
        color: '#3B82F6',
        tasks: [
            { id: 't1', name: 'UI Design', start: '2024-12-10', end: '2024-12-20', progress: 80, assignee: 'jd', priority: 'high' },
            { id: 't2', name: 'Frontend Dev', start: '2024-12-18', end: '2025-01-05', progress: 30, assignee: 'ak', priority: 'high' },
            { id: 't3', name: 'Backend API', start: '2024-12-15', end: '2024-12-28', progress: 60, assignee: 'ts', priority: 'medium' },
            { id: 't4', name: 'Testing', start: '2025-01-02', end: '2025-01-10', progress: 0, assignee: 'mr', priority: 'medium' }
        ]
    },
    {
        id: 'proj-2',
        name: 'Mobile App v2',
        color: '#10B981',
        tasks: [
            { id: 't5', name: 'Requirements', start: '2024-12-01', end: '2024-12-10', progress: 100, assignee: 'jd', priority: 'high' },
            { id: 't6', name: 'UI/UX Design', start: '2024-12-11', end: '2024-12-22', progress: 50, assignee: 'mr', priority: 'high' },
            { id: 't7', name: 'Development', start: '2024-12-20', end: '2025-01-15', progress: 10, assignee: 'ak', priority: 'high' },
            { id: 't8', name: 'QA Testing', start: '2025-01-12', end: '2025-01-20', progress: 0, assignee: 'ts', priority: 'medium' }
        ]
    },
    {
        id: 'proj-3',
        name: 'Q1 Marketing',
        color: '#F59E0B',
        tasks: [
            { id: 't9', name: 'Campaign Planning', start: '2024-12-05', end: '2024-12-15', progress: 100, assignee: 'mr', priority: 'medium' },
            { id: 't10', name: 'Content Creation', start: '2024-12-16', end: '2025-01-05', progress: 40, assignee: 'jd', priority: 'medium' },
            { id: 't11', name: 'Launch Prep', start: '2025-01-02', end: '2025-01-10', progress: 0, assignee: 'mr', priority: 'high' }
        ]
    },
    {
        id: 'proj-4',
        name: 'Infrastructure',
        color: '#8B5CF6',
        tasks: [
            { id: 't12', name: 'Server Migration', start: '2024-12-12', end: '2024-12-18', progress: 90, assignee: 'ts', priority: 'critical' },
            { id: 't13', name: 'Security Audit', start: '2024-12-19', end: '2024-12-28', progress: 20, assignee: 'ts', priority: 'high' },
            { id: 't14', name: 'Performance Opt', start: '2025-01-05', end: '2025-01-15', progress: 0, assignee: 'ak', priority: 'medium' }
        ]
    }
];

const PRIORITY_COLORS: Record<string, PriorityStyle> = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
};

/**
 * CrossProjectTimeline - Multi-project timeline view for managers
 * See all projects at once with:
 * - Gantt-style timeline view
 * - Filter by project, team member, status
 * - Identify conflicts and dependencies
 * - Zoom in/out on time periods
 */
export default function CrossProjectTimeline({
    collaborators = [],
    onClose
}: CrossProjectTimelineProps) {
    const [projects] = useState<Project[]>(MOCK_PROJECTS);
    const [viewStart, setViewStart] = useState<Date>(new Date('2024-12-01'));
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [hiddenProjects, setHiddenProjects] = useState<Set<string>>(new Set());
    const [expandedView, setExpandedView] = useState<boolean>(false);
    const [showConflicts, setShowConflicts] = useState<boolean>(true);

    // Calculate date range based on zoom level
    const dateRange = useMemo<Date[]>(() => {
        const dates: Date[] = [];
        const start = new Date(viewStart);
        const daysToShow = zoomLevel === 'day' ? 14 : zoomLevel === 'week' ? 42 : 90;

        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, [viewStart, zoomLevel]);

    // Filter projects and tasks
    const filteredProjects = useMemo<Project[]>(() => {
        return projects
            .filter(p => !hiddenProjects.has(p.id))
            .map(project => ({
                ...project,
                tasks: project.tasks.filter(task => {
                    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
                    if (filterAssignee !== 'all' && task.assignee !== filterAssignee) return false;
                    return true;
                })
            }))
            .filter(p => p.tasks.length > 0);
    }, [projects, hiddenProjects, searchQuery, filterPriority, filterAssignee]);

    // Detect conflicts (overlapping tasks for same person)
    const conflicts = useMemo<Conflict[]>(() => {
        if (!showConflicts) return [];

        const allTasks: TaskWithProject[] = projects.flatMap(p =>
            p.tasks.map(t => ({ ...t, projectId: p.id, projectName: p.name, projectColor: p.color }))
        );

        const conflictList: Conflict[] = [];
        const tasksByAssignee: Record<string, TaskWithProject[]> = {};

        allTasks.forEach(task => {
            if (!tasksByAssignee[task.assignee]) {
                tasksByAssignee[task.assignee] = [];
            }
            tasksByAssignee[task.assignee].push(task);
        });

        Object.entries(tasksByAssignee).forEach(([assignee, tasks]) => {
            for (let i = 0; i < tasks.length; i++) {
                for (let j = i + 1; j < tasks.length; j++) {
                    const t1Start = new Date(tasks[i].start);
                    const t1End = new Date(tasks[i].end);
                    const t2Start = new Date(tasks[j].start);
                    const t2End = new Date(tasks[j].end);

                    if (t1Start <= t2End && t2Start <= t1End) {
                        conflictList.push({
                            assignee,
                            tasks: [tasks[i], tasks[j]]
                        });
                    }
                }
            }
        });

        return conflictList;
    }, [projects, showConflicts]);

    // Calculate task position on timeline
    const getTaskPosition = (task: Task): TaskPosition | null => {
        const start = new Date(task.start);
        const end = new Date(task.end);
        const rangeStart = dateRange[0];

        const dayWidth = zoomLevel === 'day' ? 40 : zoomLevel === 'week' ? 20 : 8;
        const totalDays = dateRange.length;

        const startOffset = Math.max(0, Math.floor((start.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)));
        const endOffset = Math.min(totalDays, Math.ceil((end.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)));

        if (startOffset >= totalDays || endOffset <= 0) return null;

        return {
            left: startOffset * dayWidth,
            width: Math.max((endOffset - startOffset) * dayWidth, 20)
        };
    };

    const navigateTime = (direction: number): void => {
        const newStart = new Date(viewStart);
        const days = zoomLevel === 'day' ? 7 : zoomLevel === 'week' ? 14 : 30;
        newStart.setDate(newStart.getDate() + (direction * days));
        setViewStart(newStart);
    };

    const goToToday = (): void => {
        const today = new Date();
        today.setDate(today.getDate() - 7);
        setViewStart(today);
    };

    const getCollaborator = (id: string): Collaborator => collaborators.find(c => c.id === id) || {
        id,
        name: id.toUpperCase(),
        initials: id.substring(0, 2).toUpperCase(),
        color: '#6B7280'
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isWeekend = (date: Date): boolean => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const dayWidth = zoomLevel === 'day' ? 40 : zoomLevel === 'week' ? 20 : 8;

    // Stats
    const stats = useMemo<Stats>(() => {
        const allTasks = projects.flatMap(p => p.tasks);
        return {
            total: allTasks.length,
            completed: allTasks.filter(t => t.progress === 100).length,
            inProgress: allTasks.filter(t => t.progress > 0 && t.progress < 100).length,
            notStarted: allTasks.filter(t => t.progress === 0).length,
            overdue: allTasks.filter(t => {
                const end = new Date(t.end);
                return end < new Date() && t.progress < 100;
            }).length
        };
    }, [projects]);

    return (
        <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col mx-4 ${expandedView ? 'fixed inset-4 z-[90]' : 'w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[90vh]'
            }`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Cross-Project Timeline</h3>
                            <p className="text-sm text-indigo-100">
                                {projects.length} projects • {stats.total} tasks
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setExpandedView(!expandedView)}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            title={expandedView ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {expandedView ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-300" />
                        <span>{stats.completed} done</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{stats.inProgress} in progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                        <span>{stats.notStarted} not started</span>
                    </div>
                    {stats.overdue > 0 && (
                        <div className="flex items-center gap-1 text-red-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{stats.overdue} overdue</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="p-3 border-b border-gray-200 space-y-2">
                <div className="flex flex-wrap gap-2">
                    {/* Search */}
                    <div className="flex-1 min-w-[150px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Time Navigation */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => navigateTime(-1)}
                            className="p-1.5 hover:bg-white rounded transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-2 py-1 text-xs font-medium hover:bg-white rounded transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigateTime(1)}
                            className="p-1.5 hover:bg-white rounded transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Zoom Level */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        {(['day', 'week', 'month'] as ZoomLevel[]).map(level => (
                            <button
                                key={level}
                                onClick={() => setZoomLevel(level)}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${zoomLevel === level ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                                    }`}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Filter className="w-4 h-4 text-gray-400" />

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-2 py-1 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    <select
                        value={filterAssignee}
                        onChange={(e) => setFilterAssignee(e.target.value)}
                        className="px-2 py-1 text-xs text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Assignees</option>
                        {collaborators.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowConflicts(!showConflicts)}
                        className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${showConflicts ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        <AlertTriangle className="w-3 h-3" />
                        Conflicts ({conflicts.length})
                    </button>

                    {/* Project toggles */}
                    <div className="flex-1" />
                    <div className="flex gap-1">
                        {projects.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    const newHidden = new Set(hiddenProjects);
                                    if (newHidden.has(p.id)) {
                                        newHidden.delete(p.id);
                                    } else {
                                        newHidden.add(p.id);
                                    }
                                    setHiddenProjects(newHidden);
                                }}
                                className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${hiddenProjects.has(p.id) ? 'bg-gray-100 text-gray-400' : ''
                                    }`}
                                style={{
                                    backgroundColor: hiddenProjects.has(p.id) ? undefined : `${p.color}20`,
                                    color: hiddenProjects.has(p.id) ? undefined : p.color
                                }}
                            >
                                {hiddenProjects.has(p.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span className="hidden sm:inline">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conflict Alerts */}
            {showConflicts && conflicts.length > 0 && (
                <div className="p-2 bg-red-50 border-b border-red-100">
                    <div className="flex items-start gap-2 text-xs text-red-700">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-medium">Resource Conflicts:</span>
                            {conflicts.slice(0, 3).map((conflict, i) => {
                                const person = getCollaborator(conflict.assignee);
                                return (
                                    <span key={i} className="ml-1">
                                        {person.name} has overlapping tasks ({conflict.tasks.map(t => t.name).join(' & ')})
                                        {i < Math.min(conflicts.length - 1, 2) && ';'}
                                    </span>
                                );
                            })}
                            {conflicts.length > 3 && <span className="ml-1">+{conflicts.length - 3} more</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="flex-1 overflow-auto">
                <div className="min-w-max">
                    {/* Date Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 z-10 flex">
                        <div className="w-48 flex-shrink-0 p-2 border-r border-gray-200 bg-gray-50 font-medium text-xs text-gray-600">
                            Project / Task
                        </div>
                        <div className="flex">
                            {dateRange.map((date, i) => {
                                const showLabel = zoomLevel === 'day' ||
                                    (zoomLevel === 'week' && date.getDay() === 1) ||
                                    (zoomLevel === 'month' && date.getDate() === 1);

                                return (
                                    <div
                                        key={i}
                                        className={`flex-shrink-0 border-r border-gray-100 text-center text-[10px] py-1 ${isToday(date) ? 'bg-indigo-50' : isWeekend(date) ? 'bg-gray-50' : ''
                                            }`}
                                        style={{ width: dayWidth }}
                                    >
                                        {showLabel && (
                                            <span className={isToday(date) ? 'font-bold text-indigo-600' : 'text-gray-500'}>
                                                {formatDate(date)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Projects and Tasks */}
                    {filteredProjects.map(project => (
                        <div key={project.id} className="border-b border-gray-100">
                            {/* Project Header */}
                            <div className="flex bg-gray-50 sticky left-0">
                                <div className="w-48 flex-shrink-0 p-2 border-r border-gray-200 flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: project.color }}
                                    />
                                    <span className="font-medium text-sm truncate">{project.name}</span>
                                    <span className="text-xs text-gray-400">({project.tasks.length})</span>
                                </div>
                                <div style={{ width: dateRange.length * dayWidth }} className="bg-gray-50" />
                            </div>

                            {/* Tasks */}
                            {project.tasks.map(task => {
                                const position = getTaskPosition(task);
                                const assignee = getCollaborator(task.assignee);
                                const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;

                                return (
                                    <div key={task.id} className="flex hover:bg-gray-50">
                                        <div className="w-48 flex-shrink-0 p-2 border-r border-gray-200 flex items-center gap-2">
                                            <div
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                                                style={{ backgroundColor: assignee.color }}
                                                title={assignee.name}
                                            >
                                                {assignee.initials}
                                            </div>
                                            <span className="text-sm truncate flex-1">{task.name}</span>
                                            <span className={`text-[9px] px-1 py-0.5 rounded ${priorityStyle.bg} ${priorityStyle.text}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="relative" style={{ width: dateRange.length * dayWidth, height: 36 }}>
                                            {/* Today line */}
                                            {dateRange.some((d) => isToday(d)) && (
                                                <div
                                                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-10"
                                                    style={{
                                                        left: dateRange.findIndex(d => isToday(d)) * dayWidth + dayWidth / 2
                                                    }}
                                                />
                                            )}

                                            {/* Task bar */}
                                            {position && (
                                                <div
                                                    className="absolute top-1 h-7 rounded-md cursor-pointer transition-all hover:shadow-md group"
                                                    style={{
                                                        left: position.left,
                                                        width: position.width,
                                                        backgroundColor: project.color
                                                    }}
                                                >
                                                    {/* Progress fill */}
                                                    <div
                                                        className="absolute inset-0 rounded-md opacity-30 bg-black"
                                                        style={{ width: `${100 - task.progress}%`, right: 0, left: 'auto' }}
                                                    />

                                                    {/* Progress text */}
                                                    <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-medium">
                                                        {position.width > 40 && `${task.progress}%`}
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20">
                                                        <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                                                            {task.name} • {task.progress}% complete
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                            <Layers className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500">No tasks match your filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                        Showing {formatDate(dateRange[0])} - {formatDate(dateRange[dateRange.length - 1])}
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-1 bg-indigo-500 rounded" />
                            <span>Today</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-200 rounded-full" />
                            <span>Not started</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full opacity-50" />
                            <span>In progress</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
