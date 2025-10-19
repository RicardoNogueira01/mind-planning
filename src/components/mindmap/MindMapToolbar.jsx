import React from 'react';
import PropTypes from 'prop-types';
import { Plus, Trash2, MousePointer, Hand, Users, Home, Sparkles } from 'lucide-react';

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
  setFxOptions
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 bg-white/95 shadow-xl border border-gray-200/50 rounded-2xl p-3">
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

        {/* Divider */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />

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
  setFxOptions: PropTypes.func
};

export default MindMapToolbar;
