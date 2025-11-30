import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Edit2,
  Settings,
  Activity,
  BarChart2,
  Target,
  Star,
  Zap
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
    color: '#10B981',
    role: 'Senior Developer',
    department: 'Engineering',
    email: 'alex.kim@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 15, 2023',
    bio: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Love working with React, Node.js, and cloud technologies.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'GraphQL', 'MongoDB'],
    stats: {
      tasksCompleted: 248,
      tasksInProgress: 12,
      overdueTasks: 2,
      completionRate: 94,
      avgTimeToComplete: '2.3 days',
      projectsWorked: 15
    },
    performance: {
      current: 'excellent',
      trend: 'up',
      lastMonth: 92,
      thisMonth: 94
    },
    recentActivity: [
      { id: 1, type: 'completed', task: 'API Integration', time: '2 hours ago', project: 'Project Alpha' },
      { id: 2, type: 'started', task: 'Database Migration', time: '5 hours ago', project: 'Project Beta' },
      { id: 3, type: 'commented', task: 'UI Redesign', time: '1 day ago', project: 'Project Gamma' },
      { id: 4, type: 'completed', task: 'Security Audit', time: '2 days ago', project: 'Project Alpha' },
      { id: 5, type: 'reviewed', task: 'Code Review PR #342', time: '3 days ago', project: 'Project Beta' }
    ],
    achievements: [
      { id: 1, title: 'Speed Demon', description: 'Completed 50 tasks ahead of schedule', icon: Zap, color: 'yellow' },
      { id: 2, title: 'Team Player', description: 'Helped 20+ team members', icon: Users, color: 'blue' },
      { id: 3, title: 'Quality Champion', description: 'Maintained 98% code quality', icon: Star, color: 'purple' },
      { id: 4, title: 'Goal Crusher', description: 'Hit all Q4 targets', icon: Target, color: 'green' }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'performance', label: 'Performance', icon: BarChart2 }
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'completed': return CheckCircle;
      case 'started': return Clock;
      case 'commented': return Mail;
      case 'reviewed': return Award;
      default: return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'started': return 'text-blue-600 bg-blue-100';
      case 'commented': return 'text-purple-600 bg-purple-100';
      case 'reviewed': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar showSearch={false} />
      <div className="p-3 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500">View and manage profile information</p>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="px-6 pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-4 md:mb-0">
                <div 
                  className="w-32 h-32 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl ring-4 ring-white"
                  style={{ backgroundColor: profile.color }}
                >
                  {profile.initials}
                </div>
                <div className="pb-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                  <p className="text-lg text-gray-600 mb-2">{profile.role}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">
                      {profile.department}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-lg font-medium ${
                      profile.performance.current === 'excellent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {profile.performance.current.charAt(0).toUpperCase() + profile.performance.current.slice(1)} Performance
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/profile/${profile.id}/edit`}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </Link>
                <Link
                  to={`/profile/${profile.id}/settings`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Settings size={16} />
                  Settings
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">{profile.location}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg font-medium hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
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
            {/* Statistics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Completed</p>
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{profile.stats.tasksCompleted}</p>
                  <p className="text-xs text-gray-500 mt-1">Total tasks</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <Clock size={20} className="text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{profile.stats.tasksInProgress}</p>
                  <p className="text-xs text-gray-500 mt-1">Active tasks</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Overdue</p>
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{profile.stats.overdueTasks}</p>
                  <p className="text-xs text-gray-500 mt-1">Need attention</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <TrendingUp size={20} className="text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{profile.stats.completionRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Completion rate</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Avg Time</p>
                    <Clock size={20} className="text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.avgTimeToComplete}</p>
                  <p className="text-xs text-gray-500 mt-1">Per task</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Projects</p>
                    <Briefcase size={20} className="text-indigo-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{profile.stats.projectsWorked}</p>
                  <p className="text-xs text-gray-500 mt-1">Contributed to</p>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    const colorClasses = {
                      yellow: 'bg-yellow-100 text-yellow-600',
                      blue: 'bg-blue-100 text-blue-600',
                      purple: 'bg-purple-100 text-purple-600',
                      green: 'bg-green-100 text-green-600'
                    };
                    return (
                      <div key={achievement.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`p-3 rounded-lg ${colorClasses[achievement.color]}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar - Recent Activity */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {profile.recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">{activity.task}</p>
                          <p className="text-xs text-gray-500">{activity.project}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="text-sm font-medium text-gray-900">{profile.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm font-medium text-gray-900">{profile.department}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              {profile.recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex gap-4 relative">
                    {index !== profile.recentActivity.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)} z-10`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{activity.task}</p>
                          <p className="text-sm text-gray-600">{activity.project}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{activity.time}</span>
                      </div>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Task Completion</span>
                    <span className="text-sm font-bold text-gray-900">{profile.stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${profile.stats.completionRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">On-time Delivery</span>
                    <span className="text-sm font-bold text-gray-900">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Quality Score</span>
                    <span className="text-sm font-bold text-gray-900">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Comparison</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Last Month</p>
                  <p className="text-3xl font-bold text-blue-900">{profile.performance.lastMonth}%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-green-900">{profile.performance.thisMonth}%</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">+2% improvement</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Keep up the great work!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
