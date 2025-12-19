# Component Refactoring Examples

This document shows before/after examples of refactoring existing code to use the new shared components.

## Example 1: SettingsPage.jsx - Toggle Switches

### Before (Lines 141-158):
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
    <input
      type="checkbox"
      checked={settings.emailNotifications}
      onChange={() => handleToggle('emailNotifications')}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
  </label>
</div>
```

### After:
```jsx
import { ToggleSwitch } from './shared';
import { Mail } from 'lucide-react';

<ToggleSwitch
  checked={settings.emailNotifications}
  onChange={() => handleToggle('emailNotifications')}
  label="Email Notifications"
  description="Receive notifications via email"
  icon={Mail}
/>
```

**Benefits:**
- Reduced from 17 lines to 7 lines (59% reduction)
- More readable and maintainable
- Consistent styling across the app

---

## Example 2: SettingsPage.jsx - Section Cards

### Before (Lines 129-242):
```jsx
<div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Bell size={20} className="text-blue-600" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-900">{t('settings.notifications.title')}</h2>
      <p className="text-sm text-gray-500">{t('settings.notifications.subtitle')}</p>
    </div>
  </div>

  <div className="space-y-4">
    {/* Toggle switches here */}
  </div>
</div>
```

### After:
```jsx
import { SectionCard, ToggleSwitch } from './shared';
import { Bell, Mail, Smartphone } from 'lucide-react';

<SectionCard
  icon={Bell}
  iconColor="bg-blue-100"
  iconTextColor="text-blue-600"
  title={t('settings.notifications.title')}
  subtitle={t('settings.notifications.subtitle')}
>
  <div className="space-y-4">
    <ToggleSwitch
      checked={settings.emailNotifications}
      onChange={() => handleToggle('emailNotifications')}
      label="Email Notifications"
      description="Receive notifications via email"
      icon={Mail}
    />
    <ToggleSwitch
      checked={settings.pushNotifications}
      onChange={() => handleToggle('pushNotifications')}
      label="Push Notifications"
      description="Receive push notifications on your devices"
      icon={Smartphone}
    />
  </div>
</SectionCard>
```

---

## Example 3: TeamHierarchy.jsx - Member Cards

### Before (Lines 332-401):
```jsx
<div
  key={member.id}
  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
>
  <div className={`h-2 bg-gradient-to-br ${currentHierarchy.color}`}></div>

  <div className="p-5">
    <div className="flex items-start gap-3 mb-4">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md relative flex-shrink-0"
        style={{ backgroundColor: member.color }}
      >
        {member.initials}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-base truncate">{member.name}</h3>
        <p className="text-xs text-gray-500 truncate">{member.role}</p>
        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPerformanceColor(member.performance)}`}>
          {member.performance.replace('-', ' ')}
        </span>
      </div>
    </div>

    {/* Contact Info */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Mail size={12} className="text-gray-400 flex-shrink-0" />
        <span className="truncate">{member.email}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Phone size={12} className="text-gray-400 flex-shrink-0" />
        <span>{member.phone}</span>
      </div>
    </div>

    {/* Task Stats */}
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="bg-green-50 rounded-lg p-2 text-center">
        <div className="text-green-600 font-bold text-sm">{member.tasksCompleted}</div>
        <div className="text-[10px] text-gray-500">Done</div>
      </div>
      <div className="bg-blue-50 rounded-lg p-2 text-center">
        <div className="text-blue-600 font-bold text-sm">{member.tasksInProgress}</div>
        <div className="text-[10px] text-gray-500">Active</div>
      </div>
      <div className="bg-red-50 rounded-lg p-2 text-center">
        <div className="text-red-600 font-bold text-sm">{member.overdueTasks}</div>
        <div className="text-[10px] text-gray-500">Overdue</div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <Link
        to={`/profile/${member.id}`}
        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2"
      >
        <User size={14} />
        Profile
      </Link>
      <button className="flex-1 px-3 py-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2">
        <Mail size={14} />
        Message
      </button>
    </div>
  </div>
</div>
```

### After:
```jsx
import { TeamMemberCard } from './shared';

<TeamMemberCard
  member={member}
  colorClass={currentHierarchy.color}
  showActions={true}
  onMessageClick={() => console.log('Message', member.name)}
/>
```

**Benefits:**
- Reduced from 70 lines to 6 lines (91% reduction!)
- Consistent member card styling
- Easy to maintain and update

---

## Example 4: Dashboard.jsx - Stat Cards

### Before (Lines 577-585):
```jsx
<div className="bg-white rounded-xl px-4 py-3 border border-teal-200 min-w-[100px]">
  <div className="flex items-center gap-2">
    <CalendarDays size={16} className="text-teal-500" />
    <span className="text-2xl font-bold text-teal-600" style={{ fontFamily: 'DM Mono, monospace' }}>
      13
    </span>
  </div>
  <p className="text-xs text-gray-600 font-medium mt-1">Available</p>
</div>
```

