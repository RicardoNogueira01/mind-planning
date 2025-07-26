import React from 'react';

const CollaboratorDialog = ({
  showCollaboratorDialog,
  setShowCollaboratorDialog,
  selectedNodes,
  setSelectedNodes,
  collaborators,
  assignCollaborator
}) => {
  if (!showCollaboratorDialog) return null;

  const handleCancel = () => {
    setSelectedNodes([]);
    setShowCollaboratorDialog(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-80">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Collaborator</h3>
        <p className="text-sm text-gray-500 mb-4">
          {selectedNodes.length} {selectedNodes.length === 1 ? 'node' : 'nodes'} selected
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {collaborators.map(collab => (
            <button
              key={collab.id}
              className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => assignCollaborator(collab)}
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
