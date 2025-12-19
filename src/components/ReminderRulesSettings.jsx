/**
 * Reminder Rules Settings Page
 * 
 * Configure deadline reminders and overdue alerts
 * US-1.1.1 and US-1.1.2 implementation
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Bell,
    Clock,
    Users,
    Mail,
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Shield,
    Calendar,
    TrendingUp,
} from 'lucide-react';

// Mock data for development (replace with API calls)
const getMockRules = () => [
    {
        id: '1',
        name: '7-Day Deadline Warning',
        description: 'Warn task owners 7 days before deadline',
        daysBefore: 7,
        notifyOwner: true,
        notifyManager: false,
        notifyCreator: false,
        sendEmail: false,
        sendInApp: true,
        isActive: true,
    },
    {
        id: '2',
        name: '3-Day Deadline Reminder',
        description: 'Remind task owners 3 days before deadline',
        daysBefore: 3,
        notifyOwner: true,
        notifyManager: false,
        notifyCreator: false,
        sendEmail: false,
        sendInApp: true,
        isActive: true,
    },
    {
        id: '3',
        name: '1-Day Urgent Reminder',
        description: 'Urgent reminder 1 day before deadline',
        daysBefore: 1,
        notifyOwner: true,
        notifyManager: true,
        notifyCreator: false,
        sendEmail: true,
        sendInApp: true,
        isActive: true,
    },
    {
        id: '4',
        name: 'Overdue Escalation',
        description: 'Escalate overdue tasks to manager after 24 hours',
        daysBefore: 0,
        notifyOwner: true,
        notifyManager: true,
        notifyCreator: false,
        escalationHours: 24,
        sendEmail: true,
        sendInApp: true,
        isActive: true,
    },
];

const getMockStats = () => ({
    totalOverdue: 6,
    dueToday: 3,
    dueThisWeek: 12,
    remindersSentToday: 8,
    activeRules: 4,
});

export default function ReminderRulesSettings() {
    const [rules, setRules] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        daysBefore: 3,
        notifyOwner: true,
        notifyManager: false,
        notifyCreator: false,
        sendEmail: false,
        sendInApp: true,
        escalationHours: null,
    });

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // In production, use API calls
                // const rulesRes = await fetch('/api/reminders/rules');
                // const statsRes = await fetch('/api/reminders/stats');

                // Mock data for now
                setRules(getMockRules());
                setStats(getMockStats());
            } catch (error) {
                console.error('Failed to load reminder settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleAddRule = () => {
        setFormData({
            name: '',
            description: '',
            daysBefore: 3,
            notifyOwner: true,
            notifyManager: false,
            notifyCreator: false,
            sendEmail: false,
            sendInApp: true,
            escalationHours: null,
        });
        setEditingRule(null);
        setShowAddModal(true);
    };

    const handleEditRule = (rule) => {
        setFormData({
            name: rule.name,
            description: rule.description || '',
            daysBefore: rule.daysBefore,
            notifyOwner: rule.notifyOwner,
            notifyManager: rule.notifyManager,
            notifyCreator: rule.notifyCreator || false,
            sendEmail: rule.sendEmail,
            sendInApp: rule.sendInApp,
            escalationHours: rule.escalationHours || null,
        });
        setEditingRule(rule);
        setShowAddModal(true);
    };

    const handleSaveRule = () => {
        if (editingRule) {
            // Update existing rule
            setRules(prev => prev.map(r =>
                r.id === editingRule.id ? { ...r, ...formData } : r
            ));
        } else {
            // Add new rule
            setRules(prev => [...prev, {
                ...formData,
                id: Date.now().toString(),
                isActive: true,
            }]);
        }
        setShowAddModal(false);
        setEditingRule(null);
    };

    const handleDeleteRule = (ruleId) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            setRules(prev => prev.filter(r => r.id !== ruleId));
        }
    };

    const handleToggleRule = (ruleId) => {
        setRules(prev => prev.map(r =>
            r.id === ruleId ? { ...r, isActive: !r.isActive } : r
        ));
    };

    const handleRunNow = async () => {
        try {
            // In production: await fetch('/api/reminders/run-job', { method: 'POST' });
            alert('Reminder job started! Check console for results.');
        } catch (error) {
            console.error('Failed to run reminder job:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/settings"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-700" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Bell className="text-indigo-600" size={20} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Reminder Settings</h1>
                                    <p className="text-sm text-gray-500">Configure your deadline reminders</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRunNow}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Run Now
                            </button>
                            <button
                                onClick={handleAddRule}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Rule
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-red-600 mb-2">
                                <AlertTriangle size={18} />
                                <span className="text-sm font-medium">Overdue</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOverdue}</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-orange-600 mb-2">
                                <Clock size={18} />
                                <span className="text-sm font-medium">Due Today</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.dueToday}</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <Calendar size={18} />
                                <span className="text-sm font-medium">Due This Week</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.dueThisWeek}</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <Bell size={18} />
                                <span className="text-sm font-medium">Sent Today</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.remindersSentToday}</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                <TrendingUp size={18} />
                                <span className="text-sm font-medium">Active Rules</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
                        </div>
                    </div>
                )}

                {/* Rules List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Reminder Rules</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure when and how reminders are sent for approaching deadlines
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {rules.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No reminder rules</h3>
                                <p className="text-gray-500 mb-4">
                                    Create your first reminder rule to start getting notified about deadlines
                                </p>
                                <button
                                    onClick={handleAddRule}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Rule
                                </button>
                            </div>
                        ) : (
                            rules.map(rule => (
                                <div key={rule.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            {/* Days Badge */}
                                            <div className={`
                        w-14 h-14 rounded-xl flex flex-col items-center justify-center
                        ${rule.daysBefore === 0
                                                    ? 'bg-red-100 text-red-600'
                                                    : rule.daysBefore === 1
                                                        ? 'bg-orange-100 text-orange-600'
                                                        : 'bg-blue-100 text-blue-600'
                                                }
                      `}>
                                                <span className="text-lg font-bold">{rule.daysBefore}</span>
                                                <span className="text-[10px] font-medium uppercase">
                                                    {rule.daysBefore === 0 ? 'OVR' : 'days'}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                                                    {!rule.isActive && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{rule.description}</p>

                                                {/* Notification targets */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {rule.notifyOwner && (
                                                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-lg flex items-center gap-1">
                                                            <Users size={12} />
                                                            Owner
                                                        </span>
                                                    )}
                                                    {rule.notifyManager && (
                                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg flex items-center gap-1">
                                                            <Shield size={12} />
                                                            Manager
                                                        </span>
                                                    )}
                                                    {rule.notifyCreator && (
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-center gap-1">
                                                            <Users size={12} />
                                                            Creator
                                                        </span>
                                                    )}
                                                    {rule.sendInApp && (
                                                        <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-lg flex items-center gap-1">
                                                            <Bell size={12} />
                                                            In-App
                                                        </span>
                                                    )}
                                                    {rule.sendEmail && (
                                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg flex items-center gap-1">
                                                            <Mail size={12} />
                                                            Email
                                                        </span>
                                                    )}
                                                    {rule.escalationHours && (
                                                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-1">
                                                            <AlertTriangle size={12} />
                                                            Escalate after {rule.escalationHours}h
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleRule(rule.id)}
                                                className={`
                          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full 
                          border-2 border-transparent transition-colors duration-200 ease-in-out
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 
                          ${rule.isActive ? 'bg-indigo-600' : 'bg-gray-200'}
                        `}
                                            >
                                                <span
                                                    className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full 
                            bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${rule.isActive ? 'translate-x-5' : 'translate-x-0'}
                          `}
                                                />
                                            </button>

                                            <button
                                                onClick={() => handleEditRule(rule)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">ℹ️ How Reminders Work</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-indigo-800">
                        <div>
                            <h4 className="font-medium mb-1">Deadline Reminders</h4>
                            <p className="text-indigo-700">
                                Reminders are automatically sent X days before a task's deadline.
                                You can configure multiple reminder rules with different timing and recipients.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-1">Overdue Escalation</h4>
                            <p className="text-indigo-700">
                                When tasks become overdue, the owner is notified immediately.
                                If configured, the manager is notified after the escalation period (e.g., 24 hours).
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add/Edit Rule Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingRule ? 'Edit Reminder Rule' : 'Add Reminder Rule'}
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Rule Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rule Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., 3-Day Deadline Reminder"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this rule"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            {/* Days Before */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Days Before Deadline *
                                </label>
                                <select
                                    value={formData.daysBefore}
                                    onChange={(e) => setFormData({ ...formData, daysBefore: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                >
                                    <option value={0}>0 (Overdue alerts)</option>
                                    <option value={1}>1 day before</option>
                                    <option value={2}>2 days before</option>
                                    <option value={3}>3 days before</option>
                                    <option value={5}>5 days before</option>
                                    <option value={7}>7 days before</option>
                                    <option value={14}>14 days before</option>
                                </select>
                            </div>

                            {/* Notify Recipients */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notify Recipients
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifyOwner}
                                            onChange={(e) => setFormData({ ...formData, notifyOwner: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700">Task Owner/Assignee</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifyManager}
                                            onChange={(e) => setFormData({ ...formData, notifyManager: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700">Team Manager</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifyCreator}
                                            onChange={(e) => setFormData({ ...formData, notifyCreator: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700">Task Creator</span>
                                    </label>
                                </div>
                            </div>

                            {/* Notification Methods */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notification Methods
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.sendInApp}
                                            onChange={(e) => setFormData({ ...formData, sendInApp: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <Bell size={16} className="text-gray-500" />
                                        <span className="text-gray-700">In-App Notification</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.sendEmail}
                                            onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <Mail size={16} className="text-gray-500" />
                                        <span className="text-gray-700">Email Notification</span>
                                    </label>
                                </div>
                            </div>

                            {/* Escalation (for overdue rules) */}
                            {formData.daysBefore === 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Manager Escalation (hours after overdue)
                                    </label>
                                    <select
                                        value={formData.escalationHours || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            escalationHours: e.target.value ? parseInt(e.target.value) : null
                                        })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                    >
                                        <option value="">No escalation</option>
                                        <option value={4}>4 hours</option>
                                        <option value={8}>8 hours</option>
                                        <option value={24}>24 hours (1 day)</option>
                                        <option value={48}>48 hours (2 days)</option>
                                        <option value={72}>72 hours (3 days)</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRule}
                                disabled={!formData.name}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save size={16} />
                                {editingRule ? 'Update Rule' : 'Create Rule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
