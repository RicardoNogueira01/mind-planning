import React from 'react';
import PropTypes from 'prop-types';

const NodeToolbarConnectionButton = ({
  nodeId,
  isActive,
  onStart,
  onCancel,
}) => {
  const base = 'node-toolbar-btn p-2 rounded-xl transition-colors duration-200 border';
  const stateCls = isActive
    ? ' bg-blue-100 text-blue-700 border-blue-300'
    : ' hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300';

  return (
    <button
      className={`${base}${stateCls}`}
      onClick={(e) => {
        e.stopPropagation();
        if (isActive) onCancel();
        else onStart(nodeId, e);
      }}
      title={isActive ? 'Cancel connection mode' : 'Create connection to another node'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{shapeRendering: 'crispEdges'}}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    </button>
  );
};

NodeToolbarConnectionButton.propTypes = {
  nodeId: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onStart: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default NodeToolbarConnectionButton;
