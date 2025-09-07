import React from 'react';
import PropTypes from 'prop-types';

/**
 * NodeToolbarLayout
 * Root-only layout switcher button with popup. Parent passes ref, toggler, and popup renderer.
 */
export default function NodeToolbarLayout({
  shouldRender,
  layoutBtnRef,
  onToggleLayout,
  renderLayoutPopup,
}) {
  if (!shouldRender) return null;
  return (
    <div className="relative">
      <button
        ref={layoutBtnRef}
        className="node-toolbar-btn p-2 rounded-xl hover:bg-blue-100 text-blue-700 transition-colors duration-200 border border-blue-200 hover:border-blue-300"
        onClick={onToggleLayout}
        title="Change layout"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </button>
      {renderLayoutPopup?.()}
    </div>
  );
}

NodeToolbarLayout.propTypes = {
  shouldRender: PropTypes.bool,
  layoutBtnRef: PropTypes.any,
  onToggleLayout: PropTypes.func,
  renderLayoutPopup: PropTypes.func,
};
