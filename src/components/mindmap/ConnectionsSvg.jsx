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
}) {
  // Debug logging
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[ConnectionsSvg] Rendering with:', {
        connectionsCount: connections?.length || 0,
        nodesCount: nodes?.length || 0,
        nodePositionsCount: Object.keys(nodePositions || {}).length,
        connections: connections,
        nodePositions: nodePositions
      });
    }
  }, [connections, nodes, nodePositions]);

  if (!Array.isArray(connections) || connections.length === 0) {
    console.log('[ConnectionsSvg] No connections to render');
    return null;
  }

  const strokeColor = isDarkMode ? '#9ca3af' : '#64748B';

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
      {connections.map((conn) => {
        const fromNode = nodes.find((n) => n.id === conn.from);
        const toNode = nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) {
          console.log('[ConnectionsSvg] Skipping connection - missing nodes:', { conn, fromNodeExists: !!fromNode, toNodeExists: !!toNode });
          return null;
        }

        const fromPos = nodePositions?.[conn.from];
        const toPos = nodePositions?.[conn.to];
        if (!fromPos || !toPos) {
          console.log('[ConnectionsSvg] Skipping connection - missing positions:', { conn, fromPos, toPos });
          return null;
        }

        console.log('[ConnectionsSvg] Rendering connection:', { conn, fromPos, toPos });
  const { d: pathData, label: labelPoint } = computeBezierPath(fromPos, toPos);
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
              strokeWidth={2}
              fill="none"
              strokeOpacity={focusOpacity}
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
};
