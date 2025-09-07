import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import NodeToolbarLayout from '../../../src/components/mindmap/NodeToolbarLayout';

describe('NodeToolbarLayout', () => {
  it('does not render when shouldRender is false', () => {
    const { container } = render(
      <NodeToolbarLayout shouldRender={false} layoutBtnRef={null} onToggleLayout={() => {}} renderLayoutPopup={() => null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when shouldRender is true and responds to click', () => {
    const onToggle = vi.fn();
    render(
      <NodeToolbarLayout
        shouldRender
        layoutBtnRef={null}
        onToggleLayout={onToggle}
        renderLayoutPopup={() => <div data-testid="layout-popup" />}
      />
    );
    expect(screen.getByTestId('layout-popup')).toBeInTheDocument();

    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalled();
  });
});
