/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Check, Download, X } from 'lucide-react';
import MindMapToolbar from './mindmap/MindMapToolbar';
import MindMapCanvas from './mindmap/MindMapCanvas';
import NodeCard from './mindmap/NodeCard';
import MindMapSearchBar from './mindmap/MindMapSearchBar';
import ConnectionsSvg from './mindmap/ConnectionsSvg';
import NodeToolbarPrimary from './mindmap/NodeToolbarPrimary';
import NodeToolbarBackgroundColor from './mindmap/NodeToolbarBackgroundColor';
import NodeToolbarFontColor from './mindmap/NodeToolbarFontColor';
import NodeToolbarConnectionButton from './mindmap/NodeToolbarConnectionButton';
import NodeToolbarSettingsToggle from './mindmap/NodeToolbarSettingsToggle';
import NodeToolbarLayout from './mindmap/NodeToolbarLayout';

import { getDescendantNodeIds, getAncestorNodeIds } from './mindmap/graphUtils';
import ShapePalette from './mindmap/ShapePalette';
import CollaboratorDialog from './mindmap/CollaboratorDialog';
import { shapeBuilders } from './mindmap/builders';
import ProgressRingChip from './mindmap/ProgressRingChip';

// Hooks
import { useNodePositioning } from '../hooks/useNodePositioning';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { useDragging } from '../hooks/useDragging';

