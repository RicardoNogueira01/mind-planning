import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  Clock,
  AlertTriangle,
  Bell,
  TrendingUp,
  User,
  Tag,
  ExternalLink,
  MoreVertical,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

const UpcomingDeadlinesManager = () => {
  // Sample data
  const [upcomingTasks] = useState([
    {
      id: 1,
      title: 'API integration testing',
      description: 'Complete comprehensive testing of the new API integration with third-party services',
      assignedTo: {
        name: 'John Doe',
        initials: 'JD',
        color: '#3B82F6'
      },
      assignedBy: 'Maria Rodriguez',
      project: 'Project Alpha',
      priority: 'high',
      category: 'Testing',
      tags: ['API', 'Integration', 'Testing'],
      dueDate: '2024-01-16T23:59:59Z',
      createdAt: '2024-01-10T09:00:00Z',
      estimatedTime: '8 hours',
      progress: 75,
      status: 'in-progress',
      complexity: 'high',
      urgencyLevel: 'critical',
      attachments: ['api-specs.pdf', 'test-plan.md'],
      dependencies: ['Database setup', 'Environment configuration'],
      timeUntilDue: 'Today',
      isOverdue: false,
      reminderSet: true,
      blockers: []
    },
    {
      id: 2,
      title: 'Create social media campaign',
      description: 'Design and develop social media campaign materials for the Q1 product launch',
      assignedTo: {
        name: 'Maria Rodriguez',
        initials: 'MR',
        color: '#F59E0B'
      },
      assignedBy: 'Alex Kim',
      project: 'Project Delta',
      priority: 'high',
      category: 'Marketing',
      tags: ['Social Media', 'Campaign', 'Q1 Launch'],
      dueDate: '2024-01-16T17:00:00Z',
      createdAt: '2024-01-08T14:30:00Z',
      estimatedTime: '12 hours',
      progress: 45,
      status: 'in-progress',
      complexity: 'medium',
      urgencyLevel: 'critical',
      attachments: ['brand-guidelines.pdf', 'campaign-brief.docx'],
      dependencies: ['Brand approval', 'Content review'],
      timeUntilDue: 'Today',
      isOverdue: false,
      reminderSet: true,
      blockers: ['Waiting for brand team approval']
    },
    {
      id: 3,
      title: 'Update project timeline',
      description: 'Revise and update the project timeline based on recent scope changes and resource availability',
      assignedTo: {
        name: 'Taylor Smith',
        initials: 'TS',
        color: '#8B5CF6'
      },
      assignedBy: 'John Doe',
      project: 'Project Beta',
      priority: 'medium',
      category: 'Planning',
      tags: ['Timeline', 'Planning', 'Scope'],
      dueDate: '2024-01-17T23:59:59Z',
      createdAt: '2024-01-12T10:15:00Z',
      estimatedTime: '4 hours',
      progress: 20,
      status: 'not-started',
      complexity: 'low',
      urgencyLevel: 'moderate',
      attachments: ['current-timeline.gantt', 'scope-changes.md'],
      dependencies: ['Scope finalization'],
      timeUntilDue: 'Tomorrow',
      isOverdue: false,
      reminderSet: false,
      blockers: []
    },
    {
      id: 4,
      title: 'Finalize Q1 budget',
      description: 'Complete the quarterly budget planning and get necessary approvals from finance team',
      assignedTo: {
        name: 'Alex Kim',
        initials: 'AK',
        color: '#10B981'
      },
      assignedBy: 'Maria Rodriguez',
      project: 'Project Gamma',
      priority: 'high',
      category: 'Finance',
      tags: ['Budget', 'Q1', 'Finance'],
      dueDate: '2024-01-18T17:00:00Z',
      createdAt: '2024-01-05T11:20:00Z',
      estimatedTime: '6 hours',
      progress: 80,
      status: 'in-progress',
      complexity: 'medium',
      urgencyLevel: 'moderate',
      attachments: ['budget-template.xlsx', 'finance-guidelines.pdf'],
      dependencies: ['Department budget inputs', 'Finance approval'],
      timeUntilDue: 'In 2 days',
      isOverdue: false,
      reminderSet: true,
      blockers: []
    },
    {
      id: 5,
      title: 'Prepare meeting agenda',
      description: 'Create comprehensive agenda for the upcoming stakeholder review meeting',
      assignedTo: {
        name: 'Sarah Wilson',
        initials: 'SW',
        color: '#06B6D4'
      },
      assignedBy: 'John Doe',
      project: 'Project Epsilon',
      priority: 'low',
      category: 'Meeting',
      tags: ['Meeting', 'Agenda', 'Stakeholder'],
      dueDate: '2024-01-19T12:00:00Z',
      createdAt: '2024-01-14T16:45:00Z',
      estimatedTime: '2 hours',
      progress: 0,
      status: 'not-started',
      complexity: 'low',
      urgencyLevel: 'low',
      attachments: ['previous-agenda.docx'],
      dependencies: [],
      timeUntilDue: 'In 3 days',
      isOverdue: false,
      reminderSet: false,
      blockers: []
    },
    {
      id: 6,
      title: 'Security vulnerability patch',
      description: 'Apply critical security patches to the production environment',
      assignedTo: {
        name: 'David Chen',
        initials: 'DC',
        color: '#EF4444'
      },
      assignedBy: 'Sarah Wilson',
      project: 'Project Alpha',
      priority: 'critical',
      category: 'Security',
      tags: ['Security', 'Patch', 'Production'],
      dueDate: '2024-01-15T23:59:59Z',
      createdAt: '2024-01-14T08:30:00Z',
      estimatedTime: '3 hours',
      progress: 90,
      status: 'in-progress',
      complexity: 'high',
      urgencyLevel: 'critical',
      attachments: ['security-report.pdf', 'patch-notes.md'],
      dependencies: ['Maintenance window approval'],
      timeUntilDue: 'Overdue by 1 day',
      isOverdue: true,
      reminderSet: true,
      blockers: []
    },
    {
      id: 7,
      title: 'User feedback analysis',
      description: 'Analyze user feedback from recent product releases and create actionable insights',
      assignedTo: {
        name: 'Alex Kim',
        initials: 'AK',
        color: '#10B981'
      },
      assignedBy: 'Taylor Smith',
      project: 'Project Beta',
      priority: 'medium',
      category: 'Research',
      tags: ['User Feedback', 'Analysis', 'Insights'],
      dueDate: '2024-01-20T23:59:59Z',
      createdAt: '2024-01-13T13:15:00Z',
      estimatedTime: '5 hours',
      progress: 30,
      status: 'in-progress',
      complexity: 'medium',
      urgencyLevel: 'moderate',
      attachments: ['feedback-data.csv', 'analysis-template.xlsx'],
      dependencies: ['Data collection complete'],
      timeUntilDue: 'In 4 days',
      isOverdue: false,
      reminderSet: true,
      blockers: []
    },
    {
      id: 8,
      title: 'Mobile app performance optimization',
      description: 'Optimize mobile app performance for better user experience and reduced load times',
      assignedTo: {
        name: 'Taylor Smith',
        initials: 'TS',
        color: '#8B5CF6'
      },
      assignedBy: 'David Chen',
      project: 'Project Gamma',
      priority: 'medium',
      category: 'Development',
      tags: ['Mobile', 'Performance', 'Optimization'],
      dueDate: '2024-01-22T23:59:59Z',
      createdAt: '2024-01-15T09:45:00Z',
      estimatedTime: '10 hours',
      progress: 15,
      status: 'in-progress',
      complexity: 'high',
      urgencyLevel: 'moderate',
      attachments: ['performance-metrics.pdf', 'optimization-plan.md'],
      dependencies: ['Performance testing complete'],
      timeUntilDue: 'In 6 days',
      isOverdue: false,
      reminderSet: false,
      blockers: ['Waiting for testing environment']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort data
  const filteredTasks = upcomingTasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProject === 'all' || task.project === selectedProject;
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      const matchesUrgency = selectedUrgency === 'all' || task.urgencyLevel === selectedUrgency;
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
      const matchesAssignee = selectedAssignee === 'all' || task.assignedTo.name === selectedAssignee;
      
      // Due date filter
      const taskDue = new Date(task.dueDate);
      const now = new Date();
      let matchesDueDate = true;
      
      if (dueDateFilter === 'overdue') {
        matchesDueDate = task.isOverdue;
      } else if (dueDateFilter === 'today') {
        matchesDueDate = taskDue.toDateString() === now.toDateString();
      } else if (dueDateFilter === 'tomorrow') {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        matchesDueDate = taskDue.toDateString() === tomorrow.toDateString();
      } else if (dueDateFilter === 'this-week') {
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        matchesDueDate = taskDue <= weekFromNow && taskDue >= now;
      }
      
      return matchesSearch && matchesProject && matchesCategory && matchesPriority && 
             matchesUrgency && matchesStatus && matchesAssignee && matchesDueDate;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'progress') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique values for filters
  const projects = [...new Set(upcomingTasks.map(task => task.project))];
  const categories = [...new Set(upcomingTasks.map(task => task.category))];
  const assignees = [...new Set(upcomingTasks.map(task => task.assignedTo.name))];

  // Calculate statistics
  const stats = {
    total: upcomingTasks.length,
    overdue: upcomingTasks.filter(t => t.isOverdue).length,
    dueToday: upcomingTasks.filter(t => {
      const today = new Date().toDateString();
      return new Date(t.dueDate).toDateString() === today;
    }).length,
    critical: upcomingTasks.filter(t => t.urgencyLevel === 'critical').length,
    inProgress: upcomingTasks.filter(t => t.status === 'in-progress').length,
    avgProgress: Math.round(upcomingTasks.reduce((sum, t) => sum + t.progress, 0) / upcomingTasks.length)
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'not-started': return 'text-gray-600 bg-gray-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDueDateColor = (task) => {
    if (task.isOverdue) return 'text-red-600';
    if (task.timeUntilDue === 'Today') return 'text-orange-600';
    if (task.timeUntilDue === 'Tomorrow') return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return `Overdue by ${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''}`;
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays <= 7) return `In ${diffInDays} days`;
    return date.toLocaleDateString();
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTasks.map(task => (
        <div key={task.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${
          task.isOverdue ? 'border-red-200 bg-red-50' : 
          task.timeUntilDue === 'Today' ? 'border-orange-200 bg-orange-50' : 
          'border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: task.assignedTo.color }}
              >
                {task.assignedTo.initials}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.project}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {task.reminderSet && (
                <Bell size={14} className="text-blue-500" />
              )}
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(task.urgencyLevel)}`}>
              {task.urgencyLevel}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due date:</span>
              <span className={`font-medium ${getDueDateColor(task)}`}>
                {formatDueDate(task.dueDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Assigned to:</span>
              <span className="font-medium">{task.assignedTo.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Estimated time:</span>
              <span className="font-medium">{task.estimatedTime}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  task.progress >= 75 ? 'bg-green-500' :
                  task.progress >= 50 ? 'bg-blue-500' :
                  task.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
            
            {task.blockers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle size={14} />
                  <span className="text-xs font-medium">Blocked</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{task.blockers[0]}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Task</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned To</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Project</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.map(task => (
              <tr key={task.id} className={`hover:bg-gray-50 ${
                task.isOverdue ? 'bg-red-50' : 
                task.timeUntilDue === 'Today' ? 'bg-orange-50' : ''
              }`}>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {task.isOverdue && <AlertTriangle size={16} className="text-red-500" />}
                    {task.reminderSet && <Bell size={14} className="text-blue-500" />}
                    <div>
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: task.assignedTo.color }}
                    >
                      {task.assignedTo.initials}
                    </div>
                    <span className="text-sm font-medium">{task.assignedTo.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.project}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className={`font-medium ${getDueDateColor(task)}`}>
                      {formatDueDate(task.dueDate)}
                    </div>
                    <div className="text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          task.progress >= 75 ? 'bg-green-500' :
                          task.progress >= 50 ? 'bg-blue-500' :
                          task.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{task.progress}%</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-green-600">
                      <CheckCircle size={16} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upcoming Deadlines</h1>
                <p className="text-sm text-gray-500">Track deadlines and manage priorities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <RefreshCw size={16} />
                Refresh
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Plus size={16} />
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Today</p>
                <p className="text-2xl font-bold text-orange-600">{stats.dueToday}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock size={20} className="text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-700" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 ${showFilters ? 'bg-gray-50' : ''}`}
              >
                <Filter size={16} />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="title">Sort by Title</option>
                <option value="priority">Sort by Priority</option>
                <option value="progress">Sort by Progress</option>
                <option value="urgencyLevel">Sort by Urgency</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <select
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Dates</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this-week">This Week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredTasks.length} of {upcomingTasks.length} upcoming tasks
          </p>
        </div>

        {/* Tasks List */}
        {viewMode === 'grid' ? <GridView /> : <ListView />}
      </div>
    </div>
  );
};

export default UpcomingDeadlinesManager;
