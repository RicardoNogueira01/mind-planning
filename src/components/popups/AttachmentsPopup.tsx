import React, { ChangeEvent, MouseEvent, FocusEvent, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';
import NodePopup from '../mindmap/NodePopup';
import { AttachmentsPopupProps, Attachment } from './types';

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
}: AttachmentsPopupProps): React.ReactElement | null {
    if (!show) return null;

    const rect = anchorRef?.current?.getBoundingClientRect() ||
        { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };

    // Use 580px for positioning (matches CSS min-width), actual width handled by CSS
    const popupWidth = 580;
    const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
    const top = Math.max(8, rect.bottom + 20);

    const filteredAttachments = (attachments || []).filter(attachment =>
        attachment.name.toLowerCase().includes((searchFilter || '').toLowerCase())
    );

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value);
    const stopPropagation = (e: MouseEvent | FocusEvent | KeyboardEvent) => e.stopPropagation();

    return createPortal(
        <NodePopup
            position={{ left, top }}
            width={popupWidth}
            maxWidth="320px"
            title="Attachments"
            onClose={onClose}
        >
            <div className="mb-2">
                <label htmlFor={`attachment-search-${nodeId}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Search by name
                </label>
                <input
                    id={`attachment-search-${nodeId}`}
                    type="text"
                    placeholder="Search by name..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchFilter}
                    onChange={handleSearchChange}
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                    onFocus={stopPropagation}
                    onKeyDown={stopPropagation}
                />
            </div>

            <div className="mb-2">
                <label htmlFor={`attachment-file-${nodeId}`} className="block text-xs font-medium text-gray-700 mb-1">
                    Add new file
                </label>
                <div className="relative">
                    <input
                        id={`attachment-file-${nodeId}`}
                        type="file"
                        accept=".xlsx,.xls,.doc,.docx,.pdf"
                        className="hidden"
                        onChange={onFileSelect}
                        onClick={stopPropagation}
                        onMouseDown={stopPropagation}
                        onFocus={stopPropagation}
                        onKeyDown={stopPropagation}
                    />
                    <label
                        htmlFor={`attachment-file-${nodeId}`}
                        className="flex items-center justify-center w-full px-2 py-1.5 bg-black text-white text-xs font-medium rounded cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                        <span>Browse...</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">No file selected.</p>
                </div>
            </div>

            <div className="max-h-40 overflow-y-auto">
                {filteredAttachments.length > 0 ? (
                    <div className="space-y-1">
                        {filteredAttachments.map((attachment: Attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <span className="text-[10px] text-white bg-blue-500 px-1.5 py-0.5 rounded font-medium uppercase">
                                        {attachment.type}
                                    </span>
                                    <span className="text-xs text-gray-900 font-medium truncate">
                                        {attachment.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-0.5 ml-1">
                                    <button
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDownload(attachment);
                                        }}
                                        title="Download file"
                                    >
                                        <Download size={14} />
                                    </button>
                                    <button
                                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(attachment.id);
                                        }}
                                        title="Remove file"
                                    >
                                        <X size={14} />
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
