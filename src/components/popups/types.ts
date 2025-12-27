/**
 * Types for Popup Components
 */

import { RefObject, ChangeEvent } from 'react';

// Common popup props
export interface PopupPosition {
    left: number;
    top: number;
}

export interface AnchorRect {
    left: number;
    top: number;
    width: number;
    height: number;
    bottom: number;
}

// Attachments
export interface Attachment {
    id: string;
    name: string;
    type: string;
    url?: string;
    size?: number;
}

export interface AttachmentsPopupProps {
    show: boolean;
    anchorRef?: RefObject<HTMLElement>;
    nodeId: string;
    attachments?: Attachment[];
    searchFilter?: string;
    onSearchChange: (value: string) => void;
    onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
    onDownload: (attachment: Attachment) => void;
    onRemove: (attachmentId: string) => void;
    onClose: () => void;
}

// Collaborators
export interface Collaborator {
    id: string;
    name: string;
    initials: string;
    color: string;
    email?: string;
}

export interface CollaboratorPickerProps {
    show: boolean;
    anchorRef?: RefObject<HTMLElement>;
    collaborators: Collaborator[];
    selectedCollaboratorIds?: string[];
    searchQuery?: string;
    onSearchChange: (value: string) => void;
    onToggleCollaborator: (collaboratorId: string) => void;
    onClose: () => void;
}

// Due Date
export interface DueDatePickerProps {
    show: boolean;
    anchorRef?: RefObject<HTMLElement>;
    dueDate?: string;
    onDueDateChange?: (date: string) => void;
    onClearDate?: () => void;
    onClose: () => void;
}

// Emoji Picker
export interface EmojiPickerProps {
    show: boolean;
    anchorRef?: RefObject<HTMLElement>;
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export type EmojiCategory = 'Smileys' | 'Gestures' | 'People' | 'Animals' | 'Food' | 'Activities' | 'Travel' | 'Objects' | 'Symbols';

export interface EmojiCategories {
    [key: string]: string[];
}

// Notes Popup
export interface NotesPopupProps {
    show: boolean;
    anchorRef?: RefObject<HTMLElement>;
    notes?: string;
    attachments?: Attachment[];
    collaborators?: Collaborator[];
    onChange: (notes: string) => void;
    onClose: () => void;
}

export interface MentionItem {
    id: string;
    name: string;
    type: 'attachment' | 'collaborator';
    displayType: string;
    color?: string;
    initials?: string;
}

// Properties Panel
export interface PropertiesPanelProps {
    show: boolean;
    anchorRef?: RefObject<HTMLElement>;
    nodeId: string;
    priority?: string;
    status?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    onPriorityChange?: (priority: string) => void;
    onStatusChange?: (status: string) => void;
    onDescriptionChange?: (description: string) => void;
    onStartDateChange?: (date: string) => void;
    onDueDateChange?: (date: string) => void;
    onClose: () => void;
}

// Tags Popup
export interface TagsPopupProps {
    show: boolean;
    anchorRef?: RefObject<HTMLElement>;
    tags?: string[];
    showTags?: boolean;
    onToggleShowTags: (show: boolean) => void;
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    onClose: () => void;
}

// Theme Picker
export interface ThemeConfig {
    id: string;
    name: string;
    isDark: boolean;
    vibe?: string;
    nodes: {
        palette: string[];
        [key: string]: any;
    };
    canvas: {
        background: string;
        gridColor: string;
        [key: string]: any;
    };
    decorations?: {
        emoji?: string;
        [key: string]: any;
    };
}

export interface ThemePickerProps {
    show: boolean;
    currentTheme?: string;
    onSelectTheme: (themeId: string) => void;
    onClose: () => void;
    anchorRef?: RefObject<HTMLElement>;
}
