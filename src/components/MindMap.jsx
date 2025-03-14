import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, MousePointer, Users } from 'lucide-react';

const MindMap = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNewMapPrompt, setShowNewMapPrompt] = useState(true);
  const canvasRef = useRef(null);
  
  // Selection mode state
  const [mode, setMode] = useState('cursor');
  const [selectionRect, setSelectionRect] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [showCollaboratorDialog, setShowCollaboratorDialog] = useState(false);
  const [nodeGroups, setNodeGroups] = useState([]);
  
  // Canvas pan and zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  
  // Collaborator options
  const collaborators = [
    { id: 'jd', initials: 'JD', name: 'John Doe', color: '#3B82F6' },
    { id: 'ak', initials: 'AK', name: 'Alex Kim', color: '#10B981' },
    { id: 'mr', initials: 'MR', name: 'Maria Rodriguez', color: '#F59E0B' },
    { id: 'ts', initials: 'TS', name: 'Taylor Smith', color: '#8B5CF6' }
  ];
  
  // Click outside to close popups
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Add check if click target is inside any popup content
      const isClickInsidePopupContent = e.target.closest('.popup-content');
      
      if (nodes.some(node => node.showEmojiPopup || node.showBgColorPopup || node.showFontColorPopup || 
                         node.showAttachmentPopup || node.showNotesPopup || node.showDetailsPopup || 
                         node.showDatePopup || node.showCollaboratorPopup)) {
        const isClickInsidePopup = e.target.closest('.node-popup');
        const isClickInsideButton = e.target.closest('.node-popup-button');
        
        if (!isClickInsidePopup && !isClickInsideButton && !isClickInsidePopupContent) {
          setNodes(nodes.map(node => ({
            ...node,
            showEmojiPopup: false,
            showBgColorPopup: false,
            showFontColorPopup: false,
            showAttachmentPopup: false,
            showNotesPopup: false,
            showDetailsPopup: false,
            showDatePopup: false,
            showCollaboratorPopup: false
          })));
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nodes]);

  // Set up wheel event for zooming
  useEffect(() => {
    const handleWheel = (e) => {
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
  
  // Handle starting the panning or selection
  const startPanning = (e) => {
    if (mode === 'selection') {
      if (e.button === 0 && !e.target.closest('.node')) {
        if (e.shiftKey) {
          // Shift + left-click for panning in selection mode
          setIsPanning(true);
          lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        } else {
          // Regular left-click for selection rectangle in selection mode
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          
          setSelectionStart({ x, y });
          setSelectionRect({ x, y, width: 0, height: 0 });
          setIsSelecting(true);
        }
      }
    } else if (e.button === 0 && !e.target.closest('.node')) {
      // In cursor mode, handle normal panning
      setIsPanning(true);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };
  
  // Handle the panning motion or selection rectangle resizing
  const handlePanning = (e) => {
    if (isSelecting && mode === 'selection') {
      // Update selection rectangle size
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - pan.x) / zoom;
      const currentY = (e.clientY - rect.top - pan.y) / zoom;
      
      const width = currentX - selectionStart.x;
      const height = currentY - selectionStart.y;
      
      // Calculate the normalized rectangle (handling negative width/height)
      const x = width < 0 ? selectionStart.x + width : selectionStart.x;
      const y = height < 0 ? selectionStart.y + height : selectionStart.y;
      
      setSelectionRect({
        x,
        y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    } else if (isPanning) {
      // Handle normal panning
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      
      setPan(prevPan => ({
        x: prevPan.x + dx,
        y: prevPan.y + dy
      }));
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };
  
  // Handle the end of panning or selection
  const stopPanning = () => {
    if (isSelecting) {
      // Finish selection and find nodes within the selection rectangle
      if (selectionRect) {
        const selected = nodes.filter(node => {
          const nodeLeft = node.x - 75;
          const nodeRight = node.x + 75;
          const nodeTop = node.y - 25;
          const nodeBottom = node.y + 25;
          
          // Check if node overlaps with selection rectangle
          return (
            nodeRight >= selectionRect.x &&
            nodeLeft <= selectionRect.x + selectionRect.width &&
            nodeBottom >= selectionRect.y &&
            nodeTop <= selectionRect.y + selectionRect.height
          );
        });
        
        if (selected.length > 0) {
          setSelectedNodes(selected.map(node => node.id));
          setShowCollaboratorDialog(true);
        }
      }
      
      setIsSelecting(false);
      setSelectionRect(null);
    }
    
    setIsPanning(false);
  };
  
  // Handle assigning a collaborator to selected nodes
  const assignCollaborator = (collaborator) => {
    // Create a new group with the selected nodes and collaborator
    const newGroup = {
      id: `group-${Date.now()}`,
      nodeIds: [...selectedNodes],
      collaborator
    };
    
    // Calculate bounding box for the group
    const groupNodes = nodes.filter(node => selectedNodes.includes(node.id));
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
    
    newGroup.boundingBox = boundingBox;
    
    // Add the new group
    setNodeGroups([...nodeGroups, newGroup]);
    
    // Reset selection state
    setSelectedNodes([]);
    setShowCollaboratorDialog(false);
  };
  
  // Create a new mind map
  const createNewMap = () => {
    const rootNode = {
      id: 'root',
      text: 'Central Idea',
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      color: '#EEF2FF'
    };
    
    setNodes([rootNode]);
    setConnections([]);
    setShowNewMapPrompt(false);
  };

  // Add a standalone node
  const addStandaloneNode = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = Math.random() * 300 - 150;
    const offsetY = Math.random() * 300 - 150;
    
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      text: 'New Idea',
      x: centerX + offsetX,
      y: centerY + offsetY,
      color: '#EEF2FF'
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNode(newId);
  };
  
  // Add a child node connected to a parent
  const addChildNode = (parentId) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    
    const newX = parent.x + 200;
    const newY = parent.y;
    
    const newNode = {
      id: newId,
      text: 'New Idea',
      x: newX,
      y: newY,
      color: parent.color
    };
    
    const newConnection = {
      id: `conn-${Date.now()}`,
      from: parentId,
      to: newId
    };
    
    setNodes([...nodes, newNode]);
    setConnections([...connections, newConnection]);
    setSelectedNode(newId);
  };
  
  // Update node text
  const updateNodeText = (nodeId, text) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, text } : node
    ));
  };
  
  // Handle node click
  const handleNodeClick = (nodeId) => {
    if (mode === 'cursor') {
      setSelectedNode(nodeId);
    }
  };
  
  // Handle node dragging
  const handleNodeDrag = (nodeId, newX, newY) => {
    // Update the node position
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, x: newX, y: newY } : node
    ));
    
    // Update any group bounding boxes that contain this node
    setNodeGroups(nodeGroups.map(group => {
      if (group.nodeIds.includes(nodeId)) {
        // Recalculate the bounding box
        const groupNodes = nodes.map(node => 
          node.id === nodeId ? { ...node, x: newX, y: newY } : node
        ).filter(node => group.nodeIds.includes(node.id));
        
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
    setNodes(updatedNodes);
    setConnections(updatedConnections);
    setNodeGroups(updatedGroups);
    setSelectedNode(null);
  };

  // Render the connections between nodes
  const renderConnections = () => {
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (!fromNode || !toNode) return null;
      
      return (
        <div key={conn.id} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 5 }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <line 
              x1={fromNode.x} 
              y1={fromNode.y} 
              x2={toNode.x} 
              y2={toNode.y} 
              stroke="#000000" 
              strokeWidth={3}
            />
          </svg>
        </div>
      );
    });
  };

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
          border: `2px dashed ${collaborator.color}`,
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 4
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {collaborator.initials}
          </div>
        </div>
      );
    });
  };

  // First, modify how attachments are stored in the node. Instead of a single attachment,
  // we'll store an array of attachment objects
  const handleAttachment = (e, nodeId) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        dateAdded: new Date().toISOString(),
        addedBy: 'Current User', // This should be replaced with actual user info
        type: file.name.split('.').pop().toLowerCase(),
      };

      setNodes(nodes.map(n => 
        n.id === nodeId ? {
          ...n,
          attachments: [...(n.attachments || []), newAttachment],
          showAttachmentPopup: false
        } : n
      ));
    }
  };

  // Add this state at component level
  const [attachmentFilters, setAttachmentFilters] = useState({
    search: '',
    fileType: '',
    addedBy: ''
  });

  // Add this function to get unique users who added files
  const getUniqueUsers = (attachments) => {
    if (!attachments) return [];
    const users = new Set(attachments.map(a => a.addedBy));
    return Array.from(users);
  };

  // Add near the other state declarations
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchList, setShowSearchList] = useState('');
  
  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden" 
      ref={canvasRef}
      onMouseDown={startPanning}
      onMouseMove={handlePanning}
      onMouseUp={stopPanning}
      onMouseLeave={stopPanning}
      style={{ cursor: isPanning ? 'grabbing' : (mode === 'selection' ? 'crosshair' : 'default') }}
    >
      {showNewMapPrompt ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <button 
            onClick={createNewMap}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
          >
            New Mind Map
          </button>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-20 bg-white shadow rounded-lg p-2">
            <div className="flex gap-2">
              {/* Mode toggle */}
              <button 
                onClick={() => setMode(mode === 'cursor' ? 'selection' : 'cursor')}
                className={`p-2 rounded ${mode === 'cursor' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}
                title={mode === 'cursor' ? "Switch to selection mode" : "Switch to cursor mode"}
              >
                {mode === 'cursor' ? <MousePointer size={20} /> : <Users size={20} />}
              </button>
              
              {/* Add node button */}
              <button 
                onClick={addStandaloneNode} 
                className="p-2 hover:bg-gray-100 rounded text-black"
                title="Add standalone node"
              >
                <Plus size={20} />
              </button>
              
              {/* Delete node button */}
              <button 
                onClick={() => selectedNode && deleteNode(selectedNode)}
                className={`p-2 rounded ${selectedNode ? 'hover:bg-red-100 text-red-600' : 'text-gray-400'}`}
                title="Delete selected node"
                disabled={!selectedNode}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-20 bg-white shadow rounded-lg p-2 text-black">
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setZoom(z => Math.min(z * 1.2, 3))} 
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
              <button 
                onClick={() => setZoom(1)} 
                className="p-2 hover:bg-gray-100 rounded"
                title="Reset zoom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <rect x="9" y="9" width="6" height="6"></rect>
                </svg>
              </button>
              <button 
                onClick={() => setZoom(z => Math.max(z / 1.2, 0.2))} 
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="absolute top-20 left-4 z-20 flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search nodes..."
                className="w-64 px-3 py-2 bg-white shadow rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                onClick={() => setShowSearchList(!showSearchList)}
                title="Show matching nodes list"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Search Results List */}
            {showSearchList && searchQuery && (
              <div className="absolute top-12 left-0 w-80 bg-white shadow-lg rounded-lg p-2 max-h-96 overflow-y-auto">
                {nodes
                  .filter(node => node.text.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(node => {
                    const nodeGroup = nodeGroups.find(group => 
                      group.nodeIds.includes(node.id)
                    );
                    const collaborator = nodeGroup?.collaborator;

                    return (
                      <div 
                        key={node.id}
                        className="p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                        onClick={() => {
                          setSelectedNode(node.id);
                          setShowSearchList(false);
                          // Optional: Scroll/pan to the node
                          setPan({
                            x: window.innerWidth/2 - node.x,
                            y: window.innerHeight/2 - node.y
                          });
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{node.text}</span>
                          {collaborator && (
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: collaborator.color }}
                            >
                              {collaborator.initials}
                            </div>
                          )}
                        </div>
                        {node.dueDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Due: {new Date(node.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          
          {/* Wrapper for panned and zoomed content */}
          <div 
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Group bounding boxes */}
            {renderNodeGroups()}
            
            {/* Connections between nodes */}
            {renderConnections()}
            
            {/* Selection rectangle */}
            {isSelecting && selectionRect && (
              <div 
                style={{
                  position: 'absolute',
                  left: selectionRect.x,
                  top: selectionRect.y,
                  width: selectionRect.width,
                  height: selectionRect.height,
                  border: '2px dashed #6366F1',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  zIndex: 6,
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Nodes */}
            {nodes.map(node => (
              <div
                key={node.id}
                className={`absolute p-3 rounded-lg shadow cursor-move node
                  ${selectedNode === node.id ? 'ring-2 ring-indigo-500' : ''}`}
                style={{
                  left: node.x - 75,
                  top: node.y - 25,
                  backgroundColor: node.color,
                  zIndex: selectedNode === node.id ? 20 : 10,
                  minWidth: '150px',
                  maxWidth: '200px',
                  textAlign: 'center',
                  // Add filter for non-matching nodes when searching
                  opacity: searchQuery ? 
                    (node.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0.3) : 1,
                  transition: 'opacity 0.2s ease-in-out'
                }}
                onClick={() => handleNodeClick(node.id)}
                onMouseDown={(e) => {
                  if (mode === 'cursor' && e.button === 0) {
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startNodeX = node.x;
                    const startNodeY = node.y;
                    
                    const handleMouseMove = (moveEvent) => {
                      if (isPanning) return;
                      const dx = (moveEvent.clientX - startX) / zoom;
                      const dy = (moveEvent.clientY - startY) / zoom;
                      handleNodeDrag(node.id, startNodeX + dx, startNodeY + dy);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }
                }}
              >
                {selectedNode === node.id && mode === 'cursor' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-3" style={{ marginTop: '-15px' }}>
                    <div className="bg-white shadow-md rounded-full flex items-center p-1 gap-1 z-30">
                      {/* Emoji Selector */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showEmojiPopup: !n.showEmojiPopup, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false } : n
                          ));
                        }}
                        title="Add emoji or icon"
                      >
                        <span role="img" aria-label="emoji" className="text-lg">😊</span>
                      </button>
                      
                      {/* Background Color */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showBgColorPopup: !n.showBgColorPopup, showEmojiPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false } : n
                          ));
                        }}
                        title="Background color"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
                      </button>
                      
                      {/* Font Color */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showFontColorPopup: !n.showFontColorPopup, showEmojiPopup: false, showBgColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false } : n
                          ));
                        }}
                        title="Font color"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7h6"></path><path d="M9 17h6"></path><path d="m3 17 4-10"></path><path d="M21 7c-.3 1.9-2 3-4 3h-2"></path><path d="M21 17c-.3-1.9-2-3-4-3h-2"></path></svg>
                      </button>
                      
                      {/* Attachment */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showAttachmentPopup: !n.showAttachmentPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false } : n
                          ));
                        }}
                        title="Add attachment"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                      </button>
                      
                      {/* Notes */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showNotesPopup: !n.showNotesPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false } : n
                          ));
                        }}
                        title="Add notes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                      </button>
                      
                      {/* Details (Priority/Status) */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showDetailsPopup: !n.showDetailsPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDatePopup: false, showCollaboratorPopup: false } : n
                          ));
                        }}
                        title="Details (Priority/Status)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      </button>
                      
                      {/* Due Date */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showDatePopup: !n.showDatePopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showCollaboratorPopup: false } : n
                          ));
                        }}
                        title="Set due date"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </button>
                      
                      {/* Collaborator */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, showCollaboratorPopup: !n.showCollaboratorPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false } : n
                          ));
                        }}
                        title="Assign collaborator"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </button>
                      
                      {/* Add Node */}
                      <button
                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          addChildNode(node.id);
                        }}
                        title="Add connected child node"
                      >
                        <Plus size={16} />
                      </button>
                      
                      {/* Delete Node */}
                      {node.id !== 'root' && (
                        <button
                          className="p-1.5 rounded-full hover:bg-red-100 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          title="Delete this node"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    {/* Emoji popup */}
                    {node.showEmojiPopup && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-80 popup-content">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Select Emoji or Icon</h4>
                        <div className="grid grid-cols-8 gap-2">
                          {['😊', '😂', '❤️', '👍', '🎉', '✅', '⭐', '🔥', '💡', '📌', '⚠️', '❓', '📝', '🔍', '🗓️', '📊'].map(emoji => (
                            <button 
                              key={emoji}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
                              onClick={() => {
                                setNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, emoji, showEmojiPopup: false } : n
                                ));
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Background color popup */}
                    {node.showBgColorPopup && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 popup-content">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Background Color</h4>
                        <div className="flex flex-wrap gap-2">
                          {['#EEF2FF', '#FEF3C7', '#DCFCE7', '#FEE2E2', '#E0E7FF', '#FDE68A', '#F5F5F5', '#D1FAE5', '#FFE4E6', '#EDE9FE', '#FEF9C3', '#DBEAFE'].map(color => (
                            <div 
                              key={color}
                              className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                              style={{ 
                                backgroundColor: color, 
                                border: node.color === color ? '2px solid #4F46E5' : '1px solid #E5E7EB' 
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, color, showBgColorPopup: false } : n
                                ));
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Font color popup */}
                    {node.showFontColorPopup && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 popup-content">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Font Color</h4>
                        <div className="flex flex-wrap gap-2">
                          {['#000000', '#4B5563', '#1F2937', '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#71717A'].map(color => (
                            <div 
                              key={color}
                              className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                              style={{ 
                                backgroundColor: color, 
                                border: node.fontColor === color ? '2px solid #4F46E5' : '1px solid #E5E7EB' 
                              }}
                              onClick={() => {
                                setNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, fontColor: color, showFontColorPopup: false } : n
                                ));
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Attachment popup */}
                    {node.showAttachmentPopup && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-96 popup-content">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                        
                        {/* Filters */}
                        <div className="mb-3 grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Search by name..."
                            className="p-2 text-sm border rounded-md"
                            value={attachmentFilters.search}
                            onChange={(e) => setAttachmentFilters({
                              ...attachmentFilters,
                              search: e.target.value
                            })}
                          />
                          <select 
                            className="p-2 text-sm border rounded-md"
                            value={attachmentFilters.fileType}
                            onChange={(e) => setAttachmentFilters({
                              ...attachmentFilters,
                              fileType: e.target.value
                            })}
                          >
                            <option value="">All file types</option>
                            <option value="pdf">PDF</option>
                            <option value="doc">Word</option>
                            <option value="docx">Word</option>
                            <option value="xls">Excel</option>
                            <option value="xlsx">Excel</option>
                          </select>
                          <select 
                            className="p-2 text-sm border rounded-md"
                            value={attachmentFilters.addedBy}
                            onChange={(e) => setAttachmentFilters({
                              ...attachmentFilters,
                              addedBy: e.target.value
                            })}
                          >
                            <option value="">All users</option>
                            {getUniqueUsers(node.attachments).map(user => (
                              <option key={user} value={user}>{user}</option>
                            ))}
                          </select>
                        </div>

                        {/* File input */}
                        <input 
                          type="file" 
                          accept=".xlsx,.xls,.doc,.docx,.pdf"
                          className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-3"
                          onChange={(e) => handleAttachment(e, node.id)}
                        />

                        {/* Filtered attachments list */}
                        <div className="max-h-64 overflow-y-auto">
                          {node.attachments && node.attachments.length > 0 ? (
                            <div className="divide-y">
                              {node.attachments
                                .filter(attachment => {
                                  const matchesSearch = attachment.name.toLowerCase()
                                    .includes(attachmentFilters.search.toLowerCase());
                                  const matchesType = !attachmentFilters.fileType || 
                                    attachment.type === attachmentFilters.fileType;
                                  const matchesUser = !attachmentFilters.addedBy || 
                                    attachment.addedBy === attachmentFilters.addedBy;
                                  return matchesSearch && matchesType && matchesUser;
                                })
                                .map(attachment => (
                                  <div key={attachment.id} className="py-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="text-gray-500">
                                        {attachment.type === 'pdf' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                                        {(attachment.type === 'doc' || attachment.type === 'docx') && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                        {(attachment.type === 'xls' || attachment.type === 'xlsx') && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">{attachment.name}</span>
                                        <span className="text-xs text-gray-500">
                                          Added by {attachment.addedBy} on {new Date(attachment.dateAdded).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <button 
                                      className="text-red-500 hover:text-red-700 p-1"
                                      onClick={() => setNodes(nodes.map(n => 
                                        n.id === node.id ? {
                                          ...n,
                                          attachments: n.attachments.filter(a => a.id !== attachment.id)
                                        } : n
                                      ))}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-4">
                              No attachments yet
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Notes popup */}
                    {node.showNotesPopup && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-80 popup-content">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                        <textarea
                          className="w-full p-2 border rounded-md text-sm h-24 resize-none text-black"
                          placeholder="Add notes about this node..."
                          value={node.notes || ''}
                          onChange={(e) => setNodes(nodes.map(n => 
                            n.id === node.id ? { ...n, notes: e.target.value } : n
                          ))}
                        />
                        <div className="flex justify-end mt-2">
                          <button 
                            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                            onClick={() => setNodes(nodes.map(n => 
                              n.id === node.id ? { ...n, showNotesPopup: false } : n
                            ))}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Details popup */}
                    {node.showDetailsPopup && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-80 popup-content">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                            <select 
                              className="w-full p-2 border rounded-md text-sm text-black"
                              value={node.priority || 'medium'}
                              onChange={(e) => setNodes(nodes.map(n => 
                                n.id === node.id ? { ...n, priority: e.target.value } : n
                              ))}
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
                              onChange={(e) => setNodes(nodes.map(n => 
                                n.id === node.id ? { ...n, status: e.target.value } : n
                              ))}
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
                              onChange={(e) => setNodes(nodes.map(n => 
                                n.id === node.id ? { ...n, description: e.target.value } : n
                              ))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button 
                            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                            onClick={() => setNodes(nodes.map(n => 
                              n.id === node.id ? { ...n, showDetailsPopup: false } : n
                            ))}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Date popup */}
                    {node.showDatePopup && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-64 popup-content">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Due Date</h4>
                        <div>
                          <input
                            type="date"
                            className="w-full p-2 border rounded-md text-sm text-black"
                            value={node.dueDate || ''}
                            onChange={(e) => setNodes(nodes.map(n => 
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
                )}
                
                {/* Node emoji if present */}
                {node.emoji && (
                  <div className="text-2xl mb-1">{node.emoji}</div>
                )}
                
                {/* Node attachment indicator */}
                {node.attachment && (
                  <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                    {node.attachment.length > 15 ? node.attachment.substring(0, 12) + '...' : node.attachment}
                  </div>
                )}
                
                {/* Status & priority badges if set */}
                {(node.status || node.priority) && (
                  <div className="flex gap-1 justify-center mb-1">
                    {node.priority && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        node.priority === 'low' ? 'bg-blue-100 text-blue-800' :
                        node.priority === 'medium' ? 'bg-green-100 text-green-800' :
                        node.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {node.priority.charAt(0).toUpperCase() + node.priority.slice(1)}
                      </span>
                    )}
                    {node.status && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        node.status === 'not-started' ? 'bg-gray-100 text-gray-800' :
                        node.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        node.status === 'review' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {node.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Due date badge if set */}
                {node.dueDate && (
                  <div className="flex justify-center mb-1">
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {new Date(node.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {/* Node text content */}
                {selectedNode === node.id && mode === 'cursor' ? (
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => updateNodeText(node.id, e.target.value)}
                    className="bg-transparent outline-none w-full text-center"
                    style={{ color: node.fontColor || 'black' }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <div style={{ color: node.fontColor || 'black' }}>{node.text}</div>
                )}
                
                {/* Notes indicator if present */}
                {node.notes && (
                  <div className="mt-1 text-xs text-gray-500 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                    Has notes
                  </div>
                )}

                {/* Attachment indicator */}
                {node.attachments && node.attachments.length > 0 && (
                  <div 
                    className="mt-1 text-xs text-gray-500 flex items-center justify-center gap-1 cursor-pointer hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNodes(nodes.map(n => 
                        n.id === node.id ? { ...n, showAttachmentPopup: true } : n
                      ));
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                    <span>{node.attachments.length}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Collaborator selection dialog */}
          {showCollaboratorDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                <h3 className="text-lg font-medium mb-4">Assign Collaborator</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedNodes.length} {selectedNodes.length === 1 ? 'node' : 'nodes'} selected
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {collaborators.map(collab => (
                    <button
                      key={collab.id}
                      className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50"
                      onClick={() => assignCollaborator(collab)}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-2"
                        style={{ backgroundColor: collab.color }}>
                        {collab.initials}
                      </div>
                      <span className="text-sm">{collab.name}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      setSelectedNodes([]);
                      setShowCollaboratorDialog(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MindMap;