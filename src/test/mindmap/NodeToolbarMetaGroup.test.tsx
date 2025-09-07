import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import NodeToolbarMetaGroup from '../../../src/components/mindmap/NodeToolbarMetaGroup';

describe('NodeToolbarMetaGroup', () => {
  it('renders buttons and invokes handlers', () => {
    const onToggleDetails = vi.fn();
    const onToggleDate = vi.fn();
    const onToggleCollaborator = vi.fn();

    render(
      <NodeToolbarMetaGroup
        detailsBtnRef={null}
        onToggleDetails={onToggleDetails}
        renderDetailsPopup={() => <div data-testid="details-popup" />}
        dateBtnRef={null}
        onToggleDate={onToggleDate}
        renderDatePopup={() => <div data-testid="date-popup" />}
        collabBtnRef={null}
        onToggleCollaborator={onToggleCollaborator}
        renderCollaboratorPopup={() => <div data-testid="collab-popup" />}
      />
    );

    // popups are always rendered when provided
    expect(screen.getByTestId('details-popup')).toBeInTheDocument();
    expect(screen.getByTestId('date-popup')).toBeInTheDocument();
    expect(screen.getByTestId('collab-popup')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    // three buttons: details, date, collaborator
    expect(buttons.length).toBeGreaterThanOrEqual(3);

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(onToggleDetails).toHaveBeenCalled();
    expect(onToggleDate).toHaveBeenCalled();
    expect(onToggleCollaborator).toHaveBeenCalled();
  });
});
