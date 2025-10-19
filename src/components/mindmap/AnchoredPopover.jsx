import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

const AnchoredPopover = ({ anchorEl, onClose, width = 280, children, className = '' }) => {
  const containerRef = useRef(null);

  const getRect = () => {
    if (!anchorEl) return null;
    try { return anchorEl.getBoundingClientRect(); } catch { return null; }
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const rect = getRect();
  if (!rect) return null;

  const style = {
    position: 'fixed',
    left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
    top: Math.max(8, rect.bottom + 8),
    zIndex: 5000,
    width: `${width}px`
  };

  return createPortal(
    <dialog ref={containerRef} open className={`node-popup bg-white rounded-xl border border-gray-200 shadow-xl p-3 ${className}`} style={style}>
      {children}
    </dialog>,
    document.body
  );
};

AnchoredPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  width: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default AnchoredPopover;
