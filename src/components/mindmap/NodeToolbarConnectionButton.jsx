import React from 'react';
import PropTypes from 'prop-types';

const NodeToolbarConnectionButton = ({
  nodeId,
  isActive,
  onStart,
  onCancel,
}) => {
  return (
    <button
      className={`p-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300 animate-pulse'
          : 'text-blue-600 hover:bg-blue-50'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (isActive) onCancel();
        else onStart(nodeId, e);
      }}
      title={isActive ? 'Cancel connection mode (click to cancel)' : 'Create connection to another node'}
    >
      {isActive ? (
        // Cancel icon (X) when active
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        // Link icon when inactive
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      )}
    </button>
  );
};

NodeToolbarConnectionButton.propTypes = {
  nodeId: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onStart: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default NodeToolbarConnectionButton;
