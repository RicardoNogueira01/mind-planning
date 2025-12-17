import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

export default function PropertiesPanel({ show, anchorRef, nodeId, priority, status, description, startDate, dueDate, onPriorityChange, onStatusChange, onDescriptionChange, onStartDateChange, onDueDateChange, onClose }) {
  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() || 
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
  
  const popupWidth = 340;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  const handleStartDateChange = (value) => {
    console.log('Start Date changing to:', value);
    if (onStartDateChange) {
      onStartDateChange(value);
    }
  };

  const handleDueDateChange = (value) => {
    console.log('Due Date changing to:', value);
    if (onDueDateChange) {
      onDueDateChange(value);
    }
  };

  return createPortal(
    <NodePopup
      position={{ left, top }}
      width={popupWidth}
      title="Details"
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Priority and Status in a grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`priority-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Priority</label>
            <select
              id={`priority-${nodeId}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              value={priority || ''}
              onChange={(e) => onPriorityChange && onPriorityChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="" className="text-gray-500">Select Priority</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label htmlFor={`status-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
            <select
              id={`status-${nodeId}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              value={status || ''}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="" className="text-gray-500">Select Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">✓ Completed</option>
            </select>
          </div>
        </div>
        
        {/* Start Date and Due Date in a grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`startDate-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Start Date</label>
            <input
              id={`startDate-${nodeId}`}
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              value={startDate || ''}
              onChange={(e) => handleStartDateChange(e.target.value)}
              onInput={(e) => handleStartDateChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label htmlFor={`dueDate-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">End Date</label>
            <input
              id={`dueDate-${nodeId}`}
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
              value={dueDate || ''}
              onChange={(e) => handleDueDateChange(e.target.value)}
              onInput={(e) => handleDueDateChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor={`description-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
          <textarea
            id={`description-${nodeId}`}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            rows={4}
            placeholder="Add a description..."
            value={description || ''}
            onChange={(e) => onDescriptionChange && onDescriptionChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </NodePopup>,
    document.body
  );
}

PropertiesPanel.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  nodeId: PropTypes.string.isRequired,
  priority: PropTypes.string,
  status: PropTypes.string,
  description: PropTypes.string,
  startDate: PropTypes.string,
  dueDate: PropTypes.string,
  onPriorityChange: PropTypes.func,
  onStatusChange: PropTypes.func,
  onDescriptionChange: PropTypes.func,
  onStartDateChange: PropTypes.func,
  onDueDateChange: PropTypes.func,
  onClose: PropTypes.func.isRequired
};
