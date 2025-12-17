import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import GridColorPicker from '../GridColorPicker';

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
        className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        title={title}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ shapeRendering: 'crispEdges' }}>
          <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"></path>
          <path d="m5 2 5 5"></path>
          <path d="M2 13h15"></path>
          <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"></path>
        </svg>
      </button>

      {isOpen && createPortal(
        <GridColorPicker
          currentColor={currentColor || '#FFFFFF'}
          onColorSelect={(color) => onSelect(color)}
          onClose={onClose}
          anchorRect={getAnchorRect()}
          title="Background Color"
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
