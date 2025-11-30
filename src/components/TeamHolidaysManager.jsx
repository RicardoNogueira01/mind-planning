import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Download
} from 'lucide-react';

const TeamHolidaysManager = () => {
  const { t } = useLanguage();
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [teamHolidayRequests, setTeamHolidayRequests] = useState([
    { 
      id: 1, 
      employeeName: 'Alex Kim', 
      initials: 'AK', 
      color: '#10B981', 
      startDate: '20 Dec', 
      endDate: '27 Dec',
      days: 5,
      status: 'approved',
      reason: 'Christmas vacation',
      submittedAt: '2024-01-05',
      department: 'Engineering'
    },
    { 
      id: 2, 
      employeeName: 'John Doe', 
      initials: 'JD', 
      color: '#3B82F6', 
      startDate: '15 Jan', 
      endDate: '19 Jan',
      days: 3,
      status: 'pending',
      reason: 'Family trip',
      submittedAt: '2024-01-10',
      department: 'Engineering'
    },
    { 
      id: 3, 
      employeeName: 'Maria Rodriguez', 
      initials: 'MR', 
      color: '#F59E0B', 
      startDate: '1 Feb', 
      endDate: '10 Feb',
      days: 7,
      status: 'approved',
      reason: 'Ski holiday',
      submittedAt: '2024-01-08',
      department: 'Marketing'
    },
    { 
      id: 4, 
      employeeName: 'Taylor Smith', 
      initials: 'TS', 
      color: '#8B5CF6', 
      startDate: '14 Feb', 
      endDate: '16 Feb',
      days: 2,
      status: 'pending',
      reason: 'Long weekend',
      submittedAt: '2024-01-12',
      department: 'Design'
    },
    { 
      id: 5, 
      employeeName: 'Sarah Wilson', 
      initials: 'SW', 
      color: '#06B6D4', 
      startDate: '5 Mar', 
      endDate: '8 Mar',
      days: 3,
      status: 'rejected',
      reason: 'Personal matters',
      submittedAt: '2024-01-11',
      department: 'Product'
    },
    { 
      id: 6, 
      employeeName: 'David Chen', 
      initials: 'DC', 
      color: '#EF4444', 
      startDate: '20 Mar', 
      endDate: '29 Mar',
      days: 7,
      status: 'approved',
      reason: 'Spring break',
      submittedAt: '2024-01-09',
      department: 'Engineering'
    },
    { 
      id: 7, 
      employeeName: 'Emma Johnson', 
      initials: 'EJ', 
      color: '#EC4899', 
      startDate: '10 Apr', 
      endDate: '14 Apr',
      days: 4,
      status: 'pending',
      reason: 'Easter holidays',
      submittedAt: '2024-01-13',
      department: 'Sales'
    },
    { 
      id: 8, 
      employeeName: 'Michael Brown', 
      initials: 'MB', 
      color: '#14B8A6', 
      startDate: '1 May', 
      endDate: '5 May',
      days: 3,
      status: 'approved',
      reason: 'Bank holiday extension',
      submittedAt: '2024-01-14',
      department: 'HR'
    }
  ]);

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage({ message, type });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleApprove = (id, employeeName) => {
    setTeamHolidayRequests(prev => 
      prev.map(req => req.id === id ? { ...req, status: 'approved' } : req)
    );
    showFeedback(`Approved holiday request for ${employeeName}`, 'success');
    setOpenMenuId(null);
  };

  const handleReject = (id, employeeName) => {
    if (globalThis.confirm(`Are you sure you want to reject ${employeeName}'s holiday request?`)) {
      setTeamHolidayRequests(prev => 
        prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req)
      );
      showFeedback(`Rejected holiday request for ${employeeName}`, 'error');
      setOpenMenuId(null);
    }
  };

  const handleDelete = (id, employeeName) => {
    if (globalThis.confirm(`Are you sure you want to delete ${employeeName}'s holiday request?`)) {
      setTeamHolidayRequests(prev => prev.filter(req => req.id !== id));
      showFeedback('Holiday request deleted', 'error');
      setOpenMenuId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.relative')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const filteredRequests = teamHolidayRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus;
    
    let matchesMonth = true;
    if (selectedMonth !== 'all') {
      matchesMonth = req.startDate.includes(selectedMonth) || req.endDate.includes(selectedMonth);
    }
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const stats = {
    total: teamHolidayRequests.length,
    pending: teamHolidayRequests.filter(r => r.status === 'pending').length,
    approved: teamHolidayRequests.filter(r => r.status === 'approved').length,
    rejected: teamHolidayRequests.filter(r => r.status === 'rejected').length,
    totalDays: teamHolidayRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days, 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={12} />;
      case 'pending': return <AlertCircle size={12} />;
      case 'rejected': return <XCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar showSearch={false} />
      <div className="p-3 md:p-6">
        {/* Feedback Message */}
        {feedbackMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
            <div className={`px-6 py-3 rounded-lg shadow-lg border ${
              feedbackMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{feedbackMessage.message}</p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <header className="mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div className="flex-1 md:flex-initial min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Team Holidays</h1>
                <p className="text-sm md:text-base text-gray-500 truncate md:whitespace-normal">Manage team holiday requests and approvals</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation">
                <Download size={16} />
                <span className="hidden md:inline">Export</span>
              </button>
              <button className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation">
                <Plus size={16} />
                <span className="hidden md:inline">New Request</span>
                <span className="md:hidden">Add</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock size={20} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle size={20} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalDays}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar size={20} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 ${showFilters ? 'bg-gray-50' : ''}`}
                >
                  <Filter size={16} />
                  Filters
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="all">All Months</option>
                      <option value="Jan">January</option>
                      <option value="Feb">February</option>
                      <option value="Mar">March</option>
                      <option value="Apr">April</option>
                      <option value="May">May</option>
                      <option value="Jun">June</option>
                      <option value="Jul">July</option>
                      <option value="Aug">August</option>
                      <option value="Sep">September</option>
                      <option value="Oct">October</option>
                      <option value="Nov">November</option>
                      <option value="Dec">December</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredRequests.length} of {teamHolidayRequests.length} holiday requests
            </p>
          </div>

          {/* Holiday Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredRequests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
                {/* Status Top Line */}
                <div className={`h-1 ${getStatusColor(request.status)}`}></div>
                
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-md"
                        style={{ backgroundColor: request.color }}
                      >
                        {request.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{request.employeeName}</h3>
                        <p className="text-xs text-gray-500">{request.department}</p>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setOpenMenuId(openMenuId === request.id ? null : request.id)}
                      >
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                      {openMenuId === request.id && (
                        <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                          {request.status === 'pending' && (
                            <>
                              <button 
                                className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                onClick={() => handleApprove(request.id, request.employeeName)}
                              >
                                <CheckCircle size={13} />
                                Approve
                              </button>
                              <button 
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                onClick={() => handleReject(request.id, request.employeeName)}
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </>
                          )}
                          <button 
                            className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 size={13} />
                            Edit
                          </button>
                          <button 
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={() => handleDelete(request.id, request.employeeName)}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Date Range */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-600 font-medium">Start</span>
                      <span className="text-xs text-blue-900 font-bold">{request.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-medium">End</span>
                      <span className="text-xs text-blue-900 font-bold">{request.endDate}</span>
                    </div>
                  </div>

                  {/* Days Count */}
                  <div className="flex items-center justify-between mb-3 p-2 bg-purple-50 rounded-lg">
                    <span className="text-xs text-purple-600 font-medium">Duration</span>
                    <span className="text-sm text-purple-900 font-bold">{request.days} days</span>
                  </div>

                  {/* Reason */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 mb-1">Reason:</p>
                    <p className="text-xs text-gray-900 font-medium line-clamp-2">{request.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamHolidaysManager;