export default function MindMap({ mapId, onBack }) {
  // Minimal, compiling scaffold to restore the app while we refactor
  const [nodes, setNodes] = useState([
    { 
      id: 'root', 
      text: 'Central Idea', 
      x: Math.round(window.innerWidth / 2), 
      y: Math.round(window.innerHeight / 2),
      bgColor: '#ffffff',
      fontColor: '#2d3748'
    }
  ]);
  const [connections, setConnections] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState('cursor'); // 'cursor' | 'pan'
  const [selectionType, setSelectionType] = useState('simple');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fxOptions, setFxOptions] = useState({ enabled: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchList, setShowSearchList] = useState(false);
  const [connectionFrom, setConnectionFrom] = useState(null);
  
  // Collaborator selection mode state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [nodeGroups, setNodeGroups] = useState([]); // Groups of nodes assigned to collaborators with visual shapes
  
  // Group management UI states
  const [openGroupMenuId, setOpenGroupMenuId] = useState(null); // Popup menu for group
  const [hudGroupId, setHudGroupId] = useState(null); // Quick actions HUD near group
  const [movingGroupId, setMovingGroupId] = useState(null); // When set, group box becomes draggable
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  
  const [expandedNodeToolbars, setExpandedNodeToolbars] = useState({}); // { [nodeId]: bool } - Per-node toolbar expansion
  const [popupOpenFor, setPopupOpenFor] = useState({}); // { [nodeId]: { [popupName]: bool } }
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Per-node button anchor refs for popovers
  const detailsBtnRefs = useRef({});
  const dateBtnRefs = useRef({});
  const attachBtnRefs = useRef({});
  const notesBtnRefs = useRef({});
  const tagBtnRefs = useRef({});
  const layoutBtnRefs = useRef({});
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false);
  const [collaboratorNodeId, setCollaboratorNodeId] = useState(null); // Track which node the collaborator dialog is for
  const [collaborators] = useState([
    { id: 'jd', initials: 'JD', name: 'John Doe', color: '#3B82F6' },
    { id: 'ak', initials: 'AK', name: 'Alex Kim', color: '#10B981' },
    { id: 'mr', initials: 'MR', name: 'Maria Rodriguez', color: '#F59E0B' },
    { id: 'ts', initials: 'TS', name: 'Taylor Smith', color: '#8B5CF6' }
  ]);
  const [attachmentFilters, setAttachmentFilters] = useState({ search: '' }); // Attachment search/filter state
  const bgBtnRefs = useRef({}); // Background color button refs
  const fontBtnRefs = useRef({}); // Font color button refs
  const emojiBtnRefs = useRef({}); // Emoji button refs

  // Canvas ref
  const canvasRef = useRef(null);

  // ============================================
  // HOOKS: Extract business logic
  // ============================================
  const positioning = useNodePositioning(nodes, connections);
  
  const nodeOps = useNodeOperations(
    nodes,
    connections,
    setNodes,
    setConnections,
    isDarkMode,
    positioning.findStackedPosition,
    positioning.findStackedChildPosition
  );

  const dragging = useDragging(nodes, setNodes, canvasRef, mode);

  // ============================================
  // UI INTERACTION: Reference dragging state
  // ============================================
  const { draggingNodeId, pan, setPan, isPanning } = dragging;

  // ============================================
  // AUTO-SAVE HISTORY ON CHANGES
  // ============================================
  useEffect(() => {
    // Skip initial empty history
    if (history.length === 0 && historyIndex === -1) {
      setHistory([{ nodes: structuredClone(nodes), connections: structuredClone(connections) }]);
      setHistoryIndex(0);
    } else if (history.length > 0) {
      // Check if current state differs from last saved state
      const lastState = history[historyIndex];
      if (lastState && (JSON.stringify(lastState.nodes) !== JSON.stringify(nodes) || JSON.stringify(lastState.connections) !== JSON.stringify(connections))) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: structuredClone(nodes), connections: structuredClone(connections) });
        if (newHistory.length > 50) {
          newHistory.shift();
        } else {
          setHistoryIndex(newHistory.length - 1);
        }
        setHistory(newHistory);
      }
    }
  }, [nodes, connections, history, historyIndex]);

  // Close group menu on outside click
  useEffect(() => {
    const onWinClick = () => setOpenGroupMenuId(null);
    window.addEventListener('click', onWinClick);
    return () => window.removeEventListener('click', onWinClick);
  }, []);

  // Global Escape key to dismiss HUD / move mode
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setHudGroupId(null);
        setMovingGroupId(null);
        setOpenGroupMenuId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Wheel event for zooming
  useEffect(() => {
    const handleWheel = (e) => {
      if (!canvasRef.current) return;
      // Only zoom if the mouse is over the canvas
      if (!canvasRef.current.contains(e.target)) return;
      
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
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [canvasRef]);

  // ============================================
  // HISTORY MANAGEMENT
  // ============================================
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setNodes(structuredClone(previousState.nodes));
      setConnections(structuredClone(previousState.connections));
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setNodes(structuredClone(nextState.nodes));
      setConnections(structuredClone(nextState.connections));
      setHistoryIndex(newIndex);
    }
  };

  // ============================================
  // COLLABORATOR SELECTION MODE
  // ============================================
  const startSelection = (e) => {
    if (mode === 'cursor' && selectionType === 'collaborator') {
      e.preventDefault(); // Prevent page scrolling or text selection
      setIsSelecting(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragging.pan.x) / zoom;
      const y = (e.clientY - rect.top - dragging.pan.y) / zoom;
      setSelectionStart({ x, y });
      setSelectionRect({ x, y, width: 0, height: 0 });
    }
  };

  const updateSelection = (e) => {
    if (isSelecting) {
      e.preventDefault(); // Prevent page scrolling or text selection
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - dragging.pan.x) / zoom;
      const currentY = (e.clientY - rect.top - dragging.pan.y) / zoom;
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

  const stopSelection = () => {
    if (isSelecting && selectionRect) {
      // Find nodes within the selection rectangle
      const selectedIds = nodes.filter(node => {
        // Calculate node bounds (from current node rendering logic)
        const nodeWidth = Math.min(350, Math.max(150, node.text.length * 10));
        const nodeHeight = 60;
        const nodeLeft = node.x - nodeWidth / 2;
        const nodeRight = node.x + nodeWidth / 2;
        const nodeTop = node.y - nodeHeight / 2;
        const nodeBottom = node.y + nodeHeight / 2;

        // Check if node overlaps with selection rectangle
        const isInside = (
          nodeRight >= selectionRect.x &&
          nodeLeft <= selectionRect.x + selectionRect.width &&
          nodeBottom >= selectionRect.y &&
          nodeTop <= selectionRect.y + selectionRect.height
        );

        return isInside;
      }).map(node => node.id);

      // Update selected nodes
      if (selectedIds.length > 0) {
        setSelectedNodes(selectedIds);
        // Show collaborator dialog to assign all selected nodes
        setShowCollaboratorDialog(true);
      }
    }

    setIsSelecting(false);
    setSelectionRect(null);
  };

  // ============================================
  // POSITIONING HANDLED BY HOOKS
  // (see useNodePositioning and useNodeOperations)
  // ============================================

  // ============================================
  // NODE OPERATIONS (via hooks)
  // ============================================

  const toggleSelectNode = (id) => {
    // If in the middle of creating a connection, connect to the clicked node
    if (connectionFrom && connectionFrom !== id) {
      const exists = connections.some(c => (c.from === connectionFrom && c.to === id) || (c.from === id && c.to === connectionFrom));
      if (!exists) {
        setConnections(connections.concat([{ id: `conn-${Date.now()}`, from: connectionFrom, to: id }]));
      }
      setConnectionFrom(null);
      return;
    }
    setSelectedNodes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Derived selections for focus mode
  const selectedNode = selectedNodes[0] || null;
  const relatedNodeIds = React.useMemo(() => {
    if (!selectedNode) return new Set();
    const set = new Set([selectedNode]);
    getDescendantNodeIds(connections, selectedNode).forEach(id => set.add(id));
    getAncestorNodeIds(connections, selectedNode).forEach(id => set.add(id));
    return set;
  }, [selectedNode, connections]);

  const nodePositions = React.useMemo(() => {
    const map = {};
    // Calculate node rectangles for connection routing
    // Nodes are rendered as: left: x - 150, top: y - 42, minWidth: 300, height: ~88 (with padding)
    const NODE_WIDTH = 300;  // Updated to match actual node width
    const NODE_HEIGHT = 88;  // Updated to match actual node height with padding
    nodes.forEach(n => { 
      map[n.id] = {
        left: n.x - NODE_WIDTH / 2,    // x - 150
        top: n.y - NODE_HEIGHT / 2,    // y - 44
        right: n.x + NODE_WIDTH / 2,   // x + 150
        bottom: n.y + NODE_HEIGHT / 2  // y + 44
      };
    });
    return map;
  }, [nodes]);

  // ============================================
  // NODE TOOLBAR ACTIONS (via hooks)
  // ============================================
  const onToggleComplete = nodeOps.toggleNodeComplete;
  const updateNodeText = nodeOps.updateNodeText;
  const onAddChild = nodeOps.addChildNode;
  const onRequestDelete = (node) => nodeOps.deleteNodes([node.id]);
  const addStandaloneNode = nodeOps.addStandaloneNode;
  const startConnection = (id) => setConnectionFrom(id);
  const cancelConnection = () => setConnectionFrom(null);

  // ============================================
  // PROGRESS TRACKING FUNCTIONS
  // ============================================
  
  // Calculate max depth of node hierarchy
  const getMaxDepth = (nodeId, visited = new Set(), currentDepth = 0) => {
    if (visited.has(nodeId)) return currentDepth;
    visited.add(nodeId);
    
    const children = connections
      .filter(conn => conn.from === nodeId)
      .map(conn => conn.to);
    
    if (children.length === 0) return currentDepth;
    
    const childDepths = children.map(childId =>
      getMaxDepth(childId, new Set(visited), currentDepth + 1)
    );
    
    return Math.max(...childDepths);
  };

  // Get progress statistics for a node (counts all descendants)
  const getNodeProgress = (nodeId) => {
    // Recursive helper to get all descendants with cycle detection
    const getAllDescendants = (parentId, visited = new Set()) => {
      if (visited.has(parentId)) return [];
      visited.add(parentId);
      
      const directChildren = connections
        .filter(conn => conn.from === parentId)
        .map(conn => nodes.find(node => node.id === conn.to))
        .filter(Boolean);
      
      let allDescendants = [...directChildren];
      directChildren.forEach(child => {
        const childDescendants = getAllDescendants(child.id, new Set(visited));
        allDescendants = [...allDescendants, ...childDescendants];
      });
      
      return allDescendants;
    };
    
    const allDescendants = getAllDescendants(nodeId);
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
      depth: getMaxDepth(nodeId)
    };
  };

  // ============================================
  // NODE DATA UPDATES (via hooks)
  // ============================================
  const updateNode = nodeOps.updateNode;
  const setNodeField = (id, key, value) => updateNode(id, { [key]: value });
  const addNodeTag = (id, tag) => updateNode(id, n => ({ ...n, tags: [ ...(n.tags || []), tag ] }));

  const deleteNode = (id) => nodeOps.deleteNodes([id]);
  const deleteNodeCascade = (id) => {
    const desc = new Set(getDescendantNodeIds(connections, id));
    nodeOps.deleteNodes([id, ...Array.from(desc)]);
  };

  // Popup state helpers
  const isPopupOpen = (nodeId, popupName) => popupOpenFor[nodeId]?.[popupName] === true;
  const togglePopup = (nodeId, popupName) => {
    const isCurrentlyOpen = isPopupOpen(nodeId, popupName);
    
    // Close all popups for this node, then open the requested one (if it was closed)
    setPopupOpenFor(prev => ({
      ...prev,
      [nodeId]: {
        bgColor: false,
        fontColor: false,
        attach: false,
        notes: false,
        emoji: false,
        tags: false,
        details: false,
        date: false,
        collaborator: false,
        layout: false,
        [popupName]: !isCurrentlyOpen // Toggle the requested popup
      }
    }));
  };
  const closePopup = (nodeId, popupName) => {
    setPopupOpenFor(prev => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] || {}), [popupName]: false }
    }));
  };

  // Toolbar expansion helpers - per-node
  const isNodeToolbarExpanded = (nodeId) => expandedNodeToolbars[nodeId] === true;
  const toggleNodeToolbar = (nodeId) => {
    setExpandedNodeToolbars(prev => ({
      ...prev,
      [nodeId]: !isNodeToolbarExpanded(nodeId)
    }));
  };
  const selectBgColor = (id, color) => { 
    setNodes(nodes.map(n => n.id === id ? { ...n, bgColor: color } : n)); 
  };
  const selectFontColor = (id, color) => { 
    setNodes(nodes.map(n => n.id === id ? { ...n, fontColor: color } : n)); 
  };

  // Attachment handlers
  const handleAttachment = (e, nodeId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Read file as base64 to store it
    const reader = new FileReader();
    reader.onload = (event) => {
      const newAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        dateAdded: new Date().toISOString(),
        addedBy: 'current-user',
        type: file.name.split('.').pop().toLowerCase(),
        data: event.target.result, // Store the file data
        size: file.size,
      };
      setNodes(nodes.map(n => 
        n.id === nodeId 
          ? { ...n, attachments: [...(n.attachments || []), newAttachment] } 
          : n
      ));
    };
    reader.readAsDataURL(file);
    try { e.target.value = ''; } catch {}
  };

  const removeAttachment = (nodeId, attachmentId) => {
    setNodes(nodes.map(n => 
      n.id === nodeId 
        ? { ...n, attachments: (n.attachments || []).filter(a => a.id !== attachmentId) } 
        : n
    ));
  };

  const downloadAttachment = (attachment) => {
    if (!attachment.data) return;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setNodeEmoji = (nodeId, emoji) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, emoji } : n));
  };

  // Collaborators - handles both individual node assignment and group creation
  const assignCollaborator = (nodeIdOrCollaborator, collaboratorId = null) => {
    // Case 1: Single node assignment (from node toolbar button)
    // Called as: assignCollaborator(nodeId, collaboratorId)
    if (typeof nodeIdOrCollaborator === 'string' && collaboratorId) {
      const nodeId = nodeIdOrCollaborator;
      setNodes(nodes.map(n => {
        if (n.id !== nodeId) return n;
        // Toggle collaborator in array
        let newCollabs = Array.isArray(n.collaborators) ? [...n.collaborators] : [];
        if (newCollabs.includes(collaboratorId)) {
          newCollabs = newCollabs.filter(id => id !== collaboratorId);
        } else {
          newCollabs.push(collaboratorId);
        }
        return { ...n, collaborators: newCollabs };
      }));
      return;
    }
    
    // Case 2: Group creation (from collaborator mode selection)
    // Called as: assignCollaborator(collaboratorObject)
    const collaborator = nodeIdOrCollaborator;
    
    // Create a new group with the selected nodes and collaborator
    const newGroup = {
      id: `group-${Date.now()}`,
      nodeIds: [...selectedNodes],
      collaborator
    };
    
    // Calculate bounding box for the group based on actual node dimensions
    // NodeCard: left: node.x - 100, top: node.y - 28, minWidth: 200
    // So node bounds are: x ± 100 (width), y ± 28 (height)
    const groupNodes = nodes.filter(node => selectedNodes.includes(node.id));
    const minX = Math.min(...groupNodes.map(node => node.x - 100));
    const maxX = Math.max(...groupNodes.map(node => node.x + 100));
    const minY = Math.min(...groupNodes.map(node => node.y - 28));
    const maxY = Math.max(...groupNodes.map(node => node.y + 28));
    
    const boundingBox = {
      x: minX - 15,
      y: minY - 15,
      width: (maxX - minX) + 30,
      height: (maxY - minY) + 30
    };
    
    newGroup.boundingBox = boundingBox;
    
    // Add the new group
    setNodeGroups([...nodeGroups, newGroup]);
    
    // Reset selection state
    setSelectedNodes([]);
    setShowCollaboratorDialog(false);
    
    // Switch back to simple selection mode
    setMode('cursor');
    setSelectionType('simple');
  };

  // Group management functions
  const selectGroupNodes = (groupId) => {
    const group = nodeGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedNodes(group.nodeIds || []);
    }
  };

  const deleteGroupById = (groupId) => {
    setNodeGroups(nodeGroups.filter(g => g.id !== groupId));
    setOpenGroupMenuId(null);
    setHudGroupId(null);
  };

  const toggleCollaboratorInGroup = (groupId, collaboratorId) => {
    setNodeGroups(nodeGroups.map(g => {
      if (g.id !== groupId) return g;
      const extraCollabs = Array.isArray(g.extraCollaborators) ? g.extraCollaborators : [];
      const has = extraCollabs.includes(collaboratorId);
      if (has) {
        return { ...g, extraCollaborators: extraCollabs.filter(id => id !== collaboratorId) };
      }
      return { ...g, extraCollaborators: [...extraCollabs, collaboratorId] };
    }));
  };

  // Render node groups as visual shapes with collaborator badges and management UI
  const renderNodeGroups = () => {
    return nodeGroups.map(group => {
      const { boundingBox, collaborator } = group;
      const badgeSize = 30;
      const badgeOffset = 15;

      return (
        <React.Fragment key={group.id}>
          {/* Group dashed area; gets highlighted when moving */}
          <div style={{
            position: 'absolute',
            left: boundingBox.x,
            top: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
            border: movingGroupId === group.id ? `3px solid ${collaborator.color}` : `3px dashed ${collaborator.color}`,
            borderRadius: '12px',
            background: movingGroupId === group.id
              ? `repeating-linear-gradient(45deg, ${collaborator.color}10, ${collaborator.color}10 10px, transparent 10px, transparent 20px)`
              : `${collaborator.color}10`,
            pointerEvents: 'none',
            zIndex: 4,
            boxShadow: movingGroupId === group.id
              ? `0 0 0 2px ${collaborator.color}40, 0 10px 30px ${collaborator.color}33`
              : `0 0 0 1px ${collaborator.color}20`,
            transition: 'box-shadow 120ms ease-out, border 120ms ease-out, background 120ms ease-out'
          }} />

          {/* If movingGroupId matches, render a draggable overlay for the group box */}
          {movingGroupId === group.id && (
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                const start = { x: e.clientX, y: e.clientY };
                const startBB = { ...group.boundingBox };
                // Store initial positions of all nodes in the group
                const initialNodePositions = {};
                (group.nodeIds || []).forEach(nodeId => {
                  const node = nodes.find(n => n.id === nodeId);
                  if (node) {
                    initialNodePositions[nodeId] = { x: node.x, y: node.y };
                  }
                });
                
                const onMove = (ev) => {
                  const dx = (ev.clientX - start.x) / zoom;
                  const dy = (ev.clientY - start.y) / zoom;
                  setIsDraggingGroup(true);
                  
                  // Update group bounding box
                  setNodeGroups(prev => prev.map(g => g.id === group.id ? { ...g, boundingBox: { ...startBB, x: startBB.x + dx, y: startBB.y + dy } } : g));
                  
                  // Move all nodes in the group
                  setNodes(prev => prev.map(n => {
                    if (initialNodePositions[n.id]) {
                      return { 
                        ...n, 
                        x: initialNodePositions[n.id].x + dx, 
                        y: initialNodePositions[n.id].y + dy 
                      };
                    }
                    return n;
                  }));
                };
                
                const onUp = () => {
                  window.removeEventListener('pointermove', onMove);
                  window.removeEventListener('pointerup', onUp);
                  setIsDraggingGroup(false);
                  setMovingGroupId(null);
                };
                window.addEventListener('pointermove', onMove);
                window.addEventListener('pointerup', onUp);
              }}
              style={{
                position: 'absolute',
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
                cursor: isDraggingGroup ? 'grabbing' : 'grab',
                zIndex: 1002,
                background: 'transparent'
              }}
            />
          )}

          {/* Drag hint pill when in move mode */}
          {movingGroupId === group.id && (
            <div
              style={{
                position: 'absolute',
                left: boundingBox.x + 10,
                top: Math.max(boundingBox.y - 36, 10),
                background: '#111827',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                zIndex: 1003
              }}
            >
              Drag to move group — Esc to cancel
            </div>
          )}

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

          {/* Popup menu for group actions */}
          {openGroupMenuId === group.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: boundingBox.x + boundingBox.width + 12,
                top: boundingBox.y,
                background: '#ffffff',
                borderRadius: 12,
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                padding: 16,
                width: 280,
                zIndex: 1001,
                border: '1px solid #E5E7EB'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
                Group Actions
              </div>

              {/* Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => { selectGroupNodes(group.id); setOpenGroupMenuId(null); }}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 12, fontWeight: 600, color: '#111827', cursor: 'pointer' }}
                >
                  Select nodes
                </button>
                <button
                  onClick={() => { setMovingGroupId(group.id); setOpenGroupMenuId(null); }}
                  title="Temporarily ignore contents; drag the dashed box to move it"
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #DBEAFE', background: '#EFF6FF', fontSize: 12, fontWeight: 600, color: '#1D4ED8', cursor: 'pointer' }}
                >
                  Move group
                </button>
              </div>

              <button
                onClick={() => { deleteGroupById(group.id); setOpenGroupMenuId(null); }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', fontSize: 12, fontWeight: 600, color: '#B91C1C', cursor: 'pointer', marginBottom: 12 }}
              >
                Delete group
              </button>

              {/* Add/Remove collaborators */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>
                Additional Collaborators
              </div>
              <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 12 }}>
                {collaborators.map(c => {
                  if (c.id === collaborator.id) return null; // Skip primary collaborator
                  const isExtra = Array.isArray(group.extraCollaborators) && group.extraCollaborators.includes(c.id);
                  return (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
                      <input
                        type="checkbox"
                        checked={isExtra}
                        onChange={() => toggleCollaboratorInGroup(group.id, c.id)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                        {c.initials}
                      </span>
                      <span style={{ fontSize: 13, color: '#374151' }}>{c.name}</span>
                    </label>
                  );
                })}
              </div>

              {/* Close */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setOpenGroupMenuId(null)} 
                  style={{ fontSize: 12, color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none', padding: '4px 8px' }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  // Shape palette drag start handler - stores shape type in drag data
  const handleShapeDragStart = (e, shapeType) => {
    // Store shape type in drag data so drop handler can retrieve it
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/x-shape-type', shapeType);
    }
  };

  // Shape palette drop handler - adds shape at drop location on canvas
  const handleShapeDrop = (e, shapeType) => {
    e.preventDefault();
    e.stopPropagation();
    
    const getColor = (type) => (type === 'node' ? '#F3F4F6' : '#E5E7EB');
    
    // Calculate canvas coordinates from viewport coordinates
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = e.clientX - rect.left - pan.x;
      const canvasY = e.clientY - rect.top - pan.y;
      
      const builder = shapeBuilders[shapeType] || shapeBuilders.connector;
      const { nodes: newNodes, connections: newConns, mainId } = builder(canvasX, canvasY, getColor);
      setNodes(prev => prev.concat(newNodes));
      setConnections(prev => prev.concat(newConns));
      setSelectedNodes([mainId]);
    }
  };

  // Canvas drag over handler - required to allow drops
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  // Canvas drop handler - retrieves shape type from drag data
  const handleCanvasDrop = (e) => {
    const shapeType = e.dataTransfer?.getData('application/x-shape-type');
    if (shapeType) {
      handleShapeDrop(e, shapeType);
    }
  };

  // Persistence per mapId (minimal)
  React.useEffect(() => {
    if (!mapId) return;
    try {
      const saved = localStorage.getItem(`mindMap_${mapId}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.nodes)) setNodes(data.nodes);
        if (Array.isArray(data.connections)) setConnections(data.connections);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);
  
  React.useEffect(() => {
    if (!mapId) return;
    const payload = JSON.stringify({ nodes, connections });
    localStorage.setItem(`mindMap_${mapId}`, payload);
  }, [mapId, nodes, connections]);

  // Determine cursor style based on mode and state
  let cursorStyle = 'default';
  if (mode === 'cursor' && selectionType === 'collaborator') {
    cursorStyle = 'crosshair';
  } else if (isPanning) {
    cursorStyle = 'grabbing';
  } else if (mode === 'pan') {
    cursorStyle = 'grab';
  } else if (mode === 'cursor') {
    // In cursor mode, show grab cursor to indicate panning is available on empty space
    cursorStyle = 'grab';
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      <div
        className="flex-1 relative overflow-hidden"
        ref={canvasRef}
        style={{ cursor: cursorStyle }}
        onMouseDown={(e) => {
          // Check if in collaborator selection mode
          if (mode === 'cursor' && selectionType === 'collaborator') {
            startSelection(e);
          } else {
            dragging.startPanning(e);
          }
        }}
        onMouseMove={(e) => {
          if (isSelecting) {
            updateSelection(e);
          } else {
            dragging.handlePanning(e);
          }
        }}
        onMouseUp={() => {
          stopSelection();
          dragging.stopPanning();
        }}
        onMouseLeave={() => {
          stopSelection();
          dragging.stopPanning();
        }}
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
        role="application"
        tabIndex={0}
        aria-label="Mind map canvas"
      >
        {/* Toolbar rendered via Portal to avoid parent stacking context issues */}
        {createPortal(
          <MindMapToolbar
            mode={mode}
            setMode={setMode}
            selectionType={selectionType}
            setSelectionType={setSelectionType}
            selectedNodes={selectedNodes}
            addStandaloneNode={addStandaloneNode}
            deleteNodes={nodeOps.deleteNodes}
            historyIndex={historyIndex}
            history={history}
            undo={undo}
            redo={redo}
            onBack={onBack}
            fxOptions={fxOptions}
            setFxOptions={setFxOptions}
          />,
          document.body
        )}

        {/* Search Bar */}
        <MindMapSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearchList={showSearchList}
          setShowSearchList={setShowSearchList}
          nodes={nodes}
          setSelectedNode={(id) => setSelectedNodes(id ? [id] : [])}
          setPan={setPan}
          deleteNode={deleteNode}
          deleteNodeCascade={deleteNodeCascade}
        />

        {/* Canvas with pan/zoom */}
        <MindMapCanvas
          pan={dragging.pan}
          zoom={zoom}
          renderNodeGroups={renderNodeGroups}
          renderConnections={(
            <ConnectionsSvg
              connections={connections}
              nodes={nodes}
              nodePositions={nodePositions}
              isDarkMode={false}
              fxOptions={fxOptions}
              selectedNode={selectedNode}
              relatedNodeIds={relatedNodeIds}
            />
          )}
        >
          {/* Nodes */}
          {nodes.map((node) => {
            const isNodeMatching = searchQuery 
              ? node.text.toLowerCase().includes(searchQuery.toLowerCase()) 
              : true;
            
            return (
              <NodeCard
                key={node.id}
                node={node}
                selected={selectedNodes.includes(node.id)}
                onSelect={toggleSelectNode}
                onUpdateText={updateNodeText}
                searchQuery={searchQuery}
                isMatching={isNodeMatching}
                onMouseDown={(e) => {
                  // allow dragging via startPanning handler; nothing here
                }}
              >
              {/* Progress Indicator (top-left) - Shows completion count for parent nodes */}
              {(() => {
                const progress = getNodeProgress(node.id);
                if (!progress || node.completed) return null;
                
                return (
                  <div 
                    className="absolute top-3 left-3 flex items-center gap-1 z-20"
                    title={`Total Progress: ${progress.completed}/${progress.total} tasks completed (${progress.percentage}%) - ${progress.depth + 1} levels deep`}
                  >
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                        {/* Background circle */}
                        <circle 
                          cx="16" 
                          cy="16" 
                          r="13" 
                          stroke="#d1d5db" 
                          strokeWidth="3" 
                          fill="white" 
                        />
                        {/* Progress arc */}
                        <circle 
                          cx="16" 
                          cy="16" 
                          r="13"
                          stroke={progress.percentage === 100 ? '#10b981' : '#3b82f6'}
                          strokeWidth="3" 
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 13}`}
                          strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress.percentage / 100)}`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      {/* Centered count text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Completion Checkmark (top-right) - Shows when task is marked complete */}
              {node.completed && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-20 shadow-sm">
                  <Check size={14} className="text-white" />
                </div>
              )}

              {/* Progress ring (fun) */}
              {fxOptions?.progressRing && (
                <div className="absolute -top-3 -left-3">
                  <ProgressRingChip 
                    pct={getNodeProgress(node.id)?.percentage ?? (node.completed ? 100 : 0)} 
                    isDarkMode={isDarkMode} 
                    shapeType={node.shapeType} 
                    completed={!!node.completed} 
                  />
                </div>
              )}
              
              {/* Collaborator avatars on node */}
              {Array.isArray(node.collaborators) && node.collaborators.length > 0 && (
                <div
                  className="flex gap-1 z-30"
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {node.collaborators.map(collabId => {
                    const collab = collaborators.find(c => c.id === collabId);
                    if (!collab) return null;
                    return (
                      <div
                        key={collabId}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                        style={{ backgroundColor: collab.color, color: 'white' }}
                        title={collab.name}
                      >
                        {collab.initials}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Per-node toolbar overlay - Only visible when node is selected */}
              {selectedNodes.includes(node.id) && (
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full z-20" style={{ top: '-25px' }}>
                <div className="enhanced-node-toolbar backdrop-blur-md bg-white/90 shadow-lg border border-white/20 rounded-2xl flex items-center p-2 gap-1">
                  {/* PRIMARY GROUP - always visible */}
                  <NodeToolbarPrimary
                    node={node}
                    isToolbarExpanded={isNodeToolbarExpanded(node.id)}
                    onToggleComplete={onToggleComplete}
                    onAddChild={onAddChild}
                    onRequestDelete={onRequestDelete}
                  />
                  
                  {/* Connection button for connectors */}
                  <NodeToolbarConnectionButton
                    nodeId={node.id}
                    isActive={connectionFrom === node.id}
                    onStart={startConnection}
                    onCancel={cancelConnection}
                  />

                  {/* Visual group when expanded */}
                  {isNodeToolbarExpanded(node.id) && (
                    <>
                      <NodeToolbarBackgroundColor
                        isOpen={isPopupOpen(node.id, 'bgColor')}
                        currentColor={node.bgColor}
                        onToggle={() => togglePopup(node.id, 'bgColor')}
                        onSelect={(color) => { selectBgColor(node.id, color); closePopup(node.id, 'bgColor'); }}
                        onClose={() => closePopup(node.id, 'bgColor')}
                      />
                      <NodeToolbarFontColor
                        isOpen={isPopupOpen(node.id, 'fontColor')}
                        currentColor={node.fontColor}
                        onToggle={() => togglePopup(node.id, 'fontColor')}
                        onSelect={(color) => { selectFontColor(node.id, color); closePopup(node.id, 'fontColor'); }}
                        onClose={() => closePopup(node.id, 'fontColor')}
                      />
                    </>
                  )}

                  {/* Settings toggle */}
                  <NodeToolbarSettingsToggle
                    isToolbarExpanded={isNodeToolbarExpanded(node.id)}
                    onToggle={() => toggleNodeToolbar(node.id)}
                  />

                  {/* Divider */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Content group when expanded */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="flex items-center gap-1">
                      <button
                        ref={(el) => { attachBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'attach'); }}
                        title="Attachments"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                      </button>
                      {isPopupOpen(node.id, 'attach') && (() => {
                        const anchor = attachBtnRefs.current[node.id];
                        const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
                        const popupWidth = 480;
                        const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
                        const top = Math.max(8, rect.bottom + 8);
                        return createPortal(
                          <div className="node-popup" style={{ position: 'fixed', left, top, minWidth: popupWidth, maxWidth: 500, zIndex: 5000 }} onClick={(e) => e.stopPropagation()}>
                            <h4 className="font-medium text-gray-800 mb-3">Attachments</h4>
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Search by name</label>
                              <input type="text" placeholder="Search by name..." className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left" value={attachmentFilters.search}
                                onChange={(e) => setAttachmentFilters({ ...attachmentFilters, search: e.target.value })}
                                onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                            </div>
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-700 mb-2">Add new file</label>
                              <input type="file" accept=".xlsx,.xls,.doc,.docx,.pdf" className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-300 rounded-lg p-2"
                                onChange={(e) => handleAttachment(e, node.id)} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {node.attachments && node.attachments.length > 0 ? (
                                <div className="space-y-2">
                                  {node.attachments.filter(attachment => attachment.name.toLowerCase().includes((attachmentFilters.search || '').toLowerCase())).map(attachment => (
                                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded font-medium uppercase">{attachment.type}</span>
                                        <span className="text-sm text-gray-900 font-medium truncate">{attachment.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1 ml-2">
                                        <button 
                                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                                          onClick={(e) => { e.stopPropagation(); downloadAttachment(attachment); }}
                                          title="Download file"
                                        >
                                          <Download size={16} />
                                        </button>
                                        <button 
                                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                                          onClick={(e) => { e.stopPropagation(); removeAttachment(node.id, attachment.id); }}
                                          title="Remove file"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">No attachments</div>
                              )}
                            </div>
                          </div>,
                          document.body
                        );
                      })()}
                      
                      <button
                        ref={(el) => { notesBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'notes'); }}
                        title="Notes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <line x1="10" y1="9" x2="8" y2="9"></line>
                        </svg>
                      </button>
                      {isPopupOpen(node.id, 'notes') && (() => {
                        const anchor = notesBtnRefs.current[node.id];
                        const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
                        const popupWidth = 420;
                        const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
                        const top = Math.max(8, rect.bottom + 8);
                        return createPortal(
                          <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000 }} onClick={(e) => e.stopPropagation()}>
                            <h4 className="font-medium text-gray-800 mb-3">Notes</h4>
                            <textarea className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"  placeholder="Add your notes here..." value={node.notes || ''}
                              onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, notes: e.target.value } : n))}
                              onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onFocus={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}
                            />
                            <div className="mt-2 flex justify-end">
                              <button className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50" onClick={(e) => { e.stopPropagation(); setNodes(nodes.map(n => n.id === node.id ? { ...n, showNotesPopup: false } : n)); }}>Close</button>
                            </div>
                          </div>,
                          document.body
                        );
                      })()}

                      <button
                        ref={(el) => { emojiBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'emoji'); }}
                        title="Add emoji"
                      >
                        {node.emoji || '😊'}
                      </button>
                      {isPopupOpen(node.id, 'emoji') && (() => {
                        const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😜', '😛', '😲', '😮', '😯', '😨', '😰', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'];
                        const anchor = emojiBtnRefs.current[node.id];
                        const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
                        const popupWidth = 280;
                        const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
                        const top = Math.max(8, rect.bottom + 8);
                        return createPortal(
                          <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000, backgroundColor: 'white', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-6 gap-1">
                              {emojis.map(emoji => (
                                <button
                                  key={emoji}
                                  className="p-1 text-lg hover:bg-gray-100 rounded cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); setNodeEmoji(node.id, emoji); togglePopup(node.id, 'emoji'); }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>,
                          document.body
                        );
                      })()}

                      <button
                        ref={(el) => { tagBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'tags'); }}
                        title="Tags"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                      </button>
                      {isPopupOpen(node.id, 'tags') && (() => {
                        const anchor = tagBtnRefs.current[node.id];
                        const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
                        const popupWidth = 300;
                        const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
                        const top = Math.max(8, rect.bottom + 8);
                        return createPortal(
                          <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000, maxHeight: '400px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                            <h4 className="font-medium text-gray-800 mb-3">Tags</h4>
                            <div className="mb-3">
                              {(node.tags || []).length > 0 ? (
                                <div className="flex gap-2 flex-wrap mb-3">
                                  {(node.tags || []).map((t) => (
                                    <span key={t} className="px-2 py-1 text-xs rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center gap-1">
                                      {t}
                                      <button className="text-blue-500 hover:text-blue-700 text-xs" onClick={(e) => { e.stopPropagation(); setNodes(nodes.map(n => n.id === node.id ? { ...n, tags: (n.tags || []).filter(tag => tag !== t) } : n)); }}>×</button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 mb-3">No tags yet</div>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Add tag and press Enter"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  const tag = e.currentTarget.value.trim();
                                  setNodes(nodes.map(n => n.id === node.id ? { ...n, tags: [...(n.tags || []), tag] } : n));
                                  e.currentTarget.value = '';
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                            />
                          </div>,
                          document.body
                        );
                      })()}
                    </div>
                  )}

                  {/* Divider */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Meta group when expanded */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="flex items-center gap-1">
                      <button
                        ref={(el) => { detailsBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'details'); }}
                        title="Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                      {isPopupOpen(node.id, 'details') && (() => {
                        const anchor = detailsBtnRefs.current[node.id];
                        const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
                        const popupWidth = 340;
                        const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
                        const top = Math.max(8, rect.bottom + 8);
                        return createPortal(
                          <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000 }} onClick={(e) => e.stopPropagation()}>
                            <h4 className="font-medium text-gray-800 mb-3">Details</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm text-gray-600 block mb-1">Priority</label>
                                <select
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={node.priority || 'normal'}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, priority: e.target.value } : n))}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="low">Low</option>
                                  <option value="normal">Normal</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block mb-1">Status</label>
                                <select
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={node.status || 'todo'}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, status: e.target.value } : n))}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="todo">To do</option>
                                  <option value="doing">Doing</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm text-gray-600 block mb-1">Description</label>
                                <textarea
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={3}
                                  value={node.description || ''}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, description: e.target.value } : n))}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          </div>,
                          document.body
                        );
                      })()}

                      <button
                        ref={(el) => { dateBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'date'); }}
                        title="Due date"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </button>
                      {isPopupOpen(node.id, 'date') && (() => {
                        const anchor = dateBtnRefs.current[node.id];
                        const rect = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth/2, top: 80, width: 0, height: 0, bottom: 100 };
                        const popupWidth = 220;
                        const left = Math.max(8, Math.min(rect.left + (rect.width/2) - (popupWidth/2), window.innerWidth - popupWidth - 8));
                        const top = Math.max(8, rect.bottom + 8);
                        return createPortal(
                          <div className="node-popup" style={{ position: 'fixed', left, top, width: popupWidth, zIndex: 5000 }} onClick={(e) => e.stopPropagation()}>
                            <h4 className="font-medium text-gray-800 mb-3">Due date</h4>
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={node.dueDate || ''}
                              onChange={(e) => setNodes(nodes.map(n => n.id === node.id ? { ...n, dueDate: e.target.value } : n))}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                            />
                            {node.dueDate && (
                              <button
                                className="mt-2 text-xs text-red-600 hover:text-red-700 w-full py-1 hover:bg-red-50 rounded"
                                onClick={(e) => { e.stopPropagation(); setNodes(nodes.map(n => n.id === node.id ? { ...n, dueDate: '' } : n)); }}
                              >
                                Clear date
                              </button>
                            )}
                          </div>,
                          document.body
                        );
                      })()}

                      <button
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                        onClick={(e) => { e.stopPropagation(); setCollaboratorNodeId(node.id); setShowCollaboratorDialog(true); }}
                        title="Assign collaborator"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Layout button (root only) */}
                  {node.id === 'root' && isNodeToolbarExpanded(node.id) && (
                    <NodeToolbarLayout
                      shouldRender={true}
                      layoutBtnRef={(el) => { layoutBtnRefs.current[node.id] = el; }}
                      onToggleLayout={() => { /* layout mode toggle */ }}
                      renderLayoutPopup={() => null}
                    />
                  )}

                  {/* Delete when expanded and not root */}
                  {isNodeToolbarExpanded(node.id) && node.id !== 'root' && (
                    <button
                      className="node-toolbar-btn p-2 rounded-xl hover:bg-red-100 text-red-600 transition-colors duration-200 border border-red-200 hover:border-red-300"
                      onClick={(e) => { e.stopPropagation(); nodeOps.deleteNodes([node.id]); }}
                      title="Delete node"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              )}
            </NodeCard>
            );
          })}
        </MindMapCanvas>

        {/* Selection Rectangle for Collaborator Mode */}
        {isSelecting && selectionRect && (
          <div 
            style={{
              position: 'absolute',
              left: `${selectionRect.x * zoom + dragging.pan.x}px`,
              top: `${selectionRect.y * zoom + dragging.pan.y}px`,
              width: `${selectionRect.width * zoom}px`,
              height: `${selectionRect.height * zoom}px`,
              border: '2px dashed #6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              zIndex: 6,
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      {/* Shapes Palette Sidebar */}
      <div className="w-fit border-l bg-white">
        <ShapePalette
          shapeDefinitions={React.useMemo(() => ([
            { type: 'circle',    name: 'Circle',    color: '#3B82F6', icon: '●' },
            { type: 'hexagon',   name: 'Hexagon',   color: '#10B981', icon: '⬡' },
            { type: 'rhombus',   name: 'Rhombus',   color: '#F59E0B', icon: '◆' },
            { type: 'pentagon',  name: 'Pentagon',  color: '#EF4444', icon: '⬟' },
            { type: 'ellipse',   name: 'Ellipse',   color: '#8B5CF6', icon: '◐' },
            { type: 'connector', name: 'Connector', color: '#6B7280', icon: '↔' },
          ]), [])}
          isDarkMode={isDarkMode}
          onShapeDragStart={handleShapeDragStart}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      {/* Collaborator selection dialog */}
      <CollaboratorDialog
        showCollaboratorDialog={showCollaboratorDialog}
        setShowCollaboratorDialog={setShowCollaboratorDialog}
        selectedNodes={selectedNodes}
        setSelectedNodes={setSelectedNodes}
        collaborators={collaborators}
        assignCollaborator={assignCollaborator}
        collaboratorNodeId={collaboratorNodeId}
        setCollaboratorNodeId={setCollaboratorNodeId}
        nodes={nodes}
      />
    </div>
  );
}

MindMap.propTypes = {
  mapId: PropTypes.string,
  onBack: PropTypes.func
};
