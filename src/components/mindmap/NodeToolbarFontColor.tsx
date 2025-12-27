import React, { useRef, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import GridColorPicker from '../GridColorPicker';

interface NodeToolbarFontColorProps {
    isOpen: boolean;
    currentColor?: string;
    onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
    onSelect: (color: string) => void;
    onClose: () => void;
    title?: string;
}

const NodeToolbarFontColor: React.FC<NodeToolbarFontColorProps> = ({
    isOpen,
    currentColor,
    onToggle,
    onSelect,
    onClose,
    title = 'Font color',
}) => {
    const btnRef = useRef<HTMLButtonElement>(null);

    const getAnchorRect = (): DOMRect | { left: number; top: number; width: number; height: number; bottom: number } => {
        const anchor = btnRef.current;
        if (!anchor) {
            return { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
        }
        return anchor.getBoundingClientRect();
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onToggle(e);
                }}
                title={title}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19 L12 4 L20 19"></path>
                    <line x1="8" y1="14" x2="16" y2="14"></line>
                    <line x1="2" y1="22" x2="22" y2="22" stroke={currentColor || 'currentColor'} strokeWidth="3"></line>
                </svg>
            </button>

            {isOpen && createPortal(
                <GridColorPicker
                    currentColor={currentColor || '#111827'}
                    onColorSelect={(color: string) => onSelect(color)}
                    onClose={onClose}
                    anchorRect={getAnchorRect()}
                    title="Font Color"
                />,
                document.body
            )}
        </div>
    );
};

export default NodeToolbarFontColor;
