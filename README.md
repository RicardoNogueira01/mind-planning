# Mind Planning 🧠

A modern, interactive mind mapping and task management application built with React and TypeScript. Create hierarchical mind maps, manage tasks, collaborate with teams, and visualize your ideas with an intuitive drag-and-drop interface.

## ✨ Features

### Mind Mapping
- **Hierarchical Node Structure**: Create parent-child relationships with automatic positioning
- **Drag & Drop**: Move nodes freely across the canvas with collision detection
- **Multiple Node Types**: Rectangle, rounded, circle, diamond, hexagon, parallelogram, and custom shapes
- **Real-time Connections**: Visual connections between parent and child nodes
- **Spider-Web Layout**: Automatic hierarchical positioning with intelligent spacing

### Interaction & Editing
- **Undo/Redo**: Full history support with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **Multi-Select**: Select and manipulate multiple nodes simultaneously
- **Inline Editing**: Edit node content, colors, emojis, and properties
- **Rich Node Properties**: Add notes, tags, due dates, attachments, and collaborators
- **Keyboard Shortcuts**: Power user support for common operations

### Collaboration & Management
- **Mind Map Library**: Organize and manage multiple mind maps
- **Favorites & Filtering**: Quick access to frequently used maps
- **Search & Sort**: Find maps by name, date, or size
- **Color Coding**: Customize maps and nodes with color themes
- **Share & Collaborate**: Share maps with team members

### Dashboard
- **Task Management**: Track upcoming deadlines and completed tasks
- **Team Overview**: Monitor team member activity and assignments
- **Calendar Integration**: Visualize tasks and deadlines on calendar
- **Analytics**: Dashboard with task statistics and insights

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing

### Backend (Optional)
- **Prisma** - Type-safe ORM
- **Node.js** - Backend runtime

### Testing
- **Vitest** - Fast unit testing
- **Testing Library** - Component testing
- **jsdom** - DOM simulation

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/RicardoNogueira01/mind-planning.git
cd mind-planning

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

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
│   ├── components/        # React components
│   │   ├── MindMap.jsx           # Main mind map orchestrator (1,558 lines)
│   │   ├── MindMapManager.jsx    # Map library manager (450 lines)
│   │   ├── mindmap/              # Mind map specific components
│   │   │   ├── dialogs/          # Modal dialogs (5 components)
│   │   │   ├── popups/           # Feature popups (7 components)
│   │   │   └── ...               # Canvas, toolbar, nodes, etc.
│   │   └── shared/               # Reusable components
│   ├── hooks/                # Custom React hooks (10 hooks)
│   │   ├── useNodePositioning.ts      # Positioning logic
│   │   ├── useNodeOperations.ts       # Node CRUD operations
│   │   ├── useDragging.ts             # Drag & pan interactions
│   │   ├── useKeyboardShortcuts.ts    # Keyboard shortcuts
│   │   ├── useNodeSelection.ts        # Selection management
│   │   ├── useConnectionDrawing.ts    # Connection UI
│   │   ├── useMindMaps.ts             # Map data & localStorage
│   │   ├── useMindMapFilters.ts       # Filtering & sorting
│   │   └── ...
│   ├── utils/                # Utility functions
│   │   ├── nodeUtils.js           # Node helpers
│   │   └── dateUtils.ts           # Date formatting
│   ├── types/                # TypeScript type definitions
│   │   └── mindmap.ts
│   ├── pages/                # Page components
│   └── App.jsx               # Main application
├── backend/              # Backend API (optional)
│   ├── prisma/               # Database schema
│   └── src/                  # API routes
├── docs/                 # Documentation
├── ARCHITECTURE_GUIDELINES.md  # Architecture patterns
├── MANUAL_TESTING_GUIDE.md     # Testing instructions
└── README.md             # This file
```

## 🏗️ Architecture

This project follows a **clean, modular architecture** with clear separation of concerns:

- **Custom Hooks**: Business logic and state management
- **Components**: UI presentation (< 200 lines each)
- **Utils**: Pure functions for shared operations
- **TypeScript Types**: Strongly typed data structures

### Refactoring Achievements
- **MindMap.jsx**: Reduced from 2,441 → 1,558 lines (36% reduction)
- **MindMapManager.jsx**: Reduced from 711 → 450 lines (37% reduction)
- **Total**: 1,144 lines eliminated, 25 modular files created

For detailed architecture patterns and development guidelines, see [ARCHITECTURE_GUIDELINES.md](./ARCHITECTURE_GUIDELINES.md)

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

## 🎯 Key Features in Detail

### Node Operations
- Create, read, update, delete nodes
- Parent-child relationships
- Detach/reattach to new parents
- Copy/paste functionality
- Bulk operations (multi-select)

### Visual Customization
- 7+ node shapes
- Custom colors with color picker
- Emoji support
- Font size and styling
- Connection line styles

### Data Persistence
- localStorage for client-side persistence
- Auto-save functionality
- Import/export capabilities
- Version history (undo/redo)

## 🤝 Contributing

This project follows structured refactoring patterns:

1. **Before adding features**: Check `ARCHITECTURE_GUIDELINES.md`
2. **Extract logic**: Use custom hooks for complex state
3. **Extract UI**: Create components < 200 lines
4. **Add types**: Use TypeScript for new hooks
5. **Test**: Write tests for new functionality

## 📝 License

This project is private and not licensed for public use.

## 👥 Authors

- **Ricardo Nogueira** - [@RicardoNogueira01](https://github.com/RicardoNogueira01)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated**: November 18, 2025  
**Status**: Active Development ✅
