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
  // Smart distribution: spread out connections for visual clarity
  let start: { x: number; y: number };
  
  // Determine which edge of the parent to use based on child position
  // Priority: Check vertical position first (above/below), then horizontal (left/right)
  const isChildAbove = toCenterY < fromRect.top;            // Above parent top edge
  const isChildBelow = toCenterY > fromRect.bottom;         // Below parent bottom edge
  const isChildToLeft = toCenterX < fromRect.left - 50;     // At least 50px to the left
  const isChildToRight = toCenterX > fromRect.right + 50;   // At least 50px to the right
  
  // Always distribute connections based on child position for clean fan-out
  const shouldDistribute = options?.totalChildren !== undefined && 
                           options.totalChildren > 1;
  
  if (shouldDistribute && options?.childIndex !== undefined) {
    // ========== DISTRIBUTE MODE ==========
    // Spread connection points across parent's edge based on child positions
    
    if (isChildAbove) {
      // Children are ABOVE → spread horizontally along parent's TOP edge
      const connectionX = Math.max(
        fromRect.left + 40,
        Math.min(fromRect.right - 40, toCenterX)
      );
      start = { x: connectionX, y: fromRect.top + 40 };
      
    } else if (isChildBelow) {
      // Children are BELOW → spread horizontally along parent's BOTTOM edge
      const connectionX = Math.max(
        fromRect.left + 40,
        Math.min(fromRect.right - 40, toCenterX)
      );
      start = { x: connectionX, y: fromRect.bottom - 40 };
    
    } else if (isChildToRight) {
      // Children are to the RIGHT → spread connections across FULL edge height
      const parentTop = fromRect.top;
      const parentBottom = fromRect.bottom;
      const parentCenter = (parentTop + parentBottom) / 2;
      const parentHeight = parentBottom - parentTop;
      const usableHeight = parentHeight - 20; // 10px margin top and bottom
      
      // Define the range of children Y positions we expect
      const spreadFactor = 2.0; // Children can spread 2x parent height
      const minExpectedChildY = parentCenter - (parentHeight * spreadFactor / 2);
      const maxExpectedChildY = parentCenter + (parentHeight * spreadFactor / 2);
      
      // Clamp child Y to expected range
      const clampedChildY = Math.max(minExpectedChildY, Math.min(maxExpectedChildY, toCenterY));
      
      // Map child's Y position to connection point on parent's edge (0 to 1)
      const ratio = (clampedChildY - minExpectedChildY) / (parentHeight * spreadFactor);
      
      // Apply ratio to full usable height of parent's edge
      const connectionY = parentTop + 10 + (ratio * usableHeight);
      
      start = { x: fromRect.right - 40, y: connectionY };
      
    } else if (isChildToLeft) {
      // Children are to the LEFT → spread connections across FULL edge height
      const parentTop = fromRect.top;
      const parentBottom = fromRect.bottom;
      const parentCenter = (parentTop + parentBottom) / 2;
      const parentHeight = parentBottom - parentTop;
      const usableHeight = parentHeight - 20; // 10px margin top and bottom
      
      // Define the range of children Y positions we expect
      const spreadFactor = 2.0; // Children can spread 2x parent height
      const minExpectedChildY = parentCenter - (parentHeight * spreadFactor / 2);
      const maxExpectedChildY = parentCenter + (parentHeight * spreadFactor / 2);
      
      // Clamp child Y to expected range
      const clampedChildY = Math.max(minExpectedChildY, Math.min(maxExpectedChildY, toCenterY));
      
      // Map child's Y position to connection point on parent's edge (0 to 1)
      const ratio = (clampedChildY - minExpectedChildY) / (parentHeight * spreadFactor);
      
      // Apply ratio to full usable height of parent's edge
      const connectionY = parentTop + 10 + (ratio * usableHeight);
      
      start = { x: fromRect.left + 40, y: connectionY };
      
    } else {
      // Child is in the "neutral zone" - use the edge closest to the child
      // This handles cases where children are slightly off-center
      const distToBottom = Math.abs(toCenterY - fromRect.bottom);
      const distToTop = Math.abs(toCenterY - fromRect.top);
      const distToRight = Math.abs(toCenterX - fromRect.right);
      const distToLeft = Math.abs(toCenterX - fromRect.left);
      
      const minDist = Math.min(distToBottom, distToTop, distToRight, distToLeft);
      
      if (minDist === distToBottom) {
        // Use bottom edge (inset) - align with child's horizontal position
        const connectionX = Math.max(
          fromRect.left + 40,
          Math.min(fromRect.right - 40, toCenterX)
        );
        start = { x: connectionX, y: fromRect.bottom - 40 };
      } else if (minDist === distToTop) {
        // Use top edge (inset) - align with child's horizontal position
        const connectionX = Math.max(
          fromRect.left + 40,
          Math.min(fromRect.right - 40, toCenterX)
        );
        start = { x: connectionX, y: fromRect.top + 40 };
      } else {
        // Fallback to perimeter point
        start = getPerimeterPoint(fromRect, toCenterX, toCenterY);
      }
    }
  } else {
    // ========== GROUP MODE ==========
    // All connections share a single point (>10 children or no distribution info)
    start = getPerimeterPoint(fromRect, toCenterX, toCenterY);
  }
  
  // ============================================================
  // STEP 3: Create smooth Bezier curve with adaptive control points
  // ============================================================
  // Use the child connection point determined in Step 1 (don't recalculate)
  const end = { x: childConnectionX, y: childConnectionY };
  
  // Bezier control points create the curve's "flow"
  // Create elegant curves with a "belly" - go straight first, then curve
  let c1x, c1y, c2x, c2y;
  
  const horizontalDistance = end.x - start.x; // Signed distance
  const verticalDistance = end.y - start.y;   // Signed distance
  const absHorizontal = Math.abs(horizontalDistance);
  const absVertical = Math.abs(verticalDistance);
  
  // For right-side children (fan-out), use gentle curve with horizontal start
  if (horizontalDistance > 10) {
    // RIGHT SIDE: Go straight horizontally first, then curve to target
    const straightDistance = absHorizontal * 0.5; // Go straight for 50% of distance
    
    c1x = start.x + straightDistance;  // Move right, staying horizontal
    c1y = start.y;                     // Stay at connection height (horizontal)
    c2x = end.x - (absHorizontal * 0.2); // Approach from left with gentle curve
    c2y = end.y;                       // At target height
    
  } else if (horizontalDistance < -10) {
    // LEFT SIDE: Mirror of right side
    const curveDistance = absHorizontal * 0.4;
    
    c1x = start.x - curveDistance;
    c1y = start.y;
    c2x = end.x + curveDistance;
    c2y = end.y;
    
  } else if (verticalDistance < -20) {
    // UPWARD: Smooth vertical curve
    const curveDistance = absVertical * 0.4;
    
    c1x = start.x;
    c1y = start.y - curveDistance;
    c2x = end.x;
    c2y = end.y + curveDistance;
    
  } else if (verticalDistance > 20) {
    // DOWNWARD: Smooth vertical curve
    const curveDistance = absVertical * 0.4;
    
    c1x = start.x;
    c1y = start.y + curveDistance;
    c2x = end.x;
    c2y = end.y - curveDistance;
    
  } else {
    // NEARLY STRAIGHT: Nodes are very close - simple S-curve
    const controlDistance = Math.min(Math.max(absVertical, absHorizontal) * 0.4, 60);
    c1x = start.x;
    c1y = start.y + Math.sign(verticalDistance) * controlDistance;
    c2x = end.x;
    c2y = end.y - Math.sign(verticalDistance) * controlDistance;
  }
  
  // Construct SVG path string
  // Format: M (move to start) C (cubic bezier with 2 control points) to end
  const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
  
  // Calculate label position at midpoint (useful for connection labels/icons)
  const label = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
  
  return { d, start, end, label };
}