### After:
```jsx
import { StatCard } from './shared';
import { CalendarDays } from 'lucide-react';

<StatCard
  value={13}
  label="Available"
  icon={CalendarDays}
  iconColor="text-teal-500"
  bgColor="bg-white"
  borderColor="border-teal-200"
  valueColor="text-teal-600"
/>
```

---

## Example 5: Dashboard.jsx - Card Headers

### Before (Lines 305-323):
```jsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
  <div className="flex items-center gap-2">
    <div className="p-2 bg-gray-50 rounded-lg">
      <Map size={18} className="text-gray-700" />
    </div>
    <div>
      <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>Recent Mind Maps</h2>
      <p className="text-xs text-gray-500" style={{ fontFamily: 'DM Sans, sans-serif' }}>Recently modified maps</p>
    </div>
  </div>
  <Link
    to="/mindmaps"
    className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
    style={{ fontFamily: 'DM Sans, sans-serif' }}
  >
    View All
    <ArrowRight size={14} />
  </Link>
</div>
```

### After:
```jsx
import { CardHeader } from './shared';
import { Map } from 'lucide-react';

<CardHeader
  icon={Map}
  title="Recent Mind Maps"
  subtitle="Recently modified maps"
  viewAllLink="/mindmaps"
/>
```

---

## Example 6: Dashboard.jsx - Progress Bars

### Before (Lines 463-468):
```jsx
<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
  <div
    className={clsx("h-2 rounded-full transition-all duration-500", collab.color)}
    style={{ width: `${(collab.tasksCompleted / collab.tasksAssigned) * 100}%` }}
  ></div>
</div>
```

### After:
```jsx
import { ProgressBar } from './shared';

<ProgressBar
  percentage={(collab.tasksCompleted / collab.tasksAssigned) * 100}
  color={collab.color}
  bgColor="bg-gray-100"
  height="h-2"
  animated={true}
/>
```

---

## Example 7: Dashboard.jsx - Avatars

### Before (Lines 426-428):
```jsx
<div className={clsx("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0", collab.color)}>
  {collab.initials}
</div>
```

### After:
```jsx
import { AvatarWithInitials } from './shared';

<AvatarWithInitials
  initials={collab.initials}
  color={collab.color}
  size="md"
  className="sm:w-12 sm:h-12"
/>
```

---

## Example 8: TeamHierarchy.jsx - Status Badges

### Before (Lines 352-354):
```jsx
<span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPerformanceColor(member.performance)}`}>
  {member.performance.replace('-', ' ')}
</span>
```

### After:
```jsx
import { StatusBadge } from './shared';

<StatusBadge
  status={member.performance}
  size="xs"
  showDot={true}
/>
```

---

## Example 9: SettingsPage.jsx - Select Inputs

### Before (Lines 258-268):
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
  <select
    value={settings.profileVisibility}
    onChange={(e) => handleChange('profileVisibility', e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="public">Public - Everyone can see</option>
    <option value="team">Team - Only team members</option>
    <option value="private">Private - Only me</option>
  </select>
</div>
```

### After:
```jsx
import { SelectInput } from './shared';

<SelectInput
  label="Profile Visibility"
  value={settings.profileVisibility}
  onChange={(e) => handleChange('profileVisibility', e.target.value)}
  options={[
    { value: 'public', label: 'Public - Everyone can see' },
    { value: 'team', label: 'Team - Only team members' },
    { value: 'private', label: 'Private - Only me' }
  ]}
/>
```

---

## Summary of Benefits

| Component | Lines Saved | Readability | Maintainability |
|-----------|-------------|-------------|-----------------|
| ToggleSwitch | ~10 lines each | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| SectionCard | ~8 lines each | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| TeamMemberCard | ~65 lines each | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| StatCard | ~6 lines each | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| CardHeader | ~15 lines each | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| ProgressBar | ~4 lines each | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| AvatarWithInitials | ~2 lines each | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| StatusBadge | ~2 lines each | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| SelectInput | ~8 lines each | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Next Steps

1. **Start with high-impact files**: SettingsPage.jsx, TeamHierarchy.jsx, Dashboard.jsx
2. **Test after each migration**: Ensure functionality is preserved
3. **Update gradually**: Migrate one component type at a time
4. **Document changes**: Update any relevant documentation

## Migration Checklist

- [ ] Import new components from `./shared`
- [ ] Replace repetitive HTML with component calls
- [ ] Test all functionality
- [ ] Remove unused helper functions (like `getPerformanceColor`)
- [ ] Update prop types if using TypeScript
- [ ] Remove old commented code
- [ ] Update tests if applicable
