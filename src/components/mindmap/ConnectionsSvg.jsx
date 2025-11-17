import React from 'react';
import PropTypes from 'prop-types';
import { computeBezierPath } from './connectionGeometry';

/**
 * ConnectionsSvg: Pure presentational component that renders all connections as a single SVG.
 */
export default function ConnectionsSvg({
  connections,
  nodes,
  nodePositions,
  isDarkMode,
  fxOptions,
  selectedNode,
  relatedNodeIds,
  connectionFrom,
  mousePosition,
  zoom,
  pan,
}) {
  const strokeColor = isDarkMode ? '#9ca3af' : '#64748B';
  const hasConnections = Array.isArray(connections) && connections.length > 0;
  const showPreview = connectionFrom && mousePosition;

  // Always render SVG if there are connections or if we're in connection mode
  if (!hasConnections && !showPreview) {
    return null;
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} opacity="0.6" />
        </marker>
      </defs>
      {connections.map((conn, index) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) {
          return null;
        }

        const fromPos = nodePositions?.[conn.from];
        const toPos = nodePositions?.[conn.to];
        if (!fromPos || !toPos) {
          return null;
        }
        
        // Group siblings by direction for intelligent distribution
        const siblingsFromSameParent = connections.filter(c => c.from === conn.from);
        
        // Determine which direction this child is relative to parent
        const toCenterX = (toPos.left + toPos.right) / 2;
        const toCenterY = (toPos.top + toPos.bottom) / 2;
        
        let direction = 'right'; // default
        if (toCenterX > fromPos.right) direction = 'right';
        else if (toCenterX < fromPos.left) direction = 'left';
        else if (toCenterY > fromPos.bottom) direction = 'bottom';
        else if (toCenterY < fromPos.top) direction = 'top';
        
        // Filter siblings in the same direction
        const siblingsInSameDirection = siblingsFromSameParent.filter(c => {
          const siblingToPos = nodePositions?.[c.to];
          if (!siblingToPos) return false;
          
          const siblingToCenterX = (siblingToPos.left + siblingToPos.right) / 2;
          const siblingToCenterY = (siblingToPos.top + siblingToPos.bottom) / 2;
          
          let sibDirection;
          if (siblingToCenterX > fromPos.right) sibDirection = 'right';
          else if (siblingToCenterX < fromPos.left) sibDirection = 'left';
          else if (siblingToCenterY > fromPos.bottom) sibDirection = 'bottom';
          else if (siblingToCenterY < fromPos.top) sibDirection = 'top';
          else sibDirection = 'right'; // default fallback
          
          return sibDirection === direction;
        });
        
        const childIndex = siblingsInSameDirection.findIndex(c => c.id === conn.id);
        const totalChildren = siblingsInSameDirection.length;
        
        const { d: pathData, label: labelPoint } = computeBezierPath(fromPos, toPos, {
          childIndex,
          totalChildren,
          parentId: conn.from
        });
        const inFocusMode = !!(fxOptions?.enabled && fxOptions?.focusMode && selectedNode);
        const isRelated = !!(relatedNodeIds?.has(conn.from) || relatedNodeIds?.has(conn.to));
        let focusOpacity = 0.8;
        if (inFocusMode) {
          focusOpacity = isRelated ? 0.85 : 0.22;
        }

        return (
          <g key={conn.id}>
            <path
              d={pathData}
              stroke={strokeColor}
              strokeWidth={2.5}
              fill="none"
              strokeOpacity={focusOpacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'all 0.15s ease-out' }}
            />
      {conn.label && labelPoint && (
              <text
                x={labelPoint.x}
                y={labelPoint.y - 6}
                textAnchor="middle"
                fontSize={12}
                fill={isDarkMode ? '#e5e7eb' : '#334155'}
                opacity={(function(){
                  if (!inFocusMode) return 0.9;
                  return isRelated ? 0.9 : 0.35;
                })()}
              >
                {conn.label}
              </text>
            )}
          </g>
        );
      })}
      
      {/* Connection Preview Line - shows when creating a new connection */}
      {connectionFrom && mousePosition && (() => {
        const fromNode = nodes.find(n => n.id === connectionFrom);
        const fromPos = nodePositions?.[connectionFrom];
        
        if (!fromNode || !fromPos) return null;
        
        // Convert mouse position from screen space to canvas space
        const canvasX = (mousePosition.x - pan.x) / zoom;
        const canvasY = (mousePosition.y - pan.y) / zoom;
        
        // Calculate center of source node
        const fromCenterX = (fromPos.left + fromPos.right) / 2;
        const fromCenterY = (fromPos.top + fromPos.bottom) / 2;
        
        // Create animated dashed line
        return (
          <g key="connection-preview">
            {/* Glow effect */}
            <line
              x1={fromCenterX}
              y1={fromCenterY}
              x2={canvasX}
              y2={canvasY}
              stroke="#3B82F6"
              strokeWidth={4}
              strokeOpacity={0.2}
              strokeLinecap="round"
            />
            {/* Main line with animated dashes */}
            <line
              x1={fromCenterX}
              y1={fromCenterY}
              x2={canvasX}
              y2={canvasY}
              stroke="#3B82F6"
              strokeWidth={2.5}
              strokeOpacity={0.8}
              strokeDasharray="8 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: 'dash-flow 0.5s linear infinite',
              }}
            />
            {/* Endpoint circle with subtle pulse */}
            <circle
              cx={canvasX}
              cy={canvasY}
              r={5}
              fill="#3B82F6"
              opacity={0.8}
            />
            <circle
              cx={canvasX}
              cy={canvasY}
              r={8}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={2}
              opacity={0.4}
              style={{
                animation: 'pulse-circle 1.5s ease-in-out infinite',
              }}
            />
          </g>
        );
      })()}
    </svg>
  );
}

ConnectionsSvg.propTypes = {
  connections: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  nodePositions: PropTypes.object.isRequired,
  isDarkMode: PropTypes.bool,
  fxOptions: PropTypes.object,
  selectedNode: PropTypes.string,
  relatedNodeIds: PropTypes.instanceOf(Set),
  connectionFrom: PropTypes.string,
  mousePosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  zoom: PropTypes.number,
  pan: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
};
