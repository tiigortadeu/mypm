import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ListTodo, CheckCircle, Clock, AlertTriangle, Calendar, User, ArrowDownUp, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TaskModal from '../components/ui/CreateTaskModal';
import TaskSidebar from '../components/ui/TaskSidebar';
import { Task } from '../types';

type TaskStatus = 'all' | 'todo' | 'in-progress' | 'review' | 'completed';
type TaskPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent';
type GroupBy = 'none' | 'project' | 'status' | 'priority';

const TasksOverviewPage: React.FC = () => {
  const { projects, tasks, updateTask, deleteTask } = useProject();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority' | 'dueDate'>('dueDate');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Sidebar state
  const [sidebarTask, setSidebarTask] = useState<Task | null>(null);
  
  // Group expansion states
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Calculate metrics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && t.status !== 'completed';
  }).length;

  // Initialize project filter from URL parameter
  useEffect(() => {
    const projectParam = searchParams.get('project');
    if (projectParam && projects.some(p => p.id === projectParam)) {
      setProjectFilter(projectParam);
    }
  }, [searchParams, projects]);

  // Handle task completion toggle
  const handleToggleTaskCompletion = (
    taskId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    updateTask(taskId, { status: newStatus });
  };

  // Handle task click for sidebar preview
  const handleTaskClick = (task: Task) => {
    setSidebarTask(task); // Abre sidebar ao invés de modal
  };

  // Handle view task details navigation
  const handleViewTaskDetails = (taskId: string) => {
    navigate(`/tasks/id/${taskId}`);
    setSidebarTask(null); // Fecha sidebar
  };

  // Handle close sidebar
  const handleCloseSidebar = () => {
    setSidebarTask(null);
  };

  // Handle edit task (separate from click)
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
    }
  };

  // Handle group toggle
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Initialize expanded groups when groupBy changes
  React.useEffect(() => {
    if (groupBy !== 'none') {
      // Expand all groups by default
      const allGroups: Record<string, boolean> = {};
      Object.keys(groupedTasks).forEach(groupName => {
        allGroups[groupName] = true;
      });
      setExpandedGroups(allGroups);
    }
  }, [groupBy]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Always put completed tasks at the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // If both have same completion status, sort by selected criteria
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOrder === 'priority') {
        const priorityValues = { urgent: 3, high: 2, medium: 1, low: 0 };
        return priorityValues[b.priority] - priorityValues[a.priority];
      } else if (sortOrder === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });
  }, [filteredTasks, sortOrder]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': sortedTasks };
    }

    const grouped: Record<string, typeof sortedTasks> = {};

    sortedTasks.forEach(task => {
      let groupKey = '';
      
      if (groupBy === 'project') {
        const project = projects.find(p => p.id === task.projectId);
        groupKey = project?.title || 'Unknown Project';
      } else if (groupBy === 'status') {
        groupKey = task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ');
      } else if (groupBy === 'priority') {
        groupKey = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });

    return grouped;
  }, [sortedTasks, groupBy, projects]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'accent';
      case 'review':
        return 'warning';
      case 'todo':
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'accent';
      case 'low':
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
      case 'review':
        return 'Revisão';
      case 'todo':
      default:
        return 'A Fazer';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
      default:
        return 'Baixa';
    }
  };

  // Modal handlers
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handleCloseEditModal = () => setEditingTask(null);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header - Compact */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-semibold text-gray-900 dark:text-gray-50 mb-1">
          Tasks
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor and manage all tasks across projects
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
          <ListTodo className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {totalTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Total
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <Clock className="h-4 w-4 text-accent-600 dark:text-accent-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {inProgressTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            In Progress
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {completedTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Completed
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <Calendar className="h-4 w-4 text-warning-600 dark:text-warning-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {todoTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            To Do
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-error-600 dark:text-error-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {overdueTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Overdue
          </span>
        </div>
      </motion.div>

      {/* Filters and Search - Compact Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-2"
      >
        {/* Combined Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
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
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus)}
                className="px-2 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority)}
              className="px-2 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-2 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>

            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="px-2 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="none">No Grouping</option>
              <option value="project">Group by Project</option>
              <option value="status">Group by Status</option>
              <option value="priority">Group by Priority</option>
            </select>

            <div className="flex items-center gap-1">
              <ArrowDownUp className="h-4 w-4 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'priority' | 'dueDate')}
                className="px-2 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            <Button variant="primary" className="px-3 py-1.5 text-sm" onClick={handleOpenCreateModal}>
              Add Task
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tasks List - Minimalist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName} className="space-y-2">
            {/* Group Header - With expand/collapse if grouped */}
            <div className="flex items-center justify-between py-2">
              {groupBy !== 'none' ? (
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  {expandedGroups[groupName] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {groupName}
                </button>
              ) : (
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {groupName}
                </h3>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {/* Task Items - Only show if expanded or not grouped */}
            {(groupBy === 'none' || expandedGroups[groupName]) && (
              <div className="space-y-1">
                {groupTasks.length > 0 ? (
                  groupTasks.map((task, index) => {
                    const project = projects.find(p => p.id === task.projectId);
                    const taskIsOverdue = isOverdue(task.dueDate) && task.status !== 'completed';
                    const isCompleted = task.status === 'completed';

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleTaskClick(task)}
                        className={`group relative flex items-center py-3 px-4 rounded-lg transition-all duration-300 cursor-pointer border border-transparent ${
                          taskIsOverdue 
                            ? 'bg-error-50 dark:bg-error-900/20 hover:bg-error-100 dark:hover:bg-error-900/40 hover:border-error-200 dark:hover:border-error-800 hover:shadow-md hover:shadow-error-500/10'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-gray-500/10 hover:scale-[1.02]'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mr-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleTaskCompletion(task.id, task.status);
                            }}
                            className="w-4 h-4 text-success-600 bg-gray-100 dark:bg-gray-800 rounded focus:ring-success-500 focus:ring-2 cursor-pointer transition-colors duration-200"
                          />
                        </div>

                        {/* Task Content */}
                        <div className={`flex-1 min-w-0 ${isCompleted ? 'opacity-70' : ''}`}>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium truncate text-sm ${
                              isCompleted 
                                ? 'text-gray-500 dark:text-gray-500 line-through' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {task.title}
                            </h4>
                            {taskIsOverdue && (
                              <AlertTriangle className="h-3 w-3 text-error-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          {/* Description - Only if exists and task not completed */}
                          {task.description && !isCompleted && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Meta Information - Compact */}
                          <div className="flex items-center gap-2 text-xs mt-0.5">
                            {project && (
                              <Link 
                                to={`/projects/${project.id}`}
                                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 transition-colors duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-16">{project.title}</span>
                              </Link>
                            )}
                            {task.dueDate && (
                              <span className={`flex items-center gap-1 ${
                                taskIsOverdue 
                                  ? 'text-error-600 dark:text-error-400 font-medium' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(task.dueDate)}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Side: Badges and Actions - Ultra Compact */}
                        <div className={`flex items-center gap-2 ml-2 ${isCompleted ? 'opacity-70' : ''}`}>
                          {/* Compact Badges */}
                          <div className="flex items-center gap-1">
                            <Badge variant={getPriorityColor(task.priority)} className="text-xs px-1.5 py-0.5">
                              {getPriorityLabel(task.priority)}
                            </Badge>
                            {!isCompleted && (
                              <Badge variant={getStatusColor(task.status)} className="text-xs px-1.5 py-0.5">
                                {getStatusLabel(task.status)}
                              </Badge>
                            )}
                          </div>

                          {/* Quick Actions - Discrete */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                              className="p-1 rounded text-gray-400 transition-colors duration-200"
                              title="Edit task"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="p-1 rounded text-gray-400 transition-colors duration-200"
                              title="Delete task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    No tasks in this group
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <ListTodo className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first task.'}
          </p>
          <Button variant="primary" onClick={handleOpenCreateModal}>
            Create New Task
          </Button>
        </motion.div>
      )}

      {/* Create Task Modal */}
      <TaskModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        mode="create"
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal 
          isOpen={!!editingTask}
          onClose={handleCloseEditModal}
          task={editingTask}
          mode="edit"
        />
      )}

      {/* Task Sidebar */}
      <TaskSidebar
        task={sidebarTask}
        isOpen={!!sidebarTask}
        onClose={handleCloseSidebar}
        onViewDetails={handleViewTaskDetails}
      />
    </div>
  );
};

export default TasksOverviewPage; 