# 🚀 Feature Implementation Plan - Mind Planning

## Priority Features Implementation Roadmap

This document provides detailed implementation plans for the top 3 high-impact features that will significantly enhance the Mind Planning application.

---

## 🎯 **Feature 1: Templates & Smart Layouts**

### Overview
Pre-built templates and intelligent auto-layout algorithms to help users quickly create structured mind maps and reorganize existing ones.

### Business Value
- **Reduces time-to-productivity** by 70% for new users
- **Increases adoption** for specific use cases (project planning, meetings, brainstorming)
- **Differentiates** from competitors with smart AI-powered layouts

### Technical Implementation

#### 1.1 Template System

**File Structure:**
```
src/
  templates/
    TemplateGallery.jsx          # Template selection UI
    TemplatePreview.jsx           # Template preview card
    templateDefinitions.ts        # Template data structures
    templateEngine.ts             # Template instantiation logic
  hooks/
    useTemplates.ts               # Template management hook
```

**Template Definition Schema:**
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'meeting' | 'analysis' | 'brainstorm' | 'personal';
  thumbnail: string;
  tags: string[];
  nodeStructure: {
    nodes: Node[];
    connections: Connection[];
    layout: 'spider-web' | 'tree' | 'radial' | 'grid';
  };
  customization: {
    allowColorChange: boolean;
    allowStructureChange: boolean;
    requiredFields: string[];
  };
}
```

**Templates to Build:**

1. **Project Planning Template**
   - Root: Project Name
   - Level 1: Goals, Timeline, Resources, Risks
   - Level 2: Milestones under Goals
   - Level 3: Tasks under Milestones
   - Auto-assigns due dates in sequence
   - Color-coded by phase

2. **Meeting Notes Template**
   - Root: Meeting Title
   - Level 1: Attendees, Agenda, Discussion, Actions
   - Level 2: Individual topics under each
   - Pre-filled collaborator slots
   - Timestamp nodes

3. **SWOT Analysis Template**
   - Root: Analysis Topic
   - Level 1: Strengths, Weaknesses, Opportunities, Threats
   - 4-quadrant visual layout
   - Color-coded sections (green, red, blue, yellow)

4. **OKR Template**
   - Root: Quarter/Year
   - Level 1: Objectives (3-5)
   - Level 2: Key Results (3-5 per objective)
   - Progress tracking enabled by default
   - Due dates set quarterly

5. **Brainstorming Template**
   - Root: Topic
   - Level 1: Ideas (5 pre-filled nodes)
   - Encourages divergent thinking
   - No structure constraints

**Implementation Steps:**

**Phase 1: Data Layer (2-3 days)**
```typescript
// src/templates/templateDefinitions.ts
export const templates: Template[] = [
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Structured template for planning projects with goals, milestones, and tasks',
    category: 'project',
    thumbnail: '/templates/project-planning.svg',
    tags: ['project', 'planning', 'goals', 'tasks'],
    nodeStructure: {
      nodes: [
        { id: 'root', text: 'Project Name', x: 500, y: 300, bgColor: '#3B82F6', fontColor: '#FFFFFF' },
        { id: 'goals', text: 'Goals', x: 300, y: 200, bgColor: '#10B981', fontColor: '#FFFFFF' },
        { id: 'timeline', text: 'Timeline', x: 700, y: 200, bgColor: '#F59E0B', fontColor: '#FFFFFF' },
        { id: 'resources', text: 'Resources', x: 300, y: 400, bgColor: '#8B5CF6', fontColor: '#FFFFFF' },
        { id: 'risks', text: 'Risks', x: 700, y: 400, bgColor: '#EF4444', fontColor: '#FFFFFF' },
      ],
      connections: [
        { id: 'c1', from: 'root', to: 'goals' },
        { id: 'c2', from: 'root', to: 'timeline' },
        { id: 'c3', from: 'root', to: 'resources' },
        { id: 'c4', from: 'root', to: 'risks' },
      ],
      layout: 'spider-web'
    },
    customization: {
      allowColorChange: true,
      allowStructureChange: true,
      requiredFields: ['text']
    }
  },
  // ... more templates
];
```

**Phase 2: Template Engine (2-3 days)**
```typescript
// src/templates/templateEngine.ts
export function instantiateTemplate(
  template: Template,
  centerX: number,
  centerY: number,
  customization?: Partial<Template['customization']>
): { nodes: Node[], connections: Connection[] } {
  // 1. Clone template structure
  // 2. Generate unique IDs
  // 3. Position nodes relative to center
  // 4. Apply color scheme
  // 5. Return instantiated structure
}

