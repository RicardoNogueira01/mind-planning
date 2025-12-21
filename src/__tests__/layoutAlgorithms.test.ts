import { describe, it, expect } from 'vitest';
import { applyLayout } from '../utils/layoutAlgorithms';
import { Node, Connection } from '../types/mindmap';

describe('Layout Algorithms - Collision Detection', () => {

    // Helper to create a node
    const createNode = (id: string, text: string): Node => ({
        id, text, x: 0, y: 0,
        type: 'default', // basic required fields
        style: {}
    } as any);

    const createConnection = (from: string, to: string): Connection => ({
        id: `${from}-${to}`, from, to, type: 'default'
    } as any);

    it('should allocate vertical space for nodes with long text in MindMap layout', () => {
        const root = createNode('root', 'Root Node');

        // Short node
        const childShort = createNode('child1', 'Short Text');

        // Long node with many lines (simulating the user's issue)
        // 300 chars usually wraps to ~10-12 lines at 30 chars/line
        const longText = `This is a very long text that simulates the user's problem. 
        It has multiple lines and should force the node to expand vertically.
        Line 3 content is here.
        Line 4 content is here.
        Line 5 content is here.
        Line 6 content is here.
        Line 7 content is here.
        Line 8 content is here.
        Line 9 content is here.
        Line 10 content is here.`;

        const childLong = createNode('child2', longText);

        const nodes = [root, childShort, childLong];
        const connections = [
            createConnection('root', 'child1'),
            createConnection('root', 'child2')
        ];

        // Apply MindMap layout
        const result = applyLayout(nodes, connections, { type: 'mindmap', spacing: 60 }, 1000, 1000);

        const rRoot = result.nodes.find(n => n.id === 'root')!;
        const rChild1 = result.nodes.find(n => n.id === 'child1')!;
        const rChild2 = result.nodes.find(n => n.id === 'child2')!;

        // In MindMap layout, children alternate right/left.
        // child1 -> Right
        // child2 -> Left
        // Wait, "alternating" logic: 0%2==0 -> right, 1%2!=0 -> left.
        // So child1 is Right, child2 is Left.
        // They won't collide because they are on opposite sides!

        // We need 3 children to test vertical stacking on ONE side.
        // Child 1 (Right)
        // Child 2 (Left)
        // Child 3 (Right) -> Should stack below Child 1

        const child3 = createNode('child3', 'Another Right Node');
        const nodes3 = [root, childShort, childLong, child3];
        const cx3 = [
            createConnection('root', 'child1'),
            createConnection('root', 'child2'),
            createConnection('root', 'child3')
        ];

        const result3 = applyLayout(nodes3, cx3, { type: 'mindmap', spacing: 60 }, 1000, 1000);

        const pos1 = result3.nodes.find(n => n.id === 'child1')!;
        const pos3 = result3.nodes.find(n => n.id === 'child3')!; // Should be below child1 (or above)

        // Wait, the order depends on implementation.
        // Implementation:
        // index 0 -> Right
        // index 1 -> Left
        // index 2 -> Right
        // So Child1 and Child3 are on the Right side.

        // Are they stacked?
        // Right side layout puts them in a column.

        // Check vertical distance
        const distY = Math.abs(pos1.y - pos3.y);

        console.log(`Child1 Y: ${pos1.y}, Child3 Y: ${pos3.y}, Distance: ${distY}`);

        // If Child1 is "Short Text", its height is ~60px.
        // Child3 is "Another Right Node", height ~60px.
        // Gap is ~15px (SIBLING_GAP).
        // Total distance needs to be at least 60/2 + 60/2 + 15 = 75px.
        // If standard layout works, this is met.

        // NOW, let's make Child1 HUGE.
        const childHuge = createNode('child1_huge', longText);
        const childNext = createNode('child_next', 'Next Neighbor');

        const nodesHuge = [root, childHuge, createNode('dummy', 'left'), childNext];
        // 0 -> Huge (Right)
        // 1 -> Dummy (Left)
        // 2 -> Next (Right)

        const cxHuge = [
            createConnection('root', 'child1_huge'),
            createConnection('root', 'dummy'),
            createConnection('root', 'child_next')
        ];

        const resHuge = applyLayout(nodesHuge, cxHuge, { type: 'mindmap' }, 1000, 1000);

        const p1 = resHuge.nodes.find(n => n.id === 'child1_huge')!;
        const p2 = resHuge.nodes.find(n => n.id === 'child_next')!;

        const distHuge = Math.abs(p1.y - p2.y);

        // Estimate height of huge node:
        // 10 lines * 24px + 64px padding = ~300px.
        // Next node height ~60px.
        // Expected distance: 300/2 + 60/2 + 15 = 150 + 30 + 15 = 195px.
        // If using fixed 60px height logic: 60/2 + 60/2 + 15 = 75px.

        console.log(`Huge Node Check: Y1=${p1.y}, Y2=${p2.y}. Distance=${distHuge}`);

        expect(distHuge).toBeGreaterThan(200);
    });
});
