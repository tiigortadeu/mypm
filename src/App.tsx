import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProjectsOverviewPage from './pages/ProjectsOverviewPage';
import TasksOverviewPage from './pages/TasksOverviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProjectDetail from './pages/ProjectDetail';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="projects" element={<ProjectsOverviewPage />} />
        <Route path="tasks" element={<TasksOverviewPage />} />
        <Route path="tasks/id/:taskId" element={<TaskDetailPage />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/tasks" element={<TasksPage />} />
      </Route>
    </Routes>
  );
}

export default App;
