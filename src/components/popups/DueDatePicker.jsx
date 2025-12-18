import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

export default function DueDatePicker({ show, anchorRef, dueDate, onDueDateChange, onClearDate, onClose }) {
  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() ||
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };

  // Use 580px for positioning (matches CSS min-width), actual width handled by CSS
  const popupWidth = 580;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  return createPortal(
    <NodePopup
      position={{ left, top }}
      width={popupWidth}
      title="Due Date"
      onClose={onClose}
    >
      <input
        type="date"
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation cursor-pointer"
        value={dueDate || ''}
        onChange={(e) => onDueDateChange && onDueDateChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      />
      {dueDate && (
        <button
          className="mt-2 text-xs text-red-600 hover:text-red-700 w-full py-1 hover:bg-red-50 rounded cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onClearDate && onClearDate();
          }}
        >
          Clear date
        </button>
      )}
    </NodePopup>,
    document.body
  );
}

DueDatePicker.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  dueDate: PropTypes.string,
  onDueDateChange: PropTypes.func,
  onClearDate: PropTypes.func,
  onClose: PropTypes.func.isRequired
};
