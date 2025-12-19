# Component Architecture Diagram

## Component Hierarchy

```
src/components/
│
├── shared/                          # ⭐ Reusable Components
│   ├── index.js                     # Central export point
│   ├── README.md                    # Documentation
│   ├── REFACTORING_EXAMPLES.md      # Migration guide
│   │
│   ├── UI Components/
│   │   ├── ToggleSwitch.jsx         # Boolean settings toggle
│   │   ├── SelectInput.jsx          # Dropdown select
│   │   ├── StatusBadge.jsx          # Status indicators
│   │   └── ProgressBar.jsx          # Progress visualization
│   │
│   ├── Card Components/
│   │   ├── SectionCard.jsx          # Section container
│   │   ├── StatCard.jsx             # Metric display
│   │   ├── CardHeader.jsx           # Card header with actions
│   │   └── TeamMemberCard.jsx       # Member information card
│   │
│   └── Display Components/
│       └── AvatarWithInitials.jsx   # User avatar
│
├── Pages (Using Shared Components)/
│   ├── SettingsPage.jsx             # Uses: ToggleSwitch, SectionCard, SelectInput
│   ├── TeamHierarchy.jsx            # Uses: TeamMemberCard, StatusBadge, CardHeader
│   ├── Dashboard.jsx                # Uses: StatCard, CardHeader, ProgressBar, AvatarWithInitials
│   ├── TeamMembersManager.jsx       # Uses: TeamMemberCard, AvatarWithInitials
│   └── TeamHolidaysPage.jsx         # Uses: StatusBadge, CardHeader, SectionCard
│
└── Other Components/
    ├── mindmap/                     # Mind map specific components
    ├── dashboard/                   # Dashboard specific components
    ├── enhanced/                    # Enhanced features
    └── templates/                   # Template components
```

## Component Usage Map

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Components                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ SettingsPage │    │TeamHierarchy │    │  Dashboard   │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ • Toggle×8   │    │ • TeamCard×N │    │ • StatCard×6 │
│ • Section×4  │    │ • Status×N   │    │ • CardHdr×5  │
│ • Select×5   │    │ • CardHdr×1  │    │ • Progress×N │
└──────────────┘    └──────────────┘    │ • Avatar×N   │
                                        └──────────────┘
```

## Component Composition Examples

### Example 1: Settings Section
```
SectionCard
├── icon: Bell
├── title: "Notifications"
├── subtitle: "Manage preferences"
└── children:
    ├── ToggleSwitch (Email)
    ├── ToggleSwitch (Push)
    ├── ToggleSwitch (Task assignments)
    ├── ToggleSwitch (Task updates)
    └── ToggleSwitch (Deadline reminders)
```

### Example 2: Team Member Display
```
TeamMemberCard
├── member data
│   ├── name, initials, email, phone
│   ├── role, department
│   ├── performance status
│   └── task statistics
├── colorClass (gradient)
└── actions
    ├── Profile button
    └── Message button
```

### Example 3: Dashboard Card
```
Card Container
├── CardHeader
│   ├── icon: Users
│   ├── title: "Team"
│   ├── subtitle: "4 Members"
│   └── viewAllLink: "/team-members"
└── Content
    └── For each member:
        ├── AvatarWithInitials
        ├── Member info
        └── ProgressBar
```

## Data Flow

```
┌──────────────┐
│  Page State  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│  Shared Component (Props)        │
│  ┌────────────────────────────┐  │
│  │ • Receives data via props  │  │
│  │ • Renders consistent UI    │  │
│  │ • Emits events via callbacks│ │
│  └────────────────────────────┘  │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────┐
│  User Event  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Event Handler│
└──────────────┘
```

## Component Relationships

```
                    ┌─────────────────┐
                    │  SectionCard    │
                    │  (Container)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ToggleSwitch  │    │ SelectInput  │    │  StatCard    │
│  (Input)     │    │  (Input)     │    │  (Display)   │
└──────────────┘    └──────────────┘    └──────────────┘


