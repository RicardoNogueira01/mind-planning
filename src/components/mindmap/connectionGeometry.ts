export type Rect = { left: number; top: number; right: number; bottom: number };

export function getRectCenter(rect: Rect) {
  return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

/**
 * Compute the intersection point on a rectangle's perimeter for a ray from the rect center to target.
 * Mirrors the logic previously embedded in MindMap.jsx.
 */
export function getPerimeterPoint(rect: Rect, targetX: number, targetY: number) {
  const rectCenterX = (rect.left + rect.right) / 2;
  const rectCenterY = (rect.top + rect.bottom) / 2;
  const angle = Math.atan2(targetY - rectCenterY, targetX - rectCenterX);

  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const absAngle = Math.abs(angle);
  const cornerAngle = Math.atan2(halfHeight, halfWidth);

  let x: number, y: number;

  if (absAngle <= cornerAngle) {
    // Right edge
    x = rect.right;
    y = rectCenterY + halfWidth * Math.tan(angle);
  } else if (absAngle <= Math.PI - cornerAngle) {
    // Top or bottom edge
    if (angle > 0) {
      // Bottom edge
      x = rectCenterX + halfHeight / Math.tan(angle);
      y = rect.bottom;
    } else {
      // Top edge
      x = rectCenterX - halfHeight / Math.tan(angle);
      y = rect.top;
    }
  } else {
    // Left edge
    x = rect.left;
    y = rectCenterY + halfWidth * Math.tan(Math.PI - absAngle) * (angle > 0 ? -1 : 1);
  }

  // Clamp to bounds
  x = Math.max(rect.left, Math.min(rect.right, x));
  y = Math.max(rect.top, Math.min(rect.bottom, y));

  return { x, y };
}

/**
 * Compute a smooth cubic bezier path between two rectangles. Returns the path d string,
 * start/end points, and a suggested label position (midpoint of start and end).
 */
export function computeBezierPath(fromRect: Rect, toRect: Rect) {
  const fromCenter = getRectCenter(fromRect);
  const toCenter = getRectCenter(toRect);

  const start = getPerimeterPoint(fromRect, toCenter.x, toCenter.y);
  const end = getPerimeterPoint(toRect, fromCenter.x, fromCenter.y);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  // Vertical bias as in MindMap.jsx
  // const controlDistance = Math.min(distance * 0.4, 120); // retained variable for parity if needed later
  const verticalBias = Math.sign(dy) * Math.min(Math.abs(dy) * 0.15, 60);
  const c1x = start.x + dx * 0.25;
  const c1y = start.y + dy * 0.2 - verticalBias * 0.3;
  const c2x = end.x - dx * 0.25;
  const c2y = end.y - dy * 0.2 + verticalBias * 0.3;

  const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
  const label = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

  return { d, start, end, label };
}
