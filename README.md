# Mind Planning 🧠

A modern, feature-rich mind mapping and task management application built with React, TypeScript, and Clerk authentication. Create hierarchical mind maps, manage teams, track leave requests, set reminders, and visualize your ideas with an intuitive drag-and-drop interface.

![Status](https://img.shields.io/badge/status-active%20development-brightgreen)
![Version](https://img.shields.io/badge/version-0.0.0-blue)
![React](https://img.shields.io/badge/React-19.0.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)

## ✨ Features

### 🗺️ Mind Mapping
- **Hierarchical Node Structure**: Create parent-child relationships with automatic positioning
- **Drag & Drop**: Move nodes freely across the canvas with collision detection
- **Multiple Node Shapes**: Rectangle, rounded, circle, diamond, hexagon, parallelogram, and custom shapes
- **Real-time Connections**: Visual connections with bracket-style and curved line options
- **Multiple Layout Algorithms**: 
  - Tree Layout (Horizontal/Vertical)
  - Radial Layout
  - Circular Layout
  - Auto-arrange children
- **Multiple Views**: Switch between Mind Map, Board, List, Excel, Gantt, and Analytics views

### ✏️ Interaction & Editing
- **Undo/Redo**: Full history support with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **Multi-Select**: Select and manipulate multiple nodes simultaneously
- **Inline Editing**: Edit node content with auto-resizing textarea
- **Rich Node Properties**: 
  - Notes with rich text support
  - Tags with color coding
  - Due dates and deadlines
  - File attachments
  - Collaborator assignments
  - Theme customization
  - Emoji decorations
- **Keyboard Shortcuts**: Power user support for common operations

### 👥 Team Management
- **Team Members Page**: Card-based layout with member profiles
- **Team Hierarchy**: Visual organizational structure showing upper/lower classes
- **Collaborator Picker**: Assign team members to nodes
- **Anonymous Navigation**: Browse team pages without authentication

### 📅 Leave Management
- **Leave Requests**: Submit and track leave requests
- **Leave Balance Dashboard**: View remaining leave days
- **Team Holidays**: Manage team-wide holiday calendar
- **Approval Workflow**: Request/approve leave workflow

### ⏰ Reminders System
- **Create Reminders**: Set reminders with date, time, and description
- **In-App Notifications**: Popup notifications when reminders are due
- **Reminder Rules**: Configure automated reminder settings
- **User-Specific Visibility**: Personal reminder management

### 📊 Dashboard
- **Task Overview**: Track upcoming deadlines and completed tasks
- **Leave Balance Widget**: Quick view of leave status
- **Deadline Reminders**: Upcoming deadline alerts
- **Weekly Calendar Widget**: Week-at-a-glance calendar view
- **Recently Completed Tasks**: Track team productivity
- **Analytics Cards**: Task statistics and insights

### 🎨 Customization
- **Node Theming**: Apply themes with backgrounds, fonts, borders, shadows
- **Color Pickers**: Grid and round color picker options
- **Font Customization**: Font family, size, and color options
- **Connection Styles**: Customize line styles and colors
- **Dark Mode Support**: Theme context for light/dark modes

### 🤖 AI Features
- **Image Analyzer**: Upload images and auto-generate mind maps using AI
- **Smart Node Creation**: AI-assisted node structure generation

### 🌐 Internationalization
- **Multi-language Support**: i18n system with translation files
- **Language Context**: Easy language switching

### 📋 Templates
- **Pre-built Templates**: Quick-start templates for common use cases
- **Template Engine**: Create and apply custom templates

## 🚀 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | Modern UI library with hooks |
| TypeScript | 5.7 | Type-safe development |
| Vite | 6.2.0 | Lightning-fast build tool |
| Tailwind CSS | 4.0.9 | Utility-first styling |
| Framer Motion | 12.4.7 | Smooth animations |
| Lucide React | 0.477.0 | Beautiful icon library |
| React Router | 7.2.0 | Client-side routing |
| Clerk | 5.58.1 | Authentication & user management |

### Backend (Optional)
- **Prisma** - Type-safe ORM
- **Node.js** - Backend runtime
- **Supabase** - Database & auth (optional integration)

### Testing
- **Vitest** 3.2.2 - Fast unit testing
- **Testing Library** - Component testing
- **jsdom** - DOM simulation

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/RicardoNogueira01/mind-planning.git
cd mind-planning

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Clerk and other API keys

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔑 Environment Setup

Create a `.env` file with the following variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

# AI Image Analyzer (Optional)
VITE_OPENAI_API_KEY=your_openai_key
```

See [AI_IMAGE_ANALYZER_SETUP.md](./AI_IMAGE_ANALYZER_SETUP.md) for AI feature configuration.

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once
npm run test:coverage # Generate coverage report
```

## 📁 Project Structure

```
mind-planning/
├── src/
│   ├── components/           # React components (123+ files)
│   │   ├── MindMap.jsx              # Main mind map orchestrator
│   │   ├── MindMapManager.jsx       # Map library manager
│   │   ├── Dashboard.jsx            # Main dashboard
│   │   ├── CalendarPage.jsx         # Calendar view
│   │   ├── RemindersPage.jsx        # Reminders management
│   │   ├── LeaveRequestPage.jsx     # Leave request system
│   │   ├── TeamMembersManager.jsx   # Team management
│   │   ├── TeamHierarchy.jsx        # Org structure view
│   │   ├── ProfilePage.jsx          # User profile
│   │   ├── SettingsPage.jsx         # User settings
│   │   ├── mindmap/                 # Mind map specific (43 files)
│   │   │   ├── views/               # Alternative views
│   │   │   │   ├── BoardView.jsx
│   │   │   │   ├── ListView.jsx
│   │   │   │   ├── ExcelView.jsx
│   │   │   │   ├── GanttView.jsx
│   │   │   │   └── AnalyticsView.jsx
│   │   │   ├── NodeCard.jsx         # Node rendering
│   │   │   ├── ConnectionsSvg.jsx   # Connection lines
│   │   │   ├── ImageAnalyzerModal.jsx
│   │   │   └── ...
│   │   ├── popups/                  # Feature popups (8 files)
│   │   │   ├── NotesPopup.jsx
│   │   │   ├── TagsPopup.jsx
│   │   │   ├── EmojiPicker.jsx
│   │   │   ├── ThemePicker.jsx
│   │   │   ├── AttachmentsPopup.jsx
│   │   │   ├── CollaboratorPicker.jsx
│   │   │   ├── DueDatePicker.jsx
│   │   │   └── PropertiesPanel.jsx
│   │   ├── dashboard/               # Dashboard widgets (10 files)
│   │   ├── enhanced/                # Enhanced components (18 files)
│   │   ├── shared/                  # Reusable components (21 files)
│   │   └── templates/               # Template components
│   ├── hooks/                   # Custom React hooks (11 files)
│   │   ├── useNodePositioning.ts    # Layout & positioning
│   │   ├── useNodeOperations.ts     # Node CRUD operations
│   │   ├── useDragging.ts           # Drag & pan interactions
│   │   ├── useKeyboardShortcuts.ts  # Keyboard shortcuts
│   │   ├── useNodeSelection.ts      # Selection management
│   │   ├── useConnectionDrawing.ts  # Connection UI
│   │   ├── useMindMaps.ts           # Map data & localStorage
│   │   ├── useMindMapFilters.ts     # Filtering & sorting
│   │   ├── useNodeHandlers.ts       # Event handlers
│   │   ├── useDashboardData.ts      # Dashboard state
│   │   └── index.js                 # Hook exports
│   ├── context/                 # React contexts
│   │   ├── AuthContext.tsx          # Authentication state
│   │   ├── ClerkAuthContext.tsx     # Clerk integration
│   │   ├── LanguageContext.jsx      # i18n context
│   │   └── ThemeContext.jsx         # Theme (dark/light)
│   ├── utils/                   # Utility functions
│   │   ├── layoutAlgorithms.ts      # Layout algorithms
│   │   ├── nodeUtils.js             # Node helpers
│   │   ├── dateUtils.ts             # Date formatting
│   │   ├── dashboardUtils.ts        # Dashboard helpers
│   │   ├── color.ts                 # Color utilities
│   │   └── stringUtils.js           # String helpers
│   ├── templates/               # Template system
│   │   ├── templateDefinitions.ts   # Template data
│   │   └── templateEngine.ts        # Template logic
│   ├── i18n/                    # Internationalization
│   │   ├── translations.js          # Translation strings
│   │   └── README.md                # i18n documentation
│   ├── types/                   # TypeScript definitions
│   ├── services/                # API services
│   ├── config/                  # App configuration
│   ├── api/                     # API integrations
│   ├── test/                    # Test files (17 files)
│   ├── App.tsx                  # Main application
│   └── AppWithClerk.tsx         # Clerk-wrapped app
├── backend/                 # Backend API (optional)
│   ├── prisma/                  # Database schema
│   └── src/                     # API routes
├── docs/                    # Documentation
│   ├── DASHBOARD_ARCHITECTURE.md
│   ├── ENHANCED_FEATURES_GUIDE.md
│   ├── MINDMAP_TOOLBAR.md
│   ├── TESTING_GUIDE.md
│   └── STYLE_GUIDE.html
├── ARCHITECTURE_GUIDELINES.md   # Architecture patterns
├── MANUAL_TESTING_GUIDE.md      # Testing instructions
├── AI_IMAGE_ANALYZER_SETUP.md   # AI setup guide
├── SUPABASE_CLERK_SETUP.md      # Auth setup guide
├── DOCUMENTATION_INDEX.md       # Docs index
├── FEATURE_IMPLEMENTATION_PLAN.md # Feature roadmap
└── README.md                    # This file
```

## 🏗️ Architecture

This project follows a **clean, modular architecture** with clear separation of concerns:

- **Custom Hooks**: Business logic and state management (TypeScript)
- **Components**: UI presentation (JSX/TSX)
- **Contexts**: Global state (Auth, Theme, Language)
- **Utils**: Pure functions for shared operations
- **Types**: Strongly typed data structures

### Design Principles
1. Extract complex logic into custom hooks
2. Keep components focused and under 200 lines when possible
3. Use TypeScript for type safety
4. Separate concerns between UI and business logic

For detailed architecture patterns, see [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

See [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md) for manual testing procedures.
See [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) for additional testing documentation.

## 🎯 Key Features in Detail

### Node Operations
- Create, read, update, delete nodes
- Parent-child relationships with visual connections
- Detach/reattach to new parents
- Copy/paste functionality
- Bulk operations (multi-select)
- Task completion tracking with progress counters

### Visual Customization
- 7+ node shapes (rectangle, rounded, circle, diamond, hexagon, parallelogram)
- Custom colors with grid/round color pickers
- Emoji support with emoji picker
- Font family, size, and color customization
- Theme presets with backgrounds, borders, shadows
- Connection line styles (bracket, curved)

### Layout Algorithms
- **Tree Layout**: Horizontal and vertical tree structures
- **Radial Layout**: Nodes arranged in concentric circles
- **Circular Layout**: Even distribution around a circle
- **Auto-arrange**: Automatically organize child nodes

### Data Persistence
- localStorage for client-side persistence
- Auto-save functionality
- Import/export capabilities
- Version history (undo/redo)

### Views
- **Mind Map**: Traditional node-based view
- **Board**: Kanban-style board view
- **List**: Hierarchical list view
- **Excel**: Spreadsheet-style table view
- **Gantt**: Timeline/Gantt chart view
- **Analytics**: Charts and statistics

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md) | Development patterns & best practices |
| [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md) | Manual testing procedures |
| [AI_IMAGE_ANALYZER_SETUP.md](./AI_IMAGE_ANALYZER_SETUP.md) | AI feature configuration |
| [SUPABASE_CLERK_SETUP.md](./SUPABASE_CLERK_SETUP.md) | Authentication setup |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | Complete documentation index |
| [FEATURE_IMPLEMENTATION_PLAN.md](./FEATURE_IMPLEMENTATION_PLAN.md) | Feature roadmap |
| [docs/ENHANCED_FEATURES_GUIDE.md](./docs/ENHANCED_FEATURES_GUIDE.md) | Enhanced features guide |
| [docs/DASHBOARD_ARCHITECTURE.md](./docs/DASHBOARD_ARCHITECTURE.md) | Dashboard architecture |

## 🤝 Contributing

This project follows structured development patterns:

1. **Before adding features**: Check `ARCHITECTURE_GUIDELINES.md`
2. **Extract logic**: Use custom hooks for complex state
3. **Extract UI**: Create focused components
4. **Add types**: Use TypeScript for new hooks and utils
5. **Test**: Write tests for new functionality

## 📝 License

This project is private and not licensed for public use.

## 👥 Authors

- **Ricardo Nogueira** - [@RicardoNogueira01](https://github.com/RicardoNogueira01)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Authentication by [Clerk](https://clerk.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

## 📋 Changelog

### December 2025
- ✅ Enhanced Dashboard with Leave Balance and Deadline Reminders widgets
- ✅ Implemented in-app reminder popup notifications
- ✅ Added Team Members page with card-based layout
- ✅ Added Team Hierarchy page for organizational structure
- ✅ Enabled anonymous navigation for team pages
- ✅ Improved node spacing and layout algorithms
- ✅ Enhanced node theming with backgrounds, fonts, borders, shadows
- ✅ Fixed task completion counter positioning
- ✅ Fixed child node positioning: children now properly alternate left/right and stack vertically
- ✅ Cleaned up documentation: removed 19 outdated completion reports
- ✅ Multiple UI/UX improvements across all pages

### November 2025
- ✅ Initial release with core mind mapping features
- ✅ Multiple view system (Board, List, Excel, Gantt, Analytics)
- ✅ Templates and layout algorithms
- ✅ Clerk authentication integration
- ✅ Leave management system
- ✅ Calendar integration

---

**Last Updated**: December 21, 2025  
**Status**: Active Development ✅
