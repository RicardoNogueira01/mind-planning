import React, { useState, useMemo } from 'react';
import { COLLAB_PAGE_SIZE } from './constants';
import PropTypes from 'prop-types';

const CollaboratorDialog = ({
  showCollaboratorDialog,
  setShowCollaboratorDialog,
  selectedNodes,
  setSelectedNodes,
  collaborators,
  assignCollaborator,
  collaboratorNodeId,
  setCollaboratorNodeId,
  nodes
}) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = COLLAB_PAGE_SIZE;
  
  // Filter collaborators by search query
  const filtered = useMemo(() => {
    if (!searchQuery) return collaborators;
    const query = searchQuery.toLowerCase();
    return collaborators.filter(c => 
      c.name.toLowerCase().includes(query) || 
      (c.initials && c.initials.toLowerCase().includes(query))
    );
  }, [collaborators, searchQuery]);
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => filtered.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize), [filtered, currentPage]);
  
  // Get current node's collaborators for checkbox mode
  const currentNode = useMemo(() => {
    if (!collaboratorNodeId || !nodes) return null;
    return nodes.find(n => n.id === collaboratorNodeId);
  }, [collaboratorNodeId, nodes]);
  
  const nodeCollaborators = useMemo(() => {
    if (!currentNode) return [];
    return Array.isArray(currentNode.collaborators) ? currentNode.collaborators : [];
  }, [currentNode]);

  if (!showCollaboratorDialog) return null;

  const handleCancel = () => {
    setSelectedNodes([]);
    setCollaboratorNodeId(null);
    setShowCollaboratorDialog(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-5 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white bg-opacity-80 rounded-xl shadow-xl border border-gray-200 p-5 w-72">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {collaboratorNodeId ? 'Assign Collaborators' : 'Assign Collaborator to Group'}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          {collaboratorNodeId ? 'Select collaborators for this node' : `${selectedNodes.length} ${selectedNodes.length === 1 ? 'node' : 'nodes'} selected`}
        </p>
        
        {/* Search input */}
        <input
          type="text"
          className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search collaborators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        
        {/* Collaborator list - checkboxes for single node, buttons for group */}
        <div className="max-h-64 overflow-y-auto">
          {collaboratorNodeId ? (
            // Checkbox mode for individual node assignment
            <div className="flex flex-col gap-1">
              {pageItems.map(collab => {
                const isSelected = nodeCollaborators.includes(collab.id);
                return (
                  <label 
                    key={collab.id} 
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        assignCollaborator(collaboratorNodeId, collab.id);
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" 
                      style={{ backgroundColor: collab.color, color: '#000000' }}
                    >
                      {collab.initials}
                    </span>
                    <span className="text-sm text-gray-700">{collab.name}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            // Button mode for group creation
            <div className="grid grid-cols-2 gap-3">
              {pageItems.map(collab => (
                <button
                  key={collab.id}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  onClick={() => {
                    assignCollaborator(collab);
                    setShowCollaboratorDialog(false);
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: collab.color, color: '#000000' }}
                  >
                    {collab.initials}
                  </div>
                  <span className="text-sm text-gray-700">{collab.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
  {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <button
              className={`text-sm ${currentPage === 1 ? 'text-gray-400' : 'text-blue-600'}`}
              disabled={currentPage === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} / {totalPages}</span>
            <button
              className={`text-sm ${currentPage === totalPages ? 'text-gray-400' : 'text-blue-600'}`}
              disabled={currentPage === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
        
        <div className="mt-6 flex justify-end gap-2">
          {collaboratorNodeId && (
            <button
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              onClick={() => {
                setCollaboratorNodeId(null);
                setShowCollaboratorDialog(false);
              }}
            >
              Done
            </button>
          )}
          <button
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorDialog;

CollaboratorDialog.propTypes = {
  showCollaboratorDialog: PropTypes.bool.isRequired,
  setShowCollaboratorDialog: PropTypes.func.isRequired,
  selectedNodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedNodes: PropTypes.func.isRequired,
  collaborators: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    initials: PropTypes.string,
    name: PropTypes.string.isRequired,
    color: PropTypes.string
  })).isRequired,
  assignCollaborator: PropTypes.func.isRequired,
  collaboratorNodeId: PropTypes.string,
  setCollaboratorNodeId: PropTypes.func
};
