import React from 'react';
import Modal from './Modal';
import { clsx } from 'clsx';
import { Moon, Sun, Monitor, Palette, Bell, Layout } from 'lucide-react';
import { useSettings } from '../auth/SettingsContext';

const SettingsModal = ({ isOpen, onClose }) => {
    // Finding 10: Wire to SettingsContext instead of local state
    const { settings, updateSetting } = useSettings();

    const handleToggle = (key) => {
        updateSetting(key, !settings[key]);
    };

    const toggleClass = (active) => clsx(
        "relative w-10 h-5 rounded-full transition-colors cursor-pointer",
        active ? "bg-blue-600" : "bg-white/[0.1]"
    );

    const toggleDot = (active) => clsx(
        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
        active ? "translate-x-[22px]" : "translate-x-0.5"
    );

    const sectionTitle = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-3";
    const settingRow = "flex items-center justify-between py-3 border-b border-white/[0.04] last:border-none";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
            <div className="space-y-6">
                {/* Appearance */}
                <div>
                    <h4 className={sectionTitle}>Appearance</h4>
                    <div>
                        <div className={settingRow}>
                            <div className="flex items-center gap-3">
                                <Palette className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-200 font-medium">Theme</p>
                                    <p className="text-[11px] text-slate-500">Choose your interface theme</p>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1">
                                {[
                                    { id: 'dark', icon: Moon, label: 'Dark' },
                                    { id: 'light', icon: Sun, label: 'Light' },
                                    { id: 'auto', icon: Monitor, label: 'Auto' },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => updateSetting('theme', opt.id)}
                                        className={clsx(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all",
                                            settings.theme === opt.id
                                                ? "bg-white/[0.1] text-white"
                                                : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        <opt.icon className="w-3 h-3" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={settingRow}>
                            <div className="flex items-center gap-3">
                                <Layout className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-200 font-medium">Compact Mode</p>
                                    <p className="text-[11px] text-slate-500">Reduce padding on cards and rows</p>
                                </div>
                            </div>
                            <button onClick={() => handleToggle('compactMode')} className={toggleClass(settings.compactMode)}>
                                <div className={toggleDot(settings.compactMode)} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div>
                    <h4 className={sectionTitle}>Notifications</h4>
                    <div>
                        <div className={settingRow}>
                            <div className="flex items-center gap-3">
                                <Bell className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-200 font-medium">Desktop Notifications</p>
                                    <p className="text-[11px] text-slate-500">Get alerts for status changes</p>
                                </div>
                            </div>
                            <button onClick={() => handleToggle('showNotifications')} className={toggleClass(settings.showNotifications)}>
                                <div className={toggleDot(settings.showNotifications)} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Board */}
                <div>
                    <h4 className={sectionTitle}>Board Preferences</h4>
                    <div>
                        <div className={settingRow}>
                            <div>
                                <p className="text-sm text-slate-200 font-medium">Show Closed Items</p>
                                <p className="text-[11px] text-slate-500">Display closed/done items on board</p>
                            </div>
                            <button onClick={() => handleToggle('showClosedItems')} className={toggleClass(settings.showClosedItems)}>
                                <div className={toggleDot(settings.showClosedItems)} />
                            </button>
                        </div>

                        <div className={settingRow}>
                            <div>
                                <p className="text-sm text-slate-200 font-medium">Date Format</p>
                                <p className="text-[11px] text-slate-500">How dates are displayed</p>
                            </div>
                            <select
                                value={settings.dateFormat}
                                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                                className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/40 appearance-none cursor-pointer"
                            >
                                <option value="relative">Relative (2 days ago)</option>
                                <option value="absolute">DD/MM/YYYY</option>
                                <option value="iso">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Done */}
                <div className="flex justify-end pt-2 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
