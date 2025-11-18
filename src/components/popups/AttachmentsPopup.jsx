import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Download, X } from 'lucide-react';
import NodePopup from '../mindmap/NodePopup';

export default function AttachmentsPopup({ 
  show, 
  anchorRef, 
  nodeId, 
  attachments, 
  searchFilter, 
  onSearchChange, 
  onFileSelect, 
  onDownload, 
  onRemove, 
  onClose 
}) {
  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() || 
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
  
  const popupWidth = 480;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  const filteredAttachments = (attachments || []).filter(attachment => 
    attachment.name.toLowerCase().includes((searchFilter || '').toLowerCase())
  );

  return createPortal(
    <NodePopup
      position={{ left, top }}
      width={popupWidth}
      maxWidth="500px"
      title="Attachments"
      onClose={onClose}
    >
      <div className="mb-4">
        <label htmlFor={`attachment-search-${nodeId}`} className="block text-xs font-medium text-gray-700 mb-1">
          Search by name
        </label>
        <input 
          id={`attachment-search-${nodeId}`} 
          type="text" 
          placeholder="Search by name..." 
          className="w-full p-2 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left" 
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onFocus={(e) => e.stopPropagation()} 
          onKeyDown={(e) => e.stopPropagation()} 
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor={`attachment-file-${nodeId}`} className="block text-xs font-medium text-gray-700 mb-2">
          Add new file
        </label>
        <input 
          id={`attachment-file-${nodeId}`} 
          type="file" 
          accept=".xlsx,.xls,.doc,.docx,.pdf" 
          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-300 rounded-lg p-2"
          onChange={(e) => onFileSelect(e)}
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onFocus={(e) => e.stopPropagation()} 
          onKeyDown={(e) => e.stopPropagation()} 
        />
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {filteredAttachments.length > 0 ? (
          <div className="space-y-2">
            {filteredAttachments.map(attachment => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded font-medium uppercase">
                    {attachment.type}
                  </span>
                  <span className="text-sm text-gray-900 font-medium truncate">
                    {attachment.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button 
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDownload(attachment); 
                    }}
                    title="Download file"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onRemove(attachment.id); 
                    }}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">No attachments</div>
        )}
      </div>
    </NodePopup>,
    document.body
  );
}

AttachmentsPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  nodeId: PropTypes.string.isRequired,
  attachments: PropTypes.arrayOf(PropTypes.object),
  searchFilter: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onFileSelect: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
