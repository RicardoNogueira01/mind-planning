import React from 'react';
import PropTypes from 'prop-types';
import { DeadlineBadge, isOverdue } from '../shared/OverdueBadge';

const NodeCard = ({ node, selected, onSelect, onUpdateText, searchQuery, isMatching, connectionMode, isConnectionSource, isAlreadyConnected, isParentOfSelected, isChildOfSelected, hasProgress, theme, className, children, collaborators = [] }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.text || '');
  const [isHovering, setIsHovering] = React.useState(false);

  // Get collaborator info by ID
  const getCollaboratorInfo = (collabId) => {
    return collaborators.find(c => c.id === collabId);
  };

  // Check if node has collaborators assigned
  const nodeCollaborators = Array.isArray(node.collaborators) ? node.collaborators : [];

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

  // Calculate dynamic row count based on content - start small and grow
  const calculateRows = (text) => {
    if (!text) return 1; // Start with 1 row when empty
    const lineCount = text.split('\n').length;
    // Also account for wrapped lines (rough estimate: every 30 chars is a line)
    const charLineCount = Math.ceil(text.length / 30);
    const estimatedRows = Math.max(lineCount, charLineCount);
    return Math.max(1, Math.min(estimatedRows, 10)); // Min 1, max 10 rows
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

  // Get priority color and icon - Professional minimal design
  const getPriorityDisplay = () => {
    switch (node.priority) {
      case 'high':
        return {
          color: 'bg-red-50 text-red-700 border-red-200',
          dotColor: 'bg-red-500',
          label: 'High'
        };
      case 'medium':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dotColor: 'bg-amber-500',
          label: 'Medium'
        };
      case 'low':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotColor: 'bg-emerald-500',
          label: 'Low'
        };
      default: return null;
    }
  };

  // Get status color and icon - Professional minimal design
  const getStatusDisplay = () => {
    switch (node.status) {
      case 'completed':
        return null; // Handled by floating badge

      case 'in-progress':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          dotColor: 'bg-blue-500',
          icon: null,
          label: 'In Progress'
        };
      case 'review':
        return {
          color: 'bg-violet-50 text-violet-700 border-violet-200',
          dotColor: 'bg-violet-500',
          icon: null,
          label: 'Review'
        };
      case 'not-started':
        return {
          color: 'bg-slate-50 text-slate-600 border-slate-200',
          dotColor: 'bg-slate-400',
          icon: null,
          label: 'To Do'
        };
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

  // Check if task is overdue (using imported helper)
  const isTaskOverdue = isOverdue(node.dueDate, node.status);

  // Dynamic ring color based on theme and overdue status
  const ringStyle = selected
    ? `ring-2`
    : isTaskOverdue
      ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/30'
      : isParentOfSelected
        ? 'ring-2 ring-purple-400/70'
        : isChildOfSelected
          ? 'ring-2 ring-amber-400/70'
          : '';

  // Calculate dynamic width based on content
  const calculateNodeWidth = () => {
    const baseWidth = 120; // Minimum width
    const maxWidth = 300; // Maximum width (current fixed width)
    const charWidth = 8; // Approximate pixels per character
    const padding = 32; // Horizontal padding

    const textWidth = (node.text || 'New Task').length * charWidth + padding;
    const emojiWidth = node.emoji ? 40 : 0; // Space for emoji

    const calculatedWidth = Math.min(maxWidth, Math.max(baseWidth, textWidth + emojiWidth));
    return calculatedWidth;
  };

  const nodeWidth = calculateNodeWidth();
  const halfWidth = nodeWidth / 2;

  return (
    <div
      className={`absolute ${ringStyle} ${className || ''}`}
      style={{
        left: node.x - halfWidth,
        top: node.y - 28, // Adjusted for new height
        width: nodeWidth,
        position: 'absolute',
        opacity,
        zIndex,
        transition: 'opacity 0.2s ease-out, width 0.3s ease-out',
        borderRadius: themeStyles.borderRadius,
        ...(selected && { '--tw-ring-color': themeStyles.selectedRing }),
      }}
      data-node-id={node.id}
      onMouseEnter={() => connectionMode && !isAlreadyConnected && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Parent indicator badge */}
      {isParentOfSelected && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-purple-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-md">
            Parent
          </div>
        </div>
      )}

      {/* Child indicator badge */}
      {isChildOfSelected && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-md">
            Child
          </div>
        </div>
      )}

      {/* Completed indicator badge - Floating checkmark */}
      {node.completed && (
        <div className="absolute -top-3 -right-3 z-30">
          <div className="bg-green-500 text-white w-6 h-6 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      )}

      {/* Overdue indicator badge - Pulsing animation for attention */}
      {isTaskOverdue && !isParentOfSelected && !isChildOfSelected && !node.completed && (
        <div className="absolute -top-3 -right-3 z-30">
          <div
            className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            <span>🚨</span>
            <span>OVERDUE</span>
          </div>
        </div>
      )}
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
        className={`w-full px-3 py-2.5 border text-left transition-all duration-200 hover:shadow-md ${node.completed ? 'border-green-500 bg-green-50/30' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id, e);
        }}
        style={{
          backgroundColor: node.completed ? '#f0fdf4' : (node.bgColor || themeStyles.defaultBg),
          color: node.fontColor || themeStyles.defaultText,
          minHeight: '56px',
          fontFamily: node.fontFamily || themeStyles.fontFamily,
          fontSize: node.fontSize || themeStyles.fontSize,
          fontWeight: themeStyles.fontWeight,
          borderRadius: themeStyles.borderRadius,
          borderWidth: node.completed ? '2px' : themeStyles.borderWidth,
          borderColor: selected ? themeStyles.selectedRing : (node.completed ? '#22c55e' : themeStyles.borderColor),
          boxShadow: themeStyles.shadow,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full text-center resize-none bg-transparent outline-none font-medium border-0 overflow-hidden"
            style={{
              color: 'inherit',
              minHeight: '24px',
              lineHeight: '1.5'
            }}
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveText}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            rows={1}
            placeholder="Type here..."
            ref={(el) => {
              if (el) {
                // Auto-resize on mount
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {/* Task info badges */}
            {(priorityDisplay || statusDisplay || daysUntilDue !== null) && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Priority Badge - Professional design with dot indicator */}
                {priorityDisplay && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border shadow-sm ${priorityDisplay.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityDisplay.dotColor}`}></span>
                    <span>{priorityDisplay.label}</span>
                  </span>
                )}

                {/* Status Badge - Professional design with dot indicator */}
                {statusDisplay && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border shadow-sm ${statusDisplay.color}`}>
                    {statusDisplay.icon ? (
                      <span className="text-xs">{statusDisplay.icon}</span>
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dotColor}`}></span>
                    )}
                    <span>{statusDisplay.label}</span>
                  </span>
                )}

                {/* Deadline Badge - Using the new enhanced component */}
                {node.dueDate && (
                  <DeadlineBadge
                    dueDate={node.dueDate}
                    status={node.status}
                    size="xs"
                  />
                )}
              </div>
            )}

            {/* Emoji and Text - Centered inline */}
            <div className="flex items-center justify-center gap-2">
              {node.emoji && (
                <span className="text-2xl leading-none" style={{ flexShrink: 0 }}>
                  {node.emoji}
                </span>
              )}
              <div className="text-center font-medium whitespace-pre-wrap break-words leading-snug" style={{ color: 'inherit' }}>
                {node.text || 'New Task'}
              </div>
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
    emoji: PropTypes.string,
    collaborators: PropTypes.arrayOf(PropTypes.string)
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
  children: PropTypes.node,
  collaborators: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    initials: PropTypes.string,
    color: PropTypes.string
  }))
};

export default NodeCard;
