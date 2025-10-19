# 🚀 Quick Start: Using the New Architecture

## You Were Right! ✅

You called out the monolith pattern in MindMap.jsx. Here's the solution:

### What We Just Created

```
✅ src/types/mindmap.ts
   └─ Shared TypeScript types (Node, Connection, Position, etc.)

✅ src/hooks/useNodePositioning.ts  
   └─ All positioning logic extracted
   └─ Functions: isPositionAvailable, findAvailablePosition, 
                 findStackedPosition, findStackedChildPosition

✅ src/hooks/useNodeOperations.ts
   └─ All node CRUD extracted
   └─ Functions: addStandaloneNode, addChildNode, deleteNodes,
                 updateNodeText, toggleNodeComplete, etc.

📋 NEXT: Update MindMap.jsx to USE these hooks (not implement them)
```

---

## How MindMap.jsx Should Look After Update

### Current (BAD) - All logic in one component
```jsx
export function MindMap() {
  // 100+ lines of state
  const [nodes, setNodes] = useState([...]);
  const [connections, setConnections] = useState([...]);
  // ... more state ...

  // 150+ lines of functions  
  const isPositionAvailable = (x, y) => { /* ... */ };
  const findAvailablePosition = (cx, cy) => { /* ... */ };
  const findStackedPosition = (bx, by) => { /* ... */ };
  const findStackedChildPosition = (pid, px, py) => { /* ... */ };
  const addStandaloneNode = () => { /* ... */ };
  const deleteNodes = (ids) => { /* ... */ };
  // ... more functions ...

  // 600+ lines of JSX
  return (
    <div>
      {/* Everything */}
    </div>
  );
}
```

### Future (GOOD) - Clean orchestrator
```jsx
import { useNodePositioning } from '../hooks/useNodePositioning';
import { useNodeOperations } from '../hooks/useNodeOperations';

export function MindMap() {
  // STATE ONLY (minimal)
  const [nodes, setNodes] = useState([...]);
  const [connections, setConnections] = useState([...]);
  // ... UI state only (selectedNodes, mode, etc.) ...

  // HOOKS (business logic)
  const { 
    findStackedPosition, 
    findStackedChildPosition 
  } = useNodePositioning(nodes, connections);

  const { 
    addStandaloneNode, 
    addChildNode, 
    deleteNodes,
    updateNodeText
  } = useNodeOperations(
    nodes, 
    connections, 
    setNodes, 
    setConnections, 
    isDarkMode,
    findStackedPosition,
    findStackedChildPosition
  );

  // HANDLERS (clean & simple)
  const handleAddNode = () => addStandaloneNode();
  const handleAddChild = (parentId) => addChildNode(parentId);

  // RENDERING (60% less code)
  return (
    <div>
      {/* Cleaner JSX, less logic */}
    </div>
  );
}
```

---

## The Pattern

### BEFORE You Make Changes
```
❌ DON'T: Add to MindMap.jsx
   ├─ const [state, setState] = useState(...)
   ├─ const handler = () => { /* complex logic */ };
   └─ Result: File keeps growing → Monolith

✅ DO: Create hook or component
   ├─ src/hooks/useFeature.ts (logic)
   ├─ src/components/mindmap/FeatureComponent.jsx (UI)
   └─ Result: Modular, testable, clean
```

### When Adding a Toolbar Button
```
✅ Create: src/components/mindmap/NodeToolbarMyFeature.jsx
   └─ Self-contained component
   └─ Props: { nodeId, onAction, state }

✅ Use in MindMap.jsx:
   import NodeToolbarMyFeature from './mindmap/NodeToolbarMyFeature';
   <NodeToolbarMyFeature nodeId={...} onAction={...} />

❌ DON'T: Put toolbar logic in MindMap.jsx
```

### When Adding Positioning Logic
```
✅ Add to: src/hooks/useNodePositioning.ts
   const findMyLayout = (parentId) => { /* ... */ };

✅ Use in MindMap.jsx:
   const { findMyLayout } = useNodePositioning(nodes, connections);

❌ DON'T: Create nested functions in MindMap.jsx
```

