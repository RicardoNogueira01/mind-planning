import React from 'react';
import PropTypes from 'prop-types';

export default function NodeToolbarSettingsToggle({ isToolbarExpanded, onToggle }) {
  return (
    <div className="relative">
      <button
        className={`p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300 transform ${isToolbarExpanded ? 'rotate-180' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        title={isToolbarExpanded ? 'Hide advanced options' : 'Show advanced options'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 13 12 18 17 13"></polyline>
          <polyline points="7 6 12 11 17 6"></polyline>
        </svg>
      </button>
    </div>
  );
}

NodeToolbarSettingsToggle.propTypes = {
  isToolbarExpanded: PropTypes.bool,
  onToggle: PropTypes.func,
};
