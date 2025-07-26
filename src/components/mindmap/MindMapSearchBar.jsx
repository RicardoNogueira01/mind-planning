import React from 'react';

const MindMapSearchBar = ({
  searchQuery,
  setSearchQuery,
  showSearchList,
  setShowSearchList,
  nodes,
  setSelectedNode,
  setPan
}) => {
  const handleNodeClick = (node) => {
    setSelectedNode(node.id);
    setShowSearchList(false);
    setPan({
      x: window.innerWidth/2 - node.x,
      y: window.innerHeight/2 - node.y
    });
  };

  return (
    <div className="absolute top-20 left-4 z-20 w-80">
      {/* Search input with improved styling */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search nodes..."
          className="w-full pl-10 pr-4 py-3 bg-white/95 backdrop-blur-lg shadow-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 text-gray-900 placeholder-gray-500 transition-all duration-200"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchList(e.target.value.length > 0);
          }}
          onFocus={() => setShowSearchList(true)}
        />
      </div>
      
      {/* Enhanced Search Results */}
      {showSearchList && searchQuery && (
        <div className="absolute left-0 right-0 mt-3 bg-white/95 backdrop-blur-lg shadow-2xl border border-gray-200/50 rounded-2xl p-3 max-h-96 overflow-y-auto">
          {nodes
            .filter(node => node.text.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(node => (
              <div 
                key={node.id}
                className="p-3 hover:bg-gray-50/80 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 group"
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
                        {node.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            node.priority === 'high' ? 'bg-red-100 text-red-600' :
                            node.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {node.priority}
                          </span>
                        )}
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
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MindMapSearchBar;
