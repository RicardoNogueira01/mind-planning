import { describe, it, expect } from 'vitest';

// Logic to be tested (mirrors implementation intended for MindMap.jsx)
// This pure function represents the state update logic for batch operations
const updateNodes = (nodes: any[], selectedNodes: string[], targetNodeId: string, property: string, value: any) => {
    return nodes.map(n => {
        const isTargetSelected = selectedNodes.includes(targetNodeId);

        if (isTargetSelected) {
            // If target is selected, apply to ALL selected nodes
            if (selectedNodes.includes(n.id)) {
                return { ...n, [property]: value };
            }
        } else {
            // Target not selected, apply only to target
            if (n.id === targetNodeId) {
                return { ...n, [property]: value };
            }
        }
        return n;
    });
};

describe('Batch Node Property Updates', () => {
    const mockNodes = [
        { id: '1', bgColor: 'white', text: 'Node 1' },
        { id: '2', bgColor: 'white', text: 'Node 2' },
        { id: '3', bgColor: 'white', text: 'Node 3' },
    ];

    it('should update only target node if no nodes are selected', () => {
        const selected: string[] = [];
        const result = updateNodes(mockNodes, selected, '1', 'bgColor', 'red');
        expect(result[0].bgColor).toBe('red');
        expect(result[1].bgColor).toBe('white');
        expect(result[2].bgColor).toBe('white');
    });

    it('should update all selected nodes if target is one of them', () => {
        const selected = ['1', '2']; // 1 and 2 selected
        const result = updateNodes(mockNodes, selected, '1', 'bgColor', 'blue');

        expect(result[0].bgColor).toBe('blue'); // 1 updated
        expect(result[1].bgColor).toBe('blue'); // 2 updated
        expect(result[2].bgColor).toBe('white'); // 3 unchanged
    });

    it('should update only target if selected list does not include target', () => {
        // Edge case: 2 and 3 selected, but user modifies 1 (e.g. via context menu on unselected node)
        const selected = ['2', '3'];
        const result = updateNodes(mockNodes, selected, '1', 'bgColor', 'green');

        expect(result[0].bgColor).toBe('green');
        expect(result[1].bgColor).toBe('white');
        expect(result[2].bgColor).toBe('white');
    });
});
