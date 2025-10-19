/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
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
  const [zoom] = useState(1);
  const [mode, setMode] = useState('cursor'); // 'cursor' | 'pan'
  const [selectionType, setSelectionType] = useState('simple');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [history] = useState([]);
  const [historyIndex] = useState(-1);
  const [fxOptions, setFxOptions] = useState({ enabled: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchList, setShowSearchList] = useState(false);
  const [connectionFrom, setConnectionFrom] = useState(null);
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
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false);
  const [collaboratorNodeId, setCollaboratorNodeId] = useState(null); // Track which node the collaborator dialog is for
  const [collaborators] = useState([
    { id: 'c1', name: 'Alice' },
    { id: 'c2', name: 'Bob' },
    { id: 'c3', name: 'Charlie' }
  ]);
  const [attachmentFilters, setAttachmentFilters] = useState({ search: '' }); // Attachment search/filter state
  const bgBtnRefs = useRef({}); // Background color button refs
  const fontBtnRefs = useRef({}); // Font color button refs
  const emojiBtnRefs = useRef({}); // Emoji button refs

  // Simple pan state for the canvas
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef({ startX: 0, startY: 0 });
  const canvasRef = useRef(null);

  const startPanning = (e) => {
    // Ignore mouse down from toolbar buttons or popups
    if (e.target.closest('.node-toolbar-btn') || e.target.closest('.node-popup')) return;
    // Node drag takes precedence when clicking on a node wrapper
    const target = e.target.closest('[data-node-id]');
    if (target) {
      const id = target.getAttribute('data-node-id');
      const node = nodes.find(n => n.id === id);
      if (node) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDraggingNodeId(id);
        setDragOffset({ x: e.clientX - rect.left - (node.x + pan.x), y: e.clientY - rect.top - (node.y + pan.y) });
        return;
      }
    }
    if (mode !== 'pan') return;
    if (e.target !== canvasRef.current) return;
    setIsPanning(true);
    panRef.current = { startX: e.clientX - pan.x, startY: e.clientY - pan.y };
  };
  const handlePanning = (e) => {
    // Ignore while interacting with popups
    if (e.target.closest('.node-popup')) return;
    if (draggingNodeId) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - pan.x - dragOffset.x;
      const newY = e.clientY - rect.top - pan.y - dragOffset.y;
      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
      return;
    }
    if (!isPanning) return;
    setPan({ x: e.clientX - panRef.current.startX, y: e.clientY - panRef.current.startY });
  };
  const stopPanning = () => { setIsPanning(false); setDraggingNodeId(null); };

  // ============================================
  // HIERARCHICAL NODE POSITIONING WITH SPIDER WEB
  // ============================================
  
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 56;
  const MARGIN = 25; // 25px spacing between nodes
  
  /**
   * Check if position is valid (not occupied by another node)
   */
  const isPositionAvailable = (x, y, excludeId = null) => {
    const COLLISION_DISTANCE = 80; // Reduced for tighter spacing
    return !nodes.some(n => {
      if (excludeId && n.id === excludeId) return false;
      const dx = n.x - x;
      const dy = n.y - y;
      const distance = Math.hypot(dx, dy);
      return distance < COLLISION_DISTANCE;
    });
  };

  /**
   * Find available position around parent in spider web pattern
   * Tries: right, down-right, down, down-left, left, up-left, up, up-right
   */
  const findAvailablePosition = (centerX, centerY, radius = 300) => {
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]; // 8 directions
    const radii = [radius, radius * 1.5, radius * 2, radius * 2.5];
    
    for (const r of radii) {
      for (const angle of angles) {
        const rad = (angle * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * r;
        const y = centerY + Math.sin(rad) * r;
        
        if (isPositionAvailable(x, y)) {
          return { x, y };
        }
      }
    }
    
    // Fallback: return a position anyway
    return { x: centerX + radius, y: centerY };
  };

  /**
   * Stack new nodes below existing ones with 20px margin
   */
  const findStackedPosition = (baseX = null, baseY = null) => {
    if (nodes.length === 0) {
      return { 
        x: baseX ?? Math.round(window.innerWidth / 2), 
        y: baseY ?? Math.round(window.innerHeight / 2) 
      };
    }

    // Find the lowest Y position among all nodes
    let lowestY = Math.max(...nodes.map(n => n.y));
    
    // Stack the new node below the lowest one
    return {
      x: baseX ?? Math.round(window.innerWidth / 2),
      y: lowestY + NODE_HEIGHT + MARGIN
    };
  };

  /**
   * Position children hierarchically:
   * - ALL children go to the RIGHT of previous node (horizontal chain)
   * - First child: to the RIGHT of parent
   * - Second child: to the RIGHT of first child
   * - Third child: to the RIGHT of second child (etc.)
   * - Collision avoidance: spider web pattern if no space
   */
  const findStackedChildPosition = (parentId, preferredX, preferredY) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return { x: preferredX, y: preferredY };

    const childrenOfParent = nodes.filter(n => 
      connections.some(c => c.from === parentId && c.to === n.id)
    );

    if (childrenOfParent.length === 0) {
      // FIRST CHILD: to the RIGHT of parent
      const firstChildX = parent.x + NODE_WIDTH + MARGIN;
      const firstChildY = parent.y;
      
      // Check if position is available, otherwise use spider web
      if (isPositionAvailable(firstChildX, firstChildY)) {
        return { x: firstChildX, y: firstChildY };
      } else {
        // Use spider web pattern to find available space
        return findAvailablePosition(parent.x, parent.y);
      }
    }

    // NEXT CHILDREN: to the RIGHT of the last child (horizontal chain)
    const lastChild = childrenOfParent.at(-1);
    
    const nextChildX = lastChild.x + NODE_WIDTH + MARGIN;
    const nextChildY = lastChild.y;
    
    // Check if position is available, otherwise use spider web
    if (isPositionAvailable(nextChildX, nextChildY)) {
      return { x: nextChildX, y: nextChildY };
    } else {
      // Use spider web pattern to find available space around parent
      return findAvailablePosition(parent.x, parent.y);
    }
  };

  // Toolbar-required handlers with simple stacking
  const addStandaloneNode = () => {
    const { x, y } = findStackedPosition();
    
    const id = `node-${Date.now()}`;
    const newNode = { 
      id, 
      text: 'Idea', 
      x, 
      y,
      bgColor: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748'
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNodes = (ids) => {
    if (!ids?.length) return;
    const idSet = new Set(ids);
    setNodes(nodes.filter(n => !idSet.has(n.id)));
    setConnections(connections.filter(c => !idSet.has(c.from) && !idSet.has(c.to)));
    setSelectedNodes([]);
  };

  const undo = () => {};
  const redo = () => {};

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
    // Nodes are rendered as: left: x - 100, top: y - 28, minWidth: 200, height: ~56
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 56;
    nodes.forEach(n => { 
      map[n.id] = {
        left: n.x - NODE_WIDTH / 2,    // x - 100
        top: n.y - NODE_HEIGHT / 2,    // y - 28
        right: n.x + NODE_WIDTH / 2,   // x + 100
        bottom: n.y + NODE_HEIGHT / 2  // y + 28
      };
    });
    return map;
  }, [nodes]);

  // Node toolbar actions
  const onToggleComplete = (id) => setNodes(nodes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  const updateNodeText = (id, text) => setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  const onAddChild = (parentId) => {
    const parent = nodes.find(n => n.id === parentId) || nodes[0];
    if (!parent) return;

    // Use simple stacking logic to find a valid position for the child node
    const { x, y } = findStackedChildPosition(parentId, parent.x + 210, parent.y);

    const id = `node-${Date.now()}`;
    const child = { 
      id, 
      text: 'New Node', 
      x, 
      y,
      bgColor: isDarkMode ? '#374151' : '#ffffff',
      fontColor: isDarkMode ? '#f3f4f6' : '#2d3748'
    };
    setNodes(nodes.concat([child]));
    setConnections(connections.concat([{ id: `conn-${Date.now()}`, from: parentId, to: id }]));
  };
  const onRequestDelete = (node) => deleteNodes([node.id]);
  const startConnection = (id) => setConnectionFrom(id);
  const cancelConnection = () => setConnectionFrom(null);

  // Small helpers to update node data without deep nesting
  const updateNode = (id, patchOrFn) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== id) return n;
      if (typeof patchOrFn === 'function') return patchOrFn(n);
      return { ...n, ...patchOrFn };
    }));
  };
  const setNodeField = (id, key, value) => updateNode(id, { [key]: value });
  const addNodeTag = (id, tag) => updateNode(id, n => ({ ...n, tags: [ ...(n.tags || []), tag ] }));

  const deleteNode = (id) => deleteNodes([id]);
  const deleteNodeCascade = (id) => {
    const desc = new Set(getDescendantNodeIds(connections, id));
    deleteNodes([id, ...Array.from(desc)]);
  };

  // Popup state helpers
  const isPopupOpen = (nodeId, popupName) => popupOpenFor[nodeId]?.[popupName] === true;
  const togglePopup = (nodeId, popupName) => {
    setPopupOpenFor(prev => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] || {}), [popupName]: !isPopupOpen(nodeId, popupName) }
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
    const newAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      dateAdded: new Date().toISOString(),
      addedBy: 'current-user',
      type: file.name.split('.').pop().toLowerCase(),
    };
    setNodes(nodes.map(n => 
      n.id === nodeId 
        ? { ...n, attachments: [...(n.attachments || []), newAttachment] } 
        : n
    ));
    try { e.target.value = ''; } catch {}
  };

  const removeAttachment = (nodeId, attachmentId) => {
    setNodes(nodes.map(n => 
      n.id === nodeId 
        ? { ...n, attachments: (n.attachments || []).filter(a => a.id !== attachmentId) } 
        : n
    ));
  };

  const setNodeEmoji = (nodeId, emoji) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, emoji } : n));
  };

  // Collaborators
  const assignCollaborator = (nodeId, collaboratorId) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, collaboratorId } : n));
  };

  // Shape palette quick-add handlers (click adds at center; full DnD can be added later)
  const handleShapeDragStart = (shape) => {
    const getColor = (type) => (type === 'node' ? '#F3F4F6' : '#E5E7EB');
    const cx = Math.round(window.innerWidth / 2) - pan.x;
    const cy = Math.round(window.innerHeight / 2) - pan.y;
    const builder = shapeBuilders[shape.type] || shapeBuilders.connector;
    const { nodes: newNodes, connections: newConns, mainId } = builder(cx, cy, getColor);
    setNodes(prev => prev.concat(newNodes));
    setConnections(prev => prev.concat(newConns));
    setSelectedNodes([mainId]);
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

  let cursorStyle = 'default';
  if (mode === 'pan') {
    cursorStyle = isPanning ? 'grabbing' : 'grab';
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      <div
        className="flex-1 relative overflow-hidden"
        ref={canvasRef}
        onMouseDown={startPanning}
        onMouseMove={handlePanning}
        onMouseUp={stopPanning}
        onMouseLeave={stopPanning}
        role="application"
        tabIndex={0}
        aria-label="Mind map canvas"
        style={{ cursor: cursorStyle }}
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
            deleteNodes={deleteNodes}
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
          pan={pan}
          zoom={zoom}
          isSelecting={false}
          selectionRect={null}
          renderNodeGroups={() => null}
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
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              selected={selectedNodes.includes(node.id)}
              onSelect={toggleSelectNode}
              onUpdateText={updateNodeText}
              onMouseDown={(e) => {
                // allow dragging via startPanning handler; nothing here
              }}
            >
              {/* Progress ring (fun) */}
              {fxOptions?.progressRing && (
                <div className="absolute -top-3 -left-3">
                  <ProgressRingChip pct={node.completed ? 100 : 0} isDarkMode={isDarkMode} shapeType={node.shapeType} completed={!!node.completed} />
                </div>
              )}
              {/* Per-node toolbar overlay - Only visible when node is selected */}
              {selectedNodes.includes(node.id) && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 -translate-y-full mb-3 z-20" style={{ marginTop: '-15px' }}>
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
                                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">{attachment.type}</span>
                                        <span className="text-sm text-gray-900 font-medium">{attachment.name}</span>
                                      </div>
                                      <button className="text-xs text-red-600 hover:underline" onClick={(e) => { e.stopPropagation(); removeAttachment(node.id, attachment.id); }}>Remove</button>
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
                      onClick={(e) => { e.stopPropagation(); deleteNodes([node.id]); }}
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
          ))}
        </MindMapCanvas>
      </div>
      {/* Shapes Palette Sidebar */}
      <div className="w-64 border-l bg-white p-3">
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
      />
    </div>
  );
}

MindMap.propTypes = {
  mapId: PropTypes.string,
  onBack: PropTypes.func
};
