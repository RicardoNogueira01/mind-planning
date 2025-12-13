import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Trash2, MousePointer, Hand, Users, Home, Sparkles, X, Camera, SquareDashedMousePointer } from 'lucide-react';

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
  fxOptions,
  setFxOptions,
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

        {/* Divider */}
        <div className={`${isMobile ? 'h-px w-full my-2' : 'w-px h-6 mx-1'} bg-gray-200`} />
        
        {/* Content Creation Group */}
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-0.5`}>
          <button 
            onClick={addStandaloneNode} 
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200`}
            title="Add New Node"
          >
            <Plus size={18} strokeWidth={2} className="mx-auto" />
          </button>
          
          <button 
            onClick={() => selectedNodes.length > 0 && deleteNodes(selectedNodes)}
            title="Delete Selected"
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg transition-all duration-200 ${
              selectedNodes.length > 0 
                ? 'text-gray-700 hover:bg-red-50 hover:text-red-600' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={selectedNodes.length === 0}
          >
            <Trash2 size={18} strokeWidth={2} className="mx-auto" />
          </button>
        </div>

        {/* Divider */}
        <div className={`${isMobile ? 'h-px w-full my-2' : 'w-px h-6 mx-1'} bg-gray-200`} />

        {/* History Controls Group */}
        <div className={`${isMobile ? 'flex flex-col w-full' : 'flex items-center'} gap-0.5`}>
          <button 
            onClick={undo}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg transition-all duration-200 ${
              historyIndex <= 0 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
            title="Undo"
            disabled={historyIndex <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isMobile ? 'mx-auto' : ''}`}>
              <path d="M9 17L4 12l5-5" />
              <path d="M20 18v-1a4 4 0 0 0-4-4H4" />
            </svg>
          </button>
          
          <button 
            onClick={redo}
            className={`${isMobile ? 'w-full' : ''} p-2 rounded-lg transition-all duration-200 ${
              historyIndex >= history.length - 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
            title="Redo"
            disabled={historyIndex >= history.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isMobile ? 'mx-auto' : ''}`}>
              <path d="M15 7l5 5-5 5" />
              <path d="M4 6v1a4 4 0 0 0 4 4h12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className={`${isMobile ? 'h-px w-full my-2' : 'w-px h-6 mx-1'} bg-gray-200`} />

        {/* Fun FX Options */}
        <div className="relative">
          <details className="group">
            <summary className="list-none">
              <button
                aria-pressed={!!fxOptions?.enabled}
                className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  fxOptions?.enabled
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                }`}
                title={`Visual FX Options${fxOptions?.enabled ? ' (On)' : ' (Off)'}`}
              >
                <Sparkles size={18} strokeWidth={2} className={fxOptions?.enabled ? 'text-white' : 'text-pink-500'} />
                <span className="text-[10px] font-semibold tracking-wide">FX</span>
                {fxOptions?.enabled && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
                )}
              </button>
            </summary>
            <div className="absolute mt-2 left-0 bg-white shadow-xl border border-gray-100 rounded-xl p-3 w-56 z-50">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">Enable fun mode</span>
                <input
                  type="checkbox"
                  checked={!!fxOptions?.enabled}
                  onChange={(e) => setFxOptions({ ...fxOptions, enabled: e.target.checked })}
                />
              </div>
              <div className="flex items-center justify-between py-1 opacity-100">
                <span className="text-sm text-gray-700">Selection ripple</span>
                <input
                  type="checkbox"
                  checked={!!fxOptions?.ripple}
                  onChange={(e) => setFxOptions({ ...fxOptions, ripple: e.target.checked })}
                  disabled={!fxOptions?.enabled}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">Tag shimmer</span>
                <input
                  type="checkbox"
                  checked={!!fxOptions?.tagShimmer}
                  onChange={(e) => setFxOptions({ ...fxOptions, tagShimmer: e.target.checked })}
                  disabled={!fxOptions?.enabled}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">Springy motion</span>
                <input
                  type="checkbox"
                  checked={!!fxOptions?.springy}
                  onChange={(e) => setFxOptions({ ...fxOptions, springy: e.target.checked })}
                  disabled={!fxOptions?.enabled}
                />
              </div>
              <div className="h-px bg-gray-200 my-2" />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">Gradient border</span>
                <input
                  type="checkbox"
                  checked={!!fxOptions?.gradientRing}
                  onChange={(e) => setFxOptions({ ...fxOptions, gradientRing: e.target.checked })}
                  disabled={!fxOptions?.enabled}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">Progress ring</span>
                <input
                  type="checkbox"
                  checked={!!fxOptions?.progressRing}
                  onChange={(e) => setFxOptions({ ...fxOptions, progressRing: e.target.checked })}
                  disabled={!fxOptions?.enabled}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">Focus mode</span>
                <input
                  type="checkbox"
                  checked={!!fxOptions?.focusMode}
                  onChange={(e) => setFxOptions({ ...fxOptions, focusMode: e.target.checked })}
                  disabled={!fxOptions?.enabled}
                />
              </div>
            </div>
          </details>
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
  fxOptions: PropTypes.object,
  setFxOptions: PropTypes.func,
  showMobileToolbar: PropTypes.bool,
  isMobile: PropTypes.bool,
  onClose: PropTypes.func
};

export default MindMapToolbar;
