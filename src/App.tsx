import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProjectsOverview from './components/dashboard/ProjectsOverview';
import ProjectDetail from './pages/ProjectDetail';
import TasksPage from './pages/TasksPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/tasks" element={<TasksPage />} />
      </Route>
    </Routes>
  );
}

export default App;
