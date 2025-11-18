import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Trash2, MousePointer, Hand, Users, Home, Sparkles, X } from 'lucide-react';

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
  onClose
}) => {
  return (
    <div 
      className={`${
        isMobile 
          ? `fixed left-0 top-0 h-full z-20 bg-white/95 shadow-xl border-r border-gray-200/50 w-20 p-3 transition-transform duration-300 ease-in-out ${
              showMobileToolbar ? 'translate-x-0' : 'translate-x-[-100%]'
            }` 
          : 'absolute top-2 md:top-4 left-2 md:left-4 z-20 bg-white/95 shadow-xl border border-gray-200/50 rounded-xl md:rounded-2xl p-1.5 md:p-3'
      }`}
    >
      <div className={`flex ${isMobile ? 'flex-col h-full' : 'items-center'} gap-0.5 md:gap-1`}>
        
        {/* Close Button - Mobile Only */}
        {isMobile && (
          <div className="flex justify-center mb-2">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 touch-manipulation"
              title="Close Menu"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Back to Dashboard Button */}
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 md:py-1 rounded-lg bg-gray-50/50`}>
          <button 
            onClick={onBack}
            className={`${isMobile ? 'w-full' : ''} p-1.5 md:p-2.5 rounded-lg text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-200 group border border-gray-200/60 hover:border-gray-300 touch-manipulation`}
            title="Back to Dashboard"
          >
            <Home size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform duration-200 mx-auto" />
          </button>
        </div>

        {/* Divider */}
        <div className={`${isMobile ? 'h-px w-full' : 'w-px h-6 md:h-8'} bg-gradient-to-b from-transparent via-gray-300 to-transparent ${isMobile ? 'my-1' : 'mx-1 md:mx-2'}`} />
        
        {/* Selection Tools Group */}
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 md:py-1 rounded-lg bg-gray-50/50`}>
          <button 
            onClick={() => {
              setMode('cursor');
              setSelectionType('simple');
            }}
            className={`${isMobile ? 'w-full' : ''} p-1.5 md:p-2.5 rounded-lg transition-all duration-200 group border touch-manipulation ${
              mode === 'cursor' && selectionType === 'simple' 
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 border-blue-600' 
                : 'text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Selection Mode"
          >
            <MousePointer size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform duration-200 mx-auto" />
          </button>
          
          <button 
            onClick={() => {
              setMode('cursor');
              setSelectionType('collaborator');
            }}
            className={`${isMobile ? 'w-full' : ''} p-1.5 md:p-2.5 rounded-lg transition-all duration-200 group border touch-manipulation ${
              mode === 'cursor' && selectionType === 'collaborator' 
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20 border-purple-600' 
                : 'text-gray-700 hover:bg-white hover:text-purple-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Collaborator Mode"
          >
            <Users size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform duration-200 mx-auto" />
          </button>
          
          <button 
            onClick={() => setMode('pan')}
            className={`${isMobile ? 'w-full' : ''} p-1.5 md:p-2.5 rounded-lg transition-all duration-200 group border touch-manipulation ${
              mode === 'pan' 
                ? 'bg-green-500 text-white shadow-md shadow-green-500/20 border-green-600' 
                : 'text-gray-700 hover:bg-white hover:text-green-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Pan Mode"
          >
            <Hand size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform duration-200 mx-auto" />
          </button>
        </div>

        {/* Divider */}
        <div className={`${isMobile ? 'h-px w-full' : 'w-px h-6 md:h-8'} bg-gradient-to-b from-transparent via-gray-300 to-transparent ${isMobile ? 'my-1' : 'mx-1 md:mx-2'}`} />
        
        {/* Content Creation Group */}
        <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-0.5 md:gap-1 px-1 md:px-2 py-0.5 md:py-1 rounded-lg bg-gray-50/50`}>
          <button 
            onClick={addStandaloneNode} 
            className={`${isMobile ? 'w-full' : ''} p-1.5 md:p-2.5 rounded-lg text-gray-700 hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all duration-200 group border border-gray-200/60 hover:border-gray-300 touch-manipulation`}
            title="Add New Node"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform duration-200 mx-auto" />
          </button>
          
          <button 
            onClick={() => selectedNodes.length > 0 && deleteNodes(selectedNodes)}
            title="Delete Selected"
            className={`${isMobile ? 'w-full' : ''} p-1.5 md:p-2.5 rounded-lg transition-all duration-200 group border touch-manipulation ${
              selectedNodes.length > 0 
                ? 'text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300' 
                : 'text-gray-400 cursor-not-allowed border-gray-100'
            }`}
            disabled={selectedNodes.length === 0}
          >
            <Trash2 size={16} className={`md:w-[18px] md:h-[18px] ${selectedNodes.length > 0 ? 'group-hover:scale-110 transition-transform duration-200' : ''} mx-auto`} />
          </button>
        </div>

        {/* Divider - Desktop Only */}
        {!isMobile && <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />}
        {isMobile && <div className="h-px w-full bg-gradient-to-b from-transparent via-gray-300 to-transparent my-1" />}

        {/* History Controls Group */}
        <div className={`${isMobile ? 'flex flex-col w-full' : 'hidden md:flex items-center'} gap-1 px-2 py-1 rounded-lg bg-gray-50/50`}>
          <button 
            onClick={undo}
            className={`${isMobile ? 'w-full p-1.5' : 'p-2.5'} rounded-lg transition-all duration-200 group border ${
              historyIndex <= 0 
                ? 'text-gray-400 cursor-not-allowed border-gray-100' 
                : 'text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Undo"
            disabled={historyIndex <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}} className={`md:w-[18px] md:h-[18px] ${historyIndex > 0 ? 'group-hover:scale-110 transition-transform duration-200' : ''} ${isMobile ? 'mx-auto' : ''}`}>
              <path d="M9 17L4 12l5-5" />
              <path d="M20 18v-1a4 4 0 0 0-4-4H4" />
            </svg>
          </button>
          
          <button 
            onClick={redo}
            className={`${isMobile ? 'w-full p-1.5' : 'p-2.5'} rounded-lg transition-all duration-200 group border ${
              historyIndex >= history.length - 1 
                ? 'text-gray-400 cursor-not-allowed border-gray-100' 
                : 'text-gray-700 hover:bg-white hover:text-blue-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
            }`}
            title="Redo"
            disabled={historyIndex >= history.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}} className={`md:w-[18px] md:h-[18px] ${historyIndex < history.length - 1 ? 'group-hover:scale-110 transition-transform duration-200' : ''} ${isMobile ? 'mx-auto' : ''}`}>
              <path d="M15 7l5 5-5 5" />
              <path d="M4 6v1a4 4 0 0 0 4 4h12" />
            </svg>
          </button>
        </div>

        {/* Divider - Desktop Only */}
        {!isMobile && <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />}
        {isMobile && <div className="h-px w-full bg-gradient-to-b from-transparent via-gray-300 to-transparent my-1" />}

        {/* Fun FX Options */}
        <div className="relative">
          <details className="group">
            <summary className="list-none">
              <button
                aria-pressed={!!fxOptions?.enabled}
                className={`p-2.5 rounded-lg transition-all duration-200 group border flex items-center gap-1 relative ${
                  fxOptions?.enabled
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20 border-pink-600 hover:shadow-lg'
                    : 'text-gray-700 hover:bg-white hover:text-pink-600 hover:shadow-sm border-gray-200/60 hover:border-gray-300'
                }`}
                title={`Visual FX Options${fxOptions?.enabled ? ' (On)' : ' (Off)'}`}
              >
                <Sparkles size={18} className={`${fxOptions?.enabled ? 'text-white' : 'text-pink-500'} group-hover:scale-110 transition-transform duration-200`} />
                <span className="text-xs font-medium">FX</span>
                <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${fxOptions?.enabled ? 'bg-emerald-400 ring-2 ring-white' : 'bg-gray-300'}`} />
              </button>
            </summary>
            <div className="absolute mt-2 left-0 bg-white/95 shadow-xl border border-gray-200/60 rounded-xl p-3 w-60 z-50">
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
