/**
 * Auto-Layout Algorithms
 * Various algorithms to automatically arrange nodes in a mind map
 */

import type { Node, Connection } from '../types/mindmap';

export type LayoutType = 'force-directed' | 'tree-vertical' | 'tree-horizontal' | 'radial' | 'grid' | 'circular';

export interface LayoutConfig {
  type: LayoutType;
  spacing?: number;
  animate?: boolean;
  duration?: number;
  padding?: number;
}

export interface LayoutResult {
  nodes: Node[];
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
}

/**
 * Main entry point for applying layouts
 */
export function applyLayout(
  nodes: Node[],
  connections: Connection[],
  config: LayoutConfig,
  canvasWidth: number,
  canvasHeight: number
): LayoutResult {
  const spacing = config.spacing || 150;
  const padding = config.padding || 50;

  let positionedNodes: Node[];

  switch (config.type) {
    case 'force-directed':
      positionedNodes = applyForceDirectedLayout(nodes, connections, spacing);
      break;
    case 'tree-vertical':
      positionedNodes = applyTreeLayout(nodes, connections, spacing, 'vertical');
      break;
    case 'tree-horizontal':
      positionedNodes = applyTreeLayout(nodes, connections, spacing, 'horizontal');
      break;
    case 'radial':
      positionedNodes = applyRadialLayout(nodes, connections, spacing);
      break;
    case 'grid':
      positionedNodes = applyGridLayout(nodes, spacing);
      break;
    case 'circular':
      positionedNodes = applyCircularLayout(nodes, connections, spacing);
      break;
    default:
      positionedNodes = nodes;
  }

  // Calculate bounding box
  const xs = positionedNodes.map(n => n.x);
  const ys = positionedNodes.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Center the layout in the canvas
  const layoutWidth = maxX - minX;
  const layoutHeight = maxY - minY;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const offsetX = centerX - (minX + layoutWidth / 2);
  const offsetY = centerY - (minY + layoutHeight / 2);

  const centeredNodes = positionedNodes.map(node => ({
    ...node,
    x: node.x + offsetX,
    y: node.y + offsetY
  }));

  return {
    nodes: centeredNodes,
    boundingBox: {
      minX: minX + offsetX,
      maxX: maxX + offsetX,
      minY: minY + offsetY,
      maxY: maxY + offsetY,
      width: layoutWidth,
      height: layoutHeight
    }
  };
}

/**
 * Force-Directed Layout (Physics-based)
 * Nodes repel each other, connections attract
 */
function applyForceDirectedLayout(
  nodes: Node[],
  connections: Connection[],
  spacing: number
): Node[] {
  const NODE_WIDTH = 300;
  const iterations = 150;
  // Moderate repulsion - just enough to prevent overlaps with minimal gap
  const repulsionStrength = NODE_WIDTH * NODE_WIDTH * 0.8;
  const attractionStrength = 0.01;
  const damping = 0.9;

  // Initialize positions (keep existing if available)
  let positions = nodes.map(n => ({
    id: n.id,
    x: n.x,
    y: n.y,
    vx: 0,
    vy: 0
  }));

  // Simulation loop
  for (let iter = 0; iter < iterations; iter++) {
    // Reset forces
    positions.forEach(p => {
      p.vx = 0;
      p.vy = 0;
    });

    // Repulsion between all nodes
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq) || 1;

        // Increase repulsion when nodes are too close
        const minDist = NODE_WIDTH + 20; // Just 20px minimum gap
        let force = repulsionStrength / distSq;
        if (dist < minDist) {
          force *= (minDist / dist) * 1.5; // Moderate extra repulsion when too close
        }

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        positions[i].vx -= fx;
        positions[i].vy -= fy;
        positions[j].vx += fx;
        positions[j].vy += fy;
      }
    }

    // Attraction along connections
    connections.forEach(conn => {
      const fromIdx = positions.findIndex(p => p.id === conn.from);
      const toIdx = positions.findIndex(p => p.id === conn.to);

      if (fromIdx >= 0 && toIdx >= 0) {
        const dx = positions[toIdx].x - positions[fromIdx].x;
        const dy = positions[toIdx].y - positions[fromIdx].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = (dist - spacing) * attractionStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        positions[fromIdx].vx += fx;
        positions[fromIdx].vy += fy;
        positions[toIdx].vx -= fx;
        positions[toIdx].vy -= fy;
      }
    });

    // Apply velocities with damping
    positions.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= damping;
      p.vy *= damping;
    });
  }

  // Apply positions back to nodes
  return nodes.map(node => {
    const pos = positions.find(p => p.id === node.id);
    return pos ? { ...node, x: Math.round(pos.x), y: Math.round(pos.y) } : node;
  });
}

