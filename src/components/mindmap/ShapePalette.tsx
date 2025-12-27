import React, { DragEvent, ReactNode } from 'react';

interface ShapeDefinition {
    type: string;
    name: string;
    color: string;
    icon?: ReactNode;
}

interface ShapePaletteProps {
    shapeDefinitions: ShapeDefinition[];
    onShapeDragStart?: (e: DragEvent<HTMLButtonElement>, shapeType: string) => void;
}

/**
 * ShapePalette: renders the right-hand shape palette sidebar with draggable shape tiles
 */
const ShapePalette: React.FC<ShapePaletteProps> = ({ shapeDefinitions, onShapeDragStart }) => {
    return (
        <div className="w-20 bg-white shadow-lg border-l border-gray-200 flex flex-col items-center py-4 gap-3">
            {shapeDefinitions.map((shapeDef) => (
                <button
                    key={shapeDef.type}
                    type="button"
                    className="w-14 h-14 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center justify-center"
                    style={{
                        backgroundColor: shapeDef.color,
                        borderColor: '#e5e7eb',
                    }}
                    draggable={true}
                    aria-label={`Drag ${shapeDef.name}`}
                    onDragStart={(e: DragEvent<HTMLButtonElement>) => {
                        e.dataTransfer.effectAllowed = 'copy';
                        e.dataTransfer.setData('application/x-shape-type', shapeDef.type);
                        onShapeDragStart?.(e, shapeDef.type);
                    }}
                    title={shapeDef.name}
                >
                    <span className="text-white text-xl font-bold select-none">{shapeDef.icon}</span>
                </button>
            ))}
        </div>
    );
};

export default ShapePalette;
