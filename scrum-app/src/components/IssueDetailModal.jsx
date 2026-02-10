import React, { useState } from 'react';
import Modal from './Modal';
import { clsx } from 'clsx';
import { Calendar, User, Tag, MessageSquare, Save, Trash2 } from 'lucide-react';

const statusOptions = [
    { id: 'todo', label: 'To Do', color: '#3b82f6' },
    { id: 'inprogress', label: 'In Progress', color: '#f59e0b' },
    { id: 'qa', label: 'Ready for QA', color: '#8b5cf6' },
    { id: 'live', label: 'Live', color: '#10b981' },
    { id: 'done', label: 'Closed', color: '#6b7280' },
];

const priorityOptions = [
    { id: 'high', label: 'High', dot: 'bg-rose-500' },
    { id: 'medium', label: 'Medium', dot: 'bg-amber-400' },
    { id: 'low', label: 'Low', dot: 'bg-emerald-400' },
];

const IssueDetailModal = ({ isOpen, onClose, task, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(task || {});

    React.useEffect(() => {
        if (task) setForm({ ...task });
    }, [task]);

    if (!task) return null;

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(form);
        setEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this issue?')) {
            onDelete(task.id);
            onClose();
        }
    };

    const inputClass = "w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all";
    const fieldLabel = "text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task.code || 'Issue Detail'} size="lg">
            <div className="space-y-5">
                {/* Title */}
                <div>
                    {editing ? (
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full text-lg font-semibold text-white bg-transparent border-b border-white/[0.1] pb-1 focus:outline-none focus:border-blue-500/50"
                        />
                    ) : (
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                    )}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                        <p className={fieldLabel}>Status</p>
                        {editing ? (
                            <select
                                value={form.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className={inputClass + " appearance-none cursor-pointer"}
                            >
                                {statusOptions.map(s => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: statusOptions.find(s => s.id === task.status)?.color || '#6b7280' }}
                                />
                                <span className="text-sm text-slate-300">
                                    {statusOptions.find(s => s.id === task.status)?.label || task.status}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div>
                        <p className={fieldLabel}>Priority</p>
                        {editing ? (
                            <select
                                value={form.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                                className={inputClass + " appearance-none cursor-pointer"}
                            >
                                {priorityOptions.map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className={clsx("w-2 h-2 rounded-full", priorityOptions.find(p => p.id === task.priority)?.dot || 'bg-amber-400')} />
                                <span className="text-sm text-slate-300 capitalize">{task.priority}</span>
                            </div>
                        )}
                    </div>

                    {/* Assignee */}
                    <div>
                        <p className={fieldLabel}>Assignee</p>
                        {editing ? (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={form.assignee}
                                    onChange={(e) => handleChange('assignee', e.target.value)}
                                    className={inputClass}
                                    placeholder="Assign to..."
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">
                                    {(task.assignee || 'U').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm text-slate-300">{task.assignee || 'Unassigned'}</span>
                            </div>
                        )}
                    </div>

                    {/* Due Date */}
                    <div>
                        <p className={fieldLabel}>Due Date</p>
                        {editing ? (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <input
                                    type="date"
                                    value={form.liveDate || ''}
                                    onChange={(e) => handleChange('liveDate', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                {task.liveDate || 'No date set'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments / Description */}
                <div>
                    <p className={fieldLabel}>Comments</p>
                    {editing ? (
                        <textarea
                            value={form.comments || ''}
                            onChange={(e) => handleChange('comments', e.target.value)}
                            rows={4}
                            className={clsx(inputClass, "resize-none")}
                            placeholder="Add comments..."
                        />
                    ) : (
                        <div className="glass-surface rounded-xl p-4 min-h-[80px]">
                            <p className="text-sm text-slate-400 whitespace-pre-line leading-relaxed">
                                {task.comments || 'No comments yet.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Code */}
                {task.code && (
                    <div>
                        <p className={fieldLabel}>Issue Code</p>
                        {editing ? (
                            <input
                                type="text"
                                value={form.code || ''}
                                onChange={(e) => handleChange('code', e.target.value)}
                                className={inputClass}
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-mono text-blue-400">{task.code}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>

                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <button
                                    onClick={() => { setForm({ ...task }); setEditing(false); }}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white transition-all"
                            >
                                Edit Issue
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default IssueDetailModal;
