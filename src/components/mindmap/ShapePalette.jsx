import React from 'react';
import PropTypes from 'prop-types';

/**
 * ShapePalette: renders the right-hand shape palette sidebar with draggable shape tiles
 * and a Dark Mode toggle button.
 */
export default function ShapePalette({ shapeDefinitions, isDarkMode, onShapeDragStart, onToggleDarkMode }) {
  return (
    <div className={`w-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-center py-4 gap-3`}>
      {shapeDefinitions.map((shapeDef) => (
        <button
          key={shapeDef.type}
          type="button"
          className={`w-14 h-14 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center justify-center`}
          style={{
            backgroundColor: shapeDef.color,
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          }}
          draggable={true}
          aria-label={`Drag ${shapeDef.name}`}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('application/x-shape-type', shapeDef.type);
            onShapeDragStart?.(e, shapeDef.type);
          }}
          title={shapeDef.name}
        >
          <span className="text-white text-xl font-bold select-none">{shapeDef.icon}</span>
        </button>
      ))}

      <div className="mt-auto pt-4">
        <button
          onClick={onToggleDarkMode}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            isDarkMode
              ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            // Sun icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M5 5l1.5 1.5"></path>
              <path d="M17.5 17.5L19 19"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="M5 19l1.5-1.5"></path>
              <path d="M17.5 6.5L19 5"></path>
            </svg>
          ) : (
            // Moon icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

ShapePalette.propTypes = {
  shapeDefinitions: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    icon: PropTypes.node,
  })).isRequired,
  isDarkMode: PropTypes.bool,
  onShapeDragStart: PropTypes.func,
  onToggleDarkMode: PropTypes.func,
};

