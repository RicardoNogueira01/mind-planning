import React from 'react';
import PropTypes from 'prop-types';

const NodeCard = ({ node, selected, onSelect, onUpdateText, searchQuery, isMatching, connectionMode, isConnectionSource, isAlreadyConnected, isParentOfSelected, isChildOfSelected, hasProgress, fxOptions, hasRipple, children }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.text || '');
  const [isHovering, setIsHovering] = React.useState(false);
  const [shouldSpring, setShouldSpring] = React.useState(false);

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

  // Trigger springy animation on selection
  React.useEffect(() => {
    if (selected && fxOptions?.enabled && fxOptions?.springy) {
      setShouldSpring(true);
      const timer = setTimeout(() => setShouldSpring(false), 600);
      return () => clearTimeout(timer);
    }
  }, [selected, fxOptions]);

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

  return (
    <div
      className={`absolute rounded-lg ${
        selected ? 'ring-2 ring-blue-400/70' : 
        isParentOfSelected ? 'ring-2 ring-purple-400/70' : 
        isChildOfSelected ? 'ring-2 ring-amber-400/70' : ''
      } ${
        fxOptions?.enabled && fxOptions?.gradientRing && selected ? 'animate-gradient-ring' : ''
      } ${
        shouldSpring ? 'animate-springy' : ''
      }`}
      style={{ 
        left: node.x - 150, 
        top: node.y - 42, 
        minWidth: 300,
        maxWidth: 300, 
        position: 'absolute',
        opacity,
        zIndex,
        transition: 'opacity 0.2s ease-out'
      }}
      data-node-id={node.id}
      onMouseEnter={() => connectionMode && !isAlreadyConnected && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Ripple effect */}
      {hasRipple && fxOptions?.enabled && fxOptions?.ripple && (
        <div 
          className="animate-ripple"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            background: 'rgba(59, 130, 246, 0.4)',
            pointerEvents: 'none',
            zIndex: 5
          }}
        />
      )}
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
              className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-200 ${
                isHovering 
                  ? 'border-4 border-green-500 shadow-lg shadow-green-500/50' 
                  : 'border-2 border-green-400/60'
              }`}
            />
          )}
        </>
      )}
      <button
        type="button"
        className={`w-full px-4 py-4 rounded-lg border text-left ${
          selected ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white border-gray-200 shadow'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id, e);
        }}
        style={{ backgroundColor: node.bgColor || undefined, color: node.fontColor || undefined, minHeight: '56px' }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full text-center resize-none bg-transparent outline-none font-medium text-gray-800 border-0"
            style={{ paddingLeft: hasProgress ? '48px' : '0' }}
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
          <div className="text-center text-gray-800 font-medium whitespace-pre-wrap break-words" style={{ paddingLeft: hasProgress ? '48px' : '0' }}>{node.text || 'New Task'}</div>
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
    fontColor: PropTypes.string
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
  fxOptions: PropTypes.object,
  hasRipple: PropTypes.bool,
  children: PropTypes.node
};

export default NodeCard;
