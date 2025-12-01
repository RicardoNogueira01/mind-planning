import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus } from 'lucide-react';
import PropTypes from 'prop-types';

const WeeklyCalendarWidget = ({ holidays = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sample tasks data - in a real app, this would come from props or state
  const [tasks] = useState([
    {
      id: 1,
      title: 'Team standup',
      time: '09:00',
      date: '2025-12-01',
      color: '#3B82F6',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'API review',
      time: '14:30',
      date: '2025-12-01',
      color: '#10B981',
      type: 'review'
    },
    {
      id: 3,
      title: 'Client presentation',
      time: '16:00',
      date: '2025-12-02',
      color: '#F59E0B',
      type: 'presentation'
    },
    {
      id: 4,
      title: 'Design workshop',
      time: '10:00',
      date: '2025-12-03',
      color: '#8B5CF6',
      type: 'workshop'
    },
    {
      id: 5,
      title: 'Sprint planning',
      time: '15:00',
      date: '2025-12-03',
      color: '#EF4444',
      type: 'planning'
    },
    {
      id: 6,
      title: 'Code review',
      time: '11:00',
      date: '2025-12-04',
      color: '#06B6D4',
      type: 'review'
    },
    {
      id: 7,
      title: 'Product demo',
      time: '13:30',
      date: '2025-12-05',
      color: '#84CC16',
      type: 'demo'
    },
    {
      id: 8,
      title: 'Team retrospective',
      time: '09:30',
      date: '2025-12-05',
      color: '#F97316',
      type: 'meeting'
    },
    {
      id: 9,
      title: 'User testing',
      time: '14:00',
      date: '2025-12-06',
      color: '#EC4899',
      type: 'testing'
    },
    {
      id: 10,
      title: 'Weekly report',
      time: '16:30',
      date: '2025-12-07',
      color: '#6366F1',
      type: 'report'
    }
  ]);

  // Get current week's dates
  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);
  const today = new Date();

  // Navigate weeks
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateStr).slice(0, 3); // Max 3 tasks per day
  };

  // Get holidays for a specific date
  const getHolidaysForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => holiday.date === dateStr);
  };

  // Check if date is today
  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Day names
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
            <Calendar size={18} className="md:hidden" />
            <Calendar size={20} className="hidden md:block" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">This Week</h2>
            <p className="text-xs md:text-sm text-gray-500 truncate">{formatDate(weekDates[0])} - {formatDate(weekDates[6])}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 md:px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
          <Link
            to="/calendar"
            className="px-2 md:px-3 py-1.5 text-xs font-medium bg-gray-800 text-white hover:bg-gray-900 rounded-lg transition-colors touch-manipulation whitespace-nowrap"
          >
            <span className="hidden sm:inline">Full Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </Link>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const dayHolidays = getHolidaysForDate(date);
          const isTodayDate = isToday(date);
          const hasHoliday = dayHolidays.length > 0;
          
          return (
            <div
              key={index}
              className={`p-2 md:p-3 rounded-lg border-2 transition-colors ${
                hasHoliday
                  ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50'
                  : isTodayDate 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Day header */}
              <div className="text-center mb-2 md:mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {dayNames[index]}
                </div>
                <div className={`text-base md:text-lg font-semibold ${
                  hasHoliday ? 'text-purple-600' : isTodayDate ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Holidays */}
              {dayHolidays.map(holiday => (
                <div
                  key={holiday.id}
                  className="mb-2 p-2 rounded-lg bg-white border-2 border-purple-200 shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{holiday.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] md:text-xs font-bold text-purple-700 line-clamp-1">
                        {holiday.name}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-purple-600 font-medium">
                        Holiday
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tasks */}
              <div className="space-y-1">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-1.5 md:p-2 rounded-md border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer touch-manipulation"
                    style={{ 
                      borderLeftColor: task.color,
                      borderLeftWidth: '2px'
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock size={9} className="text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] md:text-xs text-gray-500 truncate">{task.time}</span>
                    </div>
                    <div className="text-[10px] md:text-xs font-medium text-gray-800 line-clamp-2">
                      {task.title}
                    </div>
                  </div>
                ))}
                
                {/* Show more indicator if there are more tasks */}
                {tasks.filter(task => task.date === date.toISOString().split('T')[0]).length > 3 && (
                  <div className="text-[10px] md:text-xs text-gray-400 text-center py-1">
                    +{tasks.filter(task => task.date === date.toISOString().split('T')[0]).length - 3}
                  </div>
                )}

                {/* Empty state for days with no tasks or holidays */}
                {dayTasks.length === 0 && dayHolidays.length === 0 && (
                  <div className="text-center py-2 md:py-4">
                    <button className="w-5 h-5 md:w-6 md:h-6 border border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group touch-manipulation">
                      <Plus size={10} className="text-gray-400 group-hover:text-gray-600 md:w-3 md:h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 md:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs md:text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>Total: {tasks.filter(task => {
            const taskDate = new Date(task.date);
            return weekDates.some(date => date.toDateString() === taskDate.toDateString());
          }).length} tasks</span>
        </div>
        <Link
          to="/calendar"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors touch-manipulation"
        >
          <span className="hidden sm:inline">View full calendar →</span>
          <span className="sm:hidden">View all →</span>
        </Link>
      </div>
    </div>
  );
};

WeeklyCalendarWidget.propTypes = {
  holidays: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    color: PropTypes.string,
    daysUntil: PropTypes.number
  }))
};

export default WeeklyCalendarWidget;
