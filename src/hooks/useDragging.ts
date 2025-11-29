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
  mode: string,
  selectedNodes: string[],
  getNodeGroup?: (nodeId: string) => any,
  constrainPositionToGroup?: (x: number, y: number, boundingBox: any) => { x: number; y: number },
  zoom?: number
) {
  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialPositions, setInitialPositions] = useState<Record<string, { x: number; y: number }>>({});

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
              const currentZoom = zoom || 1;
              setDraggingNodeId(id);
              setDragOffset({
                x: (e.clientX - rect.left - pan.x) / currentZoom - node.x,
                y: (e.clientY - rect.top - pan.y) / currentZoom - node.y,
              });
              
              // Store initial positions for all selected nodes if this is a multi-select drag
              if (selectedNodes.includes(id) && selectedNodes.length > 1) {
                const positions: Record<string, { x: number; y: number }> = {};
                selectedNodes.forEach(nodeId => {
                  const n = nodes.find(node => node.id === nodeId);
                  if (n) {
                    positions[nodeId] = { x: n.x, y: n.y };
                  }
                });
                setInitialPositions(positions);
              }
              
              return;
            }
          }
        }
      }

      // Canvas panning - works in both cursor and pan modes when clicking empty space
      // In cursor mode: pan when clicking on canvas background (not on nodes)
      // In pan mode: pan is the primary action
      if (mode === 'cursor') {
        // In cursor mode, only pan if clicking directly on canvas (empty space)
        if (e.target !== canvasRef.current) return;
      }
      
      setIsPanning(true);
      panRef.current = {
        startX: e.clientX - pan.x,
        startY: e.clientY - pan.y,
      };
    },
    [nodes, pan, mode, canvasRef, selectedNodes]
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
          const currentZoom = zoom || 1;
          let newX = (e.clientX - rect.left - pan.x) / currentZoom - dragOffset.x;
          let newY = (e.clientY - rect.top - pan.y) / currentZoom - dragOffset.y;
          
          // Check if node is in a group and constrain movement
          if (getNodeGroup && constrainPositionToGroup) {
            const group = getNodeGroup(draggingNodeId);
            if (group && group.boundingBox) {
              const constrained = constrainPositionToGroup(newX, newY, group.boundingBox);
              newX = constrained.x;
              newY = constrained.y;
            }
          }
          
          // If multiple nodes are selected, move them all together
          if (selectedNodes.includes(draggingNodeId) && selectedNodes.length > 1 && Object.keys(initialPositions).length > 0) {
            const draggedNode = nodes.find(n => n.id === draggingNodeId);
            if (draggedNode) {
              const deltaX = newX - initialPositions[draggingNodeId].x;
              const deltaY = newY - initialPositions[draggingNodeId].y;
              
              setNodes(prev =>
                prev.map(n => {
                  if (selectedNodes.includes(n.id) && initialPositions[n.id]) {
                    let finalX = initialPositions[n.id].x + deltaX;
                    let finalY = initialPositions[n.id].y + deltaY;
                    
                    // Apply group constraints to each selected node if applicable
                    if (getNodeGroup && constrainPositionToGroup) {
                      const nodeGroup = getNodeGroup(n.id);
                      if (nodeGroup && nodeGroup.boundingBox) {
                        const constrained = constrainPositionToGroup(finalX, finalY, nodeGroup.boundingBox);
                        finalX = constrained.x;
                        finalY = constrained.y;
                      }
                    }
                    
                    return {
                      ...n,
                      x: finalX,
                      y: finalY
                    };
                  }
                  return n;
                })
              );
            }
          } else {
            // Single node drag
            setNodes(prev =>
              prev.map(n =>
                n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n
              )
            );
          }
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
    [draggingNodeId, pan, dragOffset, isPanning, setNodes, canvasRef, selectedNodes, initialPositions, getNodeGroup, constrainPositionToGroup, nodes, zoom]
  );

  /**
   * Handle mouse up - stop dragging/panning
   */
  const stopPanning = useCallback(() => {
    const wasDraggingNode = draggingNodeId !== null;
    const draggedNodeId = draggingNodeId;
    
    setIsPanning(false);
    setDraggingNodeId(null);
    setInitialPositions({});
    
    // Return info about what was being dragged for the caller to handle
    return { wasDraggingNode, draggedNodeId };
  }, [draggingNodeId]);

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
