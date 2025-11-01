# 🧪 UNDO/REDO TESTING & VERIFICATION GUIDE

## Quick Start Testing

### 1. Start the Dev Server
```powershell
npm run dev
```
Visit `http://localhost:5173`

### 2. Test Basic Undo/Redo

**Test Case 1: Add Node and Undo**
1. Canvas appears with "Central Idea" node
2. Click "Add Node" button (top toolbar)
3. New node appears on canvas
4. Click "Undo" button in top toolbar
5. ✅ Node should disappear
6. Click "Redo" button
7. ✅ Node should reappear

**Test Case 2: Change Node Color and Undo**
1. Click on a node to select it
2. Click the node toolbar (should expand)
3. Click background color button (paint bucket icon)
4. Select a new color
5. ✅ Node color changes
6. Click "Undo" in top toolbar
7. ✅ Color should revert
8. Click "Redo"
9. ✅ Color should return

**Test Case 3: Move Node and Undo**
1. Click on a node
2. Drag it to a new position
3. Release mouse
4. Click "Undo"
5. ✅ Node should return to original position
6. Click "Redo"
7. ✅ Node should move back to new position

---

## Advanced Testing

### Test Case 4: Multiple Undo/Redo Sequence
1. Start with blank canvas (just "Central Idea")
2. Add Node 1 → Undo → ✅ Gone
3. Redo → ✅ Returns
4. Add Node 2 → ✅ Now have 2 nodes
5. Change Node 1 color to red → ✅ Color changed
6. Add Node 3 → ✅ Now have 3 nodes
7. **Undo 3 times** → ✅ Should return to just "Central Idea"
8. **Redo 3 times** → ✅ Should show all 3 nodes with red color on Node 1

