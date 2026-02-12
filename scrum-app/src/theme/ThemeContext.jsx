/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'scrumpro_theme';
const THEMES = ['light', 'dark', 'system'];

const ThemeContext = createContext(null);

function getSystemTheme() {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(THEME_KEY);
    return THEMES.includes(stored) ? stored : 'system';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getStoredTheme);
    const [resolvedTheme, setResolvedTheme] = useState(() => (
        getStoredTheme() === 'system' ? getSystemTheme() : getStoredTheme()
    ));

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const syncTheme = () => {
            setResolvedTheme(theme === 'system'
                ? (mediaQuery.matches ? 'dark' : 'light')
                : theme);
        };

        syncTheme();
        mediaQuery.addEventListener('change', syncTheme);
        localStorage.setItem(THEME_KEY, theme);

        return () => {
            mediaQuery.removeEventListener('change', syncTheme);
        };
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.style.colorScheme = resolvedTheme;
    }, [resolvedTheme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const current = prev === 'system' ? resolvedTheme : prev;
            return current === 'dark' ? 'light' : 'dark';
        });
    }, [resolvedTheme]);

    const value = useMemo(() => ({
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
    }), [theme, resolvedTheme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
