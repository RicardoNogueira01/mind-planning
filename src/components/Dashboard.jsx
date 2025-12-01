import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WeeklyCalendarWidget from './WeeklyCalendarWidget';
import TopBar from './shared/TopBar';
import { useLanguage } from '../context/LanguageContext';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users,
  ArrowRight,
  Activity,
  BarChart2,
  Circle
} from 'lucide-react';
import clsx from 'clsx';

const Dashboard = () => {
  const { t } = useLanguage();
  
  // Get current date info
  const getCurrentDayInfo = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    const monthIndex = now.getMonth();
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    
    return {
      dayName: t(`greeting.${dayNames[dayIndex]}`),
      day: now.getDate(),
      month: t(`greeting.${monthNames[monthIndex]}`),
      year: now.getFullYear()
    };
  };

  const dateInfo = getCurrentDayInfo();
  
  // Sample data - in a real app, this would come from your state or API
  const [stats] = useState({
    tasksCompleted: 32,
    tasksInProgress: 18,
    tasksNotStarted: 12,
    totalTasks: 62,
    overdueTasks: 5
  });
  
  const [collaborators] = useState([
    { id: 'jd', name: 'John Doe', initials: 'JD', color: 'bg-blue-500', tasksAssigned: 14, tasksCompleted: 8, overdueTasks: 2 },
    { id: 'ak', name: 'Alex Kim', initials: 'AK', color: 'bg-green-500', tasksAssigned: 20, tasksCompleted: 15, overdueTasks: 0 },
    { id: 'mr', name: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', tasksAssigned: 18, tasksCompleted: 5, overdueTasks: 3 },
    { id: 'ts', name: 'Taylor Smith', initials: 'TS', color: 'bg-purple-500', tasksAssigned: 10, tasksCompleted: 4, overdueTasks: 0 }
  ]);
  
  const [recentCompletedTasks] = useState([
    { id: 1, title: 'Finalize design mockups', completedBy: 'Alex Kim', initials: 'AK', color: 'bg-green-500', completedAt: '2 hours ago' },
    { id: 2, title: 'Review sprint backlog', completedBy: 'John Doe', initials: 'JD', color: 'bg-blue-500', completedAt: '4 hours ago' },
    { id: 3, title: 'Update user documentation', completedBy: 'Taylor Smith', initials: 'TS', color: 'bg-purple-500', completedAt: 'Yesterday' },
    { id: 4, title: 'Prepare presentation slides', completedBy: 'Alex Kim', initials: 'AK', color: 'bg-green-500', completedAt: 'Yesterday' },
    { id: 5, title: 'Client feedback meeting', completedBy: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', completedAt: '2 days ago' }
  ]);
  
  const [upcomingDeadlines] = useState([
    { id: 1, title: 'API integration testing', assignedTo: 'John Doe', initials: 'JD', color: 'bg-blue-500', dueDate: 'today', status: 'danger' },
    { id: 2, title: 'Create social media campaign', assignedTo: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', dueDate: 'today', status: 'danger' },
    { id: 3, title: 'Update project timeline', assignedTo: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', dueDate: 'tomorrow', status: 'warning' },
    { id: 4, title: 'Finalize Q1 budget', assignedTo: 'Alex Kim', initials: 'AK', color: 'bg-green-500', dueDate: '2', status: 'warning' },
    { id: 5, title: 'Prepare meeting agenda', assignedTo: 'Taylor Smith', initials: 'TS', color: 'bg-purple-500', dueDate: '3', status: 'warning' }
  ]);
  
  // Function to format due dates with translation
  const formatDueDate = (dueDate) => {
    if (dueDate === 'today') return t('activity.today');
    if (dueDate === 'tomorrow') return t('activity.tomorrow');
    return `${t('activity.inDays')} ${dueDate} ${t('holidays.days')}`;
  };
  
  const [upcomingHolidays] = useState([
    { id: 1, name: 'First Friday', date: '2025-12-05', daysUntil: 4, emoji: '🎉', color: 'bg-blue-500', type: 'country' },
    { id: 2, name: 'Christmas Day', date: '2025-12-25', daysUntil: 25, emoji: '🎄', color: 'bg-red-500', type: 'country' },
    { id: 3, name: 'New Year\'s Day', date: '2026-01-01', daysUntil: 32, emoji: '🎆', color: 'bg-indigo-500', type: 'country' },
    { id: 4, name: 'Valentine\'s Day', date: '2026-02-14', daysUntil: 76, emoji: '💝', color: 'bg-pink-500', type: 'country' },
    { id: 5, name: 'Easter Sunday', date: '2026-04-20', daysUntil: 141, emoji: '🐰', color: 'bg-purple-500', type: 'country' }
  ]);
  
  const [teamHolidayRequests] = useState([
    { 
      id: 1, 
      employeeName: 'Alex Kim', 
      initials: 'AK', 
      color: 'bg-green-500', 
      startDate: '20 Dec', 
      endDate: '27 Dec',
      days: 5,
      status: 'approved',
      reason: 'Christmas vacation'
    },
    { 
      id: 2, 
      employeeName: 'John Doe', 
      initials: 'JD', 
      color: 'bg-blue-500', 
      startDate: '2 Jan', 
      endDate: '5 Jan',
      days: 3,
      status: 'pending',
      reason: 'Family trip'
    },
    { 
      id: 3, 
      employeeName: 'Maria Rodriguez', 
      initials: 'MR', 
      color: 'bg-yellow-500', 
      startDate: '15 Dec', 
      endDate: '18 Dec',
      days: 3,
      status: 'approved',
      reason: 'Personal matters'
    },
    { 
      id: 4, 
      employeeName: 'Taylor Smith', 
      initials: 'TS', 
      color: 'bg-purple-500', 
      startDate: '28 Dec', 
      endDate: '31 Dec',
      days: 2,
      status: 'pending',
      reason: 'Year-end break'
    },
    { 
      id: 5, 
      employeeName: 'John Doe', 
      initials: 'JD', 
      color: 'bg-blue-500', 
      startDate: '10 Dec', 
      endDate: '12 Dec',
      days: 2,
      status: 'canceled',
      reason: 'Project deadline'
    }
  ]);
  
  // Calculate completion percentage
  const completionPercentage = Math.round((stats.tasksCompleted / stats.totalTasks) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <TopBar showSearch={true} />

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {/* Greeting Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-2">
                {t('greeting.hello')}, John Doe 👋
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                {dateInfo.dayName}, {dateInfo.month} {dateInfo.day}, {dateInfo.year}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {t('greeting.subtitle')}
              </p>
            </div>
            <Link 
              to="/mindmaps" 
              className="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm touch-manipulation transform hover:scale-[1.02]"
            >
              <Activity size={18} />
              {t('buttons.openMindMaps')}
            </Link>
          </div>
        </div>

      {/* Main Content */}
      <main>
        {/* Quick Stats Overview with Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Completion Progress Card - Featured */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">{t('stats.overallProgress')}</p>
                  <h2 className="text-5xl md:text-6xl font-bold">{completionPercentage}%</h2>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BarChart2 size={24} />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-3 bg-white rounded-full shadow-lg transition-all duration-1000" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold">{stats.tasksCompleted}</p>
                  <p className="text-xs text-blue-100 mt-1">{t('stats.completed')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold">{stats.tasksInProgress}</p>
                  <p className="text-xs text-blue-100 mt-1">{t('stats.inProgress')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold">{stats.tasksNotStarted}</p>
                  <p className="text-xs text-blue-100 mt-1">{t('stats.toStart')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Status Card */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">{t('stats.taskStatus').toUpperCase()}</p>
                <h2 className="text-xl font-bold text-gray-900">{t('stats.status')}</h2>
              </div>
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <Activity size={20} />
              </div>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{t('stats.completed')}</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">{stats.tasksCompleted}</span>
              </div>
              
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform">
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{t('stats.inProgress')}</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">{stats.tasksInProgress}</span>
              </div>
              
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-100 rounded-lg group-hover:scale-110 transition-transform">
                    <Circle size={16} className="text-gray-500" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{t('stats.notStarted')}</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">{stats.tasksNotStarted}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 group">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-red-100 rounded-lg group-hover:scale-110 transition-transform">
                    <AlertTriangle size={16} className="text-red-600" />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{t('stats.overdue')}</span>
                </div>
                <span className="text-red-600 font-bold text-lg">{stats.overdueTasks}</span>
              </div>
            </div>
          </div>

          {/* Team Overview Card */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">{t('stats.team').toUpperCase()}</p>
                <h2 className="text-xl font-bold text-gray-900">{collaborators.length} {t('stats.members')}</h2>
              </div>
              <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                <Users size={20} />
              </div>
            </div>
            
            <div className="space-y-3">
              {collaborators.slice(0, 3).map(collab => (
                <div key={collab.id} className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-xl -m-2 transition-colors">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:scale-105 transition-transform", collab.color)}>
                    {collab.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{collab.name.split(' ')[0]}</h3>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-semibold', {
                        'bg-red-100 text-red-700': collab.overdueTasks > 0,
                        'bg-emerald-100 text-emerald-700': collab.overdueTasks === 0
                      })}>
                        {collab.overdueTasks > 0 ? `${collab.overdueTasks} ${t('stats.overdueTasks')}` : t('stats.onTrack')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={clsx("h-1.5 rounded-full", collab.color)} 
                          style={{ width: `${(collab.tasksCompleted / collab.tasksAssigned) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{collab.tasksCompleted}/{collab.tasksAssigned}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Link 
              to="/team-members" 
              className="w-full mt-4 text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors py-2 hover:bg-blue-50 rounded-lg"
            >
              <span>{t('stats.viewAllMembers')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Holidays Section - Country & Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-6">
          {/* Next Holiday - Compact */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                  <span className="text-xl">🎉</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{t('holidays.nextHoliday')}</h2>
                  <p className="text-xs text-gray-500">{t('holidays.subtitle')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {upcomingHolidays.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg", upcomingHolidays[0].color, "bg-opacity-20")}>
                    {upcomingHolidays[0].emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {upcomingHolidays[0].name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(upcomingHolidays[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={clsx("px-3 py-1 rounded-full text-sm font-bold text-white", upcomingHolidays[0].color)}>
                        {upcomingHolidays[0].daysUntil} {t('holidays.days')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Holiday Requests Summary */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{t('holidays.teamTitle')}</h2>
                  <p className="text-xs text-gray-500">{t('holidays.teamSubtitle')}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-green-600">
                    {teamHolidayRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-[10px] text-gray-600 font-medium">{t('holidays.approved')}</p>
                </div>
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-amber-600">
                    {teamHolidayRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-[10px] text-gray-600 font-medium">{t('holidays.pending')}</p>
                </div>
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-gray-500">
                    {teamHolidayRequests.filter(r => r.status === 'canceled').length}
                  </p>
                  <p className="text-[10px] text-gray-600 font-medium">{t('holidays.canceled')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {teamHolidayRequests
                  .filter(req => req.status !== 'canceled')
                  .slice(0, 3)
                  .map((request) => (
                    <div 
                      key={request.id} 
                      className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-2.5 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm", request.color)}>
                          {request.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {request.employeeName}
                            </h3>
                            <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap', {
                              'bg-green-100 text-green-700': request.status === 'approved',
                              'bg-amber-100 text-amber-700': request.status === 'pending'
                            })}>
                              {request.status === 'approved' ? `✓` : `⏱`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            {request.startDate} - {request.endDate}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{request.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              <Link 
                to="/team-holidays" 
                className="w-full text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors py-2 hover:bg-blue-50 rounded-lg"
              >
                <span>{t('holidays.viewAllRequests')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-5 md:p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{t('activity.recentTitle')}</h2>
                    <p className="text-xs text-gray-500">{t('activity.recentSubtitle')}</p>
                  </div>
                </div>
                <Link to="/completed-tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold hover:gap-2 transition-all">
                  <span className="hidden sm:inline">{t('activity.viewAll')}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="p-4 md:p-5">
              <div className="space-y-2">
                {recentCompletedTasks.map((task, idx) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform", task.color)}>
                      {task.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{task.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{t('activity.completedBy')} {task.completedBy}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{task.completedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Deadlines */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-white p-5 md:p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{t('activity.deadlinesTitle')}</h2>
                    <p className="text-xs text-gray-500">{t('activity.deadlinesSubtitle')}</p>
                  </div>
                </div>
                <Link to="/upcoming-deadlines" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold hover:gap-2 transition-all">
                  <span className="hidden sm:inline">{t('activity.viewAll')}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="p-4 md:p-5">
              <div className="space-y-2">
                {upcomingDeadlines.map((task, idx) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform", task.color)}>
                      {task.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{task.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{task.assignedTo}</p>
                    </div>
                    <span className={clsx('text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap', {
                      'bg-red-100 text-red-700': task.status === 'danger',
                      'bg-amber-100 text-amber-700': task.status === 'warning'
                    })}>
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Calendar Widget */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <WeeklyCalendarWidget holidays={upcomingHolidays} />
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard;