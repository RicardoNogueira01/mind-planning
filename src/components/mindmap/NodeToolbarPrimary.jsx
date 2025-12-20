import React from 'react';
import PropTypes from 'prop-types';

export default function NodeToolbarPrimary({
  node,
  isToolbarExpanded,
  onToggleComplete,
  onAddChild,
  onRequestDelete,
  onRequestDetach,
  onAutoArrangeChildren,
  hasParent,
  hasChildren,
}) {
  return (
    <div className="flex items-center gap-0.5">
      {/* Complete Task Button - Always visible */}
      <button
        className={`p-2 rounded-lg transition-colors duration-200 ${node.completed ? 'text-black bg-gray-100 hover:bg-gray-200' : 'text-black hover:bg-gray-100'}`}
        onClick={(e) => { e.stopPropagation(); onToggleComplete?.(node.id); }}
        title={node.completed ? 'Mark as incomplete' : 'Mark as completed'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>

      {/* Add Node Button - Always visible */}
      <button
        className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200"
        onClick={(e) => { e.stopPropagation(); onAddChild?.(node.id); }}
        title="Add connected child node (Shift+N)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Auto-arrange Children Button - Always visible, disabled if no children */}
      <button
        className={`p-2 rounded-lg transition-colors duration-200 ${hasChildren
            ? 'text-blue-600 hover:bg-blue-50'
            : 'text-gray-300 cursor-not-allowed opacity-50'
          }`}
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) onAutoArrangeChildren?.(node.id);
        }}
        disabled={!hasChildren}
        title={hasChildren ? "Auto-arrange children in a neat column" : "No children to arrange"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" rx="1"></rect>
          <path d="M9 6h6"></path>
          <rect x="15" y="3" width="6" height="6" rx="1"></rect>
          <path d="M9 12h6"></path>
          <rect x="15" y="9" width="6" height="6" rx="1"></rect>
          <path d="M9 18h6"></path>
          <rect x="15" y="15" width="6" height="6" rx="1"></rect>
        </svg>
      </button>

      {/* Delete Node Button - Always visible */}
      <button
        className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200"
        onClick={(e) => { e.stopPropagation(); onRequestDelete?.(node.id); }}
        title="Delete node (Delete/Backspace)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>

      {/* Detach Node Button - Always visible if node has a parent connection */}
      {hasParent && (
        <button
          className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200"
          onClick={(e) => { e.stopPropagation(); onRequestDetach?.(node.id); }}
          title="Detach from parent node (Shift+D)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"></path>
            <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"></path>
            <line x1="8" x2="8" y1="2" y2="5"></line>
            <line x1="2" x2="5" y1="8" y2="8"></line>
            <line x1="16" x2="16" y1="19" y2="22"></line>
            <line x1="19" x2="22" y1="16" y2="16"></line>
          </svg>
        </button>
      )}
    </div>
  );
}

NodeToolbarPrimary.propTypes = {
  node: PropTypes.shape({ id: PropTypes.string.isRequired, completed: PropTypes.bool, text: PropTypes.string }).isRequired,
  isToolbarExpanded: PropTypes.bool,
  onToggleComplete: PropTypes.func,
  onAddChild: PropTypes.func,
  onRequestDelete: PropTypes.func,
  onRequestDetach: PropTypes.func,
  onAutoArrangeChildren: PropTypes.func,
  hasParent: PropTypes.bool,
  hasChildren: PropTypes.bool,
};
