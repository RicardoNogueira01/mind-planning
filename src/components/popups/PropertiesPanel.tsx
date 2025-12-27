import React, { ChangeEvent, MouseEvent, FocusEvent, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import NodePopup from '../mindmap/NodePopup';
import { PropertiesPanelProps } from './types';

export default function PropertiesPanel({
    show,
    anchorRef,
    nodeId,
    priority,
    status,
    description,
    startDate,
    dueDate,
    onPriorityChange,
    onStatusChange,
    onDescriptionChange,
    onStartDateChange,
    onDueDateChange,
    onClose
}: PropertiesPanelProps): React.ReactElement | null {
    if (!show) return null;

    const rect = anchorRef?.current?.getBoundingClientRect() ||
        { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };

    // Use 580px for positioning (matches CSS min-width), actual width handled by CSS
    const popupWidth = 580;
    const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
    const top = Math.max(8, rect.bottom + 20);

    const handleStartDateChange = (value: string): void => {
        console.log('Start Date changing to:', value);
        onStartDateChange?.(value);
    };

    const handleDueDateChange = (value: string): void => {
        console.log('Due Date changing to:', value);
        onDueDateChange?.(value);
    };

    const stopPropagation = (e: MouseEvent | FocusEvent | KeyboardEvent): void => {
        e.stopPropagation();
    };

    return createPortal(
        <NodePopup
            position={{ left, top }}
            width={popupWidth}
            title="Details"
            onClose={onClose}
        >
            <div className="space-y-4">
                {/* Priority and Status in a grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor={`priority-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Priority</label>
                        <select
                            id={`priority-${nodeId}`}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                            value={priority || ''}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => onPriorityChange?.(e.target.value)}
                            onClick={stopPropagation}
                        >
                            <option value="" className="text-gray-500">Select Priority</option>
                            <option value="low">🟢 Low</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="high">🔴 High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`status-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
                        <select
                            id={`status-${nodeId}`}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                            value={status || ''}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => onStatusChange?.(e.target.value)}
                            onClick={stopPropagation}
                        >
                            <option value="" className="text-gray-500">Select Status</option>
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">✓ Completed</option>
                        </select>
                    </div>
                </div>

                {/* Start Date and Due Date in a grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor={`startDate-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Start Date</label>
                        <input
                            id={`startDate-${nodeId}`}
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                            value={startDate || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleStartDateChange(e.target.value)}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => handleStartDateChange((e.target as HTMLInputElement).value)}
                            onClick={stopPropagation}
                            onMouseDown={stopPropagation}
                            onFocus={stopPropagation}
                        />
                    </div>
                    <div>
                        <label htmlFor={`dueDate-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">End Date</label>
                        <input
                            id={`dueDate-${nodeId}`}
                            type="datetime-local"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                            value={dueDate || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleDueDateChange(e.target.value)}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => handleDueDateChange((e.target as HTMLInputElement).value)}
                            onClick={stopPropagation}
                            onMouseDown={stopPropagation}
                            onFocus={stopPropagation}
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor={`description-${nodeId}`} className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
                    <textarea
                        id={`description-${nodeId}`}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        rows={4}
                        placeholder="Add a description..."
                        value={description || ''}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onDescriptionChange?.(e.target.value)}
                        onClick={stopPropagation}
                        onMouseDown={stopPropagation}
                        onFocus={stopPropagation}
                        onKeyDown={stopPropagation}
                    />
                </div>
            </div>
        </NodePopup>,
        document.body
    );
}
