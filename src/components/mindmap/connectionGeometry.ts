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
 * Intelligently chooses start point on parent node to create smoothest path to child.
 */
export function computeBezierPath(fromRect: Rect, toRect: Rect) {
  // End at middle-left of child node
  const childCenterX = (toRect.left + toRect.right) / 2;
  const childCenterY = (toRect.top + toRect.bottom) / 2;
  const end = {
    x: toRect.left,
    y: childCenterY
  };
  
  // Determine best starting edge based on child position relative to parent
  const parentCenterX = (fromRect.left + fromRect.right) / 2;
  const parentCenterY = (fromRect.top + fromRect.bottom) / 2;
  
  const dx = childCenterX - parentCenterX;
  const dy = childCenterY - parentCenterY;
  
  let start;
  
  // Choose the edge that points most directly toward the child
  // This creates natural, smooth curves
  if (Math.abs(dx) > Math.abs(dy)) {
    // Child is more horizontal from parent - use right edge
    // Position varies along the edge based on child's Y
    const startY = parentCenterY + (dy * 0.7); // 70% of the way toward child's Y
    start = {
      x: fromRect.right,
      y: Math.max(fromRect.top + 15, Math.min(fromRect.bottom - 15, startY))
    };
  } else if (dy > 0) {
    // Child is below parent - start from bottom edge
    const startX = parentCenterX + (dx * 0.5); // Shift X toward child
    start = {
      x: Math.max(fromRect.left + 15, Math.min(fromRect.right - 15, startX)),
      y: fromRect.bottom
    };
  } else {
    // Child is above parent - start from top edge
    const startX = parentCenterX + (dx * 0.5); // Shift X toward child
    start = {
      x: Math.max(fromRect.left + 15, Math.min(fromRect.right - 15, startX)),
      y: fromRect.top
    };
  }

  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  
  // Create gentle, direct curves
  // Reduce curvature for cleaner, more direct connections
  const horizontalOffset = Math.abs(deltaX) * 0.4; // Use 40% of horizontal distance (reduced from 60%)
  const verticalOffset = Math.abs(deltaY) * 0.15; // Minimal vertical offset (reduced from 30%)
  
  // First control point - gentle curve from start
  const c1x = start.x + horizontalOffset;
  const c1y = start.y + (deltaY > 0 ? verticalOffset : -verticalOffset);
  
  // Second control point - gentle curve to end
  const c2x = end.x - horizontalOffset;
  const c2y = end.y - (deltaY > 0 ? verticalOffset : -verticalOffset);

  const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
  const label = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

  return { d, start, end, label };
}
