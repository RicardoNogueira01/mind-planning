import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Parent Selection Dialog - Choose which parent connection to remove
 */
const ParentSelectionDialog = ({
  parentSelectionState,
  onClose,
  onSelectParent
}) => {
  if (!parentSelectionState) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      tabIndex={0}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
              <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"></path>
              <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"></path>
              <line x1="8" x2="8" y1="2" y2="5"></line>
              <line x1="2" x2="5" y1="8" y2="8"></line>
              <line x1="16" x2="16" y1="19" y2="22"></line>
              <line x1="19" x2="22" y1="16" y2="16"></line>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Parent to Remove
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This node has multiple parents. Choose which parent connection to remove:
            </p>
          </div>
        </div>
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {parentSelectionState.parentConnections.map(({ parentId, parentNode }) => (
            <button
              key={parentId}
              className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
              onClick={() => onSelectParent(parentSelectionState.nodeId, parentId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                    {parentNode?.text || 'Untitled Node'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ID: {parentId}
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-purple-600">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-3 justify-end border-t pt-4">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

ParentSelectionDialog.propTypes = {
  parentSelectionState: PropTypes.shape({
    nodeId: PropTypes.string.isRequired,
    parentConnections: PropTypes.arrayOf(PropTypes.shape({
      parentId: PropTypes.string.isRequired,
      parentNode: PropTypes.object
    })).isRequired
  }),
  onClose: PropTypes.func.isRequired,
  onSelectParent: PropTypes.func.isRequired
};

export default ParentSelectionDialog;
