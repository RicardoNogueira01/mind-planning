import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import RoundColorPicker from '../RoundColorPicker';

const NodeToolbarFontColor = ({
  isOpen,
  currentColor,
  onToggle,
  onSelect,
  onClose,
  title = 'Font color',
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
        {/* A simple 'A' icon representing text color */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16" />
          <path d="M6 20l6-16 6 16" />
          <path d="M8 14h8" />
        </svg>
      </button>

      {isOpen && createPortal(
        <RoundColorPicker
          currentColor={currentColor || '#111827'}
          onColorSelect={(color) => onSelect(color)}
          onClose={onClose}
          anchorRect={getAnchorRect()}
        />,
        document.body
      )}
    </div>
  );
};

NodeToolbarFontColor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  currentColor: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default NodeToolbarFontColor;
