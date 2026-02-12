import React, { useState, useCallback } from 'react';
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
  const [kanbanNewTasks, setKanbanNewTasks] = useState([]);
  const [tableNewItems, setTableNewItems] = useState([]);

  const currentProject = initialData.projects.find(p => p.id === activeProjectId)
    || initialData.projects[0];

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
      setKanbanNewTasks(prev => [...prev, newTask]);
      return;
    }

    if (currentProject?.type === 'table') {
      const newItem = {
        id: `new-${timestamp}`,
        area: formData.area || formData.title,
        title: formData.title,
        description: formData.description || '',
        status: formData.status || 'open',
        statusRaw: formData.status,
        responsible: formData.assignee || '',
        assignee: formData.assignee || '',
        nextAction: formData.nextAction || '',
        dateRaised: new Date().toISOString().split('T')[0],
        targetDate: formData.liveDate || '',
        comment: formData.comments || '',
        priority: formData.priority || 'medium',
      };
      setTableNewItems(prev => [...prev, newItem]);
    }
  }, [currentProject]);

  const canCreateIssue = currentProject?.type === 'kanban' || currentProject?.type === 'table';

  return (
    <ProtectedRoute>
      <Layout
        projects={initialData.projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        onCreateIssue={() => canCreateIssue && setShowCreateModal(true)}
        canCreateIssue={canCreateIssue}
        authUser={user}
      >
        {({ searchQuery }) => (
          <>
            {currentProject?.type === 'kanban' && (
              <KanbanBoard
                key={currentProject.id}
                initialData={currentProject}
                searchQuery={searchQuery}
                externalNewTasks={kanbanNewTasks}
              />
            )}
            {currentProject?.type === 'table' && (
              <TableView
                data={{
                  ...currentProject,
                  items: [...(currentProject.items || []), ...tableNewItems],
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

      {canCreateIssue && (
        <CreateIssueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateIssue}
          projectType={currentProject?.type}
        />
      )}
    </ProtectedRoute>
  );
}

export default App;
