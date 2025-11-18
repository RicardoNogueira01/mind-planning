import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import NodePopup from '../mindmap/NodePopup';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', 
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😜', '😛', '😲', '😮', '😯', '😨', '😰', '😢', '😭', '😱',
  '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
  '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻',
  '👽', '👾', '🤖'
];

export default function EmojiPicker({ show, anchorRef, onSelect, onClose }) {
  if (!show) return null;

  const rect = anchorRef?.current?.getBoundingClientRect() || 
    { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
  
  const popupWidth = 280;
  const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
  const top = Math.max(8, rect.bottom + 20);

  return createPortal(
    <NodePopup
      position={{ left, top }}
      width={popupWidth}
      maxHeight="400px"
      onClose={onClose}
      style={{ padding: '8px' }}
    >
      <div className="grid grid-cols-6 gap-1">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            className="p-1 text-lg hover:bg-gray-100 rounded cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(emoji);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </NodePopup>,
    document.body
  );
}

EmojiPicker.propTypes = {
  show: PropTypes.bool.isRequired,
  anchorRef: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
