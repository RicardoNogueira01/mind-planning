/**
 * Team Holidays Management Page - For Managers
 * 
 * Allows managers to:
 * - View pending leave requests from team members
 * - Approve/reject requests with 1 click
 * - View team calendar
 * - See who's out today/this week
 * 
 * US-2.1.2 and US-2.2.2 Implementation
 */

import React, { useState, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopBar from './shared/TopBar';
import {
    Calendar,
    Clock,
    Check,
    X,
    AlertCircle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Users,
    CalendarDays,
    CheckCircle,
    XCircle,
    MessageSquare,
    Filter,
    Loader2,
    Palmtree,
    Eye,
    Search,
    LucideIcon
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    initials: string;
    color: string;
    avatar?: string | null;
}

interface LeaveType {
    id?: string;
    name: string;
    color?: string;
    icon: string;
}

interface PendingRequest {
    id: string;
    user: User;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    createdAt: string;
}

interface OutToday {
    user: User;
    leaveType: LeaveType;
    endDate: string;
}

interface OutThisWeek {
    user: User;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
}

interface CalendarEvent {
    userId: string;
    userName: string;
    color: string;
    startDate: string;
    endDate: string;
    type: 'approved' | 'pending';
    leaveType: string;
}

interface DayInfo {
    date: Date;
    isCurrentMonth: boolean;
}

interface TabConfig {
    id: string;
    label: string;
    icon: LucideIcon;
    count?: number;
}

// Mock data for pending requests
const mockPendingRequests: PendingRequest[] = [
    {
        id: 'req1',
        user: { id: 'u1', name: 'Alice Johnson', initials: 'AJ', color: '#3B82F6', avatar: null },
        leaveType: { id: 'lt1', name: 'Annual Leave', color: '#3B82F6', icon: '🏖️' },
        startDate: '2024-12-23',
        endDate: '2024-12-27',
        totalDays: 3,
        reason: 'Christmas vacation with family',
        createdAt: '2024-12-10T10:00:00Z'
    },
    {
        id: 'req2',
        user: { id: 'u2', name: 'Bob Smith', initials: 'BS', color: '#10B981', avatar: null },
        leaveType: { id: 'lt1', name: 'Annual Leave', color: '#3B82F6', icon: '🏖️' },
        startDate: '2024-12-30',
        endDate: '2024-12-31',
        totalDays: 2,
        reason: 'New Year break',
        createdAt: '2024-12-11T14:30:00Z'
    },
    {
        id: 'req3',
        user: { id: 'u3', name: 'Carol White', initials: 'CW', color: '#F59E0B', avatar: null },
        leaveType: { id: 'lt3', name: 'Personal Day', color: '#8B5CF6', icon: '🏠' },
        startDate: '2024-12-20',
        endDate: '2024-12-20',
        totalDays: 1,
        reason: 'Medical appointment',
        createdAt: '2024-12-12T09:15:00Z'
    },
];

// Mock data for team members who are out
const mockOutToday: OutToday[] = [
    {
        user: { id: 'u4', name: 'David Lee', initials: 'DL', color: '#EF4444' },
        leaveType: { name: 'Sick Leave', icon: '🤒' },
        endDate: '2024-12-19'
    }
];

const mockOutThisWeek: OutThisWeek[] = [
    {
        user: { id: 'u4', name: 'David Lee', initials: 'DL', color: '#EF4444' },
        leaveType: { name: 'Sick Leave', icon: '🤒' },
        startDate: '2024-12-18',
        endDate: '2024-12-19'
    },
    {
        user: { id: 'u5', name: 'Emily Brown', initials: 'EB', color: '#06B6D4' },
        leaveType: { name: 'Annual Leave', icon: '🏖️' },
        startDate: '2024-12-20',
        endDate: '2024-12-22'
    }
];

// Mock calendar data
const mockCalendarEvents: CalendarEvent[] = [
    { userId: 'u4', userName: 'David Lee', color: '#EF4444', startDate: '2024-12-18', endDate: '2024-12-19', type: 'approved', leaveType: 'Sick Leave' },
    { userId: 'u5', userName: 'Emily Brown', color: '#06B6D4', startDate: '2024-12-20', endDate: '2024-12-22', type: 'approved', leaveType: 'Annual Leave' },
    { userId: 'u1', userName: 'Alice Johnson', color: '#3B82F6', startDate: '2024-12-23', endDate: '2024-12-27', type: 'pending', leaveType: 'Annual Leave' },
    { userId: 'u2', userName: 'Bob Smith', color: '#10B981', startDate: '2024-12-30', endDate: '2024-12-31', type: 'pending', leaveType: 'Annual Leave' },
];

const TeamHolidaysPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>('pending');
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(mockPendingRequests);
    const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
    const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
    const [rejectNotes, setRejectNotes] = useState<string>('');
    const [loading, setLoading] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Filter states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'days'>('date');


    // Filter and sort pending requests
    const filteredRequests = pendingRequests
        .filter(request => {
            // Search filter
            const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Leave type filter
            const matchesLeaveType = filterLeaveType === 'all' || request.leaveType.name === filterLeaveType;

            return matchesSearch && matchesLeaveType;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
            } else {
                return b.totalDays - a.totalDays; // Most days first
            }
        });

    // Quick stats
    const stats = {
        pending: pendingRequests.length,
        outToday: mockOutToday.length,
        outThisWeek: mockOutThisWeek.length
    };

    // Handle approve single request
    const handleApprove = async (requestId: string): Promise<void> => {
        setLoading(requestId);

        // Simulate API call
        setTimeout(() => {
            setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
            setSelectedRequests(prev => {
                const next = new Set(prev);
                next.delete(requestId);
                return next;
            });
            setLoading(null);
        }, 800);
    };

    // Handle reject single request
    const handleReject = async (requestId: string): Promise<void> => {
        setLoading(requestId);

        setTimeout(() => {
            setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
            setShowRejectModal(null);
            setRejectNotes('');
            setLoading(null);
        }, 800);
    };

    // Handle batch approve
    const handleBatchApprove = async (): Promise<void> => {
        setLoading('batch');

        setTimeout(() => {
            setPendingRequests(pendingRequests.filter(r => !selectedRequests.has(r.id)));
            setSelectedRequests(new Set());
            setLoading(null);
        }, 1000);
    };

    // Toggle select all (for filtered results)
    const toggleSelectAll = (): void => {
        if (selectedRequests.size === filteredRequests.length && filteredRequests.length > 0) {
            setSelectedRequests(new Set());
        } else {
            setSelectedRequests(new Set(filteredRequests.map(r => r.id)));
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date): DayInfo[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: DayInfo[] = [];

        // Previous month days
        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push({ date: prevDate, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Next month days to complete the grid
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date): CalendarEvent[] => {
        const dateStr = date.toISOString().split('T')[0];
        return mockCalendarEvents.filter(event => {
            return dateStr >= event.startDate && dateStr <= event.endDate;
        });
    };

    const calendarDays = getDaysInMonth(currentMonth);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
                                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Team Holidays</h1>
                                <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Manage team leave requests</p>
                            </div>
                        </div>
                        {pendingRequests.length > 0 && selectedRequests.size > 0 && (
                            <button
                                onClick={handleBatchApprove}
                                disabled={loading === 'batch'}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-50"
                            >
                                {loading === 'batch' ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <CheckCircle size={18} />
                                )}
                                Approve Selected ({selectedRequests.size})
                            </button>
                        )}
                    </div>
                </header>

                <main>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock size={24} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <AlertCircle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Out Today</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.outToday}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <CalendarDays size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Out This Week</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.outThisWeek}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Who's Out Today */}
                    {mockOutToday.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle size={18} className="text-red-600" />
                                <span className="font-semibold text-red-800">Out Today</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {mockOutToday.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                            style={{ backgroundColor: item.user.color }}
                                        >
                                            {item.user.initials}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{item.user.name}</p>
                                            <p className="text-xs text-gray-500">{item.leaveType.icon} {item.leaveType.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                        {([
                            { id: 'pending', label: 'Pending Requests', icon: Clock, count: stats.pending },
                            { id: 'calendar', label: 'Team Calendar', icon: CalendarDays },
                        ] as TabConfig[]).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-black text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {tab.count && tab.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.id ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Pending Requests Tab */}
                    {activeTab === 'pending' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Search and Filters */}
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex flex-col md:flex-row gap-3">
                                    {/* Search */}
                                    <div className="flex-1 relative">
                                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by employee name..."
                                            value={searchTerm}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>

                                    {/* Leave Type Filter */}
                                    <select
                                        value={filterLeaveType}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterLeaveType(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                                    >
                                        <option value="all">All Leave Types</option>
                                        <option value="Annual Leave">Annual Leave</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Personal Day">Personal Day</option>
                                        <option value="Bereavement">Bereavement</option>
                                    </select>

                                    {/* Sort By */}
                                    <select
                                        value={sortBy}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'date' | 'days')}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                                    >
                                        <option value="date">Sort by Date</option>
                                        <option value="days">Sort by Days</option>
                                    </select>
                                </div>

                                {/* Results count */}
                                {(searchTerm || filterLeaveType !== 'all') && (
                                    <p className="text-sm text-gray-600 mt-3">
                                        Showing {filteredRequests.length} of {pendingRequests.length} requests
                                    </p>
                                )}
                            </div>

                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-16">
                                    {pendingRequests.length === 0 ? (
                                        <>
                                            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle size={32} className="text-emerald-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                                            <p className="text-gray-500">No pending leave requests to review</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <Search size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                                            <p className="text-gray-500">Try adjusting your search or filters</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                            <span className="text-sm text-gray-600">
                                                {selectedRequests.size === 0
                                                    ? 'Select all'
                                                    : `${selectedRequests.size} selected`}
                                            </span>
                                        </label>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {filteredRequests.map(request => (
                                            <div key={request.id} className="p-5 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    {/* Checkbox */}
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRequests.has(request.id)}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                            const next = new Set(selectedRequests);
                                                            if (e.target.checked) {
                                                                next.add(request.id);
                                                            } else {
                                                                next.delete(request.id);
                                                            }
                                                            setSelectedRequests(next);
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-1"
                                                    />

                                                    {/* User Avatar */}
                                                    <div
                                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                                                        style={{ backgroundColor: request.user.color }}
                                                    >
                                                        {request.user.initials}
                                                    </div>

                                                    {/* Request Details */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{request.user.name}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xl">{request.leaveType.icon}</span>
                                                                    <span className="text-sm text-gray-600">{request.leaveType.name}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-400">
                                                                Submitted {new Date(request.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>

                                                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                                <CalendarDays size={16} />
                                                                <span>
                                                                    {new Date(request.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                                    {request.startDate !== request.endDate && (
                                                                        <> → {new Date(request.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <span className="font-medium text-gray-900">{request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}</span>
                                                        </div>

                                                        {request.reason && (
                                                            <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 px-3 py-2 rounded-lg">
                                                                "{request.reason}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={loading === request.id}
                                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                                                        >
                                                            {loading === request.id ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <Check size={16} />
                                                            )}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setShowRejectModal(request.id)}
                                                            disabled={loading === request.id}
                                                            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                                                        >
                                                            <X size={16} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Team Calendar Tab */}
                    {activeTab === 'calendar' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Calendar Header */}
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={20} className="text-gray-600" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-gray-900 min-w-[150px] text-center">
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </h3>
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronRight size={20} className="text-gray-600" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setCurrentMonth(new Date())}
                                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Today
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="p-4">
                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((dayInfo, idx) => {
                                        const events = getEventsForDate(dayInfo.date);
                                        const isToday = dayInfo.date.toDateString() === new Date().toDateString();
                                        const isWeekend = dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6;

                                        return (
                                            <div
                                                key={idx}
                                                className={`min-h-[80px] p-1 border rounded-lg ${dayInfo.isCurrentMonth
                                                    ? isWeekend ? 'bg-gray-50' : 'bg-white'
                                                    : 'bg-gray-100'
                                                    } ${isToday ? 'border-black border-2' : 'border-gray-200'}`}
                                            >
                                                <div className={`text-sm font-medium mb-1 ${dayInfo.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                                    } ${isToday ? 'text-gray-900 font-bold' : ''}`}>
                                                    {dayInfo.date.getDate()}
                                                </div>
                                                <div className="space-y-1">
                                                    {events.slice(0, 2).map((event, eventIdx) => (
                                                        <div
                                                            key={eventIdx}
                                                            className={`text-xs px-1.5 py-0.5 rounded truncate ${event.type === 'pending'
                                                                ? 'border-2 border-dashed bg-white'
                                                                : ''
                                                                }`}
                                                            style={{
                                                                backgroundColor: event.type === 'pending' ? 'transparent' : `${event.color}20`,
                                                                borderColor: event.type === 'pending' ? event.color : 'transparent',
                                                                color: event.color
                                                            }}
                                                            title={`${event.userName} - ${event.leaveType}`}
                                                        >
                                                            {event.userName.split(' ')[0]}
                                                        </div>
                                                    ))}
                                                    {events.length > 2 && (
                                                        <div className="text-xs text-gray-500 px-1">
                                                            +{events.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Calendar Legend */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-100 rounded"></div>
                                    <span className="text-sm text-gray-600">Approved</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-dashed border-blue-500 rounded"></div>
                                    <span className="text-sm text-gray-600">Pending</span>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <XCircle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Reject Request</h3>
                                    <p className="text-sm text-gray-500">Add a reason for rejection (optional)</p>
                                </div>
                            </div>

                            <textarea
                                value={rejectNotes}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRejectNotes(e.target.value)}
                                placeholder="Reason for rejection..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectNotes('');
                                }}
                                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(showRejectModal)}
                                disabled={loading === showRejectModal}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading === showRejectModal ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <X size={18} />
                                )}
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamHolidaysPage;
