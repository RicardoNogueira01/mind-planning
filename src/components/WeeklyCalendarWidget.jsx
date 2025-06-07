import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus } from 'lucide-react';

const WeeklyCalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sample tasks data - in a real app, this would come from props or state
  const [tasks] = useState([
    {
      id: 1,
      title: 'Team standup',
      time: '09:00',
      date: '2024-01-15',
      color: '#3B82F6',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'API review',
      time: '14:30',
      date: '2024-01-15',
      color: '#10B981',
      type: 'review'
    },
    {
      id: 3,
      title: 'Client presentation',
      time: '16:00',
      date: '2024-01-15',
      color: '#F59E0B',
      type: 'presentation'
    },
    {
      id: 4,
      title: 'Design workshop',
      time: '10:00',
      date: '2024-01-16',
      color: '#8B5CF6',
      type: 'workshop'
    },
    {
      id: 5,
      title: 'Sprint planning',
      time: '15:00',
      date: '2024-01-16',
      color: '#EF4444',
      type: 'planning'
    },
    {
      id: 6,
      title: 'Code review',
      time: '11:00',
      date: '2024-01-17',
      color: '#06B6D4',
      type: 'review'
    },
    {
      id: 7,
      title: 'Product demo',
      time: '13:30',
      date: '2024-01-17',
      color: '#84CC16',
      type: 'demo'
    },
    {
      id: 8,
      title: 'Team retrospective',
      time: '09:30',
      date: '2024-01-18',
      color: '#F97316',
      type: 'meeting'
    },
    {
      id: 9,
      title: 'User testing',
      time: '14:00',
      date: '2024-01-19',
      color: '#EC4899',
      type: 'testing'
    },
    {
      id: 10,
      title: 'Weekly report',
      time: '16:30',
      date: '2024-01-19',
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
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">This Week</h2>
            <p className="text-sm text-gray-500">{formatDate(weekDates[0])} - {formatDate(weekDates[6])}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
          <Link
            to="/calendar"
            className="ml-2 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Full Calendar
          </Link>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const isTodayDate = isToday(date);
          
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-colors ${
                isTodayDate 
                  ? 'border-indigo-200 bg-indigo-50' 
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Day header */}
              <div className="text-center mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {dayNames[index]}
                </div>
                <div className={`text-lg font-semibold ${
                  isTodayDate ? 'text-indigo-600' : 'text-gray-800'
                }`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-1">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-2 rounded-md border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
                    style={{ 
                      borderLeftColor: task.color,
                      borderLeftWidth: '3px'
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{task.time}</span>
                    </div>
                    <div className="text-xs font-medium text-gray-800 line-clamp-2">
                      {task.title}
                    </div>
                  </div>
                ))}
                
                {/* Show more indicator if there are more tasks */}
                {tasks.filter(task => task.date === date.toISOString().split('T')[0]).length > 3 && (
                  <div className="text-xs text-gray-400 text-center py-1">
                    +{tasks.filter(task => task.date === date.toISOString().split('T')[0]).length - 3} more
                  </div>
                )}

                {/* Empty state for days with no tasks */}
                {dayTasks.length === 0 && (
                  <div className="text-center py-4">
                    <button className="w-6 h-6 border border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group">
                      <Plus size={12} className="text-gray-400 group-hover:text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>Total this week: {tasks.filter(task => {
            const taskDate = new Date(task.date);
            return weekDates.some(date => date.toDateString() === taskDate.toDateString());
          }).length} tasks</span>
        </div>
        <Link
          to="/calendar"
          className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          View full calendar →
        </Link>
      </div>
    </div>
  );
};

export default WeeklyCalendarWidget;
