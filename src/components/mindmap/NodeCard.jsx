import React from 'react';
import PropTypes from 'prop-types';

const NodeCard = ({ node, selected, onSelect, onUpdateText, searchQuery, isMatching, connectionMode, isConnectionSource, isAlreadyConnected, isParentOfSelected, isChildOfSelected, hasProgress, theme, className, children }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.text || '');
  const [isHovering, setIsHovering] = React.useState(false);

  // Convert shape name to border-radius
  const getShapeBorderRadius = (shape, fallbackRadius) => {
    switch (shape) {
      case 'pill': return '999px';
      case 'square': return '4px';
      case 'notch': return '0px';
      case 'wave': return '24px 4px 24px 4px';
      case 'rounded':
      default:
        return fallbackRadius;
    }
  };

  // Get theme-based styling, with fallbacks
  const nodeShape = theme?.nodes?.shape || 'rounded';
  const themeStyles = theme ? {
    fontFamily: theme.typography?.fontFamily || "'Inter', sans-serif",
    fontSize: theme.typography?.fontSize || '14px',
    fontWeight: theme.typography?.fontWeight || '500',
    borderRadius: getShapeBorderRadius(nodeShape, theme.nodes?.borderRadius || '8px'),
    borderColor: theme.nodes?.borderColor || '#E5E7EB',
    borderWidth: theme.nodes?.borderWidth || '1px',
    shadow: theme.nodes?.shadow || '0 1px 3px rgba(0,0,0,0.1)',
    defaultBg: theme.nodes?.defaultBg || '#FFFFFF',
    defaultText: theme.nodes?.defaultText || '#1F2937',
    selectedRing: theme.nodes?.selectedRing || '#3B82F6',
  } : {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    borderColor: '#E5E7EB',
    borderWidth: '1px',
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    defaultBg: '#FFFFFF',
    defaultText: '#1F2937',
    selectedRing: '#3B82F6',
  };

  // Calculate dynamic row count based on content
  const calculateRows = (text) => {
    if (!text) return 4; // Start with 4 rows when empty
    const lineCount = text.split('\n').length;
    return Math.max(4, Math.min(lineCount, 10)); // Min 4, max 10 rows
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditText(node.text || '');
  };


  const handleSaveText = () => {
    setIsEditing(false);
    if (onUpdateText) {
      onUpdateText(node.id, editText);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter saves the text
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveText();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(node.text || ''); // Reset to original text
    }
    // Regular Enter key creates a new line (default textarea behavior)
  };

  // Calculate days until due date
  const calculateDaysUntilDue = () => {
    if (!node.dueDate) return null;
    const now = new Date();
    const due = new Date(node.dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = calculateDaysUntilDue();

  // Get priority color and icon
  const getPriorityDisplay = () => {
    switch (node.priority) {
      case 'high': return { color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴', label: 'High' };
      case 'medium': return { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🟡', label: 'Med' };
      case 'low': return { color: 'bg-green-100 text-green-700 border-green-300', icon: '🟢', label: 'Low' };
      default: return null;
    }
  };

  // Get status color and icon
  const getStatusDisplay = () => {
    switch (node.status) {
      case 'completed': return { color: 'bg-green-100 text-green-700 border-green-300', icon: '✓', label: 'Done' };
      case 'in-progress': return { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '▶', label: 'Active' };
      case 'review': return { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '👁', label: 'Review' };
      case 'not-started': return { color: 'bg-gray-100 text-gray-600 border-gray-300', icon: '○', label: 'To Do' };
      default: return null;
    }
  };

  const priorityDisplay = getPriorityDisplay();
  const statusDisplay = getStatusDisplay();

  // Calculate opacity and zIndex based on search and editing state
  const opacity = searchQuery ? (isMatching ? 1 : 0.3) : 1;
  let zIndex = 10;
  if (searchQuery && isMatching) {
    zIndex = 20;
  } else if (searchQuery && !isMatching) {
    zIndex = 10;
  }
  // Editing nodes should always be on top
  if (isEditing) {
    zIndex = 100;
  } else if (selected) {
    zIndex = 30;
  }

  // Dynamic ring color based on theme
  const ringStyle = selected
    ? `ring-2`
    : isParentOfSelected
      ? 'ring-2 ring-purple-400/70'
      : isChildOfSelected
        ? 'ring-2 ring-amber-400/70'
        : '';

  return (
    <div
      className={`absolute ${ringStyle} ${className || ''}`}
      style={{
        left: node.x - 150,
        top: node.y - 42,
        minWidth: 300,
        maxWidth: 300,
        position: 'absolute',
        opacity,
        zIndex,
        transition: 'opacity 0.2s ease-out',
        borderRadius: themeStyles.borderRadius,
        ...(selected && { '--tw-ring-color': themeStyles.selectedRing }),
      }}
      data-node-id={node.id}
      onMouseEnter={() => connectionMode && !isAlreadyConnected && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Parent indicator badge */}
      {isParentOfSelected && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-purple-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
            Parent
          </div>
        </div>
      )}

      {/* Child indicator badge */}
      {isChildOfSelected && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
            Child
          </div>
        </div>
      )}

      {/* Connection Points - visible when in connection mode */}
      {connectionMode && !isConnectionSource && (
        <>
          {isAlreadyConnected ? (
            // Red indicator for already connected nodes
            <div className="absolute inset-0 rounded-lg border-2 border-red-500 bg-red-500/10 pointer-events-none flex items-center justify-center">
              <div className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                Already Connected
              </div>
            </div>
          ) : (
            // Green border for connectable nodes
            <div
              className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-200 ${isHovering
                ? 'border-4 border-green-500 shadow-lg shadow-green-500/50'
                : 'border-2 border-green-400/60'
                }`}
            />
          )}
        </>
      )}
      <button
        type="button"
        className={`w-full px-4 py-4 border text-left transition-all duration-200`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id, e);
        }}
        style={{
          backgroundColor: node.bgColor || themeStyles.defaultBg,
          color: node.fontColor || themeStyles.defaultText,
          minHeight: '56px',
          fontFamily: themeStyles.fontFamily,
          fontSize: themeStyles.fontSize,
          fontWeight: themeStyles.fontWeight,
          borderRadius: themeStyles.borderRadius,
          borderWidth: themeStyles.borderWidth,
          borderColor: selected ? themeStyles.selectedRing : themeStyles.borderColor,
          boxShadow: themeStyles.shadow,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full text-center resize-none bg-transparent outline-none font-medium border-0"
            style={{ paddingLeft: hasProgress ? '48px' : '0', color: 'inherit' }}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveText}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            rows={calculateRows(editText)}
            placeholder="Type here... (Ctrl+Enter to save, Esc to cancel)"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Task info badges */}
            {(priorityDisplay || statusDisplay || daysUntilDue !== null) && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Priority Badge */}
                {priorityDisplay && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${priorityDisplay.color}`}>
                    <span>{priorityDisplay.icon}</span>
                  </span>
                )}

                {/* Status Badge */}
                {statusDisplay && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${statusDisplay.color}`}>
                    <span>{statusDisplay.icon}</span>
                    <span>{statusDisplay.label}</span>
                  </span>
                )}

                {/* Days Until Due Badge */}
                {daysUntilDue !== null && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${daysUntilDue < 0
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : daysUntilDue === 0
                      ? 'bg-orange-100 text-orange-700 border-orange-300'
                      : daysUntilDue <= 3
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                    <span>📅</span>
                    <span>
                      {daysUntilDue < 0
                        ? `${Math.abs(daysUntilDue)}d overdue`
                        : daysUntilDue === 0
                          ? 'Due today'
                          : `${daysUntilDue}d left`
                      }
                    </span>
                  </span>
                )}
              </div>
            )}

            {node.emoji && (
              <div className="text-3xl">
                {node.emoji}
              </div>
            )}
            <div className="text-center font-medium whitespace-pre-wrap break-words" style={{ paddingLeft: hasProgress ? '48px' : '0', color: 'inherit' }}>
              {node.text || 'New Task'}
            </div>
          </div>
        )}
      </button>
      {children}
    </div>
  );
};

NodeCard.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    bgColor: PropTypes.string,
    fontColor: PropTypes.string,
    emoji: PropTypes.string
  }).isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onUpdateText: PropTypes.func,
  searchQuery: PropTypes.string,
  isMatching: PropTypes.bool,
  connectionMode: PropTypes.bool,
  isConnectionSource: PropTypes.bool,
  isAlreadyConnected: PropTypes.bool,
  isParentOfSelected: PropTypes.bool,
  isChildOfSelected: PropTypes.bool,
  hasProgress: PropTypes.bool,
  theme: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node
};

export default NodeCard;
