# Visual Diagrams: Hierarchical Spider Web Positioning

## 1. Decision Flow Chart

```
                          User adds child to node
                                  │
                                  ▼
                    findStackedChildPosition()
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              Does parent              Already has
            have children?              children
                    │                           │
                   NO                         YES
                    │                           │
                    ▼                           ▼
            FIRST CHILD MODE          NEXT CHILDREN MODE
                    │                           │
           Position: (parent.x +      Position: (firstChild.x,
            NODE_WIDTH + MARGIN,       lastChild.y + NODE_HEIGHT +
            parent.y)                  MARGIN)
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                      ┌───────────┴───────────┐
                      │                       │
                  Position                Position
                  available?              available?
                      │                       │
              ┌───────┴───────┐      ┌───────┴───────┐
              YES             NO     YES             NO
              │               │      │               │
              ▼               ▼      ▼               ▼
          ✓ USE IT      SPIDER WEB  ✓ USE IT    SPIDER WEB
                        SEARCH                   SEARCH
                        (8 dirs ×                (8 dirs ×
                         4 radii)                 4 radii)
```

## 2. Spatial Layout Examples

### 2.1 Simple 2-Level Tree
```
┌────────────────────────────────────────────────┐
│                                                │
│  ┌──────────────┐                             │
│  │   PARENT     │                             │
│  │   (200×56)   │                             │
│  └──────┬───────┘                             │
│         │ 20px margin                         │
│         │                                     │
│         └─────────────────────────────┐       │
│                                       │       │
│                             ┌─────────▼────┐  │
│                             │    CHILD 1   │  │
│                             │  (200×56)    │  │
│                             └──────────────┘  │
│                                               │
│                   X axis                      │
│  ◄─────────────────────────────────────────►│
└────────────────────────────────────────────────┘
```

### 2.2 Three-Level Tree
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌──────────────┐                                       │
│  │   PARENT     │                                       │
│  │   (200×56)   │                                       │
│  └──────┬───────┘                                       │
│         │                                               │
│         │ 20px                                          │
│         │                                               │
│    ┌────▼─────────────────────┐                        │
│    │                          │                        │
│    │   ┌────────────────┐     │                        │
│    │   │    CHILD 1     │     │ 20px                   │
│    │   │   (200×56)     │     │                        │
│    │   └────────┬───────┘     │                        │
│    │            │             │                        │
│    │            │ 20px        │                        │
│    │            │             │                        │
│    │       ┌────▼──────┐      │                        │
│    │       │ CHILD 2   │      │ (below Child 1)        │
│    │       │(200×56)   │      │                        │
│    │       └───────────┘      │                        │
│    │                          │                        │
│    └──────────────────────────┘                        │
│                                                          │
│   (Children stack vertically, X aligned)                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.3 Complex Hierarchical Tree
```
                    ┌──────────────┐
                    │   PARENT     │
                    │  (central)   │
                    └──────┬───────┘
                           │
          ┌────────────────┴────────────────┐
          │ 20px margin                     │ 20px
          │                                 │ margin
          ▼                                 ▼
    ┌─────────────┐                ┌─────────────┐
    │  CHILD 1    │                │  CHILD 2    │
    │ (RIGHT of   │                │  (BELOW     │
    │ parent)     │                │  Child 1)   │
    └──────┬──────┘                └─────────────┘
           │
    [20px margin]
           │
    ┌──────▼──────────────────────┐
    │                             │
    ▼                             ▼
┌──────────────┐            ┌──────────────┐
│GRANDCHILD 1  │            │GRANDCHILD 2  │
│ (RIGHT of    │            │ (BELOW       │
│ Child 1)     │            │ Grandchild 1)│
└──────────────┘            └──────────────┘
```

## 3. Spider Web Pattern (Collision Avoidance)

