import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import RoundColorPicker from '../RoundColorPicker';

const NodeToolbarBackgroundColor = ({
  isOpen,
  currentColor,
  onToggle,
  onSelect,
  onClose,
  title = 'Background color',
}) => {
  const btnRef = useRef(null);

  const getAnchorRect = () => {
    const anchor = btnRef.current;
    if (!anchor) {
      return { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };
    }
    return anchor.getBoundingClientRect();
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        className="node-toolbar-btn p-2 rounded-xl hover:bg-white/60 text-gray-700 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        title={title}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <path d="M3 9h18"></path>
        </svg>
      </button>

      {isOpen && createPortal(
        <RoundColorPicker
          currentColor={currentColor || '#FFFFFF'}
          onColorSelect={(color) => onSelect(color)}
          onClose={onClose}
          anchorRect={getAnchorRect()}
        />,
        document.body
      )}
    </div>
  );
};

NodeToolbarBackgroundColor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  currentColor: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default NodeToolbarBackgroundColor;
