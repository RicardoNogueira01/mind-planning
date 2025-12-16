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
  pushCollidingNodes?: (nodeId: string, x: number, y: number, allNodes: Node[]) => Node[]
) {
  const NODE_WIDTH = 300; // Updated to match actual node width
  const NODE_HEIGHT = 56;

  const addStandaloneNode = useCallback(() => {
    const { x, y } = findStackedPosition();
    
    const id = `node-${Date.now()}`;
    const newNode: Node = { 
      id, 
      text: 'Task', 
      x, 
      y,
      bgColor: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748'
    };
    setNodes([...nodes, newNode]);
  }, [findStackedPosition, isDarkMode, nodes, setNodes]);

  const addChildNode = useCallback((parentId: string) => {
    const parent = nodes.find(n => n.id === parentId) || nodes[0];
    if (!parent) return;

    // Get position for new child
    const { x, y } = findStackedChildPosition(parentId, parent.x + NODE_WIDTH + 40, parent.y);

    const id = `node-${Date.now()}`;
    const child: Node = { 
      id, 
      text: 'New Task', 
      x, 
      y,
      bgColor: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748'
    };

    // Add new child
    let newNodes = nodes.concat([child]);
    const newConnections = connections.concat([{ id: `conn-${Date.now()}`, from: parentId, to: id }]);

    // Push any colliding nodes away from the new child
    if (pushCollidingNodes) {
      newNodes = pushCollidingNodes(id, x, y, newNodes);
    }

    // Rebalance all children of this parent
    const rebalancedNodes = rebalanceChildren(newNodes, newConnections, parentId);
    
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
    const SPACING = NODE_HEIGHT + 25; // Spacing between children

    if (isHorizontal) {
      // Children are LEFT or RIGHT of parent
      // Sort children by their current Y position (top to bottom)
      const sortedChildren = [...children].sort((a, b) => a.y - b.y);
      
      // Keep same X (left or right side), redistribute Y positions evenly
      // Center the group around parent's Y
      const totalHeight = (totalChildren - 1) * SPACING;
      const startY = parent.y - (totalHeight / 2);
      
      const rebalancedChildren = sortedChildren.map((child, index) => ({
        ...child,
        x: firstChild.x, // Keep same X position as first child
        y: startY + (index * SPACING)
      }));

      // Merge rebalanced children back
      return nodeList.map(node => {
        const rebalanced = rebalancedChildren.find(c => c.id === node.id);
        return rebalanced || node;
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
