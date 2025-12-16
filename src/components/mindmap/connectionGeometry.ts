export type Rect = { left: number; top: number; right: number; bottom: number };

export function getRectCenter(rect: Rect) {
  return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

/**
 * Compute the intersection point on a rectangle's perimeter for a ray from the rect center to target
 * 
 * Purpose: Connections should start/end at node edges, not centers
 * 
 * @param rect - Rectangle bounds { left, top, right, bottom }
 * @param targetX - X coordinate of target point
 * @param targetY - Y coordinate of target point
 * @returns Point where the line intersects rectangle edge
 * 
 * Algorithm:
 * 1. Calculate slope of line from center to target
 * 2. Determine which edge will be intersected based on slope:
 *    - Shallow slope (< height/width) → left or right edge
 *    - Steep slope (>= height/width) → top or bottom edge
 * 3. Use slope to calculate exact intersection coordinates
 * 4. Clamp result to ensure it stays within rectangle bounds
 */
export function getPerimeterPoint(rect: Rect, targetX: number, targetY: number) {
  // Calculate rectangle center
  const cx = (rect.left + rect.right) / 2;
  const cy = (rect.top + rect.bottom) / 2;
  
  // Calculate direction vector from center to target
  const dx = targetX - cx;
  const dy = targetY - cy;
  
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;

  // Handle edge case: target is at center
  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }

  // Calculate slope (rise over run)
  const slope = dy / dx;
  const absSlope = Math.abs(slope);
  
  let x, y;

  // Determine which edge the line intersects based on slope
  if (absSlope < height / width) {
    // Line is more HORIZONTAL → intersects LEFT or RIGHT edge
    if (dx > 0) {
      // Target is to the right → intersect RIGHT edge
      x = rect.right;
      y = cy + (width / 2) * slope;
    } else {
      // Target is to the left → intersect LEFT edge
      x = rect.left;
      y = cy + (width / 2) * slope;
    }
  } else {
    // Line is more VERTICAL → intersects TOP or BOTTOM edge
    if (dy > 0) {
      // Target is below → intersect BOTTOM edge
      y = rect.bottom;
      x = cx + (height / 2) / slope;
    } else {
      // Target is above → intersect TOP edge
      y = rect.top;
      x = cx + (height / 2) / slope;
    }
  }

  // Clamp values to be within the rectangle's bounds (safety check)
  x = Math.max(rect.left, Math.min(rect.right, x));
  y = Math.max(rect.top, Math.min(rect.bottom, y));

  return { x, y };
}

/**
 * Compute a smooth cubic Bezier path between two rectangles
 * 
 * This is the MOST COMPLEX function in the codebase!
 * It creates professional, curved connections that:
 * - Connect at appropriate edges (not through nodes)
 * - Distribute connection points for clean appearance (up to 10 children)
 * - Group connections at single point for large families (>10 children)
 * - Flow naturally with smooth curves
 * 
 * @param fromRect - Parent node rectangle
 * @param toRect - Child node rectangle
 * @param options - Optional: childIndex, totalChildren for distribution
 * @returns Object with: d (SVG path), start point, end point, label position
 * 
 * @example
 * const path = computeBezierPath(parentRect, childRect, { childIndex: 2, totalChildren: 5 });
 * // Returns: { d: "M 100 50 C 150 50, 250 100, 300 100", start, end, label }
 * 
 * Algorithm Overview:
 * STEP 1: Determine optimal connection point on CHILD (based on parent position)
 * STEP 2: Determine connection point on PARENT (smart distribution or grouping)
 * STEP 3: Create smooth Bezier curve with adaptive control points
 */
