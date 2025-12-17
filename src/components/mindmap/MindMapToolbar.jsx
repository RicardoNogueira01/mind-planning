import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Trash2, MousePointer, Hand, Users, Home, X, Camera, SquareDashedMousePointer } from 'lucide-react';

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
  onBack,
  showMobileToolbar = true,
  isMobile = false,
  onClose,
  onImageAnalyze
}) => {
  return (
    <div 
      className={`${
        isMobile 
          ? `fixed left-0 top-0 h-full z-[70] bg-white shadow-2xl border-r border-gray-200 w-20 p-4 transition-transform duration-300 ease-in-out ${
              showMobileToolbar ? 'translate-x-0' : 'translate-x-[-100%]'
            }` 
          : 'absolute top-4 left-4 z-20 bg-white shadow-lg border border-gray-100 rounded-2xl p-2.5'
      }`}
    >
      <div className={`flex ${isMobile ? 'flex-col h-full' : 'items-center'} gap-0.5`}>
        
        {/* Close Button - Mobile Only */}
        {isMobile && (
          <div className="flex justify-center mb-3">
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              title="Close Menu"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Back to Dashboard & Camera Button */}
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-0.5`}>
          <button 
            onClick={onBack}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group`}
            title="Back to Dashboard"
          >
            <Home size={18} strokeWidth={2} className="mx-auto" />
          </button>
          
          <button 
            onClick={onImageAnalyze}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group`}
            title="Analyze Image"
          >
            <Camera size={18} strokeWidth={2} className="mx-auto" />
          </button>
        </div>

        {/* Divider */}
        <div className={`${isMobile ? 'h-px w-full my-2' : 'w-px h-6 mx-1'} bg-gray-200`} />
        
        {/* Selection Tools Group */}
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-0.5`}>
          <button 
            onClick={() => {
              setMode('cursor');
              setSelectionType('simple');
            }}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg transition-all duration-200 ${
              mode === 'cursor' && selectionType === 'simple' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
            title="Selection Mode"
          >
            <MousePointer size={18} strokeWidth={2} className="mx-auto" />
          </button>
          
          <button 
            onClick={() => {
              setMode('cursor');
              setSelectionType('multi');
            }}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg transition-all duration-200 ${
              mode === 'cursor' && selectionType === 'multi' 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
            }`}
            title="Multi-Select Mode"
          >
            <SquareDashedMousePointer size={18} strokeWidth={2} className="mx-auto" />
          </button>
          
          <button 
            onClick={() => {
              setMode('cursor');
              setSelectionType('collaborator');
            }}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg transition-all duration-200 ${
              mode === 'cursor' && selectionType === 'collaborator' 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
            }`}
            title="Collaborator Mode"
          >
            <Users size={18} strokeWidth={2} className="mx-auto" />
          </button>
          
          <button 
            onClick={() => setMode('pan')}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg transition-all duration-200 ${
              mode === 'pan' 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
            }`}
            title="Pan Mode"
          >
            <Hand size={18} strokeWidth={2} className="mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

MindMapToolbar.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  selectionType: PropTypes.string.isRequired,
  setSelectionType: PropTypes.func.isRequired,
  selectedNodes: PropTypes.array.isRequired,
  addStandaloneNode: PropTypes.func.isRequired,
  deleteNodes: PropTypes.func.isRequired,
  historyIndex: PropTypes.number.isRequired,
  history: PropTypes.array.isRequired,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  showMobileToolbar: PropTypes.bool,
  isMobile: PropTypes.bool,
  onClose: PropTypes.func
};

export default MindMapToolbar;
