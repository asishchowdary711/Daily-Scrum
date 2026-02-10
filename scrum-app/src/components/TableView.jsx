import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';

const statusConfig = {
    'open': { label: 'Open', bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    'in-progress': { label: 'In Progress', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    'on-hold': { label: 'On Hold', bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
    'closed': { label: 'Closed', bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-500' },
    'live': { label: 'Live', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const TableView = ({ data, searchQuery = '' }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRow, setExpandedRow] = useState(null);
    const [sortField, setSortField] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const items = data?.items || [];

    const filteredItems = useMemo(() => {
        let result = items;

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter);
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title || '').toLowerCase().includes(q) ||
                (item.area || '').toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q) ||
                (item.responsible || '').toLowerCase().includes(q) ||
                (item.nextAction || '').toLowerCase().includes(q)
            );
        }

        // Sort
        if (sortField) {
            result = [...result].sort((a, b) => {
                const aVal = (a[sortField] || '').toLowerCase();
                const bVal = (b[sortField] || '').toLowerCase();
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });
        }

        return result;
    }, [items, statusFilter, searchQuery, sortField, sortDir]);

    // Status counts
    const statusCounts = useMemo(() => {
        const counts = { all: items.length };
        items.forEach(item => {
            counts[item.status] = (counts[item.status] || 0) + 1;
        });
        return counts;
    }, [items]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.open;
        return (
            <span className={clsx("status-badge", config.bg, config.text)}>
                <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
                {config.label}
            </span>
        );
    };

    if (!items.length) {
        return (
            <div className="glass-card flex items-center justify-center p-16 text-slate-500">
                No items to display.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-500 mr-1" />
                {['all', 'open', 'in-progress', 'on-hold', 'live', 'closed'].map(status => {
                    const count = statusCounts[status] || 0;
                    const config = statusConfig[status] || {};
                    const isActive = statusFilter === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                isActive
                                    ? "bg-white/[0.08] border-white/[0.1] text-white"
                                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                            )}
                        >
                            {status === 'all' ? 'All' : (config.label || status)}
                            <span className={clsx(
                                "ml-1.5 text-[10px] font-bold",
                                isActive ? "text-blue-400" : "text-slate-600"
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}

                <div className="ml-auto text-xs text-slate-500">
                    Showing <span className="text-slate-300 font-semibold">{filteredItems.length}</span> of {items.length}
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="w-8 px-4 py-3" />
                                <th
                                    className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                                    onClick={() => handleSort('area')}
                                >
                                    <div className="flex items-center gap-1">
                                        Area / Title
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                                    onClick={() => handleSort('responsible')}
                                >
                                    <div className="flex items-center gap-1">
                                        Responsible
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Next Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, i) => {
                                const isExpanded = expandedRow === item.id;
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr
                                            className={clsx(
                                                "group border-b border-white/[0.03] transition-colors cursor-pointer",
                                                isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                                            )}
                                            onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                                        >
                                            <td className="px-4 py-3 text-slate-600">
                                                {isExpanded
                                                    ? <ChevronDown className="w-3.5 h-3.5" />
                                                    : <ChevronRight className="w-3.5 h-3.5" />
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={clsx("priority-dot shrink-0", {
                                                        'priority-high': item.priority === 'high',
                                                        'priority-medium': item.priority === 'medium',
                                                        'priority-low': item.priority === 'low',
                                                    })} />
                                                    <span className="text-slate-200 font-medium truncate max-w-[250px]" title={item.title}>
                                                        {item.title || '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 truncate max-w-[300px]" title={item.description}>
                                                {item.description || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">
                                                {item.responsible || item.assignee || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[200px]" title={item.nextAction}>
                                                {item.nextAction ? item.nextAction.split('\n')[0] : '—'}
                                            </td>
                                        </tr>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <tr className="bg-white/[0.02]">
                                                <td />
                                                <td colSpan="5" className="px-4 py-4">
                                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                                        <div>
                                                            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Date Raised</span>
                                                            <p className="text-slate-300 mt-1">{item.dateRaised || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Target Date</span>
                                                            <p className="text-slate-300 mt-1">{item.targetDate || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Assignee</span>
                                                            <p className="text-slate-300 mt-1">{item.assignee || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Raw Status</span>
                                                            <p className="text-slate-300 mt-1">{item.statusRaw || '—'}</p>
                                                        </div>
                                                        {item.nextAction && (
                                                            <div className="col-span-2">
                                                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Full Notes</span>
                                                                <p className="text-slate-400 mt-1 whitespace-pre-line leading-relaxed">{item.nextAction}</p>
                                                            </div>
                                                        )}
                                                        {item.comment && (
                                                            <div className="col-span-2">
                                                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Comment</span>
                                                                <p className="text-slate-400 mt-1 whitespace-pre-line">{item.comment}</p>
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
