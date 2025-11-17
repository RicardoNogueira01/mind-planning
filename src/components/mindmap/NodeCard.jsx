import React from 'react';
import PropTypes from 'prop-types';

const NodeCard = ({ node, selected, onSelect, onUpdateText, searchQuery, isMatching, connectionMode, isConnectionSource, isAlreadyConnected, children }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.text || '');
  const [isHovering, setIsHovering] = React.useState(false);

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
      className={`absolute rounded-lg ${selected ? 'ring-2 ring-blue-400/70' : ''}`}
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
            <>
              {/* Top connection point */}
              <div 
                className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isHovering ? 'bg-green-500 border-green-600 scale-150 shadow-lg shadow-green-500/50' : 'bg-white border-blue-400'
                }`}
                style={{ zIndex: 100 }}
              />
              {/* Right connection point */}
              <div 
                className={`absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isHovering ? 'bg-green-500 border-green-600 scale-150 shadow-lg shadow-green-500/50' : 'bg-white border-blue-400'
                }`}
                style={{ zIndex: 100 }}
              />
              {/* Bottom connection point */}
              <div 
                className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isHovering ? 'bg-green-500 border-green-600 scale-150 shadow-lg shadow-green-500/50' : 'bg-white border-blue-400'
                }`}
                style={{ zIndex: 100 }}
              />
              {/* Left connection point */}
              <div 
                className={`absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isHovering ? 'bg-green-500 border-green-600 scale-150 shadow-lg shadow-green-500/50' : 'bg-white border-blue-400'
                }`}
                style={{ zIndex: 100 }}
              />
            </>
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
        style={{ backgroundColor: node.bgColor || undefined, color: node.fontColor || undefined }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full text-center resize-none bg-transparent outline-none font-medium text-gray-800 border-0"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveText}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            rows={3}
            placeholder="Type here... (Ctrl+Enter to save, Esc to cancel)"
          />
        ) : (
          <div className="text-center text-gray-800 font-medium whitespace-pre-wrap">{node.text || 'New Node'}</div>
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
  children: PropTypes.node
};

export default NodeCard;
