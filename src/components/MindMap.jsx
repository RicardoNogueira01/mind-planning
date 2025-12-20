/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Check, LayoutTemplate, Sparkles, ZoomIn, ZoomOut, Maximize2, Brain, Target, Link2, Users, Clock, AlertTriangle, DollarSign, Grid3X3, Receipt, UserPlus, PlayCircle, Sun, Scale, ArrowRightLeft, BookOpen, Layers, Zap } from 'lucide-react';
import TemplateGallery from './templates/TemplateGallery';
import { instantiateTemplate } from '../templates/templateEngine';
import { applyLayout } from '../utils/layoutAlgorithms';
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
import GroupMembershipDialog from './mindmap/GroupMembershipDialog';
import CopiedNotification from './mindmap/CopiedNotification';
import NodeToolbarPrimary from './mindmap/NodeToolbarPrimary';
import NodeToolbarConnectionButton from './mindmap/NodeToolbarConnectionButton';
import NodeToolbarSettingsToggle from './mindmap/NodeToolbarSettingsToggle';
import NodeToolbarBackgroundColor from './mindmap/NodeToolbarBackgroundColor';
import NodeToolbarFontColor from './mindmap/NodeToolbarFontColor';
import EmojiPicker from './popups/EmojiPicker';
import NotesPopup from './popups/NotesPopup';
import TagsPopup from './popups/TagsPopup';
import PropertiesPanel from './popups/PropertiesPanel';
import AttachmentsPopup from './popups/AttachmentsPopup';
import CollaboratorPicker from './popups/CollaboratorPicker';
import ThemePicker from './popups/ThemePicker';
import { getTheme } from '../config/mindMapThemes';
// @ts-ignore
import { useTheme } from '../context/ThemeContext';
import ImageAnalyzerModal from './mindmap/ImageAnalyzerModal';
import ViewSelector from './mindmap/ViewSelector';
import GanttView from './mindmap/views/GanttView';
import BoardView from './mindmap/views/BoardView';
import ListView from './mindmap/views/ListView';
import ExcelView from './mindmap/views/ExcelView';
import AnalyticsView from './mindmap/views/AnalyticsView';
import GhostPreview from './mindmap/GhostPreview';

// Enhanced Features
import {
  AITaskDecomposer,
  DependencyAnalyzer,
  WorkloadHeatmap,
  TimeTravel,
  FocusMode,
  RiskMatrix,
  BudgetTracker,
  ResourceMatrix,
  ExpenseTracker,
  SmartAssigner,
  NextActionHighlighter,
  DailyDigest,
  DecisionLog,
  HandoffChecklist,
  KnowledgeBase,
  CrossProjectTimeline,
  AutomationBuilder
} from './enhanced';

