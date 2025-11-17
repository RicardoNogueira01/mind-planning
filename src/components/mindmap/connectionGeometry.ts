export type Rect = { left: number; top: number; right: number; bottom: number };

export function getRectCenter(rect: Rect) {
  return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

/**
 * Compute the intersection point on a rectangle's perimeter for a ray from the rect center to target.
 * Mirrors the logic previously embedded in MindMap.jsx.
 */
export function getPerimeterPoint(rect: Rect, targetX: number, targetY: number) {
  const cx = (rect.left + rect.right) / 2;
  const cy = (rect.top + rect.bottom) / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;

  // Handle case where target is the center of the rect
  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }

  const slope = dy / dx;
  const absSlope = Math.abs(slope);
  
  let x, y;

  // Determine which edge the line intersects based on slope
  if (absSlope < height / width) {
    // Intersects with left or right edge (more horizontal)
    if (dx > 0) {
      // Right edge
      x = rect.right;
      y = cy + (width / 2) * slope;
    } else {
      // Left edge
      x = rect.left;
      y = cy + (width / 2) * slope;  // Fixed: removed incorrect negation
    }
  } else {
    // Intersects with top or bottom edge (more vertical)
    if (dy > 0) {
      // Bottom edge
      y = rect.bottom;
      x = cx + (height / 2) / slope;
    } else {
      // Top edge
      y = rect.top;
      x = cx + (height / 2) / slope;
    }
  }

  // Clamp values to be within the rectangle's bounds
  x = Math.max(rect.left, Math.min(rect.right, x));
  y = Math.max(rect.top, Math.min(rect.bottom, y));

  return { x, y };
}

/**
 * Compute a smooth cubic bezier path between two rectangles. Returns the path d string,
 * start/end points, and a suggested label position (midpoint of start and end).
 * Creates smooth, curved connections that route around nodes for clean, professional appearance.
 * Supports distributed connection points for polished visual hierarchy.
 */
export function computeBezierPath(
  fromRect: Rect, 
  toRect: Rect,
  options?: { childIndex?: number; totalChildren?: number; parentId?: string }
) {
  const fromCenterX = (fromRect.left + fromRect.right) / 2;
  const fromCenterY = (fromRect.top + fromRect.bottom) / 2;
  const toCenterX = (toRect.left + toRect.right) / 2;
  const toCenterY = (toRect.top + toRect.bottom) / 2;
  
  // Step 1: Determine the optimal connection point on the CHILD based on parent's position
  let childConnectionX, childConnectionY;
  
  if (fromCenterX < toRect.left) {
    // Parent is to the left - connect to child's left edge
    childConnectionX = toRect.left;
    childConnectionY = toCenterY;
  } else if (fromCenterX > toRect.right) {
    // Parent is to the right - connect to child's right edge
    childConnectionX = toRect.right;
    childConnectionY = toCenterY;
  } else if (fromCenterY < toRect.top) {
    // Parent is above - connect to child's top edge
    childConnectionX = toCenterX;
    childConnectionY = toRect.top;
  } else if (fromCenterY > toRect.bottom) {
    // Parent is below - connect to child's bottom edge
    childConnectionX = toCenterX;
    childConnectionY = toRect.bottom;
  } else {
    // Parent overlaps child - use center
    childConnectionX = toCenterX;
    childConnectionY = toCenterY;
  }
  
  // Step 2: Find where on parent to connect FROM
  // If distribution info provided, spread connections vertically along parent's right edge
  let start: { x: number; y: number };
  
  if (options?.childIndex !== undefined && options?.totalChildren !== undefined && options.totalChildren > 1) {
    // Distribute connection points evenly along the parent's right edge
    const parentHeight = fromRect.bottom - fromRect.top;
    const spacing = parentHeight / (options.totalChildren + 1);
    const offsetY = spacing * (options.childIndex + 1);
    
    start = {
      x: fromRect.right,
      y: fromRect.top + offsetY
    };
  } else {
    // Fallback: use child's position to determine parent exit point
    start = getPerimeterPoint(fromRect, toCenterX, toCenterY);
  }
  
  // Step 3: Use the child connection point we determined (don't recalculate)
  const end = { x: childConnectionX, y: childConnectionY };
  
  // Create smooth, natural Bezier curves that flow elegantly
  // Control points create gentle curves without awkward bending
  let c1x, c1y, c2x, c2y;
  
  const horizontalDistance = Math.abs(end.x - start.x);
  const verticalDistance = Math.abs(end.y - start.y);
  
  if (toRect.left > fromRect.right + 10) {
    // Target is to the right - create smooth rightward flow
    // Control points extend horizontally for natural curve
    const controlDistance = Math.min(horizontalDistance * 0.6, 150);
    
    c1x = start.x + controlDistance;
    c1y = start.y;
    c2x = end.x - controlDistance;
    c2y = end.y;
  } else if (toRect.right < fromRect.left - 10) {
    // Target is to the left - create smooth leftward flow
    const controlDistance = Math.min(horizontalDistance * 0.6, 150);
    
    c1x = start.x - controlDistance;
    c1y = start.y;
    c2x = end.x + controlDistance;
    c2y = end.y;
  } else {
    // Nodes are vertically aligned - use vertical curves
    const controlDistance = Math.min(verticalDistance * 0.6, 100);
    
    c1x = start.x;
    c1y = start.y + (end.y > start.y ? controlDistance : -controlDistance);
    c2x = end.x;
    c2y = end.y - (end.y > start.y ? controlDistance : -controlDistance);
  }
  
  const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
  
  // Suggest a label position at the midpoint of the curve
  const label = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
  
  return { d, start, end, label };
}
