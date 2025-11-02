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
   * Position children hierarchically:
   * - Stacks children vertically to the right of parent
   * - Creates a cascading layout flowing downward
   * - Each child is positioned below the previous one
   */
  const findStackedChildPosition = useCallback((parentId: string, preferredX: number, preferredY: number): Position => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return { x: preferredX, y: preferredY };

    // Find all existing children of this parent using connections
    const childNodeIds = connections
      .filter(conn => conn.from === parentId)
      .map(conn => conn.to);

    // If no children exist yet, use the parent's Y position (first child aligns with parent)
    if (childNodeIds.length === 0) {
      return { x: preferredX, y: parent.y };
    }

    // Get all child nodes
    const childNodes = nodes.filter(n => childNodeIds.includes(n.id));
    
    // Find the lowest child Y position
    const lowestY = Math.max(...childNodes.map(n => n.y));
    
    // Position new child below the lowest one with spacing
    return {
      x: preferredX,
      y: lowestY + NODE_HEIGHT + MARGIN
    };
  }, [nodes, connections]);

  return {
    isPositionAvailable,
    findAvailablePosition,
    findStackedPosition,
    findStackedChildPosition,
  };
}
