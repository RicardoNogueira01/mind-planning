import React, { useRef, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import GridColorPicker from '../GridColorPicker';

interface NodeToolbarBackgroundColorProps {
    isOpen: boolean;
    currentColor?: string;
    onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
    onSelect: (color: string) => void;
    onClose: () => void;
    title?: string;
}

const NodeToolbarBackgroundColor: React.FC<NodeToolbarBackgroundColorProps> = ({
    isOpen,
    currentColor,
    onToggle,
    onSelect,
    onClose,
    title = 'Background color',
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
                    <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"></path>
                    <path d="m5 2 5 5"></path>
                    <path d="M2 13h15"></path>
                    <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"></path>
                </svg>
            </button>

            {isOpen && createPortal(
                <GridColorPicker
                    currentColor={currentColor || '#FFFFFF'}
                    onColorSelect={(color: string) => onSelect(color)}
                    onClose={onClose}
                    anchorRect={getAnchorRect()}
                    title="Background Color"
                />,
                document.body
            )}
        </div>
    );
};

export default NodeToolbarBackgroundColor;
