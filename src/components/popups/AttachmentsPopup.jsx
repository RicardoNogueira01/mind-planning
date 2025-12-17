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
      <div className="mb-3 md:mb-4">
        <label htmlFor={`attachment-search-${nodeId}`} className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
          Search by name
        </label>
        <input 
          id={`attachment-search-${nodeId}`} 
          type="text" 
          placeholder="Search by name..." 
          className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left touch-manipulation" 
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()} 
          onFocus={(e) => e.stopPropagation()} 
          onKeyDown={(e) => e.stopPropagation()} 
        />
      </div>
      
      <div className="mb-3 md:mb-4">
        <label htmlFor={`attachment-file-${nodeId}`} className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
          Add new file
        </label>
        <div className="relative">
          <input 
            id={`attachment-file-${nodeId}`} 
            type="file" 
            accept=".xlsx,.xls,.doc,.docx,.pdf" 
            className="hidden"
            onChange={(e) => onFileSelect(e)}
            onClick={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()} 
            onFocus={(e) => e.stopPropagation()} 
            onKeyDown={(e) => e.stopPropagation()} 
          />
          <label 
            htmlFor={`attachment-file-${nodeId}`}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-800 transition-colors border border-gray-300"
          >
            <span>Browse...</span>
          </label>
          <p className="mt-2 text-xs text-gray-500">No file selected.</p>
        </div>
      </div>
      
      <div className="max-h-48 md:max-h-64 overflow-y-auto">
        {filteredAttachments.length > 0 ? (
          <div className="space-y-2">
            {filteredAttachments.map(attachment => (
              <div key={attachment.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors touch-manipulation">
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
