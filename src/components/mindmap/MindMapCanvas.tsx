import React, { ReactNode } from 'react';

interface Pan {
    x: number;
    y: number;
}

interface MindMapCanvasProps {
    pan: Pan;
    zoom: number;
    renderNodeGroups: () => ReactNode;
    renderConnections: ReactNode;
    children?: ReactNode;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
    pan,
    zoom,
    renderNodeGroups,
    renderConnections,
    children
}) => {
    return (
        <div
            className="absolute"
            style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
            }}
        >
            {/* Connections between nodes - render FIRST (behind nodes) */}
            {/* Direct child - no wrapper div - shares same coordinate space as nodes */}
            {renderConnections}

            {/* Group bounding boxes */}
            {renderNodeGroups()}

            {/* Nodes - passed as children (renders on top with zIndex 10) */}
            {children}
        </div>
    );
};

export default MindMapCanvas;
