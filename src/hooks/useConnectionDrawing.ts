/**
 * useConnectionDrawing Hook
 * Handles the visual drawing of temporary connections during connection creation mode
 */

import { useState, useCallback } from 'react';

export function useConnectionDrawing() {
  const [connectionFrom, setConnectionFrom] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Start connection mode from a node
  const startConnection = useCallback((nodeId) => {
    setConnectionFrom(nodeId);
  }, []);

  // Cancel connection mode
  const cancelConnection = useCallback(() => {
    setConnectionFrom(null);
  }, []);

  // Update mouse position for drawing the temporary connection line
  const updateMousePosition = useCallback((x, y) => {
    setMousePosition({ x, y });
  }, []);

  // Check if currently in connection mode
  const isConnecting = useCallback(() => {
    return connectionFrom !== null;
  }, [connectionFrom]);

  // Check if a specific node is the connection source
  const isConnectionSource = useCallback((nodeId) => {
    return connectionFrom === nodeId;
  }, [connectionFrom]);

  // Check if a connection already exists between two nodes
  const checkConnectionExists = useCallback((fromId, toId, connections) => {
    return connections.some(c => 
      (c.from === fromId && c.to === toId) || 
      (c.from === toId && c.to === fromId)
    );
  }, []);

  // Complete connection between two nodes
  const completeConnection = useCallback((toNodeId, onConnectionCreate) => {
    if (connectionFrom && connectionFrom !== toNodeId) {
      if (onConnectionCreate) {
        onConnectionCreate(connectionFrom, toNodeId);
      }
      setConnectionFrom(null);
      return true;
    }
    return false;
  }, [connectionFrom]);

  // Reset connection state
  const resetConnection = useCallback(() => {
    setConnectionFrom(null);
    setMousePosition({ x: 0, y: 0 });
  }, []);

  return {
    connectionFrom,
    mousePosition,
    startConnection,
    cancelConnection,
    updateMousePosition,
    isConnecting,
    isConnectionSource,
    checkConnectionExists,
    completeConnection,
    resetConnection
  };
}
