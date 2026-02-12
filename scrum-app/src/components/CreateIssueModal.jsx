/* eslint-disable react-hooks/set-state-in-effect */
import React, { useMemo, useState, useEffect } from 'react';
import Modal from './Modal';
import { clsx } from 'clsx';

const createInitialForm = (projectType) => ({
    title: '',
    code: '',
    status: projectType === 'kanban' ? 'todo' : 'open',
    priority: 'medium',
    assignee: '',
    liveDate: '',
    comments: '',
    area: '',
    description: '',
    responsible: '',
    nextAction: '',
});

const CreateIssueModal = ({ isOpen, onClose, onSubmit, projectType }) => {
    const [form, setForm] = useState(createInitialForm(projectType));

    useEffect(() => {
        if (isOpen) {
            setForm(createInitialForm(projectType));
        }
    }, [isOpen, projectType]);

    const statusOptions = useMemo(() => (
        projectType === 'kanban'
            ? [
                { value: 'todo', label: 'To Do' },
                { value: 'inprogress', label: 'In Progress' },
                { value: 'qa', label: 'Ready for QA' },
                { value: 'live', label: 'Live' },
                { value: 'done', label: 'Closed' },
            ]
            : [
                { value: 'open', label: 'Open' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'on-hold', label: 'On Hold' },
                { value: 'live', label: 'Live' },
                { value: 'closed', label: 'Closed' },
            ]
    ), [projectType]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onSubmit(form);
        onClose();
    };

    const inputClass = 'input-base w-full px-3 py-2.5 rounded-xl text-sm';
    const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-theme-muted';
    const selectClass = 'select-base w-full px-3 py-2.5 rounded-xl text-sm appearance-none cursor-pointer';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Issue" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>{projectType === 'kanban' ? 'Code / CR' : 'Area'}</label>
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
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Priority</label>
                        <select
                            value={form.priority}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            className={selectClass}
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
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

                <div>
                    <label className={labelClass}>Description / Comments</label>
                    <textarea
                        value={projectType === 'kanban' ? form.comments : form.description}
                        onChange={(e) => handleChange(projectType === 'kanban' ? 'comments' : 'description', e.target.value)}
                        placeholder="Add details..."
                        rows={3}
                        className={clsx('textarea-base w-full px-3 py-2.5 rounded-xl text-sm resize-none')}
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

                <div className="flex justify-end gap-3 pt-4 border-t border-theme">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!form.title.trim()}
                        className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Create Issue
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateIssueModal;
