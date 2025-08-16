import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Link, Settings, Trash2, Check, Moon, Sun } from 'lucide-react';
import MindMapManager from './MindMapManager';
import RoundColorPicker from './RoundColorPicker';
import MindMapToolbar from './mindmap/MindMapToolbar';
import MindMapSearchBar from './mindmap/MindMapSearchBar';
import CollaboratorDialog from './mindmap/CollaboratorDialog';
import MindMapCanvas from './mindmap/MindMapCanvas';

const layoutOptions = [
  { id: 'tree', name: 'Tree Layout', icon: 'diagram-tree' },
  { id: 'radial', name: 'Radial Layout', icon: 'circle-dot' },
  { id: 'hierarchy', name: 'Hierarchy Layout', icon: 'git-merge' },
  { id: 'mindmap', name: 'Mind Map Layout', icon: 'network' },
  { id: 'horizontal', name: 'Horizontal Layout', icon: 'arrow-right' },
  { id: 'vertical', name: 'Vertical Layout', icon: 'arrow-down' }
];

const MindMap = ({ mapId, onBack }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNewMapPrompt, setShowNewMapPrompt] = useState(!mapId); // Show prompt only if no mapId
  const canvasRef = useRef(null);
  
  // Selection mode state
  const [mode, setMode] = useState('cursor');
  const [selectionRect, setSelectionRect] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false);
  const [nodeGroups, setNodeGroups] = useState([]);
  const [lastSelectionRect, setLastSelectionRect] = useState(null);
  
  // Dragging state for smooth animations
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragFrameRef = useRef(null);
  
  // Canvas pan and zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  // Node toolbar expansion state
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
    // Collaborator options
  const collaborators = [
    { id: 'jd', initials: 'JD', name: 'John Doe', color: '#3B82F6' },
    { id: 'ak', initials: 'AK', name: 'Alex Kim', color: '#10B981' },
    { id: 'mr', initials: 'MR', name: 'Maria Rodriguez', color: '#F59E0B' },
    { id: 'ts', initials: 'TS', name: 'Taylor Smith', color: '#8B5CF6' }
  ];

  // Comprehensive color palette for both background and font colors
  const colorPalette = {
    // Basic colors
    basic: [
      '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529', '#000000'
    ],
    // Red spectrum
    reds: [
      '#FFF5F5', '#FED7D7', '#FEB2B2', '#FC8181', '#F56565', '#E53E3E', '#C53030', '#9B2C2C', '#742A2A', '#63171B', '#1A202C'
    ],
    // Orange spectrum
    oranges: [
      '#FFFAF0', '#FEEBC8', '#FBD38D', '#F6AD55', '#ED8936', '#DD6B20', '#C05621', '#9C4221', '#7B341E', '#652B19', '#1A202C'
    ],
    // Yellow spectrum
    yellows: [
      '#FFFFF0', '#FEFCBF', '#FAF089', '#F6E05E', '#ECC94B', '#D69E2E', '#B7791F', '#975A16', '#744210', '#5F370E', '#1A202C'
    ],
    // Green spectrum
    greens: [
      '#F0FFF4', '#C6F6D5', '#9AE6B4', '#68D391', '#48BB78', '#38A169', '#2F855A', '#276749', '#22543D', '#1C4532', '#1A202C'
    ],
    // Teal spectrum
    teals: [
      '#E6FFFA', '#B2F5EA', '#81E6D9', '#4FD1C7', '#38B2AC', '#319795', '#2C7A7B', '#285E61', '#234E52', '#1D4044', '#1A202C'
    ],
    // Blue spectrum
    blues: [
      '#EBF8FF', '#BEE3F8', '#90CDF4', '#63B3ED', '#4299E1', '#3182CE', '#2B77CB', '#2C5282', '#2A4365', '#1A365D', '#1A202C'
    ],
    // Indigo spectrum
    indigos: [
      '#EBF4FF', '#C3DAFE', '#A3BFFA', '#7F9CF5', '#667EEA', '#5A67D8', '#4C51BF', '#434190', '#3C366B', '#322659', '#1A202C'
    ],
    // Purple spectrum
    purples: [
      '#FAF5FF', '#E9D8FD', '#D6BCFA', '#B794F6', '#9F7AEA', '#805AD5', '#6B46C1', '#553C9A', '#44337A', '#322659', '#1A202C'
    ],
    // Pink spectrum
    pinks: [
      '#FFF5F7', '#FED7E2', '#FBB6CE', '#F687B3', '#ED64A6', '#D53F8C', '#B83280', '#97266D', '#702459', '#521B41', '#1A202C'
    ]
  };

  // Helper function to adjust color brightness for gradients
  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  // Global tags state
  const [globalTags, setGlobalTags] = useState([
    { id: 'tag-1', title: '', color: '#DC2626' },
    { id: 'tag-2', title: '', color: '#2563EB' },
    { id: 'tag-3', title: '', color: '#7C3AED' },
    { id: 'tag-4', title: '', color: '#059669' },
    { id: 'tag-5', title: '', color: '#D97706' },
    { id: 'tag-6', title: '', color: '#DB2777' }  ]);
  // Tag editing state
  const [editingTag, setEditingTag] = useState(null);
  
  // Node positions for connections
  const nodeRefs = useRef({});
  const [nodePositions, setNodePositions] = useState({});
  
  // Function to delete a tag and remove it from all nodes
  const deleteTag = (tagId) => {
    // Remove tag from all nodes
    wrappedSetNodes(nodes.map(node => ({
      ...node,
      tags: Array.isArray(node.tags) ? node.tags.filter(id => id !== tagId) : []
    })));
    
    // Remove tag from global tags
    setGlobalTags(globalTags.filter(tag => tag.id !== tagId));
  };  // Load existing mind map data when mapId is provided
  useEffect(() => {
    if (mapId) {
      const savedMindMapData = localStorage.getItem(`mindMap_${mapId}`);
      if (savedMindMapData) {
        try {
          const mindMapData = JSON.parse(savedMindMapData);
          setNodes(mindMapData.nodes || []);
          setConnections(mindMapData.connections || []);
          setNodeGroups(mindMapData.nodeGroups || []);
          setGlobalTags(mindMapData.globalTags || [
            { id: 'tag-1', title: '', color: '#DC2626' },
            { id: 'tag-2', title: '', color: '#2563EB' },
            { id: 'tag-3', title: '', color: '#7C3AED' },
            { id: 'tag-4', title: '', color: '#059669' },
            { id: 'tag-5', title: '', color: '#D97706' },
            { id: 'tag-6', title: '', color: '#DB2777' }
          ]);
        } catch (error) {
          console.error('Error loading mind map data:', error);
          // Create a new mind map if loading fails
          createNewMapWithId(mapId);
        }
      } else {
        // Create a new mind map if no saved data exists
        createNewMapWithId(mapId);
      }
    }
  }, [mapId]);

  // Create a new mind map with a specific ID (for new maps)
  const createNewMapWithId = (id) => {
    // Get the mind map metadata to get the title
    const savedMaps = localStorage.getItem('mindMaps');
    let title = 'Central Idea';
    if (savedMaps) {
      try {
        const maps = JSON.parse(savedMaps);
        const mapMetadata = maps.find(map => map.id === id);
        if (mapMetadata) {
          title = mapMetadata.title || 'Central Idea';
        }
      } catch (error) {
        console.error('Error loading mind map metadata:', error);
      }
    }

    const rootNode = {
      id: 'root',
      text: title,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: '#EEF2FF'
    };
    
    setNodes([rootNode]);
    setConnections([]);
    setNodeGroups([]);
    setShowNewMapPrompt(false);
    
    // Save the initial state
    saveMindMapData(id, [rootNode], [], []);
  };

  // Save mind map data to localStorage
  const saveMindMapData = (mapId, nodesToSave = nodes, connectionsToSave = connections, nodeGroupsToSave = nodeGroups) => {
    if (mapId) {
      const mindMapData = {
        nodes: nodesToSave,
        connections: connectionsToSave,
        nodeGroups: nodeGroupsToSave,
        globalTags: globalTags,
        updatedAt: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(`mindMap_${mapId}`, JSON.stringify(mindMapData));
        
        // Update the mind map metadata with node count and updated timestamp
        const savedMaps = localStorage.getItem('mindMaps');
        if (savedMaps) {
          const maps = JSON.parse(savedMaps);
          const updatedMaps = maps.map(map => 
            map.id === mapId 
              ? { ...map, nodeCount: nodesToSave.length, updatedAt: new Date().toISOString().split('T')[0] }
              : map
          );
          localStorage.setItem('mindMaps', JSON.stringify(updatedMaps));
        }
      } catch (error) {
        console.error('Error saving mind map data:', error);
      }
    }
  };

  // Auto-save mind map data when nodes, connections, or nodeGroups change
  useEffect(() => {
    if (mapId && nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        saveMindMapData(mapId);
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [mapId, nodes, connections, nodeGroups, globalTags]);
  
  // Click outside to close popups
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Add check if click target is inside any popup content
      const isClickInsidePopupContent = e.target.closest('.node-popup');
      const isClickInsideToolbarButton = e.target.closest('.node-toolbar-btn');
      
      if (nodes.some(node => node.showEmojiPopup || node.showBgColorPopup || node.showFontColorPopup || 
                         node.showAttachmentPopup || node.showNotesPopup || node.showDetailsPopup || 
                         node.showDatePopup || node.showCollaboratorPopup || node.showLayoutPopup || node.showTagsPopup)) {
        const isClickInsidePopup = e.target.closest('.node-popup');
        const isClickInsideButton = e.target.closest('.node-popup-button');
        
        if (!isClickInsidePopup && !isClickInsideButton && !isClickInsidePopupContent && !isClickInsideToolbarButton) {
          setNodes(nodes.map(node => ({
            ...node,
            showEmojiPopup: false,
            showBgColorPopup: false,
            showFontColorPopup: false,
            showAttachmentPopup: false,
            showNotesPopup: false,
            showDetailsPopup: false,
            showDatePopup: false,
            showCollaboratorPopup: false,
            showLayoutPopup: false  // Add this line
          })));
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nodes]);

  // Update the global click handler to properly detect clicks inside popups
  useEffect(() => {
    const handleClickOutside = (event) => {
      const popupElements = document.querySelectorAll('.node-popup');
      const toolbarButtons = document.querySelectorAll('.node-toolbar-btn');
      let clickedInsidePopup = false;
      let clickedInsideToolbarButton = false;
  
      popupElements.forEach(popup => {
        if (popup.contains(event.target)) {
          clickedInsidePopup = true;
        }
      });

      toolbarButtons.forEach(button => {
        if (button.contains(event.target)) {
          clickedInsideToolbarButton = true;
        }
      });
  
      if (!clickedInsidePopup && !clickedInsideToolbarButton) {        setNodes(nodes.map(node => ({
          ...node,
          showEmojiPopup: false,
          showBgColorPopup: false,
          showFontColorPopup: false,
          showAttachmentPopup: false,
          showNotesPopup: false,
          showDetailsPopup: false,
          showDatePopup: false,
          showCollaboratorPopup: false,
          showLayoutPopup: false,
          showTagsPopup: false
        })));
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nodes]);

  // Ensure event propagation is stopped for inputs and dropdowns inside popups
  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  // Set up wheel event for zooming
  useEffect(() => {
    const handleWheel = (e) => {
      // Check if the wheel event is inside a popup
      const isInsidePopup = e.target.closest('.node-popup');
      
      // If inside a popup, allow normal scroll behavior
      if (isInsidePopup) {
        return;
      }
      
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prevZoom => {
        const newZoom = prevZoom * zoomFactor;
        return Math.min(Math.max(newZoom, 0.2), 3);
      });
    };
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);
  
  // Update the startPanning function
  const startPanning = (e) => {
    if (e.button === 0) { // Left mouse button
      const clickedOnNode = e.target.closest('.node');
      const clickedOnPopup = e.target.closest('.node-popup');
      
      // Only start panning if:
      // 1. Click is on background (not on node or popup)
      // 2. No node is currently selected
      if (!clickedOnNode && !clickedOnPopup && !selectedNode) {
        setIsPanning(true);
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    }
  };
  
  // Update the handlePanning function
  const handlePanning = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      
      setPan(prevPan => ({
        x: prevPan.x + dx,
        y: prevPan.y + dy
      }));
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };
  
  // Helper to get all descendant node IDs for a given node
const getDescendantNodeIds = (parentId) => {
  const descendants = new Set();
  const stack = [parentId];
  while (stack.length > 0) {
    const currentId = stack.pop();
    // Find all direct children
    const childConnections = connections.filter(conn => conn.from === currentId);
    for (const conn of childConnections) {
      if (!descendants.has(conn.to)) {
        descendants.add(conn.to);
        stack.push(conn.to);
      }
    }
  }
  return Array.from(descendants);
};

  // Handle the end of panning or selection
  const stopPanning = () => {
    if (isSelecting && selectionRect) {
      // Find nodes fully inside the selection rectangle
      const selectedIdsSet = new Set();
      nodes.forEach(node => {
        const nodeLeft = node.x - 75;
        const nodeRight = node.x + 75;
        const nodeTop = node.y - 25;
        const nodeBottom = node.y + 25;
        const isInside = (
          nodeLeft >= selectionRect.x &&
          nodeRight <= selectionRect.x + selectionRect.width &&
          nodeTop >= selectionRect.y &&
          nodeBottom <= selectionRect.y + selectionRect.height
        );
        if (isInside) {
          selectedIdsSet.add(node.id);
          // Add all descendants
          getDescendantNodeIds(node.id).forEach(id => selectedIdsSet.add(id));
        }
      });
      const selectedIds = Array.from(selectedIdsSet);
      // Update selected nodes
      if (selectedIds.length > 0) {
        setSelectedNodes(selectedIds);
        // Save the selection rectangle for later use
        setLastSelectionRect(selectionRect);
        // Only show collaborator dialog in collaborator selection mode
        if (selectionType === 'collaborator') {
          setShowCollaboratorDialog(true);
        }
      }
    }
    setIsSelecting(false);
    setSelectionRect(null);
    setIsPanning(false);
  };
  
  // Collaborator selection mode
  const [selectionType, setSelectionType] = useState('simple'); // 'simple' or 'collaborator'

  // Assigning collaborator to selected nodes
  const assignCollaborator = (collaborator) => {
    // Create a new group with the selected nodes and collaborator
    const newGroup = {
      id: `group-${Date.now()}`,
      nodeIds: [...selectedNodes],
      collaborator
    };

    // Use the last selection rectangle as the bounding box if available
    if (lastSelectionRect) {
      newGroup.boundingBox = {
        x: lastSelectionRect.x,
        y: lastSelectionRect.y,
        width: lastSelectionRect.width,
        height: lastSelectionRect.height
      };
    } else {
      // Fallback: calculate bounding box from nodes
      const groupNodes = nodes.filter(node => selectedNodes.includes(node.id));
      const minX = Math.min(...groupNodes.map(node => node.x - 75));
      const maxX = Math.max(...groupNodes.map(node => node.x + 75));
      const minY = Math.min(...groupNodes.map(node => node.y - 25));
      const maxY = Math.max(...groupNodes.map(node => node.y + 25));
      newGroup.boundingBox = {
        x: minX - 10,
        y: minY - 10,
        width: (maxX - minX) + 20,
        height: (maxY - minY) + 20
      };
    }

    // Add the new group
    setNodeGroups([...nodeGroups, newGroup]);
    
    // Reset selection state
    setSelectedNodes([]);
    setShowCollaboratorDialog(false);
    setLastSelectionRect(null); // Clear after use

    // Switch back to simple selection mode
    setMode('cursor');
    setSelectionType('simple');
  };
    // Create a new mind map
  const createNewMap = (title = 'Central Idea') => {
    const rootNode = {
      id: 'root',
      text: title,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: '#EEF2FF'
    };
    
    wrappedSetNodes([rootNode]);
    wrappedSetConnections([]);
    setShowNewMapPrompt(false);
  };

  // Add this helper function at the top of the component
  // Improved findAvailablePosition function with better spacing
  const findAvailablePosition = (nodes, centerX, centerY, radius = 180) => {
    const angleStep = (2 * Math.PI) / 12; // Divide circle into 12 positions for finer control
    let currentAngle = 0; // Start at 0 degrees (right side)
    let currentRadius = radius;
    let attempts = 0;
    const maxAttempts = 24; // Try more positions before increasing radius
    const minDistance = 180; // Minimum distance between nodes
  
    while (attempts < maxAttempts) {
      const x = centerX + Math.cos(currentAngle) * currentRadius;
      const y = centerY + Math.sin(currentAngle) * currentRadius;
  
      // Check if position is far enough from all other nodes
      const isFarEnough = nodes.every(node => {
        const distance = Math.sqrt(
          Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)
        );
        return distance > minDistance;
      });
  
      // Also check if position is within viewport bounds
      const isInBounds = x > 100 && x < window.innerWidth - 300 && 
                        y > 100 && y < window.innerHeight - 200;
  
      if (isFarEnough && isInBounds) {
        return { x, y };
      }
  
      currentAngle += angleStep;
      attempts++;
  
      // If we've tried all angles at current radius, increase radius
      if (attempts % 12 === 0) {
        currentRadius += 120;
      }
    }
  
    // If all else fails, return a fallback position
    return {
      x: Math.max(100, Math.min(centerX + currentRadius, window.innerWidth - 300)),
      y: Math.max(100, Math.min(centerY + currentRadius, window.innerHeight - 200))
    };
  };
  
  // Update the addStandaloneNode function
  const addStandaloneNode = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const { x, y } = findAvailablePosition(nodes, centerX, centerY);
    
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      text: '',
      x: x,
      y: y,
      color: isDarkMode ? '#374151' : '#ffffff'
    };
    
    wrappedSetNodesAndConnections([...nodes, newNode], connections);
    setSelectedNode(newId);
  };
  // Update the addChildNode function to use similar logic
  const addChildNode = (parentId) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    // Get existing children of this parent
    const existingChildren = connections.filter(conn => conn.from === parentId);
    const childCount = existingChildren.length;

    const newId = `node-${Date.now()}`;
    
    // Calculate dynamic parent width with updated formula
    const parentWidth = Math.min(400, Math.max(200, parent.text.length * 12));
    
    // Better positioning to avoid stacking
    let newX, newY;
    
    if (childCount === 0) {
      // First child - place to the right of parent
      newX = parent.x + parentWidth/2 + 140;
      newY = parent.y;
    } else if (childCount === 1) {
      // Second child - place below first child
      newX = parent.x + parentWidth/2 + 140;
      newY = parent.y + 120;
    } else if (childCount === 2) {
      // Third child - place above parent
      newX = parent.x + parentWidth/2 + 140;
      newY = parent.y - 120;
    } else {
      // For 4+ children, arrange in a proper circle around parent
      const baseDistance = 140;
      const childrenInCircle = Math.max(6, childCount + 1);
      const angleStep = (2 * Math.PI) / childrenInCircle;
      
      // Start from right side (0 degrees) and go clockwise
      let startAngle = 0;
      if (childCount >= 3) {
        // Skip the first 3 positions (right, bottom-right, top-right)
        startAngle = angleStep * 3;
      }
      
      const currentAngle = startAngle + (angleStep * (childCount - 3));
      
      // Increase distance slightly for more children to avoid crowding
      const layerDistance = baseDistance + (Math.floor(childCount / 8) * 80);
      
      newX = parent.x + Math.cos(currentAngle) * layerDistance;
      newY = parent.y + Math.sin(currentAngle) * layerDistance;
    }
    
    // Enhanced overlap checking with better collision resolution
    const minDistance = 110;
    let attempts = 0;
    const maxAttempts = 8;
    
    while (attempts < maxAttempts) {
      let hasOverlap = false;
      let closestDistance = Infinity;
      
      for (const existingNode of nodes) {
        if (existingNode.id === parent.id) continue;
        
        const distance = Math.sqrt(
          Math.pow(newX - existingNode.x, 2) + Math.pow(newY - existingNode.y, 2)
        );
        
        if (distance < minDistance) {
          hasOverlap = true;
          closestDistance = Math.min(closestDistance, distance);
        }
      }
      
      if (!hasOverlap) break;
      
      // Smart repositioning - find next available position
      const currentAngle = Math.atan2(newY - parent.y, newX - parent.x);
      const currentDistance = Math.sqrt(
        Math.pow(newX - parent.x, 2) + Math.pow(newY - parent.y, 2)
      );
      
      // Try rotating around parent to find free space
      const rotationStep = Math.PI / 6; // 30 degrees
      const newAngle = currentAngle + (rotationStep * (attempts + 1));
      const adjustedDistance = Math.max(currentDistance, minDistance + 20);
      
      newX = parent.x + Math.cos(newAngle) * adjustedDistance;
      newY = parent.y + Math.sin(newAngle) * adjustedDistance;
      attempts++;
    }
    
    // Keep within reasonable bounds
    newX = Math.max(50, Math.min(newX, window.innerWidth - 250));
    newY = Math.max(50, Math.min(newY, window.innerHeight - 150));

    const newNode = {
      id: newId,
      text: '',
      x: newX,
      y: newY,
      color: parent.color
    };

    const newConnection = {
      id: `conn-${Date.now()}`,
      from: parentId,
      to: newId
    };

    wrappedSetNodesAndConnections([...nodes, newNode], [...connections, newConnection]);
    // setSelectedNode(newId); // Do NOT select the new child node, keep focus on parent
  };
  
  // Update node text
  const updateNodeText = (nodeId, text) => {
    wrappedSetNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, text } : node
    ));
  };

  // Toggle node completion status
  const toggleNodeCompletion = (nodeId) => {
    wrappedSetNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, completed: !node.completed } : node
    ));
  };

  // Calculate completion progress for parent nodes (recursive - includes all descendants)
  const getNodeProgress = (nodeId) => {
    // Recursive function to get all descendant nodes
    const getAllDescendants = (parentId, visited = new Set()) => {
      // Prevent infinite loops in case of circular references
      if (visited.has(parentId)) {
        return [];
      }
      visited.add(parentId);
      
      const directChildren = connections
        .filter(conn => conn.from === parentId)
        .map(conn => nodes.find(node => node.id === conn.to))
        .filter(Boolean);
      
      let allDescendants = [...directChildren];
      
      // Recursively get descendants of each child
      directChildren.forEach(child => {
        const childDescendants = getAllDescendants(child.id, new Set(visited));
        allDescendants = [...allDescendants, ...childDescendants];
      });
      
      return allDescendants;
    };
    
    const allDescendants = getAllDescendants(nodeId);
    
    if (allDescendants.length === 0) {
      return null; // No descendants, no progress to show
    }
    
    // Remove duplicates (in case of complex graph structures)
    const uniqueDescendants = allDescendants.filter((node, index, self) => 
      index === self.findIndex(n => n.id === node.id)
    );
    
    const completedDescendants = uniqueDescendants.filter(descendant => descendant.completed).length;
    const totalDescendants = uniqueDescendants.length;
    
    return {
      completed: completedDescendants,
      total: totalDescendants,
      percentage: Math.round((completedDescendants / totalDescendants) * 100),
      depth: getMaxDepth(nodeId) // Optional: show how deep the hierarchy goes
    };
  };

  // Helper function to calculate the maximum depth of the node tree
  const getMaxDepth = (nodeId, visited = new Set(), currentDepth = 0) => {
    if (visited.has(nodeId)) {
      return currentDepth;
    }
    visited.add(nodeId);
    
    const children = connections
      .filter(conn => conn.from === nodeId)
      .map(conn => conn.to);
    
    if (children.length === 0) {
      return currentDepth;
    }
    
    const childDepths = children.map(childId => 
      getMaxDepth(childId, new Set(visited), currentDepth + 1)
    );
    
    return Math.max(...childDepths);
  };
  
  // Add this state to track whether a node is in edit mode
  const [editingNode, setEditingNode] = useState(null);

  // Update the handleNodeClick function to prevent focusing on the node when clicking inside a popup or input
