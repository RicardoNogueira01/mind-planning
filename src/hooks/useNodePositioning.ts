/**
 * Node Positioning Logic Hook
 * Handles hierarchical positioning, collision detection, and spider web pattern
 */

import { useCallback } from 'react';
import type { Node, Position, Connection } from '../types/mindmap';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 56;
const MARGIN = 25; // 25px spacing between nodes
const COLLISION_DISTANCE = 80; // Reduced for tighter spacing

export function useNodePositioning(nodes: Node[], connections: Connection[]) {
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
   * Position children hierarchically:
   * - ALL children go to the RIGHT of previous node (horizontal chain)
   * - First child: to the RIGHT of parent
   * - Second child: to the RIGHT of first child
   * - Third child: to the RIGHT of second child (etc.)
   * - Collision avoidance: spider web pattern if no space
   */
  const findStackedChildPosition = useCallback((parentId: string, preferredX: number, preferredY: number): Position => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return { x: preferredX, y: preferredY };

    const childrenOfParent = nodes.filter(n => 
      connections.some(c => c.from === parentId && c.to === n.id)
    );

    if (childrenOfParent.length === 0) {
      // FIRST CHILD: to the RIGHT of parent
      const firstChildX = parent.x + NODE_WIDTH + MARGIN;
      const firstChildY = parent.y;
      
      // Check if position is available, otherwise use spider web
      if (isPositionAvailable(firstChildX, firstChildY)) {
        return { x: firstChildX, y: firstChildY };
      } else {
        // Use spider web pattern to find available space
        return findAvailablePosition(parent.x, parent.y);
      }
    }

    // NEXT CHILDREN: to the RIGHT of the last child (horizontal chain)
    const lastChild = childrenOfParent[childrenOfParent.length - 1];
    
    if (!lastChild) return { x: preferredX, y: preferredY };
    
    const nextChildX = lastChild.x + NODE_WIDTH + MARGIN;
    const nextChildY = lastChild.y;
    
    // Check if position is available, otherwise use spider web
    if (isPositionAvailable(nextChildX, nextChildY)) {
      return { x: nextChildX, y: nextChildY };
    } else {
      // Use spider web pattern to find available space around parent
      return findAvailablePosition(parent.x, parent.y);
    }
  }, [nodes, connections, isPositionAvailable, findAvailablePosition]);

  return {
    isPositionAvailable,
    findAvailablePosition,
    findStackedPosition,
    findStackedChildPosition,
  };
}
