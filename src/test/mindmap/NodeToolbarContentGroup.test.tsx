import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import NodeToolbarContentGroup from '../../components/mindmap/NodeToolbarContentGroup.jsx';

describe('NodeToolbarContentGroup', () => {
  const baseProps = {
    node: { id: 'n1' },
    isDarkMode: false,
    attachBtnRef: null,
    notesBtnRef: null,
    tagsBtnRef: null,
  } as const;

  it('calls render callbacks on render', () => {
    const renderAttachmentPopup = vi.fn(() => null);
    const renderNotesPopup = vi.fn(() => null);
    const renderTagsPopup = vi.fn(() => null);

    render(
      <NodeToolbarContentGroup
        {...baseProps}
        onToggleAttachment={() => {}}
        onToggleNotes={() => {}}
        onToggleTags={() => {}}
        renderAttachmentPopup={renderAttachmentPopup}
        renderNotesPopup={renderNotesPopup}
        renderTagsPopup={renderTagsPopup}
      />
    );

    expect(renderAttachmentPopup).toHaveBeenCalled();
    expect(renderNotesPopup).toHaveBeenCalled();
    expect(renderTagsPopup).toHaveBeenCalled();
  });

  it('invokes toggle handlers when buttons are clicked', () => {
    const onToggleAttachment = vi.fn();
    const onToggleNotes = vi.fn();
    const onToggleTags = vi.fn();

    const { getAllByRole } = render(
      <NodeToolbarContentGroup
        {...baseProps}
        onToggleAttachment={onToggleAttachment}
        onToggleNotes={onToggleNotes}
        onToggleTags={onToggleTags}
        renderAttachmentPopup={() => null}
        renderNotesPopup={() => null}
        renderTagsPopup={() => null}
      />
    );

    const buttons = getAllByRole('button');
    // Order: attachment, notes, tags
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(onToggleAttachment).toHaveBeenCalledTimes(1);
    expect(onToggleNotes).toHaveBeenCalledTimes(1);
    expect(onToggleTags).toHaveBeenCalledTimes(1);
  });
});
