import React, { useState, useMemo } from 'react';
import { Search, Filter, Folder, TrendingUp, Calendar, CheckCircle, BarChart2, ArrowDownUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import CreateProjectModal from '../components/ui/CreateProjectModal';

const ProjectsOverviewPage: React.FC = () => {
  const { projects, calculateDynamicProgress, tasks } = useProject();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'progress' | 'deadline'>('newest');
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  // Calculate metrics
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;
  
  // Calculate average dynamic progress
  const averageProgress = useMemo(() => {
    if (totalProjects === 0) return 0;
    const totalProgress = projects.reduce((sum, project) => {
      return sum + calculateDynamicProgress(project.id);
    }, 0);
    return Math.round(totalProgress / totalProjects);
  }, [projects, calculateDynamicProgress, totalProjects]);

  // Helper functions
  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId).length;
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'progress':
          return calculateDynamicProgress(b.id) - calculateDynamicProgress(a.id);
        case 'deadline':
          // For now, sort by updated date as deadline placeholder
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, statusFilter, sortOrder, calculateDynamicProgress]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'accent';
      case 'planning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in-progress':
        return 'Em Andamento';
      case 'planning':
        return 'Planejamento';
      default:
        return status;
    }
  };

  // Handlers for modal
  const handleOpenCreateProjectModal = () => {
    setIsCreateProjectModalOpen(true);
  };

  const handleCloseCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header - Compact */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-semibold text-gray-900 dark:text-gray-50 mb-1">
          Projects
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage and monitor all your projects
        </p>
      </div>

      {/* Metrics Cards - Inline Format */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <Folder className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {totalProjects}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Total
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <TrendingUp className="h-4 w-4 text-accent-600 dark:text-accent-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {inProgressProjects}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Active
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <Calendar className="h-4 w-4 text-warning-600 dark:text-warning-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {planningProjects}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Planning
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {completedProjects}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Completed
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <BarChart2 className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {averageProgress}%
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Avg Progress
          </span>
        </div>
      </motion.div>

      {/* Filters and Search - Compact Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {/* Combined Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1.5 w-full rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <ArrowDownUp className="h-4 w-4 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'progress' | 'deadline')}
                className="px-2 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="progress">Progress</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>

            <Button variant="primary" className="px-3 py-1.5 text-sm" onClick={handleOpenCreateProjectModal}>
              Add Project
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Projects List - Minimalist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          {/* Project List Header */}
          <div className="flex items-center justify-between py-2">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              All Projects
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {/* Project Items */}
          <div className="space-y-1">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => {
                const dynamicProgress = calculateDynamicProgress(project.id);
                const taskCount = getProjectTaskCount(project.id);

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => handleProjectClick(project.id)}
                    className="group relative flex items-center py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-500/10 hover:scale-[1.02]"
                  >
                    {/* Project Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate text-sm text-gray-900 dark:text-gray-100">
                          {project.title}
                        </h4>
                      </div>
                      
                      {/* Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                        {project.description}
                      </p>
                      
                      {/* Meta Information */}
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(project.createdAt)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                        </span>
                        {project.budget && (
                          <span className="text-gray-500 dark:text-gray-400">
                            ${project.budget.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Side: Progress and Badges */}
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-20">
                        <ProgressBar value={dynamicProgress} size="sm" />
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                        {dynamicProgress}%
                      </div>
                      <Badge variant={getStatusColor(project.status)} className="text-xs px-1.5 py-0.5">
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                No projects found
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Folder className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first project.'}
          </p>
          <Button variant="primary" onClick={handleOpenCreateProjectModal}>
            Create New Project
          </Button>
        </motion.div>
      )}

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={handleCloseCreateProjectModal}
        />
      )}
    </div>
  );
};

export default ProjectsOverviewPage; 