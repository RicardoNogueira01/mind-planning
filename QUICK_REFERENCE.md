# Quick Reference Guide - Shared Components

## 🚀 Quick Start

```jsx
// 1. Import what you need
import { ToggleSwitch, SectionCard, StatCard } from './shared';

// 2. Use in your JSX
<SectionCard icon={Bell} title="Settings">
  <ToggleSwitch label="Notifications" checked={true} onChange={handleToggle} />
</SectionCard>
```

## 📋 Component Cheat Sheet

### ToggleSwitch
```jsx
<ToggleSwitch
  checked={boolean}
  onChange={function}
  label="string"
  description="string"  // optional
  icon={IconComponent}  // optional
  disabled={boolean}    // optional
/>
```

### SectionCard
```jsx
<SectionCard
  icon={IconComponent}
  iconColor="bg-blue-100"
  iconTextColor="text-blue-600"
  title="string"
  subtitle="string"     // optional
  headerAction={node}   // optional
>
  {children}
</SectionCard>
```

### StatCard
```jsx
<StatCard
  value={number|string}
  label="string"
  icon={IconComponent}  // optional
  iconColor="text-blue-500"
  bgColor="bg-white"
  borderColor="border-blue-200"
  valueColor="text-blue-600"
/>
```

### TeamMemberCard
```jsx
<TeamMemberCard
  member={{
    id, name, initials, email, phone, role,
    color, performance, tasksCompleted,
    tasksInProgress, overdueTasks
  }}
  colorClass="from-blue-500 to-blue-600"
  showActions={boolean}
  onMessageClick={function}  // optional
/>
```

### AvatarWithInitials
```jsx
<AvatarWithInitials
  initials="JD"
  color="bg-blue-500"
  size="xs|sm|md|lg|xl"
  showOnlineStatus={boolean}  // optional
  isOnline={boolean}          // optional
/>
```

### ProgressBar
```jsx
<ProgressBar
  percentage={75}
  color="bg-blue-500"
  bgColor="bg-gray-100"
  height="h-2"
  showLabel={boolean}   // optional
  label="string"        // optional
  animated={boolean}    // optional
/>
```

### StatusBadge
```jsx
<StatusBadge
  status="success|warning|error|info|neutral"
  label="string"        // optional
  showDot={boolean}
  size="xs|sm|md|lg"
/>
```

### CardHeader
```jsx
<CardHeader
  icon={IconComponent}
  title="string"
  subtitle="string"           // optional
  viewAllLink="/path"         // optional
  viewAllText="View All"      // optional
  onViewAllClick={function}   // optional
  iconBgColor="bg-gray-50"
  iconColor="text-gray-700"
/>
```

### SelectInput
```jsx
<SelectInput
  label="string"
  value={string}
  onChange={function}
  options={[
    { value: 'val1', label: 'Label 1' },
    { value: 'val2', label: 'Label 2' }
  ]}
  icon={IconComponent}  // optional
  disabled={boolean}    // optional
/>
```

## 🎨 Common Patterns

### Settings Section
```jsx
<SectionCard icon={Bell} title="Notifications" subtitle="Manage preferences">
  <div className="space-y-4">
    <ToggleSwitch label="Email" checked={settings.email} onChange={() => toggle('email')} icon={Mail} />
    <ToggleSwitch label="Push" checked={settings.push} onChange={() => toggle('push')} icon={Smartphone} />
  </div>
</SectionCard>
```

### Stats Display
```jsx
<div className="flex gap-3">
  <StatCard value={13} label="Available" icon={CalendarDays} iconColor="text-teal-500" />
  <StatCard value={3} label="Pending" icon={Clock} iconColor="text-amber-500" />
  <StatCard value={8} label="Used" icon={CheckCircle} iconColor="text-gray-500" />
</div>
```

### Team Member List
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {members.map(member => (
    <TeamMemberCard
      key={member.id}
      member={member}
      colorClass="from-blue-500 to-blue-600"
      showActions={true}
    />
  ))}
</div>
```

### Card with Header
```jsx
<div className="bg-white rounded-xl p-6">
  <CardHeader
    icon={Users}
    title="Team"
    subtitle="4 Members"
    viewAllLink="/team-members"
  />
  {/* Card content */}
</div>
```

## 🎯 Common Use Cases

### Settings Page
```jsx
import { SectionCard, ToggleSwitch, SelectInput } from './shared';

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <SectionCard icon={Bell} title="Notifications">
    <ToggleSwitch label="Email" checked={...} onChange={...} />
    <ToggleSwitch label="Push" checked={...} onChange={...} />
  </SectionCard>
  
  <SectionCard icon={Globe} title="Preferences">
    <SelectInput label="Language" value={...} onChange={...} options={...} />
    <SelectInput label="Timezone" value={...} onChange={...} options={...} />
  </SectionCard>