### Test Case 5: Undo After Action Clears Redo
1. Add Node 1
2. Add Node 2
3. Undo → Should remove Node 2
4. ✅ Redo button should be **enabled**
5. Add Node 3
6. ✅ Redo button should now be **disabled**
   - (You performed a new action, so there's nothing to redo anymore)

### Test Case 6: Complex State Changes
1. Add Node 1
2. Add Node 2 as child of Node 1
3. Change Node 1 color
4. Change Node 2 color
5. Add connection between nodes
6. Add tag to Node 1
7. **Undo 4 times** → Should be back to just Node 1 with original color
8. **Redo 2 times** → Should have Node 1 (red) and Node 2 (blue) and their colors

### Test Case 7: History Limit (50 states)
1. Rapidly add 60 nodes (one at a time with short delays)
2. Try to undo past 50 changes
3. ✅ Should only be able to undo 50 changes max
4. Undo button should become disabled after 50 undos

---

## Button State Testing

### Undo Button Behavior

**Should be ENABLED when**:
- [ ] At least one action has been performed
- [ ] `historyIndex > 0`
- [ ] There are states to go back to

**Should be DISABLED when**:
- [ ] At the beginning (no history)
- [ ] `historyIndex === 0`
- [ ] Just started the app

### Redo Button Behavior

**Should be ENABLED when**:
- [ ] You've clicked Undo at least once
- [ ] `historyIndex < history.length - 1`
- [ ] There are states to go forward to

**Should be DISABLED when**:
- [ ] You're at the current state (no future to redo)
- [ ] `historyIndex === history.length - 1`
- [ ] You just performed a new action after undo

---

## Operations That Should Be Tracked

### ✅ These Should Create History Snapshots

- [ ] Add new node
- [ ] Delete node
- [ ] Drag node to new position
- [ ] Change node background color
- [ ] Change node text
- [ ] Add child node
- [ ] Delete connection
- [ ] Create connection
- [ ] Add/remove tag
- [ ] Add attachment
- [ ] Add note
- [ ] Change priority
- [ ] Change status
- [ ] Change due date
- [ ] Add/remove collaborator

### Test Each Operation
For each operation above:
1. Perform the operation
2. Undo
3. ✅ Verify state reverts
4. Redo
5. ✅ Verify state restores

---

## Edge Cases & Stress Testing

### Test Case 8: Rapid Clicking
1. Add a node
2. Rapidly click Undo/Redo 10 times
3. ✅ Should not crash
4. ✅ Should end up in correct state
5. ✅ No memory leaks or errors in console

### Test Case 9: Browser Console Check
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform various undo/redo operations
4. ✅ No red errors should appear
5. ✅ Verify no warnings about missing history

### Test Case 10: State Consistency
1. Add 5 nodes with various connections
2. Undo all the way back to start
3. Redo all the way forward
4. ✅ Final state should be identical to before undo
5. ✅ All node properties should be correct
6. ✅ All connections should be preserved

### Test Case 11: Undo After Rapid Actions
1. Quickly add node → change color → move → add tag
2. Undo 4 times rapidly
3. ✅ Should cleanly return to initial state
4. ✅ No partial states or inconsistencies

---

## Visual Verification

### Toolbar Icons

**Top Toolbar Should Show** (Left side of screen):
```
[⬅️] [➖] [👤] [✋] [➕] [🗑️] [↶] [↷] [✨]
 ^    ^    ^    ^    ^    ^    ^    ^    ^
Back  Sel  Col  Pan  Add  Del  Undo Redo FX
```

**Undo/Redo Buttons**:
- When `historyIndex === 0`: Undo button should look **disabled** (grayed out/faded)
- When `historyIndex > 0`: Undo button should look **enabled** (bright/clickable)
- When `historyIndex < history.length - 1`: Redo button should look **enabled**
- When `historyIndex === history.length - 1`: Redo button should look **disabled**

---

## Keyboard Shortcuts (If Implemented)

If your MindMapToolbar has keyboard shortcuts:
- [ ] `Ctrl+Z` should call `undo()`
- [ ] `Ctrl+Y` or `Ctrl+Shift+Z` should call `redo()`

Test:
1. Add a node
2. Press `Ctrl+Z`
3. ✅ Should undo
4. Press `Ctrl+Y`
5. ✅ Should redo

---

## Performance Testing

### Test Case 12: Large Number of Nodes
1. Add 100 nodes
2. Perform 10 undo/redo operations
3. Check DevTools Performance tab
4. ✅ Each undo/redo should complete in <100ms
5. ✅ No frame drops or stuttering

### Test Case 13: Memory Usage
1. Open DevTools → Memory tab
2. Take heap snapshot at start
3. Add 50 nodes
4. Undo/redo 20 times
5. Take another heap snapshot
6. ✅ Memory growth should be reasonable
7. ✅ No excessive memory consumption

---

## Known Limitations & Expected Behavior

### Current Limitations
- History limited to 50 states (older states are discarded)
- History is cleared when browser tab is closed (not persistent)
- Large history may slow down very complex mind maps

### Expected Behavior
- Undo/Redo should be instant (<50ms)
- All node properties should restore perfectly
- All connections should restore perfectly
- No data loss during undo/redo operations

---

## Bug Reporting Checklist

If you find an issue with undo/redo, check:

- [ ] What operation triggered the bug?
- [ ] Can you reproduce it consistently?
- [ ] What's the expected behavior vs actual behavior?
- [ ] Check browser console for errors
- [ ] How many undo/redo operations before the bug?
- [ ] Does it happen with simple cases or only complex ones?

---

## Success Criteria ✅

**Undo/Redo implementation is successful when:**

✅ Undo button works and reverts changes
✅ Redo button works and restores changes
✅ Buttons are properly enabled/disabled
✅ History tracks all node/connection changes
✅ State is consistently restored (no partial updates)
✅ Performance is smooth (no lag or stuttering)
✅ No errors in browser console
✅ Can undo/redo complex sequences of operations
✅ History limited to 50 items (prevents memory bloat)
✅ New actions after undo clear the redo history

---

## Summary

This testing guide covers:
- Basic functionality tests
- Advanced multi-operation tests
- Button state verification
- Edge cases and stress tests
- Performance benchmarks
- Visual verification
- Known limitations

**All tests should pass for production-ready undo/redo system.**

Current Status: 🟢 **IMPLEMENTATION COMPLETE - READY FOR TESTING**

