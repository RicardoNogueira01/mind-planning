/**
 * Node Positioning Logic Hook
 * Handles hierarchical positioning, collision detection, and cascading layout
 */

import { useCallback } from 'react';
import type { Node, Position, Connection } from '../types/mindmap';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 56;
const MARGIN = 25; // 25px spacing between nodes
const COLLISION_DISTANCE = 100; // Minimum distance between node centers
const MIN_HORIZONTAL_SPACING = NODE_WIDTH + 40; // Prevent horizontal overlap
const MIN_VERTICAL_SPACING = NODE_HEIGHT + MARGIN; // Prevent vertical overlap

export function useNodePositioning(nodes: Node[], connections: Connection[] = []) {
  /**
   * Check if position is valid (not occupied by another node)
   * Uses rectangular collision detection for better accuracy
   */
  const isPositionAvailable = useCallback((x: number, y: number, excludeId: string | null = null, excludeIds: string[] = []): boolean => {
    const allExcluded = excludeId ? [excludeId, ...excludeIds] : excludeIds;

    return !nodes.some(n => {
      if (allExcluded.includes(n.id)) return false;

      // Rectangular collision check (more accurate for nodes)
      const horizontalOverlap = Math.abs(n.x - x) < MIN_HORIZONTAL_SPACING;
      const verticalOverlap = Math.abs(n.y - y) < MIN_VERTICAL_SPACING;

      // Also check distance for diagonal cases
      const distance = Math.hypot(n.x - x, n.y - y);

      return (horizontalOverlap && verticalOverlap) || distance < COLLISION_DISTANCE;
    });
  }, [nodes]);

  /**
   * Check if position is valid against a specific set of nodes (for batch positioning)
   */
  const isPositionAvailableAgainst = useCallback((
    x: number,
    y: number,
    existingNodes: Array<{ x: number; y: number; id?: string }>,
    excludeId: string | null = null
  ): boolean => {
    return !existingNodes.some(n => {
      if (excludeId && n.id === excludeId) return false;

      const horizontalOverlap = Math.abs(n.x - x) < MIN_HORIZONTAL_SPACING;
      const verticalOverlap = Math.abs(n.y - y) < MIN_VERTICAL_SPACING;
      const distance = Math.hypot(n.x - x, n.y - y);

      return (horizontalOverlap && verticalOverlap) || distance < COLLISION_DISTANCE;
    });
  }, []);

  /**
   * Find available position around center in spider web pattern
   * Tries: right, down-right, down, down-left, left, up-left, up, up-right
   */
  const findAvailablePosition = useCallback((centerX: number, centerY: number, radius: number = 300): Position => {
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]; // 8 directions
    const radii = [radius, radius * 1.5, radius * 2, radius * 2.5];

    for (const r of radii) {
      for (const angle of angles) {
        const rad = (angle * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * r;
        const y = centerY + Math.sin(rad) * r;

        if (isPositionAvailable(x, y)) {
          return { x, y };
        }
      }
    }

    // Fallback: return a position anyway
    return { x: centerX + radius, y: centerY };
  }, [isPositionAvailable]);

  /**
   * Stack new standalone nodes below existing ones with MARGIN gap
   */
  const findStackedPosition = useCallback((baseX: number | null = null, baseY: number | null = null): Position => {
    if (nodes.length === 0) {
      return {
        x: baseX ?? Math.round(window.innerWidth / 2),
        y: baseY ?? Math.round(window.innerHeight / 2)
      };
    }

    // Find the lowest Y position among all nodes
    const lowestY = Math.max(...nodes.map(n => n.y));

    // Stack the new node below the lowest one
    return {
      x: baseX ?? Math.round(window.innerWidth / 2),
      y: lowestY + NODE_HEIGHT + MARGIN
    };
  }, [nodes]);

  /**
   * Position children intelligently without moving existing children:
   * - For first child: Detects available space around parent
   * - For additional children: Stacks them in the same direction as first child
   * - NO auto-rebalancing - children stay where placed
   */
  const findStackedChildPosition = useCallback((parentId: string, preferredX: number, preferredY: number): Position => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return { x: preferredX, y: preferredY };

    const NODE_WIDTH = 300;
    const OFFSET_DISTANCE = NODE_WIDTH + 80; // Distance from parent
    const DETECTION_RADIUS = 400; // How far to check for obstacles

    // Find all existing children of this parent using connections
    const childNodeIds = connections
      .filter(conn => conn.from === parentId)
      .map(conn => conn.to);

    const childNodes = nodes.filter(n => childNodeIds.includes(n.id));

    // If no children exist yet, detect which direction has most free space
    if (childNodeIds.length === 0) {
      // Check all 4 directions for obstacles
      const directions = [
        { name: 'right', x: parent.x + OFFSET_DISTANCE, y: parent.y, angle: 0 },
        { name: 'down', x: parent.x, y: parent.y + OFFSET_DISTANCE, angle: 90 },
        { name: 'left', x: parent.x - OFFSET_DISTANCE, y: parent.y, angle: 180 },
        { name: 'up', x: parent.x, y: parent.y - OFFSET_DISTANCE, angle: 270 },
      ];

      // Count obstacles in each direction
      const directionScores = directions.map(dir => {
        const obstacles = nodes.filter(n => {
          if (n.id === parentId) return false;

          const dx = n.x - dir.x;
          const dy = n.y - dir.y;
          const distance = Math.hypot(dx, dy);

          return distance < DETECTION_RADIUS;
        });

        return {
          ...dir,
          obstacles: obstacles.length,
          score: DETECTION_RADIUS - obstacles.length * 100 // Fewer obstacles = higher score
        };
      });

      // Choose direction with fewest obstacles (highest score)
      const bestDirection = directionScores.reduce((best, current) =>
        current.score > best.score ? current : best,
        directionScores[0]
      );

      return { x: bestDirection.x, y: bestDirection.y };
    }

    // If children exist, stack new child in same direction as siblings
    const firstChild = childNodes[0];
    const dx = firstChild.x - parent.x;
    const dy = firstChild.y - parent.y;

    // Determine the primary direction of existing children
    const isHorizontal = Math.abs(dx) > Math.abs(dy);

    if (isHorizontal) {
      // Children are positioned horizontally (left or right)
      const isRight = dx > 0;

      // Use the X position of existing children (average) instead of fixed offset from parent
      // This keeps new children aligned with siblings
      const childrenXPositions = childNodes.map(c => c.x);
      const avgChildX = childrenXPositions.reduce((a, b) => a + b, 0) / childrenXPositions.length;
      const targetX = avgChildX; // Align with existing siblings

      // Stack vertically: find the highest or lowest child and add below/above
      const childrenYPositions = childNodes.map(c => c.y);
      const maxY = Math.max(...childrenYPositions);
      const minY = Math.min(...childrenYPositions);

      // Determine if children are stacking upward or downward
      const lastChildY = childNodes[childNodes.length - 1].y;
      const stackingDown = lastChildY >= parent.y;

      if (stackingDown) {
        // Add below the lowest child
        return {
          x: targetX,
          y: maxY + NODE_HEIGHT + MARGIN
        };
      } else {
        // Add above the highest child
        return {
          x: targetX,
          y: minY - NODE_HEIGHT - MARGIN
        };
      }
    } else {
      // Children are positioned vertically (up or down)
      const isDown = dy > 0;

      // Use the Y position of existing children (average) instead of fixed offset from parent
      const childrenYPositions = childNodes.map(c => c.y);
      const avgChildY = childrenYPositions.reduce((a, b) => a + b, 0) / childrenYPositions.length;
      const targetY = avgChildY; // Align with existing siblings

      // Stack horizontally: find rightmost or leftmost child and add next to it
      const childrenXPositions = childNodes.map(c => c.x);
      const maxX = Math.max(...childrenXPositions);
      const minX = Math.min(...childrenXPositions);

      // Determine stacking direction
      const lastChildX = childNodes[childNodes.length - 1].x;
      const stackingRight = lastChildX >= parent.x;

      if (stackingRight) {
        return {
          x: maxX + NODE_WIDTH + MARGIN,
          y: targetY
        };
      } else {
        return {
          x: minX - NODE_WIDTH - MARGIN,
          y: targetY
        };
      }
    }
  }, [nodes, connections]);

  /**
   * Find non-colliding position for a node by spiraling outward from preferred position
   * More aggressive than findAvailablePosition - checks many more positions
   */
  const findNonCollidingPosition = useCallback((
    preferredX: number,
    preferredY: number,
    excludeId: string | null = null,
    additionalNodes: Array<{ x: number; y: number; id?: string }> = []
  ): Position => {
    // Check if preferred position is available
    const allNodes = [...nodes, ...additionalNodes];
    if (isPositionAvailableAgainst(preferredX, preferredY, allNodes, excludeId)) {
      return { x: preferredX, y: preferredY };
    }

    // Spiral outward from preferred position to find a free spot
    const directions = [
      { dx: 1, dy: 0 },   // right
      { dx: 1, dy: 1 },   // down-right
      { dx: 0, dy: 1 },   // down
      { dx: -1, dy: 1 },  // down-left
      { dx: -1, dy: 0 },  // left
      { dx: -1, dy: -1 }, // up-left
      { dx: 0, dy: -1 },  // up
      { dx: 1, dy: -1 },  // up-right
    ];

    // Try increasing distances with more granularity
    for (let distance = 1; distance <= 10; distance++) {
      const stepX = MIN_HORIZONTAL_SPACING * distance;
      const stepY = MIN_VERTICAL_SPACING * distance;

      for (const dir of directions) {
        const testX = preferredX + dir.dx * stepX;
        const testY = preferredY + dir.dy * stepY;

        if (isPositionAvailableAgainst(testX, testY, allNodes, excludeId)) {
          return { x: testX, y: testY };
        }
      }
    }

    // Fallback: return position far to the right
    return {
      x: preferredX + MIN_HORIZONTAL_SPACING * 3,
      y: preferredY
    };
  }, [nodes, isPositionAvailableAgainst]);

  /**
   * Position multiple child nodes around a parent without overlaps
   * This is ideal for AI task decomposition where multiple nodes are created at once
   */
  const positionMultipleChildren = useCallback((
    parentId: string,
    count: number,
    startDirection: 'right' | 'down' | 'left' | 'up' = 'right'
  ): Position[] => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) {
      // Fallback positions if no parent
      return Array.from({ length: count }, (_, i) => ({
        x: 200 + (i % 3) * MIN_HORIZONTAL_SPACING,
        y: 200 + Math.floor(i / 3) * MIN_VERTICAL_SPACING
      }));
    }

    const OFFSET_DISTANCE = NODE_WIDTH + 100;
    const positions: Position[] = [];
    const placedPositions: Array<{ x: number; y: number }> = [];

    // Determine base position based on direction
    let baseX = parent.x;
    let baseY = parent.y;

    switch (startDirection) {
      case 'right':
        baseX = parent.x + OFFSET_DISTANCE;
        break;
      case 'down':
        baseY = parent.y + OFFSET_DISTANCE;
        break;
      case 'left':
        baseX = parent.x - OFFSET_DISTANCE;
        break;
      case 'up':
        baseY = parent.y - OFFSET_DISTANCE;
        break;
    }

    // Calculate grid layout based on count
    const columns = Math.min(count, 3); // Max 3 columns
    const rows = Math.ceil(count / columns);

    // Center the grid
    const gridWidth = (columns - 1) * MIN_HORIZONTAL_SPACING;
    const gridHeight = (rows - 1) * MIN_VERTICAL_SPACING;

    let startX = baseX;
    let startY = baseY - gridHeight / 2;

    if (startDirection === 'down' || startDirection === 'up') {
      startX = baseX - gridWidth / 2;
      startY = baseY;
    }

    for (let i = 0; i < count; i++) {
      let preferredX: number;
      let preferredY: number;

      if (startDirection === 'right' || startDirection === 'left') {
        // Stack vertically when going horizontal
        const row = i;
        preferredX = startX;
        preferredY = startY + row * MIN_VERTICAL_SPACING;
      } else {
        // Stack horizontally when going vertical  
        const col = i % columns;
        const row = Math.floor(i / columns);
        preferredX = startX + col * MIN_HORIZONTAL_SPACING;
        preferredY = startY + row * MIN_VERTICAL_SPACING;
      }

      // Find non-colliding position considering both existing nodes and already placed positions
      const position = findNonCollidingPosition(
        preferredX,
        preferredY,
        null,
        placedPositions
      );

      positions.push(position);
      placedPositions.push(position);
    }

    return positions;
  }, [nodes, findNonCollidingPosition]);

  /**
   * Resolve collisions for all nodes - moves overlapping nodes to nearest free position
   * Call this after any batch node operations
   */
  const resolveAllCollisions = useCallback((nodeList: Node[]): Node[] => {
    const resolvedNodes: Node[] = [];

    for (const node of nodeList) {
      // Check if this node collides with any already-resolved nodes
      const hasCollision = resolvedNodes.some(resolved => {
        const horizontalOverlap = Math.abs(resolved.x - node.x) < MIN_HORIZONTAL_SPACING;
        const verticalOverlap = Math.abs(resolved.y - node.y) < MIN_VERTICAL_SPACING;
        const distance = Math.hypot(resolved.x - node.x, resolved.y - node.y);

        return (horizontalOverlap && verticalOverlap) || distance < COLLISION_DISTANCE;
      });

      if (hasCollision) {
        // Find new position that doesn't collide
        const newPosition = findNonCollidingPosition(node.x, node.y, node.id, resolvedNodes);
        resolvedNodes.push({ ...node, x: newPosition.x, y: newPosition.y });
      } else {
        resolvedNodes.push(node);
      }
    }

    return resolvedNodes;
  }, [findNonCollidingPosition]);

  /**
   * Check and fix position after drag - ensures node doesn't overlap with others
   */
  const snapToNonCollidingPosition = useCallback((
    nodeId: string,
    x: number,
    y: number
  ): Position => {
    if (isPositionAvailable(x, y, nodeId)) {
      return { x, y };
    }
    return findNonCollidingPosition(x, y, nodeId);
  }, [isPositionAvailable, findNonCollidingPosition]);

  /**
   * Push overlapping nodes away from a source node
   * Returns array of nodes with updated positions
   * The source node stays in place, colliding nodes are pushed away
   * @param sourceNodeId - The node that stays in place
   * @param sourceX - X position of source node
   * @param sourceY - Y position of source node
   * @param allNodes - All nodes to check
   * @param excludeIds - Node IDs to exclude from pushing (e.g., siblings)
   */
  const pushCollidingNodes = useCallback((
    sourceNodeId: string,
    sourceX: number,
    sourceY: number,
    allNodes: Node[],
    excludeIds: string[] = []
  ): Node[] => {
    const PUSH_ITERATIONS = 5; // Max iterations to resolve all collisions

    // IDs that should not be pushed (source + excludes)
    const protectedIds = new Set([sourceNodeId, ...excludeIds]);

    let updatedNodes = allNodes.map(n =>
      n.id === sourceNodeId ? { ...n, x: sourceX, y: sourceY } : { ...n }
    );

    // Iteratively push nodes until no collisions or max iterations reached
    for (let iteration = 0; iteration < PUSH_ITERATIONS; iteration++) {
      let hasCollision = false;
      const newPositions: Node[] = [];

      for (const node of updatedNodes) {
        if (protectedIds.has(node.id)) {
          // Protected nodes stay in place
          newPositions.push(node);
          continue;
        }

        // Check collision with source node
        const dx = node.x - sourceX;
        const dy = node.y - sourceY;
        const horizontalOverlap = Math.abs(dx) < MIN_HORIZONTAL_SPACING;
        const verticalOverlap = Math.abs(dy) < MIN_VERTICAL_SPACING;

        if (horizontalOverlap && verticalOverlap) {
          hasCollision = true;

          // Calculate minimum push to clear the collision
          const overlapX = MIN_HORIZONTAL_SPACING - Math.abs(dx);
          const overlapY = MIN_VERTICAL_SPACING - Math.abs(dy);

          // Push in the direction that requires less movement
          let pushX = 0;
          let pushY = 0;

          if (overlapX < overlapY) {
            // Push horizontally
            pushX = (overlapX + 20) * Math.sign(dx || 1);
          } else {
            // Push vertically
            pushY = (overlapY + 20) * Math.sign(dy || 1);
          }

          newPositions.push({
            ...node,
            x: node.x + pushX,
            y: node.y + pushY
          });
        } else {
          newPositions.push(node);
        }
      }

      updatedNodes = newPositions;

      // If no collisions found, we're done
      if (!hasCollision) break;
    }

    // Second pass: check for collisions between pushed nodes and resolve them
    for (let iteration = 0; iteration < PUSH_ITERATIONS; iteration++) {
      let hasCollision = false;

      for (let i = 0; i < updatedNodes.length; i++) {
        if (protectedIds.has(updatedNodes[i].id)) continue;

        for (let j = i + 1; j < updatedNodes.length; j++) {
          if (protectedIds.has(updatedNodes[j].id)) continue;

          const nodeA = updatedNodes[i];
          const nodeB = updatedNodes[j];

          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const horizontalOverlap = Math.abs(dx) < MIN_HORIZONTAL_SPACING;
          const verticalOverlap = Math.abs(dy) < MIN_VERTICAL_SPACING;

          if (horizontalOverlap && verticalOverlap) {
            hasCollision = true;

            // Push nodeB away from nodeA
            const overlapX = MIN_HORIZONTAL_SPACING - Math.abs(dx);
            const overlapY = MIN_VERTICAL_SPACING - Math.abs(dy);

            if (overlapX < overlapY) {
              updatedNodes[j] = {
                ...nodeB,
                x: nodeB.x + (overlapX + 20) * Math.sign(dx || 1)
              };
            } else {
              updatedNodes[j] = {
                ...nodeB,
                y: nodeB.y + (overlapY + 20) * Math.sign(dy || 1)
              };
            }
          }
        }
      }

      if (!hasCollision) break;
    }

    return updatedNodes;
  }, []);

  return {
    isPositionAvailable,
    findAvailablePosition,
    findStackedPosition,
    findStackedChildPosition,
    findNonCollidingPosition,
    positionMultipleChildren,
    resolveAllCollisions,
    snapToNonCollidingPosition,
    pushCollidingNodes,
    // Export constants for external use
    NODE_DIMENSIONS: { width: NODE_WIDTH, height: NODE_HEIGHT, margin: MARGIN },
  };
}
