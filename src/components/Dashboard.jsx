import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeeklyCalendarWidget from './WeeklyCalendarWidget';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowRight,
  Activity,
  BarChart2,
  CheckSquare,
  Circle,
  PieChart
} from 'lucide-react';

const Dashboard = () => {
  // Sample data - in a real app, this would come from your state or API
  const [stats, setStats] = useState({
    tasksCompleted: 32,
    tasksInProgress: 18,
    tasksNotStarted: 12,
    totalTasks: 62,
    overdueTasks: 5
  });
  
  const [collaborators, setCollaborators] = useState([
    { id: 'jd', name: 'John Doe', initials: 'JD', color: '#3B82F6', tasksAssigned: 14, tasksCompleted: 8, overdueTasks: 2 },
    { id: 'ak', name: 'Alex Kim', initials: 'AK', color: '#10B981', tasksAssigned: 20, tasksCompleted: 15, overdueTasks: 0 },
    { id: 'mr', name: 'Maria Rodriguez', initials: 'MR', color: '#F59E0B', tasksAssigned: 18, tasksCompleted: 5, overdueTasks: 3 },
    { id: 'ts', name: 'Taylor Smith', initials: 'TS', color: '#8B5CF6', tasksAssigned: 10, tasksCompleted: 4, overdueTasks: 0 }
  ]);
  
  const [recentCompletedTasks, setRecentCompletedTasks] = useState([
    { id: 1, title: 'Finalize design mockups', completedBy: 'Alex Kim', color: '#10B981', completedAt: '2 hours ago' },
    { id: 2, title: 'Review sprint backlog', completedBy: 'John Doe', color: '#3B82F6', completedAt: '4 hours ago' },
    { id: 3, title: 'Update user documentation', completedBy: 'Taylor Smith', color: '#8B5CF6', completedAt: 'Yesterday' },
    { id: 4, title: 'Prepare presentation slides', completedBy: 'Alex Kim', color: '#10B981', completedAt: 'Yesterday' },
    { id: 5, title: 'Client feedback meeting', completedBy: 'Maria Rodriguez', color: '#F59E0B', completedAt: '2 days ago' }
  ]);
  
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    { id: 1, title: 'API integration testing', assignedTo: 'John Doe', color: '#3B82F6', dueDate: 'Today', status: 'danger' },
    { id: 2, title: 'Create social media campaign', assignedTo: 'Maria Rodriguez', color: '#F59E0B', dueDate: 'Today', status: 'danger' },
    { id: 3, title: 'Update project timeline', assignedTo: 'Maria Rodriguez', color: '#F59E0B', dueDate: 'Tomorrow', status: 'warning' },
    { id: 4, title: 'Finalize Q1 budget', assignedTo: 'Alex Kim', color: '#10B981', dueDate: 'In 2 days', status: 'warning' },
    { id: 5, title: 'Prepare meeting agenda', assignedTo: 'Taylor Smith', color: '#8B5CF6', dueDate: 'In 3 days', status: 'warning' }
  ]);
  
  // Calculate completion percentage
  const completionPercentage = Math.round((stats.tasksCompleted / stats.totalTasks) * 100);    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-[27px]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 -mx-[27px] -mt-[27px] mb-6">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Project Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects today.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
                <CheckSquare size={18} />
                New Task
              </button>
              <Link to="/mindmaps" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2">
                <Activity size={18} />
                Mind Maps
              </Link>
            </div>
          </div>
        </div>
      </header>        {/* Main Content */}
      <main>
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Task Overview Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Task Overview</h2>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-xl shadow-lg">
                <BarChart2 size={22} />
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  {completionPercentage}%
                </p>
                <p className="text-sm text-gray-500 mt-1">Overall Completion</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">+{stats.tasksCompleted}</p>
                <p className="text-sm text-gray-500 mt-1">Tasks Done</p>
              </div>
            </div>
            
            <div className="h-3 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <div 
                className="h-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 rounded-lg p-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1"></div>
                <span className="text-xs text-gray-600 block">Done</span>
                <span className="text-sm font-semibold text-gray-800">{stats.tasksCompleted}</span>
              </div>
              <div className="bg-amber-50 rounded-lg p-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1"></div>
                <span className="text-xs text-gray-600 block">Progress</span>
                <span className="text-sm font-semibold text-gray-800">{stats.tasksInProgress}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 mx-auto mb-1"></div>
                <span className="text-xs text-gray-600 block">Todo</span>
                <span className="text-sm font-semibold text-gray-800">{stats.tasksNotStarted}</span>
              </div>
            </div>
          </div>
            {/* Task Status Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Task Status</h2>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl shadow-lg">
                <Activity size={22} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-md">
                    <CheckCircle size={18} />
                  </div>
                  <span className="text-gray-700 font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold text-lg">{stats.tasksCompleted}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-lg shadow-md">
                    <Clock size={18} />
                  </div>
                  <span className="text-gray-700 font-medium">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-bold text-lg">{stats.tasksInProgress}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-400 text-white rounded-lg shadow-md">
                    <Circle size={18} />
                  </div>
                  <span className="text-gray-700 font-medium">Not Started</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-bold text-lg">{stats.tasksNotStarted}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 text-white rounded-lg shadow-md">
                    <AlertTriangle size={18} />
                  </div>
                  <span className="text-gray-700 font-medium">Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold text-lg">{stats.overdueTasks}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
            </div>
          </div>
            {/* Team Overview Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Team Overview</h2>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-lg">
                <Users size={22} />
              </div>
            </div>
            
            <div className="space-y-4">
              {collaborators.slice(0, 3).map(collab => (
                <div key={collab.id} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg"
                    style={{ backgroundColor: collab.color }}
                  >
                    {collab.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800">{collab.name}</h3>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full font-medium 
                        ${collab.overdueTasks > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {collab.overdueTasks > 0 
                          ? `${collab.overdueTasks} overdue` 
                          : 'On track'
                        }
                      </span>
                    </div>
                    <div className="flex mt-2 items-center text-sm text-gray-500 gap-2">
                      <span>{collab.tasksCompleted}/{collab.tasksAssigned} tasks</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-16">
                        <div 
                          className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((collab.tasksCompleted / collab.tasksAssigned) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/team-members" className="w-full mt-4 text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center justify-center gap-2 transition-colors py-2 px-4 bg-indigo-50 rounded-xl hover:bg-indigo-100">
              <span>View All Team Members</span>
              <ArrowRight size={16} />
            </Link>
          </div>
            {/* Project Summary Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Project Summary</h2>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg">
                <PieChart size={22} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">Project Progress</h3>
                  <span className="text-lg font-bold text-indigo-600">{completionPercentage}%</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-3 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Task Distribution</h3>
                  <span className="text-lg font-bold text-gray-700">{stats.tasksCompleted}/{stats.totalTasks}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                    <span className="text-gray-600">Done</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                    <span className="text-gray-600">Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                    <span className="text-gray-600">Overdue</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                      <Calendar size={18} />
                      <span className="font-semibold">Next Deadline</span>
                    </div>
                    <span className="font-bold text-red-700">Today</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-blue-600 font-semibold mb-1">Team Focus</span>
                    <span className="font-bold text-blue-700">Development</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Completed Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg shadow-md">
                  <CheckCircle size={20} />
                </div>
                Recently Completed
              </h2>
              <Link to="/completed-tasks" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-all duration-200 px-3 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                <span className="font-medium">View All</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentCompletedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg"
                    style={{ backgroundColor: task.color }}
                  >
                    {task.completedBy.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{task.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed by {task.completedBy}</span>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md">{task.completedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Deadlines */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg shadow-md">
                  <Clock size={20} />
                </div>
                Upcoming Deadlines
              </h2>
              <Link to="/upcoming-deadlines" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-all duration-200 px-3 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                <span className="font-medium">View All</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.map(task => (
                <div key={task.id} className="flex items-start gap-4 p-4 bg-gray-50/70 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-lg"
                    style={{ backgroundColor: task.color }}
                  >
                    {task.assignedTo.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{task.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Assigned to {task.assignedTo}</span>
                      <span 
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          task.status === 'danger' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}
                      >
                        Due {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          {/* Weekly Calendar Widget */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <WeeklyCalendarWidget />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;