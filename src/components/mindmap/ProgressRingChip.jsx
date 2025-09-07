import React from 'react';
import PropTypes from 'prop-types';

/**
 * ProgressRingChip draws a small percentage ring used on parent nodes.
 */
export default function ProgressRingChip({ pct = 0, isDarkMode = false, shapeType, completed = false }) {
  const size = 22;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const baseFill = (!shapeType || shapeType === 'default') ? (isDarkMode ? '#111827' : '#ffffff') : 'transparent';
  return (
    <div style={{ position: 'absolute', top: 6, left: 6 }} title={`${pct}% complete`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeWidth={stroke} fill={baseFill} />
        <circle cx={size/2} cy={size/2} r={r} stroke={completed ? '#10b981' : '#3b82f6'} strokeWidth={stroke} fill="transparent" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
    </div>
  );
}

ProgressRingChip.propTypes = {
  pct: PropTypes.number,
  isDarkMode: PropTypes.bool,
  shapeType: PropTypes.string,
  completed: PropTypes.bool,
};
