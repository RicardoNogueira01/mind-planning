import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Plus, Trash2, MousePointer, Hand, Users, Link, Home } from 'lucide-react';
import MindMapManager from './MindMapManager';

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
      const isClickInsidePopupContent = e.target.closest('.popup-content');      if (nodes.some(node => node.showEmojiPopup || node.showBgColorPopup || node.showFontColorPopup || 
                         node.showAttachmentPopup || node.showNotesPopup || node.showDetailsPopup || 
                         node.showDatePopup || node.showCollaboratorPopup || node.showLayoutPopup || node.showTagsPopup)) {
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
      const popupElements = document.querySelectorAll('.popup-content');
      let clickedInsidePopup = false;
  
      popupElements.forEach(popup => {
        if (popup.contains(event.target)) {
          clickedInsidePopup = true;
        }
      });
  
      if (!clickedInsidePopup) {        setNodes(nodes.map(node => ({
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
      const clickedOnPopup = e.target.closest('.popup-content');
      
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
  const findAvailablePosition = (nodes, centerX, centerY, radius = 200) => {
    const angleStep = (2 * Math.PI) / 8; // Divide circle into 8 positions
    let currentAngle = Math.random() * 2 * Math.PI; // Start at random angle
    let currentRadius = radius;
    let attempts = 0;
    const maxAttempts = 16; // Try different positions before increasing radius
  
    while (attempts < maxAttempts) {
      const x = centerX + Math.cos(currentAngle) * currentRadius;
      const y = centerY + Math.sin(currentAngle) * currentRadius;
  
      // Check if position is far enough from all other nodes
      const isFarEnough = nodes.every(node => {
        const distance = Math.sqrt(
          Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2)
        );
        return distance > 200; // Minimum distance between nodes
      });
  
      if (isFarEnough) {
        return { x, y };
      }
  
      currentAngle += angleStep;
      attempts++;
  
      // If we've tried all angles at current radius, increase radius and try again
      if (attempts % 8 === 0) {
        currentRadius += 100;
      }
    }
  
    // If all else fails, return a position with increased radius
    return {
      x: centerX + Math.cos(currentAngle) * (currentRadius + 200),
      y: centerY + Math.sin(currentAngle) * (currentRadius + 200)
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
      text: 'New Idea',
      x: x,
      y: y,
      color: '#EEF2FF'
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
    // Calculate dynamic parent width
    const parentWidth = Math.min(450, Math.max(150, parent.text.length * 10));
    
    // Position child to the right of parent with spacing
    const minSpacing = 200; // Minimum spacing between parent and child
    const newX = parent.x + parentWidth/2 + minSpacing;
    
    // Improved vertical positioning for children
    const verticalSpacing = 100; // Space between children
    let newY;
    
    if (childCount === 0) {
      // First child at same level as parent
      newY = parent.y;
    } else {
      // Alternate children above and below parent
      const isEven = childCount % 2 === 0;
      const offset = Math.ceil(childCount / 2) * verticalSpacing;
      newY = parent.y + (isEven ? offset : -offset);
    }

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
    };    // console.log('DEBUG: Adding child node', {
    //   parentId,
    //   newId,
    //   parentPos: { x: parent.x, y: parent.y },
    //   childPos: { x: newX, y: newY },
    //   childCount,
    //   existingChildren: existingChildren.length
    // });

    wrappedSetNodesAndConnections([...nodes, newNode], [...connections, newConnection]);
    // setSelectedNode(newId); // Do NOT select the new child node, keep focus on parent
  };
  
  // Update node text
  const updateNodeText = (nodeId, text) => {
    wrappedSetNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, text } : node
    ));
  };
  
  // Add this state to track whether a node is in edit mode
  const [editingNode, setEditingNode] = useState(null);

  // Update the handleNodeClick function to prevent focusing on the node when clicking inside a popup or input
const handleNodeClick = (nodeId, e) => {
  // Prevent focusing on the node if the click is inside a popup or input
  if (e.target.closest('.popup-content') || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
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
};    // Handle node dragging
  const handleNodeDrag = (nodeId, newX, newY) => {
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
              fill="#64748B"
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
                stroke="#64748B"
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
      className="relative w-full h-screen bg-slate-50 overflow-hidden" 
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
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-20 bg-white shadow rounded-lg p-2">
            <div className="flex gap-2">              <button 
                onClick={() => {
                  if (onBack) {
                    onBack();
                  }
                }}
                className="p-2 rounded text-black hover:bg-gray-100"
                title="Back to Dashboard"
              >
                <Home size={20} />
              </button>

              <div className="w-px h-6 bg-gray-200 my-auto" /> {/* Divider */}
              
              <button 
                onClick={() => {
                  setMode('cursor');
                  setSelectionType('simple');
                }}
                className={`p-2 rounded text-black ${mode === 'cursor' && selectionType === 'simple' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Simple select mode"
              >
                <MousePointer size={20} />
              </button>
              <button 
                onClick={() => {
                  setMode('cursor');
                  setSelectionType('collaborator');
                }}
                className={`p-2 rounded text-black ${mode === 'cursor' && selectionType === 'collaborator' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Collaborator select mode"
              >
                <Users size={20} />
              </button>
              <button 
                onClick={() => setMode('pan')}
                className={`p-2 rounded text-black ${mode === 'pan' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Pan mode"
              >
                <Hand size={20} />
              </button>
              
              {/* Rest of the toolbar buttons */}
              <button 
                onClick={addStandaloneNode} 
                className="p-2 hover:bg-gray-100 rounded text-black"
                title="Add standalone node"
              >
                <Plus size={20} />
              </button>
              
              <button 
                onClick={() => selectedNodes.length > 0 && deleteNodes(selectedNodes)}
                className={`p-2 rounded ${selectedNodes.length > 0 ? 'hover:bg-red-100 text-red-600' : 'text-gray-400'}`}
                title="Delete selected nodes"
                disabled={selectedNodes.length === 0}
              >
                <Trash2 size={20} />
              </button>

              {/* Add undo and redo buttons to the toolbar */}
              <button 
                onClick={undo}
                className="p-2 rounded text-black hover:bg-gray-100"
                title="Undo"
                disabled={historyIndex <= 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 17L4 12l5-5" />
                  <path d="M20 18v-1a4 4 0 0 0-4-4H4" />
                </svg>
              </button>
              <button 
                onClick={redo}
                className="p-2 rounded text-black hover:bg-gray-100"
                title="Redo"
                disabled={historyIndex >= history.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 7l5 5-5 5" />
                  <path d="M4 6v1a4 4 0 0 0 4 4h12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Add this right after the toolbar div in the return statement */}
          {/* After the closing </div> of the toolbar and before the zoom controls */}
          {/* Search input with results container */}
          <div className="absolute top-20 left-4 z-20 w-80">
            {/* Search input */}
            <input
              type="text"
              placeholder="Search nodes..."
              className="w-full px-4 py-2 bg-white shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-black" // Added text-black here
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchList(true);
              }}
              onFocus={() => setShowSearchList(true)}
            />
            
            {/* Search results list - positioned relative to the container */}
            {showSearchList && searchQuery && (
              <div className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded-lg p-2 max-h-96 overflow-y-auto">
                {nodes
                  .filter(node => node.text.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(node => (
                    <div 
                      key={node.id}
                      className="p-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setSelectedNode(node.id);
                        setShowSearchList(false);
                        setPan({
                          x: window.innerWidth/2 - node.x,
                          y: window.innerHeight/2 - node.y
                        });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {/* Show node emoji if it exists */}
                        {node.emoji && <span>{node.emoji}</span>}
                        {/* Show node text */}
                        <span className="text-sm text-gray-700">{node.text}</span>
                      </div>
                      {/* Show node type/role */}
                      <span className="text-xs text-gray-500">
                        {node.id === 'root' ? 'Central Idea' : 'Sub-topic'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
                 
          {/* Wrapper for panned and zoomed content */}
          <div 
            key={nodes.length + '-' + connections.length}
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Group bounding boxes */}
            {renderNodeGroups()}            {/* Connections between nodes */}
            {renderConnections}
            
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
            {nodes.map(node => {
              const isNodeMatching = searchQuery ? 
                node.text.toLowerCase().includes(searchQuery.toLowerCase()) : true;
              
              // Calculate dynamic width based on text length
              const textLength = node.text.length;
              const nodeWidth = Math.min(350, Math.max(150, textLength * 10));

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  ref={el => { nodeRefs.current[node.id] = el; }}
                  className={`absolute p-3 rounded-lg shadow cursor-move node
                    ${selectedNodes.includes(node.id) ? 'ring-2 ring-indigo-500' : ''}`}
                  style={{
                    left: node.x - nodeWidth / 2, // Center the node horizontally
                    top: node.y - 25, // Adjust vertical position
                    width: nodeWidth,
                    minHeight: 50, // Ensure minimum height for consistent connection points
                    backgroundColor: node.color,
                    zIndex: searchQuery ? (isNodeMatching ? 20 : 10) : 10,
                    textAlign: 'center',
                    opacity: searchQuery ? (isNodeMatching ? 1 : 0.3) : 1,
                    transition: 'opacity 0.2s ease-in-out',
                    position: 'relative'  // Ensure the node container is relative
                  }}
                  onClick={(e) => handleNodeClick(node.id, e)}
                  onMouseDown={(e) => {
                    // Prevent moving the node if it is being edited
                    if (editingNode === node.id) return;
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
                      <div className="bg-white shadow-md rounded-full flex items-center p-1 gap-1 z-30">                        {/* Emoji Selector */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            wrappedSetNodes(nodes.map(n => 
                              n.id === node.id ? { ...n, showEmojiPopup: !n.showEmojiPopup, showBgColorPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
                            ));
                          }}
                          title="Add emoji or icon"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                          </svg>
                        </button>
                          {/* Background Color */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                          {/* Font Color */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                          {/* Attachment */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                          {/* Notes */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                          {/* Details (Priority/Status) */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                          {/* Due Date */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                          {/* Collaborator */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                        
                        {/* Tags */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                        
                        {/* Add Node */}
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6l-2 14H7L5 6"></path>
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
                            </svg>
                          </button>
                        )}

                        {/* Add this inside the node options toolbar, only for root node */}
                        {node.id === 'root' && (
                          <button
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
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
                                  wrappedSetNodes(nodes.map(n => 
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
                                  wrappedSetNodes(nodes.map(n => 
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
                                  wrappedSetNodes(nodes.map(n => 
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
                              className="p-2 text-sm border rounded-md text-black" // Added text-black here
                              value={attachmentFilters.search}
                              onChange={(e) => setAttachmentFilters({
                                ...attachmentFilters,
                                search: e.target.value
                              })}
                            />
                            <select 
                              className="p-2 text-sm border rounded-md text-black" // Added text-black here
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
                              className="p-2 text-sm border rounded-md text-black" // Added text-black here
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
                                          {attachment.type === 'pdf' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 0 0 2-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 00 2 2z" /></svg>}
                                          {(attachment.type === 'doc' || attachment.type === 'docx') && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                          {(attachment.type === 'xls' || attachment.type === 'xlsx') && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24  24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M4 3h16a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2H4a2 2 0 0 0-2-2z" /></svg>}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium text-black">{attachment.name}</span> {/* Added text-black here */}
                                          <span className="text-xs text-gray-500">
                                            Added by {attachment.addedBy} on {new Date(attachment.dateAdded).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                      <button 
                                        className="text-red-500 hover:text-red-700 p-1"
                                        onClick={() => wrappedSetNodes(nodes.map(n => 
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
                            onChange={(e) => wrappedSetNodes(nodes.map(n => 
                              n.id === node.id ? { ...n, notes: e.target.value } : n
                            ))}
                          />
                          <div className="flex justify-end mt-2">
                            <button 
                              className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                              onClick={() => wrappedSetNodes(nodes.map(n => 
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
                                onChange={(e) => wrappedSetNodes(nodes.map(n => 
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
                                onChange={(e) => wrappedSetNodes(nodes.map(n => 
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
                                onChange={(e) => wrappedSetNodes(nodes.map(n => 
                                  n.id === node.id ? { ...n, description: e.target.value } : n
                                ))}
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
                      
                      {/* Date popup */}
                      {node.showDatePopup && (
                        <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-64 popup-content">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Due Date</h4>
                          <div>
                            <input
                              type="date"
                              className="w-full p-2 border rounded-md text-sm text-black"
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

                      {/* Add this with the other popups */}
                      {node.showLayoutPopup && node.id === 'root' && (
                        <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-64 popup-content">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Choose Layout</h4>
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
                  
                  {/* Node emoji if present */}
                  {node.emoji && (
                    <div className="text-2xl mb-1">{node.emoji}</div>
                  )}
                  
                  {/* Node attachment indicator */}
                  {node.attachment && (
                    <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line>
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
                  
                  {/* Tags display */}                  {Array.isArray(node.tags) && node.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mb-1">
                      {node.tags.map(tagId => {
                        const tag = globalTags.find(t => t.id === tagId);
                        if (!tag) return null;
                        const displayText = tag.title || `Color ${globalTags.findIndex(t => t.id === tag.id) + 1}`;
                        return (
                          <span
                            key={tagId}
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: tag.color }}
                            title={displayText}
                          >
                            {displayText}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Collaborator popup */}
                  {node.showCollaboratorPopup && (
                    <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-72 popup-content" onClick={e => e.stopPropagation()}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Assign Collaborators</h4>
                      <input
                        type="text"
                        className="w-full p-2 mb-2 border rounded-md text-sm text-black"
                        placeholder="Search collaborators..."
                        value={node.collaboratorSearch || ''}
                        onChange={e => wrappedSetNodes(nodes.map(n =>
                          n.id === node.id ? { ...n, collaboratorSearch: e.target.value } : n
                        ))}
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                        {collaborators.filter(c =>
                          !node.collaboratorSearch || c.name.toLowerCase().includes(node.collaboratorSearch.toLowerCase()) || c.initials.toLowerCase().includes(node.collaboratorSearch.toLowerCase())
                        ).map(collab => (
                          <label key={collab.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
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
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: collab.color, color: 'white' }}>{collab.initials}</span>
                            <span className="text-sm text-gray-700">{collab.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          onClick={() => {
                            setSelectedNodes([]);
                            setShowCollaboratorDialog(false);
                          }}
                        >
                          Cancel
                        </button>                      </div>
                    </div>
                  )}
                    {/* Tags popup */}
                  {node.showTagsPopup && (
                    <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-80 popup-content" onClick={e => e.stopPropagation()}>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Manage Tags</h4>
                      
                      {/* Tags list */}
                      <div className="max-h-48 overflow-y-auto mb-3">
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
                                  onBlur={e => {
                                    // Check if the related target (what's being clicked) is a color picker
                                    const isColorPicker = e.relatedTarget && e.relatedTarget.closest('.flex.flex-wrap.gap-1');
                                    if (!isColorPicker) {
                                      if (editingTag.title.trim()) {
                                        setGlobalTags(globalTags.map(t =>
                                          t.id === tag.id
                                            ? { ...t, title: editingTag.title, color: editingTag.color }
                                            : t
                                        ));
                                      }
                                      setEditingTag(null);
                                    }
                                  }}
                                  autoFocus
                                />
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
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                  </svg>
                                </button>
                                <button
                                  className="p-1 hover:bg-red-200 rounded text-red-600"
                                  onClick={() => deleteTag(tag.id)}
                                  title="Delete tag"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  
                  {/* Collaborator avatars on node (OUTSIDE, close to node) */}
                  {Array.isArray(node.collaborators) && node.collaborators.length > 0 && (
                    <div
                      className="flex gap-1 z-30"
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

                  {/* Node text content (editable) */}
                  {selectedNode === node.id && mode === 'cursor' ? (
                    editingNode === node.id ? (
                      <textarea
                        value={node.text}
                        onChange={(e) => updateNodeText(node.id, e.target.value)}
                        className="bg-transparent outline-none w-full text-center resize-none overflow-hidden whitespace-pre-wrap"
                        style={{ color: node.fontColor || 'black', whiteSpace: 'pre-wrap' }}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => {
                          setIsEditing(true);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onBlur={() => {
                          setEditingNode(null);
                          setIsEditing(false);
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                        }}
                        autoFocus
                        rows={1}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full text-center cursor-text"
                        style={{ color: node.fontColor || 'black' }}
                      >
                        {node.text}
                      </div>
                    )
                  ) : (
                    <div style={{ color: node.fontColor || 'black' }}>{node.text}</div>
                  )}
                </div>
              );
            })}
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
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-2"
                        style={{ backgroundColor: collab.color }}
                      >
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