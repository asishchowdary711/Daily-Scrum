import React, { useState, useCallback, useMemo } from 'react';
import Layout from './components/Layout';
import KanbanBoard from './components/KanbanBoard';
import TableView from './components/TableView';
import SimpleListView from './components/SimpleListView';
import CreateIssueModal from './components/CreateIssueModal';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';
import { initialData } from './data/initialData';

function App() {
  const { user } = useAuth();
  const [activeProjectId, setActiveProjectId] = useState(
    initialData.projects[0]?.id || 'cortex'
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Finding 8: Lifted board state — keyed by project ID, persisted across switches
  const [boardStates, setBoardStates] = useState(() => {
    const states = {};
    initialData.projects.forEach(p => {
      if (p.type === 'kanban') {
        states[p.id] = { tasks: { ...p.tasks }, columns: p.columns.map(c => ({ ...c, taskIds: [...c.taskIds] })) };
      }
    });
    return states;
  });

  // Finding 8: table items state keyed by project
  const [tableItemStates, setTableItemStates] = useState(() => {
    const states = {};
    initialData.projects.forEach(p => {
      if (p.type === 'table') {
        states[p.id] = [...(p.items || [])];
      }
    });
    return states;
  });

  const currentProject = initialData.projects.find(p => p.id === activeProjectId)
    || initialData.projects[0];

  // Finding 9: compute live counts from mutable state
  const liveCounts = useMemo(() => {
    const counts = {};
    initialData.projects.forEach(p => {
      if (p.type === 'kanban' && boardStates[p.id]) {
        counts[p.id] = Object.keys(boardStates[p.id].tasks).length;
      } else if (p.type === 'table' && tableItemStates[p.id]) {
        counts[p.id] = tableItemStates[p.id].length;
      } else if (p.items) {
        counts[p.id] = p.items.length;
      } else {
        counts[p.id] = 0;
      }
    });
    return counts;
  }, [boardStates, tableItemStates]);

  const handleBoardChange = useCallback((projectId, newBoardState) => {
    setBoardStates(prev => ({ ...prev, [projectId]: newBoardState }));
  }, []);

  const handleCreateIssue = useCallback((formData) => {
    const timestamp = Date.now();

    if (currentProject?.type === 'kanban') {
      const newTask = {
        id: `new-${timestamp}`,
        code: formData.code || `NEW-${timestamp.toString().slice(-4)}`,
        title: formData.title,
        status: formData.status || 'todo',
        assignee: formData.assignee || 'Unassigned',
        liveDate: formData.liveDate || '',
        comments: formData.comments || '',
        priority: formData.priority || 'medium',
      };
      setBoardStates(prev => {
        const board = prev[currentProject.id];
        if (!board) return prev;
        return {
          ...prev,
          [currentProject.id]: {
            tasks: { ...board.tasks, [newTask.id]: newTask },
            columns: board.columns.map(col =>
              col.id === newTask.status
                ? { ...col, taskIds: [...col.taskIds, newTask.id] }
                : col
            ),
          },
        };
      });
    } else if (currentProject?.type === 'table') {
      const newItem = {
        id: `new-${timestamp}`,
        area: formData.area || formData.title,
        title: formData.title,
        description: formData.description || '',
        status: formData.status === 'todo' ? 'open' : formData.status,
        statusRaw: formData.status,
        responsible: formData.assignee || '',
        assignee: formData.assignee || '',
        nextAction: formData.nextAction || '',
        dateRaised: new Date().toISOString().split('T')[0],
        targetDate: formData.liveDate || '',
        comment: formData.comments || '',
        priority: formData.priority || 'medium',
      };
      setTableItemStates(prev => ({
        ...prev,
        [currentProject.id]: [...(prev[currentProject.id] || []), newItem],
      }));
    }
  }, [currentProject]);

  return (
    <ProtectedRoute>
      <Layout
        projects={initialData.projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        onCreateIssue={currentProject?.type !== 'simple' ? () => setShowCreateModal(true) : null}
        authUser={user}
        liveCounts={liveCounts}
      >
        {({ searchQuery }) => (
          <>
            {currentProject?.type === 'kanban' && boardStates[currentProject.id] && (
              <KanbanBoard
                projectId={currentProject.id}
                boardState={boardStates[currentProject.id]}
                onBoardChange={handleBoardChange}
                searchQuery={searchQuery}
              />
            )}
            {currentProject?.type === 'table' && (
              <TableView
                data={{
                  ...currentProject,
                  items: tableItemStates[currentProject.id] || currentProject.items || [],
                }}
                searchQuery={searchQuery}
              />
            )}
            {currentProject?.type === 'simple' && (
              <SimpleListView
                data={currentProject}
                searchQuery={searchQuery}
              />
            )}
          </>
        )}
      </Layout>

      <CreateIssueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateIssue}
        projectType={currentProject?.type}
      />
    </ProtectedRoute>
  );
}

export default App;
