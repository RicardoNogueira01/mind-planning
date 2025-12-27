import React, { ChangeEvent, MouseEvent, FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import NodePopup from '../mindmap/NodePopup';
import { DueDatePickerProps } from './types';

export default function DueDatePicker({
    show,
    anchorRef,
    dueDate,
    onDueDateChange,
    onClearDate,
    onClose
}: DueDatePickerProps): React.ReactElement | null {
    if (!show) return null;

    const rect = anchorRef?.current?.getBoundingClientRect() ||
        { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };

    // Use 580px for positioning (matches CSS min-width), actual width handled by CSS
    const popupWidth = 580;
    const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
    const top = Math.max(8, rect.bottom + 20);

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        onDueDateChange?.(e.target.value);
    };

    const stopPropagation = (e: MouseEvent | FocusEvent) => e.stopPropagation();

    const handleClearDate = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClearDate?.();
    };

    return createPortal(
        <NodePopup
            position={{ left, top }}
            width={popupWidth}
            title="Due Date"
            onClose={onClose}
        >
            <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation cursor-pointer"
                value={dueDate || ''}
                onChange={handleDateChange}
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
                onFocus={stopPropagation}
            />
            {dueDate && (
                <button
                    className="mt-2 text-xs text-red-600 hover:text-red-700 w-full py-1 hover:bg-red-50 rounded cursor-pointer"
                    onClick={handleClearDate}
                >
                    Clear date
                </button>
            )}
        </NodePopup>,
        document.body
    );
}
