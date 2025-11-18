import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

export default function TagsPopup({ show, anchorRef, tags, showTags, onToggleShowTags, onAddTag, onRemoveTag, onClose }) {
  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() || 
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
  
  const popupWidth = 320;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  return createPortal(
    <NodePopup
      position={{ left, top }}
      width={popupWidth}
      maxHeight="400px"
      onClose={onClose}
      title="Manage Tags"
    >
      {/* Show/Hide Tags Toggle */}
      <div className="mb-3 md:mb-4 pb-3 border-b border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
          <input
            type="checkbox"
            checked={showTags !== false}
            onChange={(e) => {
              e.stopPropagation();
              onToggleShowTags(e.target.checked);
            }}
            className="w-5 h-5 md:w-4 md:h-4 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-sm md:text-base font-medium text-gray-700">Show tags below node</span>
        </label>
      </div>

      {/* Tags Display */}
      <div className="mb-4">
        {(tags || []).length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {(tags || []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-medium hover:bg-blue-100 transition-colors">
                {tag}
                <button 
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center text-base leading-none transition-colors" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onRemoveTag(tag);
                  }}
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No tags added yet</div>
        )}
      </div>
      
      {/* Add Tag Input */}
      <input
        type="text"
        placeholder="Add tag and press Enter"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent touch-manipulation"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            const tag = e.currentTarget.value.trim();
            onAddTag(tag);
            e.currentTarget.value = '';
          }
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      />
    </NodePopup>,
    document.body
  );
}

TagsPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.string),
  showTags: PropTypes.bool,
  onToggleShowTags: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
