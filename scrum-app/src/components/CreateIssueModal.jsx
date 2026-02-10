import React, { useState } from 'react';
import Modal from './Modal';
import { clsx } from 'clsx';

const CreateIssueModal = ({ isOpen, onClose, onSubmit, projectType }) => {
    const [form, setForm] = useState({
        title: '',
        code: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        liveDate: '',
        comments: '',
        area: '',
        description: '',
        responsible: '',
        nextAction: '',
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSubmit(form);
        setForm({
            title: '', code: '', status: 'todo', priority: 'medium',
            assignee: '', liveDate: '', comments: '', area: '',
            description: '', responsible: '', nextAction: '',
        });
        onClose();
    };

    const inputClass = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all";
    const labelClass = "block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5";
    const selectClass = "w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all appearance-none cursor-pointer";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Issue" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label className={labelClass}>Title *</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter issue title..."
                        className={inputClass}
                        autoFocus
                    />
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>
                            {projectType === 'kanban' ? 'Code / CR' : 'Area'}
                        </label>
                        <input
                            type="text"
                            value={projectType === 'kanban' ? form.code : form.area}
                            onChange={(e) => handleChange(projectType === 'kanban' ? 'code' : 'area', e.target.value)}
                            placeholder={projectType === 'kanban' ? 'e.g. FBFM-200' : 'e.g. Security'}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Assignee</label>
                        <input
                            type="text"
                            value={form.assignee}
                            onChange={(e) => handleChange('assignee', e.target.value)}
                            placeholder="e.g. Raj"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className={selectClass}
                        >
                            <option value="todo">To Do</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="on-hold">On Hold</option>
                            <option value="live">Live</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Priority</label>
                        <select
                            value={form.priority}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            className={selectClass}
                        >
                            <option value="high">🔴 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Due Date</label>
                        <input
                            type="date"
                            value={form.liveDate}
                            onChange={(e) => handleChange('liveDate', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Description / Comments</label>
                    <textarea
                        value={form.comments || form.description}
                        onChange={(e) => handleChange(projectType === 'kanban' ? 'comments' : 'description', e.target.value)}
                        placeholder="Add details..."
                        rows={3}
                        className={clsx(inputClass, "resize-none")}
                    />
                </div>

                {projectType === 'table' && (
                    <div>
                        <label className={labelClass}>Next Action</label>
                        <input
                            type="text"
                            value={form.nextAction}
                            onChange={(e) => handleChange('nextAction', e.target.value)}
                            placeholder="What's the next step?"
                            className={inputClass}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!form.title.trim()}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                        Create Issue
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateIssueModal;