### 3.1 When Normal Position Blocked
```
                    ┌──────────┐
                    │ PARENT   │
                    └─────┬────┘
                          │
                    ┌─────▼──────┐
                    │  CHILD 1   │
                    │  (RIGHT ✓) │ ← First child uses primary position
                    └────────────┘
                    
Normal position for Child 2: BLOCKED ✗
(Same X as Child 1, below it - but another node there)
                    
                    ▼ ACTIVATE SPIDER WEB ▼
                    
Direction Priority:
    ↗ ↑ ↖          Try in this order:
  → ☗ ←            1. → (RIGHT at radius 300)
    ↘ ↓ ↙          2. ↘ (DOWN-RIGHT at radius 300)
                   3. ↓ (DOWN at radius 300)
Compass          4. ↙ (DOWN-LEFT at radius 300)
8 Directions     5. ← (LEFT at radius 300)
                   6. ↖ (UP-LEFT at radius 300)
                   7. ↑ (UP at radius 300)
                   8. ↗ (UP-RIGHT at radius 300)
                   [then try bigger radii: 1.5x, 2x, 2.5x]
```

### 3.2 Resulting Spider Web Pattern
```
                                    ┌─────────────┐
                                    │  CHILD 5    │
                                    │(spider web) │
                                    └─────────────┘
                    
        ┌─────────────┐                              ┌────────────┐
        │  CHILD 4    │          ┌──────────┐        │  CHILD 6   │
        │(spider web) │          │ PARENT   │        │(spider web)│
        └─────────────┘          └─────┬────┘        └────────────┘
                                       │
                                 ┌─────▼──────┐
                                 │  CHILD 1   │
                                 │  (RIGHT)   │
                                 └────┬───────┘
                                      │
                                 ┌────▼──────┐
                                 │  CHILD 2  │
                                 │  (BELOW)  │
                                 └───────────┘
        ┌─────────────┐
        │  CHILD 3    │
        │(spider web) │
        └─────────────┘
        
Nodes spread organically around parent
No overlaps | All visible | Symmetric
```

### 3.3 Search Radius Expansion
```
Search Attempt 1: Radius = 300px
    ↗ ↑ ↖
  → ☗ ← (try 8 directions at 300px radius)
    ↘ ↓ ↙

If all 8 blocked, expand:

Search Attempt 2: Radius = 450px (1.5x)
    ↗ ↑ ↖
  → ☗ ← (try 8 directions at 450px radius)
    ↘ ↓ ↙

If all 8 blocked, expand:

Search Attempt 3: Radius = 600px (2x)
    ↗ ↑ ↖
  → ☗ ← (try 8 directions at 600px radius)
    ↘ ↓ ↙

If all 8 blocked, expand:

Search Attempt 4: Radius = 750px (2.5x)
    ↗ ↑ ↖
  → ☗ ← (try 8 directions at 750px radius)
    ↘ ↓ ↙

Total attempts: 8 directions × 4 radii = 32 positions checked
(almost always finds space in first 1-2 rounds)
```

## 4. Collision Distance Visualization

### 4.1 Safe Zone Around Node
```
                                Safe zone: 100px
                           ┌─────────────────────┐
                           │                     │
                           │   ╱─────────────╲   │
                           │ ╱   PROTECTED     ╲  │
                           ││      ZONE        │ │
                           ││   (100px      ││ │
                           ││  distance)    ││ │
                           ││   ┌───────┐  ││ │
                           ││   │ NODE  │  ││ │
                           ││   │ 200x56│  ││ │
                           ││   └───────┘  ││ │
                           ││   (200×56)    │ │
                           │ ╲               ╱  │
                           │   ╲─────────────╱   │
                           │                     │
                           └─────────────────────┘

If distance < 100px → BLOCKED ✗
If distance ≥ 100px → AVAILABLE ✓

Calculated as: Math.hypot(dx, dy) = √(dx² + dy²)
```

