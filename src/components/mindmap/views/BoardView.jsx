import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Columns, Plus, Clock, MessageSquare, Paperclip, AlertCircle, X, MoreHorizontal, Filter, Calendar } from 'lucide-react';

/**
 * Kanban Board View for Mind Map Tasks
 * Professional design inspired by modern project management tools
 */
const BoardView = ({ nodes, onNodeUpdate }) => {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  const [newTask, setNewTask] = useState({
    text: '',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    tags: ''
  });

  // Column configuration with updated styling
  const columns = [
    { id: 'not-started', title: 'Backlog', color: '#6B7280' },
    { id: 'in-progress', title: 'To Do', color: '#F59E0B' },
    { id: 'review', title: 'In Progress', color: '#3B82F6' },
    { id: 'completed', title: 'Completed', color: '#10B981' },
  ];

  // Map priority to professional styling
  const priorityConfig = {
    high: { label: 'High', bgColor: '#FEE2E2', textColor: '#DC2626', borderColor: '#EF4444' },
    urgent: { label: 'Urgent', bgColor: '#FED7AA', textColor: '#EA580C', borderColor: '#F97316' },
    medium: { label: 'Medium', bgColor: '#FEF3C7', textColor: '#D97706', borderColor: '#F59E0B' },
    low: { label: 'Low', bgColor: '#D1FAE5', textColor: '#059669', borderColor: '#10B981' },
  };

  // Group nodes by status
  const groupedTasks = useMemo(() => {
    const groups = {};
    columns.forEach(col => {
      groups[col.id] = [];
    });

    nodes.forEach(node => {
      const status = node.status || 'not-started';
      if (groups[status]) {
        groups[status].push(node);
      } else {
        groups['not-started'].push(node);
      }
    });

    return groups;
  }, [nodes, columns]);

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format as "Oct 20" style
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = `${monthNames[date.getMonth()]} ${date.getDate()}`;

    if (diffDays < 0) return { text: formatted, isOverdue: true };
    if (diffDays === 0) return { text: 'Today', isOverdue: false, isToday: true };
    if (diffDays === 1) return { text: 'Tomorrow', isOverdue: false };
    return { text: formatted, isOverdue: false };
  };

  // Calculate progress bar color based on priority
  const getProgressBarColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#3B82F6';
    }
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDraggedOverColumn(null);
    }
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverColumn(null);

    const taskId = e.dataTransfer.getData('text/plain');

    if (onNodeUpdate && taskId) {
      onNodeUpdate(taskId, { status: columnId });
    }
  };

  const handleAddTask = (columnId) => {
    setSelectedColumn(columnId);
    setShowAddTaskModal(true);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();

    if (!newTask.text.trim()) return;

    const taskId = `task-${Date.now()}`;
    const task = {
      id: taskId,
      text: newTask.text,
      priority: newTask.priority,
      status: selectedColumn,
      dueDate: newTask.dueDate || null,
      progress: 0,
      x: 100,
      y: 100,
      assignee: newTask.assignee ? {
        name: newTask.assignee,
        color: '#3B82F6'
      } : null,
      tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()).filter(t => t) : []
    };

    if (onNodeUpdate) {
      onNodeUpdate('__new__', task);
    }

    setNewTask({
      text: '',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      tags: ''
    });
    setShowAddTaskModal(false);
    setSelectedColumn(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Columns size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Board View</h2>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase">
            Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
            <Filter size={16} />
            Filters
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium">
            <Calendar size={16} />
            Timeline
          </button>
          <button
            onClick={() => handleAddTask('not-started')}
            className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152c4a] transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-5 h-full min-w-max">
          {columns.map(column => {
            const tasks = groupedTasks[column.id] || [];

            return (
              <div
                key={column.id}
                className={`flex flex-col w-80 transition-all ${draggedOverColumn === column.id
                  ? 'bg-blue-50/50'
                  : ''
                  }`}
                style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)' }}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                  <h3 className="text-base font-semibold text-gray-900">{column.title}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {tasks.length}
                  </span>
                  <button className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors">
                    <Plus size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Tasks List - Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 min-h-[100px] pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 transparent' }}>
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No tasks
                    </div>
                  ) : (
                    tasks.map(task => {
                      const dueDate = formatDueDate(task.dueDate);
                      const priority = priorityConfig[task.priority] || priorityConfig.medium;
                      const progress = task.progress || 0;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-move active:cursor-grabbing group"
                        >
                          {/* Priority Badge & Menu */}
                          <div className="flex items-start justify-between mb-3">
                            <span
                              className="px-2.5 py-1 text-xs font-semibold rounded-md"
                              style={{
                                backgroundColor: priority.bgColor,
                                color: priority.textColor
                              }}
                            >
                              {priority.label}
                            </span>
                            <button className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal size={16} className="text-gray-400" />
                            </button>
                          </div>

                          {/* Task Title */}
                          <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
                            {task.text}
                          </h4>

                          {/* Progress Bar */}
                          {progress > 0 && (
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: getProgressBarColor(task.priority)
                                }}
                              />
                            </div>
                          )}

                          {/* Footer: Stats & Assignees */}
                          <div className="flex items-center justify-between">
                            {/* Left: Comments & Attachments */}
                            <div className="flex items-center gap-3 text-gray-400 text-xs">
                              <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {Math.floor(Math.random() * 20) || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Paperclip size={14} />
                                {Math.floor(Math.random() * 5) || 0}
                              </span>
                            </div>

                            {/* Right: Assignees */}
                            {task.assignee && (
                              <div className="flex items-center -space-x-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                                  style={{ backgroundColor: task.assignee.color || '#3B82F6' }}
                                  title={task.assignee.name}
                                >
                                  {task.assignee.name?.charAt(0) || '?'}
                                </div>
                              </div>
                            )}

                            {/* Collaborators stack */}
                            {task.collaborators && task.collaborators.length > 0 && !task.assignee && (
                              <div className="flex items-center -space-x-2">
                                {task.collaborators.slice(0, 3).map((collab, idx) => (
                                  <div
                                    key={idx}
                                    className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                                    title={collab}
                                  >
                                    {String(collab).charAt(0).toUpperCase()}
                                  </div>
                                ))}
                                {task.collaborators.length > 3 && (
                                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                                    +{task.collaborators.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Due Date */}
                          {dueDate && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock size={14} />
                                {dueDate.text}
                              </span>
                              {dueDate.isOverdue && (
                                <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                  <AlertCircle size={14} />
                                  Overdue
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Task Button - Fixed at bottom */}
                <div className="mt-4 flex-shrink-0">
                  <button
                    onClick={() => handleAddTask(column.id)}
                    className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-white border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
                <p className="text-sm text-gray-500">
                  Create task in "{columns.find(c => c.id === selectedColumn)?.title}"
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setSelectedColumn(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTask} className="p-6 space-y-5">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTask.text}
                  onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                  placeholder="e.g., Complete design mockups"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: key })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${newTask.priority === key
                        ? 'ring-2 ring-offset-2'
                        : 'hover:opacity-80'
                        }`}
                      style={{
                        backgroundColor: config.bgColor,
                        color: config.textColor,
                        ringColor: config.borderColor
                      }}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 cursor-pointer"
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <input
                  type="text"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  placeholder="e.g., UI, Design, Frontend (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setSelectedColumn(null);
                  }}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1E3A5F] text-white rounded-xl hover:bg-[#152c4a] transition-colors font-medium flex items-center gap-2 cursor-pointer shadow-sm"
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
  );
};

BoardView.propTypes = {
  nodes: PropTypes.array.isRequired,
  onNodeUpdate: PropTypes.func,
};

export default BoardView;
