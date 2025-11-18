/**
 * useNodeSelection Hook
 * Handles node selection logic including multi-select, box selection, and selection state
 */

import { useCallback } from 'react';

export function useNodeSelection(nodes, selectedNodes, setSelectedNodes, selectionType) {
  // Toggle selection of a single node
  const toggleSelectNode = useCallback((nodeId) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      }
      return [...prev, nodeId];
    });
  }, [setSelectedNodes]);

  // Select a single node (replace selection)
  const selectSingleNode = useCallback((nodeId) => {
    setSelectedNodes([nodeId]);
  }, [setSelectedNodes]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedNodes([]);
  }, [setSelectedNodes]);

  // Select all nodes
  const selectAllNodes = useCallback(() => {
    setSelectedNodes(nodes.map(n => n.id));
  }, [nodes, setSelectedNodes]);

  // Select nodes within a rectangular area (box selection)
  const selectNodesInRect = useCallback((rect) => {
    const selectedIds = nodes.filter(node => {
      const nodeLeft = node.x - 150;
      const nodeRight = node.x + 150;
      const nodeTop = node.y - 42;
      const nodeBottom = node.y + 42;

      return (
        nodeLeft < rect.right &&
        nodeRight > rect.left &&
        nodeTop < rect.bottom &&
        nodeBottom > rect.top
      );
    }).map(n => n.id);

    setSelectedNodes(selectedIds);
  }, [nodes, setSelectedNodes]);

  // Check if a node is selected
  const isNodeSelected = useCallback((nodeId) => {
    return selectedNodes.includes(nodeId);
  }, [selectedNodes]);

  // Get selected node objects
  const getSelectedNodes = useCallback(() => {
    return nodes.filter(n => selectedNodes.includes(n.id));
  }, [nodes, selectedNodes]);

  // Select nodes by IDs (replace selection)
  const selectNodesByIds = useCallback((nodeIds) => {
    setSelectedNodes(nodeIds);
  }, [setSelectedNodes]);

  // Add nodes to selection (without replacing)
  const addNodesToSelection = useCallback((nodeIds) => {
    setSelectedNodes(prev => {
      const newIds = nodeIds.filter(id => !prev.includes(id));
      return [...prev, ...newIds];
    });
  }, [setSelectedNodes]);

  // Remove nodes from selection
  const removeNodesFromSelection = useCallback((nodeIds) => {
    setSelectedNodes(prev => prev.filter(id => !nodeIds.includes(id)));
  }, [setSelectedNodes]);

  return {
    toggleSelectNode,
    selectSingleNode,
    clearSelection,
    selectAllNodes,
    selectNodesInRect,
    isNodeSelected,
    getSelectedNodes,
    selectNodesByIds,
    addNodesToSelection,
    removeNodesFromSelection,
    selectedCount: selectedNodes.length,
    hasSelection: selectedNodes.length > 0,
    isSingleSelection: selectedNodes.length === 1,
    isMultiSelection: selectedNodes.length > 1
  };
}
