/* Nova estrutura da toolbar radial com roda de settings */

{/* Background Color - Top Right */}
<div className={`absolute transition-all duration-500 delay-100 ${
  isToolbarExpanded 
    ? 'transform -translate-y-12 translate-x-12' 
    : 'transform -translate-y-0 translate-x-0'
}`} style={{ left: '50%', top: '0' }}>
  <div className="relative">
    <button
      className="node-toolbar-btn p-2.5 rounded-full bg-white/95 backdrop-blur-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
      onClick={(e) => {
        e.stopPropagation();
        wrappedSetNodes(nodes.map(n => 
          n.id === node.id ? { ...n, showBgColorPopup: !n.showBgColorPopup, showEmojiPopup: false, showFontColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
        ));
      }}
      title="Background color"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <path d="M3 9h18"></path>
      </svg>
    </button>
    {node.showBgColorPopup && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
        <RoundColorPicker
          currentColor={node.color || '#FFFFFF'}
          onColorSelect={(color) => {
            wrappedSetNodes(nodes.map(n => 
              n.id === node.id ? { ...n, color, showBgColorPopup: false } : n
            ));
          }}
          onClose={() => {
            wrappedSetNodes(nodes.map(n => 
              n.id === node.id ? { ...n, showBgColorPopup: false } : n
            ));
          }}
        />
      </div>
    )}
  </div>
</div>

{/* Font Color - Right */}
<div className={`absolute transition-all duration-500 delay-125 ${
  isToolbarExpanded 
    ? 'transform translate-x-16' 
    : 'transform translate-x-0'
}`} style={{ left: '50%', top: '50%', transform: isToolbarExpanded ? 'translate-x-16 -translate-y-1/2' : 'translate-x-0 -translate-y-1/2' }}>
  <div className="relative">
    <button
      className="node-toolbar-btn p-2.5 rounded-full bg-white/95 backdrop-blur-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
      onClick={(e) => {
        e.stopPropagation();
        wrappedSetNodes(nodes.map(n => 
          n.id === node.id ? { ...n, showFontColorPopup: !n.showFontColorPopup, showEmojiPopup: false, showBgColorPopup: false, showAttachmentPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
        ));
      }}
      title="Font color"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16"></path>
        <path d="M9 4h6l-3 9z"></path>
      </svg>
    </button>
    {node.showFontColorPopup && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
        <RoundColorPicker
          currentColor={node.fontColor || '#000000'}
          onColorSelect={(color) => {
            wrappedSetNodes(nodes.map(n => 
              n.id === node.id ? { ...n, fontColor: color, showFontColorPopup: false } : n
            ));
          }}
          onClose={() => {
            wrappedSetNodes(nodes.map(n => 
              n.id === node.id ? { ...n, showFontColorPopup: false } : n
            ));
          }}
        />
      </div>
    )}
  </div>
</div>

{/* Attachment - Bottom Right */}
<div className={`absolute transition-all duration-500 delay-150 ${
  isToolbarExpanded 
    ? 'transform translate-y-12 translate-x-12' 
    : 'transform translate-y-0 translate-x-0'
}`} style={{ left: '50%', top: '50%', transform: isToolbarExpanded ? 'translate-y-12 translate-x-12 -translate-x-1/2' : 'translate-y-0 translate-x-0 -translate-x-1/2' }}>
  <div className="relative">
    <button
      className="node-toolbar-btn p-2.5 rounded-full bg-white/95 backdrop-blur-lg text-gray-700 hover:bg-green-50 hover:text-green-600 shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
      onClick={(e) => {
        e.stopPropagation();
        wrappedSetNodes(nodes.map(n => 
          n.id === node.id ? { ...n, showAttachmentPopup: !n.showAttachmentPopup, showEmojiPopup: false, showBgColorPopup: false, showFontColorPopup: false, showNotesPopup: false, showDetailsPopup: false, showDatePopup: false, showCollaboratorPopup: false, showTagsPopup: false } : n
        ));
      }}
      title="Add attachment"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
      </svg>
    </button>
    {/* Attachment popup content would go here */}
  </div>
</div>

{/* Delete Node - Bottom */}
{node.id !== 'root' && (
  <div className={`absolute transition-all duration-500 delay-175 ${
    isToolbarExpanded 
      ? 'transform translate-y-16' 
      : 'transform translate-y-0'
  }`} style={{ left: '50%', top: '50%', transform: isToolbarExpanded ? 'translate-y-16 -translate-x-1/2' : 'translate-y-0 -translate-x-1/2' }}>
    <button
      className="node-toolbar-btn p-2.5 rounded-full bg-white/95 backdrop-blur-lg text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
      onClick={(e) => {
        e.stopPropagation();
        deleteNode(node.id);
      }}
      title="Delete this node"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-2 14H7L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
      </svg>
    </button>
  </div>
)}

{/* Add Child Node - Bottom Left */}
<div className={`absolute transition-all duration-500 delay-200 ${
  isToolbarExpanded 
    ? 'transform translate-y-12 -translate-x-12' 
    : 'transform translate-y-0 -translate-x-0'
}`} style={{ left: '50%', top: '50%', transform: isToolbarExpanded ? 'translate-y-12 -translate-x-12 -translate-x-1/2' : 'translate-y-0 -translate-x-0 -translate-x-1/2' }}>
  <button
    className="node-toolbar-btn p-2.5 rounded-full bg-white/95 backdrop-blur-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
    onClick={(e) => {
      e.stopPropagation();
      addChildNode(node.id);
    }}
    title="Add child node"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  </button>
</div>

{/* Link Connection - Left */}
<div className={`absolute transition-all duration-500 delay-225 ${
  isToolbarExpanded 
    ? 'transform -translate-x-16' 
    : 'transform -translate-x-0'
}`} style={{ left: '50%', top: '50%', transform: isToolbarExpanded ? '-translate-x-16 -translate-y-1/2' : '-translate-x-0 -translate-y-1/2' }}>
  <button
    className="node-toolbar-btn p-2.5 rounded-full bg-white/95 backdrop-blur-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-lg border border-white/50 transition-all duration-200 hover:scale-110"
    onClick={(e) => {
      e.stopPropagation();
      setMode('link');
      setSelectedNode(node.id);
    }}
    title="Link to another node"
  >
    <Link size={16} />
  </button>
</div>
