import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable resize handle component for group bounding boxes
 * Handles both corner and edge resize operations
 */
const ResizeHandle = ({ 
  position, 
  boundingBox, 
  groupId, 
  zoom,
  onResize,
  type = 'corner' // 'corner' or 'edge'
}) => {
  const isCorner = type === 'corner';
  const isTop = position.includes('n');
  const isBottom = position.includes('s');
  const isLeft = position.includes('w');
  const isRight = position.includes('e');
  const isVertical = position === 'n' || position === 's';

  // Calculate handle position
  let left, top;
  
  if (isCorner) {
    left = isLeft ? boundingBox.x - 6 : boundingBox.x + boundingBox.width - 6;
    top = isTop ? boundingBox.y - 6 : boundingBox.y + boundingBox.height - 6;
  } else {
    // Edge handle - calculate horizontal position
    if (isVertical) {
      left = boundingBox.x + boundingBox.width / 2 - 6;
    } else {
      left = isLeft ? boundingBox.x - 6 : boundingBox.x + boundingBox.width - 6;
    }
    
    // Edge handle - calculate vertical position
    if (isVertical) {
      top = isTop ? boundingBox.y - 6 : boundingBox.y + boundingBox.height - 6;
    } else {
      top = boundingBox.y + boundingBox.height / 2 - 6;
    }
  }

  // Determine cursor style
  const getCursor = () => {
    if (isCorner) {
      return position === 'nw' || position === 'se' ? 'nwse-resize' : 'nesw-resize';
    }
    return isVertical ? 'ns-resize' : 'ew-resize';
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY };
    const startBB = { ...boundingBox };
    
    const onMove = (ev) => {
      const dx = (ev.clientX - start.x) / zoom;
      const dy = (ev.clientY - start.y) / zoom;
      const newBB = { ...startBB };
      
      if (isLeft) { 
        newBB.x = startBB.x + dx; 
        newBB.width = startBB.width - dx; 
      }
      if (isRight) { 
        newBB.width = startBB.width + dx; 
      }
      if (isTop) { 
        newBB.y = startBB.y + dy; 
        newBB.height = startBB.height - dy; 
      }
      if (isBottom) { 
        newBB.height = startBB.height + dy; 
      }
      
      if (newBB.width > 50 && newBB.height > 50) {
        onResize(groupId, newBB);
      }
    };
    
    const onUp = () => {
      globalThis.removeEventListener('pointermove', onMove);
      globalThis.removeEventListener('pointerup', onUp);
    };
    
    globalThis.addEventListener('pointermove', onMove);
    globalThis.addEventListener('pointerup', onUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'absolute',
        left,
        top,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: '#10B981',
        border: '2px solid white',
        cursor: getCursor(),
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        zIndex: 1004
      }}
    />
  );
};

ResizeHandle.propTypes = {
  position: PropTypes.string.isRequired, // 'nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'
  boundingBox: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }).isRequired,
  groupId: PropTypes.string.isRequired,
  zoom: PropTypes.number.isRequired,
  onResize: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['corner', 'edge'])
};

export default ResizeHandle;
