import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';
import NotificationsPanel from './NotificationsPanel';
import SettingsModal from './SettingsModal';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const Layout = ({ children, projects, activeProjectId, setActiveProjectId, onCreateIssue, canCreateIssue = true, authUser }) => {
    const { logout } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    const currentProject = projects.find(p => p.id === activeProjectId);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'info', title: 'SCRUM meeting starts in 15 min', time: '10:45 AM', read: false },
        { id: 2, type: 'success', title: 'FBFM-170 moved to Live', time: '10:30 AM', read: false },
        { id: 3, type: 'warning', title: 'Analytics Report overdue', time: 'Yesterday', read: true },
        { id: 4, type: 'info', title: 'New item added to Action Items', time: 'Yesterday', read: true },
        { id: 5, type: 'success', title: 'Sprint R-27 deployed to QA', time: '2 days ago', read: true },
    ]);

    const userMenuRef = useRef(null);
    const notifRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (name) => {
        const Icon = Icons[name] || Icons.Folder;
        return Icon;
    };

    const projectsByType = {
        kanban: projects.filter(p => p.type === 'kanban'),
        table: projects.filter(p => p.type === 'table'),
        simple: projects.filter(p => p.type === 'simple'),
    };

    return (
        <div className="flex h-screen overflow-hidden bg-app text-theme-primary">
            <aside className="w-[260px] panel-surface border-r border-theme flex flex-col shrink-0">
                <div className="px-5 h-16 flex items-center gap-3 border-b border-theme">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Icons.Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-[15px] tracking-tight text-theme-primary">ScrumPro</span>
                        <p className="text-[10px] font-medium -mt-0.5 text-theme-muted">Daily Stand-up Tracker</p>
                    </div>
                </div>

                <div className="px-3 pt-4 pb-2">
                    <button
                        onClick={onCreateIssue}
                        disabled={!canCreateIssue}
                        className={clsx(
                            "btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed",
                            !canCreateIssue && "!shadow-none"
                        )}
                    >
                        <Icons.Plus className="w-4 h-4" />
                        Create Issue
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-6">
                    {projectsByType.kanban.length > 0 && (
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-theme-muted">
                                Boards
                            </div>
                            <div className="space-y-0.5">
                                {projectsByType.kanban.map(project => {
                                    const Icon = getIcon(project.icon);
                                    const isActive = project.id === activeProjectId;
                                    const taskCount = project.tasks ? Object.keys(project.tasks).length : 0;
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => setActiveProjectId(project.id)}
                                            className={clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive')}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{project.name}</span>
                                            <span
                                                className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold text-theme-muted"
                                                style={{ backgroundColor: 'var(--bg-surface)' }}
                                            >
                                                {taskCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {projectsByType.table.length > 0 && (
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-theme-muted">
                                Action Trackers
                            </div>
                            <div className="space-y-0.5">
                                {projectsByType.table.map(project => {
                                    const Icon = getIcon(project.icon);
                                    const isActive = project.id === activeProjectId;
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => setActiveProjectId(project.id)}
                                            className={clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive')}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{project.name}</span>
                                            {project.items && (
                                                <span
                                                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold text-theme-muted"
                                                    style={{ backgroundColor: 'var(--bg-surface)' }}
                                                >
                                                    {project.items.length}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {projectsByType.simple.length > 0 && (
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-theme-muted">
                                Other
                            </div>
                            <div className="space-y-0.5">
                                {projectsByType.simple.map(project => {
                                    const Icon = getIcon(project.icon);
                                    const isActive = project.id === activeProjectId;
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => setActiveProjectId(project.id)}
                                            className={clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive')}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{project.name}</span>
                                            {project.items && (
                                                <span
                                                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold text-theme-muted"
                                                    style={{ backgroundColor: 'var(--bg-surface)' }}
                                                >
                                                    {project.items.length}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-3 border-t border-theme relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-violet-500/20">
                            {(authUser?.displayName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium truncate text-theme-primary">{authUser?.displayName || 'User'}</p>
                            <p className="text-[10px] text-theme-muted">{authUser?.role || 'Member'}</p>
                        </div>
                        <Icons.ChevronDown className={clsx('w-3.5 h-3.5 transition-transform text-theme-muted', showUserMenu && 'rotate-180')} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute bottom-full left-3 right-3 mb-1 glass-card shadow-2xl py-1 z-50">
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--bg-surface)] transition-colors text-left text-theme-secondary hover:text-theme-primary">
                                <Icons.User className="w-4 h-4 text-theme-muted" />
                                My Profile
                            </button>
                            <button
                                onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--bg-surface)] transition-colors text-left text-theme-secondary hover:text-theme-primary"
                            >
                                <Icons.Settings className="w-4 h-4 text-theme-muted" />
                                Settings
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[var(--bg-surface)] transition-colors text-left text-theme-secondary hover:text-theme-primary">
                                <Icons.HelpCircle className="w-4 h-4 text-theme-muted" />
                                Help & Guide
                            </button>
                            <div className="border-t border-theme my-1" />
                            <button
                                onClick={() => { setShowUserMenu(false); logout(); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                            >
                                <Icons.LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 panel-surface border-b border-theme flex items-center justify-between px-8 shrink-0 z-20 relative">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold text-theme-primary">{currentProject?.name}</h1>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider text-theme-muted" style={{ backgroundColor: 'var(--bg-surface)' }}>
                            {currentProject?.type === 'kanban' ? 'Board' : currentProject?.type === 'table' ? 'Tracker' : 'List'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-base pl-9 pr-8 py-2 rounded-xl text-sm w-56"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="icon-btn absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md"
                                >
                                    <Icons.X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <div className="w-px h-6" style={{ backgroundColor: 'var(--card-border)' }} />

                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                            className="icon-btn p-2 rounded-lg"
                        >
                            {resolvedTheme === 'dark' ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
                        </button>

                        <div ref={notifRef} className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={clsx('p-2 rounded-lg transition-colors relative icon-btn', showNotifications && 'icon-btn-active')}
                            >
                                <Icons.Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationsPanel
                                isOpen={showNotifications}
                                onClose={() => setShowNotifications(false)}
                                notifications={notifications}
                                onMarkAllRead={handleMarkAllRead}
                            />
                        </div>

                        <button
                            onClick={() => setShowSettings(true)}
                            className={clsx('p-2 rounded-lg transition-colors icon-btn', showSettings && 'icon-btn-active')}
                        >
                            <Icons.Settings className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 bg-app">
                    {typeof children === 'function' ? children({ searchQuery }) : children}
                </div>
            </main>

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
};

export default Layout;
