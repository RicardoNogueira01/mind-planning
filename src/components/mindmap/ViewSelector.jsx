import React from 'react';
import PropTypes from 'prop-types';
import { Network, Calendar, Columns, List, BarChart3 } from 'lucide-react';

/**
 * View Mode Selector for Mind Map
 * Allows switching between different visualization modes
 */
const ViewSelector = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'mindmap', label: 'Mind Map', icon: Network, description: 'Visual node map' },
    { id: 'gantt', label: 'Gantt', icon: Calendar, description: 'Timeline view' },
    { id: 'board', label: 'Board', icon: Columns, description: 'Kanban board' },
    { id: 'list', label: 'List', icon: List, description: 'Table view' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Statistics' },
  ];

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
              isActive
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={view.description}
          >
            <Icon size={16} />
            <span className="text-sm font-medium hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
};

ViewSelector.propTypes = {
  currentView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default ViewSelector;
