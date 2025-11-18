import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Delete Confirmation Dialog - Confirm deleting a node
 */
const DeleteConfirmDialog = ({
  show,
  onClose,
  onConfirm
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-[90vw] sm:max-w-md w-full border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Delete Node?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Are you sure you want to delete this node? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 justify-end">
          <button
            className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm touch-manipulation"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

DeleteConfirmDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default DeleteConfirmDialog;