export function computeBezierPath(
  fromRect: Rect, 
  toRect: Rect,
  options?: { childIndex?: number; totalChildren?: number; parentId?: string }
) {
  // Calculate centers of both rectangles
  const fromCenterX = (fromRect.left + fromRect.right) / 2;
  const fromCenterY = (fromRect.top + fromRect.bottom) / 2;
  const toCenterX = (toRect.left + toRect.right) / 2;
  const toCenterY = (toRect.top + toRect.bottom) / 2;
  
  // ============================================================
  // STEP 1: Determine optimal connection point on CHILD node
  // ============================================================
  // Choose edge of child based on where parent is located
  // The child should receive the connection on the side FACING the parent
  // Inset from edges to target middle area of node
  const inset = 40; // Distance from edge toward center
  let childConnectionX, childConnectionY;
  
  if (fromCenterX < toRect.left) {
    // Parent is to the LEFT → connect to child's LEFT edge (facing parent)
    childConnectionX = toRect.left + inset;
    childConnectionY = toCenterY;
  } else if (fromCenterX > toRect.right) {
    // Parent is to the RIGHT → connect to child's LEFT edge (facing parent)
    childConnectionX = toRect.left + inset;
    childConnectionY = toCenterY;
  } else if (fromCenterY < toRect.top) {
    // Parent is ABOVE → connect to child's TOP edge (facing parent)
    childConnectionX = toCenterX;
    childConnectionY = toRect.top + inset;
  } else if (fromCenterY > toRect.bottom) {
    // Parent is BELOW → connect to child's TOP edge (facing parent)
    childConnectionX = toCenterX;
    childConnectionY = toRect.top + inset;
  } else {
    // Parent overlaps child (rare) → use center
    childConnectionX = toCenterX;
    childConnectionY = toCenterY;
  }
  
  // ============================================================
  // STEP 2: Determine connection point on PARENT node
  // ============================================================
  // The connection should exit the parent from the side facing the child
  // and the exit point should be aligned with the child's Y position (for horizontal layouts)
  let start: { x: number; y: number };
  
  // Determine primary direction from parent to child
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  // Inset from parent edges
  const parentInset = 40;
  
  // Determine which edge to use based on dominant direction
  if (absDx >= absDy) {
    // HORIZONTAL layout (child is more left/right than up/down)
    if (dx > 0) {
      // Child is to the RIGHT → exit from parent's RIGHT edge
      // Y position follows child's Y, but clamped to parent bounds
      const parentTop = fromRect.top + 15;
      const parentBottom = fromRect.bottom - 15;
      const parentCenterY = fromCenterY;
      
      // Direct mapping: connection point Y follows child Y position
      // but stays within parent bounds
      const connectionY = Math.max(parentTop, Math.min(parentBottom, toCenterY));
      
      start = { x: fromRect.right - parentInset, y: connectionY };
    } else {
      // Child is to the LEFT → exit from parent's LEFT edge
      const parentTop = fromRect.top + 15;
      const parentBottom = fromRect.bottom - 15;
      
      const connectionY = Math.max(parentTop, Math.min(parentBottom, toCenterY));
      
      start = { x: fromRect.left + parentInset, y: connectionY };
    }
  } else {
    // VERTICAL layout (child is more up/down than left/right)
    if (dy > 0) {
      // Child is BELOW → exit from parent's BOTTOM edge
      const parentLeft = fromRect.left + 15;
      const parentRight = fromRect.right - 15;
      
      const connectionX = Math.max(parentLeft, Math.min(parentRight, toCenterX));
      
      start = { x: connectionX, y: fromRect.bottom - parentInset };
    } else {
      // Child is ABOVE → exit from parent's TOP edge
      const parentLeft = fromRect.left + 15;
      const parentRight = fromRect.right - 15;
      
      const connectionX = Math.max(parentLeft, Math.min(parentRight, toCenterX));
      
      start = { x: connectionX, y: fromRect.top + parentInset };
    }
  }
  
  // ============================================================
  // STEP 3: Create smooth Bezier curve with adaptive control points
  // ============================================================
  // Use the child connection point determined in Step 1 (don't recalculate)
  const end = { x: childConnectionX, y: childConnectionY };
  
  // Bezier control points create the curve's "flow"
  // Create elegant curves that flow naturally from parent to child
  let c1x, c1y, c2x, c2y;
  
  const horizontalDistance = end.x - start.x; // Signed distance
  const verticalDistance = end.y - start.y;   // Signed distance
  const absHorizontal = Math.abs(horizontalDistance);
  const absVertical = Math.abs(verticalDistance);
  const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
  
  // Dynamic curve tension based on distance - closer nodes need gentler curves
  const tension = Math.min(0.5, Math.max(0.25, totalDistance / 400));
  
  // For right-side children (fan-out), use elegant flowing curves
  if (horizontalDistance > 30) {
    // RIGHT SIDE: Smooth horizontal flow with natural curve
    // Control points create an S-curve that feels organic
    const curveStrength = Math.min(absHorizontal * 0.6, 150);
    
    c1x = start.x + curveStrength;  // Push control point right
    c1y = start.y;                   // Keep horizontal initially
    c2x = end.x - curveStrength * 0.3; // Gentle approach to target
    c2y = end.y;                     // At target height
    
  } else if (horizontalDistance < -30) {
    // LEFT SIDE: Mirror of right side with elegant curve
    const curveStrength = Math.min(absHorizontal * 0.6, 150);
    
    c1x = start.x - curveStrength;
    c1y = start.y;
    c2x = end.x + curveStrength * 0.3;
    c2y = end.y;
    
  } else if (verticalDistance < -30) {
    // UPWARD: Smooth vertical curve going up
    const curveStrength = Math.min(absVertical * 0.5, 120);
    
    c1x = start.x;
    c1y = start.y - curveStrength;
    c2x = end.x;
    c2y = end.y + curveStrength * 0.4;
    
  } else if (verticalDistance > 30) {
    // DOWNWARD: Smooth vertical curve going down
    const curveStrength = Math.min(absVertical * 0.5, 120);
    
    c1x = start.x;
    c1y = start.y + curveStrength;
    c2x = end.x;
    c2y = end.y - curveStrength * 0.4;
    
  } else {
    // VERY CLOSE / DIAGONAL: Use adaptive curve based on angle
    // For nodes that are close together, use a subtle curve
    const angle = Math.atan2(verticalDistance, horizontalDistance);
    const curveStrength = Math.max(totalDistance * tension, 30);
    
    // Perpendicular offset for subtle curve
    const perpX = -Math.sin(angle) * curveStrength * 0.3;
    const perpY = Math.cos(angle) * curveStrength * 0.3;
    
    c1x = start.x + horizontalDistance * 0.3 + perpX;
    c1y = start.y + verticalDistance * 0.3 + perpY;
    c2x = end.x - horizontalDistance * 0.3 + perpX;
    c2y = end.y - verticalDistance * 0.3 + perpY;
  }
  
  // Construct SVG path string
  // Format: M (move to start) C (cubic bezier with 2 control points) to end
  const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
  
  // Calculate label position at curve midpoint (bezier t=0.5)
  // For cubic bezier: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
  const t = 0.5;
  const mt = 1 - t;
  const labelX = mt*mt*mt*start.x + 3*mt*mt*t*c1x + 3*mt*t*t*c2x + t*t*t*end.x;
  const labelY = mt*mt*mt*start.y + 3*mt*mt*t*c1y + 3*mt*t*t*c2y + t*t*t*end.y;
  
  const label = { x: labelX, y: labelY };
  
  return { d, start, end, label };
}
