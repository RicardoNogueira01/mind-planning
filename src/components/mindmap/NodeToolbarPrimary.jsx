import React from 'react';
import PropTypes from 'prop-types';
import { Check, Trash2, Unlink } from 'lucide-react';

export default function NodeToolbarPrimary({
  node,
  isToolbarExpanded,
  onToggleComplete,
  onAddChild,
  onRequestDelete,
  onRequestDetach,
  hasParent,
}) {
  return (
    <div className="flex items-center gap-1">
      {/* Complete Task Button - Always visible */}
      <button
        className={`node-toolbar-btn p-2 rounded-xl hover:bg-white/60 transition-colors duration-200 border ${node.completed ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-700 border-gray-200/60 hover:border-gray-300'}`}
        onClick={(e) => { e.stopPropagation(); onToggleComplete?.(node.id); }}
        title={node.completed ? 'Mark as incomplete' : 'Mark as completed'}
      >
        <Check size={20} />
      </button>

      {/* Add Node Button - Only visible in collapsed state */}
      {!isToolbarExpanded && (
        <button
          className="node-toolbar-btn p-2 rounded-xl hover:bg-green-100 text-green-700 transition-colors duration-200 border border-green-200 hover:border-green-300"
          onClick={(e) => { e.stopPropagation(); onAddChild?.(node.id); }}
          title="Add connected child node"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}

      {/* Detach Node Button - Only visible if node has a parent connection */}
      {!isToolbarExpanded && hasParent && (
        <button
          className="node-toolbar-btn p-2 rounded-xl hover:bg-orange-100 text-orange-700 transition-colors duration-200 border border-orange-200 hover:border-orange-300"
          onClick={(e) => { e.stopPropagation(); onRequestDetach?.(node.id); }}
          title="Detach from parent node"
        >
          <Unlink size={16} />
        </button>
      )}

      {/* Delete Node Button - Only visible in collapsed (quick) view */}
      {!isToolbarExpanded && node.id !== 'root' && (
        <button
          className="node-toolbar-btn p-2 rounded-xl hover:bg-red-100 text-red-700 transition-colors duration-200 border border-red-200 hover:border-red-300"
          onClick={(e) => { e.stopPropagation(); onRequestDelete?.(node); }}
          title="Delete node"
        >
          <Trash2 size={16} />
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
  hasParent: PropTypes.bool,
};
