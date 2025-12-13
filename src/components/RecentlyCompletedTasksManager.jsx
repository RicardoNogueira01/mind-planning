import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TopBar from './shared/TopBar';
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
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

const RecentlyCompletedTasksManager = () => {
  const { t } = useLanguage();
  
  // Modal and UI state
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Export to CSV function
  const exportToCSV = () => {
    // Define CSV headers
    const headers = ['Title', 'Description', 'Completed By', 'Project', 'Priority', 'Category', 'Tags', 'Completed At', 'Due Date', 'Time Spent', 'Estimated Time', 'Status', 'Complexity', 'Quality'];
    
    // Convert tasks to CSV rows
    const csvRows = completedTasks.map(task => [
      `"${task.title.replace(/"/g, '""')}"`,
      `"${task.description.replace(/"/g, '""')}"`,
      `"${task.completedBy.name}"`,
      `"${task.project}"`,
      task.priority,
      task.category,
      `"${task.tags.join(', ')}"`,
      new Date(task.completedAt).toLocaleString(),
      new Date(task.dueDate).toLocaleString(),
      task.timeSpent,
      task.estimatedTime,
      task.status,
      task.complexity,
      task.quality
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `completed-tasks-${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    estimatedTime: '',
    tags: []
  });

  // Sample data
  const [completedTasks, setCompletedTasks] = useState([
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

  // Feedback and handlers
  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage({ message, type });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setShowEditTaskModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = (taskId, taskTitle) => {
    if (globalThis.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      setCompletedTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      showFeedback('Task deleted successfully!', 'error');
      setOpenMenuId(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.relative')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

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
      return t('common.yesterday');
    } else {
      return date.toLocaleDateString();
    }
  };

  const getQualityTopColor = (quality) => {
    switch(quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'needs-improvement': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {filteredTasks.map(task => (
        <div key={task.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
          {/* Quality Top Line */}
          <div className={`h-1 ${getQualityTopColor(task.quality)}`}></div>
          
          <div className="p-4">
          {/* Header with Avatar and Actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-md"
                style={{ backgroundColor: task.completedBy.color }}
              >
                {task.completedBy.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{task.title}</h3>
                <p className="text-xs text-gray-500 truncate">{task.project}</p>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <button 
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
              >
                <MoreVertical size={14} className="text-gray-400" />
              </button>
              {openMenuId === task.id && (
                <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <button 
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => handleEdit(task)}
                  >
                    <Edit2 size={13} />
                    Edit Task
                  </button>
                  <button 
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => handleDelete(task.id, task.title)}
                  >
                    <Trash2 size={13} />
                    Delete Task
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getCompletionTypeColor(task.completionType)}`}>
              {task.completionType}
            </span>
          </div>

          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Time:</span>
              <span className="font-bold text-gray-900">{task.timeSpent}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Completed:</span>
              <span className="font-medium text-gray-900">{formatDate(task.completedAt)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium">
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-medium">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          </div>
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
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TopBar showSearch={false} />
      <div className="p-3 md:p-6">
      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg border ${
            feedbackMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{feedbackMessage.message}</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="mb-4 md:mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 touch-manipulation">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="flex-1 md:flex-initial min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Recently Completed Tasks</h1>
              <p className="text-sm md:text-base text-gray-500 truncate md:whitespace-normal">Track completed work and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <button 
              onClick={exportToCSV}
              className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation cursor-pointer"
            >
              <Download size={16} />
              <span className="hidden md:inline">Export</span>
            </button>
            <button className="flex-1 md:flex-initial px-3 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation cursor-pointer"
              onClick={() => setShowAddTaskModal(true)}
            >
              <Plus size={16} />
              <span className="hidden md:inline">Add Task</span>
            </button>
          </div>
        </div>
      </header>      {/* Main Content */}
      <main>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <CheckCircle size={16} className="sm:hidden text-blue-600" />
                <CheckCircle size={20} className="hidden sm:block text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">On Time</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.onTime}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Clock size={16} className="sm:hidden text-blue-600" />
                <Clock size={20} className="hidden sm:block text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Early</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.early}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <TrendingUp size={16} className="sm:hidden text-green-600" />
                <TrendingUp size={20} className="hidden sm:block text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Excellent Quality</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.avgQuality}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Award size={16} className="sm:hidden text-purple-600" />
                <Award size={20} className="hidden sm:block text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Hours</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.totalTimeSpent}</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                <Clock size={16} className="sm:hidden text-orange-600" />
                <Clock size={20} className="hidden sm:block text-orange-600" />
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 text-gray-900 placeholder-gray-500"
                />
              </div>
                <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 ${showFilters ? 'bg-gray-50' : ''}`}
              >
                <Filter size={16} />
                {t('common.filters')}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm md:text-base min-w-0 flex-shrink"
              >
                <option value="completedAt">{t('common.date')}</option>
                <option value="title">{t('common.title')}</option>
                <option value="priority">{t('common.priority')}</option>
                <option value="quality">{t('common.quality')}</option>
                <option value="timeSpent">{t('common.time')}</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex-shrink-0"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.dateRange')}</label>                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                  >
                    <option value="all">{t('common.allTime')}</option>
                    <option value="today">{t('activity.today')}</option>
                    <option value="week">{t('common.last7Days')}</option>
                    <option value="month">{t('common.last30Days')}</option>
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
            {t('common.showing')} {filteredTasks.length} {t('common.of')} {completedTasks.length} {t('common.completedTasks')}
          </p>
        </div>        {/* Tasks List */}
        {viewMode === 'grid' ? <GridView /> : <ListView />}
      </main>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
                <p className="text-sm text-gray-500">Create a new task to track</p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle task creation here
              console.log('New task:', newTask);
              setShowAddTaskModal(false);
              setNewTask({
                title: '',
                description: '',
                project: '',
                priority: 'medium',
                category: '',
                dueDate: '',
                estimatedTime: '',
                tags: []
              });
            }} className="p-6">
              {/* Task Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="e.g., Design new landing page"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Describe the task details..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                />
              </div>

              {/* Project and Category in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newTask.project}
                    onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select a project</option>
                    <option value="Project Alpha">Project Alpha</option>
                    <option value="Project Beta">Project Beta</option>
                    <option value="Project Gamma">Project Gamma</option>
                    <option value="Project Delta">Project Delta</option>
                    <option value="Project Epsilon">Project Epsilon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select a category</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Management">Management</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Testing">Testing</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              {/* Priority and Due Date in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Estimated Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time
                </label>
                <input
                  type="text"
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                  placeholder="e.g., 4 hours"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTask.tags.join(', ')}
                  onChange={(e) => setNewTask({...newTask, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                  placeholder="e.g., UI/UX, Design, Responsive"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={18} />
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default RecentlyCompletedTasksManager;
