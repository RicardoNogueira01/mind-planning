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
      text: 'Idea', 
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

    const { x, y } = findStackedChildPosition(parentId, parent.x + NODE_WIDTH + 40, parent.y);

    const id = `node-${Date.now()}`;
    const child: Node = { 
      id, 
      text: 'New Node', 
      x, 
      y,
      bgColor: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748'
    };
    setNodes(nodes.concat([child]));
    setConnections(connections.concat([{ id: `conn-${Date.now()}`, from: parentId, to: id }]));
  }, [connections, findStackedChildPosition, isDarkMode, NODE_WIDTH, nodes, setConnections, setNodes]);

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
