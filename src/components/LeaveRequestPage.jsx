/**
 * Leave Request Page - For Team Members
 * 
 * Allows users to:
 * - View their leave balance
 * - Submit new leave requests
 * - View pending/history of requests
 * - Cancel pending requests
 * 
 * US-2.1.1 and US-2.2.1 Implementation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Loader2
} from 'lucide-react';

// Mock data for leave types
const mockLeaveTypes = [
    { id: 'lt1', code: 'ANNUAL', name: 'Annual Leave', color: '#3B82F6', icon: '🏖️', defaultDays: 22 },
    { id: 'lt2', code: 'SICK', name: 'Sick Leave', color: '#EF4444', icon: '🤒', defaultDays: 10 },
    { id: 'lt3', code: 'PERSONAL', name: 'Personal Day', color: '#8B5CF6', icon: '🏠', defaultDays: 3 },
    { id: 'lt4', code: 'BEREAVEMENT', name: 'Bereavement', color: '#6B7280', icon: '🕯️', defaultDays: 5 },
];

// Mock data for balances
const mockBalances = [
    { leaveTypeId: 'lt1', leaveType: mockLeaveTypes[0], totalDays: 22, usedDays: 8, pendingDays: 3, carriedOver: 2, adjustments: 0 },
    { leaveTypeId: 'lt2', leaveType: mockLeaveTypes[1], totalDays: 10, usedDays: 2, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt3', leaveType: mockLeaveTypes[2], totalDays: 3, usedDays: 1, pendingDays: 0, carriedOver: 0, adjustments: 0 },
    { leaveTypeId: 'lt4', leaveType: mockLeaveTypes[3], totalDays: 5, usedDays: 0, pendingDays: 0, carriedOver: 0, adjustments: 0 },
];

// Mock data for requests
const mockRequests = [
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

export default function LeaveRequestPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [balances, setBalances] = useState(mockBalances);
    const [requests, setRequests] = useState(mockRequests);
    const [loading, setLoading] = useState(false);

    // New request form state
    const [newRequest, setNewRequest] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        isHalfDayStart: false,
        isHalfDayEnd: false
    });

    // Calculate available days for a leave type
    const getAvailableDays = (balance) => {
        return balance.totalDays + balance.carriedOver - balance.usedDays - balance.pendingDays + balance.adjustments;
    };

    // Calculate business days between two dates
    const calculateBusinessDays = (start, end) => {
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
    const handleSubmitRequest = async () => {
        if (!newRequest.leaveTypeId || !newRequest.startDate || !newRequest.endDate) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            const leaveType = mockLeaveTypes.find(lt => lt.id === newRequest.leaveTypeId);
            const totalDays = calculateBusinessDays(newRequest.startDate, newRequest.endDate);

            const request = {
                id: `req${Date.now()}`,
                ...newRequest,
                leaveType,
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
                isHalfDayStart: false,
                isHalfDayEnd: false
            });
            setLoading(false);
        }, 1000);
    };

    // Handle cancel request
    const handleCancelRequest = (requestId) => {
        if (!confirm('Are you sure you want to cancel this request?')) return;

        setRequests(requests.map(r =>
            r.id === requestId ? { ...r, status: 'cancelled' } : r
        ));
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
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

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Palmtree className="text-white" size={20} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">My Leave</h1>
                                    <p className="text-sm text-gray-500">Manage your time off</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowNewRequestModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                        >
                            <Plus size={18} />
                            New Request
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-4 md:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <CalendarDays size={24} className="text-blue-600" />
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
                                    ? 'bg-blue-600 text-white shadow-sm'
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <div className="bg-blue-50 rounded-lg p-3">
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    New Request
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {requests.map(request => {
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
                                                                Reviewed by {request.reviewedBy.name} on {new Date(request.reviewedAt).toLocaleDateString()}
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
                )}
            </main>

            {/* New Request Modal */}
            {showNewRequestModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                                <div className="grid grid-cols-2 gap-3">
                                    {mockLeaveTypes.map(type => {
                                        const balance = balances.find(b => b.leaveTypeId === type.id);
                                        const available = balance ? getAvailableDays(balance) : 0;
                                        const isSelected = newRequest.leaveTypeId === type.id;

                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setNewRequest({ ...newRequest, leaveTypeId: type.id })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{type.icon}</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{type.name}</p>
                                                        <p className="text-sm text-gray-500">{available} days available</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={newRequest.startDate}
                                        onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={newRequest.endDate}
                                        onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                                        min={newRequest.startDate || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Show calculated days */}
                            {newRequest.startDate && newRequest.endDate && (
                                <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
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
                                        onChange={(e) => setNewRequest({ ...newRequest, isHalfDayStart: e.target.checked })}
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
                                        onChange={(e) => setNewRequest({ ...newRequest, isHalfDayEnd: e.target.checked })}
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
                                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                                    placeholder="Add any notes or reason for your request..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
    );
}
