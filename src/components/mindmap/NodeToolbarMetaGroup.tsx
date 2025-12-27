import React, { RefObject, ReactNode, MouseEvent } from 'react';

interface NodeToolbarMetaGroupProps {
    detailsBtnRef?: RefObject<HTMLButtonElement>;
    onToggleDetails?: (e: MouseEvent<HTMLButtonElement>) => void;
    renderDetailsPopup?: () => ReactNode;
    dateBtnRef?: RefObject<HTMLButtonElement>;
    onToggleDate?: (e: MouseEvent<HTMLButtonElement>) => void;
    renderDatePopup?: () => ReactNode;
    collabBtnRef?: RefObject<HTMLButtonElement>;
    onToggleCollaborator?: (e: MouseEvent<HTMLButtonElement>) => void;
    renderCollaboratorPopup?: () => ReactNode;
}

/**
 * NodeToolbarMetaGroup
 * Presentational group containing: Details (priority/status/description), Due Date, and Collaborators controls.
 * Logic/state remain in the parent (MindMap). The parent passes refs, toggle handlers, and popup renderers.
 */
const NodeToolbarMetaGroup: React.FC<NodeToolbarMetaGroupProps> = ({
    detailsBtnRef,
    onToggleDetails,
    renderDetailsPopup,
    dateBtnRef,
    onToggleDate,
    renderDatePopup,
    collabBtnRef,
    onToggleCollaborator,
    renderCollaboratorPopup,
}) => {
    return (
        <div className="flex items-center gap-1">
            {/* Details */}
            <div className="relative">
                <button
                    ref={detailsBtnRef}
                    className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                    onClick={onToggleDetails}
                    title="Details (Priority/Status)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                </button>
                {renderDetailsPopup?.()}
            </div>

            {/* Due Date */}
            <div className="relative">
                <button
                    ref={dateBtnRef}
                    className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                    onClick={onToggleDate}
                    title="Set due date"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </button>
                {renderDatePopup?.()}
            </div>

            {/* Collaborator */}
            <div className="relative">
                <button
                    ref={collabBtnRef}
                    className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
                    onClick={onToggleCollaborator}
                    title="Assign collaborator"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </button>
                {renderCollaboratorPopup?.()}
            </div>
        </div>
    );
};

export default NodeToolbarMetaGroup;
