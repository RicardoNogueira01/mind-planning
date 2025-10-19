import React from 'react';

const MindMapCanvas = ({
  pan,
  zoom,
  isSelecting,
  selectionRect,
  renderNodeGroups,
  renderConnections,
  children
}) => {
  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0'
      }}
    >
      {/* Connections between nodes - render FIRST (behind nodes) */}
      {/* Use position: relative to allow connections SVG to fill the space */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {renderConnections}
      </div>

      {/* Group bounding boxes */}
      {renderNodeGroups()}

      {/* Selection rectangle */}
      {isSelecting && selectionRect && (
        <div
          style={{
            position: 'absolute',
            left: selectionRect.x,
            top: selectionRect.y,
            width: selectionRect.width,
            height: selectionRect.height,
            border: '2px dashed #6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            zIndex: 6,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Nodes - passed as children (renders on top with zIndex 10) */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
};

export default MindMapCanvas;
