import React from 'react';

const MindMapCanvas = ({
  pan,
  zoom,
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

      {/* Nodes - passed as children (renders on top with zIndex 10) */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
};

export default MindMapCanvas;
