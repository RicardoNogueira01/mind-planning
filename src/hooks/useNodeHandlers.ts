/**
 * Node Handlers Hook
 * Handles: attachments, emoji, colors, collaborators, and group management
 */

import { useCallback } from 'react';

export function useNodeHandlers(
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
) {
  // Attachment handlers
  const handleAttachment = useCallback((e, nodeId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const newAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        dateAdded: new Date().toISOString(),
        addedBy: 'current-user',
        type: file.name.split('.').pop().toLowerCase(),
        data: event.target.result,
        size: file.size,
      };
      setNodes(nodes.map(n => 
        n.id === nodeId 
          ? { ...n, attachments: [...(n.attachments || []), newAttachment] } 
          : n
      ));
    };
    reader.readAsDataURL(file);
    try { e.target.value = ''; } catch {
      // Ignore errors when clearing file input
    }
  }, [nodes, setNodes]);

  const removeAttachment = useCallback((nodeId, attachmentId) => {
    setNodes(nodes.map(n => 
      n.id === nodeId 
        ? { ...n, attachments: (n.attachments || []).filter(a => a.id !== attachmentId) } 
        : n
    ));
  }, [nodes, setNodes]);

  const downloadAttachment = useCallback((attachment) => {
    if (!attachment.data) return;
    
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  // Node appearance handlers
  const setNodeEmoji = useCallback((nodeId, emoji) => {
    setNodes(prevNodes => prevNodes.map(n => n.id === nodeId ? { ...n, emoji } : n));
  }, [setNodes]);

  const selectBgColor = useCallback((nodeId, color) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, bgColor: color } : n));
  }, [nodes, setNodes]);

  const selectFontColor = useCallback((nodeId, color) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, fontColor: color } : n));
  }, [nodes, setNodes]);

  // Collaborator handlers
  const assignCollaborator = useCallback((nodeIdOrCollaborator, collaboratorId = null) => {
    // Case 1: Single node assignment (from node toolbar button)
    if (typeof nodeIdOrCollaborator === 'string' && collaboratorId) {
      const nodeId = nodeIdOrCollaborator;
      setNodes(nodes.map(n => {
        if (n.id !== nodeId) return n;
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
    const collaborator = nodeIdOrCollaborator;
    
    const newGroup: any = {
      id: `group-${Date.now()}`,
      nodeIds: [...selectedNodes],
      collaborator
    };
    
    // Calculate bounding box for the group
    const groupNodes = nodes.filter(node => selectedNodes.includes(node.id));
    const minX = Math.min(...groupNodes.map(node => node.x - 150));
    const maxX = Math.max(...groupNodes.map(node => node.x + 150));
    const minY = Math.min(...groupNodes.map(node => node.y - 42));
    const maxY = Math.max(...groupNodes.map(node => node.y + 42));
    
    newGroup.boundingBox = {
      x: minX - 15,
      y: minY - 15,
      width: (maxX - minX) + 30,
      height: (maxY - minY) + 30
    };
    
    setNodeGroups([...nodeGroups, newGroup]);
    setSelectedNodes([]);
    setShowCollaboratorDialog(false);
    setMode('cursor');
    setSelectionType('simple');
  }, [nodes, setNodes, selectedNodes, nodeGroups, setNodeGroups, setSelectedNodes, setShowCollaboratorDialog, setMode, setSelectionType]);

  // Group management handlers
  const selectGroupNodes = useCallback((groupId) => {
    const group = nodeGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedNodes(group.nodeIds || []);
    }
  }, [nodeGroups, setSelectedNodes]);

  const deleteGroupById = useCallback((groupId) => {
    setNodeGroups(nodeGroups.filter(g => g.id !== groupId));
    setOpenGroupMenuId(null);
    setHudGroupId(null);
  }, [nodeGroups, setNodeGroups, setOpenGroupMenuId, setHudGroupId]);

  const toggleCollaboratorInGroup = useCallback((groupId, collaboratorId) => {
    setNodeGroups(nodeGroups.map(g => {
      if (g.id !== groupId) return g;
      const extraCollabs = Array.isArray(g.extraCollaborators) ? g.extraCollaborators : [];
      const has = extraCollabs.includes(collaboratorId);
      if (has) {
        return { ...g, extraCollaborators: extraCollabs.filter(id => id !== collaboratorId) };
      }
      return { ...g, extraCollaborators: [...extraCollabs, collaboratorId] };
    }));
  }, [nodeGroups, setNodeGroups]);

  return {
    handleAttachment,
    removeAttachment,
    downloadAttachment,
    setNodeEmoji,
    selectBgColor,
    selectFontColor,
    assignCollaborator,
    selectGroupNodes,
    deleteGroupById,
    toggleCollaboratorInGroup
  };
}
