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
 * Radial Layout
 * Arranges nodes in concentric circles based on hierarchy
 */
function applyRadialLayout(
  nodes: Node[],
  connections: Connection[],
  spacing: number
): Node[] {
  const NODE_WIDTH = 300;
  const levelRadius = spacing * 0.8; // Reduced from 1.2 to 0.8 for tighter spacing

  // Find roots
  const roots = nodes.filter(n =>
    !connections.some(c => c.to === n.id)
  );

  if (roots.length === 0) return nodes;

  const positioned = new Map<string, { x: number; y: number }>();
  const centerX = 0;
  const centerY = 0;

  // Position roots at center
  if (roots.length === 1) {
    positioned.set(roots[0].id, { x: centerX, y: centerY });
  } else {
    // Multiple roots - arrange in small circle
    roots.forEach((root, idx) => {
      const angle = (idx / roots.length) * 2 * Math.PI;
      positioned.set(root.id, {
        x: centerX + Math.cos(angle) * levelRadius * 0.5,
        y: centerY + Math.sin(angle) * levelRadius * 0.5
      });
    });
  }

  // BFS to position each level
  let currentLevel = roots.map(r => r.id);
  let level = 1;

  while (currentLevel.length > 0) {
    const nextLevel: string[] = [];
    const levelNodes: string[] = [];

    // Gather all children in this level
    currentLevel.forEach(parentId => {
      const children = connections
        .filter(c => c.from === parentId)
        .map(c => c.to)
        .filter(childId => !positioned.has(childId));

      nextLevel.push(...children);
      levelNodes.push(...children);
    });

    if (levelNodes.length === 0) break;

    // Position nodes in this level
    // Calculate radius to fit all nodes with minimal spacing
    const minRadius = level * levelRadius;
    const circumference = levelNodes.length * (NODE_WIDTH + 30); // Just 30px gap
    const requiredRadius = circumference / (2 * Math.PI);
    const radius = Math.max(minRadius, requiredRadius);

    levelNodes.forEach((nodeId, idx) => {
      const angle = (idx / levelNodes.length) * 2 * Math.PI - Math.PI / 2; // Start from top
      positioned.set(nodeId, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    });

    currentLevel = Array.from(new Set(nextLevel));
    level++;
  }

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
 * Arranges all nodes in a circle
 */
function applyCircularLayout(
  nodes: Node[],
  connections: Connection[],
  spacing: number
): Node[] {
  const NODE_WIDTH = 300;
  const NODE_SPACING = 30; // Gap between nodes
  const LAYER_SPACING = 200; // Distance between concentric circles

  // Find root or use first node
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

  // Multi-layer circular layout
  // Calculate optimal nodes per layer to avoid overcrowding
  const MAX_NODES_PER_LAYER = 12; // Maximum nodes in a single circle

  let remainingNodes = [...otherNodes];
  let layerIndex = 0;

  while (remainingNodes.length > 0) {
    layerIndex++;
    const radius = layerIndex * LAYER_SPACING;

    // Calculate how many nodes fit comfortably in this circle
    const circumference = 2 * Math.PI * radius;
    const maxNodesInCircle = Math.floor(circumference / (NODE_WIDTH + NODE_SPACING));
    const nodesInThisLayer = Math.min(
      Math.min(remainingNodes.length, MAX_NODES_PER_LAYER),
      maxNodesInCircle
    );

    // Position nodes in this layer
    const layerNodes = remainingNodes.slice(0, nodesInThisLayer);
    layerNodes.forEach((node, idx) => {
      const angle = (idx / nodesInThisLayer) * 2 * Math.PI - Math.PI / 2;
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
