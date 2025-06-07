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
  CheckCircle,
  Award,
  TrendingUp,
  User,
  Tag,
  ExternalLink,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';

const RecentlyCompletedTasksManager = () => {
  // Sample data
  const [completedTasks] = useState([
    {
      id: 1,
      title: 'Finalize design mockups',
      description: 'Complete the final design mockups for the new dashboard interface including responsive layouts',
      completedBy: {
        name: 'Alex Kim',
        initials: 'AK',
        color: '#10B981'
      },
      assignedBy: 'Maria Rodriguez',
      project: 'Project Gamma',
      priority: 'high',
      category: 'Design',
      tags: ['UI/UX', 'Responsive', 'Dashboard'],
      completedAt: '2024-01-15T14:30:00Z',
      dueDate: '2024-01-15T23:59:59Z',
      timeSpent: '6.5 hours',
      estimatedTime: '8 hours',
      status: 'completed',
      complexity: 'medium',
      quality: 'excellent',
      feedback: 'Outstanding work on the responsive design. The attention to detail is impressive.',
      attachments: ['mockup-v3.fig', 'design-specs.pdf'],
      completionType: 'on-time'
    },
    {
      id: 2,
      title: 'Review sprint backlog',
      description: 'Review and prioritize the sprint backlog items for the upcoming development cycle',
      completedBy: {
        name: 'John Doe',
        initials: 'JD',
        color: '#3B82F6'
      },
      assignedBy: 'Maria Rodriguez',
      project: 'Project Alpha',
      priority: 'medium',
      category: 'Management',
      tags: ['Sprint', 'Planning', 'Backlog'],
      completedAt: '2024-01-15T10:15:00Z',
      dueDate: '2024-01-16T17:00:00Z',
      timeSpent: '2 hours',
      estimatedTime: '3 hours',
      status: 'completed',
      complexity: 'low',
      quality: 'good',
      feedback: 'Good prioritization. The backlog is well organized for the team.',
      attachments: ['backlog-review.xlsx'],
      completionType: 'early'
    },
    {
      id: 3,
      title: 'Update user documentation',
      description: 'Update the user documentation to reflect the latest API changes and new features',
      completedBy: {
        name: 'Taylor Smith',
        initials: 'TS',
        color: '#8B5CF6'
      },
      assignedBy: 'John Doe',
      project: 'Project Beta',
      priority: 'medium',
      category: 'Documentation',
      tags: ['API', 'Documentation', 'User Guide'],
      completedAt: '2024-01-14T16:45:00Z',
      dueDate: '2024-01-14T23:59:59Z',
      timeSpent: '4 hours',
      estimatedTime: '4 hours',
      status: 'completed',
      complexity: 'medium',
      quality: 'excellent',
      feedback: 'Documentation is clear and comprehensive. Great job explaining complex concepts.',
      attachments: ['user-docs-v2.pdf', 'api-examples.md'],
      completionType: 'on-time'
    },
    {
      id: 4,
      title: 'Prepare presentation slides',
      description: 'Create presentation slides for the quarterly business review meeting',
      completedBy: {
        name: 'Alex Kim',
        initials: 'AK',
        color: '#10B981'
      },
      assignedBy: 'Maria Rodriguez',
      project: 'Project Delta',
      priority: 'high',
      category: 'Presentation',
      tags: ['QBR', 'Slides', 'Business Review'],
      completedAt: '2024-01-14T11:20:00Z',
      dueDate: '2024-01-13T17:00:00Z',
      timeSpent: '5 hours',
      estimatedTime: '4 hours',
      status: 'completed',
      complexity: 'medium',
      quality: 'good',
      feedback: 'Slides are well-structured but submitted after deadline.',
      attachments: ['qbr-slides.pptx', 'data-charts.xlsx'],
      completionType: 'late'
    },
    {
      id: 5,
      title: 'Client feedback meeting',
      description: 'Conduct feedback session with key client stakeholders on the prototype',
      completedBy: {
        name: 'Maria Rodriguez',
        initials: 'MR',
        color: '#F59E0B'
      },
      assignedBy: 'John Doe',
      project: 'Project Epsilon',
      priority: 'high',
      category: 'Meeting',
      tags: ['Client', 'Feedback', 'Prototype'],
      completedAt: '2024-01-13T15:00:00Z',
      dueDate: '2024-01-13T15:00:00Z',
      timeSpent: '1.5 hours',
      estimatedTime: '2 hours',
      status: 'completed',
      complexity: 'low',
      quality: 'excellent',
      feedback: 'Excellent client communication. Gathered valuable insights.',
      attachments: ['meeting-notes.md', 'client-feedback.pdf'],
      completionType: 'on-time'
    },
    {
      id: 6,
      title: 'Database optimization',
      description: 'Optimize database queries for better performance in the user management module',
      completedBy: {
        name: 'Sarah Wilson',
        initials: 'SW',
        color: '#06B6D4'
      },
      assignedBy: 'John Doe',
      project: 'Project Alpha',
      priority: 'medium',
      category: 'Development',
      tags: ['Database', 'Performance', 'Optimization'],
      completedAt: '2024-01-12T17:30:00Z',
      dueDate: '2024-01-14T23:59:59Z',
      timeSpent: '7 hours',
      estimatedTime: '6 hours',
      status: 'completed',
      complexity: 'high',
      quality: 'excellent',
      feedback: 'Impressive optimization results. Query performance improved by 60%.',
      attachments: ['performance-report.pdf', 'optimized-queries.sql'],
      completionType: 'early'
    },
    {
      id: 7,
      title: 'Bug fixes for mobile app',
      description: 'Fix critical bugs affecting the mobile app user experience',
      completedBy: {
        name: 'Taylor Smith',
        initials: 'TS',
        color: '#8B5CF6'
      },
      assignedBy: 'Maria Rodriguez',
      project: 'Project Beta',
      priority: 'high',
      category: 'Bug Fix',
      tags: ['Mobile', 'Bug Fix', 'UX'],
      completedAt: '2024-01-12T09:45:00Z',
      dueDate: '2024-01-11T23:59:59Z',
      timeSpent: '3 hours',
      estimatedTime: '4 hours',
      status: 'completed',
      complexity: 'medium',
      quality: 'good',
      feedback: 'Bugs fixed effectively but delivery was slightly delayed.',
      attachments: ['bug-report.md', 'fix-details.txt'],
      completionType: 'late'
    },
    {
      id: 8,
      title: 'Security audit report',
      description: 'Complete comprehensive security audit and generate detailed report',
      completedBy: {
        name: 'David Chen',
        initials: 'DC',
        color: '#EF4444'
      },
      assignedBy: 'John Doe',
      project: 'Project Gamma',
      priority: 'high',
      category: 'Security',
      tags: ['Security', 'Audit', 'Report'],
      completedAt: '2024-01-11T14:20:00Z',
      dueDate: '2024-01-12T17:00:00Z',
      timeSpent: '8 hours',
      estimatedTime: '10 hours',
      status: 'completed',
      complexity: 'high',
      quality: 'excellent',
      feedback: 'Thorough audit with actionable recommendations. Excellent work.',
      attachments: ['security-audit.pdf', 'vulnerability-list.xlsx'],
      completionType: 'early'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCompletionType, setSelectedCompletionType] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('completedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort data
  const filteredTasks = completedTasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.completedBy.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProject === 'all' || task.project === selectedProject;
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      const matchesCompletionType = selectedCompletionType === 'all' || task.completionType === selectedCompletionType;
      const matchesQuality = selectedQuality === 'all' || task.quality === selectedQuality;
      
      // Date range filter
      const taskDate = new Date(task.completedAt);
      const now = new Date();
      let matchesDate = true;
      
      if (dateRange === 'today') {
        matchesDate = taskDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = taskDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = taskDate >= monthAgo;
      }
      
      return matchesSearch && matchesProject && matchesCategory && matchesPriority && 
             matchesCompletionType && matchesQuality && matchesDate;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'completedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique values for filters
  const projects = [...new Set(completedTasks.map(task => task.project))];
  const categories = [...new Set(completedTasks.map(task => task.category))];

  // Calculate statistics
  const stats = {
    total: completedTasks.length,
    onTime: completedTasks.filter(t => t.completionType === 'on-time').length,
    early: completedTasks.filter(t => t.completionType === 'early').length,
    late: completedTasks.filter(t => t.completionType === 'late').length,
    avgQuality: completedTasks.filter(t => t.quality === 'excellent').length,
    totalTimeSpent: completedTasks.reduce((sum, t) => sum + parseFloat(t.timeSpent), 0).toFixed(1)
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCompletionTypeColor = (type) => {
    switch (type) {
      case 'early': return 'text-green-600 bg-green-100';
      case 'on-time': return 'text-blue-600 bg-blue-100';
      case 'late': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-improvement': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return hours === 0 ? 'Just now' : `${hours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTasks.map(task => (
        <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: task.completedBy.color }}
              >
                {task.completedBy.initials}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.project}</p>
              </div>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompletionTypeColor(task.completionType)}`}>
              {task.completionType}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(task.quality)}`}>
              {task.quality}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Completed by:</span>
              <span className="font-medium">{task.completedBy.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Time spent:</span>
              <span className="font-medium">{task.timeSpent}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Completed:</span>
              <span className="font-medium">{formatDate(task.completedAt)}</span>
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
            
            {task.feedback && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700 italic">"{task.feedback}"</p>
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
              <th className="text-left py-3 px-4 font-medium text-gray-700">Completed By</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Project</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Quality</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Time Spent</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Completed</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: task.completedBy.color }}
                    >
                      {task.completedBy.initials}
                    </div>
                    <span className="text-sm font-medium">{task.completedBy.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.project}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(task.quality)}`}>
                    {task.quality}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">{task.timeSpent}</td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900">{formatDate(task.completedAt)}</div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCompletionTypeColor(task.completionType)}`}>
                      {task.completionType}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                    <ExternalLink size={16} />
                  </button>
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
                <h1 className="text-2xl font-bold text-gray-900">Recently Completed Tasks</h1>
                <p className="text-sm text-gray-500">Track completed work and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download size={16} />
                Export
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Time</p>
                <p className="text-2xl font-bold text-blue-600">{stats.onTime}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Early</p>
                <p className="text-2xl font-bold text-green-600">{stats.early}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp size={20} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Excellent Quality</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgQuality}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalTimeSpent}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock size={20} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 text-black placeholder-black"
                />
              </div>
                <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-black ${showFilters ? 'bg-gray-50' : ''}`}
              >
                <Filter size={16} />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-4">              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
              >
                <option value="completedAt">Sort by Completion Date</option>
                <option value="title">Sort by Title</option>
                <option value="priority">Sort by Priority</option>
                <option value="quality">Sort by Quality</option>
                <option value="timeSpent">Sort by Time Spent</option>
              </select>              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-black"
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
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion</label>                  <select
                    value={selectedCompletionType}
                    onChange={(e) => setSelectedCompletionType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Types</option>
                    <option value="early">Early</option>
                    <option value="on-time">On Time</option>
                    <option value="late">Late</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>                  <select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">All Quality Levels</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="needs-improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredTasks.length} of {completedTasks.length} completed tasks
          </p>
        </div>

        {/* Tasks List */}
        {viewMode === 'grid' ? <GridView /> : <ListView />}
      </div>
    </div>
  );
};

export default RecentlyCompletedTasksManager;
