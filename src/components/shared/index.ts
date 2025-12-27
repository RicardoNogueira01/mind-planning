// Shared Components Index
// Export all reusable components from a single location for easier imports
// Also export types for external use

export { default as TopBar } from './TopBar';
export { default as GlobalSearch } from './GlobalSearch';
export { default as NudgeButton, NudgeReceiver, triggerNudge, useNudge } from './NudgeButton';
export {
    default as OverdueBadge,
    DeadlineBadge,
    OverdueCounter,
    DaysOverdueDisplay,
    calculateDaysOverdue,
    calculateDaysUntil,
    isOverdue
} from './OverdueBadge';
export { default as TaskCard } from './TaskCard';

// Reusable UI components
export { default as ToggleSwitch } from './ToggleSwitch';
export { default as SectionCard } from './SectionCard';
export { default as StatCard } from './StatCard';
export { default as TeamMemberCard } from './TeamMemberCard';
export { default as AvatarWithInitials } from './AvatarWithInitials';
export { default as ProgressBar } from './ProgressBar';
export { default as StatusBadge } from './StatusBadge';
export { default as CardHeader } from './CardHeader';
export { default as SelectInput } from './SelectInput';

// New advanced components
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as Input } from './Input';
export { default as EmptyState } from './EmptyState';

// Export types
export type {
    // Common types
    Size,
    ButtonSize,
    InputSize,
    ModalSize,
    ButtonVariant,
    ButtonType,
    StatusType,
    Priority,
    TaskStatus,
    Performance,
    BadgeSize,

    // Component props
    ButtonProps,
    InputProps,
    InputType,
    ModalProps,
    AvatarWithInitialsProps,
    CardHeaderProps,
    EmptyStateProps,
    ProgressBarProps,
    SectionCardProps,
    SelectOption,
    SelectInputProps,
    StatCardProps,
    StatusBadgeProps,
    ToggleSwitchProps,
    Task,
    TaskAssignee,
    TaskCardProps,
    TeamMember,
    TeamMemberCardProps,
    OverdueBadgeProps,
    DeadlineBadgeProps,
    OverdueCounterProps,
    DaysOverdueDisplayProps,
    NudgePayload,
    NudgeButtonProps,
    NudgeReceiverProps,
    UseNudgeReturn,
} from './types';
