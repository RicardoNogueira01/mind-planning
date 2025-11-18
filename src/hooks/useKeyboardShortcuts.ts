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
      
      // Select All: Ctrl/Cmd + A
      if (ctrlOrCmd && e.key === 'a' && onSelectAll) {
        e.preventDefault();
        onSelectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onUndo, onRedo, onToggleSearch, onEscape, onDelete, onSelectAll]);
}
