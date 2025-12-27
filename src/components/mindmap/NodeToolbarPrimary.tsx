import React, { MouseEvent } from 'react';

interface Node {
    id: string;
    completed?: boolean;
    text?: string;
}

interface NodeToolbarPrimaryProps {
    node: Node;
    isMobile?: boolean;
    isToolbarExpanded?: boolean;
    onToggleComplete?: (nodeId: string) => void;
    onAddChild?: (nodeId: string) => void;
    onRequestDelete?: (nodeId: string) => void;
    onRequestDetach?: (nodeId: string) => void;
    onAutoArrangeChildren?: (nodeId: string) => void;
    hasParent?: boolean;
    hasChildren?: boolean;
}

import { Check, Plus, Trash2, Unlink, Sparkles } from 'lucide-react';

const NodeToolbarPrimary: React.FC<NodeToolbarPrimaryProps> = ({
    node,
    isMobile,
    isToolbarExpanded,
    onToggleComplete,
    onAddChild,
    onRequestDelete,
    onRequestDetach,
    onAutoArrangeChildren,
    hasParent,
    hasChildren,
}) => {
    const btnBaseClass = isMobile
        ? "p-4 rounded-xl text-black hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
        : "p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200";

    const activeBtnClass = isMobile
        ? "p-4 rounded-xl text-black bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200"
        : "p-2 rounded-lg text-black bg-gray-100 hover:bg-gray-200 transition-colors duration-200";

    const iconSize = isMobile ? 24 : 18;

    return (
        <div className={`flex items-center ${isMobile ? 'justify-between w-full gap-4' : 'gap-0.5'}`}>
            {/* Complete Task Button */}
            <button
                className={node.completed ? activeBtnClass : btnBaseClass}
                onClick={(e: MouseEvent) => { e.stopPropagation(); onToggleComplete?.(node.id); }}
                title={node.completed ? 'Mark as incomplete' : 'Mark as completed'}
            >
                <Check size={iconSize} strokeWidth={2.5} />
            </button>

            {/* Add Node Button */}
            <button
                className={btnBaseClass}
                onClick={(e: MouseEvent) => { e.stopPropagation(); onAddChild?.(node.id); }}
                title="Add connected child node (Shift+N)"
            >
                <Plus size={iconSize} strokeWidth={2.5} />
            </button>

            {/* Auto-arrange Children Button */}
            <button
                className={`${isMobile ? 'p-4 rounded-xl' : 'p-2 rounded-lg'} transition-colors duration-200 ${hasChildren
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-300 cursor-not-allowed opacity-50'
                    }`}
                onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    if (hasChildren) onAutoArrangeChildren?.(node.id);
                }}
                disabled={!hasChildren}
                title={hasChildren ? "Auto-arrange children" : "No children to arrange"}
            >
                <Sparkles size={iconSize} strokeWidth={2.5} />
            </button>

            {/* Delete Node Button */}
            <button
                className={btnBaseClass}
                onClick={(e: MouseEvent) => { e.stopPropagation(); onRequestDelete?.(node.id); }}
                title="Delete node"
            >
                <Trash2 size={iconSize} strokeWidth={2.5} />
            </button>

            {/* Detach Node Button */}
            {hasParent && (
                <button
                    className={btnBaseClass}
                    onClick={(e: MouseEvent) => { e.stopPropagation(); onRequestDetach?.(node.id); }}
                    title="Detach from parent"
                >
                    <Unlink size={iconSize} strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
};

export default NodeToolbarPrimary;
