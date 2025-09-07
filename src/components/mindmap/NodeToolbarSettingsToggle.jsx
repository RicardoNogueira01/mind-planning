import React from 'react';
import PropTypes from 'prop-types';
import { Settings } from 'lucide-react';

export default function NodeToolbarSettingsToggle({ isToolbarExpanded, onToggle }) {
  return (
    <div className="relative">
      <button
        className={`node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-300 transform border border-gray-200/60 hover:border-gray-300 ${isToolbarExpanded ? 'rotate-90' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
}

NodeToolbarSettingsToggle.propTypes = {
  isToolbarExpanded: PropTypes.bool,
  onToggle: PropTypes.func,
};
