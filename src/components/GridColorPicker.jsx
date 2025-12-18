import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

const GridColorPicker = ({
    currentColor,
    onColorSelect,
    onClose,
    anchorRect,
    title = 'Choose Color'
}) => {
    const [selectedColor, setSelectedColor] = useState(currentColor);
    const [customColor, setCustomColor] = useState('');
    const containerRef = useRef(null);

    // Sync selectedColor when currentColor prop changes
    useEffect(() => {
        setSelectedColor(currentColor);
    }, [currentColor]);

    // Compact color palette - fewer colors, still good variety
    const colorPalette = [
        // Row 1: Grays
        ['#FFFFFF', '#F3F4F6', '#D1D5DB', '#9CA3AF', '#6B7280', '#374151', '#1F2937', '#111827'],
        // Row 2: Reds
        ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#7F1D1D'],
        // Row 3: Oranges & Yellows
        ['#FFEDD5', '#FED7AA', '#FDBA74', '#F97316', '#FEF08A', '#FACC15', '#EAB308', '#A16207'],
        // Row 4: Greens
        ['#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#14532D'],
        // Row 5: Blues & Teals
        ['#CCFBF1', '#5EEAD4', '#14B8A6', '#0D9488', '#DBEAFE', '#60A5FA', '#3B82F6', '#1E40AF'],
        // Row 6: Purples & Pinks
        ['#F3E8FF', '#D8B4FE', '#A855F7', '#7E22CE', '#FCE7F3', '#F472B6', '#EC4899', '#BE185D'],
    ];

    // Handle color selection
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        onColorSelect(color);
    };

    // Handle custom color input
    const handleCustomColorChange = (e) => {
        const value = e.target.value.toUpperCase();
        setCustomColor(value);
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            setSelectedColor(value);
        }
    };

    // Handle native color picker change
    const handleNativeColorChange = (e) => {
        const color = e.target.value.toUpperCase();
        setCustomColor(color);
        setSelectedColor(color);
        onColorSelect(color);
    };

    // Apply custom color
    const applyCustomColor = () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
            onColorSelect(customColor);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Calculate fixed position
    const fixedPos = anchorRect ? {
        position: 'fixed',
        left: Math.max(8, Math.min(anchorRect.left - 80, window.innerWidth - 260 - 8)),
        top: Math.max(8, Math.min(anchorRect.bottom + 8, window.innerHeight - 300)),
        zIndex: 5000
    } : null;

    return (
        <div
            ref={containerRef}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{
                width: '248px',
                ...fixedPos
            }}
        >
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 bg-white">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>

            {/* Color Grid */}
            <div className="p-2">
                <div className="flex flex-col gap-0.5">
                    {colorPalette.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-0.5">
                            {row.map((color) => {
                                const isSelected = selectedColor?.toUpperCase() === color.toUpperCase();
                                const isWhite = color.toUpperCase() === '#FFFFFF';

                                return (
                                    <button
                                        key={color}
                                        className={`w-7 h-7 rounded transition-all duration-100 flex items-center justify-center
                      ${isSelected
                                                ? 'ring-2 ring-offset-1 ring-blue-500 scale-105 z-10'
                                                : 'hover:scale-110 hover:shadow-sm'
                                            }
                      ${isWhite ? 'border border-gray-200' : ''}
                    `}
                                        style={{ backgroundColor: color }}
                                        onClick={() => handleColorSelect(color)}
                                        title={color}
                                    >
                                        {isSelected && (
                                            <Check
                                                size={12}
                                                className={color === '#FFFFFF' || color === '#F3F4F6' || color === '#D1D5DB' || color === '#FEE2E2' || color === '#FFEDD5' || color === '#FEF08A' || color === '#DCFCE7' || color === '#BBF7D0' || color === '#CCFBF1' || color === '#DBEAFE' || color === '#F3E8FF' || color === '#FCE7F3'
                                                    ? 'text-gray-700'
                                                    : 'text-white'
                                                }
                                                strokeWidth={3}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Color Section */}
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                    {/* Native Color Picker */}
                    <input
                        type="color"
                        value={customColor || selectedColor || '#000000'}
                        onChange={handleNativeColorChange}
                        className="w-7 h-7 rounded cursor-pointer border border-gray-300 hover:border-gray-400 transition-colors p-0"
                        title="Pick any color"
                    />

                    {/* Hex Input */}
                    <input
                        type="text"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        placeholder="#HEX"
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-gray-900 bg-white"
                        maxLength={7}
                    />

                    {/* Apply Button */}
                    <button
                        onClick={applyCustomColor}
                        disabled={!customColor || !/^#[0-9A-Fa-f]{6}$/.test(customColor)}
                        className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

GridColorPicker.propTypes = {
    currentColor: PropTypes.string,
    onColorSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    anchorRect: PropTypes.shape({
        left: PropTypes.number,
        right: PropTypes.number,
        top: PropTypes.number,
        bottom: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number
    }),
    title: PropTypes.string
};

export default GridColorPicker;
