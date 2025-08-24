const GROUP_HIT_INSET = 12;   // inset for hit-testing: near-edge drops count as outside
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Link, Settings, Trash2, Check, Moon, Sun } from 'lucide-react';
import MindMapManager from './MindMapManager';
import RoundColorPicker from './RoundColorPicker';
import MindMapToolbar from './mindmap/MindMapToolbar';
import MindMapSearchBar from './mindmap/MindMapSearchBar';
import CollaboratorDialog from './mindmap/CollaboratorDialog';
import MindMapCanvas from './mindmap/MindMapCanvas';
import { COLLAB_PAGE_SIZE } from './mindmap/constants';

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
  // UI: open group menu id (for collaborator group badge menu)
  const [openGroupMenuId, setOpenGroupMenuId] = useState(null);
  const [groupCollaboratorSearch, setGroupCollaboratorSearch] = useState({}); // { [groupId]: string }
  const [groupCollaboratorPage, setGroupCollaboratorPage] = useState({}); // { [groupId]: number }
  // Overlay UI scale to improve readability independent of canvas zoom
  const [overlayUiScale, setOverlayUiScale] = useState(() => {
    try {
      const v = window.localStorage.getItem('overlayUiScale');
      const n = v ? parseFloat(v) : NaN;
      return Number.isFinite(n) && n > 0 ? n : 1.4;
    } catch {
      return 1.4;
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem('overlayUiScale', String(overlayUiScale)); } catch {}
  }, [overlayUiScale]);

  // Close group menu on any outside click
  useEffect(() => {
    const onWinClick = () => setOpenGroupMenuId(null);
    window.addEventListener('click', onWinClick);
    return () => window.removeEventListener('click', onWinClick);
  }, []);
  const [lastSelectionRect, setLastSelectionRect] = useState(null);
  
  // Dragging state for smooth animations
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragFrameRef = useRef(null);
  const lastDragPosRef = useRef({}); // { [nodeId]: { x, y } }
  
  // Shapes panel state
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [draggedShapeType, setDraggedShapeType] = useState(null);
  const [shapes, setShapes] = useState([]);
  
  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);

  // Shape definitions with different colors
  const shapeDefinitions = [
    { type: 'circle', name: 'Circle', color: '#3B82F6', icon: '○' },
    { type: 'hexagon', name: 'Hexagon', color: '#10B981', icon: '⬢' },
    { type: 'rhombus', name: 'Rhombus', color: '#F59E0B', icon: '♦' },
    { type: 'pentagon', name: 'Pentagon', color: '#EF4444', icon: '⬟' },
    { type: 'ellipse', name: 'Ellipse', color: '#8B5CF6', icon: '⬮' },
    { type: 'connector', name: 'Connector', color: '#6B7280', icon: '→' }
  ];
  
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
  };

  // Shape handling functions
  const handleShapeDragStart = (e, shapeType) => {
    console.log('Starting drag for shape:', shapeType);
    e.dataTransfer.setData('text/plain', shapeType);
    e.dataTransfer.effectAllowed = 'copy';
    setIsDraggingShape(true);
    setDraggedShapeType(shapeType);
  };

  const handleShapeDrop = (e) => {
    e.preventDefault();
    
    const shapeType = e.dataTransfer.getData('text/plain');
    if (!shapeType) {
      console.log('Drop rejected: no shape type in data transfer');
      return;
    }
    
    console.log('Shape drop detected:', shapeType);
    
    // Calculate coordinates in logical space (matching how node dragging works)
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Mouse position relative to the container
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    // Convert screen coordinates to logical coordinates
    // This matches the node dragging logic: divide by zoom to get logical coordinates
    // Then account for the current pan offset to get the absolute logical position
    const x = (screenX / zoom) - (pan.x / zoom);
    const y = (screenY / zoom) - (pan.y / zoom);
    
    console.log('Drop coordinates:', { 
      clientX: e.clientX, 
      clientY: e.clientY, 
      rectLeft: rect.left, 
      rectTop: rect.top,
      screenX, 
      screenY, 
      pan, 
      zoom, 
      finalX: x, 
      finalY: y 
    });
    
    const shapeDefinition = shapeDefinitions.find(s => s.type === shapeType);
    if (!shapeDefinition) {
      console.log('Shape definition not found for type:', shapeType);
      return;
    }
    
    // Create a new node with the shape properties
    const newNode = {
      id: `node-${Date.now()}`,
      text: `${shapeDefinition.name} Node`, // More descriptive initial text
      x: x,
      y: y,
      type: 'shape',
      shapeType: shapeType,
      backgroundColor: shapeDefinition.color,
      fontColor: '#ffffff', // White text works well on colored shape backgrounds
      completed: false,
      children: [],
      level: 0,
      width: 120,
      height: 80,
      notes: '', // Add notes field
      tags: [] // Add tags field
    };
    
    console.log('Creating new shape node:', newNode);
    
    // Add the new node to the nodes array
    setNodes(prevNodes => {
      const newNodes = [...prevNodes, newNode];
      console.log('Updated nodes array with shape:', newNodes);
      return newNodes;
    });
    
    setIsDraggingShape(false);
    setDraggedShapeType(null);
  };

  const handleShapeDragOver = (e) => {
    if (isDraggingShape) {
      e.preventDefault(); // This is crucial for allowing drop
      e.dataTransfer.dropEffect = "copy";
    }
  };

  // Connection handling functions
  const startConnection = (nodeId, event) => {
    event.stopPropagation();
    setIsConnecting(true);
    setConnectionStart(nodeId);
    
    const startNode = nodes.find(n => n.id === nodeId);
    if (startNode) {
      setTempConnection({
        start: { x: startNode.x, y: startNode.y },
        end: { x: event.clientX, y: event.clientY }
      });
    }
  };

  const updateTempConnection = (event) => {
    if (isConnecting && connectionStart && tempConnection) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left - pan.x) / zoom;
      const y = (event.clientY - rect.top - pan.y) / zoom;
      
      setTempConnection(prev => ({
        ...prev,
        end: { x, y }
      }));
    }
  };

  const finishConnection = (targetNodeId) => {
    if (isConnecting && connectionStart && targetNodeId !== connectionStart) {
      const newConnection = {
        id: `connection-${Date.now()}`,
        start: connectionStart,
        end: targetNodeId,
        type: 'connector'
      };
      
      setConnections(prev => [...prev, newConnection]);
    }
    
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnection(null);
  };

  const cancelConnection = () => {
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnection(null);
  };

  const renderShape = (shape) => {
    console.log('Rendering shape:', shape);
    if (!shape || !shape.type) return null;
    
    const { type, x, y, width, height, color, id } = shape;
    
    try {
      switch (type) {
        case 'circle':
          return (
            <circle
              key={id}
              cx={x + width/2}
              cy={y + height/2}
              r={width/2}
              fill={color}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-move"
            />
          );
        case 'hexagon':
          const hexPoints = [
            [x + width/2, y],
            [x + width*0.87, y + height*0.25],
            [x + width*0.87, y + height*0.75],
            [x + width/2, y + height],
            [x + width*0.13, y + height*0.75],
            [x + width*0.13, y + height*0.25]
          ].map(point => point.join(',')).join(' ');
          return (
            <polygon
              key={id}
              points={hexPoints}
              fill={color}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-move"
            />
          );
        case 'rhombus':
          const rhombusPoints = [
            [x + width/2, y],
            [x + width, y + height/2],
            [x + width/2, y + height],
            [x, y + height/2]
          ].map(point => point.join(',')).join(' ');
          return (
            <polygon
              key={id}
              points={rhombusPoints}
              fill={color}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-move"
            />
          );
        case 'pentagon':
          const pentagonPoints = [
            [x + width/2, y],
            [x + width*0.95, y + height*0.35],
            [x + width*0.79, y + height],
            [x + width*0.21, y + height],
            [x + width*0.05, y + height*0.35]
          ].map(point => point.join(',')).join(' ');
          return (
            <polygon
              key={id}
              points={pentagonPoints}
              fill={color}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-move"
            />
          );
        case 'ellipse':
          return (
            <ellipse
              key={id}
              cx={x + width/2}
              cy={y + height/2}
              rx={width/2}
              ry={height/3}
              fill={color}
              stroke="#fff"
              strokeWidth="2"
              className="cursor-move"
            />
          );
        case 'connector':
          return (
            <g key={id}>
              <line
                x1={x}
                y1={y + height/2}
                x2={x + width}
                y2={y + height/2}
                stroke={color}
                strokeWidth="3"
                className="cursor-move"
              />
              <polygon
                points={`${x + width},${y + height/2 - 5} ${x + width + 8},${y + height/2} ${x + width},${y + height/2 + 5}`}
                fill={color}
              />
            </g>
          );
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering shape:', error);
      return null;
    }
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
      if (selectionType === 'collaborator') {
        // Always open collaborator dialog, even if no nodes were selected
        setSelectedNodes(selectedIds);
        setLastSelectionRect(selectionRect);
        setShowCollaboratorDialog(true);
      } else if (selectedIds.length > 0) {
        // In simple mode, only update selection if there are nodes
        setSelectedNodes(selectedIds);
      }
    }
    setIsSelecting(false);
    setSelectionRect(null);
    setIsPanning(false);
  };
  
  // Collaborator selection mode
  const [selectionType, setSelectionType] = useState('simple'); // 'simple' or 'collaborator'

  // Constants for group bounding box sizing
  const NODE_HALF_WIDTH = 75;   // approx node half width used in hit/bounds
  const NODE_HALF_HEIGHT = 25;  // approx node half height used in hit/bounds
  const GROUP_PADDING = 20;     // padding around nodes inside a group
  const MIN_GROUP_WIDTH = 520;  // minimum group width to keep drop target usable
  const MIN_GROUP_HEIGHT = 530; // minimum group height to keep drop target usable

  // Compute a tight bounding box around given nodes with padding and enforce minimum size.
  // If fewer than 1 node is provided, return null and let caller decide.
  const computeGroupBoundingBox = (groupNodes) => {
    if (!Array.isArray(groupNodes) || groupNodes.length === 0) return null;
    const minX = Math.min(...groupNodes.map(n => n.x - NODE_HALF_WIDTH));
    const maxX = Math.max(...groupNodes.map(n => n.x + NODE_HALF_WIDTH));
    const minY = Math.min(...groupNodes.map(n => n.y - NODE_HALF_HEIGHT));
    const maxY = Math.max(...groupNodes.map(n => n.y + NODE_HALF_HEIGHT));

    const rawX = minX - GROUP_PADDING;
    const rawY = minY - GROUP_PADDING;
    const rawW = (maxX - minX) + GROUP_PADDING * 2;
    const rawH = (maxY - minY) + GROUP_PADDING * 2;

    // Enforce minimum size by expanding from center
    const centerX = rawX + rawW / 2;
    const centerY = rawY + rawH / 2;
    const width = Math.max(MIN_GROUP_WIDTH, rawW);
    const height = Math.max(MIN_GROUP_HEIGHT, rawH);
    const x = centerX - width / 2;
    const y = centerY - height / 2;

    return { x, y, width, height };
  };

  // Build a bounding box from a selection rectangle with minimum size enforcement
  const bboxFromSelectionRect = (rect) => {
    if (!rect) return null;
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const width = Math.max(MIN_GROUP_WIDTH, rect.width);
    const height = Math.max(MIN_GROUP_HEIGHT, rect.height);
    const x = centerX - width / 2;
    const y = centerY - height / 2;
    return { x, y, width, height };
  };

  // Assigning collaborator to selected nodes
  const assignCollaborator = (collaborator) => {
    // Create a new group with the selected nodes and collaborator
    const newGroup = {
      id: `group-${Date.now()}`,
      nodeIds: [...selectedNodes],
      collaborator
    };

  // Compute bounding box from nodes if any; otherwise use the selection rectangle with min size
  const groupNodes = nodes.filter(node => selectedNodes.includes(node.id));
  let bbox = computeGroupBoundingBox(groupNodes);
  if (!bbox) {
    bbox = bboxFromSelectionRect(lastSelectionRect);
  }
  if (bbox) newGroup.boundingBox = bbox;

    // Add the new group
    setNodeGroups([...nodeGroups, newGroup]);
    // Seed nodes with primary collaborator
    const updatedNodes = nodes.map(n => {
      if (!newGroup.nodeIds?.includes(n.id)) return n;
      const current = Array.isArray(n.collaborators) ? [...n.collaborators] : [];
      if (current.includes(collaborator.id)) return n;
      return { ...n, collaborators: [...current, collaborator.id] };
    });
    wrappedSetNodes(updatedNodes);
    
    // Reset selection state
    setSelectedNodes([]);
    setShowCollaboratorDialog(false);
    setLastSelectionRect(null); // Clear after use

    // Switch back to simple selection mode
    setMode('cursor');
    setSelectionType('simple');
  };

  // Group management helpers
  const deleteGroup = (groupId) => {
    setNodeGroups(nodeGroups.filter(g => g.id !== groupId));
  };

  const toggleCollaboratorInGroup = (groupId, collaboratorId) => {
    const group = nodeGroups.find(g => g.id === groupId);
    if (!group) return;
    // Don't toggle the primary via checkbox
    if (group.collaborator && group.collaborator.id === collaboratorId) return;

    const has = Array.isArray(group.extraCollaborators) ? group.extraCollaborators.includes(collaboratorId) : false;

    // Update groups state
    setNodeGroups(nodeGroups.map(g => {
      if (g.id !== groupId) return g;
      const extra = Array.isArray(g.extraCollaborators) ? [...g.extraCollaborators] : [];
      return { ...g, extraCollaborators: has ? extra.filter(id => id !== collaboratorId) : [...extra, collaboratorId] };
    }));

    // Also reflect on nodes: add/remove collaborator on each node in group
    const updatedNodes = nodes.map(n => {
      if (!group.nodeIds?.includes(n.id)) return n;
      const current = Array.isArray(n.collaborators) ? [...n.collaborators] : [];
      if (has) {
        // Remove
        const next = current.filter(id => id !== collaboratorId);
        return { ...n, collaborators: next };
      } else {
        // Add if missing
        if (current.includes(collaboratorId)) return n;
        return { ...n, collaborators: [...current, collaboratorId] };
      }
    });
    wrappedSetNodes(updatedNodes);
  };

  const setPrimaryCollaborator = (groupId, collaborator) => {
    const group = nodeGroups.find(g => g.id === groupId);
    if (!group) return;
    setNodeGroups(nodeGroups.map(g => g.id === groupId ? { ...g, collaborator } : g));
    // Ensure all group nodes include the new primary collaborator
    const updatedNodes = nodes.map(n => {
      if (!group.nodeIds?.includes(n.id)) return n;
      const current = Array.isArray(n.collaborators) ? [...n.collaborators] : [];
      if (current.includes(collaborator.id)) return n;
      return { ...n, collaborators: [...current, collaborator.id] };
    });
    wrappedSetNodes(updatedNodes);
  };

  const selectGroupNodes = (groupId) => {
    const group = nodeGroups.find(g => g.id === groupId);
    if (!group) return;
    setSelectedNodes(group.nodeIds || []);
  };
    // Create a new mind map
  const createNewMap = (title = 'Central Idea') => {
    const rootNode = {
      id: 'root',
      text: title,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: isDarkMode ? '#374151' : '#EEF2FF',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748'
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
      color: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748'
    };
    
    wrappedSetNodesAndConnections([...nodes, newNode], connections);
    setSelectedNode(newId);
  };
  // Update the addChildNode function to be atomic and avoid stacking on rapid clicks
  const addChildNode = (parentId) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

  // Constants
  const H_OFFSET_FROM_PARENT_RIGHT = 140; // child center is 140px to the right of parent's right edge
    const VERTICAL_SPACING = 120;
    const MIN_DISTANCE = 130;

    // We'll compute connection and node in a single functional update chain to avoid stale state
    const newId = `node-${Date.now()}`;
    const newConnId = `conn-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    let computedNode = null;

    setConnections(prevConns => {
      // Determine the order based on up-to-date connections
      const currentChildCount = prevConns.filter(c => c.from === parentId).length;

  // Compute base X using measured canvas-local width for the parent to be robust to zoom/pan
  const parentPos = nodePositions[parentId];
  const parentHalfW = parentPos ? parentPos.width / 2 : 200; // fallback to half of default width
  const baseX = parent.x + parentHalfW + H_OFFSET_FROM_PARENT_RIGHT; // same for all siblings

  // Always use the parent's current Y as the anchor; children stack below
  const orderIndex = currentChildCount; // 0-based index for the new child
  const anchorY = parent.y;
  const targetY = anchorY + (orderIndex * VERTICAL_SPACING);

      let newX = baseX;
      let newY = targetY;

  // Collision check against existing nodes (prev snapshot), independent of pan/zoom
      const isValid = (x, y, prevNodes) => {
        for (const existingNode of prevNodes) {
          const dx = x - existingNode.x;
          const dy = y - existingNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < MIN_DISTANCE) return false;
        }
        return true;
      };

      // Use current nodes snapshot for collision checks
      const prevNodesSnapshot = nodes; // acceptable for collision purposes

      const MAX_ATTEMPTS = 24;
      let attempts = 0;
      let horizNudge = 0;
      while (!isValid(newX, newY, prevNodesSnapshot) && attempts < MAX_ATTEMPTS) {
        // Only nudge downward so siblings always follow below the first
        const step = 24 * (attempts + 1);
        newY = targetY + step;
        if (attempts > 0 && attempts % 5 === 0) horizNudge += 30;
        newX = baseX + horizNudge;
        attempts++;
      }

  // No viewport clamping: positions are in canvas coordinates and should not depend on pan/zoom

      computedNode = {
        id: newId,
        text: '',
        x: newX,
        y: newY,
        color: isDarkMode ? '#374151' : '#ffffff',
        fontColor: isDarkMode ? '#f3f4f6' : '#2d3748',
        _justAdded: true
      };

      return [...prevConns, { id: newConnId, from: parentId, to: newId }];
    });

    setNodes(prevNodes => {
      // Append the node computed above; fallback if missing
      const nodeToAdd = computedNode || {
        id: newId,
        text: '',
        x: parent.x + 240,
        y: parent.y,
        color: isDarkMode ? '#374151' : '#ffffff',
        fontColor: isDarkMode ? '#f3f4f6' : '#2d3748',
        _justAdded: true
      };
      return [...prevNodes, nodeToAdd];
    });

    // Save history after both setters (best-effort, matches existing wrappers behavior)
    saveToHistory();
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

  // Track last drag position for drop detection
  lastDragPosRef.current[nodeId] = { x: newX, y: newY };

  const dx = newX - targetNode.x;
    const dy = newY - targetNode.y;

  if (selectedNodes.includes(nodeId)) {
      // Move all selected nodes by the same displacement, but constrain each one individually
      wrappedSetNodes(nodes.map(node => {
        if (selectedNodes.includes(node.id)) {
          let finalX = node.x + dx;
          let finalY = node.y + dy;
          
          return {
            ...node,
            x: finalX,
            y: finalY
          };
        }
        return node;
      }));
  
  // Do not resize groups while dragging; groups remain fixed after creation
    } else {
      // Move only the single node with constraints already applied
      wrappedSetNodes(nodes.map(node => 
        node.id === nodeId ? { ...node, x: newX, y: newY } : node
      ));
      
  // Do not resize groups while dragging; groups remain fixed after creation
    }
    }); // Close requestAnimationFrame
  };
  
  // Helper function to update group bounding boxes
  const updateGroupBoundingBoxes = (affectedNodeIds, dx, dy) => {
    // Deprecated: now groups auto-resize; kept for backward compatibility
    recalcGroupsForNodes(affectedNodeIds);
  };

  // Recalculate bounding boxes for any groups containing the given nodes
  const recalcGroupsForNodes = (affectedNodeIds) => {
    if (!Array.isArray(affectedNodeIds) || affectedNodeIds.length === 0) return;
    setNodeGroups(prev => prev.map(group => {
      const intersects = group.nodeIds.some(id => affectedNodeIds.includes(id));
      if (!intersects) return group;
      const groupNodes = nodes.filter(n => group.nodeIds.includes(n.id));
      if (groupNodes.length === 0) return group;
      const boundingBox = computeGroupBoundingBox(groupNodes);
      return { ...group, boundingBox };
    }));
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
  const bbox = computeGroupBoundingBox(groupNodes);
  if (bbox) group.boundingBox = bbox;
      
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
  const bbox = computeGroupBoundingBox(groupNodes);
  if (bbox) group.boundingBox = bbox;
      
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
      const badgeSize = 30;
      const badgeOffset = 15;

  return (
        <React.Fragment key={group.id}>
          {/* Non-interactive dashed area */}
          <div style={{
            position: 'absolute',
            left: boundingBox.x,
            top: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
            border: `3px dashed ${collaborator.color}`,
            borderRadius: '12px',
            backgroundColor: `${collaborator.color}10`,
            pointerEvents: 'none',
            zIndex: 4,
            boxShadow: `0 0 0 1px ${collaborator.color}20`
          }} />

          {/* Clickable primary avatar (outside pointer-events:none box) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: boundingBox.x + boundingBox.width - badgeOffset,
              top: boundingBox.y - badgeOffset,
              width: badgeSize,
              height: badgeSize,
              borderRadius: '50%',
              backgroundColor: collaborator.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '2px solid white',
              cursor: 'pointer',
              zIndex: 6,
              pointerEvents: 'auto'
            }}
            title={`${collaborator.name}'s group settings`}
          >
            {collaborator.initials}
          </div>

          {/* Secondary collaborator avatars (shared group) */}
          {Array.isArray(group.extraCollaborators) && group.extraCollaborators.length > 0 && (
            (() => {
              const smallSize = 22;
              const gap = 6;
              const maxShown = 3;
              const extraObjs = group.extraCollaborators
                .map(id => collaborators.find(c => c.id === id))
                .filter(Boolean);
              const shown = extraObjs.slice(0, maxShown);
              const remaining = extraObjs.length - shown.length;
              return (
                <React.Fragment>
                  {shown.map((c, idx) => (
                    <div
                      key={c.id}
                      onClick={(e) => { e.stopPropagation(); setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      title={`${c.name}'s group settings`}
                      style={{
                        position: 'absolute',
                        left: (boundingBox.x + boundingBox.width - badgeOffset) - ((idx + 1) * (smallSize + gap)),
                        top: boundingBox.y - badgeOffset + (badgeSize - smallSize) / 2,
                        width: smallSize,
                        height: smallSize,
                        borderRadius: '50%',
                        backgroundColor: c.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.65rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        border: '2px solid white',
                        cursor: 'pointer',
                        zIndex: 6,
                        pointerEvents: 'auto'
                      }}
                    >
                      {c.initials}
                    </div>
                  ))}
                  {remaining > 0 && (
                    <div
                      onClick={(e) => { e.stopPropagation(); setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      title={`+${remaining} more`}
                      style={{
                        position: 'absolute',
                        left: (boundingBox.x + boundingBox.width - badgeOffset) - ((shown.length + 1) * (smallSize + gap)),
                        top: boundingBox.y - badgeOffset + (badgeSize - smallSize) / 2,
                        width: smallSize,
                        height: smallSize,
                        borderRadius: '50%',
                        backgroundColor: '#6B7280',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        border: '2px solid white',
                        cursor: 'pointer',
                        zIndex: 6,
                        pointerEvents: 'auto'
                      }}
                    >
                      +{remaining}
                    </div>
                  )}
                </React.Fragment>
              );
            })()
          )}

          {/* Popup menu for group actions (also outside) */}
          {openGroupMenuId === group.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: boundingBox.x + boundingBox.width + 10,
                top: boundingBox.y - badgeOffset,
                // Responsive width that scales with viewport
                width: 'clamp(260px, 26vw, 360px)',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                padding: 12,
                zIndex: 7,
                pointerEvents: 'auto',
                // Counteract canvas zoom and apply user overlay scale so popup remains readable
                transform: `scale(${(overlayUiScale || 1) / (zoom || 1)})`,
                transformOrigin: 'top left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '9999px',
                    backgroundColor: collaborator.color, color: '#fff', fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}>
                    {collaborator.initials}
                  </span>
                  <div style={{ fontSize: 12, color: '#111827', fontWeight: 600 }}>
                    {collaborator.name}'s Group
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setOverlayUiScale(s => Math.max(0.8, Math.round((s - 0.1) * 10) / 10))}
                    title="Decrease popup size"
                    style={{ fontSize: 12, color: '#374151' }}
                  >A-</button>
                  <button
                    onClick={() => setOverlayUiScale(s => Math.min(2.0, Math.round((s + 0.1) * 10) / 10))}
                    title="Increase popup size"
                    style={{ fontSize: 12, color: '#111827' }}
                  >A+</button>
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <button
                  onClick={() => { selectGroupNodes(group.id); setOpenGroupMenuId(null); }}
                  style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 12, fontWeight: 600, color: '#111827' }}
                >
                  Select nodes
                </button>
                <button
                  onClick={() => { deleteGroup(group.id); setOpenGroupMenuId(null); }}
                  style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #FEE2E2', background: '#FEF2F2', fontSize: 12, fontWeight: 600, color: '#B91C1C' }}
                >
                  Delete group
                </button>
              </div>

              {/* Add/Remove collaborators */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', margin: '6px 0' }}>Collaborators</div>
              <div style={{ marginBottom: 8 }}>
                <input
                  className="text-gray-900 placeholder-gray-500"
                  value={groupCollaboratorSearch[group.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGroupCollaboratorSearch(prev => ({ ...prev, [group.id]: val }));
                    setGroupCollaboratorPage(prev => ({ ...prev, [group.id]: 1 }));
                  }}
                  placeholder="Search collaborators"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    color: '#111827',
                    fontSize: 12,
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ maxHeight: 200, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(() => {
                  const q = (groupCollaboratorSearch[group.id] || '').toLowerCase().trim();
                  const filtered = q
                    ? collaborators.filter(c =>
                        c.name.toLowerCase().includes(q) ||
                        (c.initials || '').toLowerCase().includes(q)
                      )
                    : collaborators;

                  const pageSize = COLLAB_PAGE_SIZE;
                  const page = Math.max(1, groupCollaboratorPage[group.id] || 1);
                  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
                  const currentPage = Math.min(page, totalPages);
                  const start = (currentPage - 1) * pageSize;
                  const pageItems = filtered.slice(start, start + pageSize);

                  const list = pageItems.map(c => {
                    const isPrimary = c.id === collaborator.id;
                    const isChecked = isPrimary || (Array.isArray(group.extraCollaborators) ? group.extraCollaborators.includes(c.id) : false);
                    return (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isPrimary}
                          onChange={() => toggleCollaboratorInGroup(group.id, c.id)}
                        />
                        <span style={{ width: 22, height: 22, borderRadius: '9999px', background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{c.initials}</span>
                        <span style={{ fontSize: 12, color: '#111827' }}>{c.name}</span>
                        {isPrimary ? (
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6B7280' }}>Primary</span>
                        ) : (
                          <button
                            onClick={() => setPrimaryCollaborator(group.id, c)}
                            style={{ marginLeft: 'auto', fontSize: 11, color: '#2563EB' }}
                            title="Set as primary"
                          >
                            Make primary
                          </button>
                        )}
                      </label>
                    );
                  });

                  return (
                    <React.Fragment>
                      <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {list}
                      </div>
                      {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                          <button
                            onClick={() => setGroupCollaboratorPage(prev => ({ ...prev, [group.id]: Math.max(1, currentPage - 1) }))}
                            disabled={currentPage === 1}
                            style={{ fontSize: 12, color: currentPage === 1 ? '#9CA3AF' : '#2563EB' }}
                          >
                            Prev
                          </button>
                          <span style={{ fontSize: 12, color: '#6B7280' }}>Page {currentPage} / {totalPages}</span>
                          <button
                            onClick={() => setGroupCollaboratorPage(prev => ({ ...prev, [group.id]: Math.min(totalPages, currentPage + 1) }))}
                            disabled={currentPage === totalPages}
                            style={{ fontSize: 12, color: currentPage === totalPages ? '#9CA3AF' : '#2563EB' }}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })()}
              </div>

              {/* Close */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button onClick={() => setOpenGroupMenuId(null)} style={{ fontSize: 12, color: '#374151' }}>Close</button>
              </div>
            </div>
          )}

          {/* Subtle label */}
          <div style={{
            position: 'absolute',
            left: boundingBox.x + (boundingBox.width / 2),
            top: boundingBox.y + boundingBox.height + 5,
            transform: 'translateX(-50%)',
            fontSize: '0.8rem',
            color: collaborator.color,
            fontWeight: 'bold',
            backgroundColor: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            border: `1px solid ${collaborator.color}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
            // Allow the label to grow wider for long names
            width: 'max-content',
            maxWidth: 'clamp(180px, 30vw, 420px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {(() => {
              const extras = (group.extraCollaborators || []).map(id => collaborators.find(c => c.id === id)).filter(Boolean);
              if (extras.length === 0) return `${collaborator.name}'s Group`;
              if (extras.length === 1) return `${collaborator.name} & ${extras[0].name}`;
              return `${collaborator.name} and ${extras.length} others`;
            })()}
          </div>
        </React.Fragment>
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
  // Convert screen coordinates to canvas coordinates using current transform
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
}, [nodes, pan, zoom]);

  return (
    <div className={`flex w-full h-screen overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Main Canvas Area */}
      <div 
        className="flex-1 relative overflow-hidden"
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
        onDrop={handleShapeDrop}
        onDragOver={handleShapeDragOver}
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
              
              // Use fixed width to prevent layout disruption during text editing
              const nodeWidth = 400; // Fixed width for stable layout

              // Define shape-specific styles
              const getShapeStyles = (shapeType) => {
                const baseColor = node.backgroundColor || node.color || (isDarkMode ? '#374151' : '#ffffff');
                
                switch (shapeType) {
                  case 'circle':
                    return {
                      borderRadius: '50%',
                      width: 120,
                      height: 120,
                      clipPath: 'none'
                    };
                  case 'hexagon':
                    return {
                      borderRadius: '8px',
                      clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                      width: 120,
                      height: 120
                    };
                  case 'rhombus':
                    return {
                      borderRadius: '4px',
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      width: 120,
                      height: 120
                    };
                  case 'pentagon':
                    return {
                      borderRadius: '8px',
                      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                      width: 120,
                      height: 120
                    };
                  case 'ellipse':
                    return {
                      borderRadius: '50%',
                      width: 160,
                      height: 100,
                      clipPath: 'none'
                    };
                  case 'connector':
                    return {
                      borderRadius: '40px',
                      width: 200,
                      height: 80,
                      clipPath: 'none'
                    };
                  default:
                    return {
                      borderRadius: '16px',
                      width: nodeWidth,
                      height: 'auto',
                      clipPath: 'none'
                    };
                }
              };

              const shapeStyles = node.shapeType ? getShapeStyles(node.shapeType) : getShapeStyles('default');
              const displayWidth = shapeStyles.width || nodeWidth;

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  ref={el => { nodeRefs.current[node.id] = el; }}
                  className={`absolute shadow-lg cursor-move node node-text-wrap backdrop-blur-sm
                    ${selectedNodes.includes(node.id) ? 'ring-2 ring-blue-500/80 ring-offset-2 ring-offset-white/50' : ''}
                    ${draggingNodeId === node.id ? 'dragging' : ''}
                    ${node.completed ? 'border-2 border-green-400/60 bg-green-50/40' : 'border border-gray-200/60'}`}
                  style={{
                    left: node.x - displayWidth / 2, // Center the node horizontally
                    top: node.y - (shapeStyles.height === 'auto' ? 40 : shapeStyles.height / 2), // Adjust vertical position
                    width: shapeStyles.width,
                    height: shapeStyles.height,
                    minHeight: shapeStyles.height === 'auto' ? 80 : shapeStyles.height,
                    background: `linear-gradient(135deg, ${node.backgroundColor || node.color || (isDarkMode ? '#374151' : '#ffffff')} 0%, ${adjustBrightness(node.backgroundColor || node.color || (isDarkMode ? '#374151' : '#ffffff'), -3)} 100%)`,
                    boxShadow: selectedNode === node.id 
                      ? `0 20px 40px ${isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'}, 0 0 0 1px rgba(59, 130, 246, 0.5)`
                      : `0 10px 25px ${isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
                    zIndex: selectedNode === node.id ? 50 : (searchQuery ? (isNodeMatching ? 20 : 10) : 10),
                    textAlign: 'center',
                    opacity: searchQuery ? (isNodeMatching ? 1 : 0.3) : 1,
                    position: 'relative',
                    padding: '12px 16px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    borderRadius: shapeStyles.borderRadius,
                    clipPath: shapeStyles.clipPath,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 160ms ease-out',
                    transform: node._justAdded ? 'scale(0.96)' : 'scale(1)'
                  }}
                  onTransitionEnd={() => {
                    if (node._justAdded) {
                      Promise.resolve().then(() => {
                        wrappedSetNodes(nodes.map(n => n.id === node.id ? { ...n, _justAdded: false } : n));
                      });
                    }
                  }}
                  onClick={(e) => handleNodeClick(node.id, e)}
                  onPointerDownCapture={(e) => {
                    // Ignore pointer capture if interacting with inner controls
                    const el = e.target;
                    if (el && el.closest && (el.closest('.node-toolbar-btn') || el.closest('button') || el.closest('input, textarea, select'))) {
                      return;
                    }
                    // Prevent moving the node if it is being edited (text interaction only)
                    if (editingNode === node.id || isEditing) return;
                    if (mode === 'cursor' && e.button === 0) {
                      e.preventDefault();
                      e.stopPropagation();
                      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startNodeX = node.x;
                      const startNodeY = node.y;
                      // Disable text selection while dragging
                      const prevUserSelect = document.body.style.userSelect;
                      document.body.style.userSelect = 'none';

                      setDraggingNodeId(node.id);

                      const handlePointerMove = (moveEvent) => {
                        if (isPanning) return;
                        const dx = (moveEvent.clientX - startX) / zoom;
                        const dy = (moveEvent.clientY - startY) / zoom;
                        handleNodeDrag(node.id, startNodeX + dx, startNodeY + dy);
                      };

                      const handlePointerUp = () => {
                        setDraggingNodeId(null);
                        if (dragFrameRef.current) {
                          cancelAnimationFrame(dragFrameRef.current);
                          dragFrameRef.current = null;
                        }
                        // Drop membership/collaborators update
                        const latestPos = lastDragPosRef.current[node.id];
                        if (latestPos && nodeGroups.length > 0) {
                          const targetGroup = nodeGroups.find(g => {
                            const bb = g.boundingBox;
                            if (!bb) return false;
                            const left = bb.x + GROUP_HIT_INSET;
                            const right = bb.x + bb.width - GROUP_HIT_INSET;
                            const top = bb.y + GROUP_HIT_INSET;
                            const bottom = bb.y + bb.height - GROUP_HIT_INSET;
                            return latestPos.x >= left && latestPos.x <= right &&
                                   latestPos.y >= top && latestPos.y <= bottom;
                          });
                          if (targetGroup) {
                            setNodeGroups(prev => prev.map(g => {
                              if (g.id === targetGroup.id) {
                                if ((g.nodeIds || []).includes(node.id)) return g;
                                return { ...g, nodeIds: [...(g.nodeIds || []), node.id] };
                              }
                              if ((g.nodeIds || []).includes(node.id)) {
                                return { ...g, nodeIds: g.nodeIds.filter(id => id !== node.id) };
                              }
                              return g;
                            }));
                            const groupsContainingNode = nodeGroups.filter(g => (g.nodeIds || []).includes(node.id));
                            const groupsLeaving = groupsContainingNode.filter(g => g.id !== targetGroup.id);
                            const collabsToRemove = Array.from(new Set(groupsLeaving.flatMap(g => [g.collaborator?.id, ...(g.extraCollaborators || [])].filter(Boolean))));
                            const targetIds = [targetGroup.collaborator?.id, ...((targetGroup.extraCollaborators || []))].filter(Boolean);
                            wrappedSetNodes(nodes.map(n => {
                              if (n.id !== node.id) return n;
                              const existing = Array.isArray(n.collaborators) ? n.collaborators : [];
                              const kept = existing.filter(id => !collabsToRemove.includes(id));
                              const merged = Array.from(new Set([...kept, ...targetIds]));
                              const withPosition = latestPos ? { x: latestPos.x, y: latestPos.y } : {};
                              return { ...n, ...withPosition, collaborators: merged };
                            }));
                          } else {
                            setNodeGroups(prev => prev.map(g => (
                              (g.nodeIds || []).includes(node.id)
                                ? { ...g, nodeIds: g.nodeIds.filter(id => id !== node.id) }
                                : g
                            )));
                            const groupsContainingNode = nodeGroups.filter(g => (g.nodeIds || []).includes(node.id));
                            const collabsToRemove = Array.from(new Set(groupsContainingNode.flatMap(g => [g.collaborator?.id, ...(g.extraCollaborators || [])].filter(Boolean))));
                            if (collabsToRemove.length > 0) {
                              wrappedSetNodes(nodes.map(n => {
                                if (n.id !== node.id) return n;
                                const existing = Array.isArray(n.collaborators) ? n.collaborators : [];
                                const kept = existing.filter(id => !collabsToRemove.includes(id));
                                const withPosition = latestPos ? { x: latestPos.x, y: latestPos.y } : {};
                                return { ...n, ...withPosition, collaborators: kept };
                              }));
                            }
                          }
                        }
                        document.removeEventListener('pointermove', handlePointerMove);
                        document.removeEventListener('pointerup', handlePointerUp);
                        // restore text selection
                        document.body.style.userSelect = prevUserSelect;
                      };

                      document.addEventListener('pointermove', handlePointerMove, { passive: true });
                      document.addEventListener('pointerup', handlePointerUp, { passive: true });
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
                          
                          {/* Connection Button - Only for connector shapes */}
                          {node.shapeType === 'connector' && (
                            <button
                              className={`node-toolbar-btn p-2 rounded-xl transition-colors duration-200 border ${
                                isConnecting && connectionStart === node.id 
                                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                                  : 'hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isConnecting && connectionStart === node.id) {
                                  cancelConnection();
                                } else {
                                  startConnection(node.id, e);
                                }
                              }}
                              title={isConnecting && connectionStart === node.id ? "Cancel connection" : "Start connection"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                            </button>
                          )}
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
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
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
                                  className="w-full p-3 border border-gray-300 rounded-lg text-sm h-32 resize-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
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
                                            className="flex-1 px-2 py-1 text-sm border rounded text-black text-left"
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
                                        className="flex-1 px-2 py-1 text-sm border rounded text-black text-left"
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
                                      className="w-full p-2 border rounded-md text-sm h-24 resize-none text-black text-left"
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
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
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
                                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
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
                  <div className={`flex flex-col items-center justify-center gap-2 h-full min-h-[48px] w-full flex-1 ${node.completed ? 'opacity-75' : ''}`}>
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
                          className="bg-transparent outline-none w-full text-center resize-none overflow-hidden font-medium leading-snug px-1"
                          style={{ 
                            display: 'block',
                            maxWidth: '100%',
                            color: node.text ? (node.fontColor || (isDarkMode ? '#f3f4f6' : '#2d3748')) : (isDarkMode ? '#9ca3af' : '#6b7280'),
                            fontSize: '14px',
                            fontWeight: '500',
                            lineHeight: '1.4',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            minHeight: '20px',
                            padding: '0'
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
                          className="w-full text-center cursor-text font-medium leading-snug px-1"
                          style={{ 
                            display: 'block',
                            maxWidth: '100%',
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
                        className="font-medium text-center leading-snug px-1"
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
            
            {/* Connection lines overlay */}
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 1 }}>
              <defs>
                <marker id="arrowhead" markerWidth="  10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                </marker>
              </defs>
              
              {/* Render permanent connections */}
              {connections.map(connection => {
                const startNode = nodes.find(n => n.id === connection.start);
                const endNode = nodes.find(n => n.id === connection.end);
                
                if (!startNode || !endNode) return null;
                
                return (
                  <line
                    key={connection.id}
                    x1={startNode.x}
                    y1={startNode.y}
                    x2={endNode.x}
                    y2={endNode.y}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              
              {/* Render temporary connection line */}
              {tempConnection && (
                <line
                  x1={tempConnection.start.x}
                  y1={tempConnection.start.y}
                  x2={tempConnection.end.x}
                  y2={tempConnection.end.y}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  opacity="0.7"
                  markerEnd="url(#arrowhead)"
                />
              )}
            </svg>
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

      {/* Shapes Panel */}
      <div className={`w-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-center py-4 gap-3`}>
        
        {shapeDefinitions.map((shapeDef) => (
          <div
            key={shapeDef.type}
            className={`w-14 h-14 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center justify-center`}
            style={{ 
              backgroundColor: shapeDef.color,
              borderColor: isDarkMode ? '#374151' : '#e5e7eb'
            }}
            draggable={true}
            onDragStart={(e) => handleShapeDragStart(e, shapeDef.type)}
            title={shapeDef.name}
          >
            <span className="text-white text-xl font-bold select-none">
              {shapeDef.icon}
            </span>
          </div>
        ))}
        
        {/* Dark Mode Toggle at bottom */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
