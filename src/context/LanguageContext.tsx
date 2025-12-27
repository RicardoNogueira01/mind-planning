import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { t as translate } from '../i18n/translations';

// Types
type Language = 'en' | 'pt' | 'es' | 'fr';

interface LanguageContextValue {
    language: string;
    setLanguage: (lang: string) => void;
    toggleLanguage: () => void;
    changeLanguage: (newLanguage: string) => void;
    t: (key: string) => string;
}

interface LanguageProviderProps {
    children: ReactNode;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const useLanguage = (): LanguageContextValue => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<string>(() => {
        // Get from localStorage or default to English
        return localStorage.getItem('app-language') || 'en';
    });

    useEffect(() => {
        // Save to localStorage whenever language changes
        localStorage.setItem('app-language', language);
    }, [language]);

    const toggleLanguage = (): void => {
        setLanguage(prev => prev === 'en' ? 'pt' : 'en');
    };

    const changeLanguage = (newLanguage: string): void => {
        setLanguage(newLanguage);
    };

    const t = (key: string): string => translate(key, language);

    const value = useMemo<LanguageContextValue>(() => ({
        language,
        setLanguage,
        toggleLanguage,
        changeLanguage,
        t,
    }), [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
