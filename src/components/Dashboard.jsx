import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const completionPercentage = Math.round((stats.tasksCompleted / stats.totalTasks) * 100);
  
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Project Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              New Task
            </button>
            <Link to="/mindmap" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Open Mind Map
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Task Overview Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Task Overview</h2>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart2 size={20} />
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-3xl font-bold text-gray-800">{completionPercentage}%</p>
                <p className="text-sm text-gray-500">Overall Completion</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">+{stats.tasksCompleted}</p>
                <p className="text-sm text-gray-500">Tasks Done</p>
              </div>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div 
                className="h-2 bg-indigo-600 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Completed ({stats.tasksCompleted})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">In Progress ({stats.tasksInProgress})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Not Started ({stats.tasksNotStarted})</span>
              </div>
            </div>
          </div>
          
          {/* Task Status Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Task Status</h2>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Activity size={20} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-full">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-gray-700">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">{stats.tasksCompleted}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                    <Clock size={16} />
                  </div>
                  <span className="text-gray-700">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">{stats.tasksInProgress}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-full">
                    <Circle size={16} />
                  </div>
                  <span className="text-gray-700">Not Started</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">{stats.tasksNotStarted}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-full">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-gray-700">Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-medium">{stats.overdueTasks}</span>
                  <span className="text-gray-400">/{stats.totalTasks}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Overview Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Team Overview</h2>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            
            <div className="space-y-4">
              {collaborators.map(collab => (
                <div key={collab.id} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: collab.color }}
                  >
                    {collab.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-800">{collab.name}</h3>
                      <span 
                        className={`text-sm px-2 py-1 rounded-full 
                        ${collab.overdueTasks > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                      >
                        {collab.overdueTasks > 0 
                          ? `${collab.overdueTasks} overdue` 
                          : 'On track'
                        }
                      </span>
                    </div>
                    <div className="flex mt-1 items-center text-sm text-gray-500">
                      <span>{collab.tasksCompleted} of {collab.tasksAssigned} tasks</span>
                      <div className="ml-2 h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-1 bg-green-500 rounded-full"
                          style={{ width: `${Math.round((collab.tasksCompleted / collab.tasksAssigned) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center justify-center gap-1">
              <span>View All Team Members</span>
              <ArrowRight size={16} />
            </button>
          </div>
          
          {/* Project Summary Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Project Summary</h2>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <PieChart size={20} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-700">Project Progress</h3>
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-indigo-600 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">Tasks</h3>
                  <span className="text-sm font-medium">{stats.tasksCompleted}/{stats.totalTasks}</span>
                </div>
                <div className="mt-2 flex text-sm gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-500">Done</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-500">In Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-500">Overdue</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-sm">Next Deadline</span>
                    <div className="flex items-center gap-1 text-red-600 mt-1">
                      <Calendar size={16} />
                      <span className="font-medium">Today</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500 text-sm">Team Focus</span>
                    <span className="font-medium text-gray-800 mt-1">Development</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Completed Tasks */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Recently Completed Tasks</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentCompletedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: task.color }}
                  >
                    {task.completedBy.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">Completed by {task.completedBy}</span>
                      <span className="text-sm text-gray-400">{task.completedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Deadlines</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.map(task => (
                <div key={task.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: task.color }}
                  >
                    {task.assignedTo.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">Assigned to {task.assignedTo}</span>
                      <span 
                        className={`text-sm font-medium ${
                          task.status === 'danger' ? 'text-red-600' : 'text-orange-600'
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
      </main>
    </div>
  );
};

export default Dashboard;