import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { FileText } from 'lucide-react';

const SimpleListView = ({ data, searchQuery = '' }) => {
    const items = useMemo(() => data?.items || [], [data]);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(item =>
            (item.title || '').toLowerCase().includes(q)
            || (item.area || '').toLowerCase().includes(q)
            || (item.action || '').toLowerCase().includes(q)
            || (item.detail || '').toLowerCase().includes(q)
            || (item.description || '').toLowerCase().includes(q)
        );
    }, [items, searchQuery]);

    if (!items.length) {
        return (
            <div className="glass-card flex items-center justify-center p-16 text-theme-muted">
                No items to display.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-xs mb-2 text-theme-muted">
                Showing <span className="font-semibold text-theme-primary">{filteredItems.length}</span> items
            </div>

            <div className="grid gap-3">
                {filteredItems.map((item) => (
                    <div key={item.id} className="glass-card p-4 hover:border-[var(--primary)]/40 transition-all group">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--bg-surface)' }}>
                                <FileText className="w-4 h-4 text-theme-muted" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium transition-colors text-theme-primary">
                                    {item.title || item.area || 'Untitled'}
                                </h4>
                                {(item.action || item.description) && (
                                    <p className="text-xs mt-1 line-clamp-2 text-theme-secondary">
                                        {item.action || item.description}
                                    </p>
                                )}
                                {item.detail && (
                                    <p className="text-xs mt-1.5 whitespace-pre-line line-clamp-3 leading-relaxed text-theme-muted">
                                        {item.detail}
                                    </p>
                                )}
                            </div>
                            <div className={clsx('priority-dot shrink-0 mt-2', {
                                'priority-high': item.priority === 'high',
                                'priority-medium': item.priority === 'medium',
                                'priority-low': item.priority === 'low',
                            })}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimpleListView;
