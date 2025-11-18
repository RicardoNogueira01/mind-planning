import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WeeklyCalendarWidget from './WeeklyCalendarWidget';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users,
  ArrowRight,
  Activity,
  BarChart2,
  Circle,
  PieChart
} from 'lucide-react';
import clsx from 'clsx';

const Dashboard = () => {
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
    { id: 1, title: 'API integration testing', assignedTo: 'John Doe', initials: 'JD', color: 'bg-blue-500', dueDate: 'Today', status: 'danger' },
    { id: 2, title: 'Create social media campaign', assignedTo: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', dueDate: 'Today', status: 'danger' },
    { id: 3, title: 'Update project timeline', assignedTo: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', dueDate: 'Tomorrow', status: 'warning' },
    { id: 4, title: 'Finalize Q1 budget', assignedTo: 'Alex Kim', initials: 'AK', color: 'bg-green-500', dueDate: 'In 2 days', status: 'warning' },
    { id: 5, title: 'Prepare meeting agenda', assignedTo: 'Taylor Smith', initials: 'TS', color: 'bg-purple-500', dueDate: 'In 3 days', status: 'warning' }
  ]);
  
  // Calculate completion percentage
  const completionPercentage = Math.round((stats.tasksCompleted / stats.totalTasks) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      {/* Header */}
      <header className="mb-4 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Project Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-500">Welcome back! Here's what's happening with your projects today.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <Link to="/mindmaps" className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center md:justify-start gap-2 text-sm font-medium touch-manipulation">
              <Activity size={16} />
              Mind Maps
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
          {/* Task Overview Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Task Overview</h2>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <BarChart2 size={20} />
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {completionPercentage}%
                </p>
                <p className="text-sm text-gray-500">Overall Completion</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">+{stats.tasksCompleted}</p>
                <p className="text-sm text-gray-500">Tasks Done</p>
              </div>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div 
                className="h-2 bg-blue-600 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-xs text-gray-500 block">Done</span>
                <span className="text-sm font-semibold text-gray-800">{stats.tasksCompleted}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">In Progress</span>
                <span className="text-sm font-semibold text-gray-800">{stats.tasksInProgress}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">To Do</span>
                <span className="text-sm font-semibold text-gray-800">{stats.tasksNotStarted}</span>
              </div>
            </div>
          </div>

          {/* Task Status Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Task Status</h2>
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Activity size={20} />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-500" />
                  <span className="text-gray-700 font-medium">Completed</span>
                </div>
                <span className="text-gray-600 font-semibold">{stats.tasksCompleted}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-yellow-500" />
                  <span className="text-gray-700 font-medium">In Progress</span>
                </div>
                <span className="text-gray-600 font-semibold">{stats.tasksInProgress}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Circle size={18} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">Not Started</span>
                </div>
                <span className="text-gray-600 font-semibold">{stats.tasksNotStarted}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500" />
                  <span className="text-gray-700 font-medium">Overdue</span>
                </div>
                <span className="text-gray-600 font-semibold">{stats.overdueTasks}</span>
              </div>
            </div>
          </div>

          {/* Team Overview Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Team Overview</h2>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            
            <div className="space-y-3">
              {collaborators.slice(0, 3).map(collab => (
                <div key={collab.id} className="flex items-center gap-3">
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold", collab.color)}>
                    {collab.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 text-sm">{collab.name}</h3>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', {
                        'bg-red-100 text-red-700': collab.overdueTasks > 0,
                        'bg-green-100 text-green-700': collab.overdueTasks === 0
                      })}>
                        {collab.overdueTasks > 0 ? `${collab.overdueTasks} overdue` : 'On track'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{collab.tasksCompleted}/{collab.tasksAssigned} tasks</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/team-members" className="w-full mt-4 text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center justify-center gap-1 transition-colors py-2">
              <span>View All Team Members</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Project Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Project Summary</h2>
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <PieChart size={20} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-700 text-sm">Project Progress</h3>
                  <span className="text-sm font-bold text-gray-800">{completionPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 text-sm mb-2">Task Distribution</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Done</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">Progress</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Overdue</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Next Deadline</p>
                  <p className="font-semibold text-gray-800">Today</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Team Focus</p>
                  <p className="font-semibold text-gray-800">Development</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Completed Tasks */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2 md:gap-3">
                <CheckCircle className="text-green-500" size={18} />
                Recently Completed
              </h2>
              <Link to="/completed-tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              {recentCompletedTasks.map(task => (
                <div key={task.id} className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 p-3 bg-gray-50 rounded-lg touch-manipulation">
                  <div className={clsx("w-8 md:w-9 h-8 md:h-9 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-semibold flex-shrink-0", task.color)}>
                    {task.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm truncate">{task.title}</h3>
                    <p className="text-xs md:text-sm text-gray-500 truncate">Completed by {task.completedBy}</p>
                  </div>
                  <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">{task.completedAt}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Deadlines */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2 md:gap-3">
                <Clock className="text-red-500" size={18} />
                Upcoming Deadlines
              </h2>
              <Link to="/upcoming-deadlines" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              {upcomingDeadlines.map(task => (
                <div key={task.id} className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 p-3 bg-gray-50 rounded-lg touch-manipulation">
                  <div className={clsx("w-8 md:w-9 h-8 md:h-9 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-semibold flex-shrink-0", task.color)}>
                    {task.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm truncate">{task.title}</h3>
                    <p className="text-xs md:text-sm text-gray-500 truncate">Assigned to {task.assignedTo}</p>
                  </div>
                  <span className={clsx('text-xs md:text-sm font-semibold px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap', {
                    'bg-red-100 text-red-700': task.status === 'danger',
                    'bg-yellow-100 text-yellow-700': task.status === 'warning'
                  })}>
                    Due {task.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Calendar Widget */}
        <div className="mt-4 md:mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <WeeklyCalendarWidget />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;