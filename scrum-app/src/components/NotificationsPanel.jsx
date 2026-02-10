import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

const mockNotifications = [
    { id: 1, type: 'info', title: 'SCRUM meeting starts in 15 min', time: '10:45 AM', read: false },
    { id: 2, type: 'success', title: 'FBFM-170 moved to Live', time: '10:30 AM', read: false },
    { id: 3, type: 'warning', title: 'Analytics Report overdue', time: 'Yesterday', read: true },
    { id: 4, type: 'info', title: 'New item added to Action Items', time: 'Yesterday', read: true },
    { id: 5, type: 'success', title: 'Sprint R-27 deployed to QA', time: '2 days ago', read: true },
];

const typeIcons = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const NotificationsPanel = ({ isOpen, onClose, notifications, onMarkAllRead }) => {
    if (!isOpen) return null;

    const items = notifications || mockNotifications;
    const unreadCount = items.filter(n => !n.read).length;

    return (
        <div className="absolute right-16 top-14 w-[380px] glass-card shadow-2xl shadow-black/40 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-white/[0.06] text-slate-500 hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[360px] overflow-y-auto">
                {items.map((item) => {
                    const typeConfig = typeIcons[item.type] || typeIcons.info;
                    const TypeIcon = typeConfig.icon;
                    return (
                        <div
                            key={item.id}
                            className={clsx(
                                "flex items-start gap-3 px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer",
                                !item.read && "bg-blue-500/[0.03]"
                            )}
                        >
                            <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", typeConfig.bg)}>
                                <TypeIcon className={clsx("w-4 h-4", typeConfig.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={clsx("text-sm leading-snug", item.read ? "text-slate-400" : "text-slate-200 font-medium")}>
                                    {item.title}
                                </p>
                                <p className="text-[11px] text-slate-600 mt-0.5">{item.time}</p>
                            </div>
                            {!item.read && <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-2" />}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.06] text-center">
                <button className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors">
                    View all notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;
