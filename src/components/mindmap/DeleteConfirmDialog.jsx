import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Delete Confirmation Dialog - Confirm deleting a node
 */
const DeleteConfirmDialog = ({
  show,
  onClose,
  onConfirm,
  onConfirmWithChildren,
  hasChildren = false,
  childrenCount = 0
}) => {
  // Lock body scroll when dialog is open
  React.useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <div 
        className="bg-white rounded-xl shadow-lg p-6 max-w-[90vw] sm:max-w-md w-full border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Node?
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this node?
            </p>
            {hasChildren && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ This node has {childrenCount} {childrenCount === 1 ? 'child' : 'children'} (including all descendants)
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
          <button
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors order-last sm:order-first"
            onClick={onClose}
          >
            Cancel
          </button>
          {hasChildren ? (
            <>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                onClick={onConfirm}
              >
                Delete Node Only
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                onClick={onConfirmWithChildren}
              >
                Delete with All Children
              </button>
            </>
          ) : (
            <button
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              onClick={onConfirm}
            >
              Yes, Delete
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

DeleteConfirmDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onConfirmWithChildren: PropTypes.func,
  hasChildren: PropTypes.bool,
  childrenCount: PropTypes.number
};

export default DeleteConfirmDialog;
