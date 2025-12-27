import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './shared/TopBar';
import {
    Calendar,
    Clock,
    Plus,
    X,
    Check,
    AlertCircle,
    ArrowLeft,
    ChevronRight,
    Palmtree,
    Thermometer,
    Home,
    Users,
    CalendarDays,
    History,
    TrendingUp,
    Loader2,
    Filter,
    LucideIcon
} from 'lucide-react';

interface LeaveType {
    id: string;
    code: string;
    name: string;
    color: string;
    icon: string;
    defaultDays: number;
}

interface LeaveBalance {
    leaveTypeId: string;
    leaveType: LeaveType;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    carriedOver: number;
    adjustments: number;
}

interface LeaveRequest {
    id: string;
    leaveTypeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    totalDays: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reason?: string;
    reviewedAt?: string;
    reviewedBy?: { name: string };
    createdAt: string;
    otherLeaveDescription?: string;
    isHalfDayStart?: boolean;
    isHalfDayEnd?: boolean;
}

interface NewRequest {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    otherLeaveDescription: string;
    isHalfDayStart: boolean;
    isHalfDayEnd: boolean;
}

interface StatusBadge {
    bg: string;
    text: string;
    border: string;
    label: string;
    icon: LucideIcon;
}

// Mock data for leave types
const mockLeaveTypes: LeaveType[] = [
    { id: 'lt1', code: 'ANNUAL', name: 'Annual Leave', color: '#3B82F6', icon: '🏖️', defaultDays: 22 },
    { id: 'lt2', code: 'SICK', name: 'Sick Leave', color: '#EF4444', icon: '🤒', defaultDays: 10 },
    { id: 'lt3', code: 'PERSONAL', name: 'Personal Day', color: '#8B5CF6', icon: '🏠', defaultDays: 3 },
    { id: 'lt4', code: 'BEREAVEMENT', name: 'Bereavement', color: '#6B7280', icon: '🕯️', defaultDays: 5 },
    { id: 'lt5', code: 'MATERNITY', name: 'Maternity/Paternity', color: '#EC4899', icon: '👶', defaultDays: 90 },
    { id: 'lt6', code: 'STUDY', name: 'Study Leave', color: '#0EA5E9', icon: '📚', defaultDays: 5 },
    { id: 'lt7', code: 'MOVING', name: 'Moving Day', color: '#F97316', icon: '📦', defaultDays: 2 },
    { id: 'lt8', code: 'MEDICAL', name: 'Medical Appointment', color: '#14B8A6', icon: '🏥', defaultDays: 5 },
    { id: 'lt9', code: 'JURY', name: 'Jury Duty', color: '#6366F1', icon: '⚖️', defaultDays: 10 },
    { id: 'lt10', code: 'OTHER', name: 'Other', color: '#71717A', icon: '📝', defaultDays: 5 },
];

// Mock data for balances
const mockBalances: LeaveBalance[] = [
    { leaveTypeId: 'lt1', leaveType: mockLeaveTypes[0], totalDays: 22, usedDays: 8, pendingDays: 3, carriedOver: 2, adjustments: 0 },
    { leaveTypeId: 'lt2', leaveType: mockLeaveTypes[1], totalDays: 10, usedDays: 2, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt3', leaveType: mockLeaveTypes[2], totalDays: 3, usedDays: 1, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt4', leaveType: mockLeaveTypes[3], totalDays: 5, usedDays: 0, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt5', leaveType: mockLeaveTypes[4], totalDays: 90, usedDays: 0, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt6', leaveType: mockLeaveTypes[5], totalDays: 5, usedDays: 0, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt7', leaveType: mockLeaveTypes[6], totalDays: 2, usedDays: 0, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt8', leaveType: mockLeaveTypes[7], totalDays: 5, usedDays: 1, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt9', leaveType: mockLeaveTypes[8], totalDays: 10, usedDays: 0, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt10', leaveType: mockLeaveTypes[9], totalDays: 5, usedDays: 0, pendingDays: 0, carriedOver: 0, adjustments: 0 },
];

// Mock data for requests
const mockRequests: LeaveRequest[] = [
    {
        id: 'req1',
        leaveTypeId: 'lt1',
        leaveType: mockLeaveTypes[0],
        startDate: '2024-12-23',
        endDate: '2024-12-27',
        totalDays: 3,
        status: 'pending',
        reason: 'Christmas vacation',
        createdAt: '2024-12-10T10:00:00Z'
    },
    {
        id: 'req2',
        leaveTypeId: 'lt1',
        leaveType: mockLeaveTypes[0],
        startDate: '2024-11-15',
        endDate: '2024-11-15',
        totalDays: 1,
        status: 'approved',
        reason: 'Personal appointment',
        reviewedAt: '2024-11-12T14:30:00Z',
        reviewedBy: { name: 'John Manager' },
        createdAt: '2024-11-10T09:00:00Z'
    },
    {
        id: 'req3',
        leaveTypeId: 'lt2',
        leaveType: mockLeaveTypes[1],
        startDate: '2024-10-05',
        endDate: '2024-10-06',
        totalDays: 2,
        status: 'approved',
        reason: 'Not feeling well',
        reviewedAt: '2024-10-05T08:00:00Z',
        createdAt: '2024-10-05T07:30:00Z'
    },
];

const LeaveRequestPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [showNewRequestModal, setShowNewRequestModal] = useState<boolean>(false);
    const [balances, setBalances] = useState<LeaveBalance[]>(mockBalances);
    const [requests, setRequests] = useState<LeaveRequest[]>(mockRequests);
    const [loading, setLoading] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // New request form state
    const [newRequest, setNewRequest] = useState<NewRequest>({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        otherLeaveDescription: '',
        isHalfDayStart: false,
        isHalfDayEnd: false
    });

    // Calculate available days for a leave type
    const getAvailableDays = (balance: LeaveBalance): number => {
        return balance.totalDays + balance.carriedOver - balance.usedDays - balance.pendingDays + balance.adjustments;
    };

    // Calculate business days between two dates
    const calculateBusinessDays = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        let count = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
            current.setDate(current.getDate() + 1);
        }
        return count;
    };

    // Handle submit new request
    const handleSubmitRequest = async (): Promise<void> => {
        if (!newRequest.leaveTypeId || !newRequest.startDate || !newRequest.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            const leaveType = mockLeaveTypes.find(lt => lt.id === newRequest.leaveTypeId);
            const totalDays = calculateBusinessDays(newRequest.startDate, newRequest.endDate);

            const request: LeaveRequest = {
                id: `req${Date.now()}`,
                leaveTypeId: newRequest.leaveTypeId,
                leaveType: leaveType!,
                startDate: newRequest.startDate,
                endDate: newRequest.endDate,
                reason: newRequest.reason,
                otherLeaveDescription: newRequest.otherLeaveDescription,
                isHalfDayStart: newRequest.isHalfDayStart,
                isHalfDayEnd: newRequest.isHalfDayEnd,
                totalDays,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            setRequests([request, ...requests]);
            setShowNewRequestModal(false);
            setNewRequest({
                leaveTypeId: '',
                startDate: '',
                endDate: '',
                reason: '',
                otherLeaveDescription: '',
                isHalfDayStart: false,
                isHalfDayEnd: false
            });
            setLoading(false);
        }, 1000);
    };

    // Handle cancel request
    const handleCancelRequest = (requestId: string): void => {
        if (!confirm('Are you sure you want to cancel this request?')) return;

        setRequests(requests.map(r =>
            r.id === requestId ? { ...r, status: 'cancelled' as const } : r
        ));
    };

    // Get status badge styling
    const getStatusBadge = (status: string): StatusBadge => {
        switch (status) {
            case 'pending':
                return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending', icon: Clock };
            case 'approved':
                return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved', icon: Check };
            case 'rejected':
                return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Rejected', icon: X };
            case 'cancelled':
                return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Cancelled', icon: X };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: status, icon: Clock };
        }
    };

    // Total available days across all types
    const totalAvailableDays = balances.reduce((acc, b) => acc + getAvailableDays(b), 0);
    const totalPendingDays = balances.reduce((acc, b) => acc + b.pendingDays, 0);
    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    const filteredRequests = requests.filter(req => {
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        const matchesType = typeFilter === 'all' || req.leaveTypeId === typeFilter;
        return matchesStatus && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <TopBar showSearch={true} />

            <div className="p-4 md:p-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100"
                            >
                                <ArrowLeft size={20} className="text-gray-700" strokeWidth={2} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <Palmtree className="text-white" size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">My Leave</h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage your time off</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowNewRequestModal(true)}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            <Plus size={18} />
                            New Request
                        </button>
                    </div>
                </header>

                <main>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                    <CalendarDays size={24} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Available Days</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalAvailableDays}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock size={24} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalPendingDays} days</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Check size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Used This Year</p>
                                    <p className="text-2xl font-bold text-gray-900">{balances.reduce((acc, b) => acc + b.usedDays, 0)} days</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                        {[
                            { id: 'overview', label: 'Balance Overview', icon: CalendarDays },
                            { id: 'requests', label: 'My Requests', icon: History },
                        ].map(tab => (
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
                            </button>
                        ))}
                    </div>

                    {/* Balance Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {balances.map(balance => {
                                const available = getAvailableDays(balance);
                                const usedPercent = (balance.usedDays / balance.totalDays) * 100;

                                return (
                                    <div key={balance.leaveTypeId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                    style={{ backgroundColor: `${balance.leaveType.color}15` }}
                                                >
                                                    {balance.leaveType.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{balance.leaveType.name}</h3>
                                                    <p className="text-sm text-gray-500">{balance.totalDays} days per year</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold" style={{ color: balance.leaveType.color }}>{available}</p>
                                                <p className="text-sm text-gray-500">available</p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(usedPercent, 100)}%`,
                                                    backgroundColor: balance.leaveType.color
                                                }}
                                            />
                                        </div>

                                        {/* Breakdown */}
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-gray-500">Used</p>
                                                <p className="font-semibold text-gray-900">{balance.usedDays} days</p>
                                            </div>
                                            <div className="bg-amber-50 rounded-lg p-3">
                                                <p className="text-amber-600">Pending</p>
                                                <p className="font-semibold text-amber-700">{balance.pendingDays} days</p>
                                            </div>
                                            {balance.carriedOver > 0 && (
                                                <div className="bg-teal-50 rounded-lg p-3">
                                                    <p className="text-blue-600">Carried Over</p>
                                                    <p className="font-semibold text-blue-700">{balance.carriedOver} days</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* My Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                                        className="appearance-none pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>

                                <div className="relative">
                                    <select
                                        value={typeFilter}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                                        className="appearance-none pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
                                    >
                                        <option value="all">All Leave Types</option>
                                        {mockLeaveTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>

                                {(statusFilter !== 'all' || typeFilter !== 'all') && (
                                    <button
                                        onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {requests.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Calendar size={32} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                                        <p className="text-gray-500 mb-4">Submit your first leave request to get started</p>
                                        <button
                                            onClick={() => setShowNewRequestModal(true)}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
                                        >
                                            <Plus size={18} />
                                            New Request
                                        </button>
                                    </div>
                                ) : filteredRequests.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Filter size={20} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-gray-900 font-medium mb-1">No matching requests</h3>
                                        <p className="text-gray-500 text-sm">Try adjusting your filters to see more results</p>
                                        <button
                                            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                                            className="mt-4 text-sm text-blue-600 font-medium hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredRequests.map(request => {
                                            const statusBadge = getStatusBadge(request.status);
                                            const StatusIcon = statusBadge.icon;

                                            return (
                                                <div key={request.id} className="p-5 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                                                style={{ backgroundColor: `${request.leaveType.color}15` }}
                                                            >
                                                                {request.leaveType.icon}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{request.leaveType.name}</h4>
                                                                <p className="text-sm text-gray-500 mt-0.5">
                                                                    {new Date(request.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    {request.startDate !== request.endDate && (
                                                                        <> — {new Date(request.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                                                    )}
                                                                    <span className="mx-2">•</span>
                                                                    {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                                                                </p>
                                                                {request.reason && (
                                                                    <p className="text-sm text-gray-600 mt-2 italic">"{request.reason}"</p>
                                                                )}
                                                                {request.reviewedBy && (
                                                                    <p className="text-xs text-gray-400 mt-2">
                                                                        Reviewed by {request.reviewedBy.name} on {new Date(request.reviewedAt!).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                                                                <StatusIcon size={14} />
                                                                {statusBadge.label}
                                                            </span>

                                                            {request.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleCancelRequest(request.id)}
                                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                                    title="Cancel request"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* New Request Modal */}
                    {showNewRequestModal && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">New Leave Request</h2>
                                        <p className="text-sm text-gray-500">Submit a request for time off</p>
                                    </div>
                                    <button
                                        onClick={() => setShowNewRequestModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                {/* Form */}
                                <div className="p-6 space-y-5">
                                    {/* Leave Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Leave Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {mockLeaveTypes.map(type => {
                                                const balance = balances.find(b => b.leaveTypeId === type.id);
                                                const available = balance ? getAvailableDays(balance) : 0;
                                                const isSelected = newRequest.leaveTypeId === type.id;

                                                return (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setNewRequest({ ...newRequest, leaveTypeId: type.id, otherLeaveDescription: type.code !== 'OTHER' ? '' : newRequest.otherLeaveDescription })}
                                                        className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                                            ? 'border-teal-500 bg-teal-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{type.icon}</span>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-gray-900 text-sm truncate">{type.name}</p>
                                                                <p className="text-xs text-gray-500">{available} days</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Other Leave Type Custom Input */}
                                    {newRequest.leaveTypeId === 'lt10' && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Please describe the type of leave <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newRequest.otherLeaveDescription}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, otherLeaveDescription: e.target.value })}
                                                placeholder="E.g., Religious observance, Family event, etc."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                            />
                                        </div>
                                    )}

                                    {/* Date Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={newRequest.startDate}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={newRequest.endDate}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                                                min={newRequest.startDate || new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    {/* Show calculated days */}
                                    {newRequest.startDate && newRequest.endDate && (
                                        <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-3">
                                            <CalendarDays size={20} className="text-blue-600" />
                                            <div>
                                                <p className="font-medium text-blue-900">
                                                    {calculateBusinessDays(newRequest.startDate, newRequest.endDate)} business days
                                                </p>
                                                <p className="text-sm text-blue-700">Excludes weekends</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Half day options */}
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newRequest.isHalfDayStart}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, isHalfDayStart: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Start date is half day (PM only)</span>
                                        </label>
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newRequest.isHalfDayEnd}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRequest({ ...newRequest, isHalfDayEnd: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">End date is half day (AM only)</span>
                                        </label>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason (optional)
                                        </label>
                                        <textarea
                                            value={newRequest.reason}
                                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewRequest({ ...newRequest, reason: e.target.value })}
                                            placeholder="Add any notes or reason for your request..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => setShowNewRequestModal(false)}
                                        className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitRequest}
                                        disabled={loading || !newRequest.leaveTypeId || !newRequest.startDate || !newRequest.endDate}
                                        className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                Submit Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default LeaveRequestPage;
