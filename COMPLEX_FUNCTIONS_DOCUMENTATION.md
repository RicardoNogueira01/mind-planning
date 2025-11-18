# Complex Functions Documentation

This document provides detailed explanations of complex functions in the Mind Planning codebase to help future developers (including future you!) understand what's happening under the hood.

---

## Table of Contents
1. [Node Positioning & Layout](#node-positioning--layout)
2. [Connection Geometry & Bezier Curves](#connection-geometry--bezier-curves)
3. [Color Manipulation](#color-manipulation)
4. [Node Hierarchy & Progress Tracking](#node-hierarchy--progress-tracking)
5. [Shape Builders](#shape-builders)
6. [View Transformation](#view-transformation)
7. [Date & Time Utilities](#date--time-utilities)

---

## Node Positioning & Layout

### File: `src/hooks/useNodePositioning.ts`

#### `isPositionAvailable(x, y, excludeId)`
**Purpose**: Checks if a position is free for placing a new node

**How it works**:
- Calculates distance between proposed position and all existing nodes
- Uses Pythagorean theorem (`Math.hypot`) to get actual distance
- Returns `true` if no node is within `COLLISION_DISTANCE` (80px)
- Can exclude a specific node by ID (useful when moving nodes)

**Example**:
```typescript
// Check if coordinates (500, 300) are available
const canPlace = isPositionAvailable(500, 300);
// Returns true if no node exists within 80px radius
```

---

#### `findAvailablePosition(centerX, centerY, radius)`
**Purpose**: Finds an available spot around a center point using a "spider web" pattern

**Algorithm**:
1. Tries 8 compass directions: E, SE, S, SW, W, NW, N, NE (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
2. At each direction, tries 4 different radii: 1x, 1.5x, 2x, 2.5x the base radius
3. Returns the first available position found
4. If all 32 positions (8 directions × 4 radii) are occupied, falls back to right position

**Why spider web?**:
- Distributes nodes evenly around the center
- Prevents clustering in one direction
- Creates visually balanced mind maps

**Visual representation**:
```
        N
    NW  ↑  NE
  W  ←  •  →  E    • = center
    SW  ↓  SE      Arrows = directions tested
        S
```

**Example**:
```typescript
// Find spot around (800, 400) with 300px base radius
const { x, y } = findAvailablePosition(800, 400, 300);
// Tries: (1100,400), (1012,612), (800,700), etc.
```

---

#### `findStackedChildPosition(parentId, preferredX, preferredY)`
**Purpose**: Positions child nodes in a cascading vertical layout to the right of parent

**Algorithm**:
1. Finds all existing children of the parent
2. If no children exist, positions first child at parent's Y level (horizontal alignment)
3. For subsequent children:
   - Finds the lowest Y position among existing children
   - Places new child below it with `MARGIN` spacing (25px)
   - Keeps same X position (vertical stack)

**Visual result**:
```
Parent  →  Child 1
           Child 2
           Child 3
           Child 4
```

**Why this approach?**:
- Creates clear parent-child relationships
- Easy to scan top-to-bottom
- Prevents overlapping siblings
- Mimics org chart / hierarchical structure

---

## Connection Geometry & Bezier Curves

### File: `src/components/mindmap/connectionGeometry.ts`

#### `getPerimeterPoint(rect, targetX, targetY)`
**Purpose**: Calculates where a line from rectangle center to target point intersects the rectangle's edge

**Algorithm**:
1. Calculate slope of line from center to target
2. Determine which edge will be intersected:
   - If slope is shallow → intersects left/right edge
   - If slope is steep → intersects top/bottom edge
3. Use slope to find exact intersection coordinates
4. Clamp result to ensure it stays within rectangle bounds

**Why needed?**:
- Connections should start/end at node edges, not centers
- Makes connections look professional
- Prevents lines from crossing through nodes

**Example**:
```typescript
const nodeRect = { left: 100, top: 50, right: 300, bottom: 110 };
const target = { x: 500, y: 200 };
const point = getPerimeterPoint(nodeRect, 500, 200);
// Returns point on right edge: ~(300, 80)
```

---

#### `computeBezierPath(fromRect, toRect, options)`
**Purpose**: Creates smooth, curved connection lines between nodes using cubic Bezier curves

**This is the most complex function in the codebase!**

**Algorithm (3 main steps)**:

**STEP 1: Determine child connection point**
- Analyzes parent position relative to child
- Chooses appropriate edge of child node:
  - Parent left of child → connect to child's left edge
  - Parent right of child → connect to child's right edge  
  - Parent above child → connect to child's top edge
  - Parent below child → connect to child's bottom edge

**STEP 2: Determine parent connection point with smart distribution**
- For 1-10 children: **Distributes** connection points along edge
  - If children are to the right: spread vertically on parent's right edge
  - Creates clean, organized appearance
- For >10 children: **Groups** all connections at single point
  - Prevents visual clutter
  - Maintains clean appearance

**Distribution example** (5 children to the right):
```
       |  → Child 1
       |  → Child 2
Parent |  → Child 3  (evenly spaced)
       |  → Child 4
       |  → Child 5
```

**STEP 3: Create Bezier curve with control points**
- Uses cubic Bezier: `M start C cp1 cp2 end`
- Control points create natural, flowing curves
- Adapts curve shape based on node positions:
  - **Horizontal layout** (side-by-side): Uses horizontal control points
  - **Vertical layout** (stacked): Uses vertical control points
- Control distance is adaptive: 60% of distance, max 150px

**Bezier curve components**:
```
Start ────┐           ┌──── End
          │           │
        Control1   Control2
```

**Why Bezier curves?**:
- More visually appealing than straight lines
- Easy to follow with your eyes
- Professional appearance
- Automatically routes around nodes

**Example output**:
```javascript
{
  d: "M 300 100 C 390 100, 510 200, 600 200",  // SVG path
  start: { x: 300, y: 100 },                     // Start point
  end: { x: 600, y: 200 },                       // End point
  label: { x: 450, y: 150 }                      // Midpoint for label
}
```

---

## Color Manipulation

### File: `src/utils/color.ts`

#### `adjustBrightness(hex, percent)`
**Purpose**: Makes a color lighter or darker while preserving its hue

**Algorithm**:
1. Convert HEX color to decimal number
2. Extract R, G, B components using bit shifting:
   - `R = num >> 16` (shift right 16 bits)
   - `G = (num >> 8) & 0xFF` (shift right 8, mask to 8 bits)
   - `B = num & 0xFF` (mask to 8 bits)
3. Calculate adjustment amount: `percent * 2.55` (maps 0-100 to 0-255)
4. Add adjustment to each component
5. Clamp each component to valid range (0-255)
6. Recombine components back to HEX

**Bit manipulation explained**:
```
Color: #3B82F6 = 3,901,174 decimal = 0011 1011 1000 0010 1111 0110 binary

R = num >> 16     →  0011 1011 = 59
G = (num>>8)&0xFF →  1000 0010 = 130  
B = num & 0xFF    →  1111 0110 = 246
```

**Example**:
```typescript
// Make color 30% brighter
adjustBrightness('#3B82F6', 30);  // Returns '#68AFF8'

// Make color 20% darker  
adjustBrightness('#3B82F6', -20); // Returns '#2F6BCD'
```

**Use cases**:
- Hover effects (lighten by 10%)
- Dark mode adjustments
- Creating color variations from base palette

---

## Node Hierarchy & Progress Tracking

### File: `src/utils/nodeUtils.js`

#### `getMaxDepth(nodeId, connections, visited, currentDepth)`
**Purpose**: Calculates the deepest level of the node hierarchy tree

**Algorithm (recursive with cycle detection)**:
1. Check if node was already visited (prevents infinite loops)
2. Mark current node as visited
3. Find all direct children of this node
4. If no children, return current depth
5. Recursively calculate depth for each child
6. Return the maximum depth found

**Cycle detection is critical!**
Without visited tracking, circular connections would cause infinite recursion:
```
A → B → C → A  (infinite loop!)
```

**Example**:
```javascript
// Tree structure:
//   Root
//   ├── Child1
//   │   └── GrandChild1
//   └── Child2

getMaxDepth('root', connections);  // Returns 2
// Depth 0: Root
// Depth 1: Child1, Child2
// Depth 2: GrandChild1
```

---

#### `getAllDescendants(parentId, connections, nodes, visited)`
**Purpose**: Gets all children, grandchildren, great-grandchildren, etc. (entire subtree)

**Algorithm (recursive)**:
1. Check visited set to prevent cycles
2. Find all direct children
3. Add direct children to results
4. For each child, recursively get their descendants
5. Combine all descendants into single array

**Why needed?**:
- Calculate total progress (% of subtree completed)
- Delete entire branches (parent + all descendants)
- Show/hide entire subtrees

**Example**:
```javascript
// Tree:
//   Project
//   ├── Phase1
//   │   ├── Task1.1
//   │   └── Task1.2
//   └── Phase2
//       └── Task2.1

getAllDescendants('project');
// Returns: [Phase1, Task1.1, Task1.2, Phase2, Task2.1]
```

---

#### `getNodeProgress(nodeId, connections, nodes)`
**Purpose**: Calculates completion statistics for a node's entire subtree

**Algorithm**:
1. Get all descendants using `getAllDescendants`
2. Remove duplicates (same node shouldn't be counted twice)
3. Count how many are completed
4. Calculate percentage: `(completed / total) * 100`
5. Also calculate max depth for context

**Returns**:
```javascript
{
  completed: 3,      // 3 tasks done
  total: 5,          // out of 5 total
  percentage: 60,    // 60% complete
  depth: 3           // 3 levels deep
}
```

**Use cases**:
- Show progress bars on parent nodes
- Dashboard statistics
- Identify stuck branches (0% progress)

---

## Shape Builders

### File: `src/components/mindmap/builders.ts`

#### `shapeBuilders` Object
**Purpose**: Creates pre-configured flowchart structures in one operation

**Each builder returns**:
```typescript
{
  nodes: Node[],        // Array of nodes to add
  connections: Conn[],  // Connections between nodes
  mainId: string        // ID of the "main" node (for selection)
}
```

**Available shapes**:

1. **Circle (Start/End)**: Simple flow starter
   ```
   (Start) → [First step]
   ```

2. **Hexagon (Action with outcomes)**:
   ```
           ┌─→ [Success]
   <Action>┤
           └─→ [Failure]
   ```

3. **Rhombus (Decision/If)**:
   ```
           ┌─→ [True branch]
   ◇Decision◇
           └─→ [False branch]
   ```

4. **Pentagon (Switch/Multiple paths)**:
   ```
           ┌─→ [Case 1]
   ⬠Switch⬠─┼─→ [Case 2]
           └─→ [Otherwise]
   ```

5. **Ellipse (Loop)**:
   ```
           ┌─→ [Body] (loops back)
   (Loop)──┤
           └─→ [Exit] (breaks loop)
   ```

**Why pre-built structures?**:
- Saves time (don't manually create common patterns)
- Ensures consistency in flowcharts
- Educational (shows proper flowchart techniques)
- Reduces errors (connections are automatic)

---

## View Transformation

### File: `src/components/mindmap/viewTransform.ts`

#### `computeZoomAndPanToRect(rect, viewportW, viewportH, padding, minZoom, maxZoom)`
**Purpose**: Calculates zoom level and pan position to fit a rectangle in the viewport

**This enables the "focus on group" feature!**

**Algorithm**:
1. Calculate target dimensions (rect + padding on all sides)
2. Calculate required scale for width: `viewport width / target width`
3. Calculate required scale for height: `viewport height / target height`
4. Use the smaller scale (ensures entire rect fits)
5. Clamp zoom to allowed range (0.5 - 2.0 by default)
6. Calculate pan to center the rect:
   - Find rect center coordinates
   - Calculate offset needed to center it in viewport
   - Apply zoom scale to offset

**Math explanation**:
```
Original rect at (100, 100), size 400×300
Viewport: 1200×800
Padding: 80

Target size: 400+160 = 560 × 300+160 = 460
Scale: min(1200/560, 800/460) = min(2.14, 1.74) = 1.74
Rect center: (100 + 200 = 300, 100 + 150 = 250)
Pan X: 1200/2 - 300*1.74 = 600 - 522 = 78
Pan Y: 800/2 - 250*1.74 = 400 - 435 = -35
```

**Example usage**:
```typescript
// Focus on a group of nodes
const groupRect = { x: 100, y: 100, width: 400, height: 300 };
const { zoom, panX, panY } = computeZoomAndPanToRect(
  groupRect, 
  1200,  // viewport width
  800,   // viewport height
  80     // padding
);

// Apply to canvas
setZoom(zoom);
setPan({ x: panX, y: panY });
// Group is now centered and optimally sized!
```

---

## Date & Time Utilities

### File: `src/utils/nodeUtils.js`

#### `formatVisitorTime(timestamp)`
**Purpose**: Converts ISO timestamp to human-readable relative time

**Algorithm (cascading time ranges)**:
1. Calculate time difference in milliseconds
2. Convert to minutes, hours, days
3. Return appropriate format based on age:
   - < 1 min: "Just now"
   - < 60 mins: "5 mins ago"
   - < 24 hours: "3 hours ago"
   - < 7 days: "2 days ago"
   - >= 7 days: "Jan 15, 2024 at 2:30 PM"

**Example transformations**:
```javascript
// 30 seconds ago
formatVisitorTime('2024-01-15T14:29:30Z');  // "Just now"

// 45 minutes ago
formatVisitorTime('2024-01-15T13:15:00Z');  // "45 mins ago"

// 5 hours ago
formatVisitorTime('2024-01-15T09:00:00Z');  // "5 hours ago"

// 3 days ago
formatVisitorTime('2024-01-12T14:00:00Z');  // "3 days ago"

// 2 weeks ago
formatVisitorTime('2024-01-01T10:00:00Z');  // "Jan 1, 2024 at 10:00 AM"
```

**Why relative time?**:
- More intuitive than absolute timestamps
- Easier to gauge recency at a glance
- Common pattern in social apps (Twitter, Facebook, etc.)

---

### File: `src/components/RecentlyCompletedTasksManager.jsx`

#### `formatDate(dateString)` (lines ~360-380)
**Purpose**: Smart date formatting that adapts to how recent the date is

**Algorithm**:
1. Calculate hours since date
2. < 24 hours: Show "X hours ago" or "Just now"
3. 24-48 hours: Show "Yesterday"
4. 2-7 days: Show "X days ago"
5. >= 7 days: Show full date "Jan 15, 2024"

**Example**:
```javascript
const now = new Date('2024-01-15T14:00:00Z');

formatDate('2024-01-15T13:00:00Z');  // "1 hours ago"
formatDate('2024-01-14T14:00:00Z');  // "Yesterday"  
formatDate('2024-01-12T14:00:00Z');  // "3 days ago"
formatDate('2024-01-01T14:00:00Z');  // "Jan 1, 2024"
```

---

## Performance Considerations

### When to worry about performance:

1. **`computeBezierPath`**: Called for every connection on every render
   - Solution: Connections are memoized in React
   - Only recalculates when node positions change

2. **`getAllDescendants`**: Recursive function that can be expensive for deep trees
   - Worst case: O(n) where n = total nodes in subtree
   - Mitigated by: Cycle detection limits depth, typical trees are shallow (< 5 levels)

3. **`isPositionAvailable`**: Checks all nodes on every position query
   - O(n) for n = total nodes
   - Acceptable because: Only called when adding nodes (infrequent operation)

4. **Filter/Sort operations** in Manager components:
   - O(n log n) for sorting
   - Run on every state change
   - Acceptable because: User actions are infrequent, datasets are small (< 100 items)

---

## Common Gotchas & Tips

### 1. Circular Dependencies
**Problem**: Node A → B → C → A creates infinite loop

**Solution**: Always pass `visited` Set to recursive functions:
```javascript
const visited = new Set();
getAllDescendants(nodeId, connections, nodes, visited);
```

### 2. Floating Point Precision
**Problem**: Coordinates like 100.000001 vs 100.000002

**Solution**: Round coordinates when possible:
```javascript
x: Math.round(centerX + radius)  // Not: centerX + radius
```

### 3. State Updates in Loops
**Problem**: Multiple `setState` calls in sequence don't batch

**Solution**: Use functional updates:
```javascript
// ❌ Bad: Each call triggers re-render
setNodes(newNodes);
setConnections(newConnections);

// ✅ Good: Batched update
setNodes(prev => [...prev, newNode]);
```

### 4. Bezier Curve Control Points
**Problem**: Control points too far = awkward curves

**Solution**: Limit control distance:
```javascript
const controlDistance = Math.min(horizontalDistance * 0.6, 150);
//                               ↑ 60% of distance    ↑ but max 150px
```

### 5. Color Math Overflow
**Problem**: RGB values > 255 or < 0

**Solution**: Always clamp:
```javascript
const R = Math.max(0, Math.min(255, (num >> 16) + amt));
//        ↑ minimum 0    ↑ maximum 255
```

---

## Testing Complex Functions

### Recommended test cases:

1. **Position functions**: 
   - Empty nodes array
   - Single node
   - Fully occupied grid

2. **Hierarchy functions**:
   - No children (leaf node)
   - Single child
   - Multiple children
   - Circular references
   - Deep trees (> 10 levels)

3. **Bezier paths**:
   - Overlapping nodes
   - Very distant nodes
   - Horizontally aligned
   - Vertically aligned

4. **Color functions**:
   - Edge values (0%, ±100%)
   - Invalid HEX codes
   - Short HEX (#FFF vs #FFFFFF)

---

## Future Improvement Ideas

1. **Spatial Indexing for Position Checks**
   - Current: O(n) for every position check
   - Better: Use quadtree → O(log n)
   - Worth it if: > 1000 nodes

2. **Connection Caching**
   - Cache Bezier path calculations
   - Invalidate only when nodes move
   - Could save 50%+ calculations

3. **Web Workers for Progress Calculation**
   - Large trees (> 500 nodes) can lag
   - Move `getAllDescendants` to worker thread
   - Non-blocking UI

4. **Approximate Positioning**
   - Instead of checking all positions, use educated guesses
   - 90% chance of first guess being correct
   - Fall back to full scan if needed

---

## Questions to Ask When Adding Complexity

Before adding a complex algorithm, ask:

1. **Is it necessary?**
   - Can a simpler approach work?
   - What's the performance requirement?

2. **Is it testable?**
   - Can you write unit tests?
   - Can you verify correctness?

3. **Is it maintainable?**
   - Will you understand it in 6 months?
   - Can others understand it?

4. **Is it documented?**
   - Add comments explaining WHY, not just WHAT
   - Include examples
   - Document edge cases

---

## Additional Resources

- **Bezier curves**: https://javascript.info/bezier-curve
- **Bit manipulation**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
- **React performance**: https://react.dev/learn/render-and-commit
- **Algorithm complexity**: https://www.bigocheatsheet.com/

---

## Changelog

- **2024-01-15**: Initial documentation created
- **Future**: Add performance benchmarks
- **Future**: Add visualization diagrams

---

*Last updated: November 18, 2025*
*Maintainer: Development Team*
