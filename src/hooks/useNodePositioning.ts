/**
 * Node Positioning Logic Hook
 * Handles hierarchical positioning, collision detection, and cascading layout
 */

import { useCallback } from 'react';
import type { Node, Position, Connection } from '../types/mindmap';

const NODE_HEIGHT = 56;
const MARGIN = 25; // 25px spacing between nodes
const COLLISION_DISTANCE = 80; // Reduced for tighter spacing

export function useNodePositioning(nodes: Node[], connections: Connection[] = []) {
  /**
   * Check if position is valid (not occupied by another node)
   */
  const isPositionAvailable = useCallback((x: number, y: number, excludeId: string | null = null): boolean => {
    return !nodes.some(n => {
      if (excludeId && n.id === excludeId) return false;
      const dx = n.x - x;
      const dy = n.y - y;
      const distance = Math.hypot(dx, dy);
      return distance < COLLISION_DISTANCE;
    });
  }, [nodes]);

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
      const targetX = isRight ? parent.x + OFFSET_DISTANCE : parent.x - OFFSET_DISTANCE;
      
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
      const targetY = isDown ? parent.y + OFFSET_DISTANCE : parent.y - OFFSET_DISTANCE;
      
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

  return {
    isPositionAvailable,
    findAvailablePosition,
    findStackedPosition,
    findStackedChildPosition,
  };
}
