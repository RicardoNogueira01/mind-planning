import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import NodeToolbarBackgroundColor from '../../../src/components/mindmap/NodeToolbarBackgroundColor';

describe('NodeToolbarBackgroundColor', () => {
  it('renders button and toggles', () => {
    const onToggle = vi.fn();
    const { getByTitle } = render(
      <NodeToolbarBackgroundColor isOpen={false} currentColor="#ffffff" onToggle={onToggle} onSelect={() => {}} onClose={() => {}} />
    );
    const btn = getByTitle('Background color');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalled();
  });
});
