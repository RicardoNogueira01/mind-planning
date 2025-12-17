/**
 * Mind Map Theme Configurations
 * Each theme defines colors, fonts, and styling for the entire mind map experience
 * Themes range from Professional to Fun/Kid-friendly
 */

export const mindMapThemes = {
    // ============================================
    // PROFESSIONAL THEMES
    // ============================================

    meister: {
        id: 'meister',
        name: 'Meister',
        isDark: false,
        vibe: 'professional',
        canvas: {
            background: '#FAFAFA',
            gridColor: '#E5E7EB',
        },
        nodes: {
            palette: ['#F43F5E', '#F97316', '#FACC15', '#22C55E', '#06B6D4', '#8B5CF6', '#EC4899'],
            defaultBg: '#FFFFFF',
            defaultText: '#1F2937',
            borderColor: '#E5E7EB',
            borderRadius: '8px',
            borderWidth: '1px',
            selectedRing: '#3B82F6',
            shadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
        typography: {
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#94A3B8',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: null,
            nodeShape: 'rounded',
        },
    },

    corporate: {
        id: 'corporate',
        name: 'Corporate',
        isDark: false,
        vibe: 'professional',
        canvas: {
            background: '#F8FAFC',
            gridColor: '#E2E8F0',
        },
        nodes: {
            palette: ['#1E40AF', '#0369A1', '#0F766E', '#4338CA', '#6D28D9', '#BE185D', '#047857'],
            defaultBg: '#FFFFFF',
            defaultText: '#0F172A',
            borderColor: '#CBD5E1',
            borderRadius: '6px',
            borderWidth: '2px',
            selectedRing: '#1E40AF',
            shadow: '0 1px 2px rgba(0,0,0,0.05)',
        },
        typography: {
            fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
            fontSize: '13px',
            fontWeight: '600',
            headingSize: '15px',
            lineHeight: '1.4',
        },
        connections: {
            color: '#64748B',
            colorMode: 'default',
            strokeWidth: 2,
        },
        decorations: {
            emoji: null,
            nodeShape: 'square',
        },
    },

    slate: {
        id: 'slate',
        name: 'Slate',
        isDark: false,
        vibe: 'professional',
        canvas: {
            background: '#F1F5F9',
            gridColor: '#CBD5E1',
        },
        nodes: {
            palette: ['#475569', '#64748B', '#94A3B8', '#334155', '#1E293B', '#0F172A', '#475569'],
            defaultBg: '#FFFFFF',
            defaultText: '#1E293B',
            borderColor: '#94A3B8',
            borderRadius: '4px',
            borderWidth: '1px',
            selectedRing: '#475569',
            shadow: '0 1px 2px rgba(0,0,0,0.06)',
        },
        typography: {
            fontFamily: "'Inter', 'Roboto', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#94A3B8',
            colorMode: 'default',
            strokeWidth: 1.5,
        },
        decorations: {
            emoji: null,
            nodeShape: 'square',
        },
    },

    // ============================================
    // CREATIVE THEMES
    // ============================================

    prism: {
        id: 'prism',
        name: 'Prism',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: '#FFFFFF',
            gridColor: '#F3F4F6',
        },
        nodes: {
            palette: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#0EA5E9', '#6366F1', '#A855F7'],
            defaultBg: '#FFFFFF',
            defaultText: '#374151',
            borderColor: '#D1D5DB',
            borderRadius: '12px',
            borderWidth: '2px',
            selectedRing: '#6366F1',
            shadow: '0 4px 6px rgba(0,0,0,0.05)',
        },
        typography: {
            fontFamily: "'Poppins', 'Helvetica Neue', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#9CA3AF',
            colorMode: 'gradient',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '✨',
            nodeShape: 'rounded',
        },
    },

    ocean: {
        id: 'ocean',
        name: 'Ocean',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: '#F0FDFA',
            gridColor: '#CCFBF1',
        },
        nodes: {
            palette: ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#0EA5E9', '#38BDF8', '#06B6D4'],
            defaultBg: '#FFFFFF',
            defaultText: '#134E4A',
            borderColor: '#99F6E4',
            borderRadius: '16px',
            borderWidth: '2px',
            selectedRing: '#0D9488',
            shadow: '0 4px 12px rgba(13,148,136,0.15)',
        },
        typography: {
            fontFamily: "'Nunito', 'Quicksand', sans-serif",
            fontSize: '14px',
            fontWeight: '600',
            headingSize: '16px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#5EEAD4',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '🌊',
            nodeShape: 'pill',
        },
    },

    sunset: {
        id: 'sunset',
        name: 'Sunset',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: '#FFFBEB',
            gridColor: '#FEF3C7',
        },
        nodes: {
            palette: ['#DC2626', '#EA580C', '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
            defaultBg: '#FFFFFF',
            defaultText: '#78350F',
            borderColor: '#FDE68A',
            borderRadius: '14px',
            borderWidth: '2px',
            selectedRing: '#F59E0B',
            shadow: '0 4px 8px rgba(245,158,11,0.15)',
        },
        typography: {
            fontFamily: "'DM Sans', 'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#FBBF24',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '🌅',
            nodeShape: 'rounded',
        },
    },

    lavender: {
        id: 'lavender',
        name: 'Lavender',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: '#FAF5FF',
            gridColor: '#F3E8FF',
        },
        nodes: {
            palette: ['#A855F7', '#8B5CF6', '#7C3AED', '#C084FC', '#D8B4FE', '#E879F9', '#F0ABFC'],
            defaultBg: '#FFFFFF',
            defaultText: '#581C87',
            borderColor: '#E9D5FF',
            borderRadius: '12px',
            borderWidth: '2px',
            selectedRing: '#A855F7',
            shadow: '0 4px 8px rgba(168,85,247,0.12)',
        },
        typography: {
            fontFamily: "'Outfit', 'Nunito', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#C4B5FD',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '💜',
            nodeShape: 'rounded',
        },
    },

    forest: {
        id: 'forest',
        name: 'Forest',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: '#F0FDF4',
            gridColor: '#DCFCE7',
        },
        nodes: {
            palette: ['#166534', '#15803D', '#22C55E', '#4ADE80', '#86EFAC', '#047857', '#10B981'],
            defaultBg: '#FFFFFF',
            defaultText: '#14532D',
            borderColor: '#BBF7D0',
            borderRadius: '10px',
            borderWidth: '2px',
            selectedRing: '#22C55E',
            shadow: '0 4px 8px rgba(34,197,94,0.12)',
        },
        typography: {
            fontFamily: "'DM Sans', 'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#86EFAC',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '🌿',
            nodeShape: 'rounded',
        },
    },

    // ============================================
    // PLAYFUL / FUN THEMES
    // ============================================

    pastel: {
        id: 'pastel',
        name: 'Pastel',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: '#FFF5F7',
            gridColor: '#FFE4E6',
        },
        nodes: {
            palette: ['#FDA4AF', '#FDBA74', '#FDE047', '#86EFAC', '#7DD3FC', '#C4B5FD', '#F0ABFC'],
            defaultBg: '#FFFFFF',
            defaultText: '#525252',
            borderColor: '#E5E7EB',
            borderRadius: '20px',
            borderWidth: '3px',
            selectedRing: '#A78BFA',
            shadow: '0 6px 12px rgba(168,85,247,0.1)',
        },
        typography: {
            fontFamily: "'Quicksand', 'Comfortaa', cursive",
            fontSize: '15px',
            fontWeight: '600',
            headingSize: '17px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#D1D5DB',
            colorMode: 'parent',
            strokeWidth: 3,
        },
        decorations: {
            emoji: '🦋',
            nodeShape: 'pill',
        },
    },

    spring: {
        id: 'spring',
        name: 'Spring',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: '#F7FEE7',
            gridColor: '#ECFCCB',
        },
        nodes: {
            palette: ['#84CC16', '#A3E635', '#FDE047', '#FACC15', '#FB923C', '#22C55E', '#4ADE80'],
            defaultBg: '#FFFFFF',
            defaultText: '#365314',
            borderColor: '#D9F99D',
            borderRadius: '18px',
            borderWidth: '2px',
            selectedRing: '#84CC16',
            shadow: '0 4px 10px rgba(132,204,22,0.15)',
        },
        typography: {
            fontFamily: "'Nunito', 'Varela Round', sans-serif",
            fontSize: '15px',
            fontWeight: '700',
            headingSize: '17px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#BEF264',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '🌸',
            nodeShape: 'rounded',
        },
    },

    bubbles: {
        id: 'bubbles',
        name: 'Bubbles',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: '#EFF6FF',
            gridColor: '#DBEAFE',
        },
        nodes: {
            palette: ['#F472B6', '#FB923C', '#FACC15', '#4ADE80', '#22D3EE', '#818CF8', '#E879F9'],
            defaultBg: '#FFFFFF',
            defaultText: '#1E3A5F',
            borderColor: '#BFDBFE',
            borderRadius: '999px',
            borderWidth: '3px',
            selectedRing: '#60A5FA',
            shadow: '0 8px 20px rgba(96,165,250,0.2)',
        },
        typography: {
            fontFamily: "'Baloo 2', 'Comic Neue', cursive",
            fontSize: '16px',
            fontWeight: '600',
            headingSize: '18px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#93C5FD',
            colorMode: 'parent',
            strokeWidth: 3,
        },
        decorations: {
            emoji: '🫧',
            nodeShape: 'pill',
        },
    },

    candy: {
        id: 'candy',
        name: 'Candy',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: '#FDF2F8',
            gridColor: '#FCE7F3',
        },
        nodes: {
            palette: ['#EC4899', '#F472B6', '#A855F7', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
            defaultBg: '#FFFFFF',
            defaultText: '#831843',
            borderColor: '#FBCFE8',
            borderRadius: '24px',
            borderWidth: '3px',
            selectedRing: '#EC4899',
            shadow: '0 6px 16px rgba(236,72,153,0.15)',
        },
        typography: {
            fontFamily: "'Fredoka One', 'Bubblegum Sans', cursive",
            fontSize: '16px',
            fontWeight: '500',
            headingSize: '18px',
            lineHeight: '1.4',
        },
        connections: {
            color: '#F9A8D4',
            colorMode: 'parent',
            strokeWidth: 3.5,
        },
        decorations: {
            emoji: '🍭',
            nodeShape: 'pill',
        },
    },

    rainbow: {
        id: 'rainbow',
        name: 'Rainbow',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: '#FFFBEB',
            gridColor: '#FEF3C7',
        },
        nodes: {
            palette: ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'],
            defaultBg: '#FFFFFF',
            defaultText: '#374151',
            borderColor: '#FDE68A',
            borderRadius: '16px',
            borderWidth: '3px',
            selectedRing: '#F59E0B',
            shadow: '0 6px 12px rgba(251,191,36,0.15)',
        },
        typography: {
            fontFamily: "'Nunito', 'Poppins', sans-serif",
            fontSize: '15px',
            fontWeight: '600',
            headingSize: '17px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#FCD34D',
            colorMode: 'parent',
            strokeWidth: 3,
        },
        decorations: {
            emoji: '🌈',
            nodeShape: 'rounded',
        },
    },

    // ============================================
    // MINIMAL THEMES
    // ============================================

    vintage: {
        id: 'vintage',
        name: 'Vintage',
        isDark: false,
        vibe: 'minimal',
        canvas: {
            background: '#FAF5EF',
            gridColor: '#E8E0D5',
        },
        nodes: {
            palette: ['#B45309', '#CA8A04', '#65A30D', '#0891B2', '#7C3AED', '#BE185D', '#DC2626'],
            defaultBg: '#FFFBF5',
            defaultText: '#44403C',
            borderColor: '#D6D3D1',
            borderRadius: '4px',
            borderWidth: '1px',
            selectedRing: '#B45309',
            shadow: '0 1px 2px rgba(0,0,0,0.05)',
        },
        typography: {
            fontFamily: "'Merriweather', 'Georgia', serif",
            fontSize: '14px',
            fontWeight: '400',
            headingSize: '15px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#A8A29E',
            colorMode: 'parent',
            strokeWidth: 1.5,
        },
        decorations: {
            emoji: null,
            nodeShape: 'square',
        },
    },

    paper: {
        id: 'paper',
        name: 'Paper',
        isDark: false,
        vibe: 'minimal',
        canvas: {
            background: '#FFFEF7',
            gridColor: '#F5F5DC',
        },
        nodes: {
            palette: ['#374151', '#6B7280', '#9CA3AF', '#4B5563', '#374151', '#1F2937', '#111827'],
            defaultBg: '#FFFFFF',
            defaultText: '#1F2937',
            borderColor: '#E5E7EB',
            borderRadius: '2px',
            borderWidth: '1px',
            selectedRing: '#374151',
            shadow: 'none',
        },
        typography: {
            fontFamily: "'Libre Baskerville', 'Georgia', serif",
            fontSize: '14px',
            fontWeight: '400',
            headingSize: '16px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#9CA3AF',
            colorMode: 'default',
            strokeWidth: 1,
        },
        decorations: {
            emoji: null,
            nodeShape: 'square',
        },
    },

    // ============================================
    // DARK THEMES
    // ============================================

    midnite: {
        id: 'midnite',
        name: 'Midnight',
        isDark: true,
        vibe: 'creative',
        canvas: {
            background: '#1E293B',
            gridColor: '#334155',
        },
        nodes: {
            palette: ['#F43F5E', '#FB923C', '#FBBF24', '#4ADE80', '#22D3EE', '#A78BFA', '#F472B6'],
            defaultBg: '#334155',
            defaultText: '#F1F5F9',
            borderColor: '#475569',
            borderRadius: '12px',
            borderWidth: '2px',
            selectedRing: '#38BDF8',
            shadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
        typography: {
            fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#64748B',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '🌙',
            nodeShape: 'rounded',
        },
    },

    fireworks: {
        id: 'fireworks',
        name: 'Fireworks',
        isDark: true,
        vibe: 'playful',
        canvas: {
            background: '#18181B',
            gridColor: '#27272A',
        },
        nodes: {
            palette: ['#EF4444', '#22C55E', '#3B82F6', '#EAB308', '#A855F7', '#EC4899', '#06B6D4'],
            defaultBg: '#27272A',
            defaultText: '#FAFAFA',
            borderColor: '#3F3F46',
            borderRadius: '16px',
            borderWidth: '2px',
            selectedRing: '#FBBF24',
            shadow: '0 6px 20px rgba(0,0,0,0.4)',
        },
        typography: {
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontSize: '15px',
            fontWeight: '600',
            headingSize: '17px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#52525B',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '🎆',
            nodeShape: 'rounded',
        },
    },

    blackboard: {
        id: 'blackboard',
        name: 'Blackboard',
        isDark: true,
        vibe: 'minimal',
        canvas: {
            background: '#1C1917',
            gridColor: '#292524',
        },
        nodes: {
            palette: ['#FAFAF9', '#E7E5E4', '#D6D3D1', '#A8A29E', '#FAFAF9', '#E7E5E4', '#D6D3D1'],
            defaultBg: '#292524',
            defaultText: '#FAFAF9',
            borderColor: '#44403C',
            borderRadius: '6px',
            borderWidth: '1px',
            selectedRing: '#F5F5F4',
            shadow: 'none',
        },
        typography: {
            fontFamily: "'Caveat', 'Kalam', cursive",
            fontSize: '18px',
            fontWeight: '500',
            headingSize: '20px',
            lineHeight: '1.4',
        },
        connections: {
            color: '#57534E',
            colorMode: 'default',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '✏️',
            nodeShape: 'square',
        },
    },

    darkMode: {
        id: 'darkMode',
        name: 'Dark Mode',
        isDark: true,
        vibe: 'professional',
        canvas: {
            background: '#111827',
            gridColor: '#1F2937',
        },
        nodes: {
            palette: ['#14B8A6', '#06B6D4', '#0EA5E9', '#6366F1', '#8B5CF6', '#14B8A6', '#22D3EE'],
            defaultBg: '#1F2937',
            defaultText: '#F3F4F6',
            borderColor: '#374151',
            borderRadius: '8px',
            borderWidth: '1px',
            selectedRing: '#14B8A6',
            shadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
        typography: {
            fontFamily: "'Inter', 'SF Pro Display', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#4B5563',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: null,
            nodeShape: 'rounded',
        },
    },

    cubicle: {
        id: 'cubicle',
        name: 'Cubicle',
        isDark: true,
        vibe: 'professional',
        canvas: {
            background: '#1E3A5F',
            gridColor: '#234E77',
        },
        nodes: {
            palette: ['#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#1D4ED8', '#3B82F6', '#60A5FA'],
            defaultBg: '#234E77',
            defaultText: '#E0F2FE',
            borderColor: '#1E40AF',
            borderRadius: '4px',
            borderWidth: '2px',
            selectedRing: '#60A5FA',
            shadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        typography: {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '13px',
            fontWeight: '500',
            headingSize: '14px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#3B82F6',
            colorMode: 'default',
            strokeWidth: 2,
        },
        decorations: {
            emoji: null,
            nodeShape: 'square',
        },
    },

    aurora: {
        id: 'aurora',
        name: 'Aurora',
        isDark: true,
        vibe: 'creative',
        canvas: {
            background: '#0F172A',
            gridColor: '#1E293B',
        },
        nodes: {
            palette: ['#22D3EE', '#A78BFA', '#34D399', '#FB7185', '#FBBF24', '#60A5FA', '#E879F9'],
            defaultBg: '#1E293B',
            defaultText: '#E2E8F0',
            borderColor: '#334155',
            borderRadius: '14px',
            borderWidth: '2px',
            selectedRing: '#22D3EE',
            shadow: '0 6px 16px rgba(34,211,238,0.15)',
        },
        typography: {
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#475569',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '✨',
            nodeShape: 'rounded',
        },
    },

    neon: {
        id: 'neon',
        name: 'Neon',
        isDark: true,
        vibe: 'playful',
        canvas: {
            background: '#0A0A0A',
            gridColor: '#171717',
        },
        nodes: {
            palette: ['#FF0080', '#00FF88', '#00D4FF', '#FFE600', '#FF6600', '#AA00FF', '#00FFFF'],
            defaultBg: '#171717',
            defaultText: '#FFFFFF',
            borderColor: '#333333',
            borderRadius: '12px',
            borderWidth: '2px',
            selectedRing: '#00D4FF',
            shadow: '0 0 20px rgba(0,212,255,0.3)',
        },
        typography: {
            fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
            fontSize: '14px',
            fontWeight: '600',
            headingSize: '16px',
            lineHeight: '1.4',
        },
        connections: {
            color: '#333333',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '⚡',
            nodeShape: 'rounded',
        },
    },

    dracula: {
        id: 'dracula',
        name: 'Dracula',
        isDark: true,
        vibe: 'creative',
        canvas: {
            background: '#282A36',
            gridColor: '#44475A',
        },
        nodes: {
            palette: ['#FF79C6', '#8BE9FD', '#50FA7B', '#F1FA8C', '#FFB86C', '#BD93F9', '#FF5555'],
            defaultBg: '#44475A',
            defaultText: '#F8F8F2',
            borderColor: '#6272A4',
            borderRadius: '8px',
            borderWidth: '2px',
            selectedRing: '#BD93F9',
            shadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
        typography: {
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#6272A4',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '🧛',
            nodeShape: 'rounded',
        },
    },
};

// Default theme
export const DEFAULT_THEME = 'meister';

// Get theme by ID
export const getTheme = (themeId) => {
    return mindMapThemes[themeId] || mindMapThemes[DEFAULT_THEME];
};

// Get all themes as array
export const getAllThemes = () => {
    return Object.values(mindMapThemes);
};

// Get light themes only
export const getLightThemes = () => {
    return Object.values(mindMapThemes).filter(t => !t.isDark);
};

// Get dark themes only
export const getDarkThemes = () => {
    return Object.values(mindMapThemes).filter(t => t.isDark);
};

// Get themes by vibe
export const getThemesByVibe = (vibe) => {
    return Object.values(mindMapThemes).filter(t => t.vibe === vibe);
};