export function applyTemplateToExistingMap(
  template: Template,
  existingNodes: Node[],
  existingConnections: Connection[],
  parentNodeId: string
): { nodes: Node[], connections: Connection[] } {
  // Attach template as subtree to existing node
}
```

**Phase 3: UI Components (3-4 days)**
```jsx
// src/templates/TemplateGallery.jsx
export default function TemplateGallery({ onSelectTemplate, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const filteredTemplates = templates.filter(t => 
    (selectedCategory === 'all' || t.category === selectedCategory) &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[80vh] flex flex-col">
        {/* Header with search and filters */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-4">Choose a Template</h2>
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          <div className="flex gap-2">
            {['all', 'project', 'meeting', 'analysis', 'brainstorm', 'personal'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === cat 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplatePreview
                key={template.id}
                template={template}
                onClick={() => onSelectTemplate(template)}
              />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border rounded-lg">
            Cancel
          </button>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg">
            Start from Blank
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Phase 4: Integration with MindMap (1-2 days)**
```jsx
// Add to MindMap.jsx toolbar
<button
  onClick={() => setShowTemplateGallery(true)}
  className="toolbar-btn"
  title="Use Template"
>
  <LayoutTemplate size={20} />
</button>

{showTemplateGallery && (
  <TemplateGallery
    onSelectTemplate={(template) => {
      const { nodes: newNodes, connections: newConns } = instantiateTemplate(
        template,
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      setNodes(newNodes);
      setConnections(newConns);
      setShowTemplateGallery(false);
    }}
    onClose={() => setShowTemplateGallery(false)}
  />
)}
```

#### 1.2 Auto-Layout Algorithms

**Layout Types to Implement:**

1. **Spider-Web (Already exists - enhance)**
   - Current hierarchical positioning
   - Improve with collision detection
   - Add animation transitions

2. **Force-Directed Layout**
   - Physics-based node positioning
   - Nodes repel, connections attract
   - Iterative simulation until stable
   - Library: d3-force or custom implementation

3. **Tree Layout (Vertical/Horizontal)**
   - Strict hierarchical tree
   - Even spacing between levels
   - Centered children under parents

4. **Radial Layout**
   - Root at center
   - Children arranged in circles
   - Distance = hierarchy level
   - Even angular distribution

5. **Grid Layout**
   - Align all nodes to grid
   - Snap to nearest grid point
   - Useful for organization charts

**Implementation:**

```typescript
// src/utils/layoutAlgorithms.ts

export interface LayoutConfig {
  type: 'spider-web' | 'force-directed' | 'tree' | 'radial' | 'grid';
  options: {
    spacing?: number;
    animate?: boolean;
    duration?: number;
    maintainAspectRatio?: boolean;
  };
}

export function applyLayout(
  nodes: Node[],
  connections: Connection[],
  config: LayoutConfig,
  canvasWidth: number,
  canvasHeight: number
): Node[] {
  switch (config.type) {
    case 'force-directed':
      return applyForceDirectedLayout(nodes, connections, config.options);
    case 'tree':
      return applyTreeLayout(nodes, connections, config.options);
    case 'radial':
      return applyRadialLayout(nodes, connections, config.options);
    case 'grid':
      return applyGridLayout(nodes, config.options);
    default:
      return nodes;
  }
}

function applyForceDirectedLayout(
  nodes: Node[],
  connections: Connection[],
  options: LayoutConfig['options']
): Node[] {
  const spacing = options.spacing || 150;
  const iterations = 100;
  
  // Initialize forces
  let positions = nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
  
  // Simulation loop
  for (let i = 0; i < iterations; i++) {
    // Repulsion between all nodes
    for (let j = 0; j < positions.length; j++) {
      for (let k = j + 1; k < positions.length; k++) {
        const dx = positions[k].x - positions[j].x;
        const dy = positions[k].y - positions[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = (spacing * spacing) / distance;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          positions[j].x -= fx;
          positions[j].y -= fy;
          positions[k].x += fx;
          positions[k].y += fy;
        }
      }
    }
    
    // Attraction along connections
    connections.forEach(conn => {
      const fromIdx = positions.findIndex(p => p.id === conn.from);
      const toIdx = positions.findIndex(p => p.id === conn.to);
      
      if (fromIdx >= 0 && toIdx >= 0) {
        const dx = positions[toIdx].x - positions[fromIdx].x;
        const dy = positions[toIdx].y - positions[fromIdx].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > spacing) {
          const force = (distance - spacing) * 0.5;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          positions[fromIdx].x += fx * 0.5;
          positions[fromIdx].y += fy * 0.5;
          positions[toIdx].x -= fx * 0.5;
          positions[toIdx].y -= fy * 0.5;
        }
      }
    });
    
    // Damping
    positions = positions.map(p => ({
      ...p,
      x: p.x * 0.95,
      y: p.y * 0.95
    }));
  }
  
  // Apply positions back to nodes
  return nodes.map(node => {
    const pos = positions.find(p => p.id === node.id);
    return pos ? { ...node, x: pos.x, y: pos.y } : node;
  });
}

function applyTreeLayout(
  nodes: Node[],
  connections: Connection[],
  options: LayoutConfig['options']
): Node[] {
  const levelSpacing = options.spacing || 200;
  const nodeSpacing = 100;
  
  // Build tree structure
  const roots = nodes.filter(n => 
    !connections.some(c => c.to === n.id)
  );
  
  const positioned: Node[] = [];
  let currentLevel = 0;
  
  function positionLevel(parentNodes: Node[], level: number, startX: number) {
    const children: Node[] = [];
    let currentX = startX;
    
    parentNodes.forEach(parent => {
      const childIds = connections
        .filter(c => c.from === parent.id)
        .map(c => c.to);
      
      const childNodes = nodes.filter(n => childIds.includes(n.id));
      
      childNodes.forEach(child => {
        positioned.push({
          ...child,
          x: currentX,
          y: level * levelSpacing
        });
        currentX += nodeSpacing;
        children.push(child);
      });
    });
    
    if (children.length > 0) {
      positionLevel(children, level + 1, startX);
    }
  }
  
  roots.forEach((root, idx) => {
    positioned.push({
      ...root,
      x: idx * 300,
      y: 0
    });
  });
  
  positionLevel(roots, 1, 0);
  
  return positioned;
}

function applyRadialLayout(
  nodes: Node[],
  connections: Connection[],
  options: LayoutConfig['options']
): Node[] {
  const levelRadius = options.spacing || 200;
  
  // Find root
  const root = nodes.find(n => 
    !connections.some(c => c.to === n.id)
  ) || nodes[0];
  
  const positioned: Node[] = [];
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Position root at center
  positioned.push({ ...root, x: centerX, y: centerY });
  
  // Position each level in concentric circles
  let level = 1;
  let currentNodes = [root];
  
  while (currentNodes.length > 0) {
    const nextLevel: Node[] = [];
    
    currentNodes.forEach(parent => {
      const childIds = connections
        .filter(c => c.from === parent.id)
        .map(c => c.to);
      
      const children = nodes.filter(n => childIds.includes(n.id));
      nextLevel.push(...children);
    });
    
    if (nextLevel.length > 0) {
      const angleStep = (2 * Math.PI) / nextLevel.length;
      nextLevel.forEach((child, idx) => {
        const angle = idx * angleStep;
        positioned.push({
          ...child,
          x: centerX + Math.cos(angle) * (level * levelRadius),
          y: centerY + Math.sin(angle) * (level * levelRadius)
        });
      });
    }
    
    currentNodes = nextLevel;
    level++;
  }
  
  return positioned;
}

function applyGridLayout(nodes: Node[], options: LayoutConfig['options']): Node[] {
  const gridSize = options.spacing || 100;
  
  return nodes.map(node => ({
    ...node,
    x: Math.round(node.x / gridSize) * gridSize,
    y: Math.round(node.y / gridSize) * gridSize
  }));
}
```

**UI Integration:**

```jsx
// Add layout selector to toolbar
const [showLayoutMenu, setShowLayoutMenu] = useState(false);

<button
  onClick={() => setShowLayoutMenu(!showLayoutMenu)}
  className="toolbar-btn"
  title="Auto-arrange"
>
  <Sparkles size={20} />
  Auto Layout
</button>

{showLayoutMenu && (
  <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border p-4 z-50">
    <h3 className="font-semibold mb-3">Choose Layout</h3>
    <div className="flex flex-col gap-2">
      {['spider-web', 'force-directed', 'tree', 'radial', 'grid'].map(layout => (
        <button
          key={layout}
          onClick={() => {
            const newNodes = applyLayout(
              nodes,
              connections,
              { type: layout, options: { spacing: 150, animate: true } },
              window.innerWidth,
              window.innerHeight
            );
            
            // Animate transition
            setNodes(newNodes);
            setShowLayoutMenu(false);
          }}
          className="px-4 py-2 text-left hover:bg-gray-100 rounded"
        >
          {layout.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </button>
      ))}
    </div>
  </div>
)}
```

**Estimated Effort:** 8-12 days
**Dependencies:** None
**Testing:** Unit tests for layout algorithms, visual regression tests

---

## 🤝 **Feature 2: Real-Time Collaboration**

### Overview
Enable multiple users to edit the same mind map simultaneously with live cursor tracking, presence indicators, and real-time synchronization.

### Business Value
- **Increases team productivity** by enabling remote collaboration
- **Competitive advantage** - most mind map tools lack this
- **Higher retention** - collaborative features increase stickiness
- **Enables B2B sales** - teams need collaboration

### Technical Architecture

#### 2.1 Technology Stack

**Option A: Firebase Realtime Database (Recommended for MVP)**
- Pros: Easy setup, handles sync automatically, scales well
- Cons: Vendor lock-in, cost at scale
- Setup time: 2-3 days

**Option B: WebSocket + Custom Server**
- Pros: Full control, no vendor lock-in
- Cons: More complex, need to handle all sync logic
- Setup time: 5-7 days

**Recommendation:** Start with Firebase for speed, migrate to WebSocket later if needed

#### 2.2 Data Model Changes

```typescript
// Extend existing types
interface MindMap {
  id: string;
  name: string;
  nodes: Node[];
  connections: Connection[];
  collaborators: Collaborator[];
  permissions: {
    [userId: string]: 'owner' | 'editor' | 'viewer';
  };
  activeUsers: {
    [userId: string]: {
      name: string;
      color: string;
      cursor: { x: number; y: number };
      selectedNodeIds: string[];
      lastActivity: number;
    };
  };
  version: number; // For conflict resolution
  lastModified: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // Assigned color for cursor/presence
}

interface CollaborationEvent {
  type: 'node.add' | 'node.update' | 'node.delete' | 'connection.add' | 'connection.delete' | 'cursor.move' | 'user.join' | 'user.leave';
  userId: string;
  timestamp: number;
  data: any;
  version: number;
}
```

#### 2.3 Implementation Plan

**Phase 1: Firebase Setup (1-2 days)**

```bash
npm install firebase
```

```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, remove } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth, ref, onValue, set, update, remove, signInAnonymously };
```

**Phase 2: Collaboration Hook (3-4 days)**

```typescript
// src/hooks/useRealTimeCollaboration.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { database, ref, onValue, set, update, signInAnonymously, auth } from '../services/firebase';
import type { Node, Connection } from '../types/mindmap';

interface CollaborationState {
  activeUsers: Map<string, ActiveUser>;
  isConnected: boolean;
  currentUser: User | null;
}

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  selectedNodeIds: string[];
  lastSeen: number;
}

export function useRealTimeCollaboration(
  mapId: string,
  nodes: Node[],
  connections: Connection[],
  setNodes: (nodes: Node[]) => void,
  setConnections: (conns: Connection[]) => void
) {
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    activeUsers: new Map(),
    isConnected: false,
    currentUser: null
  });
  
  const lastUpdateVersion = useRef(0);
  const isSyncing = useRef(false);
  const throttleTimeout = useRef<number>();
  
  // Initialize user session
  useEffect(() => {
    signInAnonymously(auth).then((userCredential) => {
      const user = {
        id: userCredential.user.uid,
        name: `User ${userCredential.user.uid.slice(0, 4)}`,
        color: generateUserColor(userCredential.user.uid)
      };
      
      setCollaborationState(prev => ({
        ...prev,
        currentUser: user,
        isConnected: true
      }));
      
      // Register user presence
      const userPresenceRef = ref(database, `mindmaps/${mapId}/activeUsers/${user.id}`);
      set(userPresenceRef, {
        name: user.name,
        color: user.color,
        cursor: { x: 0, y: 0 },
        selectedNodeIds: [],
        lastSeen: Date.now()
      });
      
      // Cleanup on disconnect
      return () => {
        remove(userPresenceRef);
      };
    });
  }, [mapId]);
  
  // Listen for remote changes
  useEffect(() => {
    if (!collaborationState.isConnected) return;
    
    const mapRef = ref(database, `mindmaps/${mapId}`);
    
    const unsubscribe = onValue(mapRef, (snapshot) => {
      if (isSyncing.current) return; // Prevent echo
      
      const data = snapshot.val();
      if (!data) return;
      
      // Check version to avoid conflicts
      if (data.version > lastUpdateVersion.current) {
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
        lastUpdateVersion.current = data.version;
      }
      
      // Update active users
      if (data.activeUsers) {
        const users = new Map(
          Object.entries(data.activeUsers).map(([id, user]: [string, any]) => [
            id,
            {
              id,
              name: user.name,
              color: user.color,
              cursor: user.cursor,
              selectedNodeIds: user.selectedNodeIds || [],
              lastSeen: user.lastSeen
            }
          ])
        );
        
        setCollaborationState(prev => ({
          ...prev,
          activeUsers: users
        }));
      }
    });
    
    return unsubscribe;
  }, [mapId, collaborationState.isConnected, setNodes, setConnections]);
  
  // Sync local changes to Firebase
  const syncChanges = useCallback((
    newNodes: Node[],
    newConnections: Connection[]
  ) => {
    if (!collaborationState.currentUser) return;
    
    // Throttle updates to avoid too many writes
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
    }
    
    throttleTimeout.current = window.setTimeout(() => {
      isSyncing.current = true;
      
      const mapRef = ref(database, `mindmaps/${mapId}`);
      const version = lastUpdateVersion.current + 1;
      
      update(mapRef, {
        nodes: newNodes,
        connections: newConnections,
        version,
        lastModified: Date.now(),
        [`lastModifiedBy`]: collaborationState.currentUser.id
      }).then(() => {
        lastUpdateVersion.current = version;
        isSyncing.current = false;
      });
    }, 300);
  }, [mapId, collaborationState.currentUser]);
  
  // Update cursor position
  const updateCursor = useCallback((x: number, y: number) => {
    if (!collaborationState.currentUser) return;
    
    const cursorRef = ref(
      database,
      `mindmaps/${mapId}/activeUsers/${collaborationState.currentUser.id}/cursor`
    );
    
    set(cursorRef, { x, y });
  }, [mapId, collaborationState.currentUser]);
  
  // Update selected nodes
  const updateSelection = useCallback((nodeIds: string[]) => {
    if (!collaborationState.currentUser) return;
    
    const selectionRef = ref(
      database,
      `mindmaps/${mapId}/activeUsers/${collaborationState.currentUser.id}/selectedNodeIds`
    );
    
    set(selectionRef, nodeIds);
  }, [mapId, collaborationState.currentUser]);
  
  return {
    ...collaborationState,
    syncChanges,
    updateCursor,
    updateSelection
  };
}

function generateUserColor(userId: string): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
```

**Phase 3: UI Components (2-3 days)**

```jsx
// src/components/collaboration/CollaboratorCursor.jsx
export default function CollaboratorCursor({ user, pan, zoom }) {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-100"
      style={{
        left: user.cursor.x * zoom + pan.x,
        top: user.cursor.y * zoom + pan.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Cursor icon */}
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path
          d="M5 3l14 9-5.5 1.5L9 19z"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* User name badge */}
      <div
        className="absolute top-6 left-6 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  );
}

// src/components/collaboration/PresenceBar.jsx
export default function PresenceBar({ activeUsers, currentUser }) {
  const otherUsers = Array.from(activeUsers.values())
    .filter(u => u.id !== currentUser?.id);
  
  if (otherUsers.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-40 bg-white rounded-lg shadow-lg border p-2 flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {otherUsers.length} {otherUsers.length === 1 ? 'person' : 'people'} editing
      </span>
      
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 5).map(user => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0)}
          </div>
        ))}
        
        {otherUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
            +{otherUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Phase 4: Integration with MindMap (2-3 days)**

```jsx
// In MindMap.jsx
import { useRealTimeCollaboration } from '../hooks/useRealTimeCollaboration';
import CollaboratorCursor from './collaboration/CollaboratorCursor';
import PresenceBar from './collaboration/PresenceBar';

export default function MindMap({ mapId, onBack }) {
  // ... existing code ...
  
  // Add collaboration hook
  const collaboration = useRealTimeCollaboration(
    mapId,
    nodes,
    connections,
    setNodes,
    setConnections
  );
  
  // Sync changes to Firebase
  useEffect(() => {
    if (collaboration.isConnected) {
      collaboration.syncChanges(nodes, connections);
    }
  }, [nodes, connections, collaboration]);
  
  // Update cursor on mouse move
  const handleCanvasMouseMove = (e) => {
    if (collaboration.isConnected) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        collaboration.updateCursor(x, y);
      }
    }
    
    // ... existing mouse move logic ...
  };
  
  // Update selection
  useEffect(() => {
    if (collaboration.isConnected) {
      collaboration.updateSelection(selectedNodes);
    }
  }, [selectedNodes, collaboration]);
  
  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        // ... other props ...
      >
        {/* Existing canvas content */}
        <MindMapCanvas>
          {/* ... existing nodes ... */}
          
          {/* Render other users' cursors */}
          {Array.from(collaboration.activeUsers.values())
            .filter(u => u.id !== collaboration.currentUser?.id)
            .map(user => (
              <CollaboratorCursor
                key={user.id}
                user={user}
                pan={pan}
                zoom={zoom}
              />
            ))}
        </MindMapCanvas>
        
        {/* Presence bar */}
        <PresenceBar
          activeUsers={collaboration.activeUsers}
          currentUser={collaboration.currentUser}
        />
      </div>
    </div>
  );
}
```

**Phase 5: Conflict Resolution (2-3 days)**

```typescript
// src/utils/conflictResolution.ts

export function resolveConflicts(
  localNodes: Node[],
  remoteNodes: Node[],
  localVersion: number,
  remoteVersion: number
): Node[] {
  // Operational Transformation approach
  
  // 1. Find differences
  const localNodeMap = new Map(localNodes.map(n => [n.id, n]));
  const remoteNodeMap = new Map(remoteNodes.map(n => [n.id, n]));
  
  const resolved: Node[] = [];
  
  // 2. Merge changes
  const allIds = new Set([...localNodeMap.keys(), ...remoteNodeMap.keys()]);
  
  allIds.forEach(id => {
    const local = localNodeMap.get(id);
    const remote = remoteNodeMap.get(id);
    
    if (local && remote) {
      // Both exist - merge fields
      resolved.push({
        ...remote, // Remote takes precedence for most fields
        // But preserve local position if being dragged
        x: local._isDragging ? local.x : remote.x,
        y: local._isDragging ? local.y : remote.y,
      });
    } else if (local) {
      // Only local - keep it
      resolved.push(local);
    } else if (remote) {
      // Only remote - add it
      resolved.push(remote);
    }
  });
  
  return resolved;
}
```

**Estimated Effort:** 12-16 days
**Dependencies:** Firebase account, authentication system
**Testing:** Multi-user testing, latency simulation, conflict scenarios

---

## 🤖 **Feature 3: AI-Powered Features**

### Overview
Integrate AI to provide intelligent suggestions, auto-generation of content, and smart assistance while creating mind maps.

### Business Value
- **Differentiator** - AI is a major selling point
- **Reduces cognitive load** - helps users get unstuck
- **Increases usage** - users create more comprehensive maps
- **Premium feature** - can be monetized

### Technical Implementation

#### 3.1 AI Provider Selection

**Recommended:** OpenAI GPT-4 API
- Pros: Best quality, good documentation, reasonable pricing
- Cons: Cost per request, rate limits
- Alternative: Anthropic Claude, Google Gemini

#### 3.2 Implementation

**Phase 1: Backend API Setup (2-3 days)**

```typescript
// backend/src/routes/ai.ts
import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate subtasks for a node
router.post('/generate-subtasks', async (req, res) => {
  const { nodeText, context, count = 5 } = req.body;
  
  const prompt = `Given the task "${nodeText}", generate ${count} specific, actionable subtasks. 
Context: ${context || 'General project management'}

Return ONLY a JSON array of strings, no other text:
["subtask 1", "subtask 2", ...]`;
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const subtasks = JSON.parse(completion.choices[0].message.content);
    res.json({ subtasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Summarize mind map
router.post('/summarize-map', async (req, res) => {
  const { nodes, connections } = req.body;
  
  const mapStructure = buildTextRepresentation(nodes, connections);
  
  const prompt = `Summarize this mind map structure in 2-3 sentences:

${mapStructure}

Provide a concise summary highlighting the main topics and their relationships.`;
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 200
    });
    
    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smart suggestions
router.post('/suggest', async (req, res) => {
  const { currentNode, siblingNodes, parentNode } = req.body;
  
  const context = `
Current node: ${currentNode.text}
Parent: ${parentNode?.text || 'None'}
Siblings: ${siblingNodes.map(n => n.text).join(', ')}
`;
  
  const prompt = `Based on this mind map context:
${context}

Suggest 3-5 related ideas or topics that would complement the current node. 
Return ONLY a JSON array of strings.`;
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300
    });
    
    const suggestions = JSON.parse(completion.choices[0].message.content);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function buildTextRepresentation(nodes, connections) {
  // Build hierarchical text representation
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const roots = nodes.filter(n => !connections.some(c => c.to === n.id));
  
  let text = '';
  
  function traverse(node, depth = 0) {
    text += '  '.repeat(depth) + '- ' + node.text + '\n';
    
    const children = connections
      .filter(c => c.from === node.id)
      .map(c => nodeMap.get(c.to))
      .filter(Boolean);
    
    children.forEach(child => traverse(child, depth + 1));
  }
  
  roots.forEach(root => traverse(root));
  
  return text;
}

export default router;
```

**Phase 2: Frontend Service (1-2 days)**

```typescript
// src/services/aiService.ts

export async function generateSubtasks(
  nodeText: string,
  context?: string,
  count?: number
): Promise<string[]> {
  const response = await fetch('/api/ai/generate-subtasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeText, context, count })
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate subtasks');
  }
  
  const data = await response.json();
  return data.subtasks;
}

export async function summarizeMap(
  nodes: Node[],
  connections: Connection[]
): Promise<string> {
  const response = await fetch('/api/ai/summarize-map', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, connections })
  });
  
  if (!response.ok) {
    throw new Error('Failed to summarize map');
  }
  
  const data = await response.json();
  return data.summary;
}

export async function getSmartSuggestions(
  currentNode: Node,
  siblingNodes: Node[],
  parentNode?: Node
): Promise<string[]> {
  const response = await fetch('/api/ai/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentNode, siblingNodes, parentNode })
  });
  
  if (!response.ok) {
    throw new Error('Failed to get suggestions');
  }
  
  const data = await response.json();
  return data.suggestions;
}
```

**Phase 3: UI Components (3-4 days)**

```jsx
// src/components/ai/AISuggestionsPanel.jsx
import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { getSmartSuggestions } from '../../services/aiService';

export default function AISuggestionsPanel({ 
  node, 
  siblingNodes, 
  parentNode, 
  onAddSuggestion 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const results = await getSmartSuggestions(node, siblingNodes, parentNode);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border p-4 z-50 w-80">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={20} className="text-purple-500" />
        <h3 className="font-semibold">AI Suggestions</h3>
      </div>
      
      {suggestions.length === 0 ? (
        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Get Suggestions
            </>
          )}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onAddSuggestion(suggestion)}
              className="px-3 py-2 text-left bg-gray-50 hover:bg-purple-50 rounded-lg text-sm transition-colors border border-transparent hover:border-purple-200"
            >
              {suggestion}
            </button>
          ))}
          
          <button
            onClick={loadSuggestions}
            className="px-3 py-2 text-center text-purple-600 hover:bg-purple-50 rounded-lg text-sm"
          >
            Refresh Suggestions
          </button>
        </div>
      )}
    </div>
  );
}

