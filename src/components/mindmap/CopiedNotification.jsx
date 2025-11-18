import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Copied Notification - Show brief notification when link is copied
 */
const CopiedNotification = ({ show }) => {
  if (!show) return null;

  return createPortal(
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span className="text-sm font-medium">Link copied to clipboard!</span>
    </div>,
    document.body
  );
};

CopiedNotification.propTypes = {
  show: PropTypes.bool.isRequired
};

export default CopiedNotification;
