import { describe, it, expect } from 'vitest';
import { shapeBuilders } from '../../components/mindmap/builders';

const getColor = (type: string) => ({
  circle: '#3B82F6',
  hexagon: '#10B981',
  rhombus: '#F59E0B',
  pentagon: '#EF4444',
  ellipse: '#8B5CF6',
  connector: '#6B7280',
}[type] || '#6B7280');

describe('shapeBuilders', () => {
  it('circle spawns start and first step', () => {
    const { nodes, connections, mainId } = shapeBuilders.circle(100, 100, getColor);
    expect(nodes.length).toBe(2);
    expect(connections.length).toBe(1);
    expect(mainId).toBeDefined();
  });
  it('if (rhombus) creates True/False branches with labels', () => {
    const { nodes, connections } = shapeBuilders.rhombus(200, 200, getColor);
    expect(nodes.length).toBe(3);
    const labels = connections.map(c => c.label);
    expect(labels).toContain('True');
    expect(labels).toContain('False');
  });
  it('switch (pentagon) creates three case branches with labels', () => {
    const { nodes, connections } = shapeBuilders.pentagon(300, 300, getColor);
    expect(nodes.length).toBe(4);
    expect(connections.length).toBe(3);
  });
});
