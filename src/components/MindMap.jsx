/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import MindMapToolbar from './mindmap/MindMapToolbar';
import MindMapCanvas from './mindmap/MindMapCanvas';
import NodeCard from './mindmap/NodeCard';
import MindMapSearchBar from './mindmap/MindMapSearchBar';
import ConnectionsSvg from './mindmap/ConnectionsSvg';
import ResizeHandle from './mindmap/ResizeHandle';
import CollaboratorAvatar from './mindmap/CollaboratorAvatar';
import ShareDialog from './mindmap/ShareDialog';
import ParentSelectionDialog from './mindmap/ParentSelectionDialog';
import DetachConfirmDialog from './mindmap/DetachConfirmDialog';
import DeleteConfirmDialog from './mindmap/DeleteConfirmDialog';
import CopiedNotification from './mindmap/CopiedNotification';
import NodeToolbarPrimary from './mindmap/NodeToolbarPrimary';
import NodeToolbarConnectionButton from './mindmap/NodeToolbarConnectionButton';
import NodeToolbarSettingsToggle from './mindmap/NodeToolbarSettingsToggle';
import NodeToolbarLayout from './mindmap/NodeToolbarLayout';
import EmojiPicker from './popups/EmojiPicker';
import NotesPopup from './popups/NotesPopup';
import TagsPopup from './popups/TagsPopup';
import PropertiesPanel from './popups/PropertiesPanel';
import DueDatePicker from './popups/DueDatePicker';
import AttachmentsPopup from './popups/AttachmentsPopup';
import CollaboratorPicker from './popups/CollaboratorPicker';

import { getDescendantNodeIds, getAncestorNodeIds } from './mindmap/graphUtils';
import ShapePalette from './mindmap/ShapePalette';
import CollaboratorDialog from './mindmap/CollaboratorDialog';
import { shapeBuilders } from './mindmap/builders';
import ProgressRingChip from './mindmap/ProgressRingChip';

// Hooks
import { useNodePositioning } from '../hooks/useNodePositioning';
import { useNodeOperations } from '../hooks/useNodeOperations';
import { useDragging } from '../hooks/useDragging';
import { useNodeHandlers } from '../hooks/useNodeHandlers';
import { useConnectionDrawing } from '../hooks/useConnectionDrawing';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useNodeSelection } from '../hooks/useNodeSelection';

// Utils
import { getNodeProgress, formatVisitorTime } from '../utils/nodeUtils';

