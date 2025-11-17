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
        className="node-toolbar-btn p-2 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors duration-200 border border-emerald-200 hover:border-emerald-300"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        title={title}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
          <polyline points="4 7 4 4 20 4 20 7"></polyline>
          <line x1="9" y1="20" x2="15" y2="20"></line>
          <line x1="12" y1="4" x2="12" y2="20"></line>
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
