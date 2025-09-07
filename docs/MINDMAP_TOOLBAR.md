# Mind Map Toolbar Components

This document tracks the ongoing decomposition of the Mind Map node toolbar into smaller components.

## NodeToolbarContentGroup
Encapsulates the content-management controls for a node: attachments, notes, and tags. It is a presentational wrapper that delegates state and business logic to `MindMap.jsx` via props.

Props (inputs):
- node: object (required) – the current node.
- isDarkMode: boolean – forwarded for future styling needs.
- attachBtnRef, notesBtnRef, tagsBtnRef: refs for anchoring popups.
- onToggleAttachment(e), onToggleNotes(e), onToggleTags(e): click handlers which should stop propagation and toggle the corresponding popup on the node state.
- renderAttachmentPopup(), renderNotesPopup(), renderTagsPopup(): render functions that return the anchored popup via `createPortal` (or `null`).

Outputs/behaviors:
- Renders three toolbar buttons with stable styles.
- Invokes the provided render functions to display popups next to each button.

Usage (excerpt from MindMap.jsx):
- Pass the existing refs, togglers that update node state, and `render*Popup` functions which compute placement using the button’s bounding rect and call `createPortal`.

Testing:
- `src/test/mindmap/NodeToolbarContentGroup.test.tsx` verifies that:
  - Render callbacks are invoked.
  - Toggle handlers are called when buttons are clicked.

Notes:
- Business logic (file upload, notes editing, tag add/remove) remains in `MindMap.jsx` to keep this component stateless and easy to reuse.
