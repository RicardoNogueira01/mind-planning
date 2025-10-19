# 🕷️ Spider Web Positioning - Quick Reference

## What Changed?

### BEFORE (Vertical Stacking)
```
Parent
  │
  ├─ Child 1
  │
  ├─ Child 2
  │
  └─ Child 3
```
All children stacked vertically below parent.

### AFTER (Hierarchical Spider Web) ✓
```
Parent ─────→ Child 1 ──────→ Grandchild 1
                │
                ├─ Child 2
                │
                └─ Child 3
```
- First child goes **RIGHT**
- More children stack **BELOW** first child
- Grandchildren go **RIGHT** again
- If no space → **Spider web pattern**

---

## Positioning Algorithm

### Step 1: Check if this is the first child
```
❓ Does parent have any children yet?

YES → Go to Step 2 (Next child - stack below)
NO  → Position to RIGHT of parent
       │
       ├─ Space available? → Use it ✓
       └─ Occupied? → Find spider web position ⚠️
```

### Step 2: Stack additional children below first
```
Subsequent children position:
(firstChild.x, lastChild.y + 56px + 20px margin)

Space available? → Use it ✓
Occupied? → Find spider web position ⚠️
```

### Step 3: Spider Web Pattern (if no space)
```
Try these 8 directions in expanding circles:
   ↗ ↑ ↖
  → ☗ ←
   ↘ ↓ ↙

Expand radius: 300px → 450px → 600px → 750px

Stop when a free position found ✓
```

---

## Key Constants

```javascript
NODE_WIDTH = 200px         // Card width
NODE_HEIGHT = 56px         // Card height
MARGIN = 20px              // Gap between nodes
COLLISION_DISTANCE = 100px // Safe distance
```

---

## Examples

### Simple 2-Level (Parent + 1 Child)
```
┌──────────┐
│ Parent   │
└────┬─────┘
     │ [20px gap]
     ▼
┌──────────┐
│ Child 1  │
└──────────┘
[positioned to the RIGHT]
```

### 3-Level (Parent + 2 Children)
```
┌──────────┐
│ Parent   │
└────┬─────┘
     │ [20px gap]
     ▼
┌──────────┐
│ Child 1  │  [RIGHT of parent]
└────┬─────┘
     │ [20px gap]
     ▼
┌──────────┐
│ Child 2  │  [BELOW Child 1, same X]
└──────────┘
```

### Complex Tree (Parent + Children + Grandchildren)
```
              ┌──────────────┐
              │ Central Idea │
              └────────┬─────┘
                       │ [20px]
         ┌─────────────▼─────────────┐
         │                           │
    ┌────▼────┐               ┌──────▼────┐
    │ Child 1  │──[20px]───→ │Grandchild │
    └────┬─────┘               └───────────┘
         │ [20px]
    ┌────▼────┐
    │ Child 2  │
    └─────────┘
```

### Collision Avoidance (Spider Web)
```
When Child 2's normal position is taken:

        ┌────────┐
        │ Parent │
        └────┬───┘
             │
    ┌────────▼────┐
    │ Child 1     │ [RIGHT - first position]
    └─────────────┘
    
Normal position blocked ✗
    │
    ├─ Try UP-RIGHT ✗
    ├─ Try UP ✗
    ├─ Try UP-LEFT ✗
    ├─ Try LEFT ✗
    ├─ Try DOWN-LEFT ✗
    ├─ Try DOWN ✗
    ├─ Try DOWN-RIGHT ✓ Found!
    │
    └─→ ┌────────┐
        │Child 2 │ [Spider web pattern]
        └────────┘
```

---

## How to Test

1. **Go to browser**: http://localhost:5173

2. **Test Basic Hierarchy**:
   ```
   1. Click "Add Idea" (creates parent)
   2. Click "Add Child" on it → should appear RIGHT ✓
   3. Click "Add Child" again → should appear BELOW ✓
   4. Add child to first child → should appear RIGHT ✓
   ```

3. **Test Collision Avoidance**:
   ```
   1. Create parent
   2. Add many children until area fills
   3. Keep adding → should spread in spider pattern ✓
   4. Verify NO overlaps ✓
   ```

---

## Function Locations in Code

**File**: `src/components/MindMap.jsx`

| Function | Lines | Purpose |
|----------|-------|---------|
| `isPositionAvailable()` | 113-129 | Check if position is safe (not occupied) |
| `findAvailablePosition()` | 134-163 | Find free spot using spider web pattern |
| `findStackedPosition()` | 168-209 | Position for standalone nodes (vertical) |
| `findStackedChildPosition()` | 214-252 | **Main logic** - hierarchical positioning |

---

## Performance

- **For typical mind maps** (< 100 nodes): ✓ Fast
- **For large mind maps** (> 200 nodes): Still acceptable
- **Worst case**: Checks 8 directions × 4 radius levels = 32 position checks per collision

---

## Visual Debug Tips

If nodes aren't appearing where expected:

1. **Check Node Counter**: Should increase as you add nodes
2. **Check Console**: No errors should appear
3. **Check Pan/Zoom**: You might be zoomed out too far
4. **Verify Parent**: Click node to see if it has connections
5. **Clear Cache**: Refresh browser (F5) if stuck

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| All children stack down | Collision system disabled | Check `isPositionAvailable()` logic |
| Spider web never triggers | Radius too large or check broken | Reduce initial radius or debug collision detection |
| Nodes overlap | COLLISION_DISTANCE too small | Increase from 100px |
| Nodes too spread out | COLLISION_DISTANCE too large | Decrease from 100px |
| Strange positions | Spider web radius wrong | Adjust multipliers (1x, 1.5x, 2x, 2.5x) |

---

## Next Steps

After testing confirms positioning works:
1. Test emoji picker popup
2. Test notes popup  
3. Test tags popup
4. Test details popup
5. Test date popup
6. Test collaborators popup

All use same Portal pattern for rendering outside canvas context.

---

**Status**: ✅ Ready for testing
**Live at**: http://localhost:5173 🚀