export default function MindMap({ mapId, onBack }) {
  // Detect if mobile/tablet
  const isMobileOrTablet = window.innerWidth < 1024; // lg breakpoint
  const initialZoom = isMobileOrTablet ? 0.7 : 1;
  
  // Minimal, compiling scaffold to restore the app while we refactor
  const [nodes, setNodes] = useState([
    { 
      id: 'root', 
      text: 'Central Task', 
      x: Math.round(window.innerWidth / 2), 
      y: Math.round(window.innerHeight / 2),
      bgColor: '#ffffff',
      fontColor: '#2d3748'
    }
  ]);
  const [connections, setConnections] = useState([]);
  const [zoom, setZoom] = useState(initialZoom);
  const [mode, setMode] = useState('cursor'); // 'cursor' | 'pan'
  const [selectionType, setSelectionType] = useState('simple');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fxOptions, setFxOptions] = useState({ enabled: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchList, setShowSearchList] = useState(false);
  
  // Touch/mobile state
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [isTouchDraggingNode, setIsTouchDraggingNode] = useState(false);
  
  // Collaborator selection mode state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [nodeGroups, setNodeGroups] = useState([]); // Groups of nodes assigned to collaborators with visual shapes
  
  // Group management UI states
  const [openGroupMenuId, setOpenGroupMenuId] = useState(null); // Popup menu for group
  const [hudGroupId, setHudGroupId] = useState(null); // Shows the small quick-actions HUD near a group
  const [movingGroupId, setMovingGroupId] = useState(null); // When set, group box becomes draggable
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [resizingGroupId, setResizingGroupId] = useState(null); // When set, group box shows resize handles
  
  const [expandedNodeToolbars, setExpandedNodeToolbars] = useState({}); // { [nodeId]: bool } - Per-node toolbar expansion
  const [popupOpenFor, setPopupOpenFor] = useState({}); // { [nodeId]: { [popupName]: bool } }
  const [showShapesPalette, setShowShapesPalette] = useState(false); // Mobile shapes palette toggle
  const [showMobileToolbar, setShowMobileToolbar] = useState(false); // Mobile toolbar toggle

  // Per-node button anchor refs for popovers
  const detailsBtnRefs = useRef({});
  const dateBtnRefs = useRef({});
  const attachBtnRefs = useRef({});
  const notesBtnRefs = useRef({});
  const tagBtnRefs = useRef({});
  const layoutBtnRefs = useRef({});
  const collaboratorBtnRefs = useRef({}); // Collaborator button refs
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false);
  const [collaboratorNodeId, setCollaboratorNodeId] = useState(null); // Track which node the collaborator dialog is for
  const [collaborators] = useState([
    { id: 'jd', initials: 'JD', name: 'John Doe', color: '#3B82F6' },
    { id: 'ak', initials: 'AK', name: 'Alex Kim', color: '#10B981' },
    { id: 'mr', initials: 'MR', name: 'Maria Rodriguez', color: '#F59E0B' },
    { id: 'ts', initials: 'TS', name: 'Taylor Smith', color: '#8B5CF6' }
  ]);
  const [attachmentFilters, setAttachmentFilters] = useState({ search: '' }); // Attachment search/filter state
  const [collaboratorSearch, setCollaboratorSearch] = useState(''); // Collaborator search filter
  const emojiBtnRefs = useRef({}); // Emoji button refs
  const [detachConfirmNodeId, setDetachConfirmNodeId] = useState(null); // Track which node has detach confirmation open
  const [parentSelectionState, setParentSelectionState] = useState(null); // { nodeId, parentConnections: [] }
  const [deleteConfirmNodeId, setDeleteConfirmNodeId] = useState(null); // Track which node has delete confirmation open
  const [showShareDialog, setShowShareDialog] = useState(false); // Share link dialog
  const [sharePermission, setSharePermission] = useState('view'); // 'view' or 'edit'
  const [shareLink, setShareLink] = useState(''); // Generated share link
  const [isBookmarked, setIsBookmarked] = useState(false); // Bookmark state
  const [showCopiedNotification, setShowCopiedNotification] = useState(false); // Copied to clipboard notification
  const [shareVisitors, setShareVisitors] = useState([
    // Mock data - replace with real backend data
    { id: 1, name: 'Anonymous User', timestamp: new Date(Date.now() - 3600000).toISOString(), permission: 'view' },
    { id: 2, name: 'John Doe', timestamp: new Date(Date.now() - 7200000).toISOString(), permission: 'edit' },
    { id: 3, name: 'Jane Smith', timestamp: new Date(Date.now() - 86400000).toISOString(), permission: 'view' },
  ]);
  const [rippleNodes, setRippleNodes] = useState(new Set()); // Track nodes with active ripple effect
  const rippleTimeouts = useRef({}); // Store timeout IDs for ripple cleanup

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
    false,
    positioning.findStackedPosition,
    positioning.findStackedChildPosition
  );

  const dragging = useDragging(nodes, setNodes, canvasRef, mode, selectedNodes);

  // Selection management hook
  const selection = useNodeSelection(nodes, selectedNodes, setSelectedNodes, selectionType);

  // Connection drawing hook
  const connectionDrawing = useConnectionDrawing();
  const { connectionFrom, mousePosition, startConnection, cancelConnection, updateMousePosition } = connectionDrawing;

  const nodeHandlers = useNodeHandlers(
    nodes,
    setNodes,
    nodeGroups,
    setNodeGroups,
    selectedNodes,
    setSelectedNodes,
    setShowCollaboratorDialog,
    setMode,
    setSelectionType,
    setOpenGroupMenuId,
    setHudGroupId
  );

  // ============================================
  // UI INTERACTION: Reference dragging state
  // ============================================
  const { pan, setPan, isPanning } = dragging;

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
    globalThis.addEventListener('click', onWinClick);
    return () => globalThis.removeEventListener('click', onWinClick);
  }, []);

  // Cleanup ripple timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(rippleTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

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

  // Keyboard shortcuts hook
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onToggleSearch: () => setShowSearchList(s => !s),
    onEscape: () => {
      setMovingGroupId(null);
      setOpenGroupMenuId(null);
      setResizingGroupId(null);
      selection.clearSelection();
      cancelConnection();
      setMode('cursor');
      setSelectionType('simple');
      setShowCollaboratorDialog(false);
      setIsSelecting(false);
      setSelectionRect(null);
    },
    onDelete: () => {
      if (selectedNodes.length > 0) {
        setDeleteConfirmNodeId(selectedNodes[0]);
      }
    },
    onSelectAll: selection.selectAllNodes,
    onCreateNode: () => {
      if (selectedNodes.length === 1) {
        nodeOps.addChildNode(selectedNodes[0]);
      } else {
        nodeOps.addStandaloneNode();
      }
    },
    onDetachNode: () => {
      if (selectedNodes.length === 1) {
        const hasParent = connections.some(conn => conn.to === selectedNodes[0]);
        if (hasParent) {
          setDetachConfirmNodeId(selectedNodes[0]);
        }
      }
    }
  });

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
        selection.selectNodesByIds(selectedIds);
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

  const toggleSelectNode = (id, event) => {
    // Trigger ripple effect if FX enabled
    if (fxOptions?.enabled && fxOptions?.ripple) {
      setRippleNodes(prev => new Set([...prev, id]));
      // Clear existing timeout
      if (rippleTimeouts.current[id]) {
        clearTimeout(rippleTimeouts.current[id]);
      }
      // Remove ripple after animation
      rippleTimeouts.current[id] = setTimeout(() => {
        setRippleNodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 900);
    }
    
    // If in the middle of creating a connection, connect to the clicked node
    if (connectionFrom && connectionFrom !== id) {
      const exists = connections.some(c => (c.from === connectionFrom && c.to === id) || (c.from === id && c.to === connectionFrom));
      if (!exists) {
        setConnections(connections.concat([{ id: `conn-${Date.now()}`, from: connectionFrom, to: id }]));
        cancelConnection();
      }
      // If connection already exists, do nothing (keep connection mode active)
      return;
    }
    
    // Check if Ctrl (Windows/Linux) or Cmd (Mac) key is pressed
    const isMultiSelect = event && (event.ctrlKey || event.metaKey);
    
    if (isMultiSelect) {
      // Multi-select mode: use hook's toggle
      selection.toggleSelectNode(id);
      // Close popups for deselected nodes
      if (!selectedNodes.includes(id)) {
        setPopupOpenFor(prevPopups => {
          const updated = { ...prevPopups };
          delete updated[id];
          return updated;
        });
      }
    } else {
      // Single select mode: use hook's single select
      selection.selectSingleNode(id);
      setPopupOpenFor({});
    }
  };

  // Detach node from parent (remove connection)
  const detachNodeFromParent = (nodeId) => {
    // Find all parent connections for this node
    const parentConnections = connections.filter(conn => conn.to === nodeId);
    
    if (parentConnections.length === 0) {
      setDetachConfirmNodeId(null);
      return;
    }
    
    // If node has multiple parents, show selection popup
    if (parentConnections.length > 1) {
      setParentSelectionState({
        nodeId,
        parentConnections: parentConnections.map(conn => ({
          connectionId: `${conn.from}-${conn.to}`,
          parentId: conn.from,
          parentNode: nodes.find(n => n.id === conn.from)
        }))
      });
      setDetachConfirmNodeId(null);
    } else {
      // Single parent - remove directly
      setConnections(prev => prev.filter(conn => conn.to !== nodeId));
      setDetachConfirmNodeId(null);
    }
  };
  
  // Remove specific parent connection
  const removeParentConnection = (nodeId, parentId) => {
    setConnections(prev => prev.filter(conn => !(conn.from === parentId && conn.to === nodeId)));
    setParentSelectionState(null);
  };
  
  // Generate share link
  const generateShareLink = () => {
    const baseUrl = globalThis.location.origin;
    const shareId = `${mapId}-${Date.now()}`;
    const link = `${baseUrl}/shared/${shareId}?permission=${sharePermission}`;
    setShareLink(link);
  };
  
  // Remove visitor access
  const removeVisitorAccess = (visitorId) => {
    setShareVisitors(prev => prev.filter(visitor => visitor.id !== visitorId));
    // TODO: Add API call to revoke access on backend
  };
  
  // Copy share link to clipboard
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setShowCopiedNotification(true);
      setTimeout(() => setShowCopiedNotification(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Toggle bookmark
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Save to backend/localStorage
  };
  


  // Derived selections for focus mode
  const selectedNode = selectedNodes[0] || null;
  const relatedNodeIds = React.useMemo(() => {
    if (!selectedNode) return new Set();
    const set = new Set([selectedNode]);
    for (const id of getDescendantNodeIds(connections, selectedNode)) set.add(id);
    for (const id of getAncestorNodeIds(connections, selectedNode)) set.add(id);
    return set;
  }, [selectedNode, connections]);

  const nodePositions = React.useMemo(() => {
    const map = {};
    
    for (const n of nodes) { 
      // Get actual DOM dimensions for accurate bounding box
      const element = document.querySelector(`[data-node-id="${n.id}"]`);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        
        // For now, use actual DOM width/height
        const actualWidth = rect.width;
        const actualHeight = rect.height;
        
        map[n.id] = {
          left: n.x - 150,
          top: n.y - 42,
          right: n.x - 150 + actualWidth,
          bottom: n.y - 42 + actualHeight
        };
      } else {
        // Fallback if element not yet rendered
        const NODE_WIDTH = 300;
        const NODE_HEIGHT = 84;
        map[n.id] = {
          left: n.x - 150,
          top: n.y - 42,
          right: n.x - 150 + NODE_WIDTH,
          bottom: n.y - 42 + NODE_HEIGHT
        };
      }
    }
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

  // Track mouse position for connection preview line
  useEffect(() => {
    if (!connectionFrom) return;

    const handleMouseMove = (e) => {
      updateMousePosition(e.clientX, e.clientY);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cancelConnection();
      }
    };

    globalThis.addEventListener('mousemove', handleMouseMove);
    globalThis.addEventListener('keydown', handleKeyDown);

    return () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [connectionFrom, updateMousePosition, cancelConnection]);

  // ============================================
  // PROGRESS TRACKING (using utility functions)
  // ============================================

  // ============================================
  // NODE DATA UPDATES (via hooks)
  // ============================================
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

  // Toolbar expansion helpers - per-node
  const isNodeToolbarExpanded = (nodeId) => expandedNodeToolbars[nodeId] === true;
  const toggleNodeToolbar = (nodeId) => {
    setExpandedNodeToolbars(prev => ({
      ...prev,
      [nodeId]: !isNodeToolbarExpanded(nodeId)
    }));
  };

  // Extract handlers from hook
  const {
    handleAttachment,
    removeAttachment,
    downloadAttachment,
    setNodeEmoji,
    assignCollaborator,
    selectGroupNodes,
    deleteGroupById,
    toggleCollaboratorInGroup
  } = nodeHandlers;

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
                for (const nodeId of (group.nodeIds || [])) {
                  const node = nodes.find(n => n.id === nodeId);
                  if (node) {
                    initialNodePositions[nodeId] = { x: node.x, y: node.y };
                  }
                }
                
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
                  globalThis.removeEventListener('pointermove', onMove);
                  globalThis.removeEventListener('pointerup', onUp);
                  setIsDraggingGroup(false);
                  setMovingGroupId(null);
                };
                globalThis.addEventListener('pointermove', onMove);
                globalThis.addEventListener('pointerup', onUp);
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
                left: boundingBox.x,
                top: Math.max(boundingBox.y - 58, 10),
                background: '#111827',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                zIndex: 1003,
                minWidth: 240,
                whiteSpace: 'nowrap'
              }}
            >
              Drag to move group — Esc to cancel
            </div>
          )}

          {/* Resize hint pill when in resize mode */}
          {resizingGroupId === group.id && (
            <div
              style={{
                position: 'absolute',
                left: boundingBox.x,
                top: Math.max(boundingBox.y - 58, 10),
                background: '#065F46',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                zIndex: 1003,
                minWidth: 240,
                whiteSpace: 'nowrap'
              }}
            >
              Drag handles to resize — Esc to cancel
            </div>
          )}

          {/* Resize handles when in resize mode */}
          {resizingGroupId === group.id && (
            <>
              {/* Corner handles */}
              {['nw', 'ne', 'sw', 'se'].map(corner => (
                <ResizeHandle
                  key={corner}
                  position={corner}
                  boundingBox={boundingBox}
                  groupId={group.id}
                  zoom={zoom}
                  onResize={(id, newBB) => setNodeGroups(prev => prev.map(g => g.id === id ? { ...g, boundingBox: newBB } : g))}
                  type="corner"
                />
              ))}
              
              {/* Edge handles */}
              {['n', 'e', 's', 'w'].map(edge => (
                <ResizeHandle
                  key={edge}
                  position={edge}
                  boundingBox={boundingBox}
                  groupId={group.id}
                  zoom={zoom}
                  onResize={(id, newBB) => setNodeGroups(prev => prev.map(g => g.id === id ? { ...g, boundingBox: newBB } : g))}
                  type="edge"
                />
              ))}
            </>
          )}

          {/* Clickable primary avatar (outside pointer-events:none box) */}
          <CollaboratorAvatar
            collaborator={collaborator}
            position={{
              left: boundingBox.x + boundingBox.width - badgeOffset,
              top: boundingBox.y - badgeOffset
            }}
            size={badgeSize}
            onClick={() => setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id)}
            onKeyDown={() => setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id)}
            title={`${collaborator.name}'s group settings`}
          />

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
                    <CollaboratorAvatar
                      key={c.id}
                      collaborator={c}
                      position={{
                        left: (boundingBox.x + boundingBox.width - badgeOffset) - ((idx + 1) * (smallSize + gap)),
                        top: boundingBox.y - badgeOffset + (badgeSize - smallSize) / 2
                      }}
                      size={smallSize}
                      onClick={() => setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id)}
                      onKeyDown={() => setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id)}
                      title={`${c.name}'s group settings`}
                    />
                  ))}
                  {remaining > 0 && (
                    <CollaboratorAvatar
                      position={{
                        left: (boundingBox.x + boundingBox.width - badgeOffset) - ((shown.length + 1) * (smallSize + gap)),
                        top: boundingBox.y - badgeOffset + (badgeSize - smallSize) / 2
                      }}
                      size={smallSize}
                      onClick={() => setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id)}
                      onKeyDown={() => setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id)}
                      title={`+${remaining} more`}
                      isCountBadge={true}
                      count={remaining}
                    />
                  )}
                </React.Fragment>
              );
            })()
          )}

          {/* Popup menu for group actions */}
          {openGroupMenuId === group.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setOpenGroupMenuId(null);
                }
              }}
              role="dialog"
              tabIndex={0}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
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
                <button
                  onClick={() => { setResizingGroupId(group.id); setOpenGroupMenuId(null); }}
                  title="Resize the group rectangle with draggable handles"
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #D1FAE5', background: '#ECFDF5', fontSize: 12, fontWeight: 600, color: '#065F46', cursor: 'pointer' }}
                >
                  Resize
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
      selection.selectSingleNode(mainId);
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

  // Center view on mobile/tablet on mount
  React.useEffect(() => {
    if (isMobileOrTablet && nodes.length > 0) {
      const rootNode = nodes.find(n => n.id === 'root');
      if (rootNode) {
        // Center the root node in the viewport
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        dragging.setPan({
          x: centerX - rootNode.x * initialZoom,
          y: centerY - rootNode.y * initialZoom
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Touch event handlers for mobile support
  const [touchDragNodeId, setTouchDragNodeId] = useState(null);
  const [touchDragOffset, setTouchDragOffset] = useState({ x: 0, y: 0 });
  const [touchInitialPositions, setTouchInitialPositions] = useState({});
  const [isTouchPanning, setIsTouchPanning] = useState(false);
  const touchPanRef = useRef({ startX: 0, startY: 0 });
  const touchAnimationFrameRef = useRef(null);
  const lastTouchPositionRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single touch - could be pan or node drag
      const touch = e.touches[0];
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      
      // Check if touching a node
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const nodeElement = target?.closest('[data-node-id]');
      
      if (nodeElement) {
        const nodeId = nodeElement.dataset.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        
        if (node && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          setIsTouchDraggingNode(true);
          setTouchDragNodeId(nodeId);
          
          // Calculate offset between touch point and node position
          setTouchDragOffset({
            x: touch.clientX - rect.left - (node.x + dragging.pan.x),
            y: touch.clientY - rect.top - (node.y + dragging.pan.y),
          });
          
          // Store initial positions for multi-select drag
          if (selectedNodes.includes(nodeId) && selectedNodes.length > 1) {
            const positions = {};
            selectedNodes.forEach(id => {
              const n = nodes.find(node => node.id === id);
              if (n) {
                positions[id] = { x: n.x, y: n.y };
              }
            });
            setTouchInitialPositions(positions);
          }
        }
      } else {
        // Start canvas panning
        setIsTouchPanning(true);
        touchPanRef.current = {
          startX: touch.clientX - dragging.pan.x,
          startY: touch.clientY - dragging.pan.y,
        };
      }
    } else if (e.touches.length === 2) {
      // Two-finger pinch for zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastTouchDistance(distance);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      if (isTouchDraggingNode && touchDragNodeId && canvasRef.current) {
        // Drag the node - use RAF for smooth 60fps updates
        e.preventDefault();
        
        // Store the latest touch position
        lastTouchPositionRef.current = { x: touch.clientX, y: touch.clientY };
        
        // Cancel any pending animation frame
        if (touchAnimationFrameRef.current) {
          cancelAnimationFrame(touchAnimationFrameRef.current);
        }
        
        // Schedule update on next frame
        touchAnimationFrameRef.current = requestAnimationFrame(() => {
          if (!canvasRef.current) return;
          
          const rect = canvasRef.current.getBoundingClientRect();
          const newX = lastTouchPositionRef.current.x - rect.left - dragging.pan.x - touchDragOffset.x;
          const newY = lastTouchPositionRef.current.y - rect.top - dragging.pan.y - touchDragOffset.y;
          
          // If multiple nodes are selected, move them all together
          if (selectedNodes.includes(touchDragNodeId) && selectedNodes.length > 1 && Object.keys(touchInitialPositions).length > 0) {
            const deltaX = newX - touchInitialPositions[touchDragNodeId].x;
            const deltaY = newY - touchInitialPositions[touchDragNodeId].y;
            
            setNodes(prev =>
              prev.map(n => {
                if (selectedNodes.includes(n.id) && touchInitialPositions[n.id]) {
                  return {
                    ...n,
                    x: touchInitialPositions[n.id].x + deltaX,
                    y: touchInitialPositions[n.id].y + deltaY
                  };
                }
                return n;
              })
            );
          } else {
            // Single node drag
            setNodes(prev =>
              prev.map(n =>
                n.id === touchDragNodeId ? { ...n, x: newX, y: newY } : n
              )
            );
          }
          
          touchAnimationFrameRef.current = null;
        });
      } else if (isTouchPanning) {
        // Canvas panning - also use RAF for smoothness
        if (touchAnimationFrameRef.current) {
          cancelAnimationFrame(touchAnimationFrameRef.current);
        }
        
        lastTouchPositionRef.current = { x: touch.clientX, y: touch.clientY };
        
        touchAnimationFrameRef.current = requestAnimationFrame(() => {
          dragging.setPan({
            x: lastTouchPositionRef.current.x - touchPanRef.current.startX,
            y: lastTouchPositionRef.current.y - touchPanRef.current.startY,
          });
          touchAnimationFrameRef.current = null;
        });
      }
    } else if (e.touches.length === 2) {
      // Two-finger pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (lastTouchDistance) {
        const delta = distance - lastTouchDistance;
        const zoomSpeed = 0.005;
        const newZoom = Math.max(0.1, Math.min(3, zoom + delta * zoomSpeed));
        setZoom(newZoom);
      }
      
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e) => {
    // Cancel any pending animation frame
    if (touchAnimationFrameRef.current) {
      cancelAnimationFrame(touchAnimationFrameRef.current);
      touchAnimationFrameRef.current = null;
    }
    
    if (e.touches.length === 0) {
      setLastTouchDistance(null);
      setTouchStartPos(null);
      setIsTouchDraggingNode(false);
      setTouchDragNodeId(null);
      setTouchInitialPositions({});
      setIsTouchPanning(false);
    } else if (e.touches.length === 1) {
      // One finger left, reset pinch zoom
      setLastTouchDistance(null);
    }
  };

  // Determine cursor style based on mode and state
  let cursorStyle = 'default';
  if (mode === 'cursor' && selectionType === 'collaborator') {
    cursorStyle = 'crosshair';
  } else if (isPanning) {
    cursorStyle = 'grabbing';
  } else if (connectionFrom) {
    cursorStyle = 'crosshair';
  } else if (mode === 'pan') {
    cursorStyle = 'grab';
  } else if (mode === 'cursor') {
    // In cursor mode, show grab cursor to indicate panning is available on empty space
    cursorStyle = 'grab';
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      <div
        className="flex-1 relative overflow-hidden touch-manipulation"
        ref={canvasRef}
        style={{ cursor: cursorStyle, touchAction: 'none' }}
        onMouseDown={(e) => {
          // Only deselect if clicking on canvas background AND not starting a node drag
          const clickedNode = e.target instanceof HTMLElement ? e.target.closest('[data-node-id]') : null;
          
          if (!clickedNode && (e.target === e.currentTarget || e.target.closest('.mindmap-canvas-inner'))) {
            selection.clearSelection();
            setPopupOpenFor({});
          }
          
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
            showMobileToolbar={showMobileToolbar}
            isMobile={isMobileOrTablet}
            onClose={() => setShowMobileToolbar(false)}
          />,
          document.body
        )}

        {/* Hamburger Menu and Search Bar - Top Left */}
        <div className="absolute top-2 md:top-28 left-2 md:left-4 z-20 flex items-center gap-2">
          {/* Hamburger Menu Button - Mobile/Tablet Only */}
          <button
            onClick={() => setShowMobileToolbar(!showMobileToolbar)}
            className={`lg:hidden p-2 rounded-lg shadow-lg border transition-all duration-200 touch-manipulation ${
              showMobileToolbar
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
            }`}
            title={showMobileToolbar ? 'Hide toolbar' : 'Show toolbar'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* Search Bar */}
          <MindMapSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSearchList={showSearchList}
            setShowSearchList={setShowSearchList}
            nodes={nodes}
            setSelectedNode={(id) => id ? selection.selectSingleNode(id) : selection.clearSelection()}
            setPan={setPan}
            deleteNode={deleteNode}
            deleteNodeCascade={deleteNodeCascade}
          />
        </div>

        {/* Share, Bookmark, and Shapes Toggle Buttons - Top Right */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 flex items-center gap-1 md:gap-2">
          {/* Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowShareDialog(true);
              setShowShapesPalette(false); // Close shapes palette when opening share dialog
            }}
            className="p-2 md:p-3 rounded-lg md:rounded-xl bg-white/95 text-gray-700 shadow-lg border border-gray-200/50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 touch-manipulation"
            title="Share mind map"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
            </svg>
          </button>
          
          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 md:p-3 rounded-lg md:rounded-xl shadow-lg border transition-all duration-200 touch-manipulation ${
              isBookmarked 
                ? 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600' 
                : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300'
            }`}
            title={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          
          {/* Shapes Palette Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShapesPalette(!showShapesPalette);
            }}
            className={`p-2 md:p-3 rounded-lg md:rounded-xl shadow-lg border transition-all duration-200 touch-manipulation ${
              showShapesPalette
                ? 'bg-indigo-500 text-white border-indigo-600'
                : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
            }`}
            title={showShapesPalette ? 'Hide shapes' : 'Show shapes'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>

        {/* Connection Mode Banner */}
        {connectionFrom && (
          <div 
            className="fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-50 px-3 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-full shadow-xl shadow-blue-500/40 flex items-center gap-2 md:gap-3 max-w-[90vw] md:max-w-none"
            style={{ animation: 'slideDown 0.3s ease-out' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span className="font-medium text-xs md:text-sm">Tap another node to connect</span>
            <button 
              onClick={cancelConnection}
              className="ml-1 md:ml-2 p-1 hover:bg-blue-600 rounded-full transition-colors touch-manipulation flex-shrink-0"
              title="Cancel (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        {/* Collaborator Mode Banner */}
        {mode === 'cursor' && selectionType === 'collaborator' && (
          <div 
            className="fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-50 px-3 md:px-6 py-2 md:py-3 bg-cyan-600 text-white rounded-lg shadow-xl shadow-cyan-600/40 flex items-center gap-2 md:gap-3 mx-2"
            style={{ animation: 'slideDown 0.3s ease-out', maxWidth: '90vw' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <span className="font-semibold text-xs md:text-sm">Collaborator Selection</span>
              <span className="text-[10px] md:text-xs text-cyan-100 hidden sm:block">Drag to select nodes, then assign to a collaborator</span>
            </div>
          </div>
        )}

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
              connectionFrom={connectionFrom}
              mousePosition={mousePosition}
              zoom={zoom}
              pan={dragging.pan}
            />
          )}
        >
          {/* Nodes */}
          {nodes.map((node) => {
            const isNodeMatching = searchQuery 
              ? node.text.toLowerCase().includes(searchQuery.toLowerCase()) 
              : true;
            
            // Determine if this node is a parent or child of selected node(s)
            const isParentOfSelected = selectedNodes.length === 1 && connections.some(c => c.from === node.id && c.to === selectedNodes[0]);
            const isChildOfSelected = selectedNodes.length === 1 && connections.some(c => c.from === selectedNodes[0] && c.to === node.id);
            
            // Check if this node has progress indicator
            const progress = getNodeProgress(node.id, connections, nodes);
            const hasProgress = progress && !node.completed;
            
            return (
              <React.Fragment key={node.id}>
                <NodeCard
                  node={node}
                  selected={selectedNodes.includes(node.id)}
                  onSelect={toggleSelectNode}
                onUpdateText={updateNodeText}
                searchQuery={searchQuery}
                isMatching={isNodeMatching}
                connectionMode={!!connectionFrom}
                isConnectionSource={connectionFrom === node.id}
                isAlreadyConnected={connectionFrom && connectionFrom !== node.id && connections.some(c => (c.from === connectionFrom && c.to === node.id) || (c.from === node.id && c.to === connectionFrom))}
                isParentOfSelected={isParentOfSelected}
                isChildOfSelected={isChildOfSelected}
                hasProgress={hasProgress}
                fxOptions={fxOptions}
                hasRipple={rippleNodes.has(node.id)}
                onMouseDown={(e) => {
                  // allow dragging via startPanning handler; nothing here
                }}
              >
              {/* Tags below node */}
              {node.showTags !== false && node.tags && node.tags.length > 0 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1.5 flex-wrap justify-center max-w-xs z-10">
                  {node.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className={`inline-block px-2.5 py-1 text-xs rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-medium shadow-sm relative overflow-hidden ${
                        fxOptions?.enabled && fxOptions?.tagShimmer ? 'animate-shimmer' : ''
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress Indicator (top-left) - Shows completion count for parent nodes */}
              {(() => {
                const progress = getNodeProgress(node.id, connections, nodes);
                const hasProgress = progress && !node.completed;
                if (!hasProgress) return null;
                
                return (
                  <div 
                    className="absolute top-3 left-3 flex items-center gap-1 z-20"
                    title={`Total Progress: ${progress.completed}/${progress.total} tasks completed (${progress.percentage}%) - ${progress.depth + 1} levels deep`}
                  >
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                        {/* Background circle */}
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16" 
                          stroke="#d1d5db" 
                          strokeWidth="3" 
                          fill="white" 
                        />
                        {/* Progress arc */}
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16"
                          stroke={progress.percentage === 100 ? '#10b981' : '#3b82f6'}
                          strokeWidth="3" 
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress.percentage / 100)}`}
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
                    pct={getNodeProgress(node.id, connections, nodes)?.percentage ?? (node.completed ? 100 : 0)} 
                    isDarkMode={false} 
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
              
              {/* Per-node toolbar overlay - Only visible when exactly ONE node is selected */}
              {selectedNodes.length === 1 && selectedNodes.includes(node.id) && (
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full z-20" style={{ top: '-25px' }}>
                <div className="enhanced-node-toolbar backdrop-blur-md bg-white/90 shadow-lg border border-white/20 rounded-2xl p-2 lg:flex lg:items-center lg:gap-1 grid grid-cols-4 gap-1 max-w-[90vw] lg:max-w-none">
                  {/* PRIMARY GROUP - always visible */}
                  <div className="col-span-4 lg:col-span-auto flex items-center gap-1 justify-center lg:justify-start">
                    <NodeToolbarPrimary
                      node={node}
                      isToolbarExpanded={isNodeToolbarExpanded(node.id)}
                      onToggleComplete={onToggleComplete}
                      onAddChild={onAddChild}
                      onRequestDelete={onRequestDelete}
                      onRequestDetach={(nodeId) => setDetachConfirmNodeId(nodeId)}
                      hasParent={connections.some(conn => conn.to === node.id)}
                    />
                  
                    {/* Connection button for connectors */}
                    <NodeToolbarConnectionButton
                      nodeId={node.id}
                      isActive={connectionFrom === node.id}
                      onStart={startConnection}
                      onCancel={cancelConnection}
                    />
                  </div>

                  {/* Visual group when expanded - Desktop only */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Content group when expanded */}
                  {isNodeToolbarExpanded(node.id) && (
                    <>
                      <button
                        ref={(el) => { attachBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-purple-50 text-purple-600 transition-colors duration-200 border border-purple-200 hover:border-purple-300 touch-manipulation col-span-1"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'attach'); }}
                        title="Manage file attachments"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
                          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                      </button>
                      <AttachmentsPopup
                        show={isPopupOpen(node.id, 'attach')}
                        anchorRef={attachBtnRefs.current[node.id] ? { current: attachBtnRefs.current[node.id] } : null}
                        nodeId={node.id}
                        attachments={node.attachments}
                        searchFilter={attachmentFilters.search}
                        onSearchChange={(value) => setAttachmentFilters({ ...attachmentFilters, search: value })}
                        onFileSelect={(e) => handleAttachment(e, node.id)}
                        onDownload={downloadAttachment}
                        onRemove={(attachmentId) => removeAttachment(node.id, attachmentId)}
                        onClose={() => togglePopup(node.id, 'attach')}
                      />
                      
                      <button
                        ref={(el) => { notesBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors duration-200 border border-blue-200 hover:border-blue-300 col-span-1"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'notes'); }}
                        title="Add or edit notes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <line x1="10" y1="9" x2="8" y2="9"></line>
                        </svg>
                      </button>
                      <NotesPopup
                        show={isPopupOpen(node.id, 'notes')}
                        anchorRef={notesBtnRefs.current[node.id] ? { current: notesBtnRefs.current[node.id] } : null}
                        notes={node.notes}
                        onChange={(value) => setNodes(nodes.map(n => n.id === node.id ? { ...n, notes: value } : n))}
                        onClose={() => togglePopup(node.id, 'notes')}
                      />

                      <button
                        ref={(el) => { emojiBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors duration-200 border border-amber-200 hover:border-amber-300 col-span-1"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'emoji'); }}
                        title="Choose emoji icon"
                      >
                        {node.emoji || '😊'}
                      </button>
                      <EmojiPicker
                        show={isPopupOpen(node.id, 'emoji')}
                        anchorRef={emojiBtnRefs.current[node.id] ? { current: emojiBtnRefs.current[node.id] } : null}
                        onSelect={(emoji) => {
                          setNodeEmoji(node.id, emoji);
                          togglePopup(node.id, 'emoji');
                        }}
                        onClose={() => togglePopup(node.id, 'emoji')}
                      />

                      <button
                        ref={(el) => { tagBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-teal-50 text-teal-600 transition-colors duration-200 border border-teal-200 hover:border-teal-300 col-span-1"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'tags'); }}
                        title="Add or manage tags"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                          <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                      </button>
                      <TagsPopup
                        show={isPopupOpen(node.id, 'tags')}
                        anchorRef={tagBtnRefs.current[node.id] ? { current: tagBtnRefs.current[node.id] } : null}
                        tags={node.tags}
                        showTags={node.showTags}
                        onToggleShowTags={(checked) => setNodes(nodes.map(n => n.id === node.id ? { ...n, showTags: checked } : n))}
                        onAddTag={(tag) => setNodes(nodes.map(n => n.id === node.id ? { ...n, tags: [...(n.tags || []), tag] } : n))}
                        onRemoveTag={(tag) => setNodes(nodes.map(n => n.id === node.id ? { ...n, tags: (n.tags || []).filter(t => t !== tag) } : n))}
                        onClose={() => togglePopup(node.id, 'tags')}
                      />
                    </>
                  )}

                  {/* Divider - Desktop only */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Meta group when expanded */}
                  {isNodeToolbarExpanded(node.id) && (
                    <>
                      <button
                        ref={(el) => { detailsBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-colors duration-200 border border-indigo-200 hover:border-indigo-300 touch-manipulation col-span-1"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'details'); }}
                        title="Edit priority, status, and description"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                      <PropertiesPanel
                        show={isPopupOpen(node.id, 'details')}
                        anchorRef={detailsBtnRefs.current[node.id] ? { current: detailsBtnRefs.current[node.id] } : null}
                        nodeId={node.id}
                        priority={node.priority}
                        status={node.status}
                        description={node.description}
                        onPriorityChange={(priority) => setNodes(nodes.map(n => n.id === node.id ? { ...n, priority } : n))}
                        onStatusChange={(status) => setNodes(nodes.map(n => n.id === node.id ? { ...n, status } : n))}
                        onDescriptionChange={(description) => setNodes(nodes.map(n => n.id === node.id ? { ...n, description } : n))}
                        onClose={() => togglePopup(node.id, 'details')}
                      />

                      <button
                        ref={(el) => { dateBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors duration-200 border border-rose-200 hover:border-rose-300 col-span-1"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'date'); }}
                        title="Set due date"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </button>
                      <DueDatePicker
                        show={isPopupOpen(node.id, 'date')}
                        anchorRef={dateBtnRefs.current[node.id] ? { current: dateBtnRefs.current[node.id] } : null}
                        dueDate={node.dueDate}
                        onDueDateChange={(dueDate) => setNodes(nodes.map(n => n.id === node.id ? { ...n, dueDate } : n))}
                        onClearDate={() => setNodes(nodes.map(n => n.id === node.id ? { ...n, dueDate: '' } : n))}
                        onClose={() => togglePopup(node.id, 'date')}
                      />

                      <button
                        ref={(el) => { collaboratorBtnRefs.current[node.id] = el; }}
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-cyan-50 text-cyan-600 transition-colors duration-200 border border-cyan-200 hover:border-cyan-300 col-span-1"
                        onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'collaborator'); }}
                        title="Assign team member"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </button>
                      <CollaboratorPicker
                        show={isPopupOpen(node.id, 'collaborator')}
                        anchorRef={collaboratorBtnRefs.current[node.id] ? { current: collaboratorBtnRefs.current[node.id] } : null}
                        collaborators={collaborators}
                        selectedCollaboratorIds={node.collaborators || []}
                        searchQuery={collaboratorSearch}
                        onSearchChange={setCollaboratorSearch}
                        onToggleCollaborator={(collabId) => assignCollaborator(node.id, collabId)}
                        onClose={() => togglePopup(node.id, 'collaborator')}
                      />
                    </>
                  )}

                  {/* Divider - Desktop only */}
                  {isNodeToolbarExpanded(node.id) && (
                    <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Final controls group */}
                  <div className="col-span-4 lg:col-span-auto flex items-center gap-1 justify-center lg:justify-start">
                    {/* Layout button (root only) */}
                    {node.id === 'root' && isNodeToolbarExpanded(node.id) && (
                      <NodeToolbarLayout
                        shouldRender={true}
                        layoutBtnRef={(el) => { layoutBtnRefs.current[node.id] = el; }}
                        onToggleLayout={() => { /* layout mode toggle */ }}
                        renderLayoutPopup={() => null}
                      />
                    )}

                    {/* Settings toggle - Always at the end before delete */}
                    <NodeToolbarSettingsToggle
                      isToolbarExpanded={isNodeToolbarExpanded(node.id)}
                      onToggle={() => toggleNodeToolbar(node.id)}
                    />

                    {/* Delete button at the end - Always visible for non-root nodes */}
                    {node.id !== 'root' && (
                      <button
                        className="node-toolbar-btn p-2 rounded-xl hover:bg-red-100 text-red-600 transition-colors duration-200 border border-red-200 hover:border-red-300 touch-manipulation"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmNodeId(node.id); }}
                        title="Delete node"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              )}
            </NodeCard>
          </React.Fragment>
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
      
      {/* Backdrop Overlay for Shapes Palette */}
      {showShapesPalette && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowShapesPalette(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowShapesPalette(false)}
          role="button"
          tabIndex={0}
          aria-label="Close shapes palette"
        />
      )}
      
      {/* Mobile Backdrop Overlay for Toolbar */}
      {showMobileToolbar && isMobileOrTablet && (
        <div 
          className="fixed inset-0 bg-black/50 z-15"
          onClick={() => setShowMobileToolbar(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowMobileToolbar(false)}
          role="button"
          tabIndex={0}
          aria-label="Close toolbar"
        />
      )}
      
      {/* Shapes Palette Sidebar - Only render when shown */}
      {showShapesPalette && (
        <div className="w-fit border-l bg-white transition-transform duration-300 ease-in-out translate-x-0 absolute right-0 top-0 bottom-0 z-30 shadow-2xl">
          <ShapePalette
            shapeDefinitions={React.useMemo(() => ([
              { type: 'circle',    name: 'Circle',    color: '#3B82F6', icon: '●' },
              { type: 'rhombus',   name: 'Rhombus',   color: '#F59E0B', icon: '◆' },
              { type: 'pentagon',  name: 'Pentagon',  color: '#EF4444', icon: '⬟' },
              { type: 'ellipse',   name: 'Ellipse',   color: '#8B5CF6', icon: '◐' },
            ]), [])}
            onShapeDragStart={handleShapeDragStart}
          />
        </div>
      )}

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

      {/* Share Dialog */}
      <ShareDialog
        show={showShareDialog}
        onClose={() => {
          setShowShareDialog(false);
          setShareLink('');
        }}
        sharePermission={sharePermission}
        setSharePermission={setSharePermission}
        shareLink={shareLink}
        onCopyLink={copyShareLink}
        shareVisitors={shareVisitors}
        formatVisitorTime={formatVisitorTime}
        onGenerateLink={generateShareLink}
        onRemoveVisitor={removeVisitorAccess}
      />

      {/* Copied Notification */}
      <CopiedNotification show={showCopiedNotification} />

      {/* Parent Selection Dialog - for nodes with multiple parents */}
      <ParentSelectionDialog
        parentSelectionState={parentSelectionState}
        onClose={() => setParentSelectionState(null)}
        onSelectParent={removeParentConnection}
      />

      {/* Detachment Confirmation Dialog */}
      <DetachConfirmDialog
        show={!!detachConfirmNodeId}
        onClose={() => setDetachConfirmNodeId(null)}
        onConfirm={() => detachNodeFromParent(detachConfirmNodeId)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        show={!!deleteConfirmNodeId}
        onClose={() => setDeleteConfirmNodeId(null)}
        onConfirm={() => {
          nodeOps.deleteNodes([deleteConfirmNodeId]);
          setDeleteConfirmNodeId(null);
        }}
      />
    </div>
  );
}

MindMap.propTypes = {
  mapId: PropTypes.string,
  onBack: PropTypes.func
};
