import React, { useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import IssueCard from './IssueCard';
import IssueDetailModal from './IssueDetailModal';
import { clsx } from 'clsx';

// Finding 8: KanbanBoard now receives lifted state from App
const KanbanBoard = ({ projectId, boardState, onBoardChange, searchQuery = '' }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const data = boardState;

    // Wrapper to update both local and parent state
    const updateBoard = useCallback((newState) => {
        onBoardChange(projectId, newState);
    }, [projectId, onBoardChange]);

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const q = searchQuery.toLowerCase();
        const matchingTaskIds = Object.values(data.tasks)
            .filter(t =>
                t.title.toLowerCase().includes(q) ||
                (t.code || '').toLowerCase().includes(q) ||
                (t.comments || '').toLowerCase().includes(q) ||
                (t.assignee || '').toLowerCase().includes(q)
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
            updateBoard({
                ...data,
                columns: data.columns.map(col => col.id === start.id ? { ...col, taskIds: newTaskIds } : col),
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

        updateBoard({
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

        updateBoard({
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

        updateBoard({
            ...data,
            tasks: newTasks,
            columns: data.columns.map(col =>
                col.id === taskStatus
                    ? { ...col, taskIds: col.taskIds.filter(id => id !== taskId) }
                    : col
            ),
        });
        setSelectedTask(null);
    };

    const totalTasks = Object.keys(data.tasks).length;

    return (
        <div className="h-full flex flex-col">
            {/* Stats bar */}
            <div className="flex items-center gap-6 mb-6">
                {filteredData.columns.map(column => {
                    const count = column.taskIds.length;
                    return (
                        <div key={column.id} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                            <span className="text-xs text-slate-400 font-medium">{column.title}</span>
                            <span className="text-xs text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded-md font-bold">
                                {count}
                            </span>
                        </div>
                    );
                })}
                <div className="ml-auto text-xs text-slate-500">
                    Total: <span className="text-slate-300 font-semibold">{totalTasks}</span> items
                </div>
            </div>

            {/* Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
                    {filteredData.columns.map((column) => {
                        const tasks = column.taskIds
                            .map(taskId => filteredData.tasks[taskId] || data.tasks[taskId])
                            .filter(Boolean);

                        return (
                            <div key={column.id} className="w-[300px] min-w-[300px] flex flex-col rounded-2xl glass-surface overflow-hidden">
                                {/* Column Header */}
                                <div className="px-4 py-3 flex items-center gap-3 border-b border-white/[0.04]">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
                                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex-1">
                                        {column.title}
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500 bg-white/[0.06] w-6 h-6 rounded-lg flex items-center justify-center">
                                        {tasks.length}
                                    </span>
                                </div>

                                {/* Droppable area */}
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={clsx(
                                                "flex-1 p-2.5 overflow-y-auto transition-colors duration-200 min-h-[100px]",
                                                snapshot.isDraggingOver && "bg-blue-500/[0.03]"
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
                                                <div className="flex items-center justify-center h-20 text-xs text-slate-600 border border-dashed border-white/[0.06] rounded-xl">
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

            {/* Issue Detail Modal */}
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
