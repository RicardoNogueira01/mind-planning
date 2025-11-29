/**
 * Template Engine
 * Instantiates templates with unique IDs and proper positioning
 */

import type { Node, Connection } from '../types/mindmap';
import type { Template } from './templateDefinitions';

let idCounter = Date.now();

export function generateUniqueId(prefix: string = 'node'): string {
  return `${prefix}-${idCounter++}`;
}

export interface InstantiationOptions {
  centerX?: number;
  centerY?: number;
  scaleNodes?: number;
  preserveColors?: boolean;
  customRootText?: string;
}

/**
 * Instantiate a template at a specific canvas position
 * Creates new unique IDs for all nodes and connections
 * Applies collision detection to prevent overlapping nodes
 */
export function instantiateTemplate(
  template: Template,
  options: InstantiationOptions = {}
): { nodes: Node[], connections: Connection[] } {
  const {
    centerX = 500,
    centerY = 300,
    scaleNodes = 1,
    preserveColors = true,
    customRootText
  } = options;

  const NODE_WIDTH = 300;
  const NODE_HEIGHT = 70;
  const MIN_GAP = 30; // Minimum gap between nodes

  // Create ID mapping for nodes
  const idMap = new Map<string, string>();
  
  // Generate unique IDs for all nodes
  template.nodeStructure.nodes.forEach((_, index) => {
    const oldId = index === 0 ? 'root' : getNodeKeyFromIndex(template, index);
    const newId = generateUniqueId('node');
    idMap.set(oldId, newId);
  });

  // Transform nodes with new IDs and positions, with collision detection
  const nodes: Node[] = [];
  const occupiedRects: Array<{x: number, y: number, width: number, height: number}> = [];

  template.nodeStructure.nodes.forEach((nodeTemplate, index) => {
    const oldId = index === 0 ? 'root' : getNodeKeyFromIndex(template, index);
    const newId = idMap.get(oldId)!;

    // Calculate initial position relative to center
    let x = centerX + (nodeTemplate.x * scaleNodes);
    let y = centerY + (nodeTemplate.y * scaleNodes);

    // Check for collisions and adjust position if needed
    let attempts = 0;
    const maxAttempts = 50;
    while (attempts < maxAttempts) {
      const hasCollision = occupiedRects.some(rect => {
        const overlap = !(
          x + NODE_WIDTH + MIN_GAP < rect.x ||
          x - MIN_GAP > rect.x + rect.width ||
          y + NODE_HEIGHT + MIN_GAP < rect.y ||
          y - MIN_GAP > rect.y + rect.height
        );
        return overlap;
      });

      if (!hasCollision) {
        break;
      }

      // Move to avoid collision - try different directions
      if (attempts % 4 === 0) {
        x += NODE_WIDTH + MIN_GAP; // Move right
      } else if (attempts % 4 === 1) {
        y += NODE_HEIGHT + MIN_GAP; // Move down
      } else if (attempts % 4 === 2) {
        x -= NODE_WIDTH + MIN_GAP; // Move left
      } else {
        y -= NODE_HEIGHT + MIN_GAP; // Move up
      }

      attempts++;
    }

    // Record occupied space
    occupiedRects.push({ x, y, width: NODE_WIDTH, height: NODE_HEIGHT });

    // Override root text if provided
    const text = index === 0 && customRootText ? customRootText : nodeTemplate.text;

    nodes.push({
      id: newId,
      text,
      x: Math.round(x),
      y: Math.round(y),
      bgColor: preserveColors ? nodeTemplate.bgColor : '#ffffff',
      fontColor: preserveColors ? nodeTemplate.fontColor : '#2d3748',
      ...nodeTemplate
    });
  });

  // Transform connections with new IDs
  const connections: Connection[] = template.nodeStructure.connections.map((connTemplate) => {
    const newId = generateUniqueId('conn');
    const fromId = idMap.get(connTemplate.from);
    const toId = idMap.get(connTemplate.to);

    if (!fromId || !toId) {
      console.warn(`Invalid connection: ${connTemplate.from} -> ${connTemplate.to}`);
      return null;
    }

    return {
      id: newId,
      from: fromId,
      to: toId,
      ...connTemplate
    };
  }).filter((conn): conn is Connection => conn !== null);

  return { nodes, connections };
}

/**
 * Get node key from template structure based on index
 */
