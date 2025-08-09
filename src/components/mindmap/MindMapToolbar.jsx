import React from 'react';
import { Plus, Trash2, MousePointer, Hand, Users, Home } from 'lucide-react';

const MindMapToolbar = ({
  mode,
  setMode,
  selectionType,
  setSelectionType,
  selectedNodes,
  addStandaloneNode,
  deleteNodes,
  historyIndex,
  history,
  undo,
  redo,
  onBack
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl p-3">
      <div className="flex items-center gap-1">
        
        {/* Back to Dashboard Button */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50/50">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-lg text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-200 group border border-gray-200/60 hover:border-gray-300"
            title="Back to Dashboard"
          >
            <Home size={18} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />
        
        {/* Selection Tools Group */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50/50">
          <button 
            onClick={() => {
              setMode('cursor');
              setSelectionType('simple');
            }}
            className={`p-2.5 rounded-lg transition-all duration-200 group border ${
              mode === 'cursor' && selectionType === 'simple' 
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 border-blue-600' 
                : 'text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Selection Mode"
          >
            <MousePointer size={18} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <button 
            onClick={() => {
              setMode('cursor');
              setSelectionType('collaborator');
            }}
            className={`p-2.5 rounded-lg transition-all duration-200 group border ${
              mode === 'cursor' && selectionType === 'collaborator' 
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20 border-purple-600' 
                : 'text-gray-700 hover:bg-white hover:text-purple-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Collaborator Mode"
          >
            <Users size={18} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <button 
            onClick={() => setMode('pan')}
            className={`p-2.5 rounded-lg transition-all duration-200 group border ${
              mode === 'pan' 
                ? 'bg-green-500 text-white shadow-md shadow-green-500/20 border-green-600' 
                : 'text-gray-700 hover:bg-white hover:text-green-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Pan Mode"
          >
            <Hand size={18} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />
        
        {/* Content Creation Group */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50/50">
          <button 
            onClick={addStandaloneNode} 
            className="p-2.5 rounded-lg text-gray-700 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all duration-200 group border border-gray-200/60 hover:border-gray-300"
            title="Add New Node"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
          
          <button 
            onClick={() => selectedNodes.length > 0 && deleteNodes(selectedNodes)}
            className={`p-2.5 rounded-lg transition-all duration-200 group border ${
              selectedNodes.length > 0 
                ? 'text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300' 
                : 'text-gray-400 cursor-not-allowed border-gray-100'
            }`}
            title="Delete Selected Nodes"
            disabled={selectedNodes.length === 0}
          >
            <Trash2 size={18} className={selectedNodes.length > 0 ? 'group-hover:scale-110 transition-transform duration-200' : ''} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />

        {/* History Controls Group */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50/50">
          <button 
            onClick={undo}
            className={`p-2.5 rounded-lg transition-all duration-200 group border ${
              historyIndex <= 0 
                ? 'text-gray-400 cursor-not-allowed border-gray-100' 
                : 'text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Undo"
            disabled={historyIndex <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={historyIndex > 0 ? 'group-hover:scale-110 transition-transform duration-200' : ''}>
              <path d="M9 17L4 12l5-5" />
              <path d="M20 18v-1a4 4 0 0 0-4-4H4" />
            </svg>
          </button>
          
          <button 
            onClick={redo}
            className={`p-2.5 rounded-lg transition-all duration-200 group border ${
              historyIndex >= history.length - 1 
                ? 'text-gray-400 cursor-not-allowed border-gray-100' 
                : 'text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Redo"
            disabled={historyIndex >= history.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={historyIndex < history.length - 1 ? 'group-hover:scale-110 transition-transform duration-200' : ''}>
              <path d="M15 7l5 5-5 5" />
              <path d="M4 6v1a4 4 0 0 0 4 4h12" />
            </svg>
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default MindMapToolbar;
