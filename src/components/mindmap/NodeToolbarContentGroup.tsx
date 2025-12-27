import React, { RefObject, ReactNode, MouseEvent } from 'react';

interface Node {
    id: string;
    [key: string]: unknown;
}

interface NodeToolbarContentGroupProps {
    node: Node;
    isDarkMode?: boolean;
    attachBtnRef?: RefObject<HTMLButtonElement>;
    onToggleAttachment?: (e: MouseEvent<HTMLButtonElement>) => void;
    renderAttachmentPopup?: () => ReactNode;
    notesBtnRef?: RefObject<HTMLButtonElement>;
    onToggleNotes?: (e: MouseEvent<HTMLButtonElement>) => void;
    renderNotesPopup?: () => ReactNode;
    tagsBtnRef?: RefObject<HTMLButtonElement>;
    onToggleTags?: (e: MouseEvent<HTMLButtonElement>) => void;
    renderTagsPopup?: () => ReactNode;
}

/**
 * A thin wrapper around the attachments, notes, and tags controls used in the node toolbar.
 * It expects callers to pass refs, state, and handlers from MindMap to avoid duplicating logic.
 */
const NodeToolbarContentGroup: React.FC<NodeToolbarContentGroupProps> = ({
    node,
    isDarkMode,
    attachBtnRef,
    onToggleAttachment,
    renderAttachmentPopup,
    notesBtnRef,
    onToggleNotes,
    renderNotesPopup,
    tagsBtnRef,
    onToggleTags,
    renderTagsPopup,
}) => {
    return (
        <div className="flex items-center gap-1">
            {/* Attachment */}
            <div className="relative">
                <button
                    ref={attachBtnRef}
                    className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                    onClick={onToggleAttachment}
                    title="Add attachment"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>
                {renderAttachmentPopup?.()}
            </div>

            {/* Notes */}
            <div className="relative">
                <button
                    ref={notesBtnRef}
                    className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                    onClick={onToggleNotes}
                    title="Add notes"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                </button>
                {renderNotesPopup?.()}
            </div>

            {/* Tags */}
            <div className="relative">
                <button
                    ref={tagsBtnRef}
                    className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                    onClick={onToggleTags}
                    title="Manage tags"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                </button>
                {renderTagsPopup?.()}
            </div>
        </div>
    );
};

export default NodeToolbarContentGroup;
