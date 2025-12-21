import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { computeBezierPath, computeOrthogonalPath, computeBracketPaths, computeOrganicPath } from './connectionGeometry';

/**
 * ConnectionsSvg: Enhanced presentational component that renders all connections as a single SVG.
 * Features:
 * - Smooth curved Bezier paths
 * - Orthogonal (org-chart) paths for tree layouts
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
  selectedNode,
  relatedNodeIds,
  connectionFrom,
  mousePosition,
  zoom,
  pan,
  showArrows = false, // Optional: show direction arrows
  colorMode = 'default', // 'default' | 'parent' | 'gradient'
  connectionStyle = 'curved', // 'curved' | 'orthogonal-h' | 'orthogonal-v' | 'bracket'
  themeColors = null, // Theme connection colors
}) {
  const [hoveredConnection, setHoveredConnection] = useState(null);

  // Use theme color if provided, otherwise fall back to defaults
  // For light mode, use a darker color (#4b5563) for better visibility of bracket connections
  const defaultStrokeColor = themeColors?.color || (isDarkMode ? '#6b7280' : '#4b5563');
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

  // Helper to get up-to-date node rectangle
  // Prioritizes live node.x/y from state, uses cached dimensions from nodePositions
  const getNodeRect = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const cachedPos = nodePositions?.[nodeId];

    // Get dimensions from cache (DOM measured) or estimate
    let width = 150;
    let height = 56;

    if (cachedPos) {
      width = cachedPos.right - cachedPos.left;
      height = cachedPos.bottom - cachedPos.top;
    } else {
      // Fallback estimation
      const textLen = (node.text?.length || 0);
      width = Math.min(300, Math.max(120, textLen * 8 + 32));
    }

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return {
      left: node.x - halfWidth,
      right: node.x + halfWidth,
      top: node.y - halfHeight,
      bottom: node.y + halfHeight,
      width,
      height
    };
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

      {/* Bracket-style connections for tree layouts */}
      {connectionStyle === 'bracket' && (() => {
        // Group connections by parent
        const connectionsByParent = {};
        connections.forEach(conn => {
          if (!connectionsByParent[conn.from]) {
            connectionsByParent[conn.from] = [];
          }
          connectionsByParent[conn.from].push(conn);
        });

        return Object.entries(connectionsByParent).map(([parentId, childConns]) => {
          const parentNode = nodes.find(n => n.id === parentId);
          const parentPos = getNodeRect(parentId);
          if (!parentNode || !parentPos) return null;

          // Get child positions
          const childRects = childConns
            .map(conn => getNodeRect(conn.to))
            .filter(Boolean);

          if (childRects.length === 0) return null;

          // Get parent color for the bracket
          let parentColor = parentNode.bgColor && parentNode.bgColor !== '#ffffff'
            ? parentNode.bgColor
            : themeColors?.color || defaultStrokeColor;

          const isColorTooLight = (color) => {
            if (!color || color === '#ffffff' || color === 'white') return true;
            const hex = color.replace('#', '');
            if (hex.length === 6) {
              const r = parseInt(hex.slice(0, 2), 16);
              const g = parseInt(hex.slice(2, 4), 16);
              const b = parseInt(hex.slice(4, 6), 16);
              if (r > 230 && g > 230 && b > 230) return true;
            }
            return false;
          };

          if (isColorTooLight(parentColor)) {
            parentColor = '#4b5563';
          }

          const { paths, underline, circles } = computeBracketPaths(parentPos, childRects, parentColor);
          const strokeWidth = themeColors?.strokeWidth || 2.5;

          return (
            <g key={`bracket-${parentId}`}>
              {underline.d && (
                <path
                  d={underline.d}
                  stroke={underline.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {paths.map((pathData, idx) => (
                <path
                  key={`${parentId}-path-${idx}`}
                  d={pathData.d}
                  stroke={pathData.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'all 0.2s ease-out' }}
                />
              ))}
              {circles && circles.map((circle, idx) => (
                <circle
                  key={`${parentId}-circle-${idx}`}
                  cx={circle.cx}
                  cy={circle.cy}
                  r={circle.r}
                  fill={circle.color}
                  stroke="white"
                  strokeWidth={1.5}
                  style={{ transition: 'all 0.2s ease-out' }}
                />
              ))}
            </g>
          );
        });
      })()}

      {/* Regular connections (non-bracket styles) */}
      {connectionStyle !== 'bracket' && connections.map((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return null;

        const fromPos = getNodeRect(conn.from);
        const toPos = getNodeRect(conn.to);

        if (!fromPos || !toPos) return null;

        // Group siblings by direction
        const siblingsFromSameParent = connections.filter(c => c.from === conn.from);

        const toCenterX = (toPos.left + toPos.right) / 2;
        const toCenterY = (toPos.top + toPos.bottom) / 2;

        let direction = 'right';
        if (toCenterX > fromPos.right) direction = 'right';
        else if (toCenterX < fromPos.left) direction = 'left';
        else if (toCenterY > fromPos.bottom) direction = 'bottom';
        else if (toCenterY < fromPos.top) direction = 'top';

        const siblingsInSameDirection = siblingsFromSameParent.filter(c => {
          const siblingToPos = getNodeRect(c.to);
          if (!siblingToPos) return false;

          const siblingToCenterX = (siblingToPos.left + siblingToPos.right) / 2;
          const siblingToCenterY = (siblingToPos.top + siblingToPos.bottom) / 2;

          let sibDirection;
          if (siblingToCenterX > fromPos.right) sibDirection = 'right';
          else if (siblingToCenterX < fromPos.left) sibDirection = 'left';
          else if (siblingToCenterY > fromPos.bottom) sibDirection = 'bottom';
          else if (siblingToCenterY < fromPos.top) sibDirection = 'top';
          else sibDirection = 'right';

          return sibDirection === direction;
        });

        const sortedSiblings = [...siblingsInSameDirection].sort((a, b) => {
          const aPos = getNodeRect(a.to);
          const bPos = getNodeRect(b.to);
          const aPosY = aPos ? (aPos.top + aPos.bottom) / 2 : 0;
          const bPosY = bPos ? (bPos.top + bPos.bottom) / 2 : 0;
          return aPosY - bPosY;
        });

        const childIndex = sortedSiblings.findIndex(c => c.id === conn.id);
        const totalChildren = sortedSiblings.length;

        let pathData, labelPoint, start, end;
        const fromCenterX = (fromPos.left + fromPos.right) / 2;
        const fromCenterY = (fromPos.top + fromPos.bottom) / 2;
        const dx = Math.abs(((toPos.left + toPos.right) / 2) - fromCenterX);
        const dy = Math.abs(((toPos.top + toPos.bottom) / 2) - fromCenterY);

        if (connectionStyle === 'orthogonal-h') {
          const result = computeOrthogonalPath(fromPos, toPos, 'horizontal');
          pathData = result.d;
          labelPoint = result.label;
          start = result.start;
          end = result.end;
        } else if (connectionStyle === 'orthogonal-v') {
          const autoDirection = dy >= dx * 0.3 ? 'vertical' : 'horizontal';
          const result = computeOrthogonalPath(fromPos, toPos, autoDirection);
          pathData = result.d;
          labelPoint = result.label;
          start = result.start;
          end = result.end;
        } else if (connectionStyle === 'organic') {
          // Organic style: smooth curves emanating from node edges
          // Like the flowing mind map style in the reference image
          const result = computeOrganicPath(fromPos, toPos, {
            childIndex,
            totalChildren,
            parentId: conn.from
          });
          pathData = result.d;
          labelPoint = result.label;
          start = result.start;
          end = result.end;
        } else {
          // Default: smooth Bezier curves with spread
          // Note: using only available node rects for collision might not be perfect if nodePositions is empty,
          // but for dragging it's fine. We prioritize speed.
          const allNodeRects = nodes.map(n => getNodeRect(n.id)).filter(Boolean);

          let forceOrientation = undefined;
          if (direction === 'left' || direction === 'right') forceOrientation = 'horizontal';
          else if (direction === 'top' || direction === 'bottom') forceOrientation = 'vertical';

          const isRoot = !connections.some(c => c.to === conn.from);
          const spreadFactor = isRoot ? 0.9 : 0;

          const result = computeBezierPath(fromPos, toPos, {
            childIndex,
            totalChildren,
            parentId: conn.from,
            allNodeRects,
            forceOrientation,
            spreadFactor
          });
          pathData = result.d;
          labelPoint = result.label;
          start = result.start;
          end = result.end;
        }

        const isRelated = !!(relatedNodeIds?.has(conn.from) || relatedNodeIds?.has(conn.to));
        const isHovered = hoveredConnection === conn.id;
        const isSelected = selectedNode === conn.from || selectedNode === conn.to;
        const isOrthogonal = connectionStyle === 'orthogonal-h' || connectionStyle === 'orthogonal-v';
        const focusOpacity = isHovered ? 0.95 : (isSelected ? 0.8 : (isOrthogonal ? 0.75 : (isRelated ? 0.6 : 0.5)));

        const RAINBOW_COLORS = [
          '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#ef4444',
          '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4',
        ];

        let connectionColor;
        if (connectionStyle === 'curved' || connectionStyle === 'organic' || isOrthogonal) {
          if (toNode?.bgColor && toNode.bgColor !== '#ffffff' && toNode.bgColor !== '#f3f4f6') {
            connectionColor = toNode.bgColor;
          } else if (connectionStyle === 'curved' || connectionStyle === 'organic') {
            // Apply rainbow colors for curved and organic styles
            const colorIndex = childIndex % RAINBOW_COLORS.length;
            connectionColor = RAINBOW_COLORS[colorIndex];
          } else {
            connectionColor = getConnectionColor(conn, fromNode);
          }
        } else {
          connectionColor = getConnectionColor(conn, fromNode);
        }
        const strokeWidth = isHovered ? 3.5 : 3; // Thicker lines for better visibility

        return (
          <g key={conn.id}>
            <path
              d={pathData}
              stroke="transparent"
              strokeWidth={20}
              fill="none"
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredConnection(conn.id)}
              onMouseLeave={() => setHoveredConnection(null)}
            />
            {isHovered && (
              <path
                d={pathData}
                stroke={connectionColor}
                strokeWidth={6}
                fill="none"
                strokeOpacity={0.15}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
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
                filter: isHovered ? 'url(#connection-glow)' : 'none'
                // Removed transition: all 0.2s for d path to avoid lag during drag!
              }}
            />
            {isHovered && start && (
              <circle
                cx={start.x}
                cy={start.y}
                r={3.5}
                fill={connectionColor}
                opacity={0.9}
              />
            )}
            {isHovered && end && (
              <circle
                cx={end.x}
                cy={end.y}
                r={3.5}
                fill={connectionColor}
                opacity={0.9}
              />
            )}
            {conn.label && labelPoint && (
              <g>
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
                  opacity={isRelated ? 0.9 : 0.35}
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Connection Preview Line */}
      {connectionFrom && mousePosition && (() => {
        const fromNode = nodes.find(n => n.id === connectionFrom);
        const fromPos = getNodeRect(connectionFrom);

        if (!fromNode || !fromPos) return null;

        const canvasX = (mousePosition.x - pan.x) / zoom;
        const canvasY = (mousePosition.y - pan.y) / zoom;
        const fromCenterX = (fromPos.left + fromPos.right) / 2;
        const fromCenterY = (fromPos.top + fromPos.bottom) / 2;

        return (
          <g key="connection-preview">
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
  connectionStyle: PropTypes.oneOf(['curved', 'organic', 'orthogonal-h', 'orthogonal-v', 'bracket']),
  themeColors: PropTypes.shape({
    color: PropTypes.string,
    colorMode: PropTypes.string,
    strokeWidth: PropTypes.number,
  }),
};
