/**
 * Node Positioning Logic Hook
 * Handles hierarchical positioning, collision detection, and cascading layout
 */

import { useCallback } from 'react';
import type { Node, Position, Connection } from '../types/mindmap';

const NODE_WIDTH = 300;
const NODE_HEIGHT = 56;
const MARGIN = 15; // 15px spacing between nodes
const COLLISION_DISTANCE = 90; // Minimum distance between node centers
const MIN_HORIZONTAL_SPACING = NODE_WIDTH + 20; // Prevent horizontal overlap
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
   * Position children intelligently:
   * - For first child: Prefers RIGHT placement (more natural for mind maps)
   * - For additional children: Stacks them vertically, centered around parent
   * - Always places children in intuitive positions, never far from parent
   */
  const findStackedChildPosition = useCallback((parentId: string, preferredX: number, preferredY: number): Position => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return { x: preferredX, y: preferredY };

    const OFFSET_DISTANCE = NODE_WIDTH + 40; // Distance from parent
    const CHILD_SPACING = NODE_HEIGHT + 15; // Vertical spacing between siblings

    // Find all existing children of this parent using connections
    const childNodeIds = connections
      .filter(conn => conn.from === parentId)
      .map(conn => conn.to);

    const childNodes = nodes.filter(n => childNodeIds.includes(n.id));

    // If no children exist yet, place to the RIGHT of parent (most natural for mind maps)
    if (childNodes.length === 0) {
      // Check if RIGHT is clear
      const rightX = parent.x + OFFSET_DISTANCE;
      const rightY = parent.y;

      const rightClear = !nodes.some(n => {
        if (n.id === parentId) return false;
        const dx = Math.abs(n.x - rightX);
        const dy = Math.abs(n.y - rightY);
        return dx < MIN_HORIZONTAL_SPACING && dy < MIN_VERTICAL_SPACING;
      });

      if (rightClear) {
        return { x: rightX, y: rightY };
      }

      // If RIGHT is blocked, try other directions: DOWN, LEFT, UP (in order of preference)
      const fallbackDirections = [
        { x: parent.x, y: parent.y + OFFSET_DISTANCE }, // DOWN
        { x: parent.x - OFFSET_DISTANCE, y: parent.y }, // LEFT
        { x: parent.x, y: parent.y - OFFSET_DISTANCE }, // UP
      ];

      for (const pos of fallbackDirections) {
        const isClear = !nodes.some(n => {
          if (n.id === parentId) return false;
          const dx = Math.abs(n.x - pos.x);
          const dy = Math.abs(n.y - pos.y);
          return dx < MIN_HORIZONTAL_SPACING && dy < MIN_VERTICAL_SPACING;
        });

        if (isClear) {
          return pos;
        }
      }

      // Default: place to the right
      return { x: rightX, y: rightY };
    }

    // Intelligent placement logic
    const rightChildren = childNodes.filter(n => n.x > parent.x + 50);
    const leftChildren = childNodes.filter(n => n.x < parent.x - 50);
    const belowChildren = childNodes.filter(n => n.y > parent.y + 50 && Math.abs(n.x - parent.x) <= 50);
    const aboveChildren = childNodes.filter(n => n.y < parent.y - 50 && Math.abs(n.x - parent.x) <= 50);

    const isVertical = (belowChildren.length + aboveChildren.length) > (rightChildren.length + leftChildren.length);
    const firstChild = childNodes[0];

    if (isVertical) {
      // Vertical layout (Org Chart style) - Add downward
      const targetY = firstChild ? Math.max(...childNodes.map(c => c.y)) + CHILD_SPACING : parent.y + OFFSET_DISTANCE;
      const targetX = parent.x; // Keep aligned vertically

      // Check for overlapping (if multiple columns in vertical mode)
      // For now, simple vertical stack
      return { x: targetX, y: targetY };
    } else {
      // Horizontal layout (Mind Map style) - Balance Left/Right

      // Determine target side: simple balancing
      // If Left < Right, go Left. Otherwise Right.
      // This creates R, L, R, L pattern
      const targetSide = leftChildren.length < rightChildren.length ? 'left' : 'right';
      const direction = targetSide === 'left' ? -1 : 1;
      const targetX = parent.x + direction * OFFSET_DISTANCE;

      const siblingsOnSide = targetSide === 'left' ? leftChildren : rightChildren;

      if (siblingsOnSide.length === 0) {
        return { x: targetX, y: parent.y };
      }

      // Stack below existing on this side
      const maxY = Math.max(...siblingsOnSide.map(c => c.y));
      return { x: targetX, y: maxY + CHILD_SPACING };
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

    const OFFSET_DISTANCE = NODE_WIDTH + 60;
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
