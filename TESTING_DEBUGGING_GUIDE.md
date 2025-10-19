# Testing & Debugging Guide for Refactoring Issues

## ISSUE #1: Settings Icon - ✅ FIXED

### What Was Wrong
- Clicking the settings gear ⚙️ on any node expanded/collapsed the toolbar for **ALL nodes**
- This was because toolbar expansion was controlled by a single global boolean

### What Was Fixed
- Changed from global `isToolbarExpanded` boolean to per-node `expandedNodeToolbars` object
- Now each node independently tracks whether its toolbar is expanded
- Pattern: `{ nodeId1: true, nodeId2: false, nodeId3: true, ... }`

### Test the Fix
1. Open the app
2. Create 2-3 child nodes by clicking "+" on the root node
3. Click the settings ⚙️ icon on Node 1 → should expand only that node's toolbar
4. Click the settings ⚙️ icon on Node 2 → should expand only that node's toolbar
5. **Expected**: Node 1 stays expanded while Node 2 is expanded. Clicking ⚙️ again collapses only that node

### Expected Behavior (Matches Screenshot)
```
[Root Node] ⚙️ [expanded toolbar...]
├─ [Child 1] ⚙️ [hidden]
├─ [Child 2] ⚙️ [expanded toolbar...]
└─ [Child 3] ⚙️ [hidden]
```

---

## ISSUE #2: Lost Node Connections

### What's Happening
When you click the "+" button to add a child node, it should:
1. Create a new node
2. Create a connection from parent to child
3. Display a line connecting the two nodes
4. Save everything to localStorage

### Investigation Steps

#### Step 1: Verify Nodes Are Created
- [ ] Click "+" button to add a child node
- [ ] New node should appear on the canvas
- [ ] Run in browser console: `console.log(document.querySelectorAll('[class*="node"]').length)` to count nodes

#### Step 2: Verify Connections Exist in State
- [ ] Open browser DevTools (F12)
- [ ] Go to Application > Local Storage > find your `mindMap_*` entry
- [ ] Should see JSON like:
```json
{
  "nodes": [
    { "id": "root", "text": "Central Idea", "x": 960, "y": 540 },
    { "id": "node-1234567890", "text": "New Node", "x": 1200, "y": 540 }
  ],
  "connections": [
    { "id": "conn-1234567890", "from": "root", "to": "node-1234567890" }
  ]
}
```
- [ ] If `connections` array is empty, the connection isn't being created
- [ ] If `connections` exists with entries, the connection is being saved

#### Step 3: Verify Connections Display
- [ ] If connections exist in localStorage but don't display:
  - [ ] Open DevTools > Elements (Inspector)
  - [ ] Look for `<svg>` tag on the page
  - [ ] Inside the SVG, look for `<path>` elements (these are connection lines)
  - [ ] If no `<path>` elements exist, the SVG isn't rendering connections
  - [ ] Check for any console errors (F12 > Console tab)

#### Step 4: Check Connection Geometry
- [ ] If paths exist but connections don't appear:
  - [ ] Check if they're positioned correctly (might be off-canvas)
  - [ ] Check CSS z-index (connections should have zIndex: 1, nodes should have zIndex: 10)
  - [ ] Try adding `opacity: 1 !important` temporarily to the SVG style to ensure visibility

---

## Code Analysis: Why Connections Should Work

### OnAddChild Function (Line 153-160)
```javascript
const onAddChild = (parentId) => {
  const parent = nodes.find(n => n.id === parentId) || nodes[0];
  const id = `node-${Date.now()}`;  // Create unique ID
  const child = { id, text: 'New Node', x: parent.x + 240, y: parent.y };
  setNodes(nodes.concat([child]));
  setConnections(connections.concat([
    { id: `conn-${Date.now()}`, from: parentId, to: id }
  ]));
};
```
✅ This correctly creates a connection object with `from` and `to` fields

