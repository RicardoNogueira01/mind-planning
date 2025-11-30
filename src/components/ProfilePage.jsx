import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
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
  TrendingUp
} from 'lucide-react';

const ProfilePage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app would fetch from API
  const profile = {
    id: memberId || 'current-user',
    name: 'Alex Kim',
    initials: 'AK',
    color: '#4ADE80',
    role: 'Senior Developer',
    department: 'Engineering',
    email: 'alex.kim@company.com',
    phone: '+1(555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Love working with React, Node.js, and cloud technologies. Always eager to learn new things and contribute to meaningful projects.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'GraphQL', 'MongoDB'],
    stats: {
      completed: 248,
      inProgress: 12,
      overdue: 2,
      successRate: 94
    },
    recentActivity: [
      { id: 1, type: 'completed', task: 'API Integration', time: '2h ago', project: 'Project Alpha', icon: '✓' },
      { id: 2, type: 'inProgress', task: 'Database Migration', time: '5h ago', project: 'Project Beta', icon: '◐' },
      { id: 3, type: 'overdue', task: 'UI Redesign', time: '1 day ago', project: 'Project Gamma', icon: '+' },
      { id: 4, type: 'completed', task: 'Auth System', time: '2 days ago', project: 'Project Delta', icon: '✓' }
    ],
    performance: {
      excellent: true
    }
  };

  const tabs = [
    { id: 'overview', label: t('profile.overview'), icon: Activity },
    { id: 'activity', label: t('profile.activity'), icon: Clock },
    { id: 'performance', label: t('profile.performance'), icon: BarChart2 }
  ];

  const getActivityColor = (type) => {
    switch(type) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'inProgress': return 'text-blue-600 bg-blue-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar showSearch={false} />
      <div className="p-3 md:p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
            <p className="text-sm text-gray-500">{t('profile.subtitle')}</p>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Gradient */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="px-6 pb-6">
            {/* Avatar and Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4 mb-4 md:mb-0">
                <div 
                  className="w-28 h-28 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl ring-4 ring-white"
                  style={{ backgroundColor: profile.color }}
                >
                  {profile.initials}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/profile/${profile.id}/edit`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
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
                <span className={`px-3 py-1 text-sm rounded-md font-medium flex items-center gap-1.5 ${
                  profile.performance.excellent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <CheckCircle size={14} />
                  Excellent Performance
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
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 font-medium">{t('profile.completed')}</p>
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{profile.stats.completed}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('profile.totalTasks')}</p>
                </div>

                <div className="bg-white rounded-xl border-l-4 border-blue-500 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 font-medium">{t('profile.inProgress')}</p>
                    <Activity size={16} className="text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{profile.stats.inProgress}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('profile.activeTasks')}</p>
                </div>

                <div className="bg-white rounded-xl border-l-4 border-red-500 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 font-medium">{t('profile.overdue')}</p>
                    <TrendingUp size={16} className="text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">{profile.stats.overdue}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('profile.needAttention')}</p>
                </div>

                <div className="bg-white rounded-xl border-l-4 border-amber-500 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 font-medium">{t('profile.successRate')}</p>
                    <BarChart2 size={16} className="text-amber-600" />
                  </div>
                  <p className="text-3xl font-bold text-amber-600">{profile.stats.successRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">{t('profile.completionRate')}</p>
                </div>
              </div>

              {/* Task Completion Trend */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Task Completion Trend</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Week</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg">Month</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Year</button>
                  </div>
                </div>
                
                {/* Placeholder for chart */}
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <BarChart2 size={48} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Chart visualization area</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Recent Activity */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {profile.recentActivity.map((activity) => (
                    <div key={activity.id} className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${getActivityColor(activity.type)}`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-1">{activity.task}</p>
                          <p className="text-xs text-gray-500 mb-1">{activity.project}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              {profile.recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {index !== profile.recentActivity.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${getActivityColor(activity.type)} z-10`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{activity.task}</p>
                        <p className="text-sm text-gray-500">{activity.project}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{activity.time}</span>
                    </div>
                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md capitalize font-medium">
                      {activity.type.replaceAll(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Metrics</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Task Completion</span>
                    <span className="text-sm font-bold text-gray-900">{profile.stats.successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${profile.stats.successRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">On-time Delivery</span>
                    <span className="text-sm font-bold text-gray-900">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Quality Score</span>
                    <span className="text-sm font-bold text-gray-900">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Comparison</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50 rounded-xl text-center">
                  <p className="text-xs text-blue-600 font-medium mb-2">Last Month</p>
                  <p className="text-4xl font-bold text-blue-600">92%</p>
                </div>
                <div className="p-5 bg-green-50 rounded-xl text-center">
                  <p className="text-xs text-green-600 font-medium mb-2">This Month</p>
                  <p className="text-4xl font-bold text-green-600">{profile.stats.successRate}%</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-green-600" />
                  <span className="text-sm font-bold text-green-900">+2% improvement</span>
                </div>
                <p className="text-xs text-green-700">Keep up the great work!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
