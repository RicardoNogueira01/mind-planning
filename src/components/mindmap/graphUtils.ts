export type Connection = { from: string; to: string };

export function getDescendantNodeIds(connections: Connection[], parentId: string): string[] {
  const descendants = new Set<string>();
  const stack = [parentId];
  while (stack.length > 0) {
    const popped = stack.pop();
    if (!popped) break;
    const currentId = popped;
    const childConnections = connections.filter((conn) => conn.from === currentId);
    for (const conn of childConnections) {
      if (!descendants.has(conn.to)) {
        descendants.add(conn.to);
        stack.push(conn.to);
      }
    }
  }
  return Array.from(descendants);
}

export function getAncestorNodeIds(connections: Connection[], childId: string): string[] {
  const ancestors = new Set<string>();
  const stack = [childId];
  while (stack.length > 0) {
    const popped = stack.pop();
    if (!popped) break;
    const currentId = popped;
    const parentConnections = connections.filter((conn) => conn.to === currentId);
    for (const conn of parentConnections) {
      if (!ancestors.has(conn.from)) {
        ancestors.add(conn.from);
        stack.push(conn.from);
      }
    }
  }
  return Array.from(ancestors);
}

export function getMaxDepth(connections: Connection[], nodeId: string, visited = new Set<string>(), currentDepth = 0): number {
  if (visited.has(nodeId)) {
    return currentDepth;
  }
  visited.add(nodeId);
  const children = connections.filter((c) => c.from === nodeId).map((c) => c.to);
  if (children.length === 0) return currentDepth;
  const childDepths = children.map((childId) =>
    getMaxDepth(connections, childId, new Set(visited), currentDepth + 1)
  );
  return Math.max(...childDepths);
}
