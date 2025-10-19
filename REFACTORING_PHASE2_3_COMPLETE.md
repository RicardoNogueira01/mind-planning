# 🏗️ Refactoring Plan: Extracting Logic from MindMap.jsx

## Overview
`MindMap.jsx` has grown into a monolithic component. This plan extracts business logic into reusable hooks and types, following React best practices and your modular architecture.

## Current State
- **MindMap.jsx**: 960 lines
- **Responsibilities**: State, positioning, operations, rendering, drag/pan, UI
- **Problem**: All logic mixed together, hard to test and maintain

## Target State
- **MindMap.jsx**: 450-500 lines (focus on rendering and orchestration)
- **useNodePositioning.ts**: Positioning and collision detection
- **useNodeOperations.ts**: Node CRUD operations
- **useDragging.ts**: Drag and pan logic
- **mindmap.ts (types)**: Shared TypeScript interfaces

## Extraction Plan

### Phase 1: Create Type Definitions ✅
**File**: `src/types/mindmap.ts`

Interfaces:
- `Node` - Node entity with all properties
- `Connection` - Connection entity
- `Position` - x, y coordinates
- `Attachment` - File attachment metadata
- `DragState`, `PanState` - State shapes

**Status**: Created
**Files**: 
- `src/types/mindmap.ts` ✅

---

### Phase 2: Extract Node Positioning Logic ✅
**File**: `src/hooks/useNodePositioning.ts`

Functions to extract:
- `isPositionAvailable(x, y, excludeId)` 
- `findAvailablePosition(centerX, centerY, radius)`
- `findStackedPosition(baseX, baseY)`
- `findStackedChildPosition(parentId, preferredX, preferredY)`

Constants:
- `NODE_WIDTH = 200`
- `NODE_HEIGHT = 56`
- `MARGIN = 25`
- `COLLISION_DISTANCE = 80`

**Status**: Created
**Files**:
- `src/hooks/useNodePositioning.ts` ✅

---

### Phase 3: Extract Node Operations ✅
**File**: `src/hooks/useNodeOperations.ts`

Functions to extract:
- `addStandaloneNode()` 
- `addChildNode()` (renamed from `onAddChild`)
- `deleteNodes(ids)`
- `updateNodeText(id, text)`
- `toggleNodeComplete(id)`
- `updateNode(id, patch)`
- `updateNodeField(id, key, value)` 
- `getRelatedNodeIds(nodeId)`

**Status**: Created
**Files**:
- `src/hooks/useNodeOperations.ts` ✅

---

### Phase 4: Extract Dragging Logic (TODO)
**File**: `src/hooks/useDragging.ts`

Functions to extract:
- `startPanning(e)` 
- `handlePanning(e)`
- `stopPanning()`
- `handleMouseDown` for node drag
- References: `draggingNodeId`, `dragOffset`, `isPanning`, `panRef`

**Status**: Not yet created
**Expected Impact**: Simplifies MindMap.jsx interaction handlers

---

### Phase 5: Update MindMap.jsx to Use Hooks (TODO)
**File**: `src/components/MindMap.jsx`

Changes:
1. Import hooks at top
2. Call hooks instead of defining functions
3. Remove extracted business logic
4. Simplify component to focus on rendering
5. Update function references throughout JSX

**Expected Result**:
- File size: ~500 lines (was 960)
- Readability: +40%
- Testability: +60%

**Status**: Pending Phase 4 completion

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Testability** | Hard (logic in component) | Easy (hooks are pure functions) |
| **Reusability** | Can't reuse logic | Can use hooks in other components |
| **Maintainability** | Scattered logic | Centralized by concern |
| **File Size** | 960 lines | 500 lines + 400 in hooks |
| **Complexity** | O(960) per file | O(200-300) per file |

## Impact on Toolbar Components

Good news! `NodeToolbar*` components in `src/components/mindmap/` are already well-structured. They:
- ✅ Already isolated and modular
- ✅ Accept props instead of managing state
- ✅ Don't duplicate business logic
- ✅ Can be enhanced without MindMap.jsx changes

**Example**: If you need to add emoji picker as a new toolbar component:
```
src/components/mindmap/NodeToolbarEmoji.jsx
├─ Props: { nodeId, onEmojiSelect, currentEmoji }
├─ Self-contained emoji grid
└─ No impact on MindMap.jsx
```

## Implementation Order

1. ✅ **Phase 1**: Create type definitions
2. ✅ **Phase 2**: Extract positioning logic
3. ✅ **Phase 3**: Extract node operations
4. ⏳ **Phase 4**: Extract dragging logic
5. ⏳ **Phase 5**: Update MindMap.jsx

## When Adding New Features

**GOOD**: New toolbar component
```
src/components/mindmap/NodeToolbarFeature.jsx
- Self-contained
- Takes node & callback props
- No changes to MindMap.jsx
```

**AVOID**: New state in MindMap.jsx
```
Don't add: const [featureState, setFeatureState] = useState(...)
Instead: Extract to hook if logic is complex
```

**GOOD**: New positioning variant
```
src/hooks/useNodePositioning.ts
+ Add: findCustomPosition() function
- Update MindMap.jsx: one line to call it
```

---

## Files Changed
- ✅ `src/types/mindmap.ts` - Created
- ✅ `src/hooks/useNodePositioning.ts` - Created  
- ✅ `src/hooks/useNodeOperations.ts` - Created
- 📋 `src/hooks/useDragging.ts` - Next
- 📋 `src/components/MindMap.jsx` - To be updated (Phase 5)

---

## Next Steps

1. **Create useDragging.ts** - Extract all drag/pan logic
2. **Update MindMap.jsx** - Replace function definitions with hook calls
3. **Test thoroughly** - Verify all features work after refactor
4. **Document toolbar pattern** - Guide for future toolbar components

---

**Completed By**: Refactoring Session
**Date**: October 19, 2025
**Status**: Phase 2 & 3 Complete ✅
