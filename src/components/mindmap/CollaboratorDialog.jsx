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
  setCollaboratorNodeId
}) => {
  const [page, setPage] = useState(1);
  const pageSize = COLLAB_PAGE_SIZE;
  const filtered = collaborators; // placeholder for future search
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => filtered.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize), [filtered, currentPage]);

  if (!showCollaboratorDialog) return null;

  const handleCancel = () => {
    setSelectedNodes([]);
    setCollaboratorNodeId(null);
    setShowCollaboratorDialog(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-5 w-72">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Collaborator</h3>
        <p className="text-sm text-gray-500 mb-4">
          {collaboratorNodeId ? 'Assigning to node' : `${selectedNodes.length} ${selectedNodes.length === 1 ? 'node' : 'nodes'} selected`}
        </p>
        
  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {pageItems.map(collab => (
            <button
              key={collab.id}
              className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => {
                if (collaboratorNodeId) {
                  assignCollaborator(collaboratorNodeId, collab.id);
                  setCollaboratorNodeId(null);
                } else {
                  assignCollaborator(collab);
                }
                setShowCollaboratorDialog(false);
              }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-2"
                style={{ backgroundColor: collab.color }}
              >
                {collab.initials}
              </div>
              <span className="text-sm text-gray-700">{collab.name}</span>
            </button>
          ))}
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
        
        <div className="mt-6 flex justify-end">
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
