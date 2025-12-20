import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('default');

    // Apply theme classes to the document body or a root element
    useEffect(() => {
        // Remove all previous theme classes
        document.body.classList.remove(
            'theme-christmas',
            'theme-new-year',
            'theme-black-friday',
            'theme-halloween',
            'theme-thanksgiving',
            'theme-birthday'
        );

        // Apply current theme class
        if (currentTheme !== 'default') {
            document.body.classList.add(`theme-${currentTheme.replace(' ', '-').toLowerCase()}`);
        }
    }, [currentTheme]);

    const themes = [
        { id: 'default', name: 'Default', icon: '🎨', greeting: 'Hello', emoji: '👋' },
        { id: 'birthday', name: 'Birthday', icon: '🎂', greeting: 'Happy Birthday', emoji: '🎉' },
        { id: 'christmas', name: 'Christmas', icon: '🎄', greeting: 'Merry Christmas', emoji: '🎄' },
        { id: 'new-year', name: 'New Year', icon: '🎆', greeting: 'Happy New Year', emoji: '🎉' },
        { id: 'black-friday', name: 'Black Friday', icon: '🏷️', greeting: 'Big Deals', emoji: '🛍️' },
        { id: 'halloween', name: 'Halloween', icon: '🎃', greeting: 'Happy Halloween', emoji: '👻' },
        { id: 'thanksgiving', name: 'Thanksgiving', icon: '🦃', greeting: 'Happy Thanksgiving', emoji: '🍂' }
    ];

    const value = {
        currentTheme,
        setCurrentTheme,
        themes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