### 4.2 Multiple Nodes Safe Distance
```
Example: Three nodes avoiding each other

    ┌──────────────────────────────────────────┐
    │ NODE A                     NODE B          │
    │  100px buffer              100px buffer    │
    │ ┌──────┐ ← 100px min → ┌──────┐         │
    │ │      │    distance    │      │         │
    │ │      │    between     │      │         │
    │ └──────┘      nodes     └──────┘         │
    │                              ↑            │
    │                          100px min        │
    │                          distance         │
    │                              │            │
    │                         ┌──────┐         │
    │                         │      │         │
    │                         │      │         │
    │                         └──────┘         │
    │                          NODE C          │
    └──────────────────────────────────────────┘

All nodes maintain minimum 100px distance
No overlaps, safe collision detection
```

## 5. Complete Workflow Diagram

```
START: User clicks "Add Child"
  │
  ▼
Get parent node reference
  │
  ▼
Count existing children: childrenOfParent.length
  │
  ├─ If 0 (FIRST CHILD)
  │   │
  │   ├─ Calculate: x = parent.x + 200 + 20
  │   │             y = parent.y
  │   │
  │   └─ Check: isPositionAvailable(x, y)?
  │       ├─ YES → Use this position ✓
  │       └─ NO  → findAvailablePosition() 🕷️
  │
  └─ If > 0 (NEXT CHILDREN)
      │
      ├─ Get firstChild = childrenOfParent[0]
      ├─ Get lastChild = childrenOfParent.at(-1)
      │
      ├─ Calculate: x = firstChild.x
      │             y = lastChild.y + 56 + 20
      │
      └─ Check: isPositionAvailable(x, y)?
          ├─ YES → Use this position ✓
          └─ NO  → findAvailablePosition() 🕷️
  
  ▼
Create new node with (x, y)
Create connection: parent → child
Add to nodes array
Render on screen
  │
  ▼
END: User sees child node positioned correctly
```

## 6. Algorithm Pseudocode

```
ALGORITHM FindStackedChildPosition(parentId, preferredX, preferredY)
INPUT: parentId (node to add child to)
OUTPUT: {x, y} (recommended position for new child)

BEGIN
  parent ← FindNodeById(parentId)
  IF parent IS NULL THEN
    RETURN {x: preferredX, y: preferredY}
  END IF
  
  childrenOfParent ← GetChildrenOf(parent)
  
  IF LENGTH(childrenOfParent) = 0 THEN
    // FIRST CHILD: position to the right
    proposedX ← parent.x + 200 + 20
    proposedY ← parent.y
  ELSE
    // NEXT CHILDREN: position below first child
    firstChild ← childrenOfParent[0]
    lastChild ← childrenOfParent.last()
    proposedX ← firstChild.x
    proposedY ← lastChild.y + 56 + 20
  END IF
  
  IF IsPositionAvailable(proposedX, proposedY) THEN
    RETURN {x: proposedX, y: proposedY}
  ELSE
    RETURN FindAvailablePosition(parent.x, parent.y)
  END IF
END ALGORITHM
```

```
ALGORITHM IsPositionAvailable(x, y)
INPUT: x, y (proposed position)
OUTPUT: true if position is safe, false if occupied

BEGIN
  FOR EACH node IN allNodes DO
    distance ← SQRT((node.x - x)² + (node.y - y)²)
    IF distance < 100 THEN
      RETURN false  // Too close to another node
    END IF
  END FOR
  RETURN true  // Position is safe
END ALGORITHM
```

```
ALGORITHM FindAvailablePosition(centerX, centerY)
INPUT: centerX, centerY (parent position as center)
OUTPUT: {x, y} (available position in spider web pattern)

BEGIN
  angles ← [0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°]
  radii ← [300, 450, 600, 750]
  
  FOR EACH radius IN radii DO
    FOR EACH angle IN angles DO
      x ← centerX + cos(angle) × radius
      y ← centerY + sin(angle) × radius
      
      IF IsPositionAvailable(x, y) THEN
        RETURN {x: x, y: y}  // Found free space!
      END IF
    END FOR
  END FOR
  
  // Fallback if nothing found (shouldn't happen)
  RETURN {x: centerX + 300, y: centerY}
END ALGORITHM
```

---

These diagrams should help visualize exactly how the hierarchical spider web positioning system works!
