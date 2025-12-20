/**
 * @fileoverview Dashboard header component with title and action buttons
 */

import React, { useState, useRef, useEffect } from 'react';
import { Activity, Palette, PartyPopper, Check } from 'lucide-react';
// @ts-ignore
import { useTheme } from '../../context/ThemeContext';

/**
 * Dashboard header component containing title and action buttons
 * @returns JSX element representing the dashboard header
 */
const DashboardHeader: React.FC = () => {
  // @ts-ignore
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 md:mb-8 transition-colors duration-500">
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
              Project Dashboard
            </h1>
            <p className="text-xs md:text-base text-gray-500 mt-1">Monitor your team's progress and key performance indicators</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">


            {/* Theme Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap touch-manipulation min-w-[140px] justify-between"
                aria-label="Theme selector"
              >
                <div className="flex items-center gap-2">
                  <Palette size={16} />
                  <span>{themes.find((t: any) => t.id === currentTheme)?.name || 'Theme'}</span>
                </div>
                {themes.find((t: any) => t.id === currentTheme)?.icon || ''}
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 animate-scale-in origin-top-right">
                  {themes.map((theme: any) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setCurrentTheme(theme.id);
                        setShowThemeMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{theme.icon}</span>
                        <span className={`font-medium ${currentTheme === theme.id ? 'text-blue-600' : 'text-gray-700'}`}>
                          {theme.name}
                        </span>
                      </div>
                      {currentTheme === theme.id && <Check size={14} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap touch-manipulation"
              aria-label="Strategy board"
            >
              <Activity size={16} />
              Strategy Board
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
