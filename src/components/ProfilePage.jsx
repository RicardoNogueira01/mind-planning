import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { userApi } from '../api/client';
import TopBar from './shared/TopBar';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Settings,
  Activity,
  BarChart2,
  Clock,
  CheckCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';

const ProfilePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use 'me' for current user or the memberId
        const userId = memberId || 'me';
        const data = await userApi.getById(userId);

        // Transform data to match component expectations
        setProfile({
          id: data.id,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
          initials: data.initials || (data.name ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'),
          color: data.color || '#6366f1',
          role: data.jobTitle || data.role || 'Team Member',
          department: data.department || 'General',
          email: data.email,
          phone: data.phone || 'Not provided',
          location: data.location || 'Not provided',
          bio: data.bio || 'No bio provided.',
          skills: Array.isArray(data.skills) ? data.skills : [],
          avatar: data.avatar,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          websiteUrl: data.websiteUrl,
          teams: data.memberOfTeams || [],
          holidays: calculateHolidays(data.holidayRequests || []),
          stats: data.stats || {
            completed: 0,
            inProgress: 0,
            overdue: 0,
            successRate: 0
          },
          recentActivity: (data.recentActivity || []).map(activity => ({
            ...activity,
            icon: activity.type === 'completed' ? '✓' : activity.type === 'in_progress' ? '◐' : '+'
          })),
          performance: {
            excellent: (data.stats?.successRate || 0) >= 80
          }
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        // Fallback to mock profile for demonstration
        setProfile({
          id: 'current-user',
          name: 'John Doe',
          initials: 'JD',
          color: '#6366f1',
          role: 'Senior Developer',
          department: 'Engineering',
          email: 'john.doe@company.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          bio: 'Passionate software engineer with 5+ years of experience in full-stack development. Love building scalable applications and mentoring junior developers.',
          skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker'],
          avatar: null,
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          githubUrl: 'https://github.com/johndoe',
          websiteUrl: 'https://johndoe.dev',
          teams: ['Frontend Team', 'Platform Team'],
          holidays: {
            totalDays: 25,
            taken: 12,
            pending: 3,
            rejected: 1,
            remaining: 10,
            requests: [
              {
                id: 1,
                startDate: '15 Dec',
                endDate: '20 Dec',
                days: 5,
                status: 'pending',
                reason: 'Christmas vacation'
              },
              {
                id: 2,
                startDate: '1 Nov',
                endDate: '5 Nov',
                days: 4,
                status: 'taken',
                reason: 'Family trip'
              },
              {
                id: 3,
                startDate: '10 Oct',
                endDate: '12 Oct',
                days: 2,
                status: 'taken',
                reason: 'Personal'
              }
            ]
          },
          stats: {
            completed: 45,
            inProgress: 8,
            overdue: 2,
            successRate: 85
          },
          recentActivity: [
            {
              id: 1,
              type: 'completed',
              task: 'API Integration',
              project: 'Project Alpha',
              time: '2h ago',
              icon: '✓'
            },
            {
              id: 2,
              type: 'in_progress',
              task: 'Database Migration',
              project: 'Project Beta',
              time: '5h ago',
              icon: '◐'
            },
            {
              id: 3,
              type: 'completed',
              task: 'Code Review',
              project: 'Project Gamma',
              time: '1d ago',
              icon: '✓'
            }
          ],
          performance: {
            excellent: true
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [memberId]);

  // Calculate holiday stats from requests
  const calculateHolidays = (requests) => {
    const taken = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.days || 0), 0);
    const pending = requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.days || 0), 0);
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const totalDays = 25; // Default annual allowance

    return {
      totalDays,
      taken,
      pending,
      rejected,
      remaining: totalDays - taken,
      requests: requests.slice(0, 5).map(r => ({
        id: r.id,
        startDate: new Date(r.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        endDate: new Date(r.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        days: r.days || 1,
        status: r.status === 'approved' ? 'taken' : r.status,
        reason: r.reason || ''
      }))
    };
  };

  const tabs = [
    { id: 'overview', label: t('profile.overview'), icon: Activity },
    { id: 'activity', label: t('profile.activity'), icon: Clock },
    { id: 'performance', label: t('profile.performance'), icon: BarChart2 }
  ];

  const getActivityColor = (type) => {
    switch (type) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress':
      case 'inProgress': return 'text-blue-600 bg-blue-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <TopBar showSearch={false} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <TopBar showSearch={false} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Profile not found'}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TopBar showSearch={false} />
      <div className="p-4 md:p-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-700" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('profile.title')}</h1>
            <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{t('profile.subtitle')}</p>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Gradient */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="px-6 pb-6">
            {/* Avatar and Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4 mb-4 md:mb-0">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-28 h-28 rounded-2xl object-cover shadow-xl ring-4 ring-white"
                  />
                ) : (
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl ring-4 ring-white"
                    style={{ backgroundColor: profile.color }}
                  >
                    {profile.initials}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/profile/${profile.id}/edit`}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit2 size={16} />
                  {t('profile.editProfile')}
                </Link>
                <Link
                  to={`/profile/${profile.id}/settings`}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Settings size={16} />
                  {t('profile.settings')}
                </Link>
              </div>
            </div>

            {/* Name and Role */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
              <p className="text-base text-gray-500 mb-3">{profile.role}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md font-medium flex items-center gap-1.5">
                  <Activity size={14} />
                  {profile.department}
                </span>
                <span className={`px-3 py-1 text-sm rounded-md font-medium flex items-center gap-1.5 ${profile.performance.excellent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  <CheckCircle size={14} />
                  {profile.performance.excellent ? 'Excellent Performance' : 'Good Performance'}
                </span>
              </div>
            </div>

            {/* Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Mail size={16} className="text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">{t('profile.email')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone size={16} className="text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">{t('profile.phone')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin size={16} className="text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">{t('profile.location')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.location}</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">{t('profile.about').toUpperCase()}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">{t('profile.skills').toUpperCase()}</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Holidays Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">HOLIDAYS</h3>

              {/* Holiday Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {profile.holidays.totalDays}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">Total Days</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600 mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {profile.holidays.taken}
                  </p>
                  <p className="text-xs text-green-700 font-medium">Taken</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600 mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {profile.holidays.pending}
                  </p>
                  <p className="text-xs text-amber-700 font-medium">Pending</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600 mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {profile.holidays.rejected}
                  </p>
                  <p className="text-xs text-red-700 font-medium">Rejected</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600 mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {profile.holidays.remaining}
                  </p>
                  <p className="text-xs text-blue-700 font-medium">Remaining</p>
                </div>
              </div>

              {/* Recent Holiday Requests */}
              {profile.holidays.requests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Requests</h4>
                  {profile.holidays.requests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${request.status === 'taken' ? 'bg-green-500' :
                            request.status === 'pending' ? 'bg-amber-500' :
                              'bg-red-500'
                          }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.startDate} - {request.endDate}</p>
                          <p className="text-xs text-gray-500">{request.reason || 'No reason provided'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${request.status === 'taken' ? 'bg-green-100 text-green-700' :
                          request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {request.days} {request.days === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Mono, monospace' }}>
              {profile.stats.completed}
            </p>
            <p className="text-xs text-gray-500 font-medium">Tasks Completed</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Mono, monospace' }}>
              {profile.stats.inProgress}
            </p>
            <p className="text-xs text-gray-500 font-medium">In Progress</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Activity size={20} className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Mono, monospace' }}>
              {profile.stats.overdue}
            </p>
            <p className="text-xs text-gray-500 font-medium">Overdue</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'DM Mono, monospace' }}>
              {profile.stats.successRate}%
            </p>
            <p className="text-xs text-gray-500 font-medium">Success Rate</p>
          </div>
        </div>

        {/* Recent Activity */}
        {profile.recentActivity && profile.recentActivity.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {profile.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.task}</p>
                    <p className="text-xs text-gray-500">{activity.project}</p>
                  </div>
                  <p className="text-xs text-gray-400">{typeof activity.time === 'string' && activity.time.includes('ago') ? activity.time : formatTimeAgo(activity.time)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
