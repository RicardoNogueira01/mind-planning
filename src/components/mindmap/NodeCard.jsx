import React from 'react';
import PropTypes from 'prop-types';

const NodeCard = ({ node, selected, onSelect, onUpdateText, searchQuery, isMatching, children }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(node.text || '');

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

  // Calculate opacity and zIndex based on search
  const opacity = searchQuery ? (isMatching ? 1 : 0.3) : 1;
  const zIndex = searchQuery ? (isMatching ? 20 : 10) : 10;

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
    >
      <button
        type="button"
        className={`w-full px-4 py-4 rounded-lg border text-left ${
          selected ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white border-gray-200 shadow'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node.id);
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
  children: PropTypes.node
};

export default NodeCard;
