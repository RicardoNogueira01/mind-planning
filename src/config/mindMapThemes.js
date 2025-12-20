/**
 * Mind Map Theme Configurations
 * Each theme defines colors, fonts, styling, node shapes, and canvas backgrounds
 * Themes range from Professional to Playful with unique visual identities
 */

export const mindMapThemes = {
    // ============================================
    // PROFESSIONAL THEMES (Clean & Business-like)
    // ============================================

    meister: {
        id: 'meister',
        name: 'Meister',
        isDark: false,
        vibe: 'professional',
        canvas: {
            background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
            gridColor: '#E5E7EB',
            pattern: 'dots', // dots, grid, none
        },
        nodes: {
            palette: ['#F43F5E', '#F97316', '#FACC15', '#22C55E', '#06B6D4', '#8B5CF6', '#EC4899'],
            defaultBg: '#FFFFFF',
            defaultText: '#1F2937',
            borderColor: '#E5E7EB',
            borderRadius: '10px',
            borderWidth: '1px',
            selectedRing: '#3B82F6',
            shadow: '0 2px 8px rgba(0,0,0,0.08)',
            shape: 'rounded', // rounded, pill, square, notch, wave
        },
        typography: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
            pattern: 'grid',
        },
        nodes: {
            palette: ['#1E40AF', '#0369A1', '#0F766E', '#4338CA', '#7C3AED', '#BE185D', '#047857'],
            defaultBg: '#FFFFFF',
            defaultText: '#0F172A',
            borderColor: '#CBD5E1',
            borderRadius: '4px',
            borderWidth: '2px',
            selectedRing: '#1E40AF',
            shadow: '0 1px 3px rgba(0,0,0,0.06)',
            shape: 'square',
        },
        typography: {
            fontFamily: "'IBM Plex Sans', 'Segoe UI', Roboto, sans-serif",
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
        },
    },

    executive: {
        id: 'executive',
        name: 'Executive',
        isDark: false,
        vibe: 'professional',
        canvas: {
            background: 'linear-gradient(180deg, #FFFBF5 0%, #FEF7EC 100%)',
            gridColor: '#E8E0D5',
            pattern: 'none',
        },
        nodes: {
            palette: ['#78350F', '#92400E', '#854D0E', '#3F6212', '#065F46', '#1E3A5F', '#5B21B6'],
            defaultBg: '#FFFDF8',
            defaultText: '#44403C',
            borderColor: '#D6CFC4',
            borderRadius: '2px',
            borderWidth: '1px',
            selectedRing: '#78350F',
            shadow: '0 1px 2px rgba(0,0,0,0.04)',
            shape: 'square',
        },
        typography: {
            fontFamily: "'Literata', 'Georgia', 'Times New Roman', serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#A8A29E',
            colorMode: 'default',
            strokeWidth: 1.5,
        },
        decorations: {
            emoji: null,
        },
    },

    minimal: {
        id: 'minimal',
        name: 'Minimal',
        isDark: false,
        vibe: 'professional',
        canvas: {
            background: '#FFFFFF',
            gridColor: '#F3F4F6',
            pattern: 'none',
        },
        nodes: {
            palette: ['#374151', '#6B7280', '#9CA3AF', '#4B5563', '#1F2937', '#111827', '#374151'],
            defaultBg: '#FFFFFF',
            defaultText: '#111827',
            borderColor: '#E5E7EB',
            borderRadius: '8px',
            borderWidth: '1px',
            selectedRing: '#111827',
            shadow: 'none',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#D1D5DB',
            colorMode: 'default',
            strokeWidth: 1.5,
        },
        decorations: {
            emoji: null,
        },
    },

    slate: {
        id: 'slate',
        name: 'Slate',
        isDark: false,
        vibe: 'professional',
        canvas: {
            background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
            gridColor: '#CBD5E1',
            pattern: 'dots',
        },
        nodes: {
            palette: ['#475569', '#64748B', '#94A3B8', '#334155', '#1E293B', '#0F172A', '#475569'],
            defaultBg: '#FFFFFF',
            defaultText: '#1E293B',
            borderColor: '#94A3B8',
            borderRadius: '6px',
            borderWidth: '1px',
            selectedRing: '#475569',
            shadow: '0 2px 4px rgba(0,0,0,0.06)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#94A3B8',
            colorMode: 'default',
            strokeWidth: 2,
        },
        decorations: {
            emoji: null,
        },
    },

    // ============================================
    // HOLIDAY THEMES (Seasonal & Festive)
    // ============================================

    christmas: {
        id: 'christmas',
        name: 'Christmas',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: '#f0fdf4',
            gridColor: '#dcfce7',
            pattern: 'none',
        },
        nodes: {
            palette: ['#166534', '#dc2626', '#15803d', '#b91c1c', '#fca5a5', '#86efac', '#ffffff'],
            defaultBg: '#ffffff',
            defaultText: '#166534',
            borderColor: '#dc2626',
            borderRadius: '12px',
            borderWidth: '2px',
            selectedRing: '#15803d',
            shadow: '0 4px 12px rgba(22,101,52,0.15)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Mountains of Christmas', cursive",
            fontSize: '18px',
            fontWeight: '700',
            headingSize: '22px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#dc2626',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '🎄',
        },
    },

    'new-year': {
        id: 'new-year',
        name: 'New Year',
        isDark: true,
        vibe: 'creative',
        canvas: {
            background: 'radial-gradient(circle at 50% 50%, #1f2937 0%, #111827 100%)',
            gridColor: '#374151',
            pattern: 'none',
        },
        nodes: {
            palette: ['#fbbf24', '#f59e0b', '#d97706', '#f3f4f6', '#e5e7eb', '#9ca3af', '#fbbf24'],
            defaultBg: '#1f2937',
            defaultText: '#fbbf24', // Gold text
            borderColor: '#fbbf24',
            borderRadius: '8px',
            borderWidth: '1px',
            selectedRing: '#f59e0b',
            shadow: '0 0 15px rgba(251, 191, 36, 0.3)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Cinzel', serif",
            fontSize: '15px',
            fontWeight: '600',
            headingSize: '18px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#fbbf24',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '🎆',
        },
    },

    halloween: {
        id: 'halloween',
        name: 'Halloween',
        isDark: true,
        vibe: 'creative',
        canvas: {
            background: '#271a10',
            gridColor: '#431407',
            pattern: 'none',
        },
        nodes: {
            palette: ['#f97316', '#ea580c', '#c2410c', '#a855f7', '#9333ea', '#84cc16', '#000000'],
            defaultBg: '#271a10',
            defaultText: '#f97316',
            borderColor: '#f97316',
            borderRadius: '16px', // "spooky" shape
            borderWidth: '2px',
            selectedRing: '#f97316',
            shadow: '0 4px 20px rgba(249, 115, 22, 0.3)',
            shape: 'notch',
        },
        typography: {
            fontFamily: "'Creepster', display",
            fontSize: '20px',
            fontWeight: '400',
            headingSize: '24px',
            lineHeight: '1.2',
        },
        connections: {
            color: '#ea580c',
            colorMode: 'parent',
            strokeWidth: 3,
        },
        decorations: {
            emoji: '🎃',
        },
    },

    thanksgiving: {
        id: 'thanksgiving',
        name: 'Thanksgiving',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: '#fffbeb',
            gridColor: '#fde68a',
            pattern: 'none',
        },
        nodes: {
            palette: ['#92400e', '#b45309', '#d97706', '#f59e0b', '#78350f', '#fff7ed', '#fef3c7'],
            defaultBg: '#fff7ed',
            defaultText: '#78350f',
            borderColor: '#92400e',
            borderRadius: '4px',
            borderWidth: '2px',
            selectedRing: '#b45309',
            shadow: '0 2px 8px rgba(120, 53, 15, 0.1)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Homemade Apple', cursive",
            fontSize: '16px',
            fontWeight: '600',
            headingSize: '20px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#b45309',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '🦃',
        },
    },

    'black-friday': {
        id: 'black-friday',
        name: 'Black Friday',
        isDark: true,
        vibe: 'creative',
        canvas: {
            background: '#0a0a0a',
            gridColor: '#262626',
            pattern: 'grid',
        },
        nodes: {
            palette: ['#ffffff', '#dc2626', '#b91c1c', '#000000', '#525252', '#d4d4d4', '#ef4444'],
            defaultBg: '#000000',
            defaultText: '#ffffff',
            borderColor: '#dc2626',
            borderRadius: '0px',
            borderWidth: '2px',
            selectedRing: '#dc2626',
            shadow: '4px 4px 0px #dc2626',
            shape: 'square',
        },
        typography: {
            fontFamily: "'Berkshire Swash', display",
            fontSize: '16px',
            fontWeight: '500',
            headingSize: '18px',
            lineHeight: '1.4',
        },
        connections: {
            color: '#dc2626',
            colorMode: 'default',
            strokeWidth: 3,
        },
        decorations: {
            emoji: '🏷️',
        },
    },

    // ============================================
    // CREATIVE THEMES (Colorful but still professional)
    // ============================================

    prism: {
        id: 'prism',
        name: 'Prism',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 50%, #FFF5F5 100%)',
            gridColor: '#F0F0F0',
            pattern: 'dots',
        },
        nodes: {
            palette: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#0EA5E9', '#6366F1', '#A855F7'],
            defaultBg: '#FFFFFF',
            defaultText: '#374151',
            borderColor: '#E5E7EB',
            borderRadius: '12px',
            borderWidth: '2px',
            selectedRing: '#6366F1',
            shadow: '0 4px 12px rgba(99,102,241,0.12)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#C7D2FE',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '✨',
        },
    },

    ocean: {
        id: 'ocean',
        name: 'Ocean',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: 'linear-gradient(180deg, #ECFEFF 0%, #E0F2FE 50%, #F0FDFA 100%)',
            gridColor: '#A5F3FC',
            pattern: 'none',
        },
        nodes: {
            palette: ['#0D9488', '#14B8A6', '#2DD4BF', '#06B6D4', '#0EA5E9', '#38BDF8', '#22D3EE'],
            defaultBg: '#FFFFFF',
            defaultText: '#134E4A',
            borderColor: '#99F6E4',
            borderRadius: '20px',
            borderWidth: '2px',
            selectedRing: '#0D9488',
            shadow: '0 4px 16px rgba(13,148,136,0.12)',
            shape: 'pill',
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
        },
    },

    sunset: {
        id: 'sunset',
        name: 'Sunset',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 50%, #FFEDD5 100%)',
            gridColor: '#FDE68A',
            pattern: 'none',
        },
        nodes: {
            palette: ['#DC2626', '#EA580C', '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#F97316'],
            defaultBg: '#FFFFFF',
            defaultText: '#78350F',
            borderColor: '#FDE68A',
            borderRadius: '14px',
            borderWidth: '2px',
            selectedRing: '#F59E0B',
            shadow: '0 4px 12px rgba(245,158,11,0.15)',
            shape: 'rounded',
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
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '🌅',
        },
    },

    lavender: {
        id: 'lavender',
        name: 'Lavender',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #FDF4FF 100%)',
            gridColor: '#E9D5FF',
            pattern: 'none',
        },
        nodes: {
            palette: ['#A855F7', '#8B5CF6', '#7C3AED', '#C084FC', '#D8B4FE', '#E879F9', '#F0ABFC'],
            defaultBg: '#FFFFFF',
            defaultText: '#581C87',
            borderColor: '#E9D5FF',
            borderRadius: '16px',
            borderWidth: '2px',
            selectedRing: '#A855F7',
            shadow: '0 4px 12px rgba(168,85,247,0.12)',
            shape: 'rounded',
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
        },
    },

    forest: {
        id: 'forest',
        name: 'Forest',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 50%, #D1FAE5 100%)',
            gridColor: '#BBF7D0',
            pattern: 'none',
        },
        nodes: {
            palette: ['#166534', '#15803D', '#22C55E', '#4ADE80', '#86EFAC', '#047857', '#10B981'],
            defaultBg: '#FFFFFF',
            defaultText: '#14532D',
            borderColor: '#BBF7D0',
            borderRadius: '10px',
            borderWidth: '2px',
            selectedRing: '#22C55E',
            shadow: '0 4px 12px rgba(34,197,94,0.12)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Source Sans 3', 'DM Sans', sans-serif",
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
        },
    },

    rose: {
        id: 'rose',
        name: 'Rose',
        isDark: false,
        vibe: 'creative',
        canvas: {
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FECDD3 100%)',
            gridColor: '#FECDD3',
            pattern: 'none',
        },
        nodes: {
            palette: ['#E11D48', '#F43F5E', '#FB7185', '#FDA4AF', '#BE123C', '#9F1239', '#881337'],
            defaultBg: '#FFFFFF',
            defaultText: '#881337',
            borderColor: '#FECDD3',
            borderRadius: '18px',
            borderWidth: '2px',
            selectedRing: '#E11D48',
            shadow: '0 4px 12px rgba(225,29,72,0.1)',
            shape: 'pill',
        },
        typography: {
            fontFamily: "'Quicksand', 'Nunito', sans-serif",
            fontSize: '14px',
            fontWeight: '600',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#FDA4AF',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '🌹',
        },
    },

    // ============================================
    // PLAYFUL THEMES (Fun & Expressive)
    // ============================================

    pastel: {
        id: 'pastel',
        name: 'Pastel',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: 'linear-gradient(135deg, #FFF5F7 0%, #F0F9FF 50%, #F5F3FF 100%)',
            gridColor: '#FFE4E6',
            pattern: 'none',
        },
        nodes: {
            palette: ['#FDA4AF', '#FDBA74', '#FDE047', '#86EFAC', '#7DD3FC', '#C4B5FD', '#F0ABFC'],
            defaultBg: '#FFFFFF',
            defaultText: '#525252',
            borderColor: '#E5E7EB',
            borderRadius: '24px',
            borderWidth: '3px',
            selectedRing: '#A78BFA',
            shadow: '0 6px 16px rgba(168,85,247,0.1)',
            shape: 'pill',
        },
        typography: {
            fontFamily: "'Quicksand', 'Comfortaa', sans-serif",
            fontSize: '15px',
            fontWeight: '600',
            headingSize: '17px',
            lineHeight: '1.6',
        },
        connections: {
            color: '#E9D5FF',
            colorMode: 'parent',
            strokeWidth: 3,
        },
        decorations: {
            emoji: '🦋',
        },
    },

    candy: {
        id: 'candy',
        name: 'Candy',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FDF4FF 100%)',
            gridColor: '#FBCFE8',
            pattern: 'none',
        },
        nodes: {
            palette: ['#EC4899', '#F472B6', '#A855F7', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'],
            defaultBg: '#FFFFFF',
            defaultText: '#831843',
            borderColor: '#F9A8D4',
            borderRadius: '999px',
            borderWidth: '3px',
            selectedRing: '#EC4899',
            shadow: '0 6px 20px rgba(236,72,153,0.15)',
            shape: 'pill',
        },
        typography: {
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
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
        },
    },

    bubbles: {
        id: 'bubbles',
        name: 'Bubbles',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: 'radial-gradient(circle at 20% 20%, #DBEAFE 0%, #EFF6FF 50%, #E0F2FE 100%)',
            gridColor: '#BFDBFE',
            pattern: 'none',
        },
        nodes: {
            palette: ['#F472B6', '#FB923C', '#FACC15', '#4ADE80', '#22D3EE', '#818CF8', '#E879F9'],
            defaultBg: '#FFFFFF',
            defaultText: '#1E3A5F',
            borderColor: '#93C5FD',
            borderRadius: '999px',
            borderWidth: '3px',
            selectedRing: '#60A5FA',
            shadow: '0 8px 24px rgba(96,165,250,0.2)',
            shape: 'pill',
        },
        typography: {
            fontFamily: "'Baloo 2', 'Comic Neue', sans-serif",
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
        },
    },

    sketchy: {
        id: 'sketchy',
        name: 'Sketchy',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: '#FFFEF7',
            gridColor: '#E5E5DC',
            pattern: 'grid',
        },
        nodes: {
            palette: ['#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#7C3AED', '#0891B2', '#DB2777'],
            defaultBg: '#FFFDF5',
            defaultText: '#1F2937',
            borderColor: '#374151',
            borderRadius: '4px',
            borderWidth: '2px',
            selectedRing: '#2563EB',
            shadow: '3px 3px 0px #374151',
            shape: 'notch',
        },
        typography: {
            fontFamily: "'Caveat', 'Patrick Hand', cursive",
            fontSize: '18px',
            fontWeight: '600',
            headingSize: '22px',
            lineHeight: '1.3',
        },
        connections: {
            color: '#6B7280',
            colorMode: 'default',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '✏️',
        },
    },

    retro: {
        id: 'retro',
        name: 'Retro',
        isDark: false,
        vibe: 'playful',
        canvas: {
            background: 'linear-gradient(180deg, #FEF9C3 0%, #FDE68A 100%)',
            gridColor: '#FCD34D',
            pattern: 'none',
        },
        nodes: {
            palette: ['#B91C1C', '#C2410C', '#A16207', '#4D7C0F', '#0E7490', '#6D28D9', '#BE185D'],
            defaultBg: '#FFFBEB',
            defaultText: '#78350F',
            borderColor: '#92400E',
            borderRadius: '0px',
            borderWidth: '3px',
            selectedRing: '#B91C1C',
            shadow: '4px 4px 0px #78350F',
            shape: 'square',
        },
        typography: {
            fontFamily: "'Rubik', 'Archivo', sans-serif",
            fontSize: '15px',
            fontWeight: '700',
            headingSize: '17px',
            lineHeight: '1.4',
        },
        connections: {
            color: '#92400E',
            colorMode: 'default',
            strokeWidth: 3,
        },
        decorations: {
            emoji: '📺',
        },
    },

    // ============================================
    // DARK PROFESSIONAL THEMES
    // ============================================

    midnite: {
        id: 'midnite',
        name: 'Midnight',
        isDark: true,
        vibe: 'professional',
        canvas: {
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            gridColor: '#334155',
            pattern: 'dots',
        },
        nodes: {
            palette: ['#F43F5E', '#FB923C', '#FBBF24', '#4ADE80', '#22D3EE', '#A78BFA', '#F472B6'],
            defaultBg: '#1E293B',
            defaultText: '#F1F5F9',
            borderColor: '#475569',
            borderRadius: '10px',
            borderWidth: '1px',
            selectedRing: '#38BDF8',
            shadow: '0 4px 16px rgba(0,0,0,0.4)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Inter', 'SF Pro Display', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#475569',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: null,
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
            pattern: 'dots',
        },
        nodes: {
            palette: ['#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E'],
            defaultBg: '#1F2937',
            defaultText: '#F3F4F6',
            borderColor: '#374151',
            borderRadius: '8px',
            borderWidth: '1px',
            selectedRing: '#14B8A6',
            shadow: '0 2px 8px rgba(0,0,0,0.3)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Inter', -apple-system, sans-serif",
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
        },
    },

    obsidian: {
        id: 'obsidian',
        name: 'Obsidian',
        isDark: true,
        vibe: 'professional',
        canvas: {
            background: '#18181B',
            gridColor: '#27272A',
            pattern: 'none',
        },
        nodes: {
            palette: ['#A78BFA', '#818CF8', '#6366F1', '#4F46E5', '#C084FC', '#E879F9', '#F472B6'],
            defaultBg: '#27272A',
            defaultText: '#FAFAFA',
            borderColor: '#3F3F46',
            borderRadius: '6px',
            borderWidth: '1px',
            selectedRing: '#A78BFA',
            shadow: '0 2px 8px rgba(0,0,0,0.4)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '13px',
            fontWeight: '500',
            headingSize: '15px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#52525B',
            colorMode: 'parent',
            strokeWidth: 1.5,
        },
        decorations: {
            emoji: null,
        },
    },

    aurora: {
        id: 'aurora',
        name: 'Aurora',
        isDark: true,
        vibe: 'creative',
        canvas: {
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
            gridColor: '#312E81',
            pattern: 'none',
        },
        nodes: {
            palette: ['#22D3EE', '#A78BFA', '#34D399', '#FB7185', '#FBBF24', '#60A5FA', '#E879F9'],
            defaultBg: '#1E293B',
            defaultText: '#E2E8F0',
            borderColor: '#4338CA',
            borderRadius: '14px',
            borderWidth: '2px',
            selectedRing: '#22D3EE',
            shadow: '0 0 24px rgba(34,211,238,0.2)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            headingSize: '16px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#6366F1',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '✨',
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
            pattern: 'none',
        },
        nodes: {
            palette: ['#FF79C6', '#8BE9FD', '#50FA7B', '#F1FA8C', '#FFB86C', '#BD93F9', '#FF5555'],
            defaultBg: '#44475A',
            defaultText: '#F8F8F2',
            borderColor: '#6272A4',
            borderRadius: '8px',
            borderWidth: '2px',
            selectedRing: '#BD93F9',
            shadow: '0 4px 16px rgba(0,0,0,0.4)',
            shape: 'rounded',
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
        },
    },

    // ============================================
    // DARK PLAYFUL THEMES
    // ============================================

    neon: {
        id: 'neon',
        name: 'Neon',
        isDark: true,
        vibe: 'playful',
        canvas: {
            background: 'linear-gradient(180deg, #0A0A0A 0%, #171717 100%)',
            gridColor: '#262626',
            pattern: 'grid',
        },
        nodes: {
            palette: ['#FF0080', '#00FF88', '#00D4FF', '#FFE600', '#FF6600', '#AA00FF', '#00FFFF'],
            defaultBg: '#1A1A1A',
            defaultText: '#FFFFFF',
            borderColor: '#404040',
            borderRadius: '8px',
            borderWidth: '2px',
            selectedRing: '#00D4FF',
            shadow: '0 0 20px currentColor',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
            fontSize: '14px',
            fontWeight: '600',
            headingSize: '16px',
            lineHeight: '1.4',
        },
        connections: {
            color: '#404040',
            colorMode: 'parent',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '⚡',
        },
    },

    fireworks: {
        id: 'fireworks',
        name: 'Fireworks',
        isDark: true,
        vibe: 'playful',
        canvas: {
            background: 'radial-gradient(circle at 30% 30%, #1F1F3D 0%, #0F0F1A 100%)',
            gridColor: '#2D2D5A',
            pattern: 'none',
        },
        nodes: {
            palette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#A8D8EA'],
            defaultBg: '#1F1F3D',
            defaultText: '#FFFFFF',
            borderColor: '#3D3D7A',
            borderRadius: '16px',
            borderWidth: '2px',
            selectedRing: '#FFE66D',
            shadow: '0 0 30px rgba(255,230,109,0.3)',
            shape: 'rounded',
        },
        typography: {
            fontFamily: "'Outfit', 'Poppins', sans-serif",
            fontSize: '15px',
            fontWeight: '600',
            headingSize: '17px',
            lineHeight: '1.5',
        },
        connections: {
            color: '#4D4D8A',
            colorMode: 'parent',
            strokeWidth: 2.5,
        },
        decorations: {
            emoji: '🎆',
        },
    },

    blackboard: {
        id: 'blackboard',
        name: 'Blackboard',
        isDark: true,
        vibe: 'playful',
        canvas: {
            background: '#1C1917',
            gridColor: '#292524',
            pattern: 'none',
        },
        nodes: {
            palette: ['#FAFAF9', '#E7E5E4', '#D6D3D1', '#A8A29E', '#78716C', '#FAFAF9', '#E7E5E4'],
            defaultBg: '#292524',
            defaultText: '#FAFAF9',
            borderColor: '#44403C',
            borderRadius: '4px',
            borderWidth: '2px',
            selectedRing: '#F5F5F4',
            shadow: 'none',
            shape: 'square',
        },
        typography: {
            fontFamily: "'Caveat', 'Kalam', cursive",
            fontSize: '20px',
            fontWeight: '500',
            headingSize: '24px',
            lineHeight: '1.3',
        },
        connections: {
            color: '#57534E',
            colorMode: 'default',
            strokeWidth: 2,
        },
        decorations: {
            emoji: '📝',
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

// Get themes by vibe
export const getThemesByVibe = (vibe) => {
    return Object.values(mindMapThemes).filter(t => t.vibe === vibe);
};
