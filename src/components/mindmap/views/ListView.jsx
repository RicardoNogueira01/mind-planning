import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { List, Search, Filter, ChevronDown, Clock, AlertCircle } from 'lucide-react';

/**
 * List View for Mind Map Tasks
 * Displays tasks in a sortable, filterable table
 */
const ListView = ({ nodes }) => {
  const [sortBy, setSortBy] = React.useState('name'); // name, dueDate, priority, progress, status
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterPriority, setFilterPriority] = React.useState('all');

  // Sort and filter tasks
  const processedTasks = useMemo(() => {
    let filtered = [...nodes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(node =>
        node.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.tags && node.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(node => (node.status || 'not-started') === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(node => node.priority === filterPriority);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          comparison = dateA - dateB;
          break;
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1, '': 0 };
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          break;
        }
        case 'progress':
          comparison = (b.progress || 0) - (a.progress || 0);
          break;
        case 'status': {
          const statusA = a.status || 'not-started';
          const statusB = b.status || 'not-started';
          comparison = statusA.localeCompare(statusB);
          break;
        }
        default:
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [nodes, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'not-started': { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
      'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
      'review': { label: 'Review', color: 'bg-yellow-100 text-yellow-700' },
      'completed': { label: 'Completed', color: 'bg-green-100 text-green-700' },
    };
    const config = statusConfig[status] || statusConfig['not-started'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return { text: '-', color: 'text-gray-400', isOverdue: false };
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        text: `${Math.abs(diffDays)}d overdue`, 
        color: 'text-red-600',
        isOverdue: true 
      };
    }
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600', isOverdue: false };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600', isOverdue: false };
    if (diffDays <= 7) return { text: `${diffDays}d`, color: 'text-gray-900', isOverdue: false };
    
    return { 
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
      color: 'text-gray-600',
      isOverdue: false 
    };
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <List size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">List View</h2>
          </div>
          <span className="text-sm text-gray-600">{processedTasks.length} of {nodes.length} tasks</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Task
                  {sortBy === 'name' && (
                    <ChevronDown size={14} className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortBy === 'status' && (
                    <ChevronDown size={14} className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  Priority
                  {sortBy === 'priority' && (
                    <ChevronDown size={14} className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('dueDate')}
              >
                <div className="flex items-center gap-2">
                  Due Date
                  {sortBy === 'dueDate' && (
                    <ChevronDown size={14} className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('progress')}
              >
                <div className="flex items-center gap-2">
                  Progress
                  {sortBy === 'progress' && (
                    <ChevronDown size={14} className={`transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedTasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No tasks found
                </td>
              </tr>
            ) : (
              processedTasks.map((task) => {
                const dueDate = formatDueDate(task.dueDate);
                
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.bgColor || '#E5E7EB' }}
                        />
                        <span className="font-medium text-gray-900">{task.text}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(task.status || 'not-started')}
                    </td>
                    <td className="px-4 py-3">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {dueDate.isOverdue && <AlertCircle size={14} className="text-red-600" />}
                        <span className={`text-sm ${dueDate.color}`}>
                          {dueDate.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium min-w-[35px]">
                          {task.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: task.assignee.color || '#3B82F6' }}
                          >
                            {task.assignee.name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{task.assignee.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ListView.propTypes = {
  nodes: PropTypes.array.isRequired,
};

export default ListView;