### When Adding Node Operations
```
✅ Add to: src/hooks/useNodeOperations.ts
   const myOperation = (nodeId) => { /* ... */ };

✅ Use in MindMap.jsx:
   const { myOperation } = useNodeOperations(...);

❌ DON'T: Implement directly in MindMap.jsx
```

---

## File Size Target

| Component | Lines | Status |
|-----------|-------|--------|
| MindMap.jsx | 550-600 | GOAL (after Phase 5) |
| useNodePositioning.ts | 140 | ✅ DONE |
| useNodeOperations.ts | 80 | ✅ DONE |
| useDragging.ts | 60 | 📋 TODO |
| *Dialog.jsx files | 30-50 | ✅ Good |
| NodeToolbar*.jsx | 20-40 | ✅ Good |

**Total**: Modular across files instead of monolithic in one

---

## Your Next Feature - DO THIS

Let's say you want to add a "Priority Tags" feature:

### ❌ Wrong Way
```jsx
// In MindMap.jsx - NO!
const [priorityTags, setPriorityTags] = useState({});
const addPriorityTag = (nodeId, tag) => { /* ... */ };
const removePriorityTag = (nodeId, tag) => { /* ... */ };
// ... now MindMap.jsx is bigger again
```

### ✅ Right Way

**Step 1**: Create hook
```typescript
// src/hooks/useNodePriority.ts
export function useNodePriority(nodes, setNodes) {
  const addPriorityTag = useCallback((nodeId, tag) => {
    updateNode(nodeId, n => ({
      ...n,
      priorityTags: [...(n.priorityTags || []), tag]
    }));
  }, [/* deps */]);
  
  return { addPriorityTag, removePriorityTag };
}
```

**Step 2**: Create component (optional)
```jsx
// src/components/mindmap/NodeToolbarPriority.jsx
export function NodeToolbarPriority({ nodeId, tags, onAddTag }) {
  return (
    <div className="node-toolbar-btn">
      {/* Priority UI here */}
    </div>
  );
}
```

**Step 3**: Use in MindMap.jsx (minimal)
```jsx
import { useNodePriority } from '../hooks/useNodePriority';
import NodeToolbarPriority from './mindmap/NodeToolbarPriority';

export function MindMap() {
  const { addPriorityTag } = useNodePriority(nodes, setNodes);
  
  return (
    <>
      {/* ... existing code ... */}
      <NodeToolbarPriority 
        nodeId={node.id}
        tags={node.priorityTags}
        onAddTag={(tag) => addPriorityTag(node.id, tag)}
      />
    </>
  );
}
```

**Result**: 
- MindMap.jsx: +2 lines (import + render)
- New hook: +50 lines (well organized)
- New component: +40 lines (self-contained)
- Total: Modular, testable, maintainable ✅

---

## Checklist for New Features

Before implementing, ask:

- [ ] Is this positioning/collision? → `useNodePositioning.ts`
- [ ] Is this node CRUD? → `useNodeOperations.ts`
- [ ] Is this drag/pan? → `useDragging.ts`
- [ ] Is this UI only? → New component in `mindmap/`
- [ ] Is this complex state? → New hook in `hooks/`
- [ ] Will it be <10 lines? → OK to add to MindMap.jsx
- [ ] Will it be >10 lines? → Extract to hook/component
- [ ] Is it reusable? → Hook or component
- [ ] Is it testable? → Hook (not in component)

If ANY checkbox is true for "extract", **DON'T add to MindMap.jsx**

---

## Progress

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create types | ✅ DONE |
| 2 | Extract positioning | ✅ DONE |
| 3 | Extract operations | ✅ DONE |
| 4 | Extract dragging | 📋 NEXT |
| 5 | Update MindMap.jsx | 📋 AFTER 4 |

---

**Remember**: If your MindMap.jsx is getting bigger, that's the signal to extract to a hook! 

Keep it as the **orchestrator**, not the **implementation**. 🚀
