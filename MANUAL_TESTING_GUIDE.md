# 🧪 MANUAL TESTING GUIDE - PHASE 5 REFACTORING

## Quick Start

**URL**: http://localhost:5173
**Status**: ✅ Server running, app ready for testing

---

## Test Case 1: Standalone Node Stacking

### Objective
Verify that standalone nodes created via "Add Idea" stack vertically with proper spacing.

### Steps
1. Open http://localhost:5173
2. You should see "Central Idea" node in the center
3. Click the **"Add Idea"** button (usually in a toolbar)
4. You should see a new node appear
5. Repeat step 3-4 three more times (add 4 nodes total)

### Expected Results ✅
- New nodes appear **below** the previous nodes
- **No overlap** - Each node is clearly separate
- **25px margin** between nodes (visible space)
- Nodes stack vertically in a clean column

### If Failed ❌
- Nodes overlap: Check `useNodePositioning.ts` `findStackedPosition()` function
- Wrong spacing: Check MARGIN constant (should be 25px)
- Nodes appear scattered: Check collision detection logic

### Screenshot Reference
```
Central Idea
    ↓ (25px gap)
Node 1
    ↓ (25px gap)
Node 2
    ↓ (25px gap)
Node 3
    ↓ (25px gap)
Node 4
```

---

## Test Case 2: Hierarchical Child Positioning

### Objective
Verify that child nodes are positioned correctly, alternating LEFT and RIGHT of their parent with vertical stacking on each side.

### Steps
1. Select the **"Central Idea"** node (click on it)
2. With Central Idea selected, click **"Add Child"** button (+)
3. Observe where the child appears
4. With the parent still selected, click **"Add Child"** again
5. Observe where the second child appears
6. Repeat step 4-5 multiple times (add 4-6 child nodes)