const handleNodeClick = (nodeId, e) => {
  // Prevent focusing on the node if the click is inside a popup or input
  if (e.target.closest('.node-popup') || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
    return;
  }

  if (mode === 'cursor') {
    if (selectionType === 'simple') {
      if (e.ctrlKey || e.metaKey) {
        // Add to selection if Ctrl/Cmd is pressed
        setSelectedNodes(prev => 
          prev.includes(nodeId) 
            ? prev.filter(id => id !== nodeId)
            : [...prev, nodeId]
        );
      } else {
        // Replace selection if no modifier key
        setSelectedNodes([nodeId]);
      }
    }

    // If the node is already selected and clicked again, enable editing
    if (selectedNode === nodeId) {
      setEditingNode(nodeId);
      setIsEditing(true);
    } else {
      // First click just selects the node
      setSelectedNode(nodeId);
      setEditingNode(null);
      setIsEditing(false);
    }
  }
};    // Handle node dragging with optimized performance
  const handleNodeDrag = (nodeId, newX, newY) => {
    // Cancel any pending animation frame
    if (dragFrameRef.current) {
      cancelAnimationFrame(dragFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    dragFrameRef.current = requestAnimationFrame(() => {
      const targetNode = nodes.find(n => n.id === nodeId);
      
      // Check if this node belongs to any collaborator group
      const nodeGroup = nodeGroups.find(group => group.nodeIds.includes(nodeId));
    
    // If node is in a group, constrain its movement to the group's bounding box
    if (nodeGroup) {
      const { boundingBox } = nodeGroup;
      const nodeWidth = 150; // Approximate node width (75px on each side)
      const nodeHeight = 50;  // Approximate node height (25px on each side)
      
      // Constrain the new position to stay within the group's bounding box
      const constrainedX = Math.max(
        boundingBox.x + nodeWidth / 2, 
        Math.min(newX, boundingBox.x + boundingBox.width - nodeWidth / 2)
      );
      const constrainedY = Math.max(
        boundingBox.y + nodeHeight / 2,
        Math.min(newY, boundingBox.y + boundingBox.height - nodeHeight / 2)
      );
      
      newX = constrainedX;
      newY = constrainedY;
    }

    const dx = newX - targetNode.x;
    const dy = newY - targetNode.y;

    if (selectedNodes.includes(nodeId)) {
      // Move all selected nodes by the same displacement, but constrain each one individually
      wrappedSetNodes(nodes.map(node => {
        if (selectedNodes.includes(node.id)) {
          let finalX = node.x + dx;
          let finalY = node.y + dy;
          
          // Check if this node is also in a group and constrain it
          const selectedNodeGroup = nodeGroups.find(group => group.nodeIds.includes(node.id));
          if (selectedNodeGroup) {
            const { boundingBox } = selectedNodeGroup;
            const nodeWidth = 150;
            const nodeHeight = 50;
            
            finalX = Math.max(
              boundingBox.x + nodeWidth / 2,
              Math.min(finalX, boundingBox.x + boundingBox.width - nodeWidth / 2)
            );
            finalY = Math.max(
              boundingBox.y + nodeHeight / 2,
              Math.min(finalY, boundingBox.y + boundingBox.height - nodeHeight / 2)
            );
          }
          
          return {
            ...node,
            x: finalX,
            y: finalY
          };
        }
        return node;
      }));
  
      // Update group bounding boxes for all selected nodes
      updateGroupBoundingBoxes(selectedNodes, dx, dy);
    } else {
      // Move only the single node with constraints already applied
      wrappedSetNodes(nodes.map(node => 
        node.id === nodeId ? { ...node, x: newX, y: newY } : node
      ));
      
      // No need to update group bounding box since node stays within bounds
      // The group bounding box should remain the same when nodes move within it
    }
    }); // Close requestAnimationFrame
  };
  
  // Helper function to update group bounding boxes
  const updateGroupBoundingBoxes = (affectedNodeIds, dx, dy) => {
    // For constrained groups, we don't update the bounding box
    // The nodes should stay within the original bounds set during collaborator assignment
    // The bounding box remains fixed to maintain the grouping constraint
  };
  
  // Helper function to update group bounding boxes for a single moved node
  const updateSingleNodeGroupBoundingBoxes = (movedNodeId, newX, newY) => {
    setNodeGroups(nodeGroups.map(group => {
      if (group.nodeIds.includes(movedNodeId)) {
        // Get all nodes in this group with updated position for the moved node
        const groupNodes = nodes
          .filter(node => group.nodeIds.includes(node.id))
          .map(node => ({
            ...node,
            x: node.id === movedNodeId ? newX : node.x,
            y: node.id === movedNodeId ? newY : node.y
          }));

        // Recalculate bounding box based on current positions
        const minX = Math.min(...groupNodes.map(node => node.x - 75));
        const maxX = Math.max(...groupNodes.map(node => node.x + 75));
        const minY = Math.min(...groupNodes.map(node => node.y - 25));
        const maxY = Math.max(...groupNodes.map(node => node.y + 25));

        const boundingBox = {
          x: minX - 10,
          y: minY - 10,
          width: (maxX - minX) + 20,
          height: (maxY - minY) + 20
        };

        return { ...group, boundingBox };
      }
      return group;
    }));
  };
  
  // Delete a node
  const deleteNode = (nodeId) => {
    // Don't allow deleting the root node
    if (nodeId === 'root') {
      alert("Cannot delete the central idea node");
      return;
    }
    
    // Remove connections
    const updatedConnections = connections.filter(
      conn => conn.from !== nodeId && conn.to !== nodeId
    );
    
    // Remove the node
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    
    // Update any collaborator groups that contain this node
    const updatedGroups = nodeGroups.filter(group => {
      // If the group doesn't include this node, keep it unchanged
      if (!group.nodeIds.includes(nodeId)) return true;
      
      // Remove the nodeId from this group
      const updatedNodeIds = group.nodeIds.filter(id => id !== nodeId);
      
      // If there are fewer than 2 nodes left, remove the entire group
      if (updatedNodeIds.length < 2) return false;
      
      // Otherwise, update the group with the remaining nodes and recalculate its bounding box
      group.nodeIds = updatedNodeIds;
      
      // Recalculate the bounding box
      const groupNodes = updatedNodes.filter(node => updatedNodeIds.includes(node.id));
      const minX = Math.min(...groupNodes.map(node => node.x - 75));
      const maxX = Math.max(...groupNodes.map(node => node.x + 75));
      const minY = Math.min(...groupNodes.map(node => node.y - 25));
      const maxY = Math.max(...groupNodes.map(node => node.y + 25));
      
      group.boundingBox = {
        x: minX - 10,
        y: minY - 10,
        width: (maxX - minX) + 20,
        height: (maxY - minY) + 20
      };
      
      return true;
    });
    
    // Update state
    wrappedSetNodes(updatedNodes);
    wrappedSetConnections(updatedConnections);
    setNodeGroups(updatedGroups);
    setSelectedNode(null);
  };

  // Add new deleteNodes function
  const deleteNodes = (nodeIds) => {
    // Don't allow deleting the root node
    if (nodeIds.includes('root')) {
      alert("Cannot delete the central idea node");
      return;
    }
    
    // Remove connections
    const updatedConnections = connections.filter(
      conn => !nodeIds.includes(conn.from) && !nodeIds.includes(conn.to)
    );
    
    // Remove nodes
    const updatedNodes = nodes.filter(node => !nodeIds.includes(node.id));
    
    // Update groups
    const updatedGroups = nodeGroups.filter(group => {
      // Remove deleted nodes from group
      const updatedNodeIds = group.nodeIds.filter(id => !nodeIds.includes(id));
      
      // If fewer than 2 nodes remain, remove the group
      if (updatedNodeIds.length < 2) return false;
      
      // Update group with remaining nodes
      group.nodeIds = updatedNodeIds;
      
      // Recalculate bounding box
      const groupNodes = updatedNodes.filter(node => updatedNodeIds.includes(node.id));
      const minX = Math.min(...groupNodes.map(node => node.x - 75));
      const maxX = Math.max(...groupNodes.map(node => node.x + 75));
      const minY = Math.min(...groupNodes.map(node => node.y - 25));
      const maxY = Math.max(...groupNodes.map(node => node.y + 25));
      
      group.boundingBox = {
        x: minX - 10,
        y: minY - 10,
        width: (maxX - minX) + 20,
        height: (maxY - minY) + 20
      };
      
      return true;
    });
    
    // Update state
    wrappedSetNodes(updatedNodes);
    wrappedSetConnections(updatedConnections);
    setNodeGroups(updatedGroups);
    setSelectedNodes([]);
    setSelectedNode(null);
  };  // Render connections between nodes
  const renderConnections = useMemo(() => {
    // console.log('DEBUG: Rendering connections', { connectionsCount: connections.length, connections, nodesCount: nodes.length });
    
    if (connections.length === 0) return null;

    // Use a single SVG for all connections to avoid stacking issues
    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'visible'
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={isDarkMode ? "#9ca3af" : "#64748B"}
              opacity="0.6"
            />
          </marker>
        </defs>
        {connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          
          if (!fromNode || !toNode) {
            return null;
          }

          // Use the measured node positions from nodePositions
          const fromPos = nodePositions[conn.from];
          const toPos = nodePositions[conn.to];
          
          if (!fromPos || !toPos) {
            return null;
          }

          // Function to get exact point on rectangle perimeter based on angle
          const getPerimeterPoint = (rect, targetCenterX, targetCenterY) => {
            const rectCenterX = (rect.left + rect.right) / 2;
            const rectCenterY = (rect.top + rect.bottom) / 2;
            const width = rect.right - rect.left;
            const height = rect.bottom - rect.top;
            
            // Calculate angle from rectangle center to target center
            const angle = Math.atan2(targetCenterY - rectCenterY, targetCenterX - rectCenterX);
            
            // Calculate half dimensions
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            
            // Determine which edge the angle intersects
            const absAngle = Math.abs(angle);
            const cornerAngle = Math.atan2(halfHeight, halfWidth);
            
            let x, y;
            
            if (absAngle <= cornerAngle) {
              // Right edge
              x = rect.right;
              y = rectCenterY + halfWidth * Math.tan(angle);
            } else if (absAngle <= Math.PI - cornerAngle) {
              // Top or bottom edge
              if (angle > 0) {
                // Bottom edge
                x = rectCenterX + halfHeight / Math.tan(angle);
                y = rect.bottom;
              } else {
                // Top edge
                x = rectCenterX - halfHeight / Math.tan(angle);
                y = rect.top;
              }
            } else {
              // Left edge
              x = rect.left;
              y = rectCenterY + halfWidth * Math.tan(Math.PI - absAngle) * (angle > 0 ? -1 : 1);
            }
            
            // Ensure point is within rectangle bounds
            x = Math.max(rect.left, Math.min(rect.right, x));
            y = Math.max(rect.top, Math.min(rect.bottom, y));
            
            return { x, y };
          };

          // Calculate centers for angle calculation
          const fromCenterX = (fromPos.left + fromPos.right) / 2;
          const fromCenterY = (fromPos.top + fromPos.bottom) / 2;
          const toCenterX = (toPos.left + toPos.right) / 2;
          const toCenterY = (toPos.top + toPos.bottom) / 2;

          // Get exact perimeter points for smooth connection
          const startPoint = getPerimeterPoint(fromPos, toCenterX, toCenterY);
          const endPoint = getPerimeterPoint(toPos, fromCenterX, fromCenterY);

          // Create smooth curve with control points
          const dx = endPoint.x - startPoint.x;
          const dy = endPoint.y - startPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Control points for smooth curve - adjusted for better curves
          const controlDistance = Math.min(distance * 0.4, 100);
          const controlPoint1X = startPoint.x + dx * 0.25;
          const controlPoint1Y = startPoint.y + dy * 0.1;
          const controlPoint2X = endPoint.x - dx * 0.25;
          const controlPoint2Y = endPoint.y - dy * 0.1;

          const pathData = `M ${startPoint.x} ${startPoint.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endPoint.x} ${endPoint.y}`;
          
          return (
            <g key={conn.id}>
              {/* Main connection path with smooth transitions */}
              <path
                d={pathData}
                stroke={isDarkMode ? "#9ca3af" : "#64748B"}
                strokeWidth={2}
                fill="none"
                strokeOpacity={0.8}
                style={{
                  transition: 'all 0.15s ease-out'
                }}
              />
            </g>
          );
        })}
      </svg>
    );
  }, [nodes, connections, nodePositions]);
  // Render the group bounding boxes and collaborator icons
  const renderNodeGroups = () => {
    return nodeGroups.map(group => {
      const { boundingBox, collaborator } = group;
      
      return (
        <div key={group.id} style={{
          position: 'absolute',
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
          border: `3px dashed ${collaborator.color}`,
          borderRadius: '12px',
          backgroundColor: `${collaborator.color}10`, // Very subtle background tint
          pointerEvents: 'none',
          zIndex: 4,
          boxShadow: `0 0 0 1px ${collaborator.color}20` // Subtle outer glow
        }}>
          {/* Collaborator badge in top-right corner */}
          <div style={{
            position: 'absolute',
            top: -15,
            right: -15,
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: collaborator.color,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            border: '2px solid white'
          }}>
            {collaborator.initials}
          </div>
          
          {/* Add a subtle label at the bottom to indicate this is a constraint area */}
          <div style={{
            position: 'absolute',
            bottom: -25,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.7rem',
            color: collaborator.color,
            fontWeight: 'bold',
            backgroundColor: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            border: `1px solid ${collaborator.color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {collaborator.name}'s Group
          </div>
        </div>
      );
    });
  };

  // First, modify how attachments are stored in the node. Instead of a single attachment,
  // Simulated current user - in a real app this would come from auth context
  const currentUser = 'Current User'; // This should be replaced with actual logged-in user info

  // Helper function to stop click propagation (keep for onClick events)
  const stopClickPropagation = (e) => {
    e.stopPropagation();
  };

  // we'll store an array of attachment objects
  const handleAttachment = (e, nodeId) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        dateAdded: new Date().toISOString(),
        addedBy: currentUser, // Automatically use the current logged-in user
        type: file.name.split('.').pop().toLowerCase(),
      };

      wrappedSetNodes(nodes.map(n => 
        n.id === nodeId ? {
          ...n,
          attachments: [...(n.attachments || []), newAttachment]
        } : n
      ));
    }
  };

  // Add this state at component level
  const [attachmentFilters, setAttachmentFilters] = useState({
    search: ''
  });

  // Add near the other state declarations
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchList, setShowSearchList] = useState(false);

  const applyLayout = (nodeId, layoutType) => {
    const parentNode = nodes.find(n => n.id === nodeId);
    if (!parentNode) return;
  
    // Get all child nodes and connections for this parent
    const childConnections = connections.filter(conn => conn.from === nodeId);
    const childNodes = childConnections.map(conn => 
      nodes.find(n => n.id === conn.to)
    ).filter(Boolean);
  
    const updatedNodes = [...nodes];
    
    switch (layoutType) {
      case 'tree':
        // Vertical tree layout
        childNodes.forEach((child, index) => {
          const totalWidth = childNodes.length * 200;
          const startX = parentNode.x - totalWidth / 2 + 100;
          const level = getNodeLevel(child.id);
          
          const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...child,
              x: startX + (index * 200),
              y: parentNode.y + (level * 150)
            };
          }
        });
        break;
  
      case 'radial':
        // Radial layout
        const radius = 250;
        const angleStep = (2 * Math.PI) / childNodes.length;
        
        childNodes.forEach((child, index) => {
          const angle = index * angleStep;
          const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
          
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...child,
              x: parentNode.x + radius * Math.cos(angle),
              y: parentNode.y + radius * Math.sin(angle)
            };
          }
        });
        break;
  
      case 'hierarchy':
        // Hierarchical layout
        childNodes.forEach((child, index) => {
          const level = getNodeLevel(child.id);
          const offset = index % 2 === 0 ? -1 : 1;
          const spacing = 200 * offset * Math.ceil(index / 2);
          
          const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...child,
              x: parentNode.x + spacing,
              y: parentNode.y + (level * 150)
            };
          }
        });
        break;
  
      case 'horizontal':
        // Horizontal layout
        childNodes.forEach((child, index) => {
          const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...child,
              x: parentNode.x + ((index + 1) * 250),
              y: parentNode.y
            };
          }
        });
        break;
  
      case 'vertical':
        // Vertical layout
        childNodes.forEach((child, index) => {
          const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...child,
              x: parentNode.x,
              y: parentNode.y + ((index + 1) * 150)
            };
          }
        });
        break;
  
      case 'mindmap':
        // Mind map layout (organic)
        childNodes.forEach((child, index) => {
          const angle = (index * (2 * Math.PI)) / childNodes.length;
          const radius = 200 + (Math.random() * 100);
          
          const nodeIndex = updatedNodes.findIndex(n => n.id === child.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...child,
              x: parentNode.x + radius * Math.cos(angle),
              y: parentNode.y + radius * Math.sin(angle)
            };
          }
        });
        break;
    }
  
    wrappedSetNodes(updatedNodes);
  };
  
  // Helper function to get node level in the hierarchy
  const getNodeLevel = (nodeId) => {
    let level = 1;
    let currentId = nodeId;
    
    while (true) {
      const connection = connections.find(conn => conn.to === currentId);
      if (!connection) break;
      
      currentId = connection.from;
      level++;
    }
    
    return level;
  };

  // Add this state to manage selection type
  // const [selectionType, setSelectionType] = useState('simple'); // 'simple' or 'collaborator'

  // Add this useEffect near your other useEffect hooks in MindMap.jsx
  useEffect(() => {
    const handleKeyDown = (e) => {  // Remove the : KeyboardEvent type annotation
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Check if we have any selected nodes
        if (selectedNodes.length > 0) {
          // Don't delete if any selected node is the root node
          if (selectedNodes.includes('root')) {
            alert("Cannot delete the central idea node");
            return;
          }
          
          // Call deleteNodes function with selected nodes
          deleteNodes(selectedNodes);
        } else if (selectedNode && selectedNode !== 'root') {
          // If no multi-selection but single node is selected
          deleteNode(selectedNode);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, selectedNode]); // Add dependencies for the nodes you're tracking

  // Add a new state to track text editing
  const [isEditing, setIsEditing] = useState(false);

  // Update the useEffect for keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete node if we're editing text
        if (isEditing) {
          return;
        }

        // Check if we have any selected nodes
        if (selectedNodes.length > 0) {
          // Don't delete if any selected node is the root node
          if (selectedNodes.includes('root')) {
            alert("Cannot delete the central idea node");
            return;
          }
          
          // Call deleteNodes function with selected nodes
          deleteNodes(selectedNodes);
        } else if (selectedNode && selectedNode !== 'root') {
          // If no multi-selection but single node is selected
          deleteNode(selectedNode);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodes, selectedNode, isEditing]); // Add isEditing to dependencies

  // Add these to your existing mouse event handlers in MindMap.jsx
const startSelection = (e) => {
  if (mode === 'cursor' && selectionType === 'collaborator') {
    e.preventDefault(); // Prevent page scrolling or text selection
    setIsSelecting(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setSelectionStart({ x, y });
    setSelectionRect({ x, y, width: 0, height: 0 });
  }
};

const updateSelection = (e) => {
  if (isSelecting) {
    e.preventDefault(); // Prevent page scrolling or text selection
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left - pan.x) / zoom;
    const currentY = (e.clientY - rect.top - pan.y) / zoom;
    // Calculate width and height before deciding position
    const width = Math.abs(currentX - selectionStart.x);
    const height = Math.abs(currentY - selectionStart.y);
    // Set rectangle position and size to ensure it covers the selection area
    setSelectionRect({
      x: Math.min(currentX, selectionStart.x),
      y: Math.min(currentY, selectionStart.y),
      width: width,
      height: height
    });
  }
};

// Add state for history and current history index
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

// Function to save the current state to history
const saveToHistory = () => {
  const currentState = { nodes, connections };
  const newHistory = history.slice(0, historyIndex + 1); // Remove future states if any
  setHistory([...newHistory, currentState]);
  setHistoryIndex(newHistory.length);
};

// Undo function
const undo = () => {
  if (historyIndex > 0) {
    const previousState = history[historyIndex - 1];
    setNodes(previousState.nodes);
    setConnections(previousState.connections);
    setHistoryIndex(historyIndex - 1);
  }
};

// Redo function
const redo = () => {
  if (historyIndex < history.length - 1) {
    const nextState = history[historyIndex + 1];
    setNodes(nextState.nodes);
    setConnections(nextState.connections);
    setHistoryIndex(historyIndex + 1);
  }
};

// Wrap state-modifying functions to save to history
const wrappedSetNodes = (newNodes) => {
  setNodes(newNodes);
  saveToHistory();
};

const wrappedSetConnections = (newConnections) => {
  setConnections(newConnections);
  saveToHistory();
};

// New: wrap both nodes and connections in a single update
const wrappedSetNodesAndConnections = (newNodes, newConnections) => {
  setNodes(newNodes);
  setConnections(newConnections);
  saveToHistory();
};

// Calculate node positions using actual DOM measurements
useLayoutEffect(() => {
  const positions = {};
  nodes.forEach(node => {
    // Get the actual DOM element to measure real boundaries
    const el = nodeRefs.current[node.id];
    if (el) {
      const rect = el.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (canvasRect) {
        // Convert screen coordinates to canvas coordinates, accounting for pan/zoom
        // Since both nodes and SVG are in the same transformed container, we need to convert back to the untransformed space
        const localLeft = (rect.left - canvasRect.left - pan.x) / zoom;
        const localTop = (rect.top - canvasRect.top - pan.y) / zoom;
        const localWidth = rect.width / zoom;
        const localHeight = rect.height / zoom;
        
        positions[node.id] = {
          left: localLeft,
          top: localTop,
          right: localLeft + localWidth,
          bottom: localTop + localHeight,
          width: localWidth,
          height: localHeight,
          centerX: localLeft + localWidth / 2,
          centerY: localTop + localHeight / 2
        };
      }
    } else {
      // Fallback to calculated dimensions if DOM element not available
      const textLength = node.text.length;
      const nodeWidth = Math.min(350, Math.max(150, textLength * 10));
      const nodeHeight = 50;
      
      positions[node.id] = {
        left: node.x - nodeWidth / 2,
        top: node.y - 25,
        right: (node.x - nodeWidth / 2) + nodeWidth,
        bottom: (node.y - 25) + nodeHeight,
        width: nodeWidth,
        height: nodeHeight,
        centerX: node.x,
        centerY: node.y
      };
    }  });
  setNodePositions(positions);
}, [nodes, pan, zoom]); // Include pan and zoom as dependencies since they affect measurements

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`} 
      ref={canvasRef}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          if (mode === 'cursor' && selectionType === 'collaborator') {
            startSelection(e);
          } else {
            setSelectedNode(null);
            setSelectedNodes([]);
            startPanning(e);
          }
        }
      }}
      onMouseMove={(e) => {
        if (isSelecting) {
          updateSelection(e);
        } else {
          handlePanning(e);
        }
      }}
      onMouseUp={() => {
        if (isSelecting) {
          stopPanning(); // This already handles selection logic
        }
        setIsPanning(false);
        setIsSelecting(false);
      }}
      onMouseLeave={() => {
        setIsPanning(false);
        setIsSelecting(false);
      }}
      style={{ 
        cursor: isPanning 
          ? 'grabbing' 
          : selectedNode 
            ? 'default'
            : mode === 'cursor' && selectionType === 'collaborator'
              ? 'crosshair'
              : 'grab'
      }}
    >      {showNewMapPrompt ? (        <MindMapManager
          onCreateNew={(mapData) => {
            // Hide the new map prompt and start editing the newly created map
            setShowNewMapPrompt(false);
            // Since we're in the embedded manager (no mapId), we should create a basic mind map
            createNewMap(mapData?.title || 'Central Idea');
          }}onOpenMindMap={(mapId) => {
            // This should never be called since we're already in the MindMap view
            // But if it is, we can handle it by setting the showNewMapPrompt to false
            setShowNewMapPrompt(false);
          }}onBack={() => {
            // Use the onBack callback instead of hardcoded navigation
            if (onBack) {
              onBack();
            }
          }}
        />
      ) : (
        <>
          {/* Enhanced Professional Toolbar */}
          <MindMapToolbar
            mode={mode}
            setMode={setMode}
            selectionType={selectionType}
            setSelectionType={setSelectionType}
            selectedNodes={selectedNodes}
            addStandaloneNode={addStandaloneNode}
            deleteNodes={deleteNodes}
            historyIndex={historyIndex}
            history={history}
            undo={undo}
            redo={redo}
            onBack={onBack}
          />
          
          {/* Enhanced Search Section */}
          <MindMapSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSearchList={showSearchList}
            setShowSearchList={setShowSearchList}
            nodes={nodes}
            setSelectedNode={setSelectedNode}
            setPan={setPan}
          />

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>
                 
          {/* Wrapper for panned and zoomed content */}
          <MindMapCanvas
            pan={pan}
            zoom={zoom}
            isSelecting={isSelecting}
            selectionRect={selectionRect}
            renderNodeGroups={renderNodeGroups}
            renderConnections={renderConnections}
          >

            {/* Nodes */}
            {nodes.map(node => {
              const isNodeMatching = searchQuery ? 
                node.text.toLowerCase().includes(searchQuery.toLowerCase()) : true;
              
              // Calculate dynamic width based on text length with better handling for long words
              const textLength = node.text.length;
              const hasLongWords = node.text.split(' ').some(word => word.length > 15);
              const baseFactor = hasLongWords ? 10 : 12; // Reduce width multiplier for long words
              const nodeWidth = Math.min(400, Math.max(200, textLength * baseFactor));

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  ref={el => { nodeRefs.current[node.id] = el; }}
                  className={`absolute rounded-2xl shadow-lg cursor-move node node-text-wrap backdrop-blur-sm
                    ${selectedNodes.includes(node.id) ? 'ring-2 ring-blue-500/80 ring-offset-2 ring-offset-white/50' : ''}
                    ${draggingNodeId === node.id ? 'dragging' : ''}
                    ${node.completed ? 'border-2 border-green-400/60 bg-green-50/40' : 'border border-gray-200/60'}`}
                  style={{
                    left: node.x - nodeWidth / 2, // Center the node horizontally
                    top: node.y - 40, // Adjust vertical position for larger height
                    width: nodeWidth,
                    minHeight: 80, // Increased minimum height for better proportion
                    background: `linear-gradient(135deg, ${node.color || (isDarkMode ? '#374151' : '#ffffff')} 0%, ${adjustBrightness(node.color || (isDarkMode ? '#374151' : '#ffffff'), -3)} 100%)`,
                    boxShadow: selectedNode === node.id 
                      ? `0 20px 40px ${isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'}, 0 0 0 1px rgba(59, 130, 246, 0.5)`
                      : `0 10px 25px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
                    zIndex: selectedNode === node.id ? 50 : (searchQuery ? (isNodeMatching ? 20 : 10) : 10),
                    textAlign: 'center',
                    opacity: searchQuery ? (isNodeMatching ? 1 : 0.3) : 1,
                    position: 'relative',
                    padding: '18px 22px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                  onClick={(e) => handleNodeClick(node.id, e)}
                  onMouseDown={(e) => {
                    // Prevent moving the node if it is being edited
                    if (editingNode === node.id) return;
                    if (mode === 'cursor' && e.button === 0) {
                      e.preventDefault(); // Prevent text selection during drag

                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startNodeX = node.x;
                      const startNodeY = node.y;
                      
                      // Set dragging state for smooth animations
                      setDraggingNodeId(node.id);
                      
                      const handleMouseMove = (moveEvent) => {
                        if (isPanning) return;
                        const dx = (moveEvent.clientX - startX) / zoom;
                        const dy = (moveEvent.clientY - startY) / zoom;
                        handleNodeDrag(node.id, startNodeX + dx, startNodeY + dy);
                      };
                      
                      const handleMouseUp = () => {
                        // Clear dragging state
                        setDraggingNodeId(null);
                        // Cancel any pending animation frame
                        if (dragFrameRef.current) {
                          cancelAnimationFrame(dragFrameRef.current);
                          dragFrameRef.current = null;
                        }
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove, { passive: true });
                      document.addEventListener('mouseup', handleMouseUp, { passive: true });
                    }
                  }}
                >
                  {selectedNode === node.id && mode === 'cursor' && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-3" style={{ marginTop: '-15px' }}>
                      <div 
                        className="enhanced-node-toolbar backdrop-blur-md bg-white/90 shadow-lg border border-white/20 rounded-2xl flex items-center p-2 gap-1 z-30"
                        onMouseEnter={(e) => e.stopPropagation()}
                        onMouseLeave={(e) => e.stopPropagation()}
                        onMouseOver={(e) => e.stopPropagation()}
                        onMouseOut={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                      >
                        
                        {/* Visual Content Group */}
                        <div className="flex items-center gap-1">
                          {/* Complete Task Button - Always visible */}
                          <button
                            className={`node-toolbar-btn p-2 rounded-xl hover:bg-white/60 transition-colors duration-200 border ${node.completed ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-700 border-gray-200/60 hover:border-gray-300'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNodeCompletion(node.id);
                            }}
                            title={node.completed ? "Mark as incomplete" : "Mark as completed"}
                          >
                            <Check size={20} />
                          </button>

                          {/* Add Node Button - Only visible in collapsed state */}
                          {!isToolbarExpanded && (
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-green-100 text-green-700 transition-colors duration-200 border border-green-200 hover:border-green-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                addChildNode(node.id);
                              }}
                              title="Add connected child node"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                          )}
                          
                          {/* Settings Button */}
                          <div className="relative">
                            <button
                              className={`node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-300 transform border border-gray-200/60 hover:border-gray-300 ${isToolbarExpanded ? 'rotate-90' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsToolbarExpanded(!isToolbarExpanded);
                              }}
                              title="Settings"
                            >
                              <Settings size={16} />
                            </button>
                          </div>
                          
                          {/* Show other buttons only when expanded */}
                          {isToolbarExpanded && (
                            <>
                          
                          {/* Background Color */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showBgColorPopup: !n.showBgColorPopup, showEmojiPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                                ));
                              }}
                              title="Background color"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <path d="M3 9h18"></path>
                              </svg>
                            </button>
                            {node.showBgColorPopup && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                                <RoundColorPicker
                                  currentColor={node.color || '#FFFFFF'}
                                  onColorSelect={(color) => {
                                    wrappedSetNodes(nodes.map(n => 
                                      n.id === node.id ? { ...n, color, showBgColorPopup: false } : n
                                    ));
                                  }}
                                  onClose={() => {
                                    wrappedSetNodes(nodes.map(n => 
                                      n.id === node.id ? { ...n, showBgColorPopup: false } : n
                                    ));
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Font Color */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showFontColorPopup: !n.showFontColorPopup, showEmojiPopup: false, showBgColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                                ));
                              }}
                              title="Font color"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 20h16"></path>
                                <path d="M9 4h6l-3 9z"></path>
                              </svg>
                            </button>
                            {node.showFontColorPopup && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                                <RoundColorPicker
                                  currentColor={node.fontColor || '#000000'}
                                  onColorSelect={(color) => {
                                    wrappedSetNodes(nodes.map(n => 
                                      n.id === node.id ? { ...n, fontColor: color, showFontColorPopup: false } : n
                                    ));
                                  }}
                                  onClose={() => {
                                    wrappedSetNodes(nodes.map(n => 
                                      n.id === node.id ? { ...n, showFontColorPopup: false } : n
                                    ));
                                  }}
                                />
                              </div>
                            )}
                          </div>
                            </>
                          )}
                        </div>
                        
                        {/* Divider - only show when expanded */}
                        {isToolbarExpanded && (
                          <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                        )}
                        
                        {/* Content Management Group - only show when expanded */}
                        {isToolbarExpanded && (
                        <div className="flex items-center gap-1">
                          {/* Attachment */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showAttachmentPopup: !n.showAttachmentPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                                ));
                              }}
                              title="Add attachment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                              </svg>
                            </button>
                            {node.showAttachmentPopup && (
                              <div 
                                className="node-popup absolute top-full left-1/2 -translate-x-1/2 mt-2" 
                                style={{ minWidth: '450px', maxWidth: '500px' }} 
                                onClick={stopClickPropagation}
                              >
                                <h4>Attachments</h4>
                                
                                {/* Search filter only */}
                                <div className="mb-4">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Search by name</label>
                                  <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={attachmentFilters.search}
                                    onChange={(e) => setAttachmentFilters({
                                      ...attachmentFilters,
                                      search: e.target.value
                                    })}
                                    onClick={e => e.stopPropagation()}
                                    onMouseDown={e => e.stopPropagation()}
                                    onFocus={e => e.stopPropagation()}
                                    onKeyDown={e => e.stopPropagation()}
                                  />
                                </div>

                                {/* File uploader */}
                                <div className="mb-4">
                                  <label className="block text-xs font-medium text-gray-700 mb-2">Add new file</label>
                                  <input 
                                    type="file" 
                                    accept=".xlsx,.xls,.doc,.docx,.pdf"
                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-300 rounded-lg p-2"
                                    onChange={(e) => handleAttachment(e, node.id)}
                                    onClick={e => e.stopPropagation()}
                                    onMouseDown={e => e.stopPropagation()}
                                    onFocus={e => e.stopPropagation()}
                                    onKeyDown={e => e.stopPropagation()}
                                  />
                                </div>

                                {/* Attachment list */}
                                <div className="max-h-64 overflow-y-auto">
                                  {node.attachments && node.attachments.length > 0 ? (
                                    <div className="space-y-2">
                                      {node.attachments
                                        .filter(attachment => {
                                          const searchLower = attachmentFilters.search.toLowerCase();
                                          const nameLower = attachment.name.toLowerCase();
                                          return nameLower.includes(searchLower);
                                        })
                                        .map(attachment => (
                                          <div key={attachment.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                              <div className="text-gray-500 flex-shrink-0">
                                                {attachment.type === 'pdf' && (
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 00 2 2z" />
                                                  </svg>
                                                )}
                                                {(attachment.type === 'doc' || attachment.type === 'docx') && (
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                  </svg>
                                                )}
                                                {(attachment.type === 'xls' || attachment.type === 'xlsx') && (
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                                                  </svg>
                                                )}
                                              </div>
                                              <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-sm font-medium text-gray-900 truncate" title={attachment.name}>
                                                  {attachment.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  Added by {attachment.addedBy} on {new Date(attachment.dateAdded).toLocaleDateString()}
                                                </span>
                                              </div>
                                            </div>
                                            <button 
                                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 ml-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                wrappedSetNodes(nodes.map(n => 
                                                  n.id === node.id ? {
                                                    ...n,
                                                    attachments: n.attachments.filter(a => a.id !== attachment.id)
                                                  } : n
                                                ));
                                              }}
                                              title="Remove attachment"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 00 2 2z" />
                                      </svg>
                                      Nenhum ficheiro selecionado.
                                      <br />
                                      <span className="text-xs">Use o campo acima para adicionar ficheiros.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Notes */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showNotesPopup: !n.showNotesPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                                ));
                              }}
                              title="Add notes"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <line x1="10" y1="9" x2="8" y2="9"></line>
                              </svg>
                            </button>
                            {node.showNotesPopup && (
                              <div className="node-popup absolute top-full left-1/2 -translate-x-1/2 mt-2" onClick={stopClickPropagation}>
                                <h4>Notes</h4>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg text-sm h-32 resize-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Add notes about this node..."
                                  value={node.notes || ''}
                                  onChange={(e) => wrappedSetNodes(nodes.map(n => 
                                    n.id === node.id ? { ...n, notes: e.target.value } : n
                                  ))}
                                  onClick={e => e.stopPropagation()}
                                  onMouseDown={e => e.stopPropagation()}
                                  onFocus={e => e.stopPropagation()}
                                  onKeyDown={e => e.stopPropagation()}
                                />
                                <div className="flex justify-end mt-3">
                                  <button 
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    onClick={() => wrappedSetNodes(nodes.map(n => 
                                      n.id === node.id ? { ...n, showNotesPopup: false } : n
                                    ))}
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Tags */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showTagsPopup: !n.showTagsPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false } : n
                                ));
                              }}
                              title="Manage tags"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                              </svg>
                            </button>
                            {node.showTagsPopup && (
                              <div className="node-popup absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 max-h-96" onClick={stopClickPropagation}>
                                <h4>Manage Tags</h4>
                                
                                {/* Tags list */}
                                <div className="max-h-72 overflow-y-auto mb-3">
                                  {globalTags.map(tag => (
                                    <div key={tag.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                      <input
                                        type="checkbox"
                                        checked={Array.isArray(node.tags) && node.tags.includes(tag.id)}
                                        onChange={e => {
                                          wrappedSetNodes(nodes.map(n => {
                                            if (n.id !== node.id) return n;
                                            let newTags = Array.isArray(n.tags) ? [...n.tags] : [];
                                            if (e.target.checked) {
                                              if (!newTags.includes(tag.id)) newTags.push(tag.id);
                                            } else {
                                              newTags = newTags.filter(id => id !== tag.id);
                                            }
                                            return { ...n, tags: newTags };
                                          }));
                                        }}
                                        className="mr-2"
                                      />
                                        {editingTag && editingTag.id === tag.id ? (
                                        <>
                                          {/* Color picker for editing */}
                                          <div className="flex flex-wrap gap-1" onMouseDown={e => e.preventDefault()}>
                                            {['#DC2626', '#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777'].map(color => (
                                              <div
                                                key={color}
                                                className="w-4 h-4 rounded-full cursor-pointer hover:ring-1 hover:ring-gray-300"
                                                style={{ 
                                                  backgroundColor: color,
                                                  border: editingTag.color === color ? '2px solid #4F46E5' : '1px solid #E5E7EB'
                                                }}
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={e => {
                                                  e.preventDefault();
                                                  setEditingTag({ ...editingTag, color });
                                                }}
                                              />
                                            ))}
                                          </div>
                                          
                                          {/* Title input for editing */}
                                          <input
                                            type="text"
                                            className="flex-1 px-2 py-1 text-sm border rounded text-black"
                                            value={editingTag.title}
                                            onChange={e => setEditingTag({ ...editingTag, title: e.target.value })}
                                            onKeyDown={e => {
                                              e.stopPropagation(); // Prevent node deletion
                                              if (e.key === 'Enter') {
                                                if (editingTag.title.trim()) {
                                                  setGlobalTags(globalTags.map(t =>
                                                    t.id === tag.id
                                                      ? { ...t, title: editingTag.title, color: editingTag.color }
                                                      : t
                                                  ));
                                                }
                                                setEditingTag(null);
                                              } else if (e.key === 'Escape') {
                                                setEditingTag(null);
                                              }
                                            }}
                                            autoFocus
                                          />
                                          
                                          {/* Confirm and Cancel buttons */}
                                          <div className="flex gap-1">
                                            <button
                                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                              onClick={() => {
                                                if (editingTag.title.trim()) {
                                                  setGlobalTags(globalTags.map(t =>
                                                    t.id === tag.id
                                                      ? { ...t, title: editingTag.title, color: editingTag.color }
                                                      : t
                                                  ));
                                                }
                                                setEditingTag(null);
                                              }}
                                              title="Confirm"
                                            >
                                              ✓
                                            </button>
                                            <button
                                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                              onClick={() => setEditingTag(null)}
                                              title="Cancel"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        </>                            ): (
                                        <>
                                          <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: tag.color }}
                                          ></div>
                                          <span className="flex-1 text-sm text-gray-700">
                                            {tag.title || `Color ${globalTags.findIndex(t => t.id === tag.id) + 1}`}
                                          </span>                                <button
                                            className="p-1 hover:bg-gray-200 rounded text-black"
                                            onClick={() => setEditingTag({ ...tag })}
                                            title="Edit tag"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                            </svg>
                                          </button>
                                          <button
                                            className="p-1 hover:bg-red-200 rounded text-red-600"
                                            onClick={() => deleteTag(tag.id)}
                                            title="Delete tag"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="3 6 5 6 21 6"></polyline>
                                              <path d="M19 6l-2 14H7L5 6"></path>
                                              <path d="M10 11v6"></path>
                                              <path d="M14 11v6"></path>
                                            </svg>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                    {/* New tag creation row */}
                                  {editingTag && !editingTag.id && (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                                      <input
                                        type="checkbox"
                                        disabled
                                        className="mr-2 opacity-50"
                                      />
                                      
                                      {/* Color picker for new tag */}
                                      <div className="flex flex-wrap gap-1" onMouseDown={e => e.preventDefault()}>
                                        {['#DC2626', '#2563EB', '#7C3AED', '#059669', '#D97706', '#DB2777'].map(color => (
                                          <div
                                            key={color}
                                            className="w-4 h-4 rounded-full cursor-pointer hover:ring-1 hover:ring-gray-300"
                                            style={{ 
                                              backgroundColor: color,
                                              border: editingTag.color === color ? '2px solid #4F46E5' : '1px solid #E5E7EB'
                                            }}
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={e => {
                                              e.preventDefault();
                                              setEditingTag({ ...editingTag, color });
                                            }}
                                          />
                                        ))}
                                      </div>
                                      
                                      {/* Title input for new tag */}
                                      <input
                                        type="text"
                                        className="flex-1 px-2 py-1 text-sm border rounded text-black"
                                        value={editingTag.title}
                                        onChange={e => setEditingTag({ ...editingTag, title: e.target.value })}
                                        onKeyDown={e => {
                                          e.stopPropagation(); // Prevent node deletion
                                          if (e.key === 'Enter') {
                                            if (editingTag.title.trim()) {
                                              const newTag = {
                                                id: `tag-${Date.now()}`,
                                                title: editingTag.title,
                                                color: editingTag.color
                                              };
                                              setGlobalTags([...globalTags, newTag]);
                                            }
                                            setEditingTag(null);
                                          } else if (e.key === 'Escape') {
                                            setEditingTag(null);
                                          }
                                        }}
                                        onBlur={e => {
                                          // Check if the related target (what's being clicked) is a color picker
                                          const isColorPicker = e.relatedTarget && e.relatedTarget.closest('.flex.flex-wrap.gap-1');
                                          if (!isColorPicker) {
                                            if (editingTag.title.trim()) {
                                              const newTag = {
                                                id: `tag-${Date.now()}`,
                                                title: editingTag.title,
                                                color: editingTag.color
                                              };
                                              setGlobalTags([...globalTags, newTag]);
                                            }
                                            setEditingTag(null);
                                          }
                                        }}
                                        placeholder="Tag name..."
                                        autoFocus
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Add new tag button */}
                                {!editingTag && (
                                  <button
                                    className="w-full py-2 px-3 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 border border-indigo-200"
                                    onClick={() => setEditingTag({ id: null, title: '', color: '#3B82F6' })}
                                  >
                                    + Add New Tag
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        )}
                        
                        {/* Divider - only show when expanded */}
                        {isToolbarExpanded && (
                          <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                        )}
                        
                        {/* Project Management Group - only show when expanded */}
                        {isToolbarExpanded && (
                        <div className="flex items-center gap-1">
                          {/* Details (Priority/Status) */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showDetailsPopup: !n.showDetailsPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                                ));
                              }}
                              title="Details (Priority/Status)"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
                            </button>
                            {node.showDetailsPopup && (
                              <div className="node-popup absolute top-full left-1/2 -translate-x-1/2 mt-2" onClick={stopClickPropagation}>
                                <h4>Details</h4>
                                <div className="flex flex-col gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                                    <select 
                                      className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      value={node.priority || 'medium'}
                                      onChange={(e) => wrappedSetNodes(nodes.map(n => 
                                        n.id === node.id ? { ...n, priority: e.target.value } : n
                                      ))}
                                      onClick={e => e.stopPropagation()}
                                      onMouseDown={e => e.stopPropagation()}
                                      onFocus={e => e.stopPropagation()}
                                      onKeyDown={e => e.stopPropagation()}
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="urgent">Urgent</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                    <select 
                                      className="w-full p-2 border rounded-md text-sm text-black"
                                      value={node.status || 'not-started'}
                                      onChange={(e) => wrappedSetNodes(nodes.map(n => 
                                        n.id === node.id ? { ...n, status: e.target.value } : n
                                      ))}
                                      onClick={e => e.stopPropagation()}
                                      onMouseDown={e => e.stopPropagation()}
                                      onFocus={e => e.stopPropagation()}
                                      onKeyDown={e => e.stopPropagation()}
                                    >
                                      <option value="not-started">Not Started</option>
                                      <option value="in-progress">In Progress</option>
                                      <option value="review">Review</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                    <textarea
                                      className="w-full p-2 border rounded-md text-sm h-24 resize-none text-black"
                                      placeholder="Additional details..."
                                      value={node.description || ''}
                                      onChange={(e) => wrappedSetNodes(nodes.map(n => 
                                        n.id === node.id ? { ...n, description: e.target.value } : n
                                      ))}
                                      onClick={e => e.stopPropagation()}
                                      onMouseDown={e => e.stopPropagation()}
                                      onFocus={e => e.stopPropagation()}
                                      onKeyDown={e => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                  <button 
                                    className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                                    onClick={() => wrappedSetNodes(nodes.map(n => 
                                      n.id === node.id ? { ...n, showDetailsPopup: false } : n
                                    ))}
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Due Date */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showDatePopup: !n.showDatePopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                                ));
                              }}
                              title="Set due date"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                            </button>
                            {node.showDatePopup && (
                              <div className="node-popup absolute top-full left-1/2 -translate-x-1/2 mt-2" onClick={stopClickPropagation}>
                                <h4>Due Date</h4>
                                <div>
                                  <input
                                    type="date"
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={node.dueDate || ''}
                                    onChange={(e) => wrappedSetNodes(nodes.map(n => 
                                      n.id === node.id ? { ...n, dueDate: e.target.value } : n
                                    ))}
                                  />
                                  {node.dueDate && (
                                    <div className="mt-2 flex justify-between items-center">
                                      {(() => {
                                        const dueDate = new Date(node.dueDate);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        dueDate.setHours(0, 0, 0, 0);
                                        
                                        const diffTime = dueDate.getTime() - today.getTime();
                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        
                                        let statusText = '';
                                        let statusClass = '';
                                        
                                        if (diffDays < 0) {
                                          statusText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
                                          statusClass = 'bg-red-200 text-red-800 font-medium';
                                        } else if (diffDays === 0) {
                                          statusText = 'Due today';
                                          statusClass = 'bg-red-200 text-red-800 font-medium';
                                        } else if (diffDays <= 3) {
                                          statusText = `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                                          statusClass = 'bg-orange-200 text-orange-800 font-medium';
                                        } else {
                                          statusText = `Due in ${diffDays} days`;
                                          statusClass = 'bg-green-200 text-green-800 font-medium';
                                        }
                                        
                                        return (
                                          <span className={`px-2 py-0.5 rounded-full ${statusClass}`}>
                                            {statusText}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Collaborator */}
                          <div className="relative">
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, showCollaboratorPopup: !n.showCollaboratorPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showTagsPopup: false } : n
                                ));
                              }}
                              title="Assign collaborator"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                            </button>
                            {node.showCollaboratorPopup && (
                              <div className="node-popup absolute top-full left-1/2 -translate-x-1/2 mt-2" onClick={stopClickPropagation}>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Assign Collaborators</h4>
                                <input
                                  type="text"
                                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Search collaborators..."
                                  value={node.collaboratorSearch || ''}
                                  onChange={e => wrappedSetNodes(nodes.map(n =>
                                    n.id === node.id ? { ...n, collaboratorSearch: e.target.value } : n
                                  ))}
                                  onClick={e => e.stopPropagation()}
                                  onMouseDown={e => e.stopPropagation()}
                                  onFocus={e => e.stopPropagation()}
                                  onSelect={e => e.stopPropagation()}
                                  onKeyDown={e => e.stopPropagation()}
                                  autoFocus
                                />
                                <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                                  {collaborators.filter(c =>
                                    !node.collaboratorSearch || c.name.toLowerCase().includes(node.collaboratorSearch.toLowerCase()) || c.initials.toLowerCase().includes(node.collaboratorSearch.toLowerCase())
                                  ).map(collab => (
                                    <label key={collab.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                                      <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={Array.isArray(node.collaborators) && node.collaborators.includes(collab.id)}
                                        onChange={e => {
                                          wrappedSetNodes(nodes.map(n => {
                                            if (n.id !== node.id) return n;
                                            let newCollabs = Array.isArray(n.collaborators) ? [...n.collaborators] : [];
                                            if (e.target.checked) {
                                              if (!newCollabs.includes(collab.id)) newCollabs.push(collab.id);
                                            } else {
                                              newCollabs = newCollabs.filter(id => id !== collab.id);
                                            }
                                            return { ...n, collaborators: newCollabs };
                                          }));
                                        }}
                                      />
                                      <span 
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm" 
                                        style={{ backgroundColor: collab.color }}
                                      >
                                        {collab.initials}
                                      </span>
                                      <span className="text-sm font-medium text-gray-700">{collab.name}</span>
                                    </label>
                                  ))}
                                </div>
                                <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                                  <button
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                    onClick={() => {
                                      wrappedSetNodes(nodes.map(n => 
                                        n.id === node.id ? { ...n, showCollaboratorPopup: false } : n
                                      ));
                                    }}
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        )}
                        
                        {/* Divider - only show when expanded */}
                        {isToolbarExpanded && (
                          <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                        )}
                        
                        {/* Action Group - only show when expanded */}
                        {isToolbarExpanded && (
                        <div className="flex items-center gap-1">
                          {/* Add Node */}
                          <button
                            className="node-toolbar-btn p-2 rounded-xl hover:bg-green-100 text-green-700 transition-colors duration-200 border border-green-200 hover:border-green-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              addChildNode(node.id);
                            }}
                            title="Add connected child node"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          
                          {/* Layout Button (Root only) */}
                          {node.id === 'root' && (
                            <div className="relative">
                              <button
                                className="node-toolbar-btn p-2 rounded-xl hover:bg-blue-100 text-blue-700 transition-colors duration-200 border border-blue-200 hover:border-blue-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  wrappedSetNodes(nodes.map(n => 
                                    n.id === node.id ? { ...n, showLayoutPopup: !n.showLayoutPopup } : n
                                  ));
                                }}
                                title="Change layout"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="3" y1="9" x2="21" y2="9"></line>
                                  <line x1="9" y1="21" x2="9" y2="9"></line>
                                </svg>
                              </button>
                              {node.showLayoutPopup && (
                                <div className="node-popup absolute top-full left-1/2 -translate-x-1/2 mt-2" onClick={stopClickPropagation}>
                                  <h4>Choose Layout</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {layoutOptions.map(layout => (
                                      <button
                                        key={layout.id}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-sm"
                                        onClick={() => {
                                          applyLayout(node.id, layout.id);
                                          wrappedSetNodes(nodes.map(n => 
                                            n.id === node.id ? { ...n, showLayoutPopup: false } : n
                                          ));
                                        }}
                                      >
                                        <span className="text-gray-500">
                                          <i className={`lucide lucide-${layout.icon}`}></i>
                                        </span>
                                        {layout.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Delete Node */}
                          {node.id !== 'root' && (
                            <button
                              className="node-toolbar-btn p-2 rounded-xl hover:bg-red-100 text-red-600 transition-colors duration-200 border border-red-200 hover:border-red-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNode(node.id);
                              }}
                              title="Delete this node"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6l-2 14H7L5 6"></path>
                                <path d="M10 11v6"></path>
                                <path d="M14 11v6"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                        )}
                        
                      </div>
                    </div>
                  )}
                  
                  {/* Collaborator avatars on node (OUTSIDE, close to node) */}
                  {Array.isArray(node.collaborators) && node.collaborators.length > 0 && (
                    <div
                      className="flex gap-1 z-10"
                      style={{
                        position: 'absolute',
                        top: '-18px', // 18px above the node content
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none',
                      }}
                    >
                      {node.collaborators.map(cid => {
                        const collab = collaborators.find(c => c.id === cid);
                        if (!collab) return null;
                        return (
                          <span key={cid} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow" style={{ backgroundColor: collab.color, color: 'white' }} title={collab.name}>
                            {collab.initials}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Professional Node Content */}
                  <div className={`flex flex-col items-center justify-center gap-2 h-full min-h-[48px] ${node.completed ? 'opacity-75' : ''}`}>
                    {/* Completion indicator */}
                    {node.completed && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-green-400">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    
                    {/* Progress indicator for parent nodes */}
                    {(() => {
                      const progress = getNodeProgress(node.id);
                      if (!progress || node.completed) return null; // Don't show progress if node itself is completed
                      
                      return (
                        <div 
                          className="absolute -top-2 -left-2 flex items-center justify-center" 
                          title={`Total Progress: ${progress.completed}/${progress.total} tasks completed (${progress.percentage}%)${progress.depth > 0 ? ` - ${progress.depth + 1} levels deep` : ''}`}
                        >
                          {/* Simple clean badge */}
                          <div className={`
                            px-1.5 py-0.5 rounded-md text-xs font-medium shadow-sm transition-all duration-200
                            ${progress.percentage === 100 
                              ? isDarkMode ? 'bg-green-600/90 text-green-100 border border-green-500/50' : 'bg-green-100 text-green-700 border border-green-200'
                              : progress.percentage >= 50 
                                ? isDarkMode ? 'bg-blue-600/90 text-blue-100 border border-blue-500/50' : 'bg-blue-100 text-blue-700 border border-blue-200'
                                : isDarkMode ? 'bg-orange-600/90 text-orange-100 border border-orange-500/50' : 'bg-orange-100 text-orange-700 border border-orange-200'
                            }
                          `}>
                            {progress.completed}/{progress.total}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {/* Display emoji if present */}
                    {node.emoji && (
                      <div className="text-lg leading-none" style={{ fontSize: '18px' }}>{node.emoji}</div>
                    )}
                    
                    {/* Tags display - show as colored rectangles */}
                    {Array.isArray(node.tags) && node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1 justify-center max-w-full">
                        {node.tags.map(tagId => {
                          const tag = globalTags.find(t => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <div
                              key={tagId}
                              className="px-1.5 py-0.5 rounded text-xs font-medium truncate min-w-0 flex-shrink"
                              style={{
                                backgroundColor: tag.color,
                                color: '#ffffff',
                                fontSize: '10px',
                                maxWidth: '60px'
                              }}
                              title={tag.title}
                            >
                              {tag.title || `Tag ${tagId}`}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Node text with improved typography */}
                    {selectedNode === node.id && mode === 'cursor' ? (
                      editingNode === node.id ? (
                        <textarea
                          value={node.text}
                          onChange={(e) => updateNodeText(node.id, e.target.value)}
                          placeholder="Please introduce your task"
                          className="bg-transparent outline-none w-full text-left resize-none overflow-hidden font-medium leading-snug"
                          style={{ 
                            color: node.text ? (node.fontColor || (isDarkMode ? '#f3f4f6' : '#2d3748')) : (isDarkMode ? '#9ca3af' : '#6b7280'),
                            fontSize: '14px',
                            fontWeight: '500',
                            lineHeight: '1.4',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            minHeight: '40px'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => {
                            setIsEditing(true);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.max(40, e.target.scrollHeight)}px`;
                          }}
                          onBlur={() => {
                            setEditingNode(null);
                            setIsEditing(false);
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            // Allow Enter key to create new lines
                            if (e.key === 'Enter' && !e.shiftKey) {
                              // Don't prevent default, allow new line
                            }
                          }}
                          autoFocus
                          rows={2}
                          onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.max(40, e.target.scrollHeight)}px`;
                          }}
                        />
                      ) : (
                        <div 
                          className="w-full text-left cursor-text font-medium leading-snug px-1"
                          style={{ 
                            color: node.text ? (node.fontColor || (isDarkMode ? '#f3f4f6' : '#2d3748')) : (isDarkMode ? '#9ca3af' : '#6b7280'),
                            fontSize: '14px',
                            fontWeight: '500',
                            lineHeight: '1.4',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            opacity: node.completed ? 0.7 : 1,
                            minHeight: '20px'
                          }}
                        >
                          {node.text || 'Please introduce your task'}
                        </div>
                      )
                    ) : (
                      <div 
                        className="font-medium text-left leading-snug px-1"
                        style={{ 
                          color: node.text ? (node.fontColor || (isDarkMode ? '#f3f4f6' : '#2d3748')) : (isDarkMode ? '#9ca3af' : '#6b7280'),
                          fontSize: '14px',
                          fontWeight: '500',
                          lineHeight: '1.4',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          minHeight: '20px'
                        }}
                      >
                        {node.text || 'Please introduce your task'}
                      </div>
                    )}

                    {/* Note indicator */}
                    {node.notes && node.notes.trim() && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-blue-600 transition-colors"
                           style={{ zIndex: -1 }}
                           onClick={(e) => {
                             e.stopPropagation();
                             wrappedSetNodes(nodes.map(n => 
                               n.id === node.id ? { ...n, showNotesPopup: !n.showNotesPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                             ));
                           }}
                           title="View notes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                      </div>
                    )}

                    {/* Node metadata - Priority and Status indicators */}
                    {(node.priority || node.status) && (
                      <div className="flex items-center gap-1 mt-1">
                        {node.priority && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            node.priority === 'high' ? 'bg-red-50 text-red-600' :
                            node.priority === 'medium' ? 'bg-green-50 text-green-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {node.priority}
                          </span>
                        )}
                        {node.status && node.status !== 'todo' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                            {node.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </MindMapCanvas>
          
          {/* Collaborator selection dialog */}
          <CollaboratorDialog
            showCollaboratorDialog={showCollaboratorDialog}
            setShowCollaboratorDialog={setShowCollaboratorDialog}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            collaborators={collaborators}
            assignCollaborator={assignCollaborator}
          />
        </>
      )}
    </div>
  );
};

export default MindMap;
