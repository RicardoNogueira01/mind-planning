import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const SIZES = [
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '14px' },
    { label: 'Medium', value: '16px' },
    { label: 'Large', value: '20px' },
    { label: 'Extra Large', value: '24px' },
    { label: 'Title', value: '32px' },
];

const NodeToolbarFontSize = ({
    isOpen,
    currentSize,
    onToggle,
    onSelect,
    onClose,
    title = 'Font Size',
}) => {
    const btnRef = useRef(null);

    const getAnchorPosition = () => {
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
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(e);
                }}
                title={title}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8"></path>
                    <path d="M4 12h16"></path>
                    <path d="M20 12v8"></path>
                    <path d="M12 4v16"></path>
                </svg>
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

NodeToolbarFontSize.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    currentSize: PropTypes.string,
    onToggle: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string,
};

export default NodeToolbarFontSize;
