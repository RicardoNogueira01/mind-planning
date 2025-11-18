import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable popup wrapper with built-in accessibility and keyboard handling
 * Automatically handles Escape key, click propagation, and ARIA attributes
 */
const NodePopup = ({ 
  children, 
  position, 
  width, 
  maxWidth,
  maxHeight,
  onClose,
  title,
  style = {} 
}) => {
  const baseStyle = {
    position: 'fixed',
    left: position.left,
    top: position.top,
    width: width || 'auto',
    maxWidth: maxWidth || 500,
    maxHeight: maxHeight || 'none',
    zIndex: 5000,
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflowY: maxHeight ? 'auto' : 'visible',
    ...style
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClose) {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      className="node-popup"
      style={baseStyle}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={0}
    >
      {title && <h4 className="font-medium text-gray-800 mb-3">{title}</h4>}
      {children}
    </div>
  );
};

NodePopup.propTypes = {
  children: PropTypes.node.isRequired,
  position: PropTypes.shape({
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired
  }).isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func,
  title: PropTypes.string,
  style: PropTypes.object
};

export default NodePopup;