function getNodeKeyFromIndex(template: Template, index: number): string {
  // This maps to the connection references in template definitions
  const nodeKeys = [
    'root', 'goals', 'timeline', 'resources', 'risks',
    'goal1', 'goal2', 'goal3', 'phase1', 'phase2', 'phase3',
    'team', 'budget', 'risk1', 'risk2',
    // Meeting notes
    'attendees', 'agenda', 'discussion', 'actions',
    'person1', 'person2', 'topic1', 'topic2',
    'disc1', 'disc2', 'action1', 'action2',
    // SWOT
    'strengths', 'weaknesses', 'opportunities', 'threats',
    'str1', 'str2', 'str3', 'weak1', 'weak2', 'weak3',
    'opp1', 'opp2', 'opp3', 'thr1', 'thr2', 'thr3',
    // OKR
    'obj1', 'obj2', 'obj3',
    'kr11', 'kr12', 'kr13', 'kr21', 'kr22', 'kr23',
    'kr31', 'kr32', 'kr33',
    // Brainstorm
    'idea1', 'idea2', 'idea3', 'idea4', 'idea5',
    // Weekly
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend',
    'task1', 'task2'
  ];

  return nodeKeys[index] || `node${index}`;
}

/**
 * Apply a template as a subtree to an existing node
 * Useful for adding template structures to existing mind maps
 */
export function applyTemplateToNode(
  template: Template,
  existingNodes: Node[],
  existingConnections: Connection[],
  parentNodeId: string,
  options: InstantiationOptions = {}
): { nodes: Node[], connections: Connection[] } {
  const parent = existingNodes.find(n => n.id === parentNodeId);
  if (!parent) {
    throw new Error(`Parent node ${parentNodeId} not found`);
  }

  // Instantiate template at parent position
  const { nodes: newNodes, connections: newConnections } = instantiateTemplate(template, {
    centerX: parent.x + 300, // Offset to the right
    centerY: parent.y,
    ...options
  });

  // Find root of new template
  const templateRoot = newNodes[0];

  // Create connection from parent to template root
  const parentConnection: Connection = {
    id: generateUniqueId('conn'),
    from: parentNodeId,
    to: templateRoot.id
  };

  return {
    nodes: [...existingNodes, ...newNodes],
    connections: [...existingConnections, ...newConnections, parentConnection]
  };
}

/**
 * Preview template structure without instantiating
 * Returns a scaled-down version for thumbnail display
 */
export function getTemplatePreview(
  template: Template,
  previewWidth: number = 300,
  previewHeight: number = 200
): { nodes: Array<{ x: number, y: number, color: string }>, connections: Array<{ fromIndex: number, toIndex: number }> } {
  // Find bounding box of template
  const xCoords = template.nodeStructure.nodes.map(n => n.x);
  const yCoords = template.nodeStructure.nodes.map(n => n.y);
  
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  
  const templateWidth = maxX - minX || 1;
  const templateHeight = maxY - minY || 1;
  
  // Calculate scale to fit preview
  const scaleX = (previewWidth * 0.8) / templateWidth;
  const scaleY = (previewHeight * 0.8) / templateHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up
  
  // Transform nodes for preview
  const previewNodes = template.nodeStructure.nodes.map(node => ({
    x: (node.x - minX - templateWidth / 2) * scale + previewWidth / 2,
    y: (node.y - minY - templateHeight / 2) * scale + previewHeight / 2,
    color: node.bgColor || '#3B82F6'
  }));
  
  // Map connections to node indices
  const nodeKeyToIndex = new Map<string, number>();
  template.nodeStructure.nodes.forEach((_, index) => {
    const key = index === 0 ? 'root' : getNodeKeyFromIndex(template, index);
    nodeKeyToIndex.set(key, index);
  });
  
  const previewConnections = template.nodeStructure.connections
    .map(conn => ({
      fromIndex: nodeKeyToIndex.get(conn.from) ?? 0,
      toIndex: nodeKeyToIndex.get(conn.to) ?? 1
    }))
    .filter(conn => conn.fromIndex >= 0 && conn.toIndex >= 0);
  
  return { nodes: previewNodes, connections: previewConnections };
}

/**
 * Merge template nodes with existing nodes, avoiding position conflicts
 */
export function mergeTemplateWithMap(
  template: Template,
  existingNodes: Node[],
  existingConnections: Connection[],
  options: InstantiationOptions = {}
): { nodes: Node[], connections: Connection[] } {
  // Find empty space in canvas
  const occupiedPositions = existingNodes.map(n => ({ x: n.x, y: n.y }));
  
  // Find center of existing nodes
  const avgX = existingNodes.reduce((sum, n) => sum + n.x, 0) / existingNodes.length;
  const avgY = existingNodes.reduce((sum, n) => sum + n.y, 0) / existingNodes.length;
  
  // Place template at an offset to avoid collision
  const offsetX = 600; // Offset to the right
  const centerX = options.centerX ?? avgX + offsetX;
  const centerY = options.centerY ?? avgY;
  
  // Instantiate template
  const { nodes: newNodes, connections: newConnections } = instantiateTemplate(template, {
    ...options,
    centerX,
    centerY
  });
  
  return {
    nodes: [...existingNodes, ...newNodes],
    connections: [...existingConnections, ...newConnections]
  };
}
