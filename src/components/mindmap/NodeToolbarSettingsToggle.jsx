import React from 'react';
import PropTypes from 'prop-types';

export default function NodeToolbarSettingsToggle({ isToolbarExpanded, onToggle }) {
  return (
    <div className="relative">
      <button
        className={`node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-all duration-300 transform border border-gray-200/60 hover:border-gray-300 ${isToolbarExpanded ? 'rotate-180' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        title={isToolbarExpanded ? 'Hide advanced options' : 'Show advanced options'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
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
