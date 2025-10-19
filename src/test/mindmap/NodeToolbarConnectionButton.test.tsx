import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import NodeToolbarConnectionButton from '../../../src/components/mindmap/NodeToolbarConnectionButton';

describe('NodeToolbarConnectionButton', () => {
  it('calls onStart when inactive', () => {
    const onStart = vi.fn();
    const { getByTitle } = render(
      <NodeToolbarConnectionButton nodeId="n1" isActive={false} onStart={onStart} onCancel={() => {}} />
    );
    const btn = getByTitle('Start connection');
    fireEvent.click(btn);
    expect(onStart).toHaveBeenCalledWith('n1', expect.any(Object));
  });

  it('calls onCancel when active', () => {
    const onCancel = vi.fn();
    const { getByTitle } = render(
      <NodeToolbarConnectionButton nodeId="n1" isActive={true} onStart={() => {}} onCancel={onCancel} />
    );
    const btn = getByTitle('Cancel connection');
    fireEvent.click(btn);
    expect(onCancel).toHaveBeenCalled();
  });
});
