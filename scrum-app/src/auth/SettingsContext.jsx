import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext(null);

const SETTINGS_KEY = 'scrumpro_settings';

const DEFAULT_SETTINGS = {
    theme: 'dark',         // 'dark' | 'light' | 'auto'
    compactMode: false,
    showClosedItems: true,
    showNotifications: true,
    dateFormat: 'relative', // 'relative' | 'absolute' | 'iso'
};

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch {
        localStorage.removeItem(SETTINGS_KEY);
    }
    return { ...DEFAULT_SETTINGS };
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(loadSettings);

    // Persist on change
    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    // Apply theme to <html>
    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else if (settings.theme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light');
        } else {
            // Auto — use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
            root.classList.toggle('light', !prefersDark);
        }
    }, [settings.theme]);

    // Apply compact mode
    useEffect(() => {
        document.documentElement.classList.toggle('compact', settings.compactMode);
    }, [settings.compactMode]);

    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings({ ...DEFAULT_SETTINGS });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
};

export default SettingsContext;
