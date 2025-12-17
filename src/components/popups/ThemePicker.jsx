import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Sparkles } from 'lucide-react';
import { getAllThemes } from '../../config/mindMapThemes';

/**
 * ThemePicker: A beautifully designed popup for selecting mind map themes
 * Shows theme cards with clean visual previews in a grid layout
 */
export default function ThemePicker({
    show,
    currentTheme,
    onSelectTheme,
    onClose,
    anchorRef
}) {
    if (!show) return null;

    const themes = getAllThemes();
    const lightThemes = themes.filter(t => !t.isDark);
    const darkThemes = themes.filter(t => t.isDark);

    const rect = anchorRef?.current?.getBoundingClientRect() ||
        { left: window.innerWidth / 2, top: 80, width: 0, height: 0, bottom: 100 };

    const popupWidth = 380;
    const left = Math.max(8, Math.min(rect.left + (rect.width / 2) - (popupWidth / 2), window.innerWidth - popupWidth - 8));
    const top = Math.max(8, rect.bottom + 12);

    // Clean, minimal theme preview - just shows color palette
    const ThemePreview = ({ theme }) => {
        const { nodes, canvas } = theme;
        const colors = nodes.palette.slice(0, 5);
        const isDark = theme.isDark;

        return (
            <div
                className="w-full h-full rounded-lg overflow-hidden relative"
                style={{ background: canvas.background }}
            >
                {/* Color swatches in a pleasing arrangement */}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div className="flex gap-1">
                        {colors.map((color, i) => (
                            <div
                                key={i}
                                className="rounded-full transition-transform hover:scale-110"
                                style={{
                                    backgroundColor: color,
                                    width: i === 2 ? '14px' : '10px',
                                    height: i === 2 ? '14px' : '10px',
                                    marginTop: i === 2 ? '0' : '4px',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Subtle grid pattern for light themes */}
                {!isDark && (
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `radial-gradient(${canvas.gridColor} 1px, transparent 1px)`,
                            backgroundSize: '8px 8px'
                        }}
                    />
                )}

                {/* Theme emoji indicator */}
                {theme.decorations?.emoji && (
                    <div className="absolute bottom-1 right-1 text-xs opacity-60">
                        {theme.decorations.emoji}
                    </div>
                )}
            </div>
        );
    };

    const ThemeCard = ({ theme }) => {
        const isSelected = currentTheme === theme.id;
        const isDark = theme.isDark;

        return (
            <button
                onClick={() => onSelectTheme(theme.id)}
                className={`
                    relative rounded-xl overflow-hidden transition-all duration-200
                    hover:shadow-lg hover:scale-[1.03] active:scale-[0.98]
                    ${isSelected
                        ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
                        : 'ring-1 ring-gray-200 hover:ring-gray-300'
                    }
                    ${isDark ? 'ring-gray-600' : ''}
                `}
                style={{ aspectRatio: '4/3' }}
            >
                {/* Theme Preview */}
                <ThemePreview theme={theme} />

                {/* Theme Name Overlay */}
                <div className={`
                    absolute bottom-0 left-0 right-0 px-2 py-1.5
                    backdrop-blur-sm
                    ${isDark ? 'bg-black/60' : 'bg-white/80'}
                `}>
                    <div className={`text-[11px] font-semibold text-center truncate
                        ${isDark ? 'text-white' : 'text-gray-700'}
                    `}>
                        {theme.name}
                    </div>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}

                {/* Vibe indicator badge */}
                {theme.vibe === 'playful' && (
                    <div className="absolute top-1.5 left-1.5">
                        <Sparkles size={12} className="text-pink-500" />
                    </div>
                )}
            </button>
        );
    };

    return createPortal(
        <div
            className="fixed bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[5000]"
            style={{
                left,
                top,
                width: popupWidth,
                maxHeight: 'calc(100vh - 100px)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Choose Theme</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Personalize your mind map</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* Light Themes Section */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 to-orange-400" />
                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Light Themes
                        </h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {lightThemes.map(theme => (
                            <ThemeCard key={theme.id} theme={theme} />
                        ))}
                    </div>
                </div>

                {/* Dark Themes Section */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800" />
                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Dark Themes
                        </h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {darkThemes.map(theme => (
                            <ThemeCard key={theme.id} theme={theme} />
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

ThemePicker.propTypes = {
    show: PropTypes.bool.isRequired,
    currentTheme: PropTypes.string,
    onSelectTheme: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    anchorRef: PropTypes.object,
};
