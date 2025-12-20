/**
 * Node Operations Hook
 * Handles: add, delete, update, and derive operations on nodes
 */

import { useCallback } from 'react';
import { getDescendantNodeIds, getAncestorNodeIds } from '../components/mindmap/graphUtils';
import type { Node, Connection, Position } from '../types/mindmap';

export function useNodeOperations(
  nodes: Node[],
  connections: Connection[],
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void,
  setConnections: (connections: Connection[] | ((prev: Connection[]) => Connection[])) => void,
  isDarkMode: boolean,
  findStackedPosition: (baseX?: number | null, baseY?: number | null) => Position,
  findStackedChildPosition: (parentId: string, preferredX: number, preferredY: number) => Position,
  pushCollidingNodes?: (nodeId: string, x: number, y: number, allNodes: Node[], excludeIds?: string[]) => Node[]
) {
  const NODE_WIDTH = 300; // Updated to match actual node width
  const NODE_HEIGHT = 56;

  const addStandaloneNode = useCallback(() => {
    const { x, y } = findStackedPosition();

    // Generate default startDate
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultStartDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      text: 'Task',
      x,
      y,
      bgColor: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748',
      startDate: defaultStartDate
    };
    setNodes([...nodes, newNode]);
  }, [findStackedPosition, isDarkMode, nodes, setNodes]);

  const addChildNode = useCallback((parentId: string) => {
    const parent = nodes.find(n => n.id === parentId) || nodes[0];
    if (!parent) return;

    // Get position for new child
    const { x, y } = findStackedChildPosition(parentId, parent.x + NODE_WIDTH + 20, parent.y);

    // Generate default startDate
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultStartDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    const id = `node-${Date.now()}`;
    const child: Node = {
      id,
      text: 'New Task',
      x,
      y,
      bgColor: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748',
      startDate: defaultStartDate
    };

    // Add new child
    let newNodes = nodes.concat([child]);
    const newConnections = connections.concat([{ id: `conn-${Date.now()}`, from: parentId, to: id }]);

    // Rebalance all children of this parent first
    let rebalancedNodes = rebalanceChildren(newNodes, newConnections, parentId);

    // After rebalancing, push any colliding nodes away
    // This handles non-sibling nodes that might be in the way
    if (pushCollidingNodes) {
      // Get all children IDs (siblings) - these should NOT be pushed, only external nodes
      const siblingIds = newConnections
        .filter(conn => conn.from === parentId)
        .map(conn => conn.to);

      // Also include the parent as protected
      const protectedIds = [parentId, ...siblingIds];

      // Push collisions for each child (only affects non-family nodes)
      for (const childId of siblingIds) {
        const childNode = rebalancedNodes.find(n => n.id === childId);
        if (childNode) {
          rebalancedNodes = pushCollidingNodes(childId, childNode.x, childNode.y, rebalancedNodes, protectedIds);
        }
      }
    }

    setNodes(rebalancedNodes);
    setConnections(newConnections);
  }, [connections, findStackedChildPosition, isDarkMode, NODE_WIDTH, nodes, pushCollidingNodes, setConnections, setNodes]);

  // Improved rebalancing: maintains child order and spacing, aligns them properly
  const rebalanceChildren = useCallback((nodeList: Node[], connectionList: Connection[], parentId: string): Node[] => {
    const parent = nodeList.find(n => n.id === parentId);
    if (!parent) return nodeList;

    // Find all children of this parent
    const childIds = connectionList
      .filter(conn => conn.from === parentId)
      .map(conn => conn.to);

    if (childIds.length <= 1) return nodeList; // No need to rebalance 0 or 1 child

    const children = nodeList.filter(n => childIds.includes(n.id));

    // Determine layout direction from first child
    const firstChild = children[0];
    const dx = firstChild.x - parent.x;
    const dy = firstChild.y - parent.y;
    const isHorizontal = Math.abs(dx) > Math.abs(dy);

    const totalChildren = children.length;
    const SPACING = NODE_HEIGHT + 15; // Spacing between children

    if (isHorizontal) {
      // Children are LEFT or RIGHT of parent
      // Split into Left and Right groups
      const rightChildren = children.filter(c => c.x > parent.x);
      const leftChildren = children.filter(c => c.x < parent.x);

      // Helper to rebalance a single vertical stack
      const rebalanceStack = (stackNodes: Node[]) => {
        if (stackNodes.length === 0) return [];
        // Sort top-to-bottom
        const sorted = [...stackNodes].sort((a, b) => a.y - b.y);

        // Center around parent Y
        const totalHeight = (stackNodes.length - 1) * SPACING;
        const startY = parent.y - (totalHeight / 2);

        // Use average X of the stack to keep alignment
        const avgX = stackNodes.reduce((sum, n) => sum + n.x, 0) / stackNodes.length;

        return sorted.map((child, index) => ({
          ...child,
          x: avgX,
          y: startY + (index * SPACING)
        }));
      };

      const rebalancedRight = rebalanceStack(rightChildren);
      const rebalancedLeft = rebalanceStack(leftChildren);

      // Merge rebalanced children back
      const rebalancedMap = new Map();
      [...rebalancedRight, ...rebalancedLeft].forEach(n => rebalancedMap.set(n.id, n));

      return nodeList.map(node => {
        if (rebalancedMap.has(node.id)) {
          return rebalancedMap.get(node.id);
        }
        return node;
      });

    } else {
      // Children are ABOVE or BELOW parent
      // Sort children by their current X position (left to right)
      const sortedChildren = [...children].sort((a, b) => a.x - b.x);

      // Keep same Y (up or down side), redistribute X positions evenly
      // Center the group around parent's X
      const totalWidth = (totalChildren - 1) * SPACING;
      const startX = parent.x - (totalWidth / 2);

      const rebalancedChildren = sortedChildren.map((child, index) => ({
        ...child,
        x: startX + (index * SPACING),
        y: firstChild.y // Keep same Y position as first child
      }));

      // Merge rebalanced children back
      return nodeList.map(node => {
        const rebalanced = rebalancedChildren.find(c => c.id === node.id);
        return rebalanced || node;
      });
    }
  }, [NODE_HEIGHT]);

  const deleteNodes = useCallback((ids: string[]) => {
    if (!ids?.length) return;
    const idSet = new Set(ids);
    setNodes(nodes.filter(n => !idSet.has(n.id)));
    setConnections(connections.filter(c => !idSet.has(c.from) && !idSet.has(c.to)));
  }, [connections, nodes, setConnections, setNodes]);

  const updateNodeText = useCallback((id: string, text: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  }, [nodes, setNodes]);

  const toggleNodeComplete = useCallback((id: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  }, [nodes, setNodes]);

  const updateNode = useCallback((id: string, patch: Partial<Node> | ((node: Node) => Node)) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== id) return n;
      if (typeof patch === 'function') return patch(n);
      return { ...n, ...patch };
    }));
  }, [setNodes]);

  const updateNodeField = useCallback((id: string, key: keyof Node, value: any) => {
    updateNode(id, { [key]: value } as Partial<Node>);
  }, [updateNode]);

  const getRelatedNodeIds = useCallback((nodeId: string): Set<string> => {
    const set = new Set<string>([nodeId]);
    getDescendantNodeIds(connections, nodeId).forEach(id => set.add(id));
    getAncestorNodeIds(connections, nodeId).forEach(id => set.add(id));
    return set;
  }, [connections]);

  return {
    addStandaloneNode,
    addChildNode,
    deleteNodes,
    updateNodeText,
    toggleNodeComplete,
    updateNode,
    updateNodeField,
    getRelatedNodeIds,
  };
}
