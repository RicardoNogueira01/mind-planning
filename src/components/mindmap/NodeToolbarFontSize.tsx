import React, { useRef, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Type } from 'lucide-react';

interface SizeOption {
    label: string;
    value: string;
}

const SIZES: SizeOption[] = [
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '14px' },
    { label: 'Medium', value: '16px' },
    { label: 'Large', value: '20px' },
    { label: 'Extra Large', value: '24px' },
    { label: 'Title', value: '32px' },
];

interface NodeToolbarFontSizeProps {
    isOpen: boolean;
    currentSize?: string;
    onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
    onSelect: (size: string) => void;
    onClose: () => void;
    title?: string;
}

const NodeToolbarFontSize: React.FC<NodeToolbarFontSizeProps> = ({
    isOpen,
    currentSize,
    onToggle,
    onSelect,
    onClose,
    title = 'Font Size',
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
                <Type size={18} strokeWidth={2.5} />
            </button>

            {isOpen && createPortal(
                <>
                    <div className="fixed inset-0 z-[60]" onClick={onClose} />
                    <div
                        className="fixed z-[70] bg-white rounded-xl shadow-xl border border-gray-200 p-1 w-32 flex flex-col gap-1"
                        style={{
                            top: getAnchorPosition().top,
                            left: Math.min(getAnchorPosition().left, window.innerWidth - 150),
                        }}
                    >
                        {SIZES.map((size) => (
                            <button
                                key={size.value}
                                onClick={() => onSelect(size.value)}
                                className={`text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors flex justify-between items-center ${currentSize === size.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                    }`}
                            >
                                <span>{size.label}</span>
                                <span className="text-xs text-gray-400 opacity-75">{size.value}</span>
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default NodeToolbarFontSize;
