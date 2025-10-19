/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import React, { useRef, useState } from 'react';
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
import AnchoredPopover from './mindmap/AnchoredPopover';

export default function MindMap({ mapId, onBack }) {
  // Minimal, compiling scaffold to restore the app while we refactor
  const [nodes, setNodes] = useState([
    { id: 'root', text: 'Central Idea', x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight / 2) }
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
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false); // Global toolbar expansion
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

  // Toolbar-required handlers (minimal stubs)
  const addStandaloneNode = () => {
    const id = `node-${Date.now()}`;
    const last = nodes[nodes.length - 1] || nodes[0];
    const newNode = { id, text: 'Idea', x: last.x + 240, y: last.y };
    setNodes([...nodes, newNode]);
    setConnections([...connections, { id: `conn-${Date.now()}`, from: last.id, to: id }]);
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
    nodes.forEach(n => { map[n.id] = { x: n.x, y: n.y }; });
    return map;
  }, [nodes]);

  // Node toolbar actions
  const onToggleComplete = (id) => setNodes(nodes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  const updateNodeText = (id, text) => setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  const onAddChild = (parentId) => {
    const parent = nodes.find(n => n.id === parentId) || nodes[0];
    const id = `node-${Date.now()}`;
    const child = { id, text: 'New Node', x: parent.x + 240, y: parent.y };
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
  const selectBgColor = (id, color) => { 
    setNodes(nodes.map(n => n.id === id ? { ...n, bgColor: color } : n)); 
  };
  const selectFontColor = (id, color) => { 
    setNodes(nodes.map(n => n.id === id ? { ...n, fontColor: color } : n)); 
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
        {/* Toolbar overlay */
        }
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
        />

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
              {/* Per-node toolbar overlay - ALWAYS visible, matches pre-refactor */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 -translate-y-full mb-3 z-20" style={{ marginTop: '-15px' }}>
                <div className="enhanced-node-toolbar backdrop-blur-md bg-white/90 shadow-lg border border-white/20 rounded-2xl flex items-center p-2 gap-1">
                  {/* PRIMARY GROUP - always visible */}
                  <NodeToolbarPrimary
                    node={node}
                    isToolbarExpanded={isToolbarExpanded}
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
                  {isToolbarExpanded && (
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
                    isToolbarExpanded={isToolbarExpanded}
                    onToggle={() => setIsToolbarExpanded(!isToolbarExpanded)}
                  />

                  {/* Divider */}
                  {isToolbarExpanded && (
                    <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Content group when expanded */}
                  {isToolbarExpanded && (
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
                      {isPopupOpen(node.id, 'attach') && (
                        <AnchoredPopover anchorEl={attachBtnRefs.current[node.id]} onClose={() => closePopup(node.id, 'attach')}>
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Attachments</h4>
                            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload…</button>
                            {(node.attachments || []).length === 0 && (
                              <div className="text-sm text-gray-500">No attachments yet</div>
                            )}
                          </div>
                        </AnchoredPopover>
                      )}
                      
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
                      {isPopupOpen(node.id, 'notes') && (
                        <AnchoredPopover anchorEl={notesBtnRefs.current[node.id]} onClose={() => closePopup(node.id, 'notes')}>
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Notes</h4>
                            <textarea
                              className="w-full border rounded px-2 py-1 text-sm"
                              rows={6}
                              value={node.notes || ''}
                              id={`notes-${node.id}`}
                              onChange={(e) => setNodeField(node.id, 'notes', e.target.value)}
                            />
                          </div>
                        </AnchoredPopover>
                      )}

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
                      {isPopupOpen(node.id, 'tags') && (
                        <AnchoredPopover anchorEl={tagBtnRefs.current[node.id]} onClose={() => closePopup(node.id, 'tags')}>
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Tags</h4>
                            <div className="flex gap-2 flex-wrap">
                              {(node.tags || []).map((t) => (
                                <span key={t} className="px-2 py-1 text-xs rounded-full bg-gray-100 border text-gray-700">{t}</span>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="Add tag and press Enter"
                              className="w-full border rounded px-2 py-1 text-sm"
                              id={`tags-${node.id}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  const tag = e.currentTarget.value.trim();
                                  addNodeTag(node.id, tag);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </div>
                        </AnchoredPopover>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  {isToolbarExpanded && (
                    <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Meta group when expanded */}
                  {isToolbarExpanded && (
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
                      {isPopupOpen(node.id, 'details') && (
                        <AnchoredPopover anchorEl={detailsBtnRefs.current[node.id]} onClose={() => closePopup(node.id, 'details')}>
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Details</h4>
                            <div className="flex gap-2 items-center">
                              <label className="text-sm text-gray-600 w-20" htmlFor={`priority-${node.id}`}>Priority</label>
                              <select
                                className="flex-1 border rounded px-2 py-1 text-sm"
                                value={node.priority || 'normal'}
                                id={`priority-${node.id}`}
                                onChange={(e) => setNodeField(node.id, 'priority', e.target.value)}
                              >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                            <div className="flex gap-2 items-center">
                              <label className="text-sm text-gray-600 w-20" htmlFor={`status-${node.id}`}>Status</label>
                              <select
                                className="flex-1 border rounded px-2 py-1 text-sm"
                                value={node.status || 'todo'}
                                id={`status-${node.id}`}
                                onChange={(e) => setNodeField(node.id, 'status', e.target.value)}
                              >
                                <option value="todo">To do</option>
                                <option value="doing">Doing</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600" htmlFor={`description-${node.id}`}>Description</label>
                              <textarea
                                className="w-full border rounded px-2 py-1 text-sm"
                                rows={3}
                                value={node.description || ''}
                                id={`description-${node.id}`}
                                onChange={(e) => setNodeField(node.id, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        </AnchoredPopover>
                      )}

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
                      {isPopupOpen(node.id, 'date') && (
                        <AnchoredPopover anchorEl={dateBtnRefs.current[node.id]} onClose={() => closePopup(node.id, 'date')} width={220}>
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Due date</h4>
                            <input
                              type="date"
                              className="w-full border rounded px-2 py-1 text-sm"
                              value={node.dueDate || ''}
                              id={`duedate-${node.id}`}
                              onChange={(e) => setNodeField(node.id, 'dueDate', e.target.value)}
                            />
                          </div>
                        </AnchoredPopover>
                      )}

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
                  {isToolbarExpanded && (
                    <div className="w-px h-6 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 opacity-60"></div>
                  )}

                  {/* Layout button (root only) */}
                  {node.id === 'root' && isToolbarExpanded && (
                    <NodeToolbarLayout
                      shouldRender={true}
                      layoutBtnRef={(el) => { layoutBtnRefs.current[node.id] = el; }}
                      onToggleLayout={() => { /* layout mode toggle */ }}
                      renderLayoutPopup={() => null}
                    />
                  )}

                  {/* Delete when expanded and not root */}
                  {isToolbarExpanded && node.id !== 'root' && (
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
