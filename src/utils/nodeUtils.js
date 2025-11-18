/**
 * Node Utility Functions
 * Helper functions for node hierarchy and progress tracking
 */

/**
 * Calculate maximum depth of node hierarchy (recursive tree traversal)
 * 
 * This function explores the entire tree structure to find the deepest branch.
 * Essential for layout calculations and understanding hierarchy complexity.
 * 
 * @param {string} nodeId - The node ID to start from (typically root node)
 * @param {Array} connections - Array of connection objects with {from, to} structure
 * @param {Set} visited - Set of visited node IDs (prevents infinite loops on cycles)
 * @param {number} currentDepth - Current depth level (starts at 0 for root)
 * @returns {number} Maximum depth of the hierarchy (0 = root only, 1 = root + children, etc.)
 * 
 * @example
 * // Tree: Root -> Child1 -> Grandchild1
 * //            -> Child2
 * getMaxDepth('root-id', connections);
 * // Returns: 2 (Root[0] -> Child1[1] -> Grandchild1[2])
 * 
 * Algorithm:
 * 1. Check if node already visited (cycle detection) → return current depth if yes
 * 2. Mark node as visited
 * 3. Find all direct children from connections
 * 4. If no children → return current depth (leaf node)
 * 5. Recursively calculate depth for each child (currentDepth + 1)
 * 6. Return maximum depth among all children
 * 
 * Time Complexity: O(N) where N = number of nodes
 * Space Complexity: O(D) where D = maximum depth (call stack)
 */
export const getMaxDepth = (nodeId, connections, visited = new Set(), currentDepth = 0) => {
  // Cycle detection: prevents infinite recursion on circular references
  if (visited.has(nodeId)) return currentDepth;
  visited.add(nodeId);
  
  // Find all direct children of this node
  const children = connections
    .filter(conn => conn.from === nodeId)
    .map(conn => conn.to);
  
  // Base case: leaf node (no children)
  if (children.length === 0) return currentDepth;
  
  // Recursive case: calculate depth for each child branch
  const childDepths = children.map(childId =>
    getMaxDepth(childId, connections, new Set(visited), currentDepth + 1)
  );
  
  // Return the deepest branch
  return Math.max(...childDepths);
};

/**
 * Get all descendant nodes recursively (complete subtree collection)
 * 
 * Collects every node in the subtree under a given parent - children, grandchildren,
 * great-grandchildren, etc. Used for bulk operations like progress calculation,
 * deletion cascades, and export functionality.
 * 
 * @param {string} parentId - The parent node ID (root of subtree to collect)
 * @param {Array} connections - Array of connection objects with {from, to} structure
 * @param {Array} nodes - Array of all node objects (for looking up node details)
 * @param {Set} visited - Set of visited node IDs (prevents infinite loops on cycles)
 * @returns {Array} Array of descendant node objects (may include duplicates - caller should deduplicate)
 * 
 * @example
 * // Tree: Parent -> Child1 -> Grandchild1
 * //              -> Child2 -> Grandchild2
 * //                        -> Grandchild3
 * const descendants = getAllDescendants('parent-id', connections, nodes);
 * // Returns: [Child1, Child2, Grandchild1, Grandchild2, Grandchild3]
 * 
 * Algorithm:
 * 1. Check if parent already visited (cycle detection) → return empty array if yes
 * 2. Mark parent as visited
 * 3. Find all direct children from connections
 * 4. Look up full node objects for each child
 * 5. Recursively collect descendants for each child
 * 6. Combine direct children + all recursive descendants
 * 
 * ⚠️ IMPORTANT: May return duplicates if nodes have multiple parents!
 * Caller should deduplicate results (see getNodeProgress example)
 * 
 * Time Complexity: O(N) where N = number of descendants
 * Space Complexity: O(N) for result array + O(D) for call stack
 */
const getAllDescendants = (parentId, connections, nodes, visited = new Set()) => {
  // Cycle detection: prevents infinite recursion
  if (visited.has(parentId)) return [];
  visited.add(parentId);
  
  // Find all direct children and look up their node objects
  const directChildren = connections
    .filter(conn => conn.from === parentId)
    .map(conn => nodes.find(node => node.id === conn.to))
    .filter(Boolean);  // Remove undefined nodes (connection points to non-existent node)
  
  // Collect all descendants recursively
  let allDescendants = [...directChildren];
  for (const child of directChildren) {
    const childDescendants = getAllDescendants(child.id, connections, nodes, new Set(visited));
    allDescendants = [...allDescendants, ...childDescendants];
  }
  
  return allDescendants;
};

/**
 * Calculate progress statistics for a node based on ALL descendants
 * 
 * Computes completion percentage by examining entire subtree under a node.
 * Useful for dashboard widgets, progress bars, and hierarchy overviews.
 * Returns null for leaf nodes (no descendants to track).
 * 
 * @param {string} nodeId - The node ID to calculate progress for
 * @param {Array} connections - Array of connection objects
 * @param {Array} nodes - Array of all node objects (must have 'completed' property)
 * @returns {Object|null} Progress object or null if no descendants
 * 
 * @example
 * // Tree: Parent -> Child1 (complete) -> Grandchild1 (incomplete)
 * //              -> Child2 (complete)
 * const progress = getNodeProgress('parent-id', connections, nodes);
 * // Returns: { completed: 2, total: 3, percentage: 67, depth: 2 }
 * 
 * Return Object Structure:
 * {
 *   completed: number,    // Count of completed descendant nodes
 *   total: number,        // Total number of descendant nodes
 *   percentage: number,   // Completion percentage (0-100, rounded)
 *   depth: number         // Maximum depth of subtree
 * }
 * 
 * Algorithm:
 * 1. Collect ALL descendants using recursive traversal
 * 2. Deduplicate descendants (handles nodes with multiple parents)
 * 3. Count how many are marked as completed
 * 4. Calculate percentage: (completed / total) * 100
 * 5. Get maximum depth of subtree for context
 * 6. Return null if no descendants (leaf node)
 * 
 * ⚠️ GOTCHA: Only counts DESCENDANTS, not the node itself!
 * If you want to include the node, add it manually to the calculation.
 */
export const getNodeProgress = (nodeId, connections, nodes) => {
  // Collect all descendants (may include duplicates)
  const allDescendants = getAllDescendants(nodeId, connections, nodes);
  if (allDescendants.length === 0) return null;  // Leaf node: no progress to track
  
  // Remove duplicates (nodes that appear multiple times due to multiple parents)
  const uniqueDescendants = allDescendants.filter((node, index, self) =>
    index === self.findIndex(n => n.id === node.id)
  );
  
  // Count completed vs total
  const completedDescendants = uniqueDescendants.filter(d => d.completed).length;
  const totalDescendants = uniqueDescendants.length;
  
  return {
    completed: completedDescendants,
    total: totalDescendants,
    percentage: Math.round((completedDescendants / totalDescendants) * 100),
    depth: getMaxDepth(nodeId, connections)  // Include depth for context
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
