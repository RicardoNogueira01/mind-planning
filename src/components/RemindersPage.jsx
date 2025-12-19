import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import {
    ArrowLeft,
    Plus,
    Bell,
    Calendar,
    Clock,
    Trash2,
    Edit2,
    Check,
    X,
    AlertCircle,
    CheckCircle,
    Search,
    Filter
} from 'lucide-react';

const RemindersPage = () => {
    const { t } = useLanguage();
    const [reminders, setReminders] = useState([
        {
            id: 1,
            title: 'Team Meeting Preparation',
            description: 'Prepare slides for quarterly review meeting',
            date: '2024-12-20',
            time: '09:00',
            priority: 'high',
            completed: false,
            notified: false
        },
        {
            id: 2,
            title: 'Submit Expense Report',
            description: 'Submit Q4 expense report to finance',
            date: '2024-12-22',
            time: '17:00',
            priority: 'medium',
            completed: false,
            notified: false
        },
        {
            id: 3,
            title: 'Code Review',
            description: 'Review pull requests from team members',
            date: '2024-12-19',
            time: '14:00',
            priority: 'high',
            completed: true,
            notified: true
        },
        {
            id: 4,
            title: 'Update Documentation',
            description: 'Update API documentation for new endpoints',
            date: '2024-12-25',
            time: '10:00',
            priority: 'low',
            completed: false,
            notified: false
        }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        priority: 'medium'
    });

    // Check for reminders that need notifications
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();

            reminders.forEach(reminder => {
                if (reminder.completed || reminder.notified) return;

                const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
                const timeDiff = reminderDateTime - now;

                // Notify 15 minutes before
                if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
                    showNotification(reminder);
                    markAsNotified(reminder.id);
                }
            });
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Check immediately

        return () => clearInterval(interval);
    }, [reminders]);

    const showNotification = (reminder) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Reminder Alert! 🔔', {
                body: `${reminder.title}\n${reminder.description}`,
                icon: '/favicon.ico',
                tag: `reminder-${reminder.id}`
            });
        }
    };

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const markAsNotified = (id) => {
        setReminders(prev => prev.map(r =>
            r.id === id ? { ...r, notified: true } : r
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingReminder) {
            setReminders(prev => prev.map(r =>
                r.id === editingReminder.id
                    ? { ...r, ...formData, notified: false }
                    : r
            ));
        } else {
            const newReminder = {
                id: Math.max(...reminders.map(r => r.id), 0) + 1,
                ...formData,
                completed: false,
                notified: false
            };
            setReminders(prev => [...prev, newReminder]);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            date: '',
            time: '',
            priority: 'medium'
        });
        setEditingReminder(null);
        setShowAddModal(false);
    };

    const handleEdit = (reminder) => {
        setEditingReminder(reminder);
        setFormData({
            title: reminder.title,
            description: reminder.description,
            date: reminder.date,
            time: reminder.time,
            priority: reminder.priority
        });
        setShowAddModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this reminder?')) {
            setReminders(prev => prev.filter(r => r.id !== id));
        }
    };

    const toggleComplete = (id) => {
        setReminders(prev => prev.map(r =>
            r.id === id ? { ...r, completed: !r.completed } : r
        ));
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const isOverdue = (reminder) => {
        if (reminder.completed) return false;
        const now = new Date();
        const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
        return reminderDate < now;
    };

    const filteredReminders = reminders
        .filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPriority = filterPriority === 'all' || r.priority === filterPriority;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'completed' && r.completed) ||
                (filterStatus === 'pending' && !r.completed);
            return matchesSearch && matchesPriority && matchesStatus;
        })
        .sort((a, b) => {
            // Sort by date/time
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

    const stats = {
        total: reminders.length,
        pending: reminders.filter(r => !r.completed).length,
        completed: reminders.filter(r => r.completed).length,
        overdue: reminders.filter(r => isOverdue(r)).length
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <TopBar showSearch={false} />

            <div className="p-4 md:p-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100">
                                <ArrowLeft size={20} className="text-gray-700" strokeWidth={2} />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
                                <p className="text-sm text-gray-500 mt-1">Manage your personal reminders and notifications</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus size={16} />
                            New Reminder
                        </button>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Bell size={20} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500 font-medium">Total Reminders</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        <p className="text-xs text-gray-500 font-medium">Pending</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        <p className="text-xs text-gray-500 font-medium">Completed</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertCircle size={20} className="text-red-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                        <p className="text-xs text-gray-500 font-medium">Overdue</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reminders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="all">All Priorities</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Reminders List */}
                <div className="space-y-3">
                    {filteredReminders.length > 0 ? (
                        filteredReminders.map(reminder => (
                            <div
                                key={reminder.id}
                                className={`bg-white rounded-xl shadow-sm border transition-all ${reminder.completed
                                        ? 'border-gray-200 opacity-60'
                                        : isOverdue(reminder)
                                            ? 'border-red-200 bg-red-50/30'
                                            : 'border-gray-100 hover:shadow-md'
                                    }`}
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleComplete(reminder.id)}
                                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${reminder.completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 hover:border-green-500'
                                                }`}
                                        >
                                            {reminder.completed && <Check size={14} className="text-white" />}
                                        </button>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h3 className={`font-semibold text-gray-900 ${reminder.completed ? 'line-through' : ''}`}>
                                                    {reminder.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                                                    {reminder.priority}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-3">{reminder.description}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    <span>{new Date(reminder.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    <span>{reminder.time}</span>
                                                </div>
                                                {isOverdue(reminder) && !reminder.completed && (
                                                    <span className="flex items-center gap-1 text-red-600 font-medium">
                                                        <AlertCircle size={14} />
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(reminder)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} className="text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reminder.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No reminders found</p>
                            <p className="text-sm text-gray-400 mt-1">Create a new reminder to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Enter reminder title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                                        rows={3}
                                        placeholder="Enter reminder description"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                                    >
                                        {editingReminder ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RemindersPage;
