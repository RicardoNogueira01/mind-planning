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

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClose) {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      className="node-popup bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        position: 'fixed',
        left: responsiveLeft,
        top: responsiveTop,
        width: responsiveWidth,
        maxWidth: responsiveMaxWidth,
        maxHeight: responsiveMaxHeight,
        zIndex: 5000,
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={0}
    >
      {/* Header - Clean style matching client design */}
      {title && (
        <div className="px-5 py-2 border-b border-gray-200 bg-white">
          <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        </div>
      )}

      {/* Content with padding */}
      <div className="px-5 py-4" style={{ overflowY: 'auto', maxHeight: responsiveMaxHeight !== 'none' ? `calc(${responsiveMaxHeight} - 60px)` : 'none' }}>
        {children}
      </div>
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
