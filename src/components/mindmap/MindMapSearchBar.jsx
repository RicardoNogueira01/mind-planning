import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Trash2 } from 'lucide-react';

const MindMapSearchBar = ({
  searchQuery,
  setSearchQuery,
  showSearchList,
  setShowSearchList,
  nodes,
  setSelectedNode,
  setPan,
  deleteNode
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  // Close confirm dialog if search is closed
  useEffect(() => {
    if (!isSearchOpen) setConfirm(null);
  }, [isSearchOpen]);
  const handleNodeClick = (node) => {
    setSelectedNode(node.id);
    setShowSearchList(false);
    setPan({
      x: window.innerWidth/2 - node.x,
      y: window.innerHeight/2 - node.y
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchList(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      // Quando fechar, limpar a pesquisa
      setSearchQuery('');
      setShowSearchList(false);
    }
  };

  return (
    <div className="absolute top-28 left-4 z-20">
      <div className="flex items-center">
        {/* Botão da Lupa */}
        <button
          onClick={toggleSearch}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            isSearchOpen 
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-white/95 backdrop-blur-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-xl border border-gray-200/50'
          }`}
          title="Search nodes"
        >
          <Search size={18} />
        </button>

        {/* Search Input com Animação */}
        <div className={`relative transition-all duration-300 ease-in-out overflow-hidden ${
          isSearchOpen ? 'w-80 ml-3 opacity-100' : 'w-0 ml-0 opacity-0'
        }`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search nodes..."
            className={`w-full pl-10 py-3 bg-white/95 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 text-gray-900 placeholder-gray-500 transition-all duration-200 ${
              searchQuery ? 'pr-10' : 'pr-4'
            }`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchList(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchList(true)}
          />
          {/* Clear button - only show when there's text */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-2xl transition-colors duration-200"
              title="Clear search"
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
      
      {/* Enhanced Search Results */}
      {isSearchOpen && showSearchList && searchQuery && (
        <div className="absolute left-14 right-0 mt-3 w-80 bg-white/95 backdrop-blur-lg shadow-2xl border border-gray-200/50 rounded-2xl p-3 max-h-96 overflow-y-auto">
          {/* Optional confirm overlay */}
          {confirm && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200/60 shadow-2xl p-4 z-10 flex flex-col justify-between">
              <div>
                <h4 className="text-gray-900 font-semibold text-sm mb-1">Remove this node?</h4>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to remove “<span className="font-medium text-gray-900">{confirm.text || 'Untitled'}</span>” from your mind map?
                  This will delete the node and any connections linked to it. You can undo this from the toolbar if needed.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirm?.id) {
                      deleteNode?.(confirm.id);
                    }
                    setConfirm(null);
                    // Clear search and close list after deletion
                    setSearchQuery('');
                    setShowSearchList(false);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          {nodes
            .filter(node => node.text.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(node => (
              <button
                key={node.id}
                className="w-full p-3 hover:bg-gray-50/80 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 group text-left"
                onClick={() => handleNodeClick(node)}
              >
                <div className="flex items-center gap-3">
                  {/* Enhanced node emoji/icon display */}
                  {node.emoji ? (
                    <span className="text-lg">{node.emoji}</span>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  {/* Enhanced node text */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{node.text}</span>
                    {(node.priority || node.status) && (
                      <div className="flex gap-1 mt-1">
                        {node.priority && (() => {
                          let colorClass = 'bg-green-100 text-green-600';
                          if (node.priority === 'high') colorClass = 'bg-red-100 text-red-600';
                          else if (node.priority === 'medium') colorClass = 'bg-yellow-100 text-yellow-600';
                          return (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                              {node.priority}
                            </span>
                          );
                        })()}
                        {node.status && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {node.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* Enhanced node type indicator */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    node.id === 'root' 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {node.id === 'root' ? 'Central' : 'Node'}
                  </span>
                  {/* Delete icon (hidden for root) */}
                  {node.id !== 'root' && (
                    <button
                      title="Delete node"
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setConfirm({ id: node.id, text: node.text });
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </button>
            ))}
          {nodes.filter(node => node.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
            <div className="p-3 text-gray-500 text-center">
              No nodes found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MindMapSearchBar;

MindMapSearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  showSearchList: PropTypes.bool.isRequired,
  setShowSearchList: PropTypes.func.isRequired,
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string,
    emoji: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number
  })).isRequired,
  setSelectedNode: PropTypes.func.isRequired,
  setPan: PropTypes.func.isRequired,
  deleteNode: PropTypes.func
};
