import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Network, Calendar, Columns, List, Table2, BarChart3, ChevronDown } from 'lucide-react';

/**
 * View Mode Selector for Mind Map
 * Allows switching between different visualization modes
 */
const ViewSelector = ({ currentView, onViewChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const views = [
    { id: 'mindmap', label: 'Mind Map', icon: Network, description: 'Visual node map' },
    { id: 'gantt', label: 'Gantt', icon: Calendar, description: 'Timeline view' },
    { id: 'board', label: 'Board', icon: Columns, description: 'Kanban board' },
    { id: 'list', label: 'List', icon: List, description: 'Table view' },
    { id: 'excel', label: 'Excel', icon: Table2, description: 'Spreadsheet view' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Statistics' },
  ];


  const currentViewData = views.find(v => v.id === currentView);
  const CurrentIcon = currentViewData?.icon || Network;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      {/* Desktop: Horizontal button group */}
      <div className="hidden md:flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id;

          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              title={view.description}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: Dropdown menu */}
      <div className="md:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all touch-manipulation min-w-[44px]"
          title={currentViewData?.label}
        >
          <CurrentIcon size={18} className="flex-shrink-0" />
          <span className="hidden sm:inline text-sm font-medium text-gray-900">
            {currentViewData?.label}
          </span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;

              return (
                <button
                  key={view.id}
                  onClick={() => {
                    onViewChange(view.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : ''} />
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                      {view.label}
                    </div>
                    <div className="text-xs text-gray-500">{view.description}</div>
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

ViewSelector.propTypes = {
  currentView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default ViewSelector;
