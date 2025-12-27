import React, { useRef, MouseEvent } from 'react';
import { createPortal } from 'react-dom';

interface FontOption {
    name: string;
    value: string;
}

const FONTS: FontOption[] = [
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Lora', value: "'Lora', serif" },
    { name: 'Monospace', value: "'Fira Code', monospace" },
    { name: 'Comic Sans', value: "'Comic Sans MS', cursive" },
];

interface NodeToolbarFontFamilyProps {
    isOpen: boolean;
    currentFont?: string;
    onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
    onSelect: (font: string) => void;
    onClose: () => void;
    title?: string;
}

const NodeToolbarFontFamily: React.FC<NodeToolbarFontFamilyProps> = ({
    isOpen,
    currentFont,
    onToggle,
    onSelect,
    onClose,
    title = 'Font Family',
}) => {
    const btnRef = useRef<HTMLButtonElement>(null);

    const getAnchorPosition = (): { top: number; left: number } => {
        const anchor = btnRef.current;
        if (!anchor) return { top: 0, left: 0 };
        const rect = anchor.getBoundingClientRect();
        return { top: rect.bottom + 8, left: rect.left };
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
                    <polyline points="4 7 4 4 20 4 20 7"></polyline>
                    <line x1="9" y1="20" x2="15" y2="20"></line>
                    <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
            </button>

            {isOpen && createPortal(
                <>
                    <div className="fixed inset-0 z-[60]" onClick={onClose} />
                    <div
                        className="fixed z-[70] bg-white rounded-xl shadow-xl border border-gray-200 p-1 w-48 flex flex-col gap-1"
                        style={{
                            top: getAnchorPosition().top,
                            left: Math.min(getAnchorPosition().left, window.innerWidth - 200),
                        }}
                    >
                        {FONTS.map((font) => (
                            <button
                                key={font.name}
                                onClick={() => onSelect(font.value)}
                                className={`text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors ${(currentFont || '').includes(font.name) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                    }`}
                                style={{ fontFamily: font.value }}
                            >
                                {font.name}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default NodeToolbarFontFamily;
