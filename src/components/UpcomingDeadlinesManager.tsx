import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import {
    ArrowLeft,
    Search,
    Filter,
    Grid3X3,
    List,
    Calendar,
    Clock,
    AlertTriangle,
    Bell,
    TrendingUp,
    ExternalLink,
    MoreVertical,
    CheckCircle,
    Edit2,
    Trash2,
    Download
} from 'lucide-react';

interface AssignedTo {
    name: string;
    initials: string;
    color: string;
}

interface UpcomingTask {
    id: number;
    title: string;
    description: string;
    assignedTo: AssignedTo;
    assignedBy: string;
    project: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    tags: string[];
    dueDate: string;
    createdAt: string;
    estimatedTime: string;
    progress: number;
    status: 'in-progress' | 'not-started' | 'blocked';
    complexity: string;
    urgencyLevel: 'critical' | 'moderate' | 'low';
    attachments: string[];
    dependencies: string[];
    timeUntilDue: string;
    isOverdue: boolean;
    reminderSet: boolean;
    blockers: string[];
}

interface FeedbackMessage {
    message: string;
    type: 'success' | 'error';
}

interface Stats {
    total: number;
    overdue: number;
    dueToday: number;
    critical: number;
    inProgress: number;
    avgProgress: number;
}

const UpcomingDeadlinesManager: React.FC = () => {
    const { t } = useLanguage();

    const [showEditTaskModal, setShowEditTaskModal] = useState<boolean>(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const exportToCSV = (): void => {
        const headers = ['Title', 'Description', 'Assigned To', 'Project', 'Priority', 'Category', 'Tags', 'Due Date', 'Status', 'Days Remaining', 'Urgency'];

        const csvRows = upcomingTasks.map(task => [
            `"${task.title.replace(/"/g, '""')}"`,
            `"${task.description.replace(/"/g, '""')}"`,
            `"${task.assignedTo.name}"`,
            `"${task.project}"`,
            task.priority,
            task.category,
            `"${task.tags.join(', ')}"`,
            new Date(task.dueDate).toLocaleString(),
            task.status,
            task.timeUntilDue,
            task.urgencyLevel
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `upcoming-deadlines-${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([
        {
            id: 1,
            title: 'API integration testing',
            description: 'Complete comprehensive testing of the new API integration with third-party services',
            assignedTo: { name: 'John Doe', initials: 'JD', color: '#3B82F6' },
            assignedBy: 'Maria Rodriguez',
            project: 'Project Alpha',
            priority: 'high',
            category: 'Testing',
            tags: ['API', 'Integration', 'Testing'],
            dueDate: '2024-01-16T23:59:59Z',
            createdAt: '2024-01-10T09:00:00Z',
            estimatedTime: '8 hours',
            progress: 75,
            status: 'in-progress',
            complexity: 'high',
            urgencyLevel: 'critical',
            attachments: ['api-specs.pdf', 'test-plan.md'],
            dependencies: ['Database setup', 'Environment configuration'],
            timeUntilDue: 'Today',
            isOverdue: false,
            reminderSet: true,
            blockers: []
        },
        {
            id: 2,
            title: 'Create social media campaign',
            description: 'Design and develop social media campaign materials for the Q1 product launch',
            assignedTo: { name: 'Maria Rodriguez', initials: 'MR', color: '#F59E0B' },
            assignedBy: 'Alex Kim',
            project: 'Project Delta',
            priority: 'high',
            category: 'Marketing',
            tags: ['Social Media', 'Campaign', 'Q1 Launch'],
            dueDate: '2024-01-16T17:00:00Z',
            createdAt: '2024-01-08T14:30:00Z',
            estimatedTime: '12 hours',
            progress: 45,
            status: 'in-progress',
            complexity: 'medium',
            urgencyLevel: 'critical',
            attachments: ['brand-guidelines.pdf', 'campaign-brief.docx'],
            dependencies: ['Brand approval', 'Content review'],
            timeUntilDue: 'Today',
            isOverdue: false,
            reminderSet: true,
            blockers: ['Waiting for brand team approval']
        },
        {
            id: 3,
            title: 'Update project timeline',
            description: 'Revise and update the project timeline based on recent scope changes',
            assignedTo: { name: 'Taylor Smith', initials: 'TS', color: '#8B5CF6' },
            assignedBy: 'John Doe',
            project: 'Project Beta',
            priority: 'medium',
            category: 'Planning',
            tags: ['Timeline', 'Planning', 'Scope'],
            dueDate: '2024-01-17T23:59:59Z',
            createdAt: '2024-01-12T10:15:00Z',
            estimatedTime: '4 hours',
            progress: 20,
            status: 'not-started',
            complexity: 'low',
            urgencyLevel: 'moderate',
            attachments: ['current-timeline.gantt'],
            dependencies: ['Scope finalization'],
            timeUntilDue: 'Tomorrow',
            isOverdue: false,
            reminderSet: false,
            blockers: []
        },
        {
            id: 4,
            title: 'Security vulnerability patch',
            description: 'Apply critical security patches to the production environment',
            assignedTo: { name: 'David Chen', initials: 'DC', color: '#EF4444' },
            assignedBy: 'Sarah Wilson',
            project: 'Project Alpha',
            priority: 'critical',
            category: 'Security',
            tags: ['Security', 'Patch', 'Production'],
            dueDate: '2024-01-15T23:59:59Z',
            createdAt: '2024-01-14T08:30:00Z',
            estimatedTime: '3 hours',
            progress: 90,
            status: 'in-progress',
            complexity: 'high',
            urgencyLevel: 'critical',
            attachments: ['security-report.pdf'],
            dependencies: ['Maintenance window approval'],
            timeUntilDue: 'Overdue by 1 day',
            isOverdue: true,
            reminderSet: true,
            blockers: []
        }
    ]);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [dueDateFilter, setDueDateFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const showFeedback = (message: string, type: 'success' | 'error' = 'success'): void => {
        setFeedbackMessage({ message, type });
        setTimeout(() => setFeedbackMessage(null), 3000);
    };

    const handleEdit = (task: UpcomingTask): void => {
        setEditingTaskId(task.id);
        setShowEditTaskModal(true);
        setOpenMenuId(null);
    };

    const handleDelete = (taskId: number, taskTitle: string): void => {
        if (globalThis.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
            setUpcomingTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
            showFeedback('Task deleted successfully!', 'error');
            setOpenMenuId(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (openMenuId && !(event.target as Element).closest('.relative')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openMenuId]);

    const filteredTasks = upcomingTasks
        .filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProject = selectedProject === 'all' || task.project === selectedProject;
            const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
            const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;

            const taskDue = new Date(task.dueDate);
            const now = new Date();
            let matchesDueDate = true;

            if (dueDateFilter === 'overdue') {
                matchesDueDate = task.isOverdue;
            } else if (dueDateFilter === 'today') {
                matchesDueDate = taskDue.toDateString() === now.toDateString();
            } else if (dueDateFilter === 'tomorrow') {
                const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                matchesDueDate = taskDue.toDateString() === tomorrow.toDateString();
            } else if (dueDateFilter === 'this-week') {
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                matchesDueDate = taskDue <= weekFromNow && taskDue >= now;
            }

            return matchesSearch && matchesProject && matchesPriority && matchesStatus && matchesDueDate;
        })
        .sort((a, b) => {
            let aValue: Date | number | string = a[sortBy as keyof UpcomingTask] as string;
            let bValue: Date | number | string = b[sortBy as keyof UpcomingTask] as string;

            if (sortBy === 'dueDate') {
                aValue = new Date(aValue as string);
                bValue = new Date(bValue as string);
            } else if (sortBy === 'progress') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const projects = [...new Set(upcomingTasks.map(task => task.project))];

    const stats: Stats = {
        total: upcomingTasks.length,
        overdue: upcomingTasks.filter(t => t.isOverdue).length,
        dueToday: upcomingTasks.filter(t => {
            const today = new Date().toDateString();
            return new Date(t.dueDate).toDateString() === today;
        }).length,
        critical: upcomingTasks.filter(t => t.urgencyLevel === 'critical').length,
        inProgress: upcomingTasks.filter(t => t.status === 'in-progress').length,
        avgProgress: Math.round(upcomingTasks.reduce((sum, t) => sum + t.progress, 0) / upcomingTasks.length)
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'critical': return 'text-red-700 bg-red-100 border-red-200';
            case 'high': return 'text-red-600 bg-red-100 border-red-200';
            case 'medium': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'low': return 'text-green-600 bg-green-100 border-green-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'in-progress': return 'text-blue-600 bg-blue-100';
            case 'not-started': return 'text-gray-600 bg-gray-100';
            case 'blocked': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getDueDateColor = (task: UpcomingTask): string => {
        if (task.isOverdue) return 'text-red-600';
        if (task.timeUntilDue === 'Today') return 'text-orange-600';
        if (task.timeUntilDue === 'Tomorrow') return 'text-yellow-600';
        return 'text-gray-600';
    };

    const formatDueDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays < 0) return `Overdue by ${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''}`;
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Tomorrow';
        if (diffInDays <= 7) return `In ${diffInDays} days`;
        return date.toLocaleDateString();
    };

    const getUrgencyTopColor = (urgency: string): string => {
        switch (urgency) {
            case 'critical': return 'bg-red-500';
            case 'moderate': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const GridView: React.FC = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTasks.map(task => (
                <div key={task.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
                    <div className={`h-1 ${getUrgencyTopColor(task.urgencyLevel)}`}></div>
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-md" style={{ backgroundColor: task.assignedTo.color }}>
                                    {task.assignedTo.initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{task.title}</h3>
                                    <p className="text-xs text-gray-500 truncate">{task.project}</p>
                                </div>
                            </div>
                            <div className="relative flex-shrink-0">
                                <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}>
                                    <MoreVertical size={14} className="text-gray-400" />
                                </button>
                                {openMenuId === task.id && (
                                    <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                                        <button className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2" onClick={() => handleEdit(task)}>
                                            <Edit2 size={13} />Edit Task
                                        </button>
                                        <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => handleDelete(task.id, task.title)}>
                                            <Trash2 size={13} />Delete Task
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span>
                        </div>
                        <div className="space-y-1.5 mb-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Due:</span>
                                <span className={`font-bold ${getDueDateColor(task)}`}>{formatDueDate(task.dueDate)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Time:</span>
                                <span className="font-medium text-gray-900">{task.estimatedTime}</span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between items-center text-xs mb-1.5">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-bold text-gray-900">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${task.progress >= 75 ? 'bg-green-500' : task.progress >= 50 ? 'bg-blue-500' : task.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${task.progress}%` }}></div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                            <div className="flex flex-wrap gap-1 mb-2">
                                {task.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium">{tag}</span>
                                ))}
                                {task.tags.length > 2 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-medium">+{task.tags.length - 2}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const ListView: React.FC = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Task</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned To</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Project</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">{t('common.status')}</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTasks.map(task => (
                            <tr key={task.id} className={`hover:bg-gray-50 ${task.isOverdue ? 'bg-red-50' : task.timeUntilDue === 'Today' ? 'bg-orange-50' : ''}`}>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        {task.isOverdue && <AlertTriangle size={16} className="text-red-500" />}
                                        {task.reminderSet && <Bell size={14} className="text-blue-500" />}
                                        <div>
                                            <div className="font-medium text-gray-900">{task.title}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: task.assignedTo.color }}>{task.assignedTo.initials}</div>
                                        <span className="text-sm font-medium">{task.assignedTo.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-900">{task.project}</td>
                                <td className="py-4 px-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                                <td className="py-4 px-4">
                                    <div className="text-sm">
                                        <div className={`font-medium ${getDueDateColor(task)}`}>{formatDueDate(task.dueDate)}</div>
                                        <div className="text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${task.progress >= 75 ? 'bg-green-500' : task.progress >= 50 ? 'bg-blue-500' : task.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${task.progress}%` }}></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{task.progress}%</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>{task.status.replace('-', ' ')}</span></td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-green-600"><CheckCircle size={16} /></button>
                                        <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><ExternalLink size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <TopBar showSearch={false} />
            <div className="p-3 md:p-6">
                {feedbackMessage && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
                        <div className={`px-6 py-3 rounded-lg shadow-lg border ${feedbackMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            <p className="font-medium">{feedbackMessage.message}</p>
                        </div>
                    </div>
                )}

                <header className="mb-4 md:mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Link>
                            <div className="flex-1 md:flex-initial min-w-0">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Upcoming Deadlines</h1>
                                <p className="text-sm md:text-base text-gray-500 truncate md:whitespace-normal">Track deadlines and manage priorities</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                            <button onClick={exportToCSV} className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation cursor-pointer">
                                <Download size={16} /><span className="hidden md:inline">Export</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Total Tasks</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p></div><div className="p-2 sm:p-3 bg-blue-100 rounded-lg"><Calendar size={20} className="text-blue-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Overdue</p><p className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdue}</p></div><div className="p-2 sm:p-3 bg-red-100 rounded-lg"><AlertTriangle size={20} className="text-red-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Due Today</p><p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.dueToday}</p></div><div className="p-2 sm:p-3 bg-orange-100 rounded-lg"><Clock size={20} className="text-orange-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Critical</p><p className="text-xl sm:text-2xl font-bold text-red-700">{stats.critical}</p></div><div className="p-2 sm:p-3 bg-red-100 rounded-lg"><AlertTriangle size={20} className="text-red-700" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">In Progress</p><p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.inProgress}</p></div><div className="p-2 sm:p-3 bg-blue-100 rounded-lg"><TrendingUp size={20} className="text-blue-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Avg Progress</p><p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.avgProgress}%</p></div><div className="p-2 sm:p-3 bg-purple-100 rounded-lg"><TrendingUp size={20} className="text-purple-600" /></div></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder={t('common.searchTasks')} value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 placeholder-gray-500" />
                                </div>
                                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-black ${showFilters ? 'bg-gray-50' : ''}`}>
                                    <Filter size={16} />{t('common.filters')}
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <select value={sortBy} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
                                    <option value="dueDate">{t('common.sortBy')} {t('common.dueDate')}</option>
                                    <option value="title">{t('common.sortBy')} {t('common.title')}</option>
                                    <option value="priority">{t('common.sortBy')} {t('common.priority')}</option>
                                    <option value="progress">{t('common.sortBy')} {t('common.progress')}</option>
                                </select>
                                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">{sortOrder === 'asc' ? '↑' : '↓'}</button>
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}><Grid3X3 size={16} /></button>
                                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}><List size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.dueDate')}</label>
                                        <select value={dueDateFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setDueDateFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black">
                                            <option value="all">All Dates</option>
                                            <option value="overdue">Overdue</option>
                                            <option value="today">Today</option>
                                            <option value="tomorrow">Tomorrow</option>
                                            <option value="this-week">This Week</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                                        <select value={selectedProject} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedProject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black">
                                            <option value="all">All Projects</option>
                                            {projects.map(project => (<option key={project} value={project}>{project}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                        <select value={selectedPriority} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black">
                                            <option value="all">All Priorities</option>
                                            <option value="critical">Critical</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>
                                        <select value={selectedStatus} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black">
                                            <option value="all">{t('common.allStatuses')}</option>
                                            <option value="not-started">{t('common.notStarted')}</option>
                                            <option value="in-progress">{t('common.inProgress')}</option>
                                            <option value="blocked">{t('common.blocked')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600">{t('common.showing')} {filteredTasks.length} {t('common.of')} {upcomingTasks.length} {t('common.upcomingTasks')}</p>
                    </div>

                    {viewMode === 'grid' ? <GridView /> : <ListView />}
                </main>
            </div>
        </div>
    );
};

export default UpcomingDeadlinesManager;
