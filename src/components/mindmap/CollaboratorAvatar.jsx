import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable collaborator avatar badge component
 * Displays initials or count in a circular badge
 */
const CollaboratorAvatar = ({ 
  collaborator,
  position,
  size = 28,
  onClick,
  onKeyDown,
  title,
  isCountBadge = false,
  count = 0
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (onKeyDown) {
        onKeyDown(e);
      }
    }
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
  };

  const style = {
    position: 'absolute',
    left: position.left,
    top: position.top,
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: isCountBadge ? '#6B7280' : collaborator?.color,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: isCountBadge ? 700 : 'bold',
    fontSize: size > 24 ? '0.75rem' : '0.65rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    border: '2px solid white',
    cursor: 'pointer',
    zIndex: 6,
    pointerEvents: 'auto'
  };

  const content = isCountBadge ? `+${count}` : collaborator?.initials;
  const Component = onClick || onKeyDown ? 'button' : 'div';

  return (
    <Component
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      style={style}
      title={title}
      {...(Component === 'button' ? { tabIndex: 0 } : { role: 'button', tabIndex: 0 })}
    >
      {content}
    </Component>
  );
};

CollaboratorAvatar.propTypes = {
  collaborator: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    initials: PropTypes.string,
    color: PropTypes.string
  }),
  position: PropTypes.shape({
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired
  }).isRequired,
  size: PropTypes.number,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  title: PropTypes.string,
  isCountBadge: PropTypes.bool,
  count: PropTypes.number
};

export default CollaboratorAvatar;
