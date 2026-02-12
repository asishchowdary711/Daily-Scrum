import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import { clsx } from 'clsx';
import { Moon, Sun, Monitor, Palette, Bell, Layout } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

const SETTINGS_KEY = 'scrumpro_ui_settings';

function readStoredSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

const baseSettings = {
    compactMode: false,
    notifications: true,
    showClosedItems: true,
    defaultView: 'kanban',
    dateFormat: 'yyyy-mm-dd',
};

const SettingsModal = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState(() => ({
        ...baseSettings,
        ...(readStoredSettings() || {}),
    }));

    const handleToggle = (key) => {
        setSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
            return next;
        });
    };

    const handleChange = (key, value) => {
        setSettings(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
            return next;
        });
    };

    const themeOptions = useMemo(() => ([
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'system', icon: Monitor, label: 'Auto' },
    ]), []);

    const toggleClass = (active) => clsx(
        'relative w-10 h-5 rounded-full transition-colors cursor-pointer border',
        active ? 'bg-[var(--primary)] border-transparent' : 'bg-[var(--bg-surface)] border-theme'
    );

    const toggleDot = (active) => clsx(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
        active ? 'translate-x-[22px]' : 'translate-x-0.5'
    );

    const sectionTitle = 'text-xs font-bold uppercase tracking-wider mb-3 text-theme-muted';
    const settingRow = 'flex items-center justify-between py-3 border-b border-theme last:border-none';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
            <div className="space-y-6">
                <div>
                    <h4 className={sectionTitle}>Appearance</h4>
                    <div>
                        <div className={settingRow}>
                            <div className="flex items-center gap-3">
                                <Palette className="w-4 h-4 text-theme-muted" />
                                <div>
                                    <p className="text-sm font-medium text-theme-primary">Theme</p>
                                    <p className="text-[11px] text-theme-muted">Choose your interface theme</p>
                                </div>
                            </div>
                            <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-surface)' }}>
                                {themeOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setTheme(opt.id)}
                                        className={clsx(
                                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all',
                                            theme === opt.id
                                                ? 'text-white'
                                                : 'text-theme-muted hover:text-theme-primary'
                                        )}
                                        style={theme === opt.id
                                            ? { backgroundColor: 'var(--primary)' }
                                            : undefined}
                                    >
                                        <opt.icon className="w-3 h-3" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={settingRow}>
                            <div className="flex items-center gap-3">
                                <Layout className="w-4 h-4 text-theme-muted" />
                                <div>
                                    <p className="text-sm font-medium text-theme-primary">Compact Mode</p>
                                    <p className="text-[11px] text-theme-muted">Reduce padding on cards and rows</p>
                                </div>
                            </div>
                            <button onClick={() => handleToggle('compactMode')} className={toggleClass(settings.compactMode)}>
                                <div className={toggleDot(settings.compactMode)} />
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className={sectionTitle}>Notifications</h4>
                    <div>
                        <div className={settingRow}>
                            <div className="flex items-center gap-3">
                                <Bell className="w-4 h-4 text-theme-muted" />
                                <div>
                                    <p className="text-sm font-medium text-theme-primary">Desktop Notifications</p>
                                    <p className="text-[11px] text-theme-muted">Get alerts for status changes</p>
                                </div>
                            </div>
                            <button onClick={() => handleToggle('notifications')} className={toggleClass(settings.notifications)}>
                                <div className={toggleDot(settings.notifications)} />
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className={sectionTitle}>Board Preferences</h4>
                    <div>
                        <div className={settingRow}>
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Show Closed Items</p>
                                <p className="text-[11px] text-theme-muted">Display closed/done items on board</p>
                            </div>
                            <button onClick={() => handleToggle('showClosedItems')} className={toggleClass(settings.showClosedItems)}>
                                <div className={toggleDot(settings.showClosedItems)} />
                            </button>
                        </div>

                        <div className={settingRow}>
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Date Format</p>
                                <p className="text-[11px] text-theme-muted">How dates are displayed</p>
                            </div>
                            <select
                                value={settings.dateFormat}
                                onChange={(e) => handleChange('dateFormat', e.target.value)}
                                className="select-base px-3 py-1.5 rounded-lg text-xs"
                            >
                                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-theme">
                    <button onClick={onClose} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