┌─────────────────┐
│   CardHeader    │
│   (Header)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Card Content Area          │
│  ┌──────────────────────────┐   │
│  │  TeamMemberCard          │   │
│  │  ┌────────────────────┐  │   │
│  │  │ AvatarWithInitials │  │   │
│  │  ├────────────────────┤  │   │
│  │  │ StatusBadge        │  │   │
│  │  ├────────────────────┤  │   │
│  │  │ ProgressBar        │  │   │
│  │  └────────────────────┘  │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

## Import Patterns

### ❌ Before (Scattered Imports)
```jsx
// Multiple files with duplicate code
// No centralized component library
// Inconsistent styling
```

### ✅ After (Centralized Imports)
```jsx
// Single import statement
import { 
  ToggleSwitch, 
  SectionCard, 
  TeamMemberCard,
  StatCard,
  CardHeader 
} from './shared';

// Clean, readable component usage
<SectionCard icon={Bell} title="Notifications">
  <ToggleSwitch label="Email" checked={true} />
  <ToggleSwitch label="Push" checked={false} />
</SectionCard>
```

## Component Sizing Guide

```
AvatarWithInitials Sizes:
┌────┐  ┌─────┐  ┌──────┐  ┌───────┐  ┌────────┐
│ xs │  │ sm  │  │  md  │  │  lg   │  │   xl   │
│24px│  │32px │  │ 40px │  │ 48px  │  │  56px  │
└────┘  └─────┘  └──────┘  └───────┘  └────────┘

StatusBadge Sizes:
[xs]  [sm]  [md]  [lg]
10px  12px  14px  16px

ProgressBar Heights:
─────  ──────  ───────  ────────
h-1    h-2     h-3      h-4
4px    8px     12px     16px
```

## Color Scheme

```
Status Colors:
┌─────────┬──────────────────────────────┐
│ Status  │ Color                        │
├─────────┼──────────────────────────────┤
│ Success │ 🟢 Green (bg-green-50)       │
│ Warning │ 🟡 Amber (bg-amber-50)       │
│ Error   │ 🔴 Red (bg-red-50)           │
│ Info    │ 🔵 Blue (bg-blue-50)         │
│ Neutral │ ⚪ Gray (bg-gray-50)         │
└─────────┴──────────────────────────────┘

Icon Background Colors:
┌──────────────┬──────────────────┐
│ Section      │ Color            │
├──────────────┼──────────────────┤
│ Notifications│ bg-blue-100      │
│ Privacy      │ bg-purple-100    │
│ Preferences  │ bg-green-100     │
│ Security     │ bg-red-100       │
│ Data         │ bg-orange-100    │
└──────────────┴──────────────────┘
```

## Responsive Behavior

```
Mobile (< 640px)          Desktop (≥ 640px)
┌──────────────┐          ┌────────┬────────┐
│              │          │        │        │
│  Full Width  │          │  Grid  │  Grid  │
│              │          │        │        │
├──────────────┤    →     ├────────┴────────┤
│              │          │                 │
│  Full Width  │          │   Full Width    │
│              │          │                 │
└──────────────┘          └─────────────────┘

Components adapt automatically:
• Cards stack on mobile
• Grids collapse to single column
• Text sizes adjust
• Spacing reduces
```

## Performance Optimization

```
Component Rendering:
┌──────────────────────────────────┐
│  Parent Component                │
│  ┌────────────────────────────┐  │
│  │ Shared Component (Memoized)│  │
│  │ • Only re-renders when     │  │
│  │   props change             │  │
│  │ • Optimized for performance│  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘

Benefits:
✓ Reduced re-renders
✓ Smaller bundle size
✓ Better caching
✓ Faster page loads
```

## Testing Strategy

```
Component Testing Pyramid:
        ┌─────┐
        │ E2E │ (Page-level tests)
        └─────┘
       ┌───────┐
       │ Integ │ (Component integration)
       └───────┘
      ┌─────────┐
      │  Unit   │ (Individual components)
      └─────────┘

Each shared component should have:
• Unit tests (props, rendering)
• Snapshot tests (visual regression)
• Accessibility tests (a11y)
• Integration tests (with parent components)
```

---

This architecture provides:
✅ Clear component hierarchy
✅ Consistent design patterns
✅ Easy maintenance
✅ Scalable structure
✅ Better developer experience
