/**
 * @fileoverview Unit tests for useNodeOperations hook
 * Tests cover: add, delete, update operations and node relationship queries
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNodeOperations } from '../../hooks/useNodeOperations';
import type { Node, Connection } from '../../types/mindmap';

describe('useNodeOperations', () => {
  let mockNodes: Node[];
  let mockConnections: Connection[];
  let mockSetNodes: ReturnType<typeof vi.fn>;
  let mockSetConnections: ReturnType<typeof vi.fn>;
  let mockFindStackedPosition: ReturnType<typeof vi.fn>;
  let mockFindStackedChildPosition: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNodes = [];
    mockConnections = [];
    mockSetNodes = vi.fn();
    mockSetConnections = vi.fn();
    mockFindStackedPosition = vi.fn(() => ({ x: 100, y: 100 }));
    mockFindStackedChildPosition = vi.fn(() => ({ x: 200, y: 200 }));
  });

  describe('addStandaloneNode', () => {
    it('should create a standalone node with correct default colors in light mode', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false, // isDarkMode = false
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.addStandaloneNode();
      });

      expect(mockSetNodes).toHaveBeenCalledTimes(1);
      const callArg = mockSetNodes.mock.calls[0][0];
      expect(callArg).toHaveLength(1);
      expect(callArg[0]).toMatchObject({
        text: 'Task',
        x: 100,
        y: 100,
        bgColor: '#ffffff',
        fontColor: '#2d3748',
      });
      expect(callArg[0].id).toMatch(/^node-\d+$/);
    });

    it('should create a standalone node with correct default colors in dark mode', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          true, // isDarkMode = true
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.addStandaloneNode();
      });

      const callArg = mockSetNodes.mock.calls[0][0];
      expect(callArg[0]).toMatchObject({
        bgColor: '#374151',
        fontColor: '#f3f4f6',
      });
    });

    it('should call findStackedPosition to determine node placement', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.addStandaloneNode();
      });

      expect(mockFindStackedPosition).toHaveBeenCalledTimes(1);
    });
  });

  describe('addChildNode', () => {
    beforeEach(() => {
      mockNodes = [
        { id: 'parent-1', text: 'Parent', x: 50, y: 50, bgColor: '#fff', fontColor: '#000' },
      ];
    });

    it('should create a child node connected to the parent', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.addChildNode('parent-1');
      });

      expect(mockSetNodes).toHaveBeenCalledTimes(1);
      expect(mockSetConnections).toHaveBeenCalledTimes(1);

      const nodeCallArg = mockSetNodes.mock.calls[0][0];
      expect(nodeCallArg).toHaveLength(2);
      expect(nodeCallArg[1]).toMatchObject({
        text: 'New Task',
        x: 200,
        y: 200,
        bgColor: '#ffffff',
        fontColor: '#2d3748',
      });

      const connCallArg = mockSetConnections.mock.calls[0][0];
      expect(connCallArg).toHaveLength(1);
      expect(connCallArg[0]).toMatchObject({
        from: 'parent-1',
        to: expect.stringMatching(/^node-\d+$/),
      });
    });

    it('should call findStackedChildPosition with correct parameters', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.addChildNode('parent-1');
      });

      expect(mockFindStackedChildPosition).toHaveBeenCalledWith(
        'parent-1',
        50 + 300 + 40, // parent.x + NODE_WIDTH + 40
        50 // parent.y
      );
    });

    it('should not create child if parent does not exist', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          [], // empty nodes array
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.addChildNode('non-existent-parent');
      });

      expect(mockSetNodes).not.toHaveBeenCalled();
      expect(mockSetConnections).not.toHaveBeenCalled();
    });

    it('should create child with dark mode colors when dark mode is enabled', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          true, // isDarkMode = true
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.addChildNode('parent-1');
      });

      const nodeCallArg = mockSetNodes.mock.calls[0][0];
      expect(nodeCallArg[1]).toMatchObject({
        bgColor: '#374151',
        fontColor: '#f3f4f6',
      });
    });
  });

  describe('deleteNodes', () => {
    beforeEach(() => {
      mockNodes = [
        { id: 'node-1', text: 'Node 1', x: 0, y: 0, bgColor: '#fff', fontColor: '#000' },
        { id: 'node-2', text: 'Node 2', x: 100, y: 0, bgColor: '#fff', fontColor: '#000' },
        { id: 'node-3', text: 'Node 3', x: 200, y: 0, bgColor: '#fff', fontColor: '#000' },
      ];
      mockConnections = [
        { id: 'conn-1', from: 'node-1', to: 'node-2' },
        { id: 'conn-2', from: 'node-2', to: 'node-3' },
      ];
    });

    it('should remove a single node and its related connections', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.deleteNodes(['node-2']);
      });

      expect(mockSetNodes).toHaveBeenCalledTimes(1);
      expect(mockSetConnections).toHaveBeenCalledTimes(1);

      const nodeCallArg = mockSetNodes.mock.calls[0][0];
      expect(nodeCallArg).toHaveLength(2);
      expect(nodeCallArg.find((n: Node) => n.id === 'node-2')).toBeUndefined();

      const connCallArg = mockSetConnections.mock.calls[0][0];
      expect(connCallArg).toHaveLength(0); // Both connections removed
    });

    it('should remove multiple nodes and their connections', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.deleteNodes(['node-1', 'node-3']);
      });

      const nodeCallArg = mockSetNodes.mock.calls[0][0];
      expect(nodeCallArg).toHaveLength(1);
      expect(nodeCallArg[0].id).toBe('node-2');

      const connCallArg = mockSetConnections.mock.calls[0][0];
      expect(connCallArg).toHaveLength(0); // All connections removed
    });

    it('should handle empty ids array gracefully', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.deleteNodes([]);
      });

      expect(mockSetNodes).not.toHaveBeenCalled();
      expect(mockSetConnections).not.toHaveBeenCalled();
    });

    it('should preserve connections between remaining nodes', () => {
      mockConnections = [
        { id: 'conn-1', from: 'node-1', to: 'node-2' },
        { id: 'conn-2', from: 'node-2', to: 'node-3' },
        { id: 'conn-3', from: 'node-1', to: 'node-3' }, // This should be preserved
      ];

      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.deleteNodes(['node-2']);
      });

      const connCallArg = mockSetConnections.mock.calls[0][0];
      expect(connCallArg).toHaveLength(1);
      expect(connCallArg[0]).toMatchObject({ id: 'conn-3', from: 'node-1', to: 'node-3' });
    });
  });

  describe('updateNodeText', () => {
    beforeEach(() => {
      mockNodes = [
        { id: 'node-1', text: 'Original Text', x: 0, y: 0, bgColor: '#fff', fontColor: '#000' },
      ];
    });

    it('should update the text of a specific node', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.updateNodeText('node-1', 'Updated Text');
      });

      expect(mockSetNodes).toHaveBeenCalledTimes(1);
      const callArg = mockSetNodes.mock.calls[0][0];
      expect(callArg[0]).toMatchObject({
        id: 'node-1',
        text: 'Updated Text',
        x: 0,
        y: 0,
      });
    });

    it('should not modify other node properties', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.updateNodeText('node-1', 'New Text');
      });

      const callArg = mockSetNodes.mock.calls[0][0];
      expect(callArg[0]).toMatchObject({
        bgColor: '#fff',
        fontColor: '#000',
        x: 0,
        y: 0,
      });
    });
  });

  describe('toggleNodeComplete', () => {
    it('should toggle completed state from undefined to true', () => {
      mockNodes = [{ id: 'node-1', text: 'Task', x: 0, y: 0, bgColor: '#fff', fontColor: '#000' }];

      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.toggleNodeComplete('node-1');
      });

      const callArg = mockSetNodes.mock.calls[0][0];
      expect(callArg[0].completed).toBe(true);
    });

    it('should toggle completed state from true to false', () => {
      mockNodes = [
        { id: 'node-1', text: 'Task', x: 0, y: 0, bgColor: '#fff', fontColor: '#000', completed: true },
      ];

      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.toggleNodeComplete('node-1');
      });

      const callArg = mockSetNodes.mock.calls[0][0];
      expect(callArg[0].completed).toBe(false);
    });

    it('should toggle completed state from false to true', () => {
      mockNodes = [
        { id: 'node-1', text: 'Task', x: 0, y: 0, bgColor: '#fff', fontColor: '#000', completed: false },
      ];

      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.toggleNodeComplete('node-1');
      });

      const callArg = mockSetNodes.mock.calls[0][0];
      expect(callArg[0].completed).toBe(true);
    });
  });

  describe('updateNode', () => {
    beforeEach(() => {
      mockNodes = [
        { id: 'node-1', text: 'Task', x: 100, y: 200, bgColor: '#fff', fontColor: '#000' },
      ];
    });

    it('should update node with partial object patch', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.updateNode('node-1', { bgColor: '#ff0000', x: 150 });
      });

      expect(mockSetNodes).toHaveBeenCalledTimes(1);
      // updateNode uses functional update, so check the function call
      const updateFn = mockSetNodes.mock.calls[0][0];
      expect(typeof updateFn).toBe('function');
      
      const updatedNodes = updateFn(mockNodes);
      expect(updatedNodes[0]).toMatchObject({
        id: 'node-1',
        bgColor: '#ff0000',
        x: 150,
        text: 'Task', // preserved
        y: 200, // preserved
      });
    });

    it('should update node with function patch', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.updateNode('node-1', (node) => ({
          ...node,
          x: node.x + 50,
          y: node.y + 50,
        }));
      });

      const updateFn = mockSetNodes.mock.calls[0][0];
      const updatedNodes = updateFn(mockNodes);
      expect(updatedNodes[0]).toMatchObject({
        x: 150,
        y: 250,
      });
    });

    it('should not modify other nodes', () => {
      mockNodes = [
        { id: 'node-1', text: 'Task 1', x: 100, y: 200, bgColor: '#fff', fontColor: '#000' },
        { id: 'node-2', text: 'Task 2', x: 300, y: 400, bgColor: '#fff', fontColor: '#000' },
      ];

      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.updateNode('node-1', { bgColor: '#ff0000' });
      });

      const updateFn = mockSetNodes.mock.calls[0][0];
      const updatedNodes = updateFn(mockNodes);
      expect(updatedNodes[1]).toEqual(mockNodes[1]); // node-2 unchanged
    });
  });

  describe('updateNodeField', () => {
    beforeEach(() => {
      mockNodes = [
        { id: 'node-1', text: 'Task', x: 100, y: 200, bgColor: '#fff', fontColor: '#000' },
      ];
    });

    it('should update a specific field of a node', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.updateNodeField('node-1', 'bgColor', '#00ff00');
      });

      const updateFn = mockSetNodes.mock.calls[0][0];
      const updatedNodes = updateFn(mockNodes);
      expect(updatedNodes[0].bgColor).toBe('#00ff00');
    });

    it('should update x coordinate field', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      act(() => {
        result.current.updateNodeField('node-1', 'x', 500);
      });

      const updateFn = mockSetNodes.mock.calls[0][0];
      const updatedNodes = updateFn(mockNodes);
      expect(updatedNodes[0].x).toBe(500);
    });
  });

  describe('getRelatedNodeIds', () => {
    beforeEach(() => {
      mockNodes = [
        { id: 'node-1', text: 'Root', x: 0, y: 0, bgColor: '#fff', fontColor: '#000' },
        { id: 'node-2', text: 'Child 1', x: 100, y: 0, bgColor: '#fff', fontColor: '#000' },
        { id: 'node-3', text: 'Child 2', x: 200, y: 0, bgColor: '#fff', fontColor: '#000' },
        { id: 'node-4', text: 'Grandchild', x: 300, y: 0, bgColor: '#fff', fontColor: '#000' },
      ];
      mockConnections = [
        { id: 'conn-1', from: 'node-1', to: 'node-2' },
        { id: 'conn-2', from: 'node-1', to: 'node-3' },
        { id: 'conn-3', from: 'node-2', to: 'node-4' },
      ];
    });

    it('should return node itself plus all descendants and ancestors', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      const relatedIds = result.current.getRelatedNodeIds('node-2');
      
      expect(relatedIds).toBeInstanceOf(Set);
      expect(relatedIds.has('node-2')).toBe(true); // Self
      expect(relatedIds.has('node-4')).toBe(true); // Descendant
      expect(relatedIds.has('node-1')).toBe(true); // Ancestor
    });

    it('should return only self for isolated node', () => {
      mockNodes.push({ id: 'node-5', text: 'Isolated', x: 400, y: 0, bgColor: '#fff', fontColor: '#000' });

      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      const relatedIds = result.current.getRelatedNodeIds('node-5');
      
      expect(relatedIds.size).toBe(1);
      expect(relatedIds.has('node-5')).toBe(true);
    });

    it('should include all nodes in connected tree for root node', () => {
      const { result } = renderHook(() =>
        useNodeOperations(
          mockNodes,
          mockConnections,
          mockSetNodes,
          mockSetConnections,
          false,
          mockFindStackedPosition,
          mockFindStackedChildPosition
        )
      );

      const relatedIds = result.current.getRelatedNodeIds('node-1');
      
      expect(relatedIds.size).toBe(4);
      expect(relatedIds.has('node-1')).toBe(true);
      expect(relatedIds.has('node-2')).toBe(true);
      expect(relatedIds.has('node-3')).toBe(true);
      expect(relatedIds.has('node-4')).toBe(true);
    });
  });
});
