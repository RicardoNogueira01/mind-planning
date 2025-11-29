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
   * Position children intelligently with auto-balancing:
   * - Detects available space around parent in all directions
   * - Distributes children evenly above and below parent (or left/right)
   * - Keeps parent centered among its children
   * - Checks for collisions with existing nodes
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

    // If children exist, determine layout direction and balance them
    const firstChild = childNodes[0];
    const dx = firstChild.x - parent.x;
    const dy = firstChild.y - parent.y;

    // Determine the primary direction of existing children
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    
    if (isHorizontal) {
      // Children are positioned horizontally (left or right)
      const isRight = dx > 0;
      const targetX = isRight ? parent.x + OFFSET_DISTANCE : parent.x - OFFSET_DISTANCE;
      
      // Calculate balanced vertical position
      // Distribute children evenly: half above, half below parent
      const newChildIndex = childNodes.length; // 0-indexed position of new child
      const totalChildren = childNodes.length + 1; // Including the new one
      
      // Calculate position to keep parent centered
      // For odd numbers (1,3,5): middle child aligns with parent
      // For even numbers (2,4,6): children split evenly above/below
      const halfCount = Math.floor(totalChildren / 2);
      const centerOffset = totalChildren % 2 === 0 ? (NODE_HEIGHT + MARGIN) / 2 : 0;
      
      const childPosition = newChildIndex - halfCount;
      const yOffset = childPosition * (NODE_HEIGHT + MARGIN) + centerOffset;
      
      return {
        x: targetX,
        y: parent.y + yOffset
      };
    } else {
      // Children are positioned vertically (up or down)
      const isDown = dy > 0;
      const targetX = firstChild.x;
      
      // Calculate balanced horizontal position
      const newChildIndex = childNodes.length;
      const totalChildren = childNodes.length + 1;
      
      const halfCount = Math.floor(totalChildren / 2);
      const centerOffset = totalChildren % 2 === 0 ? (NODE_HEIGHT + MARGIN) / 2 : 0;
      
      const childPosition = newChildIndex - halfCount;
      const yOffset = childPosition * (NODE_HEIGHT + MARGIN) + centerOffset;
      
      if (isDown) {
        return {
          x: targetX,
          y: parent.y + OFFSET_DISTANCE + yOffset
        };
      } else {
        return {
          x: targetX,
          y: parent.y - OFFSET_DISTANCE + yOffset
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