import { getDescendantNodeIds, getAncestorNodeIds } from './mindmap/graphUtils';
import ShapePalette from './mindmap/ShapePalette';
import CollaboratorDialog from './mindmap/CollaboratorDialog';
import { shapeBuilders } from './mindmap/builders';

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
  // @ts-ignore
  const { currentTheme: globalTheme } = useTheme();

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
  const [showTemplateGallery, setShowTemplateGallery] = useState(false); // Template selection modal
  const [showLayoutMenu, setShowLayoutMenu] = useState(false); // Auto-layout dropdown
  const [nodeLayoutMenuOpen, setNodeLayoutMenuOpen] = useState(null); // Track which node's layout menu is open
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false); // Image upload & analysis modal
  const [viewMode, setViewMode] = useState('mindmap'); // View mode: mindmap, gantt, board, list, excel, analytics
  const [currentTheme, setCurrentTheme] = useState('meister'); // Mind map theme
  const [showThemePicker, setShowThemePicker] = useState(false); // Theme picker popup
  const [showMobileActionsMenu, setShowMobileActionsMenu] = useState(false); // Mobile actions dropdown menu
  const [currentLayoutType, setCurrentLayoutType] = useState('free'); // Track current layout for connection style

  // Sync with global theme
  useEffect(() => {
    if (globalTheme && globalTheme !== 'default') {
      setCurrentTheme(globalTheme);
    }
  }, [globalTheme]);

  // Ghost Preview State - Shows translucent preview of nodes before placement
  const [ghostPreview, setGhostPreview] = useState({
    show: false,
    nodes: [],
    connections: [],
    template: null, // Store the original template for reference
  });

  // Per-node button anchor refs for popovers
  const detailsBtnRefs = useRef({});
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
  const themeBtnRef = useRef(null); // Theme picker button ref
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

  // Group membership dialog state
  const [groupMembershipDialog, setGroupMembershipDialog] = useState({
    show: false,
    nodeId: null,
    nodeName: '',
    group: null
  });
  const [joiningGroupNodes, setJoiningGroupNodes] = useState(new Set()); // Track nodes with join animation
  const [pulsingGroups, setPulsingGroups] = useState(new Set()); // Track groups with pulse animation

  // ============================================
  // ENHANCED FEATURES STATE
  // ============================================
  const [showEnhancedPanel, setShowEnhancedPanel] = useState(null); // 'ai' | 'dependencies' | 'workload' | 'timetravel' | 'focus' | 'risk' | 'budget' | 'resources' | 'expenses'
  const [projectSnapshots, setProjectSnapshots] = useState([]);
  const [focusTaskNode, setFocusTaskNode] = useState(null);

  // Budget and Resource Management State
  const [projectBudget, setProjectBudget] = useState(50000); // Total project budget
  const [hourlyRates, setHourlyRates] = useState({
    'jd': 50,
    'ak': 60,
    'mr': 55,
    'ts': 45
  });

  // Canvas ref
  const canvasRef = useRef(null);

  // ============================================
  // HELPER FUNCTIONS (must be before hooks that use them)
  // ============================================
  const getNodeGroup = (nodeId) => {
    return nodeGroups.find(group =>
      group.nodeIds && group.nodeIds.includes(nodeId)
    );
  };

  const constrainPositionToGroup = (x, y, groupBoundingBox) => {
    const nodeWidth = 300;
    const nodeHeight = 56;
    const padding = 10; // Espaço mínimo das bordas

    // IMPORTANTE: x,y representa o CENTRO do node
    // NodeCard renderiza em: left: node.x - 150, top: node.y - 42
    // Então as bordas reais do node são:
    // left: x - 150
    // right: x + 150
    // top: y - 42  
    // bottom: y + 14 (y - 42 + 56)

    const nodeLeft = x - 150;
    const nodeRight = x + 150;
    const nodeTop = y - 42;
    const nodeBottom = y + 14;

    const groupLeft = groupBoundingBox.x;
    const groupRight = groupBoundingBox.x + groupBoundingBox.width;
    const groupTop = groupBoundingBox.y;
    const groupBottom = groupBoundingBox.y + groupBoundingBox.height;

    // Calcular novo x (centro) garantindo que as bordas fiquem dentro
    let constrainedX = x;
    if (nodeLeft < groupLeft + padding) {
      constrainedX = groupLeft + padding + 150; // Ajustar para o centro
    } else if (nodeRight > groupRight - padding) {
      constrainedX = groupRight - padding - 150; // Ajustar para o centro
    }

    // Calcular novo y (centro vertical) garantindo que as bordas fiquem dentro  
    let constrainedY = y;
    if (nodeTop < groupTop + padding) {
      constrainedY = groupTop + padding + 42; // Ajustar para o centro
    } else if (nodeBottom > groupBottom - padding) {
      constrainedY = groupBottom - padding - 14; // Ajustar para o centro (y - 42 + 56 = y + 14)
    }

    return {
      x: constrainedX,
      y: constrainedY
    };
  };

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
    positioning.findStackedChildPosition,
    positioning.pushCollidingNodes
  );

  const dragging = useDragging(nodes, connections, setNodes, canvasRef, mode, selectedNodes, getNodeGroup, constrainPositionToGroup, zoom, positioning.pushCollidingNodes);

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

  // Close layout menu on outside click
  useEffect(() => {
    const onWinClick = () => setNodeLayoutMenuOpen(null);
    globalThis.addEventListener('click', onWinClick);
    return () => globalThis.removeEventListener('click', onWinClick);
  }, []);

  // Resolve node collisions when switching back to mindmap view
  // This ensures nodes don't overlap when their data was modified in other views
  // (e.g., status/tags changed in Excel view can affect node height)
  const prevViewMode = useRef(viewMode);
  useEffect(() => {
    // Only run when switching TO mindmap from another view
    if (viewMode === 'mindmap' && prevViewMode.current !== 'mindmap') {
      // Use a small delay to ensure the DOM has updated with any new node sizes
      const timer = setTimeout(() => {
        if (nodes.length > 1) {
          // Resolve collisions for all nodes
          const resolvedNodes = positioning.resolveAllCollisions(nodes);

          // Only update if there were actual position changes
          const hasChanges = resolvedNodes.some((node, index) =>
            node.x !== nodes[index]?.x || node.y !== nodes[index]?.y
          );

          if (hasChanges) {
            setNodes(resolvedNodes);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    prevViewMode.current = viewMode;
  }, [viewMode, nodes, positioning]);

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
    onSelectDescendants: () => {
      // If a node is selected, select it and all its descendants
      if (selectedNodes.length === 1) {
        const nodeId = selectedNodes[0];
        const descendantIds = getDescendantNodeIds(connections, nodeId);
        const allIds = [nodeId, ...descendantIds];
        setSelectedNodes(allIds);
      }
    },
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

  // Wheel event for zooming - Only in mindmap view
  useEffect(() => {
    const handleWheel = (e) => {
      // Only handle zoom in mindmap view mode
      if (viewMode !== 'mindmap') return;

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
  }, [canvasRef, viewMode]);

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

      // Update selected nodes based on mode
      if (selectedIds.length > 0) {
        selection.selectNodesByIds(selectedIds);

        // Show collaborator dialog only in collaborator mode
        if (selectionType === 'collaborator') {
          setShowCollaboratorDialog(true);
        }
        // In multi-select mode, just select the nodes (no dialog)
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

  // Start template preview - Shows ghost preview before placing
  const startTemplatePreview = (template) => {
    // Create preview nodes centered at origin (will be offset by mouse position)
    const { nodes: templateNodes, connections: templateConns } = instantiateTemplate(template, {
      centerX: 0,
      centerY: 0,
      scaleNodes: 1,
      preserveColors: true
    });

    // Generate new unique IDs for template nodes to avoid conflicts
    const idMap = {};
    const previewNodes = templateNodes.map(node => {
      const newId = `${node.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      idMap[node.id] = newId;
      return { ...node, id: newId };
    });

    // Update connection references with new IDs
    const previewConns = templateConns.map(conn => ({
      ...conn,
      id: `${conn.id}_${Date.now()}`,
      from: idMap[conn.from] || conn.from,
      to: idMap[conn.to] || conn.to
    }));

    // Enter ghost preview mode
    setGhostPreview({
      show: true,
      nodes: previewNodes,
      connections: previewConns,
      template: template,
    });

    setShowTemplateGallery(false);
  };

  // Confirm template placement - Called when user clicks to place
  const handleConfirmTemplatePlacement = (position) => {
    if (!ghostPreview.show || ghostPreview.nodes.length === 0) return;

    // Calculate the center of the preview nodes
    const xs = ghostPreview.nodes.map(n => n.x);
    const ys = ghostPreview.nodes.map(n => n.y);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    // Calculate offset to move nodes to the clicked position
    const offsetX = position.x - centerX;
    const offsetY = position.y - centerY;

    // Apply offset to all nodes
    const placedNodes = ghostPreview.nodes.map(node => ({
      ...node,
      x: node.x + offsetX,
      y: node.y + offsetY,
    }));

    // Add nodes and connections to the canvas
    setNodes(prev => [...prev, ...placedNodes]);
    setConnections(prev => [...prev, ...ghostPreview.connections]);

    // Exit ghost preview mode
    setGhostPreview({
      show: false,
      nodes: [],
      connections: [],
      template: null,
    });
  };

  // Cancel template placement
  const handleCancelTemplatePlacement = () => {
    setGhostPreview({
      show: false,
      nodes: [],
      connections: [],
      template: null,
    });
  };

  // Legacy function name for backwards compatibility (redirects to preview mode)
  const handleApplyTemplate = (template) => {
    startTemplatePreview(template);
  };

  // Apply auto-layout
  const handleApplyLayout = (layoutType) => {
    const result = applyLayout(
      nodes,
      connections,
      { type: layoutType, spacing: 30, animate: true },
      window.innerWidth,
      window.innerHeight
    );

    // Update nodes with new positions
    setNodes(result.nodes);
    setCurrentLayoutType(layoutType); // Track the layout for connection style
    setShowLayoutMenu(false);

    // Immediately calculate new nodePositions so connections render correctly
    // This prevents the stale position issue during the 50ms useLayoutEffect delay
    const newPositions = {};
    for (const n of result.nodes) {
      const nodeWidth = calculateNodeWidth(n);
      const halfWidth = nodeWidth / 2;
      const NODE_HEIGHT = 56; // Estimated height

      newPositions[n.id] = {
        left: n.x - halfWidth,
        top: n.y - 28,
        right: n.x + halfWidth,
        bottom: n.y - 28 + NODE_HEIGHT
      };
    }
    setNodePositions(newPositions);
  };

  // Apply layout to specific node's children only
  const handleApplyNodeLayout = (parentNodeId, layoutType) => {
    // Find all direct children of this node
    const childConnections = connections.filter(conn => conn.from === parentNodeId);
    const childNodeIds = childConnections.map(conn => conn.to);

    if (childNodeIds.length === 0) {
      setNodeLayoutMenuOpen(null);
      return; // No children to layout
    }

    // Get parent node position to center the layout around it
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode) return;

    // Filter to only children nodes + parent for reference
    const childNodes = nodes.filter(n => childNodeIds.includes(n.id));
    const subsetNodes = [parentNode, ...childNodes];
    const subsetConnections = childConnections;

    // Apply layout to subset
    const result = applyLayout(
      subsetNodes,
      subsetConnections,
      { type: layoutType, spacing: 30, animate: true },
      window.innerWidth,
      window.innerHeight
    );

    // Calculate offset to position children relative to parent, not centered in canvas
    const layoutParent = result.nodes.find(n => n.id === parentNodeId);
    if (!layoutParent) return;

    const offsetX = parentNode.x - layoutParent.x;
    const offsetY = parentNode.y - layoutParent.y;

    // Merge results back - only update children positions (offset to parent), keep parent fixed
    const updatedNodes = nodes.map(node => {
      if (childNodeIds.includes(node.id)) {
        const layoutNode = result.nodes.find(n => n.id === node.id);
        if (layoutNode) {
          return {
            ...layoutNode,
            x: layoutNode.x + offsetX,
            y: layoutNode.y + offsetY
          };
        }
      }
      return node;
    });

    setNodes(updatedNodes);
    setNodeLayoutMenuOpen(null);

    // Immediately calculate new nodePositions so connections render correctly
    const newPositions = {};
    for (const n of updatedNodes) {
      const nodeWidth = calculateNodeWidth(n);
      const halfWidth = nodeWidth / 2;
      const NODE_HEIGHT = 56; // Estimated height

      newPositions[n.id] = {
        left: n.x - halfWidth,
        top: n.y - 28,
        right: n.x + halfWidth,
        bottom: n.y - 28 + NODE_HEIGHT
      };
    }
    setNodePositions(newPositions);
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

  // Helper function to calculate node width (matches NodeCard calculation)
  const calculateNodeWidth = (node) => {
    const baseWidth = 120; // Minimum width
    const maxWidth = 300; // Maximum width
    const charWidth = 8; // Approximate pixels per character
    const padding = 32; // Horizontal padding

    const textWidth = (node.text || 'New Task').length * charWidth + padding;
    const emojiWidth = node.emoji ? 40 : 0; // Space for emoji

    const calculatedWidth = Math.min(maxWidth, Math.max(baseWidth, textWidth + emojiWidth));
    return calculatedWidth;
  };

  // Create a hash of node content to detect when text changes (affects height)
  const nodeContentHash = React.useMemo(() => {
    return nodes.map(n => `${n.id}:${n.text?.length || 0}:${n.x}:${n.y}`).join('|');
  }, [nodes]);

  // Use state for node positions so we can update after DOM renders
  const [nodePositions, setNodePositions] = React.useState({});

  // Measure node positions after DOM updates using useLayoutEffect
  React.useLayoutEffect(() => {
    // Small delay to ensure DOM has fully rendered
    const timeoutId = setTimeout(() => {
      const map = {};

      for (const n of nodes) {
        // Get actual DOM dimensions for accurate bounding box
        const element = document.querySelector(`[data-node-id="${n.id}"]`);

        if (element) {
          const rect = element.getBoundingClientRect();

          // Divide by zoom to get actual logical dimensions (getBoundingClientRect includes zoom transform)
          const actualWidth = rect.width / zoom;
          const actualHeight = rect.height / zoom;
          const halfWidth = actualWidth / 2;

          map[n.id] = {
            left: n.x - halfWidth,
            top: n.y - 28, // Adjusted for new height
            right: n.x + halfWidth,
            bottom: n.y - 28 + actualHeight
          };
        } else {
          // Fallback: calculate width based on content
          const nodeWidth = calculateNodeWidth(n);
          const halfWidth = nodeWidth / 2;
          const NODE_HEIGHT = 56; // Estimated height

          map[n.id] = {
            left: n.x - halfWidth,
            top: n.y - 28,
            right: n.x + halfWidth,
            bottom: n.y - 28 + NODE_HEIGHT
          };
        }
      }
      setNodePositions(map);
    }, 50); // Small delay to ensure DOM is updated

    return () => clearTimeout(timeoutId);
  }, [nodes, zoom, nodeContentHash]);

  // ============================================
  // NODE TOOLBAR ACTIONS (via hooks)
  // ============================================
  const onToggleComplete = nodeOps.toggleNodeComplete;
  const updateNodeText = nodeOps.updateNodeText;
  const onAddChild = nodeOps.addChildNode;
  const onRequestDelete = (nodeId) => setDeleteConfirmNodeId(nodeId);
  const addStandaloneNode = nodeOps.addStandaloneNode;

  // Auto-arrange children in a neat vertical column
  const onAutoArrangeChildren = (parentNodeId) => {
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode) return;

    // Find all direct children
    const childNodeIds = connections
      .filter(conn => conn.from === parentNodeId)
      .map(conn => conn.to);

    if (childNodeIds.length === 0) return;

    const childNodes = nodes.filter(n => childNodeIds.includes(n.id));

    // Constants for layout
    const NODE_HEIGHT = 70;
    const NODE_SPACING = 10;
    const HORIZONTAL_OFFSET = 250; // Distance to the right of parent

    // Calculate starting Y position to center children relative to parent
    const totalHeight = childNodes.length * NODE_HEIGHT + (childNodes.length - 1) * NODE_SPACING;
    const startY = parentNode.y - totalHeight / 2 + NODE_HEIGHT / 2;

    // Position each child
    const updatedNodes = nodes.map(node => {
      const childIndex = childNodeIds.indexOf(node.id);
      if (childIndex === -1) return node;

      return {
        ...node,
        x: parentNode.x + HORIZONTAL_OFFSET,
        y: startY + childIndex * (NODE_HEIGHT + NODE_SPACING)
      };
    });

    setNodes(updatedNodes);
  };

  // Handle analyzed image data and create mind map
  const handleImageAnalyze = (data) => {
    const { centralNode, nodes: branchNodes } = data;

    // Get canvas center
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? (canvasRect.width / 2) : 500;
    const centerY = canvasRect ? (canvasRect.height / 2) : 400;

    // Create central node
    const centralNodeId = `node-${Date.now()}`;
    const centralNodeObj = {
      id: centralNodeId,
      text: centralNode.text,
      x: centerX,
      y: centerY,
      width: 180,
      height: 60,
      bgColor: centralNode.bgColor,
      fontColor: centralNode.fontColor,
      shape: 'rectangle'
    };

    // Create branch nodes and connections
    const newNodes = [centralNodeObj];
    const newConnections = [];

    branchNodes.forEach((branchNode, index) => {
      const { angle, distance } = branchNode.relativePosition;
      const angleRad = (angle * Math.PI) / 180;

      // Calculate position using polar coordinates
      const x = centerX + distance * Math.cos(angleRad);
      const y = centerY + distance * Math.sin(angleRad);

      const nodeId = `node-${Date.now()}-${index}`;
      newNodes.push({
        id: nodeId,
        text: branchNode.text,
        x,
        y,
        width: 160,
        height: 60,
        bgColor: branchNode.bgColor,
        fontColor: branchNode.fontColor,
        shape: 'rectangle'
      });

      // Create connection from central node to branch node
      newConnections.push({
        id: `conn-${Date.now()}-${index}`,
        from: centralNodeId,
        to: nodeId
      });
    });

    // Add all nodes and connections to state
    setNodes(prev => [...prev, ...newNodes]);
    setConnections(prev => [...prev, ...newConnections]);

    // Close modal
    setShowImageAnalyzer(false);
  };

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

  // Group membership helpers
  const isNodeInGroupSpace = (nodeX, nodeY, group) => {
    const { boundingBox } = group;

    // nodeX, nodeY representa o CENTRO do node
    // NodeCard renderiza em: left: node.x - 150, top: node.y - 42
    const nodeLeft = nodeX - 150;
    const nodeRight = nodeX + 150;
    const nodeTop = nodeY - 42;
    const nodeBottom = nodeY + 14; // nodeY - 42 + 56

    const groupLeft = boundingBox.x;
    const groupRight = boundingBox.x + boundingBox.width;
    const groupTop = boundingBox.y;
    const groupBottom = boundingBox.y + boundingBox.height;

    // Para detectar quando arrastar para dentro, verificar se o centro está dentro
    // Isso torna mais intuitivo - não precisa arrastar todo o node
    const centerIsInside = (
      nodeX >= groupLeft &&
      nodeX <= groupRight &&
      nodeY >= groupTop &&
      nodeY <= groupBottom
    );

    return centerIsInside; // Usa o centro para detectar entrada no grupo
  };
  const checkNodeGroupMembership = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Check each group to see if the node is now in its space
    for (const group of nodeGroups) {
      // Skip if node is already in this group
      if (group.nodeIds && group.nodeIds.includes(nodeId)) continue;

      if (isNodeInGroupSpace(node.x, node.y, group)) {
        // Node is in group space but not a member - show dialog
        setGroupMembershipDialog({
          show: true,
          nodeId,
          nodeName: node.text || 'Untitled',
          group
        });
        return;
      }
    }
  };

  const addNodeToGroup = (nodeId, group) => {
    // Add animation class to node
    setJoiningGroupNodes(prev => new Set(prev).add(nodeId));

    // Add pulse animation to group
    setPulsingGroups(prev => new Set(prev).add(group.id));

    // Update group to include the node
    setNodeGroups(prev => prev.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          nodeIds: [...(g.nodeIds || []), nodeId]
        };
      }
      return g;
    }));

    // Collect all collaborator IDs from the group
    const collaboratorIds = [];

    // Add primary collaborator ID
    if (group.collaborator && group.collaborator.id) {
      collaboratorIds.push(group.collaborator.id);
    }

    // Add extra collaborators IDs
    if (group.extraCollaborators && Array.isArray(group.extraCollaborators)) {
      group.extraCollaborators.forEach(collab => {
        if (collab && collab.id && !collaboratorIds.includes(collab.id)) {
          collaboratorIds.push(collab.id);
        }
      });
    }

    // Update node to add all collaborator IDs
    if (collaboratorIds.length > 0) {
      setNodes(prev => prev.map(n => {
        if (n.id === nodeId) {
          const existingCollabs = Array.isArray(n.collaborators) ? n.collaborators : [];
          const newCollabs = [...existingCollabs];

          // Add each collaborator ID if not already present
          collaboratorIds.forEach(collabId => {
            if (!newCollabs.includes(collabId)) {
              newCollabs.push(collabId);
            }
          });

          return {
            ...n,
            collaborators: newCollabs
          };
        }
        return n;
      }));
    }

    // Remove animations after delay
    setTimeout(() => {
      setJoiningGroupNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
      setPulsingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(group.id);
        return newSet;
      });
    }, 600);
  };

  const removeNodeFromGroup = (nodeId) => {
    // Find the group containing this node
    const group = getNodeGroup(nodeId);
    if (!group) return;

    // Remove node from group's nodeIds
    setNodeGroups(prev => prev.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          nodeIds: (g.nodeIds || []).filter(id => id !== nodeId)
        };
      }
      return g;
    }));

    // Remove all collaborators from the group from this node
    const groupCollabIds = [];
    if (group.collaborator?.id) {
      groupCollabIds.push(group.collaborator.id);
    }
    if (group.extraCollaborators && Array.isArray(group.extraCollaborators)) {
      group.extraCollaborators.forEach(collab => {
        if (collab?.id) groupCollabIds.push(collab.id);
      });
    }

    if (groupCollabIds.length > 0) {
      setNodes(prev => prev.map(n => {
        if (n.id === nodeId) {
          const existingCollabs = Array.isArray(n.collaborators) ? n.collaborators : [];
          return {
            ...n,
            collaborators: existingCollabs.filter(collabId => !groupCollabIds.includes(collabId))
          };
        }
        return n;
      }));
    }
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
      const isPulsing = pulsingGroups.has(group.id);

      return (
        <React.Fragment key={group.id}>
          {/* Group dashed area; gets highlighted when moving */}
          <div
            className={isPulsing ? 'animate-pulse-ring' : ''}
            style={{
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
              color: collaborator.color,
              boxShadow: movingGroupId === group.id
                ? `0 0 0 2px ${collaborator.color}40, 0 10px 30px ${collaborator.color}33`
                : isPulsing
                  ? `0 0 0 4px ${collaborator.color}40, 0 0 20px ${collaborator.color}50`
                  : `0 0 0 1px ${collaborator.color}20`,
              transition: 'box-shadow 120ms ease-out, border 120ms ease-out, background 120ms ease-out'
            }}
          />

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
    } catch { }
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

          // Calculate offset between touch point and node position (considering zoom)
          setTouchDragOffset({
            x: (touch.clientX - rect.left - dragging.pan.x) / zoom - node.x,
            y: (touch.clientY - rect.top - dragging.pan.y) / zoom - node.y,
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
          let newX = (lastTouchPositionRef.current.x - rect.left - dragging.pan.x) / zoom - touchDragOffset.x;
          let newY = (lastTouchPositionRef.current.y - rect.top - dragging.pan.y) / zoom - touchDragOffset.y;

          // Check if node is in a group and constrain movement
          const group = getNodeGroup(touchDragNodeId);
          if (group && group.boundingBox) {
            const constrained = constrainPositionToGroup(newX, newY, group.boundingBox);
            newX = constrained.x;
            newY = constrained.y;
          }

          // If multiple nodes are selected, move them all together
          if (selectedNodes.includes(touchDragNodeId) && selectedNodes.length > 1 && Object.keys(touchInitialPositions).length > 0) {
            const deltaX = newX - touchInitialPositions[touchDragNodeId].x;
            const deltaY = newY - touchInitialPositions[touchDragNodeId].y;

            setNodes(prev =>
              prev.map(n => {
                if (selectedNodes.includes(n.id) && touchInitialPositions[n.id]) {
                  let finalX = touchInitialPositions[n.id].x + deltaX;
                  let finalY = touchInitialPositions[n.id].y + deltaY;

                  // Apply group constraints to each selected node if applicable
                  const nodeGroup = getNodeGroup(n.id);
                  if (nodeGroup && nodeGroup.boundingBox) {
                    const constrained = constrainPositionToGroup(finalX, finalY, nodeGroup.boundingBox);
                    finalX = constrained.x;
                    finalY = constrained.y;
                  }

                  return {
                    ...n,
                    x: finalX,
                    y: finalY
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

    const wasDraggingNode = touchDragNodeId !== null;
    const draggedNodeId = touchDragNodeId;

    if (e.touches.length === 0) {
      setLastTouchDistance(null);
      setTouchStartPos(null);
      setIsTouchDraggingNode(false);
      setTouchDragNodeId(null);
      setTouchInitialPositions({});
      setIsTouchPanning(false);

      // Check if node was dragged and should join a group
      if (wasDraggingNode && draggedNodeId) {
        checkNodeGroupMembership(draggedNodeId);
      }
    } else if (e.touches.length === 1) {
      // One finger left, reset pinch zoom
      setLastTouchDistance(null);
    }
  };

  // Determine cursor style based on mode and state
  let cursorStyle = 'default';
  if (mode === 'cursor' && selectionType === 'collaborator') {
    cursorStyle = 'crosshair';
  } else if (mode === 'cursor' && selectionType === 'multi') {
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

  // Handle node updates from BoardView (status changes from drag-and-drop)
  const handleNodeUpdate = (nodeId, updates) => {
    // Handle new task creation
    if (nodeId === '__new__') {
      setNodes(prevNodes => [...prevNodes, updates]);
    } else {
      // Handle existing task update
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === nodeId ? { ...node, ...updates } : node
        )
      );
    }
  };

  // Get current theme config
  const activeTheme = getTheme(currentTheme);

  return (
    <div
      className="flex w-full h-screen overflow-hidden transition-colors duration-300"
      style={{ background: activeTheme.canvas.background }}
    >
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

          // Check if in collaborator or multi-select mode
          if (mode === 'cursor' && (selectionType === 'collaborator' || selectionType === 'multi')) {
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
          const dragInfo = dragging.stopPanning();

          // Check if node was dragged and should join a group
          if (dragInfo && dragInfo.wasDraggingNode && dragInfo.draggedNodeId) {
            checkNodeGroupMembership(dragInfo.draggedNodeId);
          }
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
        {/* Toolbar rendered via Portal to avoid parent stacking context issues - Only show in mindmap view */}
        {viewMode === 'mindmap' && createPortal(
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
            showMobileToolbar={showMobileToolbar}
            isMobile={isMobileOrTablet}
            onClose={() => setShowMobileToolbar(false)}
            onImageAnalyze={() => setShowImageAnalyzer(true)}
          />,
          document.body
        )}

        {/* Back Button - Top Left for non-mindmap views */}
        {viewMode !== 'mindmap' && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4 z-30">
            <button
              onClick={onBack}
              className="p-2.5 md:p-3 rounded-xl bg-white/95 text-gray-700 shadow-lg border border-gray-200/50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 touch-manipulation"
              title="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
          </div>
        )}

        {/* Hamburger Menu - Top left for mindmap view */}
        {viewMode === 'mindmap' && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4 z-40">
            {/* Hamburger Menu Button - Mobile/Tablet Only, mindmap view only */}
            <button
              onClick={() => setShowMobileToolbar(!showMobileToolbar)}
              className={`lg:hidden p-2.5 rounded-xl shadow-lg border transition-all duration-200 touch-manipulation ${showMobileToolbar
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                }`}
              title={showMobileToolbar ? 'Hide toolbar' : 'Show toolbar'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        {/* Search Bar - Below toolbar for mindmap view */}
        {viewMode === 'mindmap' && (
          <div className="absolute top-16 md:top-20 left-2 md:left-4 z-30">
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
        )}

        {/* View Selector - Top Center on desktop, Top Right below buttons on mobile */}
        <div className="absolute top-2 md:top-4 left-1/2 md:left-1/2 right-2 md:right-auto transform md:-translate-x-1/2 z-20 hidden md:block">
          <ViewSelector
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Template, Layout, Share, Bookmark, and Shapes Toggle Buttons - Top Right */}
        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20">
          <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
            {/* View Selector - Mobile Only (below action buttons) */}
            <div className="md:hidden w-full flex justify-end">
              <ViewSelector
                currentView={viewMode}
                onViewChange={setViewMode}
              />
            </div>

            {/* Mindmap-only buttons */}
            {viewMode === 'mindmap' && (
              <>
                {/* Mobile: Single menu button */}
                <div className="md:hidden relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMobileActionsMenu(!showMobileActionsMenu);
                    }}
                    className="p-2.5 rounded-xl bg-white/95 text-gray-700 shadow-lg border border-gray-200/50 hover:bg-gray-100 transition-all duration-200 touch-manipulation"
                    title="Actions"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>

                  {/* Mobile Actions Dropdown */}
                  {showMobileActionsMenu && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[70]">
                      <button
                        onClick={() => {
                          setShowTemplateGallery(true);
                          setShowMobileActionsMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                      >
                        <LayoutTemplate className="w-5 h-5 text-purple-600" />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">Use Template</div>
                          <div className="text-xs text-gray-500">Apply layout template</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowLayoutMenu(true);
                          setShowMobileActionsMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors"
                      >
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">Auto Layout</div>
                          <div className="text-xs text-gray-500">Organize nodes</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowShapesPalette(true);
                          setShowMobileActionsMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">Shapes</div>
                          <div className="text-xs text-gray-500">Node shapes</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop: Individual buttons */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Template Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowTemplateGallery(true);
                      setShowShapesPalette(false);
                    }}
                    className="p-3 rounded-xl bg-white/95 text-gray-700 shadow-lg border border-gray-200/50 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
                    title="Use Template"
                  >
                    <LayoutTemplate className="w-5 h-5" />
                  </button>

                  {/* Auto-Layout Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLayoutMenu(!showLayoutMenu);
                        setShowShapesPalette(false);
                      }}
                      className={`p-3 rounded-xl shadow-lg border transition-all duration-200 ${showLayoutMenu
                        ? 'bg-indigo-500 text-white border-indigo-600'
                        : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                        }`}
                      title="Auto Layout"
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>

                    {/* Layout dropdown */}
                    {showLayoutMenu && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-[70] w-56">
                        <h3 className="font-semibold text-sm text-gray-900 px-3 py-2 border-b">Choose Layout</h3>
                        <div className="flex flex-col gap-1 pt-2">
                          {[
                            { type: 'mindmap', label: 'Mind Map', icon: '🧠', desc: 'Balanced radial' },
                            { type: 'force-directed', label: 'Force Directed', icon: '⚡', desc: 'Physics-based' },
                            { type: 'tree-vertical', label: 'Tree (Vertical)', icon: '🌲', desc: 'Top to bottom' },
                            { type: 'tree-horizontal', label: 'Tree (Horizontal)', icon: '🌳', desc: 'Left to right' },
                            { type: 'radial', label: 'Radial', icon: '🎯', desc: 'Circular layers' },
                            { type: 'circular', label: 'Circular', icon: '⭕', desc: 'Perfect circle' },
                            { type: 'grid', label: 'Grid Snap', icon: '⚙️', desc: 'Align to grid' }
                          ].map(layout => (
                            <button
                              key={layout.type}
                              onClick={() => handleApplyLayout(layout.type)}
                              className="flex items-center gap-3 px-3 py-2 text-left hover:bg-indigo-50 rounded-lg transition-colors group"
                            >
                              <span className="text-xl">{layout.icon}</span>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">{layout.label}</div>
                                <div className="text-xs text-gray-500">{layout.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shapes Palette Toggle - HIDDEN FOR NOW
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShapesPalette(!showShapesPalette);
                    }}
                    className={`p-3 rounded-xl shadow-lg border transition-all duration-200 ${showShapesPalette
                      ? 'bg-indigo-500 text-white border-indigo-600'
                      : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                      }`}
                    title={showShapesPalette ? 'Hide shapes' : 'Show shapes'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                  */}

                  {/* Theme Picker Toggle */}
                  <button
                    ref={themeBtnRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowThemePicker(!showThemePicker);
                    }}
                    className={`p-3 rounded-xl shadow-lg border transition-all duration-200 ${showThemePicker
                      ? 'bg-purple-500 text-white border-purple-600'
                      : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300'
                      }`}
                    title={showThemePicker ? 'Hide themes' : 'Choose theme'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="13.5" cy="6.5" r="2.5"></circle>
                      <circle cx="17.5" cy="10.5" r="2.5"></circle>
                      <circle cx="8.5" cy="7.5" r="2.5"></circle>
                      <circle cx="6.5" cy="12.5" r="2.5"></circle>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"></path>
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Share Button - Always visible */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowShareDialog(true);
                setShowShapesPalette(false);
              }}
              className="p-2.5 md:p-3 rounded-xl bg-white/95 text-gray-700 shadow-lg border border-gray-200/50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
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

            {/* Bookmark Button - Always visible */}
            <button
              onClick={toggleBookmark}
              className={`p-2.5 md:p-3 rounded-xl shadow-lg border transition-all duration-200 ${isBookmarked
                ? 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600'
                : 'bg-white/95 text-gray-700 border-gray-200/50 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300'
                }`}
              title={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
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

        {/* Multi-Select Mode Banner */}
        {mode === 'cursor' && selectionType === 'multi' && (
          <div
            className="fixed top-16 md:top-20 left-1/2 transform -translate-x-1/2 z-50 px-3 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg shadow-xl shadow-green-600/40 flex items-center gap-2 md:gap-3 mx-2"
            style={{ animation: 'slideDown 0.3s ease-out', maxWidth: '90vw' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" strokeDasharray="4 4"></rect>
              <path d="m9 9 10 10"></path>
            </svg>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <span className="font-semibold text-xs md:text-sm">Multi-Select Mode</span>
              <span className="text-[10px] md:text-xs text-green-100 hidden sm:block">Drag to select multiple nodes for bulk operations</span>
            </div>
            <button
              onClick={() => setSelectionType('simple')}
              className="ml-auto p-1 hover:bg-green-700 rounded-full transition-colors"
              title="Exit Multi-Select Mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}

        {/* Different View Modes */}
        {viewMode === 'gantt' && (
          <div
            className="absolute inset-0 top-16 md:top-20 overflow-hidden z-20 bg-white"
            onWheel={(e) => e.stopPropagation()}
          >
            <GanttView
              nodes={nodes}
              connections={connections}
            />
          </div>
        )}

        {viewMode === 'board' && (
          <div
            className="absolute inset-0 top-16 md:top-20 overflow-auto z-20 bg-gray-50"
            onWheel={(e) => e.stopPropagation()}
          >
            <BoardView
              nodes={nodes}
              onNodeUpdate={handleNodeUpdate}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div
            className="absolute inset-0 top-16 md:top-20 overflow-hidden z-20 bg-white"
            onWheel={(e) => e.stopPropagation()}
          >
            <ListView
              nodes={nodes}
            />
          </div>
        )}

        {viewMode === 'excel' && (
          <div
            className="absolute inset-0 top-16 md:top-20 overflow-hidden z-20 bg-white"
            onWheel={(e) => e.stopPropagation()}
          >
            <ExcelView
              nodes={nodes}
              connections={connections}
              onNodeUpdate={handleNodeUpdate}
              onNodesChange={setNodes}
              collaborators={collaborators}
            />
          </div>
        )}

        {viewMode === 'analytics' && (
          <div
            className="absolute inset-0 top-16 md:top-20 overflow-auto z-20 bg-gray-50"
            onWheel={(e) => e.stopPropagation()}
          >
            <AnalyticsView
              nodes={nodes}
              connections={connections}
            />
          </div>
        )}

        {/* Canvas with pan/zoom - Mind Map View */}
        {viewMode === 'mindmap' && (
          <MindMapCanvas
            pan={dragging.pan}
            zoom={zoom}
            renderNodeGroups={renderNodeGroups}
            renderConnections={(
              <ConnectionsSvg
                connections={connections}
                nodes={nodes}
                nodePositions={nodePositions}
                isDarkMode={activeTheme.isDark}
                selectedNode={selectedNode}
                relatedNodeIds={relatedNodeIds}
                connectionFrom={connectionFrom}
                mousePosition={mousePosition}
                zoom={zoom}
                pan={dragging.pan}
                connectionStyle={
                  currentLayoutType === 'tree-horizontal' ? 'bracket' :
                    currentLayoutType === 'tree-vertical' ? 'bracket' :
                      'curved'
                }
                themeColors={activeTheme.connections}
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
                    theme={activeTheme}
                    className={joiningGroupNodes.has(node.id) ? 'animate-join-group' : ''}
                    collaborators={collaborators}
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
                            className="inline-block px-2.5 py-1 text-xs rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-medium shadow-sm relative overflow-hidden"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Progress Indicator (bottom-left outside) - Shows completion count for parent nodes */}
                    {(() => {
                      const progress = getNodeProgress(node.id, connections, nodes);
                      const hasProgress = progress && !node.completed;
                      if (!hasProgress) return null;

                      return (
                        <div
                          className="absolute -bottom-10 -left-10 flex items-center gap-1 z-20"
                          title={`Total Progress: ${progress.completed}/${progress.total} tasks completed (${progress.percentage}%) - ${progress.depth + 1} levels deep`}
                        >
                          <div className="relative w-11 h-11">
                            <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
                              {/* Background circle */}
                              <circle
                                cx="22" cy="22" r="18"
                                stroke="#e5e7eb"
                                strokeWidth="3"
                                fill="white"
                              />
                              {/* Progress arc */}
                              <circle
                                cx="22" cy="22" r="18"
                                stroke={progress.percentage === 100 ? '#10b981' : '#3b82f6'}
                                strokeWidth="3"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 18}`}
                                strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress.percentage / 100)}`} strokeLinecap="round" className="transition-all duration-300"
                              />
                            </svg>
                            {/* Centered count text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700" style={{ fontFamily: 'DM Sans, sans-serif' }}>
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

                    {/* Collaborator avatars on node */}
                    {(() => {
                      // Get group collaborators if node is in a group
                      const nodeGroup = getNodeGroup(node.id);
                      const groupCollaborators = nodeGroup?.collaborator?.id ? [nodeGroup.collaborator.id] : [];
                      const extraGroupCollabs = nodeGroup?.extraCollaborators?.map(c => c.id) || [];
                      const allGroupCollabs = [...groupCollaborators, ...extraGroupCollabs];

                      // Combine node collaborators with group collaborators
                      const nodeCollabs = Array.isArray(node.collaborators) ? node.collaborators : [];
                      const allCollabs = [...new Set([...nodeCollabs, ...allGroupCollabs])]; // Remove duplicates

                      return allCollabs.length > 0 && (
                        <div
                          className="flex gap-1 z-30"
                          style={{
                            position: 'absolute',
                            top: '-18px',
                            left: '8px'
                          }}
                        >
                          {allCollabs.map(collabId => {
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
                      );
                    })()}

                    {/* Remove from group button - Shows when node is selected AND in a group */}
                    {selectedNodes.includes(node.id) && (() => {
                      const nodeGroup = getNodeGroup(node.id);
                      if (!nodeGroup) return null;
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNodeFromGroup(node.id);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-md transition-all duration-200 z-40 hover:scale-110"
                          title={`Remove from ${nodeGroup.collaborator?.name || 'group'}'s group`}
                          style={{
                            boxShadow: `0 2px 8px ${nodeGroup.collaborator?.color || '#ef4444'}40`
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      );
                    })()}

                    {/* Per-node toolbar overlay - Only visible when exactly ONE node is selected */}
                    {selectedNodes.length === 1 && selectedNodes.includes(node.id) && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full z-20" style={{ top: '-16px' }}>
                        <div className="enhanced-node-toolbar bg-white shadow-lg border border-gray-100 rounded-2xl p-2 lg:flex lg:items-center lg:gap-0.5 grid grid-cols-4 gap-1 max-w-[90vw] lg:max-w-none">
                          {/* PRIMARY GROUP - always visible */}
                          <div className="col-span-4 lg:col-span-auto flex items-center gap-0.5 justify-center lg:justify-start">
                            <NodeToolbarPrimary
                              node={node}
                              isToolbarExpanded={isNodeToolbarExpanded(node.id)}
                              onToggleComplete={onToggleComplete}
                              onAddChild={onAddChild}
                              onRequestDelete={onRequestDelete}
                              onRequestDetach={(nodeId) => setDetachConfirmNodeId(nodeId)}
                              onAutoArrangeChildren={onAutoArrangeChildren}
                              hasParent={connections.some(conn => conn.to === node.id)}
                              hasChildren={connections.some(conn => conn.from === node.id)}
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
                            <div className="hidden lg:block w-px h-6 mx-1 bg-gray-200"></div>
                          )}

                          {/* Content group when expanded */}
                          {isNodeToolbarExpanded(node.id) && (
                            <>
                              <button
                                ref={(el) => { attachBtnRefs.current[node.id] = el; }}
                                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 col-span-1"
                                onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'attach'); }}
                                title="Manage file attachments"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 col-span-1"
                                onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'notes'); }}
                                title="Add or edit notes"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                attachments={node.attachments}
                                collaborators={collaborators}
                                onChange={(value) => setNodes(nodes.map(n => n.id === node.id ? { ...n, notes: value } : n))}
                                onClose={() => togglePopup(node.id, 'notes')}
                              />

                              <button
                                ref={(el) => { emojiBtnRefs.current[node.id] = el; }}
                                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 col-span-1"
                                onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'emoji'); }}
                                title="Choose emoji icon"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                </svg>
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
                                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 col-span-1"
                                onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'tags'); }}
                                title="Add or manage tags"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

                              {/* Background Color Picker */}
                              <NodeToolbarBackgroundColor
                                isOpen={isPopupOpen(node.id, 'bgColor')}
                                currentColor={node.bgColor}
                                onToggle={() => togglePopup(node.id, 'bgColor')}
                                onSelect={(color) => {
                                  setNodes(nodes.map(n => n.id === node.id ? { ...n, bgColor: color } : n));
                                  togglePopup(node.id, 'bgColor');
                                }}
                                onClose={() => togglePopup(node.id, 'bgColor')}
                              />

                              {/* Font Color Picker */}
                              <NodeToolbarFontColor
                                isOpen={isPopupOpen(node.id, 'fontColor')}
                                currentColor={node.fontColor}
                                onToggle={() => togglePopup(node.id, 'fontColor')}
                                onSelect={(color) => {
                                  setNodes(nodes.map(n => n.id === node.id ? { ...n, fontColor: color } : n));
                                  togglePopup(node.id, 'fontColor');
                                }}
                                onClose={() => togglePopup(node.id, 'fontColor')}
                              />
                            </>
                          )}

                          {/* Divider - Desktop only */}
                          {isNodeToolbarExpanded(node.id) && (
                            <div className="hidden lg:block w-px h-6 mx-1 bg-gray-200"></div>
                          )}

                          {/* Meta group when expanded */}
                          {isNodeToolbarExpanded(node.id) && (
                            <>
                              <button
                                ref={(el) => { detailsBtnRefs.current[node.id] = el; }}
                                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 col-span-1"
                                onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'details'); }}
                                title="Edit priority, status, and description"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                startDate={node.startDate}
                                dueDate={node.dueDate}
                                onPriorityChange={(priority) => setNodes(prevNodes => prevNodes.map(n => n.id === node.id ? { ...n, priority } : n))}
                                onStatusChange={(status) => {
                                  setNodes(prevNodes => prevNodes.map(n => {
                                    if (n.id === node.id) {
                                      const updates = { ...n, status };
                                      // Auto-fill startDate when status changes to 'in-progress' for the first time
                                      if (status === 'in-progress' && !n.startDate) {
                                        const now = new Date();
                                        const year = now.getFullYear();
                                        const month = String(now.getMonth() + 1).padStart(2, '0');
                                        const day = String(now.getDate()).padStart(2, '0');
                                        const hours = String(now.getHours()).padStart(2, '0');
                                        const minutes = String(now.getMinutes()).padStart(2, '0');
                                        updates.startDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                                      }
                                      return updates;
                                    }
                                    return n;
                                  }));
                                }}
                                onDescriptionChange={(description) => setNodes(prevNodes => prevNodes.map(n => n.id === node.id ? { ...n, description } : n))}
                                onStartDateChange={(startDate) => setNodes(prevNodes => prevNodes.map(n => n.id === node.id ? { ...n, startDate } : n))}
                                onDueDateChange={(dueDate) => setNodes(prevNodes => prevNodes.map(n => n.id === node.id ? { ...n, dueDate } : n))}
                                onClose={() => togglePopup(node.id, 'details')}
                              />

                              <button
                                ref={(el) => { collaboratorBtnRefs.current[node.id] = el; }}
                                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 col-span-1"
                                onClick={(e) => { e.stopPropagation(); togglePopup(node.id, 'collaborator'); }}
                                title="Assign team member"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            <div className="hidden lg:block w-px h-6 mx-1 bg-gray-200"></div>
                          )}

                          {/* Final controls group */}
                          <div className="col-span-4 lg:col-span-auto flex items-center gap-0.5 justify-center lg:justify-start">
                            {/* Auto-layout button - show for any node with children */}
                            {(() => {
                              const hasChildren = connections.some(conn => conn.from === node.id);
                              return hasChildren && isNodeToolbarExpanded(node.id) && (
                                <div className="relative">
                                  <button
                                    ref={(el) => { layoutBtnRefs.current[node.id] = el; }}
                                    className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNodeLayoutMenuOpen(nodeLayoutMenuOpen === node.id ? null : node.id);
                                    }}
                                    title="Auto-arrange children"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                                    </svg>
                                  </button>

                                  {/* Layout dropdown menu */}
                                  {nodeLayoutMenuOpen === node.id && createPortal(
                                    (() => {
                                      const buttonRect = layoutBtnRefs.current[node.id]?.getBoundingClientRect() || { left: 0, bottom: 0 };
                                      const popupWidth = 240;
                                      const left = Math.max(8, Math.min(buttonRect.left - popupWidth + 40, window.innerWidth - popupWidth - 8));
                                      const top = buttonRect.bottom + 8;

                                      return (
                                        <div
                                          className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[100]"
                                          style={{
                                            left: `${left}px`,
                                            top: `${top}px`,
                                            width: `${popupWidth}px`
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="px-3 py-2 border-b border-gray-100">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Auto-arrange Children</div>
                                          </div>

                                          {[
                                            { type: 'force-directed', emoji: '⚡', name: 'Force Directed', desc: 'Physics-based automatic spacing' },
                                            { type: 'tree-vertical', emoji: '🌲', name: 'Tree (Vertical)', desc: 'Top to bottom hierarchy' },
                                            { type: 'tree-horizontal', emoji: '🌳', name: 'Tree (Horizontal)', desc: 'Left to right hierarchy' },
                                            { type: 'radial', emoji: '🎯', name: 'Radial', desc: 'Concentric circles' },
                                            { type: 'circular', emoji: '⭕', name: 'Circular', desc: 'Arrange in circle' },
                                            { type: 'grid', emoji: '⚙️', name: 'Grid', desc: 'Snap to grid' },
                                          ].map((layout) => (
                                            <button
                                              key={layout.type}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleApplyNodeLayout(node.id, layout.type);
                                              }}
                                              className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left flex items-start gap-3 group"
                                            >
                                              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{layout.emoji}</span>
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 text-sm">{layout.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{layout.desc}</div>
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      );
                                    })(),
                                    document.body
                                  )}
                                </div>
                              );
                            })()}

                            {/* Settings toggle - Always at the end before delete */}
                            <NodeToolbarSettingsToggle
                              isToolbarExpanded={isNodeToolbarExpanded(node.id)}
                              onToggle={() => toggleNodeToolbar(node.id)}
                            />

                            {/* Delete button at the end - Always visible for non-root nodes */}
                            {node.id !== 'root' && (
                              <button
                                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200"
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmNodeId(node.id); }}
                                title="Delete node"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        )}

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

        {/* Zoom Controls - Bottom Left */}
        {viewMode === 'mindmap' && (
          <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 flex flex-row items-center gap-1.5 sm:gap-2 z-30">
            {/* Zoom Out */}
            <button
              onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.2))}
              className="p-2 sm:p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
              title="Zoom Out"
            >
              <ZoomOut size={14} strokeWidth={2} />
            </button>

            {/* Zoom Percentage */}
            <div className="px-3 py-2 sm:py-2.5 bg-white text-gray-700 rounded-lg shadow-lg border border-gray-200 font-medium text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>

            {/* Zoom In */}
            <button
              onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
              className="p-2 sm:p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
              title="Zoom In"
            >
              <ZoomIn size={14} strokeWidth={2} />
            </button>

            {/* Re-center */}
            <button
              onClick={() => {
                dragging.setPan({ x: 0, y: 0 });
                setZoom(initialZoom);
              }}
              className="p-2 sm:p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
              title="Re-center and Reset Zoom"
            >
              <Maximize2 size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Action Controls - Middle Right (Column) */}
        {viewMode === 'mindmap' && (
          <div className="fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-1.5 sm:p-2 z-30">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              {/* Add Node */}
              <button
                onClick={addStandaloneNode}
                className="p-1.5 sm:p-2 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 rounded-lg transition-all duration-200"
                title="Add New Node"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>

              {/* Delete Selected */}
              <button
                onClick={() => selectedNodes.length > 0 && nodeOps.deleteNodes(selectedNodes)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${selectedNodes.length > 0
                  ? 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  : 'text-gray-300 cursor-not-allowed'
                  }`}
                title="Delete Selected"
                disabled={selectedNodes.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>

              {/* Divider */}
              <div className="w-full h-px bg-gray-200 my-0.5" />

              {/* Undo */}
              <button
                onClick={undo}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${historyIndex <= 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                title="Undo"
                disabled={historyIndex <= 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 17L4 12l5-5" />
                  <path d="M20 18v-1a4 4 0 0 0-4-4H4" />
                </svg>
              </button>

              {/* Redo */}
              <button
                onClick={redo}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${historyIndex >= history.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                title="Redo"
                disabled={historyIndex >= history.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 7l5 5-5 5" />
                  <path d="M4 6v1a4 4 0 0 0 4 4h12" />
                </svg>
              </button>
            </div>
          </div>
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
          className="fixed inset-0 bg-black/50 z-[60]"
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
              { type: 'circle', name: 'Circle', color: '#3B82F6', icon: '●' },
              { type: 'rhombus', name: 'Rhombus', color: '#F59E0B', icon: '◆' },
              { type: 'pentagon', name: 'Pentagon', color: '#EF4444', icon: '⬟' },
              { type: 'ellipse', name: 'Ellipse', color: '#8B5CF6', icon: '◐' },
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

      {/* Image Analyzer Modal */}
      <ImageAnalyzerModal
        isOpen={showImageAnalyzer}
        onClose={() => setShowImageAnalyzer(false)}
        onAnalyze={handleImageAnalyze}
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

      {/* Theme Picker */}
      <ThemePicker
        show={showThemePicker}
        currentTheme={currentTheme}
        onSelectTheme={(themeId) => {
          setCurrentTheme(themeId);
          // Theme will be applied through CSS/styling
        }}
        onClose={() => setShowThemePicker(false)}
        anchorRef={themeBtnRef}
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
        nodeText={deleteConfirmNodeId ? (nodes.find(n => n.id === deleteConfirmNodeId)?.text || 'this node') : 'this node'}
        hasChildren={deleteConfirmNodeId ? getDescendantNodeIds(connections, deleteConfirmNodeId).length > 0 : false}
        childrenCount={deleteConfirmNodeId ? getDescendantNodeIds(connections, deleteConfirmNodeId).length : 0}
        descendantNodes={deleteConfirmNodeId ? getDescendantNodeIds(connections, deleteConfirmNodeId).map(id => {
          const node = nodes.find(n => n.id === id);
          return { id, text: node?.text || `Node ${id}` };
        }) : []}
        onConfirm={() => {
          // Delete only the node, keep children by removing connections
          if (deleteConfirmNodeId) {
            // Remove only connections where this node is involved
            setConnections(connections.filter(c => c.from !== deleteConfirmNodeId && c.to !== deleteConfirmNodeId));
            // Delete the node
            nodeOps.deleteNodes([deleteConfirmNodeId]);
          }
          setDeleteConfirmNodeId(null);
        }}
        onConfirmWithChildren={() => {
          // Delete node and all its descendants
          if (deleteConfirmNodeId) {
            const descendants = getDescendantNodeIds(connections, deleteConfirmNodeId);
            const allToDelete = [deleteConfirmNodeId, ...descendants];
            nodeOps.deleteNodes(allToDelete);
          }
          setDeleteConfirmNodeId(null);
        }}
      />


      {/* Group Membership Confirmation Dialog */}
      <GroupMembershipDialog
        show={groupMembershipDialog.show}
        group={groupMembershipDialog.group}
        nodeName={groupMembershipDialog.nodeName}
        onConfirm={() => {
          addNodeToGroup(groupMembershipDialog.nodeId, groupMembershipDialog.group);
          setGroupMembershipDialog({ show: false, nodeId: null, nodeName: '', group: null });
        }}
        onCancel={() => {
          setGroupMembershipDialog({ show: false, nodeId: null, nodeName: '', group: null });
        }}
      />

      {/* ============================================
          ENHANCED FEATURES PANEL
          ============================================ */}
      {showEnhancedPanel && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setShowEnhancedPanel(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            {showEnhancedPanel === 'ai' && selectedNodes.length > 0 && (
              <AITaskDecomposer
                node={nodes.find(n => n.id === selectedNodes[0])}
                onDecompose={(subtasks) => {
                  const parentNode = nodes.find(n => n.id === selectedNodes[0]);
                  if (!parentNode) return;

                  const newNodes = subtasks.map((subtask, index) => ({
                    id: `${parentNode.id}-subtask-${Date.now()}-${index}`,
                    text: subtask.text,
                    x: parentNode.x + 200 + (index % 3) * 220,
                    y: parentNode.y + Math.floor(index / 3) * 120,
                    bgColor: '#ffffff',
                    fontColor: '#2d3748',
                    priority: subtask.priority,
                    estimatedHours: subtask.estimatedHours
                  }));

                  const newConnections = newNodes.map(node => ({
                    from: parentNode.id,
                    to: node.id
                  }));

                  setNodes(prev => [...prev, ...newNodes]);
                  setConnections(prev => [...prev, ...newConnections]);
                  setShowEnhancedPanel(null);
                }}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'dependencies' && (
              <DependencyAnalyzer
                nodes={nodes}
                connections={connections}
                onCreateConnection={(fromId, toId) => {
                  setConnections(prev => [...prev, { from: fromId, to: toId }]);
                }}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'workload' && (
              <WorkloadHeatmap
                nodes={nodes}
                collaborators={collaborators}
                onReassignTask={(taskId, newAssignee) => {
                  setNodes(prev => prev.map(n =>
                    n.id === taskId ? { ...n, collaborators: [newAssignee] } : n
                  ));
                }}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'timetravel' && (
              <TimeTravel
                snapshots={projectSnapshots}
                currentNodes={nodes}
                currentConnections={connections}
                onCreateSnapshot={(snapshot) => {
                  setProjectSnapshots(prev => [snapshot, ...prev]);
                }}
                onRestoreSnapshot={(snapshot) => {
                  setNodes(snapshot.nodes);
                  setConnections(snapshot.connections);
                  setShowEnhancedPanel(null);
                }}
                onDeleteSnapshot={(snapshotId) => {
                  setProjectSnapshots(prev => prev.filter(s => s.id !== snapshotId));
                }}
                onImportSnapshot={(snapshot) => {
                  setProjectSnapshots(prev => [snapshot, ...prev]);
                }}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'focus' && (
              <FocusMode
                selectedNode={focusTaskNode || (selectedNodes.length > 0 ? nodes.find(n => n.id === selectedNodes[0]) : null)}
                onComplete={(nodeId) => {
                  setNodes(prev => prev.map(n =>
                    n.id === nodeId ? { ...n, completed: true } : n
                  ));
                }}
                onClose={() => {
                  setShowEnhancedPanel(null);
                  setFocusTaskNode(null);
                }}
              />
            )}

            {showEnhancedPanel === 'risk' && (
              <RiskMatrix
                nodes={nodes}
                connections={connections}
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'budget' && (
              <BudgetTracker
                nodes={nodes}
                collaborators={collaborators}
                projectBudget={projectBudget}
                hourlyRates={hourlyRates}
                onUpdateBudget={setProjectBudget}
                onUpdateRates={setHourlyRates}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'resources' && (
              <ResourceMatrix
                nodes={nodes}
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'expenses' && (
              <ExpenseTracker
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'smartassigner' && (
              <SmartAssigner
                nodes={nodes}
                collaborators={collaborators}
                onAssign={(taskId, assigneeId) => {
                  setNodes(prev => prev.map(n =>
                    n.id === taskId
                      ? { ...n, collaborators: [...(n.collaborators || []).filter(c => c !== assigneeId), assigneeId] }
                      : n
                  ));
                }}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'nextaction' && (
              <NextActionHighlighter
                nodes={nodes}
                connections={connections}
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'dailydigest' && (
              <DailyDigest
                nodes={nodes}
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'decisionlog' && (
              <DecisionLog
                nodes={nodes}
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'handoff' && (
              <HandoffChecklist
                nodes={nodes}
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'knowledge' && (
              <KnowledgeBase
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'timeline' && (
              <CrossProjectTimeline
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}

            {showEnhancedPanel === 'automations' && (
              <AutomationBuilder
                nodes={nodes}
                collaborators={collaborators}
                onClose={() => setShowEnhancedPanel(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* Enhanced Features Quick Access Toolbar */}
      {viewMode === 'mindmap' && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-1.5 py-1.5 flex items-center gap-0.5">
            <button
              onClick={() => {
                if (selectedNodes.length > 0) {
                  setShowEnhancedPanel('ai');
                }
              }}
              disabled={selectedNodes.length === 0}
              className={`p-2 rounded-lg transition-all flex flex-col items-center gap-0.5 ${selectedNodes.length > 0
                ? 'hover:bg-purple-50 text-purple-600'
                : 'text-gray-300 cursor-not-allowed'
                }`}
              title="AI Task Breakdown"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">AI Breakdown</span>
            </button>

            <button
              onClick={() => setShowEnhancedPanel('workload')}
              className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-all flex flex-col items-center gap-0.5"
              title="Team Workload"
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Workload</span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-0.5" />

            <button
              onClick={() => setShowEnhancedPanel('timetravel')}
              className="p-2 rounded-lg hover:bg-cyan-50 text-cyan-600 transition-all flex flex-col items-center gap-0.5"
              title="Time Travel (Snapshots)"
            >
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Snapshots</span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-0.5" />

            {/* Clarity Features - "Everyone knows what to do" */}
            <button
              onClick={() => setShowEnhancedPanel('smartassigner')}
              className="p-2 rounded-lg hover:bg-violet-50 text-violet-600 transition-all flex flex-col items-center gap-0.5"
              title="Smart Task Assignment"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Assign</span>
            </button>

            <button
              onClick={() => setShowEnhancedPanel('nextaction')}
              className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition-all flex flex-col items-center gap-0.5"
              title="Task Status Overview"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Status</span>
            </button>

            <button
              onClick={() => setShowEnhancedPanel('dailydigest')}
              className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-all flex flex-col items-center gap-0.5"
              title="Daily Digest"
            >
              <Sun className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Daily</span>
            </button>

            <button
              onClick={() => setShowEnhancedPanel('decisionlog')}
              className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-all flex flex-col items-center gap-0.5"
              title="Decision Log"
            >
              <Scale className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Decisions</span>
            </button>

            <button
              onClick={() => setShowEnhancedPanel('knowledge')}
              className="p-2 rounded-lg hover:bg-lime-50 text-lime-600 transition-all flex flex-col items-center gap-0.5"
              title="Knowledge Base"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Docs</span>
            </button>

            <div className="w-px h-6 bg-gray-200 mx-0.5" />

            {/* Manager Features */}
            <button
              onClick={() => setShowEnhancedPanel('timeline')}
              className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-all flex flex-col items-center gap-0.5"
              title="Cross-Project Timeline"
            >
              <Layers className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Timeline</span>
            </button>

            <button
              onClick={() => setShowEnhancedPanel('automations')}
              className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-all flex flex-col items-center gap-0.5"
              title="Automations"
            >
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-medium hidden sm:block">Automate</span>
            </button>
          </div>
        </div>
      )}

      {/* Template Gallery */}
      <TemplateGallery
        show={showTemplateGallery}
        onSelectTemplate={handleApplyTemplate}
        onClose={() => setShowTemplateGallery(false)}
        onStartBlank={() => {
          setNodes([{
            id: 'root',
            text: 'Central Task',
            x: Math.round(window.innerWidth / 2),
            y: Math.round(window.innerHeight / 2),
            bgColor: '#ffffff',
            fontColor: '#2d3748'
          }]);
          setConnections([]);
        }}
      />

      {/* Ghost Preview for Template Placement */}
      <GhostPreview
        show={ghostPreview.show}
        nodes={ghostPreview.nodes}
        connections={ghostPreview.connections}
        onConfirm={handleConfirmTemplatePlacement}
        onCancel={handleCancelTemplatePlacement}
        zoom={zoom}
        pan={dragging.pan}
        onPanChange={setPan}
        containerRef={canvasRef}
      />
    </div>
  );
}

MindMap.propTypes = {
  mapId: PropTypes.string,
  onBack: PropTypes.func
};
