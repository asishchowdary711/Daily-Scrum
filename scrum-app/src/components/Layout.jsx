import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';
import NotificationsPanel from './NotificationsPanel';
import SettingsModal from './SettingsModal';
import { useAuth } from '../auth/AuthContext';

const Layout = ({ children, projects, activeProjectId, setActiveProjectId, onCreateIssue, authUser, liveCounts = {} }) => {
    const { logout } = useAuth();
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

    // Close dropdowns on outside click
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
        <div className="flex h-screen overflow-hidden">
            {/* ── Sidebar ── */}
            <aside className="w-[260px] bg-[#12141c] border-r border-white/[0.06] flex flex-col shrink-0">
                {/* Logo */}
                <div className="px-5 h-16 flex items-center gap-3 border-b border-white/[0.06]">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Icons.Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-[15px] text-white tracking-tight">ScrumPro</span>
                        <p className="text-[10px] text-slate-500 font-medium -mt-0.5">Daily Stand-up Tracker</p>
                    </div>
                </div>

                {/* Create Button — Hidden for unsupported types (Finding 5) */}
                {onCreateIssue && (
                    <div className="px-3 pt-4 pb-2">
                        <button
                            onClick={onCreateIssue}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all active:scale-[0.97]"
                        >
                            <Icons.Plus className="w-4 h-4" />
                            Create Issue
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-6">
                    {/* Boards */}
                    {projectsByType.kanban.length > 0 && (
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                Boards
                            </div>
                            <div className="space-y-0.5">
                                {projectsByType.kanban.map(project => {
                                    const Icon = getIcon(project.icon);
                                    const isActive = project.id === activeProjectId;
                                    const taskCount = liveCounts[project.id] ?? (project.tasks ? Object.keys(project.tasks).length : 0);
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => setActiveProjectId(project.id)}
                                            className={clsx("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{project.name}</span>
                                            <span className="ml-auto text-[10px] text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded-md font-bold">
                                                {taskCount}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Trackers */}
                    {projectsByType.table.length > 0 && (
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
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
                                            className={clsx("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{project.name}</span>
                                            {(liveCounts[project.id] != null || project.items) && (
                                                <span className="ml-auto text-[10px] text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded-md font-bold">
                                                    {liveCounts[project.id] ?? project.items?.length ?? 0}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Other */}
                    {projectsByType.simple.length > 0 && (
                        <div>
                            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
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
                                            className={clsx("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <span className="truncate">{project.name}</span>
                                            {(liveCounts[project.id] != null || project.items) && (
                                                <span className="ml-auto text-[10px] text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded-md font-bold">
                                                    {liveCounts[project.id] ?? project.items?.length ?? 0}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </nav>

                {/* User - with dropdown */}
                <div className="p-3 border-t border-white/[0.06] relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-violet-500/20">
                            {(authUser?.displayName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-white truncate">{authUser?.displayName || 'User'}</p>
                            <p className="text-[10px] text-slate-500">{authUser?.role || 'Member'}</p>
                        </div>
                        <Icons.ChevronDown className={clsx("w-3.5 h-3.5 text-slate-500 transition-transform", showUserMenu && "rotate-180")} />
                    </button>

                    {/* User dropdown */}
                    {showUserMenu && (
                        <div className="absolute bottom-full left-3 right-3 mb-1 glass-card shadow-2xl shadow-black/40 py-1 z-50">
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors text-left">
                                <Icons.User className="w-4 h-4 text-slate-500" />
                                My Profile
                            </button>
                            <button
                                onClick={() => { setShowUserMenu(false); setShowSettings(true); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors text-left"
                            >
                                <Icons.Settings className="w-4 h-4 text-slate-500" />
                                Settings
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors text-left">
                                <Icons.HelpCircle className="w-4 h-4 text-slate-500" />
                                Help & Guide
                            </button>
                            <div className="border-t border-white/[0.06] my-1" />
                            <button
                                onClick={() => { setShowUserMenu(false); logout(); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                            >
                                <Icons.LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-[#12141c]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-8 shrink-0 z-20 relative">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold text-white">{currentProject?.name}</h1>
                        <span className="text-[10px] font-bold text-slate-500 bg-white/[0.05] px-2 py-1 rounded-md uppercase tracking-wider">
                            {currentProject?.type === 'kanban' ? 'Board' : currentProject?.type === 'table' ? 'Tracker' : 'List'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all w-56"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                    <Icons.X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        <div className="w-px h-6 bg-white/[0.06]" />

                        {/* Notifications */}
                        <div ref={notifRef} className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors relative",
                                    showNotifications ? "bg-white/[0.06] text-white" : "hover:bg-white/[0.04] text-slate-400 hover:text-slate-200"
                                )}
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

                        {/* Settings */}
                        <button
                            onClick={() => setShowSettings(true)}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                showSettings ? "bg-white/[0.06] text-white" : "hover:bg-white/[0.04] text-slate-400 hover:text-slate-200"
                            )}
                        >
                            <Icons.Settings className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-[#0f1117]">
                    {typeof children === 'function' ? children({ searchQuery }) : children}
                </div>
            </main>

            {/* Modals */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
};

export default Layout;
