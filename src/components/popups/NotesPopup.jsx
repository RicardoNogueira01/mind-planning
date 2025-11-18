import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

export default function NotesPopup({ show, anchorRef, notes, onChange, onClose }) {
  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() || 
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
  
  const popupWidth = 420;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  return createPortal(
    <NodePopup 
      position={{ left, top }}
      width={popupWidth}
      title="Notes"
      onClose={onClose}
    >
      <textarea 
        className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"  
        placeholder="Add your notes here..." 
        value={notes || ''}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()} 
        onMouseDown={(e) => e.stopPropagation()} 
        onFocus={(e) => e.stopPropagation()} 
        onKeyDown={(e) => e.stopPropagation()}
      />
      <div className="mt-2 flex justify-end">
        <button 
          className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50" 
          onClick={(e) => { 
            e.stopPropagation(); 
            onClose();
          }}
        >
          Close
        </button>
      </div>
    </NodePopup>,
    document.body
  );
}

NotesPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  notes: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
