# 📋 Architecture Guidelines: Adding Features to Mind Planning

## Current Architecture

### Component Organization
```
src/components/
├── MindMap.jsx (MAIN ORCHESTRATOR - to be refactored)
├── mindmap/
│   ├── MindMapToolbar.jsx - Top toolbar UI
│   ├── MindMapCanvas.jsx - Canvas wrapper
│   ├── NodeCard.jsx - Individual node rendering
│   ├── ConnectionsSvg.jsx - Connection lines
│   ├── NodeToolbar*.jsx - Per-node toolbar buttons (✓ PATTERN)
│   ├── ShapePalette.jsx - Shape quick-add
│   ├── CollaboratorDialog.jsx - Modal dialog
│   ├── builders.ts - Shape builders
│   ├── graphUtils.ts - Graph traversal
│   └── constants.js - UI constants
```

### Hook Organization
```
src/hooks/
├── useDashboardData.ts - Dashboard-specific
├── useNodePositioning.ts ✅ NEW - Positioning logic
└── useNodeOperations.ts ✅ NEW - Node CRUD

src/types/
└── mindmap.ts ✅ NEW - Shared TypeScript types
```

---

## Pattern: Adding a New Feature

### ❌ ANTI-PATTERN: Add everything to MindMap.jsx
```jsx
// DON'T DO THIS
export function MindMap() {
  const [state1, setState1] = useState(...);
  const [state2, setState2] = useState(...);
  const [state3, setState3] = useState(...);
  
  const handler1 = () => { /* ... */ };
  const handler2 = () => { /* ... */ };
  const handler3 = () => { /* ... */ };
  
  return (
    <div>
      {/* Everything here */}
    </div>
  );
}
// Result: 1500+ line monolith 😱
```

### ✅ PATTERN 1: New Toolbar Component (Recommended)

**Goal**: Add emoji picker to node toolbar

**Steps**:

1. Create component file:
```
src/components/mindmap/NodeToolbarEmoji.jsx
```

2. Implement as **controlled, stateless** component:
```jsx
export function NodeToolbarEmoji({ nodeId, currentEmoji, onEmojiSelect }) {
  const [showPicker, setShowPicker] = useState(false);
  
  const EMOJI_GRID = ['😀', '😂', '🎉', '🚀', '💡', '❤️'];
  
  return (
    <div className="node-toolbar-btn">
      <button onClick={() => setShowPicker(!showPicker)}>
        {currentEmoji || '😊'}
      </button>
      {showPicker && (
        <div className="emoji-grid">
          {EMOJI_GRID.map(emoji => (
            <button 
              key={emoji}
              onClick={() => {
                onEmojiSelect(nodeId, emoji);
                setShowPicker(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

3. Update MindMap.jsx **only** for integration:
```jsx
import NodeToolbarEmoji from './mindmap/NodeToolbarEmoji';

// In component rendering:
<NodeToolbarEmoji 
  nodeId={node.id}
  currentEmoji={node.emoji}
  onEmojiSelect={(nodeId, emoji) => 
    updateNode(nodeId, { emoji })
  }
/>
```

**Benefits**:
- ✅ Emoji picker is self-contained
- ✅ Can be tested independently
- ✅ MindMap.jsx only has **3 lines added**
- ✅ Reusable in other components

---

### ✅ PATTERN 2: New Positioning Algorithm (Recommended)

**Goal**: Add "circle layout" positioning for children

**Steps**:

1. Add function to `src/hooks/useNodePositioning.ts`:
```typescript
export function useNodePositioning(...) {
  // ... existing functions ...
  
  const findCircleChildPosition = useCallback((parentId, childIndex, totalChildren) => {
    const parent = nodes.find(n => n.id === parentId);
    const radius = 150;
    const angle = (childIndex / totalChildren) * (2 * Math.PI);
    
    return {
      x: parent.x + Math.cos(angle) * radius,
      y: parent.y + Math.sin(angle) * radius
    };
  }, [nodes]);
  
  return {
    // ... existing returns ...
    findCircleChildPosition  // ← NEW
  };
}
```

2. Use in MindMap.jsx:
```jsx
const { findStackedChildPosition, findCircleChildPosition } = useNodePositioning(nodes, connections);