</div>
```

### Dashboard Stats
```jsx
import { StatCard, CardHeader } from './shared';

<div className="bg-white rounded-xl p-6">
  <CardHeader icon={Activity} title="Overview" viewAllLink="/stats" />
  <div className="grid grid-cols-3 gap-3">
    <StatCard value={32} label="Completed" iconColor="text-green-500" />
    <StatCard value={18} label="In Progress" iconColor="text-blue-500" />
    <StatCard value={5} label="Overdue" iconColor="text-red-500" />
  </div>
</div>
```

### Team Display
```jsx
import { TeamMemberCard, AvatarWithInitials, ProgressBar } from './shared';

// Option 1: Full card
<TeamMemberCard member={member} colorClass="from-blue-500 to-blue-600" />

// Option 2: Custom layout
<div className="flex items-center gap-3">
  <AvatarWithInitials initials={member.initials} color="bg-blue-500" size="md" />
  <div className="flex-1">
    <h3>{member.name}</h3>
    <ProgressBar percentage={75} color="bg-blue-500" />
  </div>
</div>
```

## 🔧 Customization Tips

### Override Styles
```jsx
// Add custom classes
<StatCard className="hover:scale-105 transition-transform" />

// Combine with existing props
<SectionCard className="shadow-2xl" icon={Bell} title="Custom" />
```

### Conditional Rendering
```jsx
// Show/hide based on conditions
{hasNotifications && (
  <StatusBadge status="warning" label={`${count} new`} />
)}

// Dynamic props
<ProgressBar
  percentage={progress}
  color={progress > 80 ? 'bg-green-500' : 'bg-blue-500'}
/>
```

### Event Handling
```jsx
// Pass callbacks
<ToggleSwitch
  onChange={() => {
    handleToggle('email');
    trackEvent('toggle_email');
  }}
/>

// Custom handlers
<TeamMemberCard
  onMessageClick={() => openMessageDialog(member)}
/>
```

## ⚠️ Common Mistakes

### ❌ Don't Do This
```jsx
// Don't modify component internals
<ToggleSwitch style={{ color: 'red' }} />

// Don't use inline styles
<StatCard style={{ backgroundColor: 'blue' }} />

// Don't skip required props
<SelectInput onChange={...} /> // Missing 'options'
```

### ✅ Do This Instead
```jsx
// Use provided props
<ToggleSwitch iconColor="text-red-500" />

// Use Tailwind classes
<StatCard bgColor="bg-blue-50" />

// Provide all required props
<SelectInput options={[...]} onChange={...} value={...} label="..." />
```

## 📊 Size Reference

### Avatar Sizes
- `xs`: 24px (w-6 h-6)
- `sm`: 32px (w-8 h-8)
- `md`: 40px (w-10 h-10) ← Default
- `lg`: 48px (w-12 h-12)
- `xl`: 56px (w-14 h-14)

### Badge Sizes
- `xs`: 10px text, tight padding
- `sm`: 12px text, small padding
- `md`: 14px text, medium padding ← Default
- `lg`: 16px text, large padding

### Progress Bar Heights
- `h-1`: 4px (thin)
- `h-2`: 8px (default)
- `h-3`: 12px (medium)
- `h-4`: 16px (thick)

## 🎨 Color Palette

### Status Colors
```jsx
status="success"  // Green
status="warning"  // Amber
status="error"    // Red
status="info"     // Blue
status="neutral"  // Gray
```

### Icon Background Colors
```jsx
iconColor="bg-blue-100"    iconTextColor="text-blue-600"
iconColor="bg-green-100"   iconTextColor="text-green-600"
iconColor="bg-red-100"     iconTextColor="text-red-600"
iconColor="bg-purple-100"  iconTextColor="text-purple-600"
iconColor="bg-orange-100"  iconTextColor="text-orange-600"
```

## 🔍 Debugging Tips

### Check Props
```jsx
// Log props to console
<ToggleSwitch
  {...props}
  onChange={(e) => {
    console.log('Toggle changed:', e);
    handleToggle(e);
  }}
/>
```

### Verify Imports
```jsx
// Make sure you're importing from the right place
import { ToggleSwitch } from './shared';  // ✅ Correct
import ToggleSwitch from './ToggleSwitch'; // ❌ Wrong
```

### Check Required Props
```jsx
// All components have required props - check the docs!
// Missing required props will cause errors
```

## 📚 Further Reading

- **Full Documentation**: `src/components/shared/README.md`
- **Migration Examples**: `src/components/shared/REFACTORING_EXAMPLES.md`
- **Architecture**: `COMPONENT_ARCHITECTURE.md`
- **Summary**: `COMPONENTIZATION_SUMMARY.md`

---

**Need Help?** Check the full documentation or look at the refactoring examples!
