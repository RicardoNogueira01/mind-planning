import React, { ChangeEvent, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import NodePopup from '../mindmap/NodePopup';
import { CollaboratorPickerProps, Collaborator } from './types';

export default function CollaboratorPicker({
    show,
    anchorRef,
    collaborators,
    selectedCollaboratorIds = [],
    searchQuery = '',
    onSearchChange,
    onToggleCollaborator,
    onClose
}: CollaboratorPickerProps): React.ReactElement | null {
    if (!show) return null;

    const rect = anchorRef?.current?.getBoundingClientRect() ||
        { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };

    // Use 580px for positioning (matches CSS min-width), actual width handled by CSS
    const popupWidth = 580;
    const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
    const top = Math.max(8, rect.bottom + 20);

    const filteredCollaborators = collaborators.filter(collab =>
        collab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.initials.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value);

    return createPortal(
        <NodePopup
            position={{ left, top }}
            width={popupWidth}
            title="Assign Collaborators"
            onClose={onClose}
        >
            <p className="text-xs text-gray-500 mb-3">Select team members for this node</p>

            {/* Search input */}
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Search collaborators..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 placeholder-gray-500 touch-manipulation"
                    onClick={(e: MouseEvent) => e.stopPropagation()}
                />
            </div>

            {/* Collaborator list with checkboxes */}
            <div className="max-h-48 md:max-h-64 overflow-y-auto space-y-1">
                {filteredCollaborators.map((collab: Collaborator) => {
                    const isSelected = selectedCollaboratorIds.includes(collab.id);
                    return (
                        <label
                            key={collab.id}
                            className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleCollaborator(collab.id)}
                                onClick={(e: MouseEvent) => e.stopPropagation()}
                                className="w-4 h-4 text-cyan-600 rounded focus:ring-2 focus:ring-cyan-500"
                            />
                            <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: collab.color, color: 'white' }}
                            >
                                {collab.initials}
                            </span>
                            <span className="text-sm text-gray-700">{collab.name}</span>
                        </label>
                    );
                })}
                {filteredCollaborators.length === 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                        No collaborators found
                    </div>
                )}
            </div>
        </NodePopup>,
        document.body
    );
}
