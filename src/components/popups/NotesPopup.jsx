import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

export default function NotesPopup({ show, anchorRef, notes, attachments, collaborators, onChange, onClose }) {
  const editorRef = useRef(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachmentMenuPosition, setAttachmentMenuPosition] = useState({ top: 0, left: 0 });
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (show && editorRef.current && notes) {
      editorRef.current.innerHTML = notes;
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      setShowAttachmentMenu(false);
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

  const handleKeyUp = (e) => {
    // Check for mentions on every key up except special keys
    if (!['Shift', 'Control', 'Alt', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      checkForMention();
    }
  };

  const checkForMention = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      setShowAttachmentMenu(false);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!range.startContainer || range.startContainer.nodeType !== Node.TEXT_NODE) {
      // If not in a text node, hide menu
      setShowAttachmentMenu(false);
      return;
    }

    const textBeforeCursor = range.startContainer.textContent?.substring(0, range.startOffset) || '';
    
    // Check if there's an "@" before the cursor
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(atIndex + 1);
      
      // Don't show menu if there's a space after @ (completed mention)
      if (textAfterAt.includes(' ')) {
        setShowAttachmentMenu(false);
        return;
      }
      
      // Calculate position at the "@" character
      const atRange = document.createRange();
      atRange.setStart(range.startContainer, atIndex);
      atRange.setEnd(range.startContainer, atIndex + 1);
      const atRect = atRange.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      
      setAttachmentMenuPosition({
        top: atRect.bottom - editorRect.top + 5,
        left: atRect.left - editorRect.left
      });
      
      // Filter attachments based on text after "@"
      const searchText = textAfterAt.toLowerCase();
      const allAttachments = attachments || [];
      const allCollaborators = collaborators || [];
      
      // Combine attachments and collaborators
      const filteredAttachments = allAttachments
        .filter(att => att.name.toLowerCase().includes(searchText))
        .map(att => ({ ...att, type: 'attachment', displayType: att.type }));
      
      const filteredCollaborators = allCollaborators
        .filter(collab => collab.name.toLowerCase().includes(searchText))
        .map(collab => ({ ...collab, type: 'collaborator', displayType: 'USER' }));
      
      const combined = [...filteredCollaborators, ...filteredAttachments];
      
      setFilteredItems(combined);
      // Show menu even if there are no items (to show "no items" message)
      setShowAttachmentMenu(true);
    } else {
      setShowAttachmentMenu(false);
    }
  };

  const insertAttachmentReference = (item) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    const textBeforeCursor = textNode.textContent?.substring(0, range.startOffset) || '';
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      // Remove "@" and any text after it up to cursor
      const newRange = document.createRange();
      newRange.setStart(textNode, atIndex);
      newRange.setEnd(textNode, range.startOffset);
      newRange.deleteContents();
      
      // Insert reference as a styled span
      const referenceSpan = document.createElement('span');
      referenceSpan.className = item.type === 'collaborator' ? 'user-reference' : 'attachment-reference';
      referenceSpan.contentEditable = 'false';
      
      if (item.type === 'collaborator') {
        referenceSpan.style.cssText = 'background-color: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; margin: 0 2px; font-weight: 500; cursor: pointer;';
        referenceSpan.textContent = `@${item.name}`;
        referenceSpan.dataset.collaboratorId = item.id;
      } else {
        referenceSpan.style.cssText = 'background-color: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; margin: 0 2px; font-weight: 500; cursor: pointer;';
        referenceSpan.textContent = `@${item.name}`;
        referenceSpan.dataset.attachmentId = item.id;
      }
      
      newRange.insertNode(referenceSpan);
      
      // Add space after the reference
      const space = document.createTextNode(' ');
      referenceSpan.parentNode.insertBefore(space, referenceSpan.nextSibling);
      
      // Move cursor after the space
      const newSelection = window.getSelection();
      const newSelectionRange = document.createRange();
      newSelectionRange.setStartAfter(space);
      newSelectionRange.collapse(true);
      newSelection.removeAllRanges();
      newSelection.addRange(newSelectionRange);
      
      setShowAttachmentMenu(false);
      handleInput();
      editorRef.current?.focus();
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
      <div className="flex items-center justify-center gap-1.5 mb-4 pb-3 border-b border-gray-200">
        {/* Text Formatting */}
        <button
          onClick={() => applyFormat('bold')}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors border border-gray-200"
          title="Bold"
          type="button"
        >
          <span className="font-bold text-base text-black">B</span>
        </button>
        <button
          onClick={() => applyFormat('italic')}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors border border-gray-200"
          title="Italic"
          type="button"
        >
          <span className="italic text-base text-black">i</span>
        </button>
        <button
          onClick={() => applyFormat('strikeThrough')}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors border border-gray-200"
          title="Strikethrough"
          type="button"
        >
          <span className="line-through text-base text-black">S</span>
        </button>

        <div className="w-px h-7 bg-gray-300 mx-2" />

        {/* Headings */}
        <button
          onClick={() => insertHeading(1)}
          className="px-3 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm font-semibold text-black border border-gray-200"
          title="Heading 1"
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => insertHeading(2)}
          className="px-3 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-sm font-semibold text-black border border-gray-200"
          title="Heading 2"
          type="button"
        >
          H2
        </button>

        <div className="w-px h-7 bg-gray-300 mx-2" />

        {/* Lists */}
        <button
          onClick={() => insertList(false)}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-black border border-gray-200"
          title="Bullet List"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <circle cx="3" cy="6" r="1" fill="currentColor"></circle>
            <circle cx="3" cy="12" r="1" fill="currentColor"></circle>
            <circle cx="3" cy="18" r="1" fill="currentColor"></circle>
          </svg>
        </button>
        <button
          onClick={() => insertList(true)}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-black border border-gray-200"
          title="Numbered List"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>

        <div className="w-px h-7 bg-gray-300 mx-2" />

        {/* Link */}
        <button
          onClick={insertLink}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-black border border-gray-200"
          title="Insert Link"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>

        {/* Code */}
        <button
          onClick={() => applyFormat('formatBlock', '<pre>')}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-black border border-gray-200"
          title="Code Block"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
      </div>

      {/* Rich Text Editor */}
      <div style={{ position: 'relative' }}>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={handleKeyUp}
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

        {/* Mention Menu (Attachments & Users) */}
        {showAttachmentMenu && (
          <div
            className="absolute bg-white border border-gray-300 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto z-[10000]"
            style={{
              top: `${attachmentMenuPosition.top}px`,
              left: `${attachmentMenuPosition.left}px`,
              minWidth: '200px',
              maxWidth: '300px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2"
                  onClick={() => insertAttachmentReference(item)}
                  type="button"
                >
                  {item.type === 'collaborator' ? (
                    <>
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.initials}
                      </div>
                      <span className="text-sm text-gray-900 truncate flex-1">
                        {item.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium uppercase flex-shrink-0">
                        {item.displayType}
                      </span>
                      <span className="text-sm text-gray-900 truncate flex-1">
                        {item.name}
                      </span>
                    </>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No users or attachments found
              </div>
            )}
          </div>
        )}
      </div>
    </NodePopup>,
    document.body
  );
}

NotesPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  notes: PropTypes.string,
  attachments: PropTypes.arrayOf(PropTypes.object),
  collaborators: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
