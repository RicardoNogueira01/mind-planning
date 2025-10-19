/**
 * Node Dragging and Canvas Panning Hook
 * Handles: dragging individual nodes and panning the canvas
 */

import { useRef, useState, useCallback } from 'react';
import type { Node } from '../types/mindmap';

export function useDragging(
  nodes: Node[],
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void,
  canvasRef: React.RefObject<HTMLDivElement>,
  mode: string
) {
  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Panning state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef({ startX: 0, startY: 0 });

  /**
   * Handle mouse down on canvas
   * Detects if clicking on a node (drag) or empty canvas (pan)
   */
  const startPanning = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Ignore mouse down from toolbar buttons or popups
      if (e.target instanceof HTMLElement) {
        if (e.target.closest('.node-toolbar-btn') || e.target.closest('.node-popup')) {
          return;
        }

        // Node drag takes precedence when clicking on a node wrapper
        const target = e.target.closest('[data-node-id]');
        if (target instanceof HTMLElement) {
          const id = target.dataset.nodeId;
          if (id) {
            const node = nodes.find(n => n.id === id);
            if (node && canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              setDraggingNodeId(id);
              setDragOffset({
                x: e.clientX - rect.left - (node.x + pan.x),
                y: e.clientY - rect.top - (node.y + pan.y),
              });
              return;
            }
          }
        }
      }

      // Canvas panning (only in pan mode)
      if (mode !== 'pan') return;
      if (e.target !== canvasRef.current) return;
      
      setIsPanning(true);
      panRef.current = {
        startX: e.clientX - pan.x,
        startY: e.clientY - pan.y,
      };
    },
    [nodes, pan, mode, canvasRef]
  );

  /**
   * Handle mouse move on canvas
   * Updates node position if dragging, or canvas pan if panning
   */
  const handlePanning = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Ignore while interacting with popups
      if (e.target instanceof HTMLElement) {
        if (e.target.closest('.node-popup')) return;
      }

      // Node dragging
      if (draggingNodeId) {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const newX = e.clientX - rect.left - pan.x - dragOffset.x;
          const newY = e.clientY - rect.top - pan.y - dragOffset.y;
          setNodes(prev =>
            prev.map(n =>
              n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n
            )
          );
        }
        return;
      }

      // Canvas panning
      if (!isPanning) return;
      setPan({
        x: e.clientX - panRef.current.startX,
        y: e.clientY - panRef.current.startY,
      });
    },
    [draggingNodeId, pan, dragOffset, isPanning, setNodes, canvasRef]
  );

  /**
   * Handle mouse up - stop dragging/panning
   */
  const stopPanning = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  return {
    // Dragging state
    draggingNodeId,
    dragOffset,
    // Panning state
    pan,
    setPan,
    isPanning,
    // Handlers
    startPanning,
    handlePanning,
    stopPanning,
  };
}