### Expected Results ✅
- First child appears **to the RIGHT** of Central Idea (at same Y level)
- Second child appears **to the LEFT** of Central Idea (at same Y level)
- Additional children **alternate sides** (right, left, right, left...)
- Children on the **same side** stack **vertically** (centered around parent's Y)
- Proper spacing between parent and children (~200px horizontal gap)
- Proper spacing between stacked children (~71px vertical gap)

### If Failed ❌
- All children appear in horizontal row ABOVE parent: Rebalancing bug
- Children appear randomly scattered: Collision detection issue
- Wrong spacing: Check OFFSET_DISTANCE and CHILD_SPACING constants
- Children don't alternate sides: Check left/right balancing logic

### Screenshot Reference
```
                    ┌─ Child 2 (LEFT side)
                    │
                    ├─ Child 4 (LEFT side, stacked below)
                    │
Central Idea ───────┼───────┬─ Child 1 (RIGHT side)
                    │       │
                    │       ├─ Child 3 (RIGHT side, stacked below)
                    │       │
                    │       └─ Child 5 (RIGHT side, stacked below)
                    │
                    └─ Child 6 (LEFT side, stacked below)
```

---

## Test Case 3: Relative Positioning (Movement)

### Objective
Verify that child nodes move WITH their parent when parent is dragged.

### Steps
1. Create a parent node with 2-3 child nodes (see Test Case 2)
2. Click and drag the **Central Idea** node to a different position
3. Observe whether children move with the parent

### Expected Results ✅
- When parent moves, all children **move together**
- Children **maintain relative positions** to parent
- Spacing between parent and children **stays the same**
- Child-to-child spacing **stays consistent**
- Looks like a unit moving together

### If Failed ❌
- Children stay in old position: Relative positioning broken
- Children scatter: Position calculation wrong
- Children follow but change distance: Calculation error

### Screenshot Reference
```
BEFORE:                    AFTER (parent moved):
Central Idea               (at new position)
├─ Child 1                 ├─ Child 1 (moved too!)
├─ Child 2        ====>    ├─ Child 2 (moved too!)
└─ Child 3                 └─ Child 3 (moved too!)
```

---

## Test Case 4: Canvas Panning

### Objective
Verify that clicking and dragging on the canvas (not on nodes) pans the view.

### Steps
1. Create several nodes (mix of parent and children)
2. Find an **empty area** of the canvas (white space, no nodes)
3. Click and **hold** the mouse button on empty space
4. **Drag** your mouse in any direction
5. Release the mouse button

### Expected Results ✅
- The entire canvas/view **pans** in the direction you dragged
- All nodes move together with the canvas
- Panning is **smooth** (not jerky)
- You can see nodes move out of or into view
- Zoom level stays the same (only position changes)

### If Failed ❌
- Nothing happens: Panning not working
- Individual nodes move instead: Drag detection wrong
- Very slow/jerky: Performance issue
- Canvas moves wrong direction: Pan calculation wrong

### Screenshot Reference
```
Click + drag right ──────> All content shifts left (showing more right side)
Click + drag down  ──────> All content shifts up (showing more bottom)
```

---

## Test Case 5: Node Toolbar Positioning

### Objective
Verify that the node toolbar appears at correct distance (25px) above nodes with no blur.

### Steps
1. Create or locate any node
2. **Hover your mouse** over the node
3. Observe the toolbar that appears

### Expected Results ✅
- Toolbar appears **above** the node
- Distance between node and toolbar: **25px** (approximately 1 finger width on screen)
- Toolbar is **NOT blurred** (crisp, clear text)
- Toolbar stays in place while hovering
- Toolbar contains buttons (color, text, add child, etc.)

### If Failed ❌
- Toolbar very far away (>45px): Check inline style in MindMap.jsx
- Toolbar overlaps node: Check top CSS value
- Toolbar is blurred: Check MindMapToolbar.jsx for backdrop-blur-lg
- No toolbar appears: Check rendering logic

### Screenshot Reference
```
   [Options Toolbar]  <── 25px gap (proper distance)
   
   [   Node Card   ]  <── Hovering here shows toolbar above
```

---

## Test Case 6: Node Colors (Root vs Children)

### Objective
Verify that all nodes (root and children) have consistent coloring.

### Steps
1. Look at the **"Central Idea"** node (root node) - note its color
2. Create several **child nodes** of Central Idea
3. Observe the colors of child nodes

### Expected Results ✅
- Central Idea node has a **consistent color scheme** (background + text)
- Child nodes have **similar/matching color scheme**
- All nodes look like they're part of same app
- Colors are **not inverted** or different (no root vs child distinction)
- Text is **readable** on all nodes (good contrast)

### If Failed ❌
- Root node color very different from children: bgColor/color property mismatch
- Text not readable: Color contrast issue
- Some nodes have inverted colors: CSS styling issue
- Colors change randomly: State management issue

### Screenshot Reference
```
[Central Idea] (white bg, dark text)
    ├─ [Child 1] (white bg, dark text) ✅ SAME STYLE
    ├─ [Child 2] (white bg, dark text) ✅ SAME STYLE
    └─ [Child 3] (white bg, dark text) ✅ SAME STYLE
```

---

## Test Case 7: Node Deletion

### Objective
Verify that nodes can be deleted properly.

### Steps
1. Create several nodes (3-5)
2. Select or locate a node you want to delete
3. Click the **Delete** button (usually X or trash icon on toolbar)
4. Confirm deletion if prompted
5. Verify node is gone

### Expected Results ✅
- Node is **removed** from canvas
- No errors in console
- Remaining nodes **stay in place** (don't reorganize)
- Child nodes of deleted node are also deleted
- Connections to deleted node are removed

### If Failed ❌
- Node stays on canvas: Deletion not working
- Console errors: Hook error
- App crashes: Critical bug
- Other nodes moved: Unintended side effect

---

## Test Case 8: Spider Web Collision Detection

### Objective
Verify that when nodes collide, they fall back to spiral positioning.

### Steps
1. Add many nodes to create collisions (10+ nodes)
2. Observe where they appear

### Expected Results ✅
- First few nodes stack normally
- As space fills up, new nodes appear in a **spiral pattern**
- Nodes form a **circular/spiral arrangement** around parent
- **No overlap** even with many nodes
- Pattern looks organized, not random

### If Failed ❌
- Nodes overlap: Collision detection not working
- All nodes stack vertically: Spider web not activating
- Pattern looks random: Algorithm broken

---

## Test Case 9: Multi-node Operations

### Objective
Verify that multiple operations work correctly together.

### Steps
1. Create 2 parent nodes (via Add Idea)
2. Create children under each parent (via Add Child)
3. Drag nodes around
4. Pan the canvas
5. Delete a parent and its children
6. Create new nodes

### Expected Results ✅
- All operations complete without errors
- App remains responsive
- No console errors
- State remains consistent
- Can create/delete/move nodes in any order

### If Failed ❌
- App slows down: Performance issue
- Errors in console: Bug in refactored code
- State gets inconsistent: Hook state management issue

---

## Test Case 10: App Responsiveness

### Objective
Verify that the app remains responsive and performant.

### Steps
1. Create many nodes (15-20)
2. Drag nodes around
3. Pan canvas
4. Create/delete nodes
5. Perform rapid actions (multiple clicks quickly)

### Expected Results ✅
- **All actions respond immediately** (no lag)
- Canvas pans **smoothly**
- Dragging feels **responsive**
- No stutter or freezing
- 60 FPS smooth animation (if performance monitoring visible)

### If Failed ❌
- Lag when dragging: Performance issue
- Canvas pan is jerky: Optimization needed
- App freezes: Critical bug
- Actions queue up: Too much computation

---

## 📋 Testing Checklist

```
Test Case 1: Standalone Node Stacking
  [ ] Nodes appear below each other
  [ ] 25px spacing visible
  [ ] No overlap
  Status: ___________

Test Case 2: Hierarchical Child Positioning
  [ ] Children chain horizontally right
  [ ] Proper spacing maintained
  [ ] All children visible
  Status: ___________

Test Case 3: Relative Positioning
  [ ] Children move with parent
  [ ] Relative positions maintained
  [ ] Spacing preserved
  Status: ___________

Test Case 4: Canvas Panning
  [ ] Panning works on empty space
  [ ] All nodes move together
  [ ] Smooth motion
  Status: ___________

Test Case 5: Toolbar Positioning
  [ ] Appears 25px above node
  [ ] Not blurred
  [ ] Clear and readable
  Status: ___________

Test Case 6: Node Colors
  [ ] Consistent coloring
  [ ] Root and children match
  [ ] Good contrast
  Status: ___________

Test Case 7: Node Deletion
  [ ] Nodes delete properly
  [ ] Others stay in place
  [ ] No console errors
  Status: ___________

Test Case 8: Spider Web Collision
  [ ] No overlap with many nodes
  [ ] Spiral pattern visible
  [ ] Organized layout
  Status: ___________

Test Case 9: Multi-node Operations
  [ ] All operations work together
  [ ] State remains consistent
  [ ] No errors
  Status: ___________

Test Case 10: App Responsiveness
  [ ] Immediate response to actions
  [ ] Smooth animations
  [ ] No lag or freezing
  Status: ___________
```

---

## 🚨 Troubleshooting

### If Tests Fail

**Step 1: Check Browser Console**
- Open DevTools (F12)
- Check Console tab for errors
- Note exact error messages

**Step 2: Check Network Tab**
- Verify all resources loaded
- Check for failed requests

**Step 3: Check if Dev Server Running**
- Should see "Local: http://localhost:5173" in terminal
- If not, run: `npm run dev`

**Step 4: Clear Cache**
- Hard refresh: Ctrl+Shift+R
- Or: Clear browser cache for localhost:5173

**Step 5: Check Source Files**
- Look in src/hooks/ for hook implementations
- Check src/components/MindMap.jsx for integration

---

## 📞 Success Criteria

For the refactoring to be considered **SUCCESSFUL**, all 10 test cases should PASS:

- [x] Build completes without errors ✅ (verified)
- [x] Compilation succeeds ✅ (verified)
- [ ] Test Case 1 Passes (manual - PENDING)
- [ ] Test Case 2 Passes (manual - PENDING)
- [ ] Test Case 3 Passes (manual - PENDING)
- [ ] Test Case 4 Passes (manual - PENDING)
- [ ] Test Case 5 Passes (manual - PENDING)
- [ ] Test Case 6 Passes (manual - PENDING)
- [ ] Test Case 7 Passes (manual - PENDING)
- [ ] Test Case 8 Passes (manual - PENDING)
- [ ] Test Case 9 Passes (manual - PENDING)
- [ ] Test Case 10 Passes (manual - PENDING)

**Status**: 🚀 **READY FOR TESTING**

---

**Date**: December 21, 2025
**Phase**: Active Development
**Task**: Manual Browser Testing
**For**: Mind Planning Application
