import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import NodeToolbarFontColor from '../../../src/components/mindmap/NodeToolbarFontColor';

describe('NodeToolbarFontColor', () => {
  it('renders button and toggles', () => {
    const onToggle = vi.fn();
    const { getByTitle } = render(
      <NodeToolbarFontColor isOpen={false} currentColor="#111827" onToggle={onToggle} onSelect={() => {}} onClose={() => {}} />
    );
    const btn = getByTitle('Font color');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalled();
  });
});
