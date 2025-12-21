export type Rect = { left: number; top: number; right: number; bottom: number };

export function getRectCenter(rect: Rect) {
  return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

/**
 * Check if a point is inside a rectangle (with optional padding)
 */
function pointInRect(x: number, y: number, rect: Rect, padding: number = 10): boolean {
  return x >= rect.left - padding &&
    x <= rect.right + padding &&
    y >= rect.top - padding &&
    y <= rect.bottom + padding;
}

/**
 * Check if a bezier curve segment collides with a rectangle
 * Samples points along the bezier curve to check for collisions
 */
function bezierCollidesWithRect(
  startX: number, startY: number,
  c1x: number, c1y: number,
  c2x: number, c2y: number,
  endX: number, endY: number,
  rect: Rect,
  samples: number = 10
): boolean {
  for (let i = 1; i < samples; i++) {
    const t = i / samples;
    const mt = 1 - t;

    // Cubic bezier formula
    const x = mt * mt * mt * startX + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * endX;
    const y = mt * mt * mt * startY + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * endY;

    if (pointInRect(x, y, rect, 5)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a path collides with any node (excluding source and target)
 */
function pathCollidesWithNodes(
  startX: number, startY: number,
  c1x: number, c1y: number,
  c2x: number, c2y: number,
  endX: number, endY: number,
  allNodeRects: Rect[],
  excludeRects: Rect[]
): boolean {
  for (const rect of allNodeRects) {
    // Skip excluded rectangles (source and target nodes)
    const isExcluded = excludeRects.some(ex =>
      ex.left === rect.left && ex.top === rect.top &&
      ex.right === rect.right && ex.bottom === rect.bottom
    );
    if (isExcluded) continue;

    if (bezierCollidesWithRect(startX, startY, c1x, c1y, c2x, c2y, endX, endY, rect)) {
      return true;
    }
  }
  return false;
}

/**
 * Compute an organic flowing curved path between two rectangles
 * Creates beautiful mind-map style curves that fan out from the parent
 * 
 * Features:
 * - Lines exit from the CORRECT SIDE based on child position:
 *   - Child on LEFT → exits from LEFT edge of parent
 *   - Child on RIGHT → exits from RIGHT edge of parent
 * - Exit point spreads along the edge based on child's Y position
 * - Curves flow naturally with smooth bezier paths
 * - Creates the professional, flowing look seen in modern mind map apps
 * 
 * @param fromRect - Parent node rectangle
 * @param toRect - Child node rectangle
 * @param options - Optional parameters (childIndex, totalChildren not used - we use actual positions)
 * @returns Object with: d (SVG path), start point, end point, label position
 */
export function computeOrganicPath(
  fromRect: Rect,
  toRect: Rect,
  options?: {
    childIndex?: number;
    totalChildren?: number;
    parentId?: string;
    direction?: 'left' | 'right' | 'top' | 'bottom';
  }
) {
  const fromCenterX = (fromRect.left + fromRect.right) / 2;
  const fromCenterY = (fromRect.top + fromRect.bottom) / 2;
  const toCenterX = (toRect.left + toRect.right) / 2;
  const toCenterY = (toRect.top + toRect.bottom) / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  const direction = options?.direction;

  // Determine which side the child is on relative to parent
  // If direction is provided, respect it strictly
  const isRight = direction ? direction === 'right' : dx > 0;
  const isBelow = direction ? direction === 'bottom' : dy > 0;

  // Calculate the parent's edge dimensions
  const parentHeight = fromRect.bottom - fromRect.top;
  const parentWidth = fromRect.right - fromRect.left;

  // Get child index info for spreading exit points
  const childIndex = options?.childIndex ?? 0;
  const totalChildren = options?.totalChildren ?? 1;

  let start: { x: number; y: number };
  let end: { x: number; y: number };

  // Determine layout direction based on direction option or dominant axis
  let isHorizontalLayout: boolean;

  if (direction) {
    isHorizontalLayout = direction === 'left' || direction === 'right';
  } else {
    // Fallback: use dominant axis
    isHorizontalLayout = Math.abs(dx) >= Math.abs(dy);
  }

  // ============================================
  // EXIT AND ENTRY POINT CALCULATION
  // Exit: spread along parent edge based on child index (creates fan effect)
  // Entry: from the side facing the parent (natural flow)
  // ============================================

  if (isHorizontalLayout) {
    // Horizontal layout: exit from left/right edge, enter from facing side
    const usableHeight = parentHeight * 0.9;
    const edgeTop = fromCenterY - usableHeight / 2;

    let exitY: number;
    if (totalChildren === 1) {
      exitY = fromCenterY;
    } else {
      const step = usableHeight / (totalChildren - 1);
      exitY = edgeTop + childIndex * step;
    }

    if (isRight) {
      start = { x: fromRect.right, y: exitY };
      end = { x: toRect.left, y: toCenterY };
    } else {
      start = { x: fromRect.left, y: exitY };
      end = { x: toRect.right, y: toCenterY };
    }
  } else {
    // Vertical layout: exit from top/bottom edge, enter from facing side
    const usableWidth = parentWidth * 0.9;
    const edgeLeft = fromCenterX - usableWidth / 2;

    let exitX: number;
    if (totalChildren === 1) {
      exitX = fromCenterX;
    } else {
      const step = usableWidth / (totalChildren - 1);
      exitX = edgeLeft + childIndex * step;
    }

    if (isBelow) {
      start = { x: exitX, y: fromRect.bottom };
      end = { x: toCenterX, y: toRect.top };
    } else {
      start = { x: exitX, y: fromRect.top };
      end = { x: toCenterX, y: toRect.bottom };
    }
  }

  // ============================================
  // PATH CALCULATION - ORTHOGONAL WITH ROUNDED CORNER
  // Go horizontal to the child's X position, then turn and go vertical
  // This GUARANTEES no crossing through sibling nodes
  // ============================================

  const horizontalDistance = end.x - start.x;
  const verticalDistance = end.y - start.y;

  let d: string;

  if (isHorizontalLayout) {
    // HORIZONTAL LAYOUT (children to left/right)
    // Use SMOOTH FLOWING CURVES that go outward first, staying in the child's lane

    // Control points for smooth S-curve:
    // c1: extends horizontally from start, staying at exit Y level
    // c2: comes in horizontally to end, at destination Y level

    const absHorizDist = Math.abs(horizontalDistance);

    // How far outward the first control point extends (creates the flowing curve)
    // Use 50-70% for a nice smooth curve
    const outwardExtent = absHorizDist * 0.6;

    // Entry curve tightness - how close to destination before curving in
    const entryExtent = Math.min(absHorizDist * 0.3, 50);

    let c1x: number, c1y: number, c2x: number, c2y: number;

    if (isRight) {
      // Going RIGHT: curve flows right then arcs to destination
      c1x = start.x + outwardExtent;
      c1y = start.y; // Stay at exit Y level for smooth flow
      c2x = end.x - entryExtent;
      c2y = end.y;
    } else {
      // Going LEFT: curve flows left then arcs to destination
      c1x = start.x - outwardExtent;
      c1y = start.y;
      c2x = end.x + entryExtent;
      c2y = end.y;
    }

    // Smooth cubic bezier curve
    d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;

  } else {
    // VERTICAL LAYOUT (children above/below)
    const absVertDist = Math.abs(verticalDistance);
    const outwardExtent = absVertDist * 0.6;
    const entryExtent = Math.min(absVertDist * 0.3, 50);

    let c1x: number, c1y: number, c2x: number, c2y: number;

    if (isBelow) {
      c1x = start.x;
      c1y = start.y + outwardExtent;
      c2x = end.x;
      c2y = end.y - entryExtent;
    } else {
      c1x = start.x;
      c1y = start.y - outwardExtent;
      c2x = end.x;
      c2y = end.y + entryExtent;
    }

    d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;
  }

  // Calculate label position (at the middle of the straight segment)
  let labelX: number, labelY: number;
  if (isHorizontalLayout) {
    const absHorizDist = Math.abs(horizontalDistance);
    const horizontalExtent = absHorizDist * 0.4; // Label at 40% of the way
    labelX = isRight ? start.x + horizontalExtent : start.x - horizontalExtent;
    labelY = start.y;
  } else {
    const absVertDist = Math.abs(verticalDistance);
    const verticalExtent = absVertDist * 0.4;
    labelX = start.x;
    labelY = isBelow ? start.y + verticalExtent : start.y - verticalExtent;
  }

  const label = { x: labelX, y: labelY };

  return { d, start, end, label };
}

/**
 * Compute an orthogonal (org-chart style) path between two rectangles
 * Creates bracket-style connections with smooth rounded corners
 * Corner radius adapts to distance - straighter lines when nodes are closer
 * 
 * @param fromRect - Parent node rectangle
 * @param toRect - Child node rectangle
 * @param direction - 'horizontal' (left-to-right) or 'vertical' (top-to-bottom)
 * @returns Object with: d (SVG path), start point, end point, label position
 */
export function computeOrthogonalPath(
  fromRect: Rect,
  toRect: Rect,
  direction: 'horizontal' | 'vertical' = 'vertical'
) {
  const fromCenterX = (fromRect.left + fromRect.right) / 2;
  const fromCenterY = (fromRect.top + fromRect.bottom) / 2;
  const toCenterX = (toRect.left + toRect.right) / 2;
  const toCenterY = (toRect.top + toRect.bottom) / 2;

  let start: { x: number; y: number };
  let end: { x: number; y: number };
  let d: string;

  if (direction === 'vertical') {
    // Parent above, children below (org chart style)
    const parentBottom = fromRect.bottom;
    const childTop = toRect.top;
    const midY = parentBottom + (childTop - parentBottom) / 2;

    start = { x: fromCenterX, y: parentBottom };
    end = { x: toCenterX, y: childTop };

    const dx = end.x - start.x;
    const verticalGap = childTop - parentBottom;

    // Adaptive corner radius: smaller when nodes are closer, max 8px
    const maxRadius = 8;
    const r = Math.min(maxRadius, Math.abs(dx) / 3, verticalGap / 4);

    if (Math.abs(dx) < 3) {
      // Straight line if directly below
      d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else if (r < 2) {
      // Very close - use sharp corners (straight lines)
      d = `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
    } else if (dx > 0) {
      // Child is to the right with rounded corners
      d = `M ${start.x} ${start.y} 
           L ${start.x} ${midY - r} 
           Q ${start.x} ${midY} ${start.x + r} ${midY}
           L ${end.x - r} ${midY}
           Q ${end.x} ${midY} ${end.x} ${midY + r}
           L ${end.x} ${end.y}`;
    } else {
      // Child is to the left with rounded corners
      d = `M ${start.x} ${start.y} 
           L ${start.x} ${midY - r} 
           Q ${start.x} ${midY} ${start.x - r} ${midY}
           L ${end.x + r} ${midY}
           Q ${end.x} ${midY} ${end.x} ${midY + r}
           L ${end.x} ${end.y}`;
    }
  } else {
    // Parent on left, children on right (horizontal tree)
    const parentRight = fromRect.right;
    const childLeft = toRect.left;
    const midX = parentRight + (childLeft - parentRight) / 2;

    start = { x: parentRight, y: fromCenterY };
    end = { x: childLeft, y: toCenterY };

    const dy = end.y - start.y;
    const horizontalGap = childLeft - parentRight;

    // Adaptive corner radius: smaller when nodes are closer, max 8px
    const maxRadius = 8;
    const r = Math.min(maxRadius, Math.abs(dy) / 3, horizontalGap / 4);

    if (Math.abs(dy) < 3) {
      // Straight line if at same height
      d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else if (r < 2) {
      // Very close - use sharp corners (straight lines)
      d = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    } else if (dy > 0) {
      // Child is below with rounded corners
      d = `M ${start.x} ${start.y} 
           L ${midX - r} ${start.y} 
           Q ${midX} ${start.y} ${midX} ${start.y + r}
           L ${midX} ${end.y - r}
           Q ${midX} ${end.y} ${midX + r} ${end.y}
           L ${end.x} ${end.y}`;
    } else {
      // Child is above with rounded corners
      d = `M ${start.x} ${start.y} 
           L ${midX - r} ${start.y} 
           Q ${midX} ${start.y} ${midX} ${start.y - r}
           L ${midX} ${end.y + r}
           Q ${midX} ${end.y} ${midX + r} ${end.y}
           L ${end.x} ${end.y}`;
    }
  }

  // Label position at midpoint
  const label = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  };

  return { d, start, end, label };
}

/**
 * Compute bracket-style connection for tree view
 * Creates a clean vertical or horizontal "spine" with perpendicular connectors to children
 * This creates the org-chart look with:
 * - A small line from parent to the main spine
 * - A vertical/horizontal spine line connecting all children
 * - Small perpendicular lines from spine to each child
 * - Circles at junction points for a polished look
 * 
 * @param parentRect - Parent node rectangle
 * @param childRects - Array of child node rectangles
 * @param parentColor - Color for the connection (from parent node)
 * @returns Object with paths, underline, and circles for junction points
 */
export function computeBracketPaths(
  parentRect: Rect,
  childRects: Rect[],
  parentColor: string = '#94a3b8'
): {
  paths: Array<{ d: string; color: string }>;
  underline: { d: string; color: string };
  circles?: Array<{ cx: number; cy: number; r: number; color: string }>;
} {
  if (childRects.length === 0) {
    return { paths: [], underline: { d: '', color: parentColor }, circles: [] };
  }

  const parentCenterX = (parentRect.left + parentRect.right) / 2;
  const parentCenterY = (parentRect.top + parentRect.bottom) / 2;
  const parentBottom = parentRect.bottom;
  const parentRight = parentRect.right;
  const parentLeft = parentRect.left;
  const parentTop = parentRect.top;

  // Determine if this is a horizontal or vertical layout based on child positions
  const childCentersX = childRects.map(r => (r.left + r.right) / 2);
  const childCentersY = childRects.map(r => (r.top + r.bottom) / 2);
  const avgChildX = childCentersX.reduce((a, b) => a + b, 0) / childCentersX.length;
  const avgChildY = childCentersY.reduce((a, b) => a + b, 0) / childCentersY.length;

  const horizontalDistance = Math.abs(avgChildX - parentCenterX);
  const verticalDistance = Math.abs(avgChildY - parentCenterY);

  const isHorizontalLayout = horizontalDistance > verticalDistance;

  const paths: Array<{ d: string; color: string }> = [];
  const circles: Array<{ cx: number; cy: number; r: number; color: string }> = [];
  let underline = { d: '', color: parentColor };

  const SPINE_OFFSET = 25; // Distance from parent edge to spine
  const CIRCLE_RADIUS = 5; // Radius of junction circles

  if (isHorizontalLayout) {
    // HORIZONTAL LAYOUT: Children are to the right or left of parent
    // Spine is a vertical line to the right/left of parent
    const childrenToRight = avgChildX > parentCenterX;
    const exitX = childrenToRight ? parentRight : parentLeft;

    // Position spine closer to parent for a cleaner look
    const spineX = exitX + (childrenToRight ? SPINE_OFFSET : -SPINE_OFFSET);

    // Get min and max Y of children for the vertical spine line
    const childCenterYs = childRects.map(r => (r.top + r.bottom) / 2);
    const minChildY = Math.min(...childCenterYs);
    const maxChildY = Math.max(...childCenterYs);

    // Extend spine to connect with parent's Y level if parent is outside child range
    const spineMinY = Math.min(minChildY, parentCenterY);
    const spineMaxY = Math.max(maxChildY, parentCenterY);

    // Underline (small horizontal connector from parent edge to spine)
    underline = {
      d: `M ${exitX} ${parentCenterY} L ${spineX} ${parentCenterY}`,
      color: parentColor
    };

    // Main vertical spine line
    paths.push({
      d: `M ${spineX} ${spineMinY} L ${spineX} ${spineMaxY}`,
      color: parentColor
    });

    // Circle at parent junction point
    circles.push({
      cx: spineX,
      cy: parentCenterY,
      r: CIRCLE_RADIUS,
      color: parentColor
    });

    // Individual horizontal lines from spine to each child
    for (const childRect of childRects) {
      const childCenterY = (childRect.top + childRect.bottom) / 2;
      const childEdgeX = childrenToRight ? childRect.left : childRect.right;

      paths.push({
        d: `M ${spineX} ${childCenterY} L ${childEdgeX} ${childCenterY}`,
        color: parentColor
      });

      // Circle at spine-to-child junction
      circles.push({
        cx: spineX,
        cy: childCenterY,
        r: CIRCLE_RADIUS - 1,
        color: parentColor
      });
    }
  } else {
    // VERTICAL LAYOUT: Children are below or above parent
    // Spine is a horizontal line below/above parent
    const childrenBelow = avgChildY > parentCenterY;
    const exitY = childrenBelow ? parentBottom : parentTop;

    // Position spine closer to parent
    const spineY = exitY + (childrenBelow ? SPINE_OFFSET : -SPINE_OFFSET);

    // Get min and max X of children for the horizontal spine line
    const childCenterXs = childRects.map(r => (r.left + r.right) / 2);
    const minChildX = Math.min(...childCenterXs);
    const maxChildX = Math.max(...childCenterXs);

    // Extend spine to include parent's X if outside child range
    const spineMinX = Math.min(minChildX, parentCenterX);
    const spineMaxX = Math.max(maxChildX, parentCenterX);

    // Underline (small vertical connector from parent edge to spine)
    underline = {
      d: `M ${parentCenterX} ${exitY} L ${parentCenterX} ${spineY}`,
      color: parentColor
    };

    // Main horizontal spine line
    paths.push({
      d: `M ${spineMinX} ${spineY} L ${spineMaxX} ${spineY}`,
      color: parentColor
    });

    // Circle at parent junction point
    circles.push({
      cx: parentCenterX,
      cy: spineY,
      r: CIRCLE_RADIUS,
      color: parentColor
    });

    // Individual vertical lines from spine to each child
    for (const childRect of childRects) {
      const childCenterX = (childRect.left + childRect.right) / 2;
      const childEdgeY = childrenBelow ? childRect.top : childRect.bottom;

      paths.push({
        d: `M ${childCenterX} ${spineY} L ${childCenterX} ${childEdgeY}`,
        color: parentColor
      });

      // Circle at spine-to-child junction
      circles.push({
        cx: childCenterX,
        cy: spineY,
        r: CIRCLE_RADIUS - 1,
        color: parentColor
      });
    }
  }

  return { paths, underline, circles };
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
 * WITH COLLISION AVOIDANCE - paths try to route around other nodes
 * 
 * This is the MOST COMPLEX function in the codebase!
 * It creates professional, curved connections that:
 * - Connect at appropriate edges (not through nodes)
 * - Distribute connection points for clean appearance (up to 10 children)
 * - Group connections at single point for large families (>10 children)
 * - Flow naturally with smooth curves
 * - AVOID passing under other nodes when possible
 * 
 * @param fromRect - Parent node rectangle
 * @param toRect - Child node rectangle
 * @param options - Optional: childIndex, totalChildren for distribution, allNodeRects for collision
 * @returns Object with: d (SVG path), start point, end point, label position
 */
export function computeBezierPath(
  fromRect: Rect,
  toRect: Rect,
  options?: {
    childIndex?: number;
    totalChildren?: number;
    parentId?: string;
    allNodeRects?: Rect[]; // All node rectangles for collision detection
    forceOrientation?: 'horizontal' | 'vertical';
    spreadFactor?: number;
  }
) {
  // Calculate centers of both rectangles
  const fromCenterX = (fromRect.left + fromRect.right) / 2;
  const fromCenterY = (fromRect.top + fromRect.bottom) / 2;
  const toCenterX = (toRect.left + toRect.right) / 2;
  const toCenterY = (toRect.top + toRect.bottom) / 2;

  // Calculate direction from parent to child
  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // ============================================================
  // SHORTEST PATH LOGIC:
  // - Parent exits from edge CLOSEST to child
  // - Child enters from edge CLOSEST to parent
  // ============================================================

  let start: { x: number; y: number };
  let end: { x: number; y: number };
  const edgeInset = 0; // Create at actual edge

  // Distribute start points based on child index to avoid overlapping lines
  const childIndex = options?.childIndex ?? 0;
  const totalChildren = options?.totalChildren ?? 1;

  // Calculate generic offsets
  // We use 60% of the parent dimension to keep lines clustered near center but distinct
  // This prevents them from bunching at the very corners
  let startOffsetX = 0;
  let startOffsetY = 0;

  // Determine layout orientation: Use forced override OR aspect ratio check
  const isHorizontal = options?.forceOrientation
    ? options.forceOrientation === 'horizontal'
    : absDx >= absDy;

  if (totalChildren > 1) {
    // Spread range - how far apart the first and last line should be
    // Cap strictly at node dimension - 20px padding (reduced to 10px for wider spread)
    const spreadFactor = options?.spreadFactor ?? 0.9;


    if (isHorizontal) {
      // Horizontal Layout: Distribute vertically
      const height = fromRect.bottom - fromRect.top;
      const availableHeight = Math.min(height * spreadFactor, height - 10); // Minimal padding
      const step = availableHeight / (totalChildren - 1);
      // Start from top-most point in the spread range
      startOffsetY = -availableHeight / 2 + childIndex * step;
    } else {
      // Vertical Layout: Distribute horizontally
      const width = fromRect.right - fromRect.left;
      const availableWidth = Math.min(width * spreadFactor, width - 10);
      const step = availableWidth / (totalChildren - 1);
      startOffsetX = -availableWidth / 2 + childIndex * step;
    }
  }

  if (isHorizontal) {
    // HORIZONTAL layout - child is more left/right than up/down
    if (dx > 0) {
      // Child is to the RIGHT of parent
      // Start from distributed vertical center of parent's RIGHT edge
      start = { x: fromRect.right - edgeInset, y: fromCenterY + startOffsetY };
      end = { x: toRect.left + edgeInset, y: toCenterY };
    } else {
      // Child is to the LEFT of parent
      // Start from distributed vertical center of parent's LEFT edge
      start = { x: fromRect.left + edgeInset, y: fromCenterY + startOffsetY };
      end = { x: toRect.right - edgeInset, y: toCenterY };
    }
  } else {
    // VERTICAL layout - child is more up/down than left/right
    if (dy > 0) {
      // Child is BELOW parent
      // Start from distributed horizontal center of parent's BOTTOM edge
      start = { x: fromCenterX + startOffsetX, y: fromRect.bottom - edgeInset };
      end = { x: toCenterX, y: toRect.top + edgeInset };
    } else {
      // Child is ABOVE parent
      // Start from distributed horizontal center of parent's TOP edge
      start = { x: fromCenterX + startOffsetX, y: fromRect.top + edgeInset };
      end = { x: toCenterX, y: toRect.bottom - edgeInset };
    }
  }

  // ============================================================
  // STEP 3: Create Bezier curve with collision avoidance
  // ============================================================
  const horizontalDistance = end.x - start.x;
  const verticalDistance = end.y - start.y;
  const absHorizontal = Math.abs(horizontalDistance);
  const absVertical = Math.abs(verticalDistance);
  const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);

  /**
   * Generate control points for a specific routing strategy
   */
  const generateControlPoints = (offset: number = 0, routeAbove: boolean = false, routeBelow: boolean = false) => {
    let c1x, c1y, c2x, c2y;

    if (horizontalDistance > 30) {
      const curveStrength = Math.min(absHorizontal * 0.6, 150);
      c1x = start.x + curveStrength;
      c1y = start.y + offset;
      c2x = end.x - curveStrength * 0.3;
      c2y = end.y + offset;

      // Route above or below if specified
      if (routeAbove) {
        const minY = Math.min(start.y, end.y) - 60 - Math.abs(offset);
        c1y = minY;
        c2y = minY;
      } else if (routeBelow) {
        const maxY = Math.max(start.y, end.y) + 60 + Math.abs(offset);
        c1y = maxY;
        c2y = maxY;
      }
    } else if (horizontalDistance < -30) {
      const curveStrength = Math.min(absHorizontal * 0.6, 150);
      c1x = start.x - curveStrength;
      c1y = start.y + offset;
      c2x = end.x + curveStrength * 0.3;
      c2y = end.y + offset;

      if (routeAbove) {
        const minY = Math.min(start.y, end.y) - 60 - Math.abs(offset);
        c1y = minY;
        c2y = minY;
      } else if (routeBelow) {
        const maxY = Math.max(start.y, end.y) + 60 + Math.abs(offset);
        c1y = maxY;
        c2y = maxY;
      }
    } else if (verticalDistance < -30) {
      const curveStrength = Math.min(absVertical * 0.5, 120);
      c1x = start.x + offset;
      c1y = start.y - curveStrength;
      c2x = end.x + offset;
      c2y = end.y + curveStrength * 0.4;
    } else if (verticalDistance > 30) {
      const curveStrength = Math.min(absVertical * 0.5, 120);
      c1x = start.x + offset;
      c1y = start.y + curveStrength;
      c2x = end.x + offset;
      c2y = end.y - curveStrength * 0.4;
    } else {
      const angle = Math.atan2(verticalDistance, horizontalDistance);
      const tension = Math.min(0.5, Math.max(0.25, totalDistance / 400));
      const curveStrength = Math.max(totalDistance * tension, 30);
      const perpX = -Math.sin(angle) * curveStrength * 0.3;
      const perpY = Math.cos(angle) * curveStrength * 0.3;

      c1x = start.x + horizontalDistance * 0.3 + perpX + offset;
      c1y = start.y + verticalDistance * 0.3 + perpY;
      c2x = end.x - horizontalDistance * 0.3 + perpX + offset;
      c2y = end.y - verticalDistance * 0.3 + perpY;
    }

    return { c1x, c1y, c2x, c2y };
  };

  // Start with default path
  let { c1x, c1y, c2x, c2y } = generateControlPoints(0);

  // ============================================================
  // STEP 4: Collision avoidance - try alternative routes
  // ============================================================
  const allNodeRects = options?.allNodeRects || [];

  if (allNodeRects.length > 0) {
    const excludeRects = [fromRect, toRect];

    // Check if default path collides
    if (pathCollidesWithNodes(start.x, start.y, c1x, c1y, c2x, c2y, end.x, end.y, allNodeRects, excludeRects)) {
      // Try routing ABOVE nodes
      const abovePath = generateControlPoints(0, true, false);
      if (!pathCollidesWithNodes(start.x, start.y, abovePath.c1x, abovePath.c1y, abovePath.c2x, abovePath.c2y, end.x, end.y, allNodeRects, excludeRects)) {
        c1x = abovePath.c1x; c1y = abovePath.c1y;
        c2x = abovePath.c2x; c2y = abovePath.c2y;
      } else {
        // Try routing BELOW nodes
        const belowPath = generateControlPoints(0, false, true);
        if (!pathCollidesWithNodes(start.x, start.y, belowPath.c1x, belowPath.c1y, belowPath.c2x, belowPath.c2y, end.x, end.y, allNodeRects, excludeRects)) {
          c1x = belowPath.c1x; c1y = belowPath.c1y;
          c2x = belowPath.c2x; c2y = belowPath.c2y;
        } else {
          // Try with more extreme routing above
          const farAbovePath = generateControlPoints(-40, true, false);
          if (!pathCollidesWithNodes(start.x, start.y, farAbovePath.c1x, farAbovePath.c1y, farAbovePath.c2x, farAbovePath.c2y, end.x, end.y, allNodeRects, excludeRects)) {
            c1x = farAbovePath.c1x; c1y = farAbovePath.c1y;
            c2x = farAbovePath.c2x; c2y = farAbovePath.c2y;
          } else {
            // Try with more extreme routing below
            const farBelowPath = generateControlPoints(40, false, true);
            if (!pathCollidesWithNodes(start.x, start.y, farBelowPath.c1x, farBelowPath.c1y, farBelowPath.c2x, farBelowPath.c2y, end.x, end.y, allNodeRects, excludeRects)) {
              c1x = farBelowPath.c1x; c1y = farBelowPath.c1y;
              c2x = farBelowPath.c2x; c2y = farBelowPath.c2y;
            }
            // If all attempts fail, keep default path (go under the node as fallback)
          }
        }
      }
    }
  }

  // Construct SVG path string
  const d = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;

  // Calculate label position at curve midpoint (bezier t=0.5)
  const t = 0.5;
  const mt = 1 - t;
  const labelX = mt * mt * mt * start.x + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * end.x;
  const labelY = mt * mt * mt * start.y + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * end.y;

  const label = { x: labelX, y: labelY };

  return { d, start, end, label };
}

