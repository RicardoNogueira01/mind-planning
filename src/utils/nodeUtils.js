/**
 * Node Utility Functions
 * Helper functions for node hierarchy and progress tracking
 */

/**
 * Calculate maximum depth of node hierarchy
 * @param {string} nodeId - The node ID to start from
 * @param {Array} connections - Array of connection objects
 * @param {Set} visited - Set of visited node IDs (for cycle detection)
 * @param {number} currentDepth - Current depth level
 * @returns {number} Maximum depth of the hierarchy
 */
export const getMaxDepth = (nodeId, connections, visited = new Set(), currentDepth = 0) => {
  if (visited.has(nodeId)) return currentDepth;
  visited.add(nodeId);
  
  const children = connections
    .filter(conn => conn.from === nodeId)
    .map(conn => conn.to);
  
  if (children.length === 0) return currentDepth;
  
  const childDepths = children.map(childId =>
    getMaxDepth(childId, connections, new Set(visited), currentDepth + 1)
  );
  
  return Math.max(...childDepths);
};

/**
 * Get all descendant nodes recursively
 * @param {string} parentId - The parent node ID
 * @param {Array} connections - Array of connection objects
 * @param {Array} nodes - Array of node objects
 * @param {Set} visited - Set of visited node IDs (for cycle detection)
 * @returns {Array} Array of descendant nodes
 */
const getAllDescendants = (parentId, connections, nodes, visited = new Set()) => {
  if (visited.has(parentId)) return [];
  visited.add(parentId);
  
  const directChildren = connections
    .filter(conn => conn.from === parentId)
    .map(conn => nodes.find(node => node.id === conn.to))
    .filter(Boolean);
  
  let allDescendants = [...directChildren];
  for (const child of directChildren) {
    const childDescendants = getAllDescendants(child.id, connections, nodes, new Set(visited));
    allDescendants = [...allDescendants, ...childDescendants];
  }
  
  return allDescendants;
};

/**
 * Get progress statistics for a node (counts all descendants)
 * @param {string} nodeId - The node ID to calculate progress for
 * @param {Array} connections - Array of connection objects
 * @param {Array} nodes - Array of node objects
 * @returns {Object|null} Progress object with completed, total, percentage, and depth
 */
export const getNodeProgress = (nodeId, connections, nodes) => {
  const allDescendants = getAllDescendants(nodeId, connections, nodes);
  if (allDescendants.length === 0) return null;
  
  // Remove duplicates
  const uniqueDescendants = allDescendants.filter((node, index, self) =>
    index === self.findIndex(n => n.id === node.id)
  );
  
  const completedDescendants = uniqueDescendants.filter(d => d.completed).length;
  const totalDescendants = uniqueDescendants.length;
  
  return {
    completed: completedDescendants,
    total: totalDescendants,
    percentage: Math.round((completedDescendants / totalDescendants) * 100),
    depth: getMaxDepth(nodeId, connections)
  };
};

/**
 * Format a timestamp into a human-readable relative time string
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time string
 */
export const formatVisitorTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
         ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