/**
 * Tree Layout (Hierarchical)
 * Arranges nodes in a tree structure with proper spacing and centering
 * 
 * 'horizontal' = org-chart style: parent on TOP, children spread HORIZONTALLY below
 * 'vertical' = left-to-right: parent on LEFT, children spread VERTICALLY to the right
 */
function applyTreeLayout(
  nodes: Node[],
  connections: Connection[],
  spacing: number,
  direction: 'vertical' | 'horizontal'
): Node[] {
  const NODE_WIDTH = 320;  // Slightly wider to account for actual node width
  const NODE_HEIGHT = 100; // Account for node card height + some padding

  // Spacing configuration
  const HORIZONTAL_GAP = 40;  // Gap between sibling nodes horizontally
  const VERTICAL_GAP = 80;    // Gap between levels vertically

  // Build tree structure
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  // Build parent-child relationships
  connections.forEach(conn => {
    if (!childrenMap.has(conn.from)) {
      childrenMap.set(conn.from, []);
    }
    childrenMap.get(conn.from)!.push(conn.to);
    parentMap.set(conn.to, conn.from);
  });

  // Find root nodes (nodes with no parent)
  const roots = nodes.filter(n => !parentMap.has(n.id));

  if (roots.length === 0) return nodes;

  const positioned = new Map<string, { x: number; y: number }>();

  /**
   * Calculate the total width needed for a subtree (in pixels)
   * This accounts for all descendants and their spacing
   */
  function getSubtreeWidth(nodeId: string): number {
    const children = childrenMap.get(nodeId) || [];

    if (children.length === 0) {
      // Leaf node - just needs space for itself
      return direction === 'horizontal' ? NODE_WIDTH : NODE_HEIGHT;
    }

    // Sum of all children subtree widths + gaps between them
    const childrenTotalWidth = children.reduce((sum, childId) => {
      return sum + getSubtreeWidth(childId);
    }, 0);

    const gapsWidth = (children.length - 1) * (direction === 'horizontal' ? HORIZONTAL_GAP : HORIZONTAL_GAP);

    // The subtree width is at least as wide as this node, or the sum of children + gaps
    const nodeSize = direction === 'horizontal' ? NODE_WIDTH : NODE_HEIGHT;
    return Math.max(nodeSize, childrenTotalWidth + gapsWidth);
  }

  /**
   * Position a node and all its descendants
   * Returns the actual width used by this subtree
   */
  function positionNode(nodeId: string, depth: number, startX: number): number {
    const children = childrenMap.get(nodeId) || [];
    const subtreeWidth = getSubtreeWidth(nodeId);

    if (direction === 'horizontal') {
      // Org-chart: Y increases with depth, X spreads horizontally
      const levelY = depth * (NODE_HEIGHT + VERTICAL_GAP);

      if (children.length === 0) {
        // Leaf node - center in its allocated space
        positioned.set(nodeId, {
          x: startX + subtreeWidth / 2,
          y: levelY
        });
        return subtreeWidth;
      }

      // Position children first
      let currentX = startX;
      const childCenters: number[] = [];

      children.forEach(childId => {
        const childWidth = getSubtreeWidth(childId);
        positionNode(childId, depth + 1, currentX);

        // Track the center position of each child
        const childPos = positioned.get(childId);
        if (childPos) {
          childCenters.push(childPos.x);
        }

        currentX += childWidth + HORIZONTAL_GAP;
      });

      // Position parent centered above its children
      const firstChildCenter = childCenters[0];
      const lastChildCenter = childCenters[childCenters.length - 1];
      const parentX = (firstChildCenter + lastChildCenter) / 2;

      positioned.set(nodeId, {
        x: parentX,
        y: levelY
      });

      return subtreeWidth;

    } else {
      // Left-to-right: X increases with depth, Y spreads vertically
      const levelX = depth * (NODE_WIDTH + VERTICAL_GAP);

      if (children.length === 0) {
        // Leaf node - center in its allocated space
        positioned.set(nodeId, {
          x: levelX,
          y: startX + subtreeWidth / 2
        });
        return subtreeWidth;
      }

      // Position children first
      let currentY = startX;
      const childCenters: number[] = [];

      children.forEach(childId => {
        const childWidth = getSubtreeWidth(childId);
        positionNode(childId, depth + 1, currentY);

        // Track the center position of each child
        const childPos = positioned.get(childId);
        if (childPos) {
          childCenters.push(childPos.y);
        }

        currentY += childWidth + HORIZONTAL_GAP;
      });

      // Position parent centered to the left of its children
      const firstChildCenter = childCenters[0];
      const lastChildCenter = childCenters[childCenters.length - 1];
      const parentY = (firstChildCenter + lastChildCenter) / 2;

      positioned.set(nodeId, {
        x: levelX,
        y: parentY
      });

      return subtreeWidth;
    }
  }

  // Position each root tree
  let currentOffset = 0;
  roots.forEach(root => {
    const width = positionNode(root.id, 0, currentOffset);
    currentOffset += width + (direction === 'horizontal' ? HORIZONTAL_GAP * 2 : HORIZONTAL_GAP * 2);
  });

  // Apply positions to nodes
  return nodes.map(node => {
    const pos = positioned.get(node.id);
    if (!pos) return node;
    return { ...node, x: Math.round(pos.x), y: Math.round(pos.y) };
  });
}

