import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

export default function NotesPopup({ show, anchorRef, notes, onChange, onClose }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (show && editorRef.current && notes) {
      editorRef.current.innerHTML = notes;
    }
  }, [show]);

  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() || 
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
  
  const popupWidth = 480;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertHeading = (level) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    document.execCommand('formatBlock', false, `h${level}`);
    editorRef.current?.focus();
  };

  const insertList = (ordered = false) => {
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false, null);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      editorRef.current?.focus();
    }
  };

  return createPortal(
    <NodePopup 
      position={{ left, top }}
      width={popupWidth}
      title="Notes"
      onClose={onClose}
    >
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 mb-3 pb-3 border-b border-gray-200 flex-wrap">
        {/* Text Formatting */}
        <button
          onClick={() => applyFormat('bold')}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Bold"
          type="button"
        >
          <span className="font-bold text-xs text-black">B</span>
        </button>
        <button
          onClick={() => applyFormat('italic')}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Italic"
          type="button"
        >
          <span className="italic text-xs text-black">i</span>
        </button>
        <button
          onClick={() => applyFormat('strikeThrough')}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          title="Strikethrough"
          type="button"
        >
          <span className="line-through text-xs text-black">S</span>
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Headings */}
        <button
          onClick={() => insertHeading(1)}
          className="px-1.5 py-1 rounded hover:bg-gray-100 transition-colors text-xs font-semibold text-black"
          title="Heading 1"
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => insertHeading(2)}
          className="px-1.5 py-1 rounded hover:bg-gray-100 transition-colors text-xs font-semibold text-black"
          title="Heading 2"
          type="button"
        >
          H2
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Lists */}
        <button
          onClick={() => insertList(false)}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-black"
          title="Bullet List"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button
          onClick={() => insertList(true)}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-black"
          title="Numbered List"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Link */}
        <button
          onClick={insertLink}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-black"
          title="Insert Link"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>

        {/* Code */}
        <button
          onClick={() => applyFormat('formatBlock', '<pre>')}
          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-black"
          title="Code Block"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full p-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[160px]"
        style={{
          lineHeight: '1.6'
        }}
        onClick={(e) => e.stopPropagation()} 
        onMouseDown={(e) => e.stopPropagation()} 
        onFocus={(e) => e.stopPropagation()} 
        onKeyDown={(e) => e.stopPropagation()}
        suppressContentEditableWarning
      />
    </NodePopup>,
    document.body
  );
}

NotesPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  notes: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