### Persistence (Line 220-237)
```javascript
// Load connections from localStorage
if (Array.isArray(data.connections)) setConnections(data.connections);

// Save connections to localStorage
const payload = JSON.stringify({ nodes, connections });
localStorage.setItem(`mindMap_${mapId}`, payload);
```
✅ Both load and save are properly implemented

### Connection Rendering (Line 300-310)
```javascript
<ConnectionsSvg
  connections={connections}
  nodes={nodes}
  nodePositions={nodePositions}
  // ...passes all needed data
/>
```
✅ All required data is passed to the rendering component

### NodePositions Calculation (Line 144-148)
```javascript
const nodePositions = React.useMemo(() => {
  const map = {};
  nodes.forEach(n => { map[n.id] = { x: n.x, y: n.y }; });
  return map;
}, [nodes]);
```
✅ Creates a lookup table of node positions needed for drawing lines

---

## If Connections Don't Work: Possible Issues

### Issue A: Connection Not Created
- **Symptoms**: localStorage shows empty connections array
- **Cause**: onAddChild not being called, or setConnections not working
- **Fix**: Check browser console for errors when clicking "+"

### Issue B: Connection Created But Not Displayed
- **Symptoms**: localStorage shows connections, but no lines appear
- **Likely Cause**: One of these:
  1. SVG rendering issue (path calculation failing)
  2. Z-index layering (lines behind nodes or background)
  3. Connection geometry calculation error
  4. CSS clip-path or overflow hiding the SVG
- **Fix**: Check browser DevTools > Elements > look for SVG > inspect the `<path>` element

### Issue C: SVG Exists But Paths Missing
- **Symptoms**: `<svg>` tag in HTML but no `<path>` elements
- **Cause**: ConnectionsSvg component returning null or not mapping connections
- **Fix**: Add console.log to ConnectionsSvg component to verify connections array

---

## Quick Test Commands (Browser Console)

```javascript
// Check if any nodes exist
console.log('Nodes:', JSON.parse(localStorage.getItem('mindMap_default'))?.nodes || []);

// Check if connections exist
console.log('Connections:', JSON.parse(localStorage.getItem('mindMap_default'))?.connections || []);

// Count SVG paths (should be 1 per connection)
console.log('SVG Paths found:', document.querySelectorAll('svg path').length);

// Verify ConnectionsSvg is rendering
console.log('SVG Element:', document.querySelector('svg'));

// Check for console errors
// Look in the Console tab for any error messages
```

---

## Expected Behavior After Fix

### Test Flow
1. **Load app** → see root node "Central Idea"
2. **Click "+" on root** → new "New Node" appears connected to root
3. **Click "+" on first child** → new node appears connected to first child
4. **Refresh page** → all nodes and connections persist
5. **Each node toolbar expands independently** when you click its ⚙️ icon
6. **All popups (attachments, notes, etc) work only for the clicked node**

### What NOT to See
- ❌ Multiple nodes expanding/collapsing when clicking one settings icon
- ❌ All popups opening when clicking one node's popup button
- ❌ Connections disappearing after refresh
- ❌ Creating child nodes with no visible connection lines

---

## Architecture Summary

### Per-Node State Pattern (NOW USED THROUGHOUT)
```javascript
// OLD (Global)
const [isToolbarExpanded, setIsToolbarExpanded] = useState(false);
// Problem: All nodes share the same state

// NEW (Per-Node)
const [expandedNodeToolbars, setExpandedNodeToolbars] = useState({});
// Structure: { [nodeId]: bool }
// Solution: Each node has independent state
```

### Applied To
- ✅ Toolbar expansion (just fixed)
- ✅ Popup states (attachments, notes, details, date, tags, collaborator)
- ✅ Button refs for popover positioning
- ✅ All state updates use `.map()` with nodeId filtering

### This Pattern Ensures
- Each node's actions only affect that node
- No cross-node state pollution
- Scaling to many nodes without performance issues
- Matches pre-refactor behavior

