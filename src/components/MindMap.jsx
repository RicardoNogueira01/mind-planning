

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
                  zIndex: selectedNode === node.id ? 20 : 10, // Higher z-index for selected node but still below popup
                  minWidth: '150px',
                  maxWidth: '200px',
                  textAlign: 'center',
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
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
                    <button
                      className="bg-indigo-100 rounded-full p-1 hover:bg-indigo-200 text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        addChildNode(node.id);
                      }}
                      title="Add connected child node"
                    >
                      <Plus size={16} />
                    </button>
                    
                    {/* Delete button on node */}
                    {node.id !== 'root' && (
                      <button
                        className="bg-red-100 rounded-full p-1 hover:bg-red-200 text-red-600"
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
                )}
                
                {/* Node Options Popup */}
                {selectedNode === node.id && mode === 'cursor' && (
                  <div 
                    className="absolute bg-white shadow-lg rounded-md p-3 flex flex-col gap-3"
                    style={{ 
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '20px',
                      width: '250px',
                      zIndex: 100 // Higher z-index to ensure it appears above all nodes
                    }}
                  >
                    <div className="border-b pb-2 mb-1 flex justify-between items-center">
                      <h3 className="font-medium text-sm text-gray-700">Node Options</h3>
                      {node.id !== 'root' && (
                        <button 
                          onClick={() => deleteNode(node.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Delete this node"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid gap-3">
                      {/* Background color picker */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Background Color</label>
                        <div className="flex flex-wrap gap-2">
                          {['#EEF2FF', '#FEF3C7', '#DCFCE7', '#FEE2E2', '#E0E7FF', '#FDE68A'].map(color => (
                            <div 
                              key={color}
                              className="w-6 h-6 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                              style={{ 
                                backgroundColor: color, 
                                border: node.color === color ? '2px solid #4F46E5' : '1px solid #E5E7EB' 
                              }}
                              onClick={() => setNodes(nodes.map(n => 
                                n.id === node.id ? { ...n, color } : n
                              ))}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Due Date selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            className="p-1 text-sm border rounded w-full text-black"
                            value={node.dueDate || ''}
                            onChange={(e) => {
                              setNodes(nodes.map(n => 
                                n.id === node.id ? { ...n, dueDate: e.target.value } : n
                              ));
                            }}
                          />
                          {node.dueDate && (
                            <button 
                              onClick={() => {
                                setNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, dueDate: null } : n
                                ));
                              }}
                              className="p-1 rounded hover:bg-red-50 text-red-500 text-xs whitespace-nowrap"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {/* Show date status */}
                        {node.dueDate && (() => {
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
                            <div className="mt-1 text-xs">
                              <span className={`px-2 py-0.5 rounded-full ${statusClass}`}>
                                {statusText}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Assign collaborator */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Assign to</label>
                        <div className="flex items-center gap-2">
                          <button 
                            className="px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            onClick={() => {
                              setSelectedNodes([node.id]);
                              setShowCollaboratorDialog(true);
                            }}
                          >
                            Select Collaborator
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedNode === node.id && mode === 'cursor' ? (
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => updateNodeText(node.id, e.target.value)}
                    className="bg-transparent outline-none w-full text-center text-black"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <div className='text-black'>{node.text}</div>
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