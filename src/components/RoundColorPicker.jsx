import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

const RoundColorPicker = ({ 
  currentColor, 
  onColorSelect, 
  onClose, 
  position = 'bottom-left' 
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [customColor, setCustomColor] = useState('');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Color wheel data - arranged in a circular pattern
  const colorRings = [
    // Inner ring - basic colors
    [
      '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', 
      '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529', '#000000'
    ],
    // Second ring - vibrant colors
    [
      '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#ADFF2F', '#00FF00',
      '#00FFFF', '#0000FF', '#8A2BE2', '#FF1493', '#FF69B4', '#FFB6C1'
    ],
    // Third ring - medium tones
    [
      '#DC143C', '#FF6347', '#FF8C00', '#DAA520', '#9ACD32', '#32CD32',
      '#20B2AA', '#4169E1', '#9370DB', '#C71585', '#DB7093', '#F0E68C'
    ],
    // Fourth ring - deep tones
    [
      '#8B0000', '#B22222', '#CD853F', '#B8860B', '#556B2F', '#006400',
      '#008B8B', '#191970', '#4B0082', '#8B008B', '#A0522D', '#2F4F4F'
    ],
    // Outer ring - pastel tones
    [
      '#FFE4E1', '#FFEFD5', '#FFFFE0', '#F0FFF0', '#F0FFFF', '#E6E6FA',
      '#FFF0F5', '#FFFACD', '#E0FFFF', '#F5FFFA', '#FDF5E6', '#FAF0E6'
    ]
  ];

  // Calculate position for each color in the ring
  const getColorPosition = (ringIndex, colorIndex, totalColors) => {
    const radius = 30 + (ringIndex * 20); // Ring radius
    const angle = (colorIndex * 360) / totalColors;
    const radian = (angle * Math.PI) / 180;
    const x = 120 + radius * Math.cos(radian);
    const y = 120 + radius * Math.sin(radian);
    return { x, y, angle };
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  // Handle custom color
  const handleCustomColorApply = () => {
    if (customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      handleColorSelect(customColor);
      setCustomColor('');
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

  return (
    <div 
      ref={containerRef}
      className="absolute z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6"
      style={{
        width: '280px',
        height: '320px',
        ...(position === 'bottom-left' && { top: '100%', left: '0', marginTop: '8px' }),
        ...(position === 'bottom-right' && { top: '100%', right: '0', marginTop: '8px' }),
        ...(position === 'top-left' && { bottom: '100%', left: '0', marginBottom: '8px' }),
        ...(position === 'top-right' && { bottom: '100%', right: '0', marginBottom: '8px' }),
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Choose Color</h3>
        <p className="text-sm text-gray-500">Select from the color wheel</p>
      </div>

      {/* Color Wheel */}
      <div className="relative mx-auto" style={{ width: '240px', height: '240px' }}>
        {/* Center circle - current color */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
          style={{ backgroundColor: selectedColor }}
        >
          {selectedColor && (
            <Check size={20} className="text-white drop-shadow" />
          )}
        </div>

        {/* Color rings */}
        {colorRings.map((ring, ringIndex) => (
          <div key={ringIndex} className="absolute inset-0">
            {ring.map((color, colorIndex) => {
              const position = getColorPosition(ringIndex, colorIndex, ring.length);
              const isSelected = selectedColor === color;
              
              return (
                <button
                  key={color}
                  className={`absolute w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-125 hover:shadow-lg ${
                    isSelected 
                      ? 'border-gray-800 shadow-lg scale-110 ring-2 ring-blue-500 ring-offset-2' 
                      : 'border-white hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: color,
                    left: `${position.x - 12}px`,
                    top: `${position.y - 12}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Custom color input */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={customColor || selectedColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
            title="Pick custom color"
          />
          <input
            type="text"
            value={customColor || ''}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
          <button
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!customColor || !/^#[0-9A-Fa-f]{6}$/.test(customColor)}
            onClick={handleCustomColorApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundColorPicker;
