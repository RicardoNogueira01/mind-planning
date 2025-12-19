# Shared Components Documentation

This directory contains reusable UI components that are used throughout the application. These components help maintain consistency and reduce code duplication.

## 📦 Available Components

### 1. **ToggleSwitch**
A reusable toggle switch component for boolean settings.

**Usage:**
```jsx
import { ToggleSwitch } from '../components/shared';

<ToggleSwitch
  checked={settings.emailNotifications}
  onChange={() => handleToggle('emailNotifications')}
  label="Email Notifications"
  description="Receive notifications via email"
  icon={Mail}
/>
```

**Props:**
- `checked` (boolean): Current state of the toggle
- `onChange` (function): Callback when toggle is clicked
- `label` (string): Main label text
- `description` (string, optional): Subtitle text
- `icon` (Component, optional): Lucide icon component
- `disabled` (boolean, optional): Disable the toggle

---

### 2. **SectionCard**
A standardized card component with icon and header.

**Usage:**
```jsx
import { SectionCard } from '../components/shared';
import { Bell } from 'lucide-react';

<SectionCard
  icon={Bell}
  iconColor="bg-blue-100"
  iconTextColor="text-blue-600"
  title="Notifications"
  subtitle="Manage your notification preferences"
>
  {/* Card content */}
</SectionCard>
```

**Props:**
- `icon` (Component): Lucide icon component
- `iconColor` (string): Background color for icon container
- `iconTextColor` (string): Icon color
- `title` (string): Card title
- `subtitle` (string, optional): Card subtitle
- `children` (ReactNode): Card content
- `className` (string, optional): Additional CSS classes
- `headerAction` (ReactNode, optional): Action button/element in header

---

### 3. **StatCard**
A metric display card for showing statistics.

**Usage:**
```jsx
import { StatCard } from '../components/shared';
import { CheckCircle } from 'lucide-react';

<StatCard
  value={13}
  label="Available"
  icon={CheckCircle}
  iconColor="text-teal-500"
  bgColor="bg-white"
  borderColor="border-teal-200"
  valueColor="text-teal-600"
/>
```

**Props:**
- `value` (string|number): The metric value
- `label` (string): Label for the metric
- `icon` (Component, optional): Lucide icon component
- `iconColor` (string): Icon color
- `bgColor` (string): Background color
- `borderColor` (string): Border color
- `valueColor` (string): Value text color
- `className` (string, optional): Additional CSS classes

---

### 4. **TeamMemberCard**
A comprehensive card for displaying team member information.

**Usage:**
```jsx
import { TeamMemberCard } from '../components/shared';

<TeamMemberCard
  member={{
    id: 1,
    name: 'John Doe',
    initials: 'JD',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    role: 'Senior Developer',
    color: '#3B82F6',
    performance: 'excellent',
    tasksCompleted: 15,
    tasksInProgress: 5,
    overdueTasks: 0
  }}
  colorClass="from-blue-500 to-blue-600"
  showActions={true}
  onMessageClick={() => console.log('Message clicked')}
/>
```

**Props:**
- `member` (object): Member data object
- `colorClass` (string): Gradient color class for top bar
- `showActions` (boolean): Show/hide action buttons
- `onMessageClick` (function, optional): Message button click handler

---

### 5. **AvatarWithInitials**
A circular avatar component displaying user initials.

**Usage:**
```jsx
import { AvatarWithInitials } from '../components/shared';

<AvatarWithInitials
  initials="JD"
  color="bg-blue-500"
  size="md"
  showOnlineStatus={true}
  isOnline={true}
/>
```

**Props:**
- `initials` (string): User initials (1-3 characters)
- `color` (string): Background color class
- `size` (string): Size variant ('xs', 'sm', 'md', 'lg', 'xl')
- `className` (string, optional): Additional CSS classes
- `showOnlineStatus` (boolean): Show online status indicator
- `isOnline` (boolean): Online status

---

### 6. **ProgressBar**
A customizable progress bar component.

**Usage:**
```jsx
import { ProgressBar } from '../components/shared';

<ProgressBar
  percentage={75}
  color="bg-blue-500"
  bgColor="bg-gray-100"
  height="h-2"
  showLabel={true}
  label="Task Completion"
  animated={true}
/>
```

