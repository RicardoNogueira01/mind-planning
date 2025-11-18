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
  // Detect mobile/tablet
  const isMobile = window.innerWidth < 1024;
  
  // On mobile, use full width with padding; on desktop use specified width
  const responsiveWidth = isMobile ? 'calc(100vw - 16px)' : (width || 'auto');
  const responsiveMaxWidth = isMobile ? 'calc(100vw - 16px)' : (maxWidth || 500);
  const responsiveLeft = isMobile ? 8 : position.left;
  const responsiveTop = isMobile ? Math.max(60, position.top) : position.top;
  const responsiveMaxHeight = isMobile ? 'calc(100vh - 120px)' : (maxHeight || 'none');

  const baseStyle = {
    position: 'fixed',
    left: responsiveLeft,
    top: responsiveTop,
    width: responsiveWidth,
    maxWidth: responsiveMaxWidth,
    maxHeight: responsiveMaxHeight,
    zIndex: 5000,
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflowY: 'auto',
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
