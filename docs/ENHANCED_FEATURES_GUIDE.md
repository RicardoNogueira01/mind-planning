# 🚀 Mind Planning - Enhanced Features Guide

Welcome to the Enhanced Features documentation for Mind Planning! This guide covers the innovative productivity tools designed to revolutionize how you manage projects.

## Table of Contents

1. [Overview](#overview)
2. [AI Task Decomposer](#ai-task-decomposer)
3. [Smart Dependency Analyzer](#smart-dependency-analyzer)
4. [Team Workload Heatmap](#team-workload-heatmap)
5. [Time Travel (Project Snapshots)](#time-travel-project-snapshots)
6. [Focus Mode with Pomodoro](#focus-mode-with-pomodoro)
7. [Risk Assessment Matrix](#risk-assessment-matrix)
8. [Quick Access Toolbar](#quick-access-toolbar)
9. [Best Practices](#best-practices)

---

## Overview

Mind Planning now includes six powerful features that leverage intelligent analysis and modern productivity techniques to help your team work smarter:

| Feature | Icon | Purpose |
|---------|------|---------|
| AI Task Decomposer | ✨ | Automatically break down tasks into subtasks |
| Smart Dependencies | 🔗 | Detect and suggest task relationships |
| Workload Heatmap | 👥 | Visualize team capacity and prevent burnout |
| Time Travel | ⏰ | Save and restore project states |
| Focus Mode | 🎯 | Pomodoro timer for deep work |
| Risk Assessment | ⚠️ | Identify and track project risks |

Access these features from the **Enhanced Features Toolbar** at the bottom center of the mind map view.

---

## AI Task Decomposer

### What it does
The AI Task Decomposer analyzes your task text and intelligently suggests a breakdown into manageable subtasks based on industry best practices.

### How to use

1. **Select a task node** in your mind map
2. Click the **✨ AI Breakdown** button in the toolbar
3. Click **"Generate Subtasks"** to analyze the task
4. Review the suggested subtasks with estimated hours and priorities
5. Select/deselect subtasks you want to add
6. Click **"Add Subtasks"** to create them as child nodes

### Supported task patterns

The AI recognizes these common project types:

| Pattern | Example Tasks |
|---------|--------------|
| **Design** | "Design homepage", "Create wireframes", "UI mockup" |
| **Development** | "Build API", "Implement feature", "Code backend" |
| **Launch** | "Release v2.0", "Deploy to production", "Go-live" |
| **Research** | "Analyze competitors", "User research", "Market study" |
| **Marketing** | "Social media campaign", "Content strategy", "Brand launch" |
| **Testing** | "QA testing", "Performance audit", "Verify functionality" |
| **Documentation** | "Write docs", "Create user guide", "API documentation" |
| **Meetings** | "Planning meeting", "Review session", "Team sync" |

### Pro Tips

- Use descriptive task names for better suggestions
- Tasks with keywords like "design", "develop", or "test" get specialized breakdowns
- You can add custom subtasks using the "Add custom subtask" option
- Regenerate suggestions if the first set doesn't fit your needs

---

## Smart Dependency Analyzer

### What it does
Automatically detects potential task dependencies by analyzing task names and matching them against common workflow patterns.

### How to use

1. Click the **🔗 Dependencies** button in the toolbar
2. Review suggested dependencies with confidence levels
3. Click **"Create Dependency"** for connections you want to add
4. Use **"Accept All"** to add all suggestions at once
5. Dismiss suggestions that don't apply with the ✕ button

### Detected patterns

The analyzer recognizes these workflow sequences:

```
Design → Development
Research → Design/Planning
Development → Testing
Testing → Deployment
Planning → Execution
Approval → Launch
Setup → Main work
Draft → Review → Finalize
Data Gathering → Analysis
Backend → Frontend Integration
Documentation → Training/Handoff
```

### Confidence levels

- **High (Green)**: 90%+ match - very likely correct
- **Medium (Amber)**: 80-89% match - probable dependency
- **Low (Gray)**: Below 80% - possible but review carefully

---

## Team Workload Heatmap

### What it does
Visualizes how work is distributed across your team, helping prevent burnout and optimize resource allocation.

### How to use

1. Click the **👥 Workload** button in the toolbar
2. View the team overview with workload bars
3. Click on a team member to see their assigned tasks
4. Use sorting options: Workload, Tasks, or Name
5. Identify team members who are overloaded or have capacity

### Status indicators

| Status | Workload | Color |
|--------|----------|-------|
| **Overloaded** | >80% | 🔴 Red |
| **Busy** | 60-80% | 🟠 Amber |
| **Balanced** | 30-60% | 🟢 Green |
| **Available** | <30% | 🔵 Blue |

### Workload calculation

Workload score considers:
- Total estimated hours assigned
- Number of overdue tasks (+10 per overdue)
- Upcoming deadlines within 3 days (+5 each)

### Team insights

The footer shows:
- Count of overloaded team members
- Count of team members with available capacity
- Recommendations for rebalancing work

---

## Time Travel (Project Snapshots)

### What it does
Allows you to save the current state of your project at any point and restore it later. Think of it as "version control" for your mind map.

### How to use

#### Creating a snapshot
1. Click the **⏰ Snapshots** button in the toolbar
2. Click **"Create Snapshot"**
3. Enter a descriptive name (e.g., "Before redesign")
4. Optionally add a description
5. Click **"Save"**

#### Restoring a snapshot
1. Open the Time Travel panel
2. Find the snapshot you want to restore
3. Click **"Restore"**
4. Click again to confirm (reverts in 3 seconds if not confirmed)

#### Exporting/Importing
- **Export**: Click the download icon to save as JSON file
- **Import**: Use "Advanced Options" → "Import Snapshot"

### Best practices

- Create snapshots before major changes
- Use descriptive names like "Sprint 3 kickoff" or "After client feedback"
- Export important snapshots for backup
- Delete old snapshots you no longer need

### Snapshot metadata

Each snapshot stores:
- All nodes with their properties
- All connections between nodes
- Node count and completion status
- Timestamp of creation

---

## Focus Mode with Pomodoro

### What it does
A built-in Pomodoro timer to help you focus on specific tasks without distractions. Includes break management and session tracking.

### How to use

1. **Select a task** you want to focus on (optional)
2. Click the **🎯 Focus** button in the toolbar
3. Click **▶️ Play** to start the timer
4. Work until the timer ends (default: 25 minutes)
5. Take a break when prompted
6. Repeat for multiple sessions

### Timer modes

| Mode | Default Duration | When |
|------|-----------------|------|
| **Focus** | 25 minutes | Deep work session |
| **Short Break** | 5 minutes | Between sessions |
| **Long Break** | 15 minutes | After 4 sessions |

### Controls

- **▶️ Play/Pause**: Start or pause the timer
- **⏹️ Reset**: Reset to the beginning
- **⏭️ Skip**: Skip to the next mode (break or focus)
- **✓ Mark Done**: Mark the current task as complete

### Settings

Click the ⚙️ icon to customize:
- Focus duration (1-120 minutes)
- Short break duration (1-30 minutes)
- Long break duration (1-60 minutes)
- Sessions until long break (1-10)
- Auto-start breaks (on/off)
- Auto-start focus (on/off)

### Session tracking

The panel shows:
- Session progress dots (fills after each completed session)
- Total sessions completed today
- Total focus time accumulated

### Sound notifications

Enable/disable notification sounds with the 🔊 button. A tone plays when:
- Focus session ends
- Break session ends

---

## Risk Assessment Matrix

### What it does
Automatically analyzes your project and identifies potential risks based on task status, deadlines, dependencies, and team assignments.

### How to use

1. Click the **⚠️ Risks** button in the toolbar
2. View the risk summary (Critical, High, Medium counts)
3. Click on a risk to expand details
4. Review risk factors and recommendations
5. Filter by severity using the summary cards

### Risk factors detected

| Risk Factor | Impact | Example |
|-------------|--------|---------|
| **Overdue tasks** | High | Task due yesterday |
| **Blocking dependencies** | High | Task blocks 3+ others |
| **Unassigned high-priority** | Medium | Critical task with no owner |
| **Missing deadlines** | Medium | High priority without due date |
| **Stalled tasks** | High | In progress 2x longer than estimated |
| **Blocked by incomplete** | Medium | Waiting on unfinished dependencies |
| **Low progress near deadline** | High | 20% complete, due in 3 days |

### Severity levels

| Severity | Score Range | Badge Color |
|----------|-------------|-------------|
| **Critical** | >50 | 🔴 Red |
| **High** | 30-50 | 🟠 Amber |
| **Medium** | 1-29 | 🟡 Yellow |

### Recommendations

Each risk includes actionable recommendations:
- "Prioritize this task immediately"
- "Assign a team member with appropriate skills"
- "Set a realistic deadline"
- "Review for blockers or scope creep"
- "Complete blocking tasks first"

---

## Quick Access Toolbar

The Enhanced Features Toolbar appears at the bottom center of the mind map view.

### Layout

```
[✨ AI Breakdown] [🔗 Dependencies] [👥 Workload] | [⏰ Snapshots] [🎯 Focus] [⚠️ Risks]
```

### Keyboard shortcuts (coming soon)

- `Ctrl/Cmd + Shift + A` - AI Breakdown
- `Ctrl/Cmd + Shift + D` - Dependencies
- `Ctrl/Cmd + Shift + W` - Workload
- `Ctrl/Cmd + Shift + S` - Snapshots
- `Ctrl/Cmd + Shift + F` - Focus Mode
- `Ctrl/Cmd + Shift + R` - Risk Assessment

### Mobile behavior

On smaller screens:
- Icon labels are hidden
- Panels open as full-screen modals
- Touch-friendly button sizing

---

## Best Practices

### For AI Task Decomposer
1. Use clear, action-oriented task names
2. Include context words like "design", "build", "test"
3. Review and adjust estimated hours based on your experience
4. Add custom subtasks for project-specific needs

### For Dependency Analyzer
1. Run analysis after adding new tasks
2. Review suggestions carefully - not all are correct
3. Consider dismissing false positives to clean up the list
4. Re-run after major project restructuring

### For Workload Heatmap
1. Keep estimated hours updated on tasks
2. Assign all high-priority tasks to team members
3. Check weekly to prevent burnout
4. Redistribute when someone is overloaded

### For Time Travel
1. Create snapshots before major changes
2. Name snapshots with dates and context
3. Export critical milestones for backup
4. Clean up old, unnecessary snapshots

### For Focus Mode
1. Select your most important task before starting
2. Minimize distractions during focus sessions
3. Actually take your breaks - they improve productivity
4. Track your sessions over time to see patterns

### For Risk Assessment
1. Review risks at the start of each week
2. Address critical risks immediately
3. Assign owners to unassigned high-priority tasks
4. Set deadlines on tasks missing them

---

## Technical Notes

### Component locations
All enhanced feature components are in:
```
src/components/enhanced/
├── index.js
├── AITaskDecomposer.jsx
├── DependencyAnalyzer.jsx
├── WorkloadHeatmap.jsx
├── TimeTravel.jsx
├── FocusMode.jsx
└── RiskMatrix.jsx
```

### State management
Enhanced features use local React state within `MindMap.jsx`:
- `showEnhancedPanel` - Which panel is open
- `projectSnapshots` - Array of saved snapshots
- `focusTaskNode` - Currently focused task

### Data persistence
Currently, snapshots are stored in component state. For production:
- Implement localStorage persistence
- Add backend API integration
- Consider IndexedDB for large projects

---

## Feedback

We'd love to hear your thoughts on these features! Please submit feedback through:
- GitHub Issues
- In-app feedback form
- Team Slack channel

---

*Last updated: December 2025*
*Version: 1.0.0*
