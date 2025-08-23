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
      {/* Group bounding boxes */}
      {renderNodeGroups()}

      {/* Connections between nodes */}
      {renderConnections}

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

      {/* Nodes - passed as children for now to keep complexity manageable */}
      {children}
    </div>
  );
};

export default MindMapCanvas;
