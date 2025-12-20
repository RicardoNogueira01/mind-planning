import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
import { events as sharedEvents, holidays as sharedHolidays, categories as sharedCategories } from '../data/calendarData';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Filter,
  Grid3X3,
  List,
  Search,
  MoreVertical,
  Bell,
  Users,
  Tag
} from 'lucide-react';

const CalendarPage = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Use shared calendar data for consistency with dashboard widget
  const holidays = sharedHolidays;
  const events = sharedEvents;
  const categories = sharedCategories;

  // Navigation functions
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  // Get calendar dates for month view
  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // Adjust to show full weeks
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));

    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Get week dates for week view
  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const matchesDate = event.date === dateStr;
      const matchesSearch = searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      return matchesDate && matchesSearch && matchesCategory;
    });
  };

  // Get holidays for a specific date
  const getHolidaysForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Format time for display
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date range
  const getDateRangeText = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates();
      const start = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  // Month View Component
  const MonthView = () => {
    const dates = getMonthDates();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {dates.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const dayHolidays = getHolidaysForDate(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);
            const hasHoliday = dayHolidays.length > 0;

            return (
              <div
                key={index}
                className={`min-h-32 p-2 border-r border-b border-gray-100 ${hasHoliday ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
                  !isCurrentMonthDate ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-50 transition-colors`}
              >
                <div className={`text-sm font-medium mb-2 ${isTodayDate
                  ? 'text-white bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center'
                  : hasHoliday
                    ? 'text-purple-600'
                    : isCurrentMonthDate
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                  {date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayHolidays.map(holiday => (
                    <div
                      key={holiday.id}
                      className="text-xs p-1.5 rounded bg-white border-2 border-purple-200 shadow-sm"
                    >
                      <div className="flex items-center gap-1">
                        <span>{holiday.emoji}</span>
                        <div className="font-bold text-purple-700 truncate">{holiday.name}</div>
                      </div>
                    </div>
                  ))}
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm"
                      style={{ backgroundColor: event.color + '20', color: event.color }}
                      title={`${event.title} (${formatTime(event.startTime)} - ${formatTime(event.endTime)})`}
                    >
                      <div className="font-medium">{formatTime(event.startTime)} {event.title}</div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View Component
  const WeekView = () => {
    const weekDates = getWeekDates();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50"></div>
          {weekDates.map((date, index) => {
            const isTodayDate = isToday(date);
            return (
              <div key={index} className={`p-4 text-center border-l border-gray-200 ${isTodayDate ? 'bg-indigo-50' : 'bg-gray-50'
                }`}>
                <div className="text-sm font-medium text-gray-500">{dayNames[index]}</div>
                <div className={`text-lg font-semibold ${isTodayDate ? 'text-indigo-600' : 'text-gray-900'
                  }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-8 max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100 text-right">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {weekDates.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date).filter(event => {
                  const eventHour = parseInt(event.startTime.split(':')[0]);
                  return eventHour === hour;
                });

                return (
                  <div key={dayIndex} className="min-h-12 p-1 border-l border-b border-gray-100 relative">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded mb-1 cursor-pointer hover:shadow-sm"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                        title={event.description}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Day View Component
  const DayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Day header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Plus size={16} />
              Add Event
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = parseInt(event.startTime.split(':')[0]);
              return eventHour === hour;
            });

            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-4 text-sm text-gray-500 bg-gray-50 text-right">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 p-4 min-h-16">
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg mb-2 border-l-4 cursor-pointer hover:shadow-md transition-shadow"
                      style={{
                        backgroundColor: event.color + '10',
                        borderLeftColor: event.color
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </div>
                            {event.attendees && (
                              <div className="flex items-center gap-1">
                                <Users size={12} />
                                {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Tag size={12} />
                              {event.category}
                            </div>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TopBar showSearch={false} />
      <div className="p-3 md:p-6">
        {/* Header */}
        <header className="mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div className="flex-1 md:flex-initial">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-sm md:text-base text-gray-500">Manage your schedule and events</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation">
                <Plus size={16} />
                Add Event
              </button>
            </div>
          </div>
        </header>      {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col gap-3">
            {/* Top row: Navigation and Today button */}
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <div className="px-2 sm:px-3 md:px-4 py-2 font-semibold text-gray-900 text-center flex-1 text-xs sm:text-sm md:text-base">
                  {getDateRangeText()}
                </div>
                <button
                  onClick={() => navigateDate(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm whitespace-nowrap flex-shrink-0"
              >
                Today
              </button>
            </div>

            {/* Bottom row: Search, filters, and view mode */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Search and filters */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 text-sm whitespace-nowrap flex-shrink-0 ${showFilters ? 'bg-gray-50' : ''
                    }`}
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">{t('common.filters')}</span>
                </button>
              </div>

              {/* View mode toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial ${viewMode === 'month'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {t('common.month')}
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-l border-gray-300 flex-1 sm:flex-initial ${viewMode === 'week'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {t('common.week')}
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-l border-gray-300 flex-1 sm:flex-initial ${viewMode === 'day'
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {t('common.day')}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">{t('common.category')}</label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>        {/* Calendar Views */}
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
      </div>
    </div>
  );
};

export default CalendarPage;
