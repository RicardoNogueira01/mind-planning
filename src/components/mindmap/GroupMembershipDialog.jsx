import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Group Membership Confirmation Dialog
 * Shows when a node is dragged into a group space
 */
const GroupMembershipDialog = ({
  show,
  group,
  nodeName,
  onConfirm,
  onCancel
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

  if (!show || !group) return null;

  const collaborator = group.collaborator || {};
  const collaboratorName = collaborator.name || 'this collaborator';
  const collaboratorColor = collaborator.color || '#3b82f6';

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-[90vw] sm:max-w-md w-full border border-gray-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div 
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${collaboratorColor}20` }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ color: collaboratorColor }}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Add to Group?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Do you want to add <span className="font-semibold text-gray-900">"{nodeName}"</span> to{' '}
              <span className="font-semibold" style={{ color: collaboratorColor }}>
                {collaboratorName}'s
              </span>{' '}
              group?
            </p>
            <p className="text-xs text-gray-500 mt-2">
              The node will be associated with this collaborator.
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 justify-end">
          <button
            className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm touch-manipulation"
            style={{ backgroundColor: collaboratorColor }}
            onClick={onConfirm}
          >
            Add to Group
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

GroupMembershipDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  group: PropTypes.shape({
    id: PropTypes.string,
    collaborator: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string
    }),
    nodeIds: PropTypes.arrayOf(PropTypes.string)
  }),
  nodeName: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default GroupMembershipDialog;
