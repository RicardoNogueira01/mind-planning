import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WeeklyCalendarWidget from './WeeklyCalendarWidget';
import TopBar from './shared/TopBar';
import { StatCard, CardHeader, ProgressBar, AvatarWithInitials } from './shared';
import { useLanguage } from '../context/LanguageContext';
// @ts-ignore
import { useTheme } from '../context/ThemeContext';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Activity,
  BarChart2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Map,
  Star,
  Bell,
  Shield,
  Settings,
  Palmtree,
  CalendarDays,
  Palette,
  PartyPopper,
  Check
} from 'lucide-react';
import clsx from 'clsx';


const Dashboard = () => {
  const { t } = useLanguage();
  // @ts-ignore
  const { currentTheme, setCurrentTheme, isBirthdayMode, toggleBirthdayMode, themes } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useNavigate();
  const [currentHolidayIndex, setCurrentHolidayIndex] = useState(0);

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

  const [recentMindMaps] = useState([
    {
      id: 1,
      title: 'Q1 Marketing Strategy',
      lastModified: '2 hours ago',
      nodeCount: 24,
      color: 'bg-blue-500',
      isFavorite: true,
      createdBy: 'Alex Kim',
      initials: 'AK',
      avatarColor: 'bg-green-500'
    },
    {
      id: 2,
      title: 'Product Development Roadmap',
      lastModified: '5 hours ago',
      nodeCount: 18,
      color: 'bg-purple-500',
      isFavorite: false,
      createdBy: 'John Doe',
      initials: 'JD',
      avatarColor: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'Team Brainstorming Session',
      lastModified: 'Yesterday',
      nodeCount: 32,
      color: 'bg-green-500',
      isFavorite: true,
      createdBy: 'Maria Rodriguez',
      initials: 'MR',
      avatarColor: 'bg-yellow-500'
    },
    {
      id: 4,
      title: 'Project Alpha Planning',
      lastModified: '2 days ago',
      nodeCount: 15,
      color: 'bg-orange-500',
      isFavorite: false,
      createdBy: 'Taylor Smith',
      initials: 'TS',
      avatarColor: 'bg-purple-500'
    }
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
                {isBirthdayMode ? 'Happy Birthday' : (themes.find(t => t.id === currentTheme)?.greeting || t('greeting.hello'))}, John Doe {isBirthdayMode ? '🎂' : (themes.find(t => t.id === currentTheme)?.emoji || '👋')}
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                {dateInfo.dayName}, {dateInfo.month} {dateInfo.day}, {dateInfo.year}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {t('greeting.subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Birthday Toggle */}
              <button
                onClick={toggleBirthdayMode}
                className={`px-3 md:px-4 py-2.5 md:py-3 border ${isBirthdayMode ? 'bg-pink-50 border-pink-200 text-pink-600' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'} rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap touch-manipulation shadow-sm`}
                aria-label="Toggle Birthday Mode"
              >
                <PartyPopper size={18} className={isBirthdayMode ? 'text-pink-500' : ''} />
                <span className="hidden sm:inline">{isBirthdayMode ? 'Birthday On!' : 'Test Birthday'}</span>
              </button>

              {/* Theme Dropdown */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap touch-manipulation min-w-[140px] justify-between shadow-sm"
                  aria-label="Theme selector"
                >
                  <div className="flex items-center gap-2">
                    <Palette size={18} />
                    <span>{themes.find((t) => t.id === currentTheme)?.name || 'Theme'}</span>
                  </div>
                  {themes.find((t) => t.id === currentTheme)?.icon || ''}
                </button>

                {showThemeMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 animate-scale-in origin-top-right">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setCurrentTheme(theme.id);
                          setShowThemeMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{theme.icon}</span>
                          <span className={`font-medium ${currentTheme === theme.id ? 'text-blue-600' : 'text-gray-700'}`}>
                            {theme.name}
                          </span>
                        </div>
                        {currentTheme === theme.id && <Check size={14} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/mindmaps"
                className="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-semibold shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm touch-manipulation transform hover:scale-[1.02]"
              >
                <Activity size={18} />
                {t('buttons.openMindMaps')}
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Overview with Modern Cards */}
        <div className="space-y-6 mb-6 md:mb-8">
          {/* Completion Progress Card - Featured - Full Width */}
          <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full -ml-16 -mb-16"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Overall Progress
                </p>
                <h2 className="text-6xl font-bold mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {completionPercentage}%
                </h2>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden max-w-md">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-lg transition-all duration-1000 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {stats.tasksCompleted} of {stats.totalTasks} tasks completed
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <p className="text-5xl font-bold mb-1" style={{ fontFamily: 'DM Mono, monospace', color: '#10B981' }}>
                    {stats.tasksCompleted}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Completed
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <p className="text-5xl font-bold mb-1" style={{ fontFamily: 'DM Mono, monospace', color: '#3B82F6' }}>
                    {stats.tasksInProgress}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    In Progress
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <p className="text-5xl font-bold mb-1" style={{ fontFamily: 'DM Mono, monospace', color: '#9CA3AF' }}>
                    {stats.tasksNotStarted}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Not Started
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                  <p className="text-5xl font-bold mb-1" style={{ fontFamily: 'DM Mono, monospace', color: '#EF4444' }}>
                    {stats.overdueTasks}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Overdue
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Mind Maps Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <CardHeader
              icon={Map}
              title="Recent Mind Maps"
              subtitle="Recently modified maps"
              viewAllLink="/mindmaps"
            />

            <div className="space-y-3">
              {recentMindMaps.map((mindMap) => (
                <div
                  key={mindMap.id}
                  onClick={() => navigate(`/mindmap/${mindMap.id}`)}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-200"
                >
                  {/* Top row on mobile: Icon + Title + Avatar */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Mind Map Icon/Color */}
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 ${mindMap.color} rounded-lg sm:rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                      <Map size={16} className="sm:hidden" />
                      <Map size={24} className="hidden sm:block" />
                    </div>

                    {/* Mind Map Title (mobile) */}
                    <div className="flex-1 min-w-0 sm:hidden">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-semibold text-gray-900 truncate text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {mindMap.title}
                        </h3>
                        {mindMap.isFavorite && (
                          <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Creator Avatar (mobile - top right) */}
                    <div className="sm:hidden flex items-center gap-1.5 flex-shrink-0">
                      <div className={`w-7 h-7 ${mindMap.avatarColor} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                        {mindMap.initials}
                      </div>
                      <ArrowRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>

                  {/* Mind Map Info (desktop layout) */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    {/* Title for desktop only */}
                    <div className="hidden sm:flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        {mindMap.title}
                      </h3>
                      {mindMap.isFavorite && (
                        <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Stats - always visible */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 sm:mt-0">
                      <span className="flex items-center gap-1">
                        <Circle size={8} className="fill-gray-400 text-gray-400 sm:hidden" />
                        <Circle size={10} className="fill-gray-400 text-gray-400 hidden sm:block" />
                        {mindMap.nodeCount} nodes
                      </span>
                      <span>•</span>
                      <span className="text-xs">{mindMap.lastModified}</span>
                    </div>
                  </div>

                  {/* Creator Avatar (desktop only) */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <div className={`w-8 h-8 ${mindMap.avatarColor} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                      {mindMap.initials}
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team and Team Holidays - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Team Overview Card */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <CardHeader
                icon={Users}
                title="Team"
                subtitle={`${collaborators.length} Members`}
                onViewAllClick={() => navigate('/team-members')}
              />

              <div className="space-y-4 sm:space-y-5">
                {collaborators.map(collab => (
                  <div key={collab.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Mobile: Avatar and name in one row */}
                    <div className="flex items-center gap-3 sm:gap-0">
                      <AvatarWithInitials
                        initials={collab.initials}
                        color={collab.color}
                        size="md"
                        className="sm:w-12 sm:h-12"
                      />
                      <div className="flex-1 sm:hidden">
                        <h3 className="font-semibold text-gray-900 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{collab.name}</h3>
                        <span className="text-xs font-mono text-gray-500" style={{ fontFamily: 'DM Mono, monospace' }}>{collab.tasksCompleted}/{collab.tasksAssigned}</span>
                      </div>
                      <span className={clsx('text-[10px] sm:hidden px-2 py-1 rounded-md font-medium flex items-center gap-1 whitespace-nowrap', {
                        'bg-red-50 text-red-600': collab.overdueTasks > 0,
                        'bg-emerald-50 text-emerald-600': collab.overdueTasks === 0
                      })} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        <span className={clsx("w-1.5 h-1.5 rounded-full", {
                          'bg-red-600': collab.overdueTasks > 0,
                          'bg-emerald-600': collab.overdueTasks === 0
                        })}></span>
                        {collab.overdueTasks > 0 ? `${collab.overdueTasks} overdue` : 'On track'}
                      </span>
                    </div>

                    {/* Desktop: Full layout */}
                    <div className="flex-1 min-w-0">
                      <div className="hidden sm:flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>{collab.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-gray-500" style={{ fontFamily: 'DM Mono, monospace' }}>{collab.tasksCompleted}/{collab.tasksAssigned}</span>
                          <span className={clsx('text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1', {
                            'bg-red-50 text-red-600': collab.overdueTasks > 0,
                            'bg-emerald-50 text-emerald-600': collab.overdueTasks === 0
                          })} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            <span className={clsx("w-1.5 h-1.5 rounded-full", {
                              'bg-red-600': collab.overdueTasks > 0,
                              'bg-emerald-600': collab.overdueTasks === 0
                            })}></span>
                            {collab.overdueTasks > 0 ? `${collab.overdueTasks} overdue` : 'On track'}
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        percentage={(collab.tasksCompleted / collab.tasksAssigned) * 100}
                        color={collab.color}
                        bgColor="bg-gray-100"
                        height="h-2"
                        animated={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Holiday Requests Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <CardHeader
                icon={Users}
                title="Team Holidays"
                subtitle="Holiday requests"
                viewAllLink="/team-holidays"
              />

              {/* Statistics Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {teamHolidayRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>Approved</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {teamHolidayRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pending</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {teamHolidayRequests.filter(r => r.status === 'canceled').length}
                  </p>
                  <p className="text-xs text-gray-600 font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>Canceled</p>
                </div>
              </div>

              {/* Holiday Requests List */}
              <div className="space-y-3">
                {teamHolidayRequests
                  .filter(req => req.status !== 'canceled')
                  .slice(0, 3)
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-3 sm:gap-4 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className={clsx("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0", request.color)}>
                        {request.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            {request.employeeName}
                          </h3>
                          <span className={clsx('text-base flex-shrink-0', {
                            'text-green-600': request.status === 'approved',
                            'text-amber-600': request.status === 'pending'
                          })}>
                            {request.status === 'approved' ? '✓' : '🕐'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {request.startDate} - {request.endDate}
                        </p>
                        <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{request.reason}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        {/* Leave Balance & Deadline Reminders - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* My Leave Balance Card - For Team Members */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <CardHeader
              icon={Palmtree}
              title="My Leave Balance"
              subtitle="Track your vacation and time off"
              viewAllLink="/my-leave"
              iconBgColor="bg-teal-50"
              iconColor="text-teal-600"
            />

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mb-4">
              <StatCard
                value={13}
                label="Available"
                icon={CalendarDays}
                iconColor="text-teal-500"
                bgColor="bg-teal-50"
                borderColor="border-teal-200"
                valueColor="text-teal-600"
              />
              <StatCard
                value={3}
                label="Pending"
                icon={Clock}
                iconColor="text-amber-500"
                bgColor="bg-amber-50"
                borderColor="border-amber-200"
                valueColor="text-amber-600"
              />
              <StatCard
                value={8}
                label="Used"
                icon={CheckCircle}
                iconColor="text-gray-500"
                bgColor="bg-gray-50"
                borderColor="border-gray-200"
                valueColor="text-gray-600"
              />
            </div>

            {/* Actions */}
            <Link
              to="/my-leave"
              className="w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Palmtree size={16} />
              Request Leave
            </Link>
          </div>

          {/* Deadline Reminders Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <CardHeader
              icon={Bell}
              title="Deadline Reminders"
              subtitle="Automatic reminders for approaching deadlines"
              viewAllLink="/reminders"
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mb-4">
              <StatCard
                value={stats.overdueTasks}
                label="Overdue"
                icon={AlertTriangle}
                iconColor="text-red-500"
                bgColor="bg-red-50"
                borderColor="border-red-200"
                valueColor="text-red-600"
              />
              <StatCard
                value={2}
                label="Due Today"
                icon={Clock}
                iconColor="text-orange-500"
                bgColor="bg-orange-50"
                borderColor="border-orange-200"
                valueColor="text-orange-600"
              />
              <StatCard
                value={8}
                label="This Week"
                icon={Clock}
                iconColor="text-blue-500"
                bgColor="bg-blue-50"
                borderColor="border-blue-200"
                valueColor="text-blue-600"
              />
            </div>

            {/* Actions */}
            <Link
              to="/reminders"
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Bell size={16} />
              Create Reminder
            </Link>
          </div>
        </div>

        {/* Next Holiday Banner - Compact with Carousel */}
        <div className="mb-6">
          {upcomingHolidays.length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Arrow */}
                <button
                  onClick={() => setCurrentHolidayIndex((prev) => (prev === 0 ? upcomingHolidays.length - 1 : prev - 1))}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  disabled={upcomingHolidays.length === 1}
                >
                  <ChevronLeft size={18} className={upcomingHolidays.length === 1 ? 'text-gray-300' : 'text-gray-600'} />
                </button>

                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                    {upcomingHolidays[currentHolidayIndex].emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {currentHolidayIndex === 0 ? 'Next Holiday' : `Upcoming Holiday ${currentHolidayIndex + 1}`}
                    </p>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {upcomingHolidays[currentHolidayIndex].name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {new Date(upcomingHolidays[currentHolidayIndex].date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-600 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-center flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-white leading-none mb-0.5 sm:mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {upcomingHolidays[currentHolidayIndex].daysUntil}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/90 font-medium uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Days
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setCurrentHolidayIndex((prev) => (prev === upcomingHolidays.length - 1 ? 0 : prev + 1))}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  disabled={upcomingHolidays.length === 1}
                >
                  <ChevronRight size={18} className={upcomingHolidays.length === 1 ? 'text-gray-300' : 'text-gray-600'} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <CheckCircle className="text-gray-700" size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Recent Activity</h2>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'DM Sans, sans-serif' }}>Completed tasks</p>
                </div>
              </div>
              <Link
                to="/completed-tasks"
                className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors whitespace-nowrap"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 sm:px-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div>TODAY</div>
              </div>
              {recentCompletedTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0", task.color)}>
                      {task.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{task.title}</h3>
                      <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{task.completedBy}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium pl-10 sm:pl-0" style={{ fontFamily: 'DM Mono, monospace' }}>{task.completedAt}</span>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 sm:px-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div>YESTERDAY</div>
              </div>
              {recentCompletedTasks.slice(2).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0", task.color)}>
                      {task.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{task.title}</h3>
                      <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{task.completedBy}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium pl-10 sm:pl-0" style={{ fontFamily: 'DM Mono, monospace' }}>{task.completedAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Clock className="text-gray-700" size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Deadlines</h2>
                  <p className="text-xs text-gray-500" style={{ fontFamily: 'DM Sans, sans-serif' }}>Upcoming due dates</p>
                </div>
              </div>
              <Link
                to="/upcoming-deadlines"
                className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors whitespace-nowrap"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0", task.color)}>
                      {task.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{task.title}</h3>
                      <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>{task.assignedTo}</p>
                    </div>
                  </div>
                  <span className={clsx('text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg whitespace-nowrap tracking-wide self-start sm:self-center ml-10 sm:ml-0', {
                    'bg-red-50 text-red-600': task.status === 'danger',
                    'bg-amber-50 text-amber-600': task.status === 'warning'
                  })} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Calendar Widget */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <WeeklyCalendarWidget holidays={upcomingHolidays} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;