import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import {
    ArrowLeft, Search, Filter, Grid3X3, List, Calendar, Clock, CheckCircle, Award, TrendingUp, Tag, ExternalLink, MoreVertical, Download, Plus, Edit2, Trash2, X
} from 'lucide-react';

interface CompletedBy {
    name: string;
    initials: string;
    color: string;
}

interface CompletedTask {
    id: number;
    title: string;
    description: string;
    completedBy: CompletedBy;
    assignedBy: string;
    project: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    tags: string[];
    completedAt: string;
    dueDate: string;
    timeSpent: string;
    estimatedTime: string;
    status: string;
    complexity: string;
    quality: 'excellent' | 'good' | 'needs-improvement';
    feedback: string;
    attachments: string[];
    completionType: 'early' | 'on-time' | 'late';
}

interface NewTask {
    title: string;
    description: string;
    project: string;
    priority: string;
    category: string;
    dueDate: string;
    estimatedTime: string;
    tags: string[];
}

interface FeedbackMessage {
    message: string;
    type: 'success' | 'error';
}

interface Stats {
    total: number;
    onTime: number;
    early: number;
    late: number;
    avgQuality: number;
    totalTimeSpent: string;
}

const RecentlyCompletedTasksManager: React.FC = () => {
    const { t } = useLanguage();

    const [showEditTaskModal, setShowEditTaskModal] = useState<boolean>(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const exportToCSV = (): void => {
        const headers = ['Title', 'Description', 'Completed By', 'Project', 'Priority', 'Category', 'Tags', 'Completed At', 'Due Date', 'Time Spent', 'Estimated Time', 'Status', 'Complexity', 'Quality'];
        const csvRows = completedTasks.map(task => [
            `"${task.title.replace(/"/g, '""')}"`,
            `"${task.description.replace(/"/g, '""')}"`,
            `"${task.completedBy.name}"`,
            `"${task.project}"`,
            task.priority,
            task.category,
            `"${task.tags.join(', ')}"`,
            new Date(task.completedAt).toLocaleString(),
            new Date(task.dueDate).toLocaleString(),
            task.timeSpent,
            task.estimatedTime,
            task.status,
            task.complexity,
            task.quality
        ]);
        const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `completed-tasks-${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [newTask, setNewTask] = useState<NewTask>({
        title: '', description: '', project: '', priority: 'medium', category: '', dueDate: '', estimatedTime: '', tags: []
    });

    const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([
        {
            id: 1, title: 'Finalize design mockups', description: 'Complete the final design mockups for the new dashboard interface',
            completedBy: { name: 'Alex Kim', initials: 'AK', color: '#10B981' },
            assignedBy: 'Maria Rodriguez', project: 'Project Gamma', priority: 'high', category: 'Design',
            tags: ['UI/UX', 'Responsive', 'Dashboard'], completedAt: '2024-01-15T14:30:00Z', dueDate: '2024-01-15T23:59:59Z',
            timeSpent: '6.5 hours', estimatedTime: '8 hours', status: 'completed', complexity: 'medium', quality: 'excellent',
            feedback: 'Outstanding work on the responsive design.', attachments: ['mockup-v3.fig', 'design-specs.pdf'], completionType: 'on-time'
        },
        {
            id: 2, title: 'Review sprint backlog', description: 'Review and prioritize the sprint backlog items',
            completedBy: { name: 'John Doe', initials: 'JD', color: '#3B82F6' },
            assignedBy: 'Maria Rodriguez', project: 'Project Alpha', priority: 'medium', category: 'Management',
            tags: ['Sprint', 'Planning', 'Backlog'], completedAt: '2024-01-15T10:15:00Z', dueDate: '2024-01-16T17:00:00Z',
            timeSpent: '2 hours', estimatedTime: '3 hours', status: 'completed', complexity: 'low', quality: 'good',
            feedback: 'Good prioritization.', attachments: ['backlog-review.xlsx'], completionType: 'early'
        },
        {
            id: 3, title: 'Database optimization', description: 'Optimize database queries for better performance',
            completedBy: { name: 'Sarah Wilson', initials: 'SW', color: '#06B6D4' },
            assignedBy: 'John Doe', project: 'Project Alpha', priority: 'medium', category: 'Development',
            tags: ['Database', 'Performance', 'Optimization'], completedAt: '2024-01-12T17:30:00Z', dueDate: '2024-01-14T23:59:59Z',
            timeSpent: '7 hours', estimatedTime: '6 hours', status: 'completed', complexity: 'high', quality: 'excellent',
            feedback: 'Query performance improved by 60%.', attachments: ['performance-report.pdf'], completionType: 'early'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [selectedCompletionType, setSelectedCompletionType] = useState<string>('all');
    const [selectedQuality, setSelectedQuality] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('completedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const showFeedback = (message: string, type: 'success' | 'error' = 'success'): void => {
        setFeedbackMessage({ message, type });
        setTimeout(() => setFeedbackMessage(null), 3000);
    };

    const handleEdit = (task: CompletedTask): void => {
        setEditingTaskId(task.id);
        setShowEditTaskModal(true);
        setOpenMenuId(null);
    };

    const handleDelete = (taskId: number, taskTitle: string): void => {
        if (globalThis.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
            setCompletedTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
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

    const filteredTasks = completedTasks
        .filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.completedBy.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProject = selectedProject === 'all' || task.project === selectedProject;
            const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
            const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
            const matchesCompletionType = selectedCompletionType === 'all' || task.completionType === selectedCompletionType;
            const matchesQuality = selectedQuality === 'all' || task.quality === selectedQuality;

            const taskDate = new Date(task.completedAt);
            const now = new Date();
            let matchesDate = true;
            if (dateRange === 'today') {
                matchesDate = taskDate.toDateString() === now.toDateString();
            } else if (dateRange === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = taskDate >= weekAgo;
            } else if (dateRange === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                matchesDate = taskDate >= monthAgo;
            }

            return matchesSearch && matchesProject && matchesCategory && matchesPriority && matchesCompletionType && matchesQuality && matchesDate;
        })
        .sort((a, b) => {
            let aValue: Date | string = a[sortBy as keyof CompletedTask] as string;
            let bValue: Date | string = b[sortBy as keyof CompletedTask] as string;
            if (sortBy === 'completedAt') {
                aValue = new Date(aValue as string);
                bValue = new Date(bValue as string);
            }
            if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
            return aValue < bValue ? 1 : -1;
        });

    const projects = [...new Set(completedTasks.map(task => task.project))];
    const categories = [...new Set(completedTasks.map(task => task.category))];

    const stats: Stats = {
        total: completedTasks.length,
        onTime: completedTasks.filter(t => t.completionType === 'on-time').length,
        early: completedTasks.filter(t => t.completionType === 'early').length,
        late: completedTasks.filter(t => t.completionType === 'late').length,
        avgQuality: completedTasks.filter(t => t.quality === 'excellent').length,
        totalTimeSpent: completedTasks.reduce((sum, t) => sum + parseFloat(t.timeSpent), 0).toFixed(1)
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getCompletionTypeColor = (type: string): string => {
        switch (type) {
            case 'early': return 'text-green-600 bg-green-100';
            case 'on-time': return 'text-blue-600 bg-blue-100';
            case 'late': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getQualityColor = (quality: string): string => {
        switch (quality) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'needs-improvement': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return hours === 0 ? 'Just now' : `${hours} hours ago`;
        } else if (diffInHours < 48) {
            return t('common.yesterday');
        }
        return date.toLocaleDateString();
    };

    const getQualityTopColor = (quality: string): string => {
        switch (quality) {
            case 'excellent': return 'bg-green-500';
            case 'good': return 'bg-blue-500';
            case 'needs-improvement': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const GridView: React.FC = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTasks.map(task => (
                <div key={task.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
                    <div className={`h-1 ${getQualityTopColor(task.quality)}`}></div>
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-md" style={{ backgroundColor: task.completedBy.color }}>{task.completedBy.initials}</div>
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
                                        <button className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2" onClick={() => handleEdit(task)}><Edit2 size={13} />Edit Task</button>
                                        <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => handleDelete(task.id, task.title)}><Trash2 size={13} />Delete Task</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getCompletionTypeColor(task.completionType)}`}>{task.completionType}</span>
                        </div>
                        <div className="space-y-1.5 mb-3">
                            <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Time:</span><span className="font-bold text-gray-900">{task.timeSpent}</span></div>
                            <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Completed:</span><span className="font-medium text-gray-900">{formatDate(task.completedAt)}</span></div>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                            <div className="flex flex-wrap gap-1 mb-2">
                                {task.tags.slice(0, 2).map(tag => (<span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium">{tag}</span>))}
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
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Completed By</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Project</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Quality</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Time Spent</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Completed</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="py-4 px-4"><div><div className="font-medium text-gray-900">{task.title}</div><div className="text-sm text-gray-500 line-clamp-1">{task.description}</div></div></td>
                                <td className="py-4 px-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: task.completedBy.color }}>{task.completedBy.initials}</div><span className="text-sm font-medium">{task.completedBy.name}</span></div></td>
                                <td className="py-4 px-4 text-sm text-gray-900">{task.project}</td>
                                <td className="py-4 px-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                                <td className="py-4 px-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(task.quality)}`}>{task.quality}</span></td>
                                <td className="py-4 px-4 text-sm text-gray-900">{task.timeSpent}</td>
                                <td className="py-4 px-4"><div className="text-sm"><div className="text-gray-900">{formatDate(task.completedAt)}</div><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCompletionTypeColor(task.completionType)}`}>{task.completionType}</span></div></td>
                                <td className="py-4 px-4 text-right"><button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><ExternalLink size={16} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        console.log('New task:', newTask);
        setShowAddTaskModal(false);
        setNewTask({ title: '', description: '', project: '', priority: 'medium', category: '', dueDate: '', estimatedTime: '', tags: [] });
    };

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
                            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation"><ArrowLeft size={20} className="text-gray-600" /></Link>
                            <div className="flex-1 md:flex-initial min-w-0">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Recently Completed Tasks</h1>
                                <p className="text-sm md:text-base text-gray-500 truncate md:whitespace-normal">Track completed work and performance metrics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                            <button onClick={exportToCSV} className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation cursor-pointer"><Download size={16} /><span className="hidden md:inline">Export</span></button>
                            <button className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation cursor-pointer" onClick={() => setShowAddTaskModal(true)}><Plus size={16} /><span className="hidden md:inline">Add Task</span></button>
                        </div>
                    </div>
                </header>

                <main>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Total Completed</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p></div><div className="p-2 sm:p-3 bg-blue-100 rounded-lg"><CheckCircle size={20} className="text-blue-600" /></div></div></div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">On Time</p><p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.onTime}</p></div><div className="p-2 sm:p-3 bg-blue-100 rounded-lg"><Clock size={20} className="text-blue-600" /></div></div></div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Early</p><p className="text-xl sm:text-2xl font-bold text-green-600">{stats.early}</p></div><div className="p-2 sm:p-3 bg-green-100 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div></div></div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Excellent Quality</p><p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.avgQuality}</p></div><div className="p-2 sm:p-3 bg-purple-100 rounded-lg"><Award size={20} className="text-purple-600" /></div></div></div>
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600">Total Hours</p><p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.totalTimeSpent}</p></div><div className="p-2 sm:p-3 bg-orange-100 rounded-lg"><Clock size={20} className="text-orange-600" /></div></div></div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 placeholder-gray-500" />
                                </div>
                                <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 ${showFilters ? 'bg-gray-50' : ''}`}><Filter size={16} />{t('common.filters')}</button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                <select value={sortBy} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm md:text-base min-w-0 flex-shrink">
                                    <option value="completedAt">{t('common.date')}</option>
                                    <option value="title">{t('common.title')}</option>
                                    <option value="priority">{t('common.priority')}</option>
                                    <option value="quality">{t('common.quality')}</option>
                                    <option value="timeSpent">{t('common.time')}</option>
                                </select>
                                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex-shrink-0">{sortOrder === 'asc' ? '↑' : '↓'}</button>
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}><Grid3X3 size={16} /></button>
                                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}><List size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('common.dateRange')}</label><select value={dateRange} onChange={(e: ChangeEvent<HTMLSelectElement>) => setDateRange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">{t('common.allTime')}</option><option value="today">{t('activity.today')}</option><option value="week">{t('common.last7Days')}</option><option value="month">{t('common.last30Days')}</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Project</label><select value={selectedProject} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedProject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Projects</option>{projects.map(project => (<option key={project} value={project}>{project}</option>))}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><select value={selectedCategory} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Categories</option>{categories.map(category => (<option key={category} value={category}>{category}</option>))}</select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Priority</label><select value={selectedPriority} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Completion</label><select value={selectedCompletionType} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCompletionType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Types</option><option value="early">Early</option><option value="on-time">On Time</option><option value="late">Late</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Quality</label><select value={selectedQuality} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedQuality(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"><option value="all">All Quality Levels</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="needs-improvement">Needs Improvement</option></select></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-4"><p className="text-sm text-gray-600">{t('common.showing')} {filteredTasks.length} {t('common.of')} {completedTasks.length} {t('common.completedTasks')}</p></div>

                    {viewMode === 'grid' ? <GridView /> : <ListView />}
                </main>

                {showAddTaskModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div><h2 className="text-xl font-bold text-gray-900">Add New Task</h2><p className="text-sm text-gray-500">Create a new task to track</p></div>
                                <button onClick={() => setShowAddTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><X size={20} className="text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleFormSubmit} className="p-6">
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Task Title <span className="text-red-500">*</span></label><input type="text" required value={newTask.title} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g., Design new landing page" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div>
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Description</label><textarea value={newTask.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Describe the task details..." rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label><select required value={newTask.project} onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewTask({ ...newTask, project: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"><option value="">Select a project</option><option value="Project Alpha">Project Alpha</option><option value="Project Beta">Project Beta</option><option value="Project Gamma">Project Gamma</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label><select required value={newTask.category} onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewTask({ ...newTask, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"><option value="">Select a category</option><option value="Design">Design</option><option value="Development">Development</option><option value="Management">Management</option></select></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Priority <span className="text-red-500">*</span></label><select required value={newTask.priority} onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewTask({ ...newTask, priority: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Due Date <span className="text-red-500">*</span></label><input type="date" required value={newTask.dueDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, dueDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div>
                                </div>
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label><input type="text" value={newTask.estimatedTime} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, estimatedTime: e.target.value })} placeholder="e.g., 4 hours" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div>
                                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label><input type="text" value={newTask.tags.join(', ')} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })} placeholder="e.g., UI/UX, Design, Responsive" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" /></div>
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button type="button" onClick={() => setShowAddTaskModal(false)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium cursor-pointer">Cancel</button>
                                    <button type="submit" className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center gap-2 cursor-pointer"><Plus size={18} />Create Task</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentlyCompletedTasksManager;
