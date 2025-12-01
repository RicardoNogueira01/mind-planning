import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Columns, Plus, Clock, AlertCircle } from 'lucide-react';

/**
 * Kanban Board View for Mind Map Tasks
 * Displays tasks organized by status columns
 */
const BoardView = ({ nodes, onNodeUpdate }) => {
  const columns = [
    { id: 'not-started', title: 'Not Started', color: 'bg-gray-100', textColor: 'text-gray-700' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100', textColor: 'text-blue-700' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100', textColor: 'text-green-700' },
  ];

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600' };
    return { text: `${diffDays}d`, color: 'text-gray-600' };
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    if (onNodeUpdate) {
      onNodeUpdate(taskId, { status: columnId });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Columns size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Board View</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{nodes.length} tasks</span>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map(column => {
            const tasks = groupedTasks[column.id] || [];
            
            return (
              <div
                key={column.id}
                className="flex flex-col w-80 bg-white rounded-lg shadow-sm border border-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className={`p-4 rounded-t-lg ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${column.textColor}`}>{column.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.textColor}`}>
                      {tasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No tasks
                    </div>
                  ) : (
                    tasks.map(task => {
                      const dueDate = formatDueDate(task.dueDate);
                      
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-move"
                        >
                          {/* Task Title */}
                          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {task.text}
                          </h4>

                          {/* Task Meta */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Priority */}
                            {task.priority && (
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            )}

                            {/* Due Date */}
                            {dueDate && (
                              <span className={`flex items-center gap-1 text-xs font-medium ${dueDate.color}`}>
                                <Clock size={12} />
                                {dueDate.text}
                              </span>
                            )}

                            {/* Progress */}
                            {task.progress > 0 && (
                              <span className="text-xs text-gray-600 font-medium">
                                {task.progress}%
                              </span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {task.progress > 0 && (
                            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          )}

                          {/* Assignee */}
                          {task.assignee && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                style={{ backgroundColor: task.assignee.color || '#3B82F6' }}
                              >
                                {task.assignee.name.charAt(0)}
                              </div>
                              <span className="text-xs text-gray-600">{task.assignee.name}</span>
                            </div>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 3 && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{task.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Task Button */}
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

BoardView.propTypes = {
  nodes: PropTypes.array.isRequired,
  onNodeUpdate: PropTypes.func,
};

export default BoardView;
