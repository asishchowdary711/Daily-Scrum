import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

const priorityColors = {
    high: 'bg-rose-500',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
};

const IssueCard = ({ task, index, onClick }) => {
    const initials = (task.assignee || 'U')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => {
                        if (!snapshot.isDragging && onClick) onClick(task);
                    }}
                    className={clsx(
                        'glass-card p-4 mb-2.5 group cursor-grab active:cursor-grabbing transition-all duration-200',
                        snapshot.isDragging
                            ? 'shadow-2xl ring-1 ring-blue-500/40 scale-[1.02] rotate-1'
                            : 'hover:border-blue-500/25 hover:shadow-lg'
                    )}
                >
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-bold text-blue-500 bg-blue-500/15 px-2 py-0.5 rounded-md tracking-wide">
                            {task.code}
                        </span>
                        <div className="flex items-center gap-2">
                            <div className={clsx('priority-dot', priorityColors[task.priority] || priorityColors.medium)} title={`${task.priority} priority`} />
                        </div>
                    </div>

                    <h4 className="text-[13px] font-medium leading-snug mb-3 line-clamp-2 transition-colors text-theme-primary">
                        {task.title}
                    </h4>

                    {task.comments && (
                        <p className="text-[11px] mb-3 line-clamp-1 text-theme-muted">
                            {task.comments}
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-2.5 border-t border-theme">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-200">
                                {initials}
                            </div>
                            <span className="text-[11px] truncate max-w-[100px] text-theme-muted">{task.assignee}</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            {task.comments && (
                                <div className="flex items-center gap-0.5 text-theme-muted">
                                    <MessageSquare className="w-3 h-3" />
                                </div>
                            )}
                            {task.liveDate && (
                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">
                                    <Calendar className="w-3 h-3" />
                                    <span>{task.liveDate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default IssueCard;
