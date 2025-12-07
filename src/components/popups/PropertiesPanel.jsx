import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

export default function PropertiesPanel({ show, anchorRef, nodeId, priority, status, description, startDate, onPriorityChange, onStatusChange, onDescriptionChange, onStartDateChange, onClose }) {
  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() || 
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
  
  const popupWidth = 340;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  return createPortal(
    <NodePopup
      position={{ left, top }}
      width={popupWidth}
      title="Details"
      onClose={onClose}
    >
      <div className="space-y-3">
        <div>
          <label htmlFor={`priority-${nodeId}`} className="text-sm md:text-base text-gray-600 block mb-1">Priority</label>
          <select
            id={`priority-${nodeId}`}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm md:text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation cursor-pointer"
            value={priority || 'medium'}
            onChange={(e) => onPriorityChange && onPriorityChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor={`status-${nodeId}`} className="text-sm md:text-base text-gray-600 block mb-1">Status</label>
          <select
            id={`status-${nodeId}`}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm md:text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation cursor-pointer"
            value={status || 'not-started'}
            onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label htmlFor={`startDate-${nodeId}`} className="text-sm md:text-base text-gray-600 block mb-1">Task Start Date</label>
          <input
            id={`startDate-${nodeId}`}
            type="datetime-local"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm md:text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation cursor-pointer"
            value={startDate || ''}
            onChange={(e) => onStartDateChange && onStartDateChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div>
          <label htmlFor={`description-${nodeId}`} className="text-sm md:text-base text-gray-600 block mb-1">Description</label>
          <textarea
            id={`description-${nodeId}`}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm md:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
            rows={3}
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
  onPriorityChange: PropTypes.func,
  onStatusChange: PropTypes.func,
  onDescriptionChange: PropTypes.func,
  onStartDateChange: PropTypes.func,
  onClose: PropTypes.func.isRequired
};
