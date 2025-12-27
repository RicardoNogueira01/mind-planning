/**
 * Shared Types for Shared Components
 * Central location for type definitions used across shared UI components
 */

import { LucideIcon } from 'lucide-react';
import { ReactNode, ChangeEvent, MouseEvent, KeyboardEvent } from 'react';

// ============================================================================
// Common Types
// ============================================================================

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type InputSize = 'sm' | 'md' | 'lg';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonType = 'button' | 'submit' | 'reset';

export type StatusType =
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'excellent'
    | 'good'
    | 'needs-improvement'
    | 'approved'
    | 'pending'
    | 'canceled'
    | 'rejected';

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'completed' | 'in-progress' | 'pending' | 'cancelled';
export type Performance = 'excellent' | 'good' | 'needs-improvement';

// ============================================================================
// Button Component Types
// ============================================================================

export interface ButtonProps {
    children?: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    type?: ButtonType;
    [key: string]: any; // For additional HTML button attributes
}

// ============================================================================
// Input Component Types
// ============================================================================

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';

export interface InputProps {
    label?: string;
    value?: string | number;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: InputType;
    placeholder?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    className?: string;
    size?: InputSize;
    [key: string]: any; // For additional HTML input attributes
}

// ============================================================================
// Modal Component Types
// ============================================================================

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
    closeOnOverlayClick?: boolean;
    showCloseButton?: boolean;
    className?: string;
}

// ============================================================================
// Avatar Component Types
// ============================================================================

export interface AvatarWithInitialsProps {
    initials: string;
    color?: string;
    size?: Size;
    className?: string;
    showOnlineStatus?: boolean;
    isOnline?: boolean;
}

// ============================================================================
// Card Header Component Types
// ============================================================================

export interface CardHeaderProps {
    icon?: LucideIcon;
    title: string;
    subtitle?: string;
    viewAllLink?: string;
    viewAllText?: string;
    onViewAllClick?: () => void;
    iconBgColor?: string;
    iconColor?: string;
}

// ============================================================================
// Empty State Component Types
// ============================================================================

export interface EmptyStateProps {
    icon?: LucideIcon | ReactNode;
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Progress Bar Component Types
// ============================================================================

export interface ProgressBarProps {
    percentage: number;
    color?: string;
    bgColor?: string;
    height?: string;
    showLabel?: boolean;
    label?: string;
    animated?: boolean;
    className?: string;
}

// ============================================================================
// Section Card Component Types
// ============================================================================

export interface SectionCardProps {
    icon?: LucideIcon;
    iconColor?: string;
    iconTextColor?: string;
    title: string;
    subtitle?: string;
    children?: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

// ============================================================================
// Select Input Component Types
// ============================================================================

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectInputProps {
    label?: string;
    value?: string | number;
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
    options?: SelectOption[];
    icon?: LucideIcon;
    disabled?: boolean;
    className?: string;
}

// ============================================================================
// Stat Card Component Types
// ============================================================================

export interface StatCardProps {
    value: string | number;
    label: string;
    icon?: LucideIcon;
    iconColor?: string;
    bgColor?: string;
    borderColor?: string;
    valueColor?: string;
    className?: string;
}

// ============================================================================
// Status Badge Component Types
// ============================================================================

export interface StatusBadgeProps {
    status: StatusType | string;
    label?: string;
    showDot?: boolean;
    size?: ButtonSize;
    className?: string;
}

// ============================================================================
// Toggle Switch Component Types
// ============================================================================

export interface ToggleSwitchProps {
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: string;
    description?: string;
    icon?: LucideIcon;
    disabled?: boolean;
}

// ============================================================================
// Task Card Component Types
// ============================================================================

export interface TaskAssignee {
    name?: string;
    [key: string]: any;
}

export interface Task {
    id: string | number;
    title: string;
    description?: string;
    priority?: Priority;
    urgencyLevel?: string;
    progress?: number;
    status?: TaskStatus | string;
    dueDate?: string;
    timeUntilDue?: string;
    assignedTo?: string | TaskAssignee;
    tags?: string[];
}

export interface TaskCardProps {
    task: Task;
    onClick?: (task: Task) => void;
    showProgress?: boolean;
    showStatus?: boolean;
    showPriority?: boolean;
    showDueDate?: boolean;
    showAssignee?: boolean;
}

// ============================================================================
// Team Member Card Component Types
// ============================================================================

export interface TeamMember {
    id: string | number;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    initials: string;
    color: string;
    performance?: Performance | string;
    tasksCompleted?: number;
    tasksInProgress?: number;
    overdueTasks?: number;
}

export interface TeamMemberCardProps {
    member: TeamMember;
    colorClass?: string;
    showActions?: boolean;
    onMessageClick?: () => void;
}

// ============================================================================
// Overdue Badge Component Types
// ============================================================================

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface OverdueBadgeProps {
    dueDate?: string | Date;
    status?: string;
    size?: BadgeSize;
    showIcon?: boolean;
}

export interface DeadlineBadgeProps {
    dueDate?: string | Date;
    status?: string;
    size?: BadgeSize;
}

export interface OverdueCounterProps {
    count: number;
    onClick?: () => void;
}

export interface DaysOverdueDisplayProps {
    dueDate?: string | Date;
    status?: string;
}

// ============================================================================
// Nudge Button Component Types
// ============================================================================

export interface NudgePayload {
    from: string;
    to: string;
    timestamp: number;
}

export interface NudgeButtonProps {
    recipientId: string;
    recipientName: string;
    senderId: string;
    onNudge?: (payload: NudgePayload) => void;
    maxNudgesPerDay?: number;
    disabled?: boolean;
}

export interface NudgeReceiverProps {
    children: ReactNode;
}

export interface UseNudgeReturn {
    remaining: number;
    maxNudgesPerDay: number;
    sendNudge: (recipientId: string, recipientName: string, socket?: any) => boolean;
    canNudge: boolean;
}