// Update onAddChild to accept layoutMode parameter
const onAddChild = (parentId, layoutMode = 'stacked') => {
  const positions = {
    stacked: () => findStackedChildPosition(parentId, ...),
    circle: () => findCircleChildPosition(parentId, ...)
  };
  const { x, y } = positions[layoutMode]();
  // ... rest of logic ...
};
```

**Benefits**:
- ✅ Positioning logic stays in hook
- ✅ MindMap.jsx only uses it
- ✅ Easy to add more layouts: 'grid', 'spiral', etc.

---

### ✅ PATTERN 3: New State/Behavior

**Goal**: Add "quick-tags" feature

**Steps**:

1. **Option A: Simple state** → Add to useNodeOperations:
```typescript
export function useNodeOperations(...) {
  const addTag = useCallback((nodeId, tag) => {
    updateNode(nodeId, n => ({
      ...n,
      tags: [...(n.tags || []), tag]
    }));
  }, [updateNode]);
  
  return { addTag, /* ... rest ... */ };
}
```

2. **Option B: Complex state** → Create dedicated hook:
```typescript
// src/hooks/useNodeTags.ts
export function useNodeTags(nodes, setNodes) {
  const addTag = useCallback(...);
  const removeTag = useCallback(...);
  const updateTagColor = useCallback(...);
  
  return { addTag, removeTag, updateTagColor };
}
```

3. Use in MindMap.jsx:
```jsx
const { addTag, removeTag } = useNodeTags(nodes, setNodes);

// In rendering or handlers
<button onClick={() => addTag(nodeId, 'urgent')}>Add Tag</button>
```

**Benefits**:
- ✅ Logic separated from rendering
- ✅ Easier to test
- ✅ Can be used by other components

---

## Decision Tree: Where Should This Go?

```
Is it a visual component?
├─ YES → Create component in src/components/mindmap/
│        └─ Toolbar button? → NodeToolbar*.jsx
│        └─ Dialog/Modal? → *Dialog.jsx
│        └─ Rendering helper? → Already exists
│
├─ NO → Is it positioning/layout?
│       ├─ YES → Add to src/hooks/useNodePositioning.ts
│       │
│       ├─ NO → Is it node operations (add/delete/update)?
│       │       ├─ YES → Add to src/hooks/useNodeOperations.ts
│       │       │
│       │       ├─ NO → Is it complex state behavior?
│       │       │       ├─ YES → Create src/hooks/useFeature.ts
│       │       │       └─ NO → Add to useNodeOperations.ts
│       │
│       └─ NO → Is it drag/pan/mouse interaction?
│               └─ YES → Add to src/hooks/useDragging.ts (TODO)
```

---

## Examples of Refactored Features

### Feature: Node Emoji (Currently in MindMap.jsx)
**Before**: 15+ lines in MindMap.jsx
**After**:
- Component: `NodeToolbarEmoji.jsx` (40 lines)
- MindMap.jsx: 2 lines (import + render)

### Feature: Hierarchical Positioning (Current)
**Before**: 140 lines in MindMap.jsx
**After**:
- Hook: `useNodePositioning.ts` (140 lines)
- MindMap.jsx: 1 line (const {...} = useNodePositioning(...))

### Feature: Node CRUD (Currently scattered)
**Before**: 60+ lines scattered in MindMap.jsx
**After**:
- Hook: `useNodeOperations.ts` (80 lines)
- MindMap.jsx: 1 line (const {...} = useNodeOperations(...))

---

## Current Status

| Layer | Status | Notes |
|-------|--------|-------|
| **Types** | ✅ Done | `src/types/mindmap.ts` |
| **Positioning** | ✅ Done | `src/hooks/useNodePositioning.ts` |
| **Operations** | ✅ Done | `src/hooks/useNodeOperations.ts` |
| **Dragging** | 🔲 TODO | `src/hooks/useDragging.ts` (next) |
| **MindMap.jsx** | 🔲 TODO | Update to use hooks (Phase 5) |
| **Toolbar Comps** | ✅ Good | Already modular! |

---

## Next Time You Add a Feature

1. **Check the decision tree** above
2. **Follow the pattern** for that layer
3. **Keep MindMap.jsx** as orchestrator (importing & rendering)
4. **Write tests** for hook logic (separate from component)
5. **Document** with comments if logic is complex

---

## Quick Checklist

Adding a new feature? Use this:

- [ ] Is it reusable business logic? → Create a hook
- [ ] Is it just UI? → Create a component
- [ ] Is it complex state? → Dedicated hook
- [ ] Does it need testing? → Put it in a hook
- [ ] Will MindMap.jsx exceed 600 lines? → Extract to hook/component
- [ ] Are you copy-pasting code? → Extract to shared function/hook

---

**Architecture Owner**: Your Refactoring
**Last Updated**: October 19, 2025
**Status**: Actively Being Implemented ✅
