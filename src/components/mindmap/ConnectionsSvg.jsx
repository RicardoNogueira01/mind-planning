import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { computeBezierPath } from './connectionGeometry';

/**
 * ConnectionsSvg: Enhanced presentational component that renders all connections as a single SVG.
 * Features:
 * - Smooth curved Bezier paths
 * - Optional arrows to show direction
 * - Hover effects with highlighting
 * - Color inheritance from parent node
 * - Animated connection creation preview
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
  showArrows = false, // Optional: show direction arrows
  colorMode = 'default', // 'default' | 'parent' | 'gradient'
}) {
  const [hoveredConnection, setHoveredConnection] = useState(null);
  
  const defaultStrokeColor = isDarkMode ? '#6b7280' : '#94a3b8';
  const hasConnections = Array.isArray(connections) && connections.length > 0;
  const showPreview = connectionFrom && mousePosition;

  // Always render SVG if there are connections or if we're in connection mode
  if (!hasConnections && !showPreview) {
    return null;
  }

  // Get color for a connection based on mode
  const getConnectionColor = (conn, fromNode) => {
    if (colorMode === 'parent' && fromNode?.bgColor && fromNode.bgColor !== '#ffffff') {
      // Use parent's background color with some transparency
      return fromNode.bgColor;
    }
    if (colorMode === 'gradient') {
      return `url(#gradient-${conn.id})`;
    }
    return conn.color || defaultStrokeColor;
  };

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
        {/* Arrow marker for direction indication */}
        <marker 
          id="arrowhead" 
          markerWidth="12" 
          markerHeight="8" 
          refX="10" 
          refY="4" 
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path 
            d="M 0 0 L 12 4 L 0 8 L 3 4 Z" 
            fill={defaultStrokeColor} 
            opacity="0.7" 
          />
        </marker>
        
        {/* Hover glow filter */}
        <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Gradients for each connection (when using gradient mode) */}
        {colorMode === 'gradient' && connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          const fromColor = fromNode?.bgColor || defaultStrokeColor;
          const toColor = toNode?.bgColor || defaultStrokeColor;
          
          return (
            <linearGradient key={`gradient-${conn.id}`} id={`gradient-${conn.id}`}>
              <stop offset="0%" stopColor={fromColor === '#ffffff' ? defaultStrokeColor : fromColor} />
              <stop offset="100%" stopColor={toColor === '#ffffff' ? defaultStrokeColor : toColor} />
            </linearGradient>
          );
        })}
      </defs>
      
      {connections.map((conn) => {
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
        
        // Sort siblings by their Y position (top to bottom) for proper distribution
        const sortedSiblings = [...siblingsInSameDirection].sort((a, b) => {
          const aPosY = (nodePositions[a.to].top + nodePositions[a.to].bottom) / 2;
          const bPosY = (nodePositions[b.to].top + nodePositions[b.to].bottom) / 2;
          return aPosY - bPosY;
        });
        
        const childIndex = sortedSiblings.findIndex(c => c.id === conn.id);
        const totalChildren = sortedSiblings.length;
        
        const { d: pathData, label: labelPoint, start, end } = computeBezierPath(fromPos, toPos, {
          childIndex,
          totalChildren,
          parentId: conn.from
        });
        
        // Focus mode and related node highlighting
        const inFocusMode = !!(fxOptions?.enabled && fxOptions?.focusMode && selectedNode);
        const isRelated = !!(relatedNodeIds?.has(conn.from) || relatedNodeIds?.has(conn.to));
        const isHovered = hoveredConnection === conn.id;
        const isSelected = selectedNode === conn.from || selectedNode === conn.to;
        
        let focusOpacity = 0.6;
        if (inFocusMode) {
          focusOpacity = isRelated ? 0.8 : 0.15;
        }
        if (isHovered || isSelected) {
          focusOpacity = 0.95;
        }
        
        const connectionColor = getConnectionColor(conn, fromNode);
        const strokeWidth = isHovered || isSelected ? 3.5 : 2.5;

        return (
          <g key={conn.id}>
            {/* Invisible wider path for easier hover detection */}
            <path
              d={pathData}
              stroke="transparent"
              strokeWidth={20}
              fill="none"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredConnection(conn.id)}
              onMouseLeave={() => setHoveredConnection(null)}
            />
            
            {/* Glow effect for hovered/selected connections */}
            {(isHovered || isSelected) && (
              <path
                d={pathData}
                stroke={connectionColor}
                strokeWidth={8}
                fill="none"
                strokeOpacity={0.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Main connection path */}
            <path
              d={pathData}
              stroke={connectionColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeOpacity={focusOpacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={showArrows ? 'url(#arrowhead)' : undefined}
              style={{ 
                transition: 'all 0.2s ease-out',
                filter: (isHovered || isSelected) ? 'url(#connection-glow)' : 'none'
              }}
            />
            
            {/* Small circle at parent connection point */}
            {(isHovered || isSelected) && start && (
              <circle
                cx={start.x}
                cy={start.y}
                r={4}
                fill={connectionColor}
                opacity={focusOpacity}
                style={{ transition: 'all 0.2s ease-out' }}
              />
            )}
            
            {/* Small circle at child connection point */}
            {(isHovered || isSelected) && end && (
              <circle
                cx={end.x}
                cy={end.y}
                r={4}
                fill={connectionColor}
                opacity={focusOpacity}
                style={{ transition: 'all 0.2s ease-out' }}
              />
            )}
            
            {/* Connection label */}
            {conn.label && labelPoint && (
              <g>
                {/* Label background */}
                <rect
                  x={labelPoint.x - 20}
                  y={labelPoint.y - 16}
                  width={40}
                  height={20}
                  rx={4}
                  fill={isDarkMode ? '#1f2937' : '#ffffff'}
                  opacity={0.9}
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y - 2}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={500}
                  fill={isDarkMode ? '#e5e7eb' : '#334155'}
                  opacity={(function(){
                    if (!inFocusMode) return 0.9;
                    return isRelated ? 0.9 : 0.35;
                  })()}
                >
                  {conn.label}
                </text>
              </g>
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
  showArrows: PropTypes.bool,
  colorMode: PropTypes.oneOf(['default', 'parent', 'gradient']),
};
