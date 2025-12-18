/**
 * useKeyboardShortcuts Hook
 * Handles all keyboard shortcuts for the mind map application
 */

import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onToggleSearch,
  onEscape,
  onDelete,
  onSelectAll,
  onSelectDescendants,
  onCreateNode,
  onDetachNode,
  enabled = true
}) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd + Z
      if (ctrlOrCmd && e.key === 'z' && !e.shiftKey && onUndo) {
        e.preventDefault();
        onUndo();
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((ctrlOrCmd && e.key === 'z' && e.shiftKey) || (ctrlOrCmd && e.key === 'y')) {
        if (onRedo) {
          e.preventDefault();
          onRedo();
        }
      }

      // Search: Ctrl/Cmd + F
      if (ctrlOrCmd && e.key === 'f' && onToggleSearch) {
        e.preventDefault();
        onToggleSearch();
      }

      // Select Descendants: Ctrl/Cmd + Shift + A (select all children/descendants)
      if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'a' && onSelectDescendants) {
        e.preventDefault();
        onSelectDescendants();
        return; // Don't fall through to regular Select All
      }

      // Select All: Ctrl/Cmd + A
      if (ctrlOrCmd && e.key === 'a' && !e.shiftKey && onSelectAll) {
        e.preventDefault();
        onSelectAll();
      }

      // Escape key
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }

      // Delete key
      if ((e.key === 'Delete' || e.key === 'Backspace') && onDelete) {
        e.preventDefault();
        onDelete();
      }

      // Create Node: Shift + N
      if (e.shiftKey && e.key === 'N' && onCreateNode) {
        e.preventDefault();
        onCreateNode();
      }

      // Detach Node: Shift + D
      if (e.shiftKey && e.key === 'D' && onDetachNode) {
        e.preventDefault();
        onDetachNode();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onUndo, onRedo, onToggleSearch, onEscape, onDelete, onSelectAll, onSelectDescendants, onCreateNode, onDetachNode]);
}