/**
 * Radial Layout (Family-based)
 * Each parent has its children arranged around it in a fan/semi-circle
 * With collision detection to prevent overlaps
 */
function applyRadialLayout(
  nodes: Node[],
  connections: Connection[],
  spacing: number
): Node[] {
  const NODE_WIDTH = 320;
  const NODE_HEIGHT = 100;
  const CHILD_DISTANCE = 280;    // Distance from parent to children
  const MIN_GAP = 60;            // Minimum gap between any two nodes

  // Build parent-child relationships
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  connections.forEach(conn => {
    if (!childrenMap.has(conn.from)) {
      childrenMap.set(conn.from, []);
    }
    childrenMap.get(conn.from)!.push(conn.to);
    parentMap.set(conn.to, conn.from);
  });

  // Find roots (nodes with no parent)
  const roots = nodes.filter(n => !parentMap.has(n.id));

  if (roots.length === 0) return nodes;

  const positioned = new Map<string, { x: number; y: number }>();

  /**
   * Check if a position collides with any already-positioned node
   */
  function hasCollision(x: number, y: number, excludeId?: string): boolean {
    for (const [nodeId, pos] of positioned) {
      if (nodeId === excludeId) continue;
      const dx = Math.abs(pos.x - x);
      const dy = Math.abs(pos.y - y);
      if (dx < NODE_WIDTH + MIN_GAP && dy < NODE_HEIGHT + MIN_GAP) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find a non-colliding position near the preferred position
   */
  function findNonCollidingPosition(preferredX: number, preferredY: number, excludeId?: string): { x: number; y: number } {
    if (!hasCollision(preferredX, preferredY, excludeId)) {
      return { x: preferredX, y: preferredY };
    }

    // Spiral outward to find a free spot
    const spiralStep = 50;
    for (let distance = spiralStep; distance < 2000; distance += spiralStep) {
      for (let angle = 0; angle < 360; angle += 30) {
        const rad = (angle * Math.PI) / 180;
        const testX = preferredX + Math.cos(rad) * distance;
        const testY = preferredY + Math.sin(rad) * distance;
        if (!hasCollision(testX, testY, excludeId)) {
          return { x: testX, y: testY };
        }
      }
    }

    // Fallback: just push it far away
    return { x: preferredX + 500, y: preferredY };
  }

  /**
   * Position a node and all its descendants recursively
   * Children are arranged in a fan around the parent
   */
  function positionSubtree(nodeId: string, x: number, y: number, incomingAngle: number): void {
    const pos = findNonCollidingPosition(x, y, nodeId);
    positioned.set(nodeId, pos);

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return;

    // Calculate the angle range for children
    // Children spread in a fan on the OPPOSITE side from where the parent came from
    const spreadAngle = Math.min(180, 60 + children.length * 30); // More children = wider spread
    const halfSpread = spreadAngle / 2;

    // Base angle: opposite to incoming direction
    const baseAngle = incomingAngle + 180;

    children.forEach((childId, idx) => {
      // Distribute children evenly within the spread angle
      let childAngle: number;
      if (children.length === 1) {
        childAngle = baseAngle;
      } else {
        const step = spreadAngle / (children.length - 1);
        childAngle = baseAngle - halfSpread + idx * step;
      }

      const rad = (childAngle * Math.PI) / 180;
      const childX = pos.x + Math.cos(rad) * CHILD_DISTANCE;
      const childY = pos.y + Math.sin(rad) * CHILD_DISTANCE;

      positionSubtree(childId, childX, childY, childAngle);
    });
  }

  // Position each root tree
  let rootX = 0;
  roots.forEach((root, rootIdx) => {
    // Position root
    const rootPos = findNonCollidingPosition(rootX, 0, root.id);
    positioned.set(root.id, rootPos);

    // Position its children in a downward fan (incoming angle = -90 means children go down)
    const children = childrenMap.get(root.id) || [];
    if (children.length > 0) {
      const spreadAngle = Math.min(180, 60 + children.length * 30);
      const halfSpread = spreadAngle / 2;
      const baseAngle = 90; // Children spread downward from root

      children.forEach((childId, idx) => {
        let childAngle: number;
        if (children.length === 1) {
          childAngle = baseAngle;
        } else {
          const step = spreadAngle / (children.length - 1);
          childAngle = baseAngle - halfSpread + idx * step;
        }

        const rad = (childAngle * Math.PI) / 180;
        const childX = rootPos.x + Math.cos(rad) * CHILD_DISTANCE;
        const childY = rootPos.y + Math.sin(rad) * CHILD_DISTANCE;

        positionSubtree(childId, childX, childY, childAngle);
      });
    }

    // Move next root to the right
    rootX += 800;
  });

  // Apply positions
  return nodes.map(node => {
    const pos = positioned.get(node.id);
    return pos ? { ...node, x: Math.round(pos.x), y: Math.round(pos.y) } : node;
  });
}

/**
 * Grid Layout
 * Snaps all nodes to a regular grid
 */
function applyGridLayout(nodes: Node[], gridSize: number): Node[] {
  return nodes.map(node => ({
    ...node,
    x: Math.round(node.x / gridSize) * gridSize,
    y: Math.round(node.y / gridSize) * gridSize
  }));
}

/**
 * Circular Layout
 * Arranges all nodes in concentric circles (ignores hierarchy)
 */
function applyCircularLayout(
  nodes: Node[],
  connections: Connection[],
  spacing: number
): Node[] {
  const NODE_WIDTH = 320;
  const MIN_NODE_GAP = 50;       // Minimum gap between nodes
  const MIN_FIRST_RADIUS = 250;  // Minimum radius for first ring
  const LAYER_SPACING = 220;     // Distance between concentric circles

  if (nodes.length === 0) return nodes;

  if (nodes.length === 1) {
    return [{ ...nodes[0], x: 0, y: 0 }];
  }

  // Find root or use first node as center
  const roots = nodes.filter(n =>
    !connections.some(c => c.to === n.id)
  );
  const root = roots[0] || nodes[0];
  const otherNodes = nodes.filter(n => n.id !== root.id);

  // Position root at center
  const centerX = 0;
  const centerY = 0;
  const positioned = [
    { ...root, x: centerX, y: centerY }
  ];

  if (otherNodes.length === 0) return positioned;

  // Calculate how many layers we need
  let remainingNodes = [...otherNodes];
  let layerIndex = 0;

  while (remainingNodes.length > 0) {
    layerIndex++;

    // Calculate radius for this layer
    // First layer gets the minimum radius, subsequent layers add LAYER_SPACING
    const baseRadius = MIN_FIRST_RADIUS + (layerIndex - 1) * LAYER_SPACING;

    // Calculate how many nodes can fit in this circle without overlap
    const circumference = 2 * Math.PI * baseRadius;
    const maxNodesInCircle = Math.max(1, Math.floor(circumference / (NODE_WIDTH + MIN_NODE_GAP)));
    const nodesInThisLayer = Math.min(remainingNodes.length, maxNodesInCircle);

    // If we need more nodes than fit, expand the radius
    const requiredCircumference = nodesInThisLayer * (NODE_WIDTH + MIN_NODE_GAP);
    const requiredRadius = requiredCircumference / (2 * Math.PI);
    const radius = Math.max(baseRadius, requiredRadius);

    // Position nodes in this layer
    const layerNodes = remainingNodes.slice(0, nodesInThisLayer);
    layerNodes.forEach((node, idx) => {
      const angle = (idx / nodesInThisLayer) * 2 * Math.PI - Math.PI / 2; // Start from top
      positioned.push({
        ...node,
        x: Math.round(centerX + Math.cos(angle) * radius),
        y: Math.round(centerY + Math.sin(angle) * radius)
      });
    });

    remainingNodes = remainingNodes.slice(nodesInThisLayer);
  }

  return positioned;
}

/**
 * Animate transition from old positions to new positions
 * Returns a function that can be called with a progress value (0-1)
 */
export function createLayoutAnimation(
  oldNodes: Node[],
  newNodes: Node[],
  duration: number = 800
): (progress: number) => Node[] {
  const nodeMap = new Map(oldNodes.map(n => [n.id, n]));

  return (progress: number) => {
    const eased = easeInOutCubic(progress);

    return newNodes.map(newNode => {
      const oldNode = nodeMap.get(newNode.id);
      if (!oldNode) return newNode;

      return {
        ...newNode,
        x: oldNode.x + (newNode.x - oldNode.x) * eased,
        y: oldNode.y + (newNode.y - oldNode.y) * eased
      };
    });
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
