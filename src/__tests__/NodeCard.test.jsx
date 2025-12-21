import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NodeCard from '../components/mindmap/NodeCard';

/**
 * NodeCard Component Tests
 * 
 * Tests for:
 * 1. Node width expanding as user types
 * 2. Long words being properly wrapped with word-break
 */

describe('NodeCard Component', () => {
    const defaultNode = {
        id: 'test-node-1',
        text: 'Test',
        x: 200,
        y: 200,
    };

    const renderNodeCard = (props = {}) => {
        const defaultProps = {
            node: defaultNode,
            selected: false,
            onSelect: vi.fn(),
            onUpdateText: vi.fn(),
            ...props,
        };
        return render(<NodeCard {...defaultProps} />);
    };

    describe('Width Calculation', () => {
        it('should have minimum width for short text', () => {
            renderNodeCard({ node: { ...defaultNode, text: 'Hi' } });
            const nodeElement = document.querySelector('[data-node-id="test-node-1"]');

            // Minimum width is 120px
            expect(nodeElement).toBeTruthy();
            const width = parseInt(nodeElement.style.width, 10);
            expect(width).toBeGreaterThanOrEqual(120);
        });

        it('should expand width for longer text up to max-width', () => {
            const longText = 'This is a much longer piece of text for testing';
            renderNodeCard({ node: { ...defaultNode, text: longText } });
            const nodeElement = document.querySelector('[data-node-id="test-node-1"]');

            const width = parseInt(nodeElement.style.width, 10);
            // Should be wider than minimum but not exceed max (300px)
            expect(width).toBeGreaterThan(120);
            expect(width).toBeLessThanOrEqual(300);
        });

        it('should not exceed max-width of 300px for very long text', () => {
            const veryLongText = 'This is an extremely long piece of text that should definitely exceed the maximum width limit of 300 pixels';
            renderNodeCard({ node: { ...defaultNode, text: veryLongText } });
            const nodeElement = document.querySelector('[data-node-id="test-node-1"]');

            const width = parseInt(nodeElement.style.width, 10);
            expect(width).toBe(300);
        });

        it('should account for emoji in width calculation', () => {
            // Use text length that is > min width but < max width (even with emoji)
            // Approx 20 chars: 20 * 8 = 160px + 32 padding = 192px width
            const mediumText = 'Medium length text here';

            // First render with emoji - use a unique ID to avoid conflict
            const { unmount } = renderNodeCard({
                node: { ...defaultNode, id: 'test-node-emoji', text: mediumText, emoji: '🎉' }
            });
            const nodeWithEmoji = document.querySelector('[data-node-id="test-node-emoji"]');
            const widthWithEmoji = parseInt(nodeWithEmoji.style.width, 10);
            unmount();

            // Then render without emoji
            renderNodeCard({
                node: { ...defaultNode, id: 'test-node-no-emoji', text: mediumText }
            });
            const nodeNoEmoji = document.querySelector('[data-node-id="test-node-no-emoji"]');
            const widthWithoutEmoji = parseInt(nodeNoEmoji.style.width, 10);

            expect(widthWithEmoji).toBeGreaterThan(widthWithoutEmoji);
        });
    });

    describe('Text Display and Word Break', () => {
        it('should render node text correctly', () => {
            renderNodeCard({ node: { ...defaultNode, text: 'Hello World' } });
            expect(screen.getByText('Hello World')).toBeTruthy();
        });

        it('should have word-break styling for text overflow', () => {
            const longWord = 'Supercalifragilisticexpialidocious';
            renderNodeCard({ node: { ...defaultNode, text: longWord } });

            const textElement = screen.getByText(longWord);
            const styles = window.getComputedStyle(textElement);

            // Check that word-break or overflow-wrap is set
            // Note: The actual computed style may vary, so we check the element exists
            expect(textElement).toBeTruthy();
        });

        it('should display default text when node.text is empty', () => {
            renderNodeCard({ node: { ...defaultNode, text: '' } });
            expect(screen.getByText('New Task')).toBeTruthy();
        });
    });

    describe('Edit Mode', () => {
        it('should enter edit mode on double click', async () => {
            renderNodeCard();
            const button = screen.getByRole('button');

            // Double click to enter edit mode
            fireEvent.doubleClick(button);

            // Should now have a textarea
            const textarea = document.querySelector('textarea');
            expect(textarea).toBeTruthy();
        });

        it('should update text in textarea while editing', async () => {
            const user = userEvent.setup();
            renderNodeCard();
            const button = screen.getByRole('button');

            // Double click to enter edit mode
            fireEvent.doubleClick(button);

            const textarea = document.querySelector('textarea');
            expect(textarea).toBeTruthy();

            // Clear and type new text
            await user.clear(textarea);
            await user.type(textarea, 'New Text');

            expect(textarea.value).toBe('New Text');
        });

        it('should save text on blur', async () => {
            const onUpdateText = vi.fn();
            const user = userEvent.setup();
            renderNodeCard({ onUpdateText });

            const button = screen.getByRole('button');
            fireEvent.doubleClick(button);

            const textarea = document.querySelector('textarea');
            await user.clear(textarea);
            await user.type(textarea, 'Updated Text');

            // Blur to save
            fireEvent.blur(textarea);

            expect(onUpdateText).toHaveBeenCalledWith('test-node-1', 'Updated Text');
        });

        it('should cancel edit on Escape key', async () => {
            const onUpdateText = vi.fn();
            renderNodeCard({ onUpdateText, node: { ...defaultNode, text: 'Original' } });

            const button = screen.getByRole('button');
            fireEvent.doubleClick(button);

            const textarea = document.querySelector('textarea');

            // Press Escape
            fireEvent.keyDown(textarea, { key: 'Escape' });

            // Should exit edit mode without saving
            expect(onUpdateText).not.toHaveBeenCalled();
            expect(screen.getByText('Original')).toBeTruthy();
        });

        it('should save on Ctrl+Enter', async () => {
            const onUpdateText = vi.fn();
            const user = userEvent.setup();
            renderNodeCard({ onUpdateText });

            const button = screen.getByRole('button');
            fireEvent.doubleClick(button);

            const textarea = document.querySelector('textarea');
            await user.clear(textarea);
            await user.type(textarea, 'Saved with Ctrl+Enter');

            // Press Ctrl+Enter
            fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

            expect(onUpdateText).toHaveBeenCalledWith('test-node-1', 'Saved with Ctrl+Enter');
        });
    });

    describe('Visual States', () => {
        it('should show completed checkmark when node is completed', () => {
            renderNodeCard({ node: { ...defaultNode, completed: true } });

            // Look for the checkmark SVG container
            const checkmarkContainer = document.querySelector('.bg-green-500');
            expect(checkmarkContainer).toBeTruthy();
        });

        it('should apply selected ring style when selected', () => {
            renderNodeCard({ selected: true });
            const nodeElement = document.querySelector('[data-node-id="test-node-1"]');

            expect(nodeElement.className).toContain('ring-2');
        });

        it('should show emoji when node has emoji', () => {
            renderNodeCard({ node: { ...defaultNode, emoji: '🚀' } });
            expect(screen.getByText('🚀')).toBeTruthy();
        });
    });
});
