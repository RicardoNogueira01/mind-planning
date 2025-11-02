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
 * Connects from right edge of parent to middle-left of child with horizontal curves.
 * Start point is distributed along the parent's right edge based on child's vertical position.
 */
export function computeBezierPath(fromRect: Rect, toRect: Rect) {
  // End at middle-left of child node
  const childCenterY = (toRect.top + toRect.bottom) / 2;
  const end = {
    x: toRect.left,
    y: childCenterY
  };
  
  // Start from right edge of parent, but Y position depends on where child is
  // Clamp the Y position to stay within parent's bounds (with some padding)
  const parentTop = fromRect.top + 10; // 10px padding from top
  const parentBottom = fromRect.bottom - 10; // 10px padding from bottom
  const startY = Math.max(parentTop, Math.min(parentBottom, childCenterY));
  
  const start = {
    x: fromRect.right,
    y: startY
  };

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // Create horizontal bezier curves that route around nodes
  // Use a large fixed offset to ensure curves don't overlap with other nodes
  const minHorizontalOffset = 100; // Minimum offset to route around nodes
  const horizontalOffset = Math.max(Math.abs(dx) * 0.6, minHorizontalOffset);
  
  // For vertical spacing, add offset proportional to the vertical distance
  // This creates smoother curves when nodes are far apart vertically
  const verticalOffset = Math.abs(dy) * 0.3;
  
  // First control point - extends far to the right and slightly toward target Y
  const c1x = start.x + horizontalOffset;
  const c1y = start.y + (dy > 0 ? verticalOffset : -verticalOffset);
  
  // Second control point - extends far to the left and slightly toward target Y
  const c2x = end.x - horizontalOffset;
  const c2y = end.y - (dy > 0 ? verticalOffset : -verticalOffset);

  const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
  const label = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

  return { d, start, end, label };
}
