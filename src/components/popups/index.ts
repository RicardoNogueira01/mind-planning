// Popup Components Index
// Export all popup components from a single location for easier imports

export { default as AttachmentsPopup } from './AttachmentsPopup';
export { default as CollaboratorPicker } from './CollaboratorPicker';
export { default as DueDatePicker } from './DueDatePicker';
export { default as EmojiPicker } from './EmojiPicker';
export { default as NotesPopup } from './NotesPopup';
export { default as PropertiesPanel } from './PropertiesPanel';
export { default as TagsPopup } from './TagsPopup';
export { default as ThemePicker } from './ThemePicker';

// Export types
export type {
    PopupPosition,
    AnchorRect,
    Attachment,
    AttachmentsPopupProps,
    Collaborator,
    CollaboratorPickerProps,
    DueDatePickerProps,
    EmojiPickerProps,
    EmojiCategory,
    EmojiCategories,
    NotesPopupProps,
    MentionItem,
    PropertiesPanelProps,
    TagsPopupProps,
    ThemeConfig,
    ThemePickerProps,
} from './types';