// src/components/ai/AISubtaskGenerator.jsx
export default function AISubtaskGenerator({ nodeId, nodeText, onGenerate }) {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(5);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const subtasks = await generateSubtasks(nodeText, undefined, count);
      onGenerate(nodeId, subtasks);
    } catch (error) {
      console.error('Failed to generate subtasks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={10}
        value={count}
        onChange={(e) => setCount(parseInt(e.target.value))}
        className="w-16 px-2 py-1 border rounded text-sm"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate {count} Subtasks
          </>
        )}
      </button>
    </div>
  );
}
```

**Phase 4: Integration (2 days)**

```jsx
// Add to NodeCard toolbar
<button
  onClick={() => setShowAISuggestions(!showAISuggestions)}
  className="node-toolbar-btn p-2 rounded-xl hover:bg-purple-50 text-purple-600 border border-purple-200"
  title="AI Suggestions"
>
  <Sparkles size={20} />
</button>

{showAISuggestions && (
  <AISuggestionsPanel
    node={node}
    siblingNodes={nodes.filter(n => 
      connections.some(c => c.from === getParentId(node.id) && c.to === n.id)
    )}
    parentNode={nodes.find(n => 
      connections.some(c => c.from === n.id && c.to === node.id)
    )}
    onAddSuggestion={(text) => {
      onAddChild(node.id);
      // Update the new node's text
      const newNodeId = nodes[nodes.length - 1].id;
      updateNodeText(newNodeId, text);
    }}
  />
)}
```

**Estimated Effort:** 8-11 days
**Dependencies:** OpenAI API key, backend setup
**Cost:** ~$0.002-0.01 per API call

---

## 📊 Summary & Timeline

| Feature | Effort (days) | Impact | Complexity | Priority |
|---------|--------------|--------|------------|----------|
| Templates & Auto-Layout | 8-12 | High | Medium | 🟢 **Phase 1** |
| Real-Time Collaboration | 12-16 | Very High | High | 🟡 **Phase 2** |
| AI-Powered Features | 8-11 | High | Medium | 🟠 **Phase 3** |

**Total Development Time:** 28-39 days (~6-8 weeks)

### Recommended Implementation Order:

1. **Week 1-2:** Templates & Auto-Layout (Quick win, immediate value)
2. **Week 3-5:** Real-Time Collaboration (Biggest differentiator)
3. **Week 6-7:** AI Features (Modern, exciting addition)
4. **Week 8:** Testing, polish, documentation

### Quick Wins (Can Do in Parallel):
- Node duplication (Ctrl+D)
- Keyboard shortcuts cheat sheet
- Export as PNG
- Dark mode toggle
- Recent maps dropdown

---

## 🧪 Testing Strategy

Each feature requires:

1. **Unit Tests**
   - Layout algorithms
   - AI response parsing
   - Conflict resolution logic

2. **Integration Tests**
   - Template instantiation
   - Firebase sync
   - API endpoints

3. **E2E Tests**
   - Multi-user collaboration scenarios
   - Template application flow
   - AI suggestion workflow

4. **Performance Tests**
   - Layout algorithm speed (>60fps)
   - Collaboration latency (<100ms)
   - AI response time (<3s)

---

## 💰 Cost Estimates

### Infrastructure
- **Firebase:** ~$25-50/month (for 1000 active users)
- **OpenAI API:** ~$50-100/month (for moderate usage)
- **Hosting:** ~$20/month (Vercel/Netlify)

**Total:** ~$95-170/month

### Revenue Potential
- **Free Tier:** Basic features
- **Pro Tier ($9/month):** Templates, AI (limited), 5 collaborators
- **Team Tier ($19/user/month):** Unlimited everything

**Break-even:** ~10-18 team users or 20-40 pro users

---

## 🚀 Next Steps

1. **Set up development environment**
   - Create Firebase project
   - Get OpenAI API key
   - Set up environment variables

2. **Create feature branches**
   ```bash
   git checkout -b feature/templates-and-layouts
   git checkout -b feature/real-time-collaboration
   git checkout -b feature/ai-powered
   ```

3. **Start with Templates** (lowest risk, highest immediate value)

4. **Iterate and gather feedback** after each phase

---

**Ready to start implementing? Let me know which feature you'd like to tackle first!**
