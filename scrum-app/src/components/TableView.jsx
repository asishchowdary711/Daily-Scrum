import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';

const statusConfig = {
    open: { label: 'Open', bg: 'bg-blue-500/15', text: 'text-blue-500', dot: 'bg-blue-500' },
    'in-progress': { label: 'In Progress', bg: 'bg-amber-500/15', text: 'text-amber-500', dot: 'bg-amber-500' },
    'on-hold': { label: 'On Hold', bg: 'bg-orange-500/15', text: 'text-orange-500', dot: 'bg-orange-500' },
    closed: { label: 'Closed', bg: 'bg-slate-500/15', text: 'text-slate-500', dot: 'bg-slate-500' },
    live: { label: 'Live', bg: 'bg-emerald-500/15', text: 'text-emerald-500', dot: 'bg-emerald-500' },
};

const TableView = ({ data, searchQuery = '' }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRow, setExpandedRow] = useState(null);
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const items = useMemo(() => data?.items || [], [data]);

    const filteredItems = useMemo(() => {
        let result = items;

        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title || '').toLowerCase().includes(q)
                || (item.area || '').toLowerCase().includes(q)
                || (item.description || '').toLowerCase().includes(q)
                || (item.responsible || '').toLowerCase().includes(q)
                || (item.nextAction || '').toLowerCase().includes(q)
            );
        }

        if (sortField) {
            result = [...result].sort((a, b) => {
                const aVal = (a[sortField] || '').toLowerCase();
                const bVal = (b[sortField] || '').toLowerCase();
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });
        }

        return result;
    }, [items, statusFilter, searchQuery, sortField, sortDir]);

    const statusCounts = useMemo(() => {
        const counts = { all: items.length };
        items.forEach(item => {
            counts[item.status] = (counts[item.status] || 0) + 1;
        });
        return counts;
    }, [items]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.open;
        return (
            <span className={clsx('status-badge', config.bg, config.text)}>
                <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
                {config.label}
            </span>
        );
    };

    if (!items.length) {
        return (
            <div className="glass-card flex items-center justify-center p-16 text-theme-muted">
                No items to display.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 mr-1 text-theme-muted" />
                {['all', 'open', 'in-progress', 'on-hold', 'live', 'closed'].map((status) => {
                    const count = statusCounts[status] || 0;
                    const config = statusConfig[status] || {};
                    const isActive = statusFilter === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={clsx(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                                isActive
                                    ? 'border-theme text-theme-primary'
                                    : 'border-transparent text-theme-muted hover:text-theme-primary hover:bg-[var(--bg-surface)]'
                            )}
                            style={isActive ? { backgroundColor: 'var(--bg-surface)' } : undefined}
                        >
                            {status === 'all' ? 'All' : (config.label || status)}
                            <span
                                className={clsx('ml-1.5 text-[10px] font-bold', isActive ? 'text-blue-500' : 'text-theme-muted')}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}

                <div className="ml-auto text-xs text-theme-muted">
                    Showing <span className="font-semibold text-theme-primary">{filteredItems.length}</span> of {items.length}
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-theme">
                                <th className="w-8 px-4 py-3" />
                                <th
                                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors text-theme-muted hover:text-theme-primary"
                                    onClick={() => handleSort('area')}
                                >
                                    <div className="flex items-center gap-1">
                                        Area / Title
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                                    Description
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors text-theme-muted hover:text-theme-primary"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors text-theme-muted hover:text-theme-primary"
                                    onClick={() => handleSort('responsible')}
                                >
                                    <div className="flex items-center gap-1">
                                        Responsible
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                                    Next Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => {
                                const isExpanded = expandedRow === item.id;
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr
                                            className={clsx(
                                                'group border-b border-theme transition-colors cursor-pointer',
                                                isExpanded ? 'bg-[var(--bg-surface)]' : 'hover:bg-[var(--bg-surface)]'
                                            )}
                                            onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                                        >
                                            <td className="px-4 py-3 text-theme-muted">
                                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={clsx('priority-dot shrink-0', {
                                                        'priority-high': item.priority === 'high',
                                                        'priority-medium': item.priority === 'medium',
                                                        'priority-low': item.priority === 'low',
                                                    })}
                                                    />
                                                    <span className="font-medium truncate max-w-[250px] text-theme-primary" title={item.title}>
                                                        {item.title || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 truncate max-w-[300px] text-theme-secondary" title={item.description}>
                                                {item.description || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-theme-secondary">
                                                {item.responsible || item.assignee || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs truncate max-w-[200px] text-theme-muted" title={item.nextAction}>
                                                {item.nextAction ? item.nextAction.split('\n')[0] : '—'}
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr className="bg-[var(--bg-surface)]">
                                                <td />
                                                <td colSpan="5" className="px-4 py-4">
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <span className="font-semibold uppercase tracking-wider text-[10px] text-theme-muted">Date Raised</span>
                                                            <p className="mt-1 text-theme-primary">{item.dateRaised || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold uppercase tracking-wider text-[10px] text-theme-muted">Target Date</span>
                                                            <p className="mt-1 text-theme-primary">{item.targetDate || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold uppercase tracking-wider text-[10px] text-theme-muted">Assignee</span>
                                                            <p className="mt-1 text-theme-primary">{item.assignee || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold uppercase tracking-wider text-[10px] text-theme-muted">Raw Status</span>
                                                            <p className="mt-1 text-theme-primary">{item.statusRaw || '—'}</p>
                                                        </div>
                                                        {item.nextAction && (
                                                            <div className="col-span-2">
                                                                <span className="font-semibold uppercase tracking-wider text-[10px] text-theme-muted">Full Notes</span>
                                                                <p className="mt-1 whitespace-pre-line leading-relaxed text-theme-secondary">{item.nextAction}</p>
                                                            </div>
                                                        )}
                                                        {item.comment && (
                                                            <div className="col-span-2">
                                                                <span className="font-semibold uppercase tracking-wider text-[10px] text-theme-muted">Comment</span>
                                                                <p className="mt-1 whitespace-pre-line text-theme-secondary">{item.comment}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TableView;
