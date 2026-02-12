/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import IssueCard from './IssueCard';
import IssueDetailModal from './IssueDetailModal';
import { clsx } from 'clsx';

const KanbanBoard = ({ initialData, searchQuery = '', externalNewTasks = [] }) => {
    const [data, setData] = useState(initialData);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (externalNewTasks.length === 0) return;

        const latest = externalNewTasks[externalNewTasks.length - 1];

        setData((prev) => {
            if (prev.tasks[latest.id]) return prev;

            return {
                ...prev,
                tasks: { ...prev.tasks, [latest.id]: latest },
                columns: prev.columns.map(col => (
                    col.id === latest.status
                        ? { ...col, taskIds: [...col.taskIds, latest.id] }
                        : col
                )),
            };
        });
    }, [externalNewTasks]);

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const q = searchQuery.toLowerCase();
        const matchingTaskIds = Object.values(data.tasks)
            .filter(t =>
                t.title.toLowerCase().includes(q)
                || t.code.toLowerCase().includes(q)
                || (t.comments || '').toLowerCase().includes(q)
                || (t.assignee || '').toLowerCase().includes(q)
            )
            .map(t => t.id);

        return {
            ...data,
            columns: data.columns.map(col => ({
                ...col,
                taskIds: col.taskIds.filter(id => matchingTaskIds.includes(id)),
            })),
        };
    }, [data, searchQuery]);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const start = data.columns.find(col => col.id === source.droppableId);
        const finish = data.columns.find(col => col.id === destination.droppableId);

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);
            setData({
                ...data,
                columns: data.columns.map(col => (col.id === start.id ? { ...col, taskIds: newTaskIds } : col)),
            });
            return;
        }

        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);

        const updatedTasks = {
            ...data.tasks,
            [draggableId]: { ...data.tasks[draggableId], status: finish.id },
        };

        setData({
            ...data,
            tasks: updatedTasks,
            columns: data.columns.map(col => {
                if (col.id === start.id) return { ...col, taskIds: startTaskIds };
                if (col.id === finish.id) return { ...col, taskIds: finishTaskIds };
                return col;
            }),
        });
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleUpdateTask = (updatedTask) => {
        const oldStatus = data.tasks[updatedTask.id]?.status;
        const newStatus = updatedTask.status;

        let newColumns = data.columns;
        if (oldStatus !== newStatus) {
            newColumns = data.columns.map(col => {
                if (col.id === oldStatus) return { ...col, taskIds: col.taskIds.filter(id => id !== updatedTask.id) };
                if (col.id === newStatus) return { ...col, taskIds: [...col.taskIds, updatedTask.id] };
                return col;
            });
        }

        setData({
            ...data,
            tasks: { ...data.tasks, [updatedTask.id]: updatedTask },
            columns: newColumns,
        });
        setSelectedTask(updatedTask);
    };

    const handleDeleteTask = (taskId) => {
        const taskStatus = data.tasks[taskId]?.status;
        const newTasks = { ...data.tasks };
        delete newTasks[taskId];

        setData({
            ...data,
            tasks: newTasks,
            columns: data.columns.map(col => (
                col.id === taskStatus
                    ? { ...col, taskIds: col.taskIds.filter(id => id !== taskId) }
                    : col
            )),
        });
        setSelectedTask(null);
    };

    const totalTasks = Object.keys(data.tasks).length;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-6 mb-6">
                {filteredData.columns.map((column) => {
                    const count = column.taskIds.length;
                    return (
                        <div key={column.id} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                            <span className="text-xs font-medium text-theme-muted">{column.title}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold text-theme-muted" style={{ backgroundColor: 'var(--bg-surface)' }}>
                                {count}
                            </span>
                        </div>
                    );
                })}
                <div className="ml-auto text-xs text-theme-muted">
                    Total: <span className="font-semibold text-theme-primary">{totalTasks}</span> items
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
                    {filteredData.columns.map((column) => {
                        const tasks = column.taskIds
                            .map(taskId => filteredData.tasks[taskId] || data.tasks[taskId])
                            .filter(Boolean);

                        return (
                            <div key={column.id} className="w-[300px] min-w-[300px] flex flex-col rounded-2xl glass-surface overflow-hidden">
                                <div className="px-4 py-3 flex items-center gap-3 border-b border-theme">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
                                    <h3 className="text-sm font-semibold uppercase tracking-wider flex-1 text-theme-secondary">
                                        {column.title}
                                    </h3>
                                    <span className="text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center text-theme-muted" style={{ backgroundColor: 'var(--bg-surface)' }}>
                                        {tasks.length}
                                    </span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={clsx(
                                                'flex-1 p-2.5 overflow-y-auto transition-colors duration-200 min-h-[100px]',
                                                snapshot.isDraggingOver && 'bg-blue-500/10'
                                            )}
                                        >
                                            {tasks.map((task, index) => (
                                                <IssueCard
                                                    key={task.id}
                                                    task={task}
                                                    index={index}
                                                    onClick={() => handleTaskClick(task)}
                                                />
                                            ))}
                                            {provided.placeholder}

                                            {tasks.length === 0 && !snapshot.isDraggingOver && (
                                                <div className="flex items-center justify-center h-20 text-xs border border-dashed border-theme rounded-xl text-theme-muted">
                                                    Drop items here
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            <IssueDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
};

export default KanbanBoard;
