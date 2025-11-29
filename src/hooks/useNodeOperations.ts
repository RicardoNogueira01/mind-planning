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
  findStackedChildPosition: (parentId: string, preferredX: number, preferredY: number) => Position
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
    const newNodes = nodes.concat([child]);
    const newConnections = connections.concat([{ id: `conn-${Date.now()}`, from: parentId, to: id }]);

    // Rebalance all children of this parent
    const rebalancedNodes = rebalanceChildren(newNodes, newConnections, parentId);
    
    setNodes(rebalancedNodes);
    setConnections(newConnections);
  }, [connections, findStackedChildPosition, isDarkMode, NODE_WIDTH, nodes, setConnections, setNodes]);

  // Helper function to rebalance children around their parent
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
    const halfCount = Math.floor(totalChildren / 2);
    const centerOffset = totalChildren % 2 === 0 ? (NODE_HEIGHT + 25) / 2 : 0;

    // Reposition all children to be balanced
    const rebalancedChildren = children.map((child, index) => {
      const childPosition = index - halfCount;
      const offset = childPosition * (NODE_HEIGHT + 25) + centerOffset;

      if (isHorizontal) {
        // Keep X position (left or right of parent), adjust Y
        return {
          ...child,
          y: parent.y + offset
        };
      } else {
        // Keep Y position (up or down of parent), adjust X
        return {
          ...child,
          x: parent.x + offset
        };
      }
    });

    // Merge rebalanced children back into node list
    return nodeList.map(node => {
      const rebalanced = rebalancedChildren.find(c => c.id === node.id);
      return rebalanced || node;
    });
  }, []);

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