**Props:**
- `percentage` (number): Progress percentage (0-100)
- `color` (string): Progress bar color
- `bgColor` (string): Background color
- `height` (string): Height class
- `showLabel` (boolean): Show label above bar
- `label` (string): Label text
- `animated` (boolean): Enable smooth animation
- `className` (string, optional): Additional CSS classes

---

### 7. **StatusBadge**
A badge component for displaying status indicators.

**Usage:**
```jsx
import { StatusBadge } from '../components/shared';

<StatusBadge
  status="success"
  label="Completed"
  showDot={true}
  size="md"
/>
```

**Props:**
- `status` (string): Status type ('success', 'warning', 'error', 'info', 'neutral', 'approved', 'pending', etc.)
- `label` (string, optional): Custom label (defaults to status)
- `showDot` (boolean): Show status dot indicator
- `size` (string): Size variant ('xs', 'sm', 'md', 'lg')
- `className` (string, optional): Additional CSS classes

---

### 8. **CardHeader**
A standardized header for card components with optional view all link.

**Usage:**
```jsx
import { CardHeader } from '../components/shared';
import { Users } from 'lucide-react';

<CardHeader
  icon={Users}
  title="Team Members"
  subtitle="4 Members"
  viewAllLink="/team-members"
  viewAllText="View All"
  iconBgColor="bg-gray-50"
  iconColor="text-gray-700"
/>
```

**Props:**
- `icon` (Component): Lucide icon component
- `title` (string): Header title
- `subtitle` (string, optional): Header subtitle
- `viewAllLink` (string, optional): Link URL for view all
- `viewAllText` (string): Text for view all link
- `onViewAllClick` (function, optional): Click handler (if no link)
- `iconBgColor` (string): Icon background color
- `iconColor` (string): Icon color

---

### 9. **SelectInput**
A styled select dropdown component.

**Usage:**
```jsx
import { SelectInput } from '../components/shared';
import { Globe } from 'lucide-react';

<SelectInput
  label="Language"
  value={settings.language}
  onChange={(e) => handleChange('language', e.target.value)}
  options={[
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
    { value: 'es', label: 'Español' }
  ]}
  icon={Globe}
/>
```

**Props:**
- `label` (string): Input label
- `value` (string): Selected value
- `onChange` (function): Change handler
- `options` (array): Array of {value, label} objects
- `icon` (Component, optional): Lucide icon component
- `disabled` (boolean): Disable the select
- `className` (string, optional): Additional CSS classes

---

## 🎨 Design Principles

All components follow these design principles:

1. **Consistency**: Use the same design tokens (colors, spacing, typography)
2. **Flexibility**: Accept props for customization while providing sensible defaults
3. **Accessibility**: Include proper ARIA labels and keyboard navigation
4. **Responsiveness**: Work well on all screen sizes
5. **Reusability**: Can be used in multiple contexts without modification

## 📝 Usage Best Practices

1. **Import from index**: Always import from the shared index for cleaner code
   ```jsx
   import { ToggleSwitch, SectionCard } from '../components/shared';
   ```

2. **Consistent styling**: Use the provided props instead of adding custom styles
3. **Documentation**: Add JSDoc comments when using components in complex ways
4. **Testing**: Test components in isolation before using in production

## 🔄 Migration Guide

To migrate existing code to use these components:

1. **Identify repetitive patterns** in your JSX
2. **Replace with appropriate component** from this library
3. **Test thoroughly** to ensure behavior is preserved
4. **Remove old code** once migration is complete

### Example Migration:

**Before:**
```jsx
<div className="flex items-center justify-between py-3 border-b border-gray-100">
  <div className="flex items-center gap-3">
    <Mail size={18} className="text-gray-400" />
    <div>
      <p className="text-sm font-medium text-gray-900">Email Notifications</p>
      <p className="text-xs text-gray-500">Receive notifications via email</p>
    </div>
  </div>
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </label>
</div>
```

**After:**
```jsx
<ToggleSwitch
  checked={settings.emailNotifications}
  onChange={() => handleToggle('emailNotifications')}
  label="Email Notifications"
  description="Receive notifications via email"
  icon={Mail}
/>
```

## 🚀 Future Enhancements

Potential components to add:
- **Button** - Standardized button variants
- **Input** - Text input with validation
- **Modal** - Reusable modal dialog
- **Tooltip** - Hover tooltips
- **Tabs** - Tab navigation component
- **Accordion** - Collapsible sections
- **Pagination** - Page navigation
- **EmptyState** - No data placeholder

---

**Last Updated:** December 2025
