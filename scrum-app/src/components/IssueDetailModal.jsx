import React, { useState } from 'react';
import Modal from './Modal';
import { clsx } from 'clsx';
import { Calendar, User, Tag, Save, Trash2 } from 'lucide-react';

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
        if (task) {
            setForm({ ...task });
            setEditing(false);
        }
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

    const inputClass = 'input-base w-full px-3 py-2 rounded-lg text-sm';
    const fieldLabel = 'text-[10px] font-bold uppercase tracking-wider mb-1 text-theme-muted';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task.code || 'Issue Detail'} size="lg">
            <div className="space-y-5">
                <div>
                    {editing ? (
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="input-base w-full text-lg font-semibold px-0 pb-1 border-0 border-b rounded-none"
                        />
                    ) : (
                        <h3 className="text-lg font-semibold text-theme-primary">{task.title}</h3>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className={fieldLabel}>Status</p>
                        {editing ? (
                            <select
                                value={form.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className={`${inputClass} select-base appearance-none cursor-pointer`}
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
                                <span className="text-sm text-theme-secondary">
                                    {statusOptions.find(s => s.id === task.status)?.label || task.status}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className={fieldLabel}>Priority</p>
                        {editing ? (
                            <select
                                value={form.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                                className={`${inputClass} select-base appearance-none cursor-pointer`}
                            >
                                {priorityOptions.map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className={clsx('w-2 h-2 rounded-full', priorityOptions.find(p => p.id === task.priority)?.dot || 'bg-amber-400')} />
                                <span className="text-sm text-theme-secondary capitalize">{task.priority}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className={fieldLabel}>Assignee</p>
                        {editing ? (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-theme-muted" />
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
                                <span className="text-sm text-theme-secondary">{task.assignee || 'Unassigned'}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className={fieldLabel}>Due Date</p>
                        {editing ? (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-theme-muted" />
                                <input
                                    type="date"
                                    value={form.liveDate || ''}
                                    onChange={(e) => handleChange('liveDate', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-theme-secondary">
                                <Calendar className="w-4 h-4 text-theme-muted" />
                                {task.liveDate || 'No date set'}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <p className={fieldLabel}>Comments</p>
                    {editing ? (
                        <textarea
                            value={form.comments || ''}
                            onChange={(e) => handleChange('comments', e.target.value)}
                            rows={4}
                            className="textarea-base w-full px-3 py-2 rounded-lg text-sm resize-none"
                            placeholder="Add comments..."
                        />
                    ) : (
                        <div className="glass-surface rounded-xl p-4 min-h-[80px]">
                            <p className="text-sm whitespace-pre-line leading-relaxed text-theme-secondary">
                                {task.comments || 'No comments yet.'}
                            </p>
                        </div>
                    )}
                </div>

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
                                <Tag className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-mono text-blue-500">{task.code}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-theme">
                    <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium danger-soft">
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>

                    <div className="flex gap-2">
                        {editing ? (
                            <>
                                <button
                                    onClick={() => { setForm({ ...task }); setEditing(false); }}
                                    className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold">
                                    <Save className="w-3.5 h-3.5" />
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setEditing(true)} className="btn-secondary px-4 py-2 rounded-xl text-sm font-semibold">
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
