# 📋 Architecture Guidelines: Mind Planning

A comprehensive guide to the architecture patterns and development practices used in this project.

## Table of Contents

- [Project Structure](#project-structure)
- [Component Patterns](#component-patterns)
- [Hook Patterns](#hook-patterns)
- [Adding New Features](#adding-new-features)
- [Decision Tree](#decision-tree)
- [Best Practices](#best-practices)

---

## Project Structure

### Component Organization
```
src/components/
├── MindMap.jsx              # Main mind map orchestrator
├── MindMapManager.jsx       # Map library manager
├── Dashboard.jsx            # Main dashboard
├── CalendarPage.jsx         # Calendar view
├── RemindersPage.jsx        # Reminders system
├── LeaveRequestPage.jsx     # Leave management
├── TeamMembersManager.jsx   # Team management
├── TeamHierarchy.jsx        # Org structure view
├── ProfilePage.jsx          # User profile
├── SettingsPage.jsx         # User settings
├── mindmap/                 # Mind map specific (43 files)
│   ├── NodeCard.jsx         # Node rendering
│   ├── ConnectionsSvg.jsx   # Connection lines
│   ├── NodeToolbar*.jsx     # Toolbar components
│   ├── ViewSelector.jsx     # View switching
│   ├── ImageAnalyzerModal.jsx  # AI image analysis
│   ├── views/               # Alternative views
│   │   ├── BoardView.jsx
│   │   ├── ListView.jsx
│   │   ├── ExcelView.jsx
│   │   ├── GanttView.jsx
│   │   └── AnalyticsView.jsx
│   └── ...
├── popups/                  # Feature popups (8 files)
│   ├── NotesPopup.jsx
│   ├── TagsPopup.jsx
│   ├── EmojiPicker.jsx
│   ├── ThemePicker.jsx
│   ├── AttachmentsPopup.jsx
│   ├── CollaboratorPicker.jsx
│   ├── DueDatePicker.jsx
│   └── PropertiesPanel.jsx
├── dashboard/               # Dashboard widgets
├── enhanced/                # Enhanced components
└── shared/                  # Reusable components
```

### Hook Organization
```
src/hooks/
├── index.js                 # Hook exports
├── useNodePositioning.ts    # Layout & positioning logic
├── useNodeOperations.ts     # Node CRUD operations
├── useDragging.ts           # Drag & pan interactions
├── useKeyboardShortcuts.ts  # Keyboard shortcuts
├── useNodeSelection.ts      # Selection management
├── useConnectionDrawing.ts  # Connection UI
├── useMindMaps.ts           # Map data & localStorage
├── useMindMapFilters.ts     # Filtering & sorting
├── useNodeHandlers.ts       # Event handlers
└── useDashboardData.ts      # Dashboard state
```

### Context Organization
```
src/context/
├── AuthContext.tsx          # Authentication state
├── ClerkAuthContext.tsx     # Clerk integration
├── LanguageContext.jsx      # i18n context
└── ThemeContext.jsx         # Theme (dark/light)
```

### Utility Organization
```
src/utils/
├── layoutAlgorithms.ts      # Layout algorithms (Tree, Radial, Circular)
├── nodeUtils.js             # Node helper functions
├── dateUtils.ts             # Date formatting
├── dashboardUtils.ts        # Dashboard helpers
├── color.ts                 # Color utilities
└── stringUtils.js           # String helpers
```

---

## Component Patterns

### ✅ PATTERN 1: Controlled Components

Components receive data and callbacks as props, keeping state management in parent:

```jsx
// Good: Controlled component
export function NodeToolbarEmoji({ nodeId, currentEmoji, onEmojiSelect }) {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div className="node-toolbar-btn">
      <button onClick={() => setShowPicker(!showPicker)}>
        {currentEmoji || '😊'}
      </button>
      {showPicker && (
        <EmojiGrid 
          onSelect={(emoji) => {
            onEmojiSelect(nodeId, emoji);
            setShowPicker(false);
          }}
        />
      )}
    </div>
  );
}
```

### ✅ PATTERN 2: Popup Components

Self-contained popups with consistent API:

```jsx
const FeaturePopup = ({ node, onUpdate, onClose }) => {
  const [value, setValue] = useState(node.feature || '');

  const handleSave = () => {
    onUpdate(node.id, { feature: value });
    onClose();
  };

  return (
    <div className="popup">
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};
```

### ✅ PATTERN 3: Dialog Components

Modal dialogs with confirmation:

```jsx
const DeleteConfirmDialog = ({ isOpen, itemName, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Delete {itemName}?</h3>
        <div className="dialog-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} className="danger">Delete</button>
        </div>
      </div>
    </div>
  );
};
```

---

## Hook Patterns

### ✅ PATTERN 1: Feature Hook

For complex state logic:

```typescript
export function useNodePositioning(nodes: Node[], connections: Connection[]) {
  const findStackedChildPosition = useCallback((parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    // ... positioning logic
    return { x, y };
  }, [nodes, connections]);

  return {
    findStackedChildPosition,
    isPositionAvailable,
    // ... more utilities
  };
}
```

### ✅ PATTERN 2: CRUD Hook

For data operations:

```typescript
export function useNodeOperations(nodes, setNodes, connections, setConnections) {
  const addNode = useCallback((nodeData) => {
    const newNode = { id: generateId(), ...nodeData };
    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, [setNodes]);

  const updateNode = useCallback((nodeId, updates) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, ...updates } : n
    ));
  }, [setNodes]);

  return { addNode, updateNode, deleteNode };
}
```

### ✅ PATTERN 3: UI State Hook

For interaction state:

```typescript
export function useNodeSelection() {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  
  const selectNode = useCallback((nodeId: string, multi = false) => {
    setSelectedNodes(prev => {
      if (multi) {
        const next = new Set(prev);
        next.add(nodeId);
        return next;
      }
      return new Set([nodeId]);
    });
  }, []);

  return { selectedNodes, selectNode, clearSelection };
}
```

---

## Adding New Features

### Decision Tree

```
Is it a visual component?
├─ YES → Create in src/components/
│        ├─ Toolbar button? → mindmap/NodeToolbar*.jsx
│        ├─ Dialog/Modal? → mindmap/*Dialog.jsx
│        ├─ Popup? → popups/*.jsx
│        └─ Page? → *.jsx in components root
│
└─ NO → Is it positioning/layout?
        ├─ YES → Add to src/hooks/useNodePositioning.ts
        │        or src/utils/layoutAlgorithms.ts
        │
        └─ NO → Is it node operations?
                ├─ YES → Add to src/hooks/useNodeOperations.ts
                │
                └─ NO → Is it complex state?
                        ├─ YES → Create new hook in src/hooks/
                        └─ NO → Add to existing hook
```

### Quick Checklist

When adding a feature, verify:

- [ ] Is it reusable logic? → Create a hook
- [ ] Is it just UI? → Create a component
- [ ] Is there existing similar code? → Reuse/extend it
- [ ] Does it need testing? → Put logic in a hook
- [ ] Are you copy-pasting code? → Extract to shared utility

---

## Best Practices

### Component Guidelines

1. **Keep components focused** - One responsibility per component
2. **Props over state** - Use controlled components when possible
3. **Extract complex JSX** - If a section is >50 lines, consider extracting
4. **Use TypeScript** - For hooks and utilities
5. **PropTypes for JSX** - Until full TypeScript migration

### Hook Guidelines

1. **Single responsibility** - One purpose per hook
2. **Return object, not array** - For multiple return values
3. **useCallback for functions** - To prevent unnecessary re-renders
4. **Dependencies array** - Keep it accurate
5. **Compose hooks** - Build complex behavior from simple hooks

### File Organization

1. **Feature folders** - Group related files together
2. **Index files** - Export from index.js for clean imports
3. **Consistent naming** - Component: PascalCase, Hook: useCamelCase
4. **Comments** - Document complex logic

### Code Style

1. **Formatting** - Use Prettier/ESLint
2. **Imports** - Group by external, internal, types
3. **Error handling** - Use try/catch for async operations
4. **Loading states** - Show feedback during operations

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| React 19 | UI library with hooks |
| TypeScript | Type safety for hooks/utils |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations |
| Clerk | Authentication |
| React Router | Client-side routing |
| Vite | Build tool |

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview & setup |
| [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md) | Testing procedures |
| [AI_IMAGE_ANALYZER_SETUP.md](./AI_IMAGE_ANALYZER_SETUP.md) | AI feature setup |
| [SUPABASE_CLERK_SETUP.md](./SUPABASE_CLERK_SETUP.md) | Auth configuration |
| [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) | Additional testing docs |
| [docs/DASHBOARD_ARCHITECTURE.md](./docs/DASHBOARD_ARCHITECTURE.md) | Dashboard architecture |

---

**Last Updated**: December 21, 2025  
**Status**: Actively Maintained ✅
