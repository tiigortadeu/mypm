import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus,
  Filter,
  Calendar,
  AlertTriangle,
  ListTodo,
  CheckCircle,
  Search,
  SortAsc,
} from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import TabNavigation, { TabItem } from '../ui/TabNavigation';
import { Task, Milestone } from '../../types';

interface ProjectMilestonesTabProps {
  projectId: string;
  projectTasks: Task[];
  projectMilestones: Milestone[];
  formatDate: (dateString?: string) => string;
  getMilestoneStatusColor: (status: string) => string;
  focus?: 'tasks' | 'milestones' | null;
}

const ProjectMilestonesTab: React.FC<ProjectMilestonesTabProps> = ({
  projectId,
  projectTasks,
  projectMilestones,
  formatDate,
  getMilestoneStatusColor,
  focus = null,
}) => {
  // Local state for current view and filters
  const [currentView, setCurrentView] = useState<'tasks' | 'milestones'>(() => {
    // Initialize based on focus prop or default to milestones
    return focus === 'tasks' ? 'tasks' : 'milestones';
  });
  const [milestoneStatusFilter, setMilestoneStatusFilter] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'title'>('dueDate');

  // Update current view when focus prop changes
  React.useEffect(() => {
    if (focus) {
      setCurrentView(focus);
    }
  }, [focus]);

  // Internal tab configuration
  const internalTabs: TabItem[] = [
    {
      id: 'tasks',
      label: 'Tarefas',
      icon: ListTodo,
      badge: projectTasks.length > 0 ? projectTasks.length : undefined,
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Target,
      badge: projectMilestones.length > 0 ? projectMilestones.length : undefined,
    },
  ];

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = projectTasks.filter(task => {
      const statusMatch = taskStatusFilter === 'all' || task.status === taskStatusFilter;
      const priorityMatch = taskPriorityFilter === 'all' || task.priority === taskPriorityFilter;
      const searchMatch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return statusMatch && priorityMatch && searchMatch;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 4);
        case 'status':
          const statusOrder = { todo: 0, 'in-progress': 1, review: 2, completed: 3 };
          return (statusOrder[a.status as keyof typeof statusOrder] || 4) - 
                 (statusOrder[b.status as keyof typeof statusOrder] || 4);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projectTasks, taskStatusFilter, taskPriorityFilter, searchQuery, sortBy]);

  // Filter milestones with search
  const filteredMilestones = useMemo(() => {
    return projectMilestones.filter(milestone => {
      const statusMatch = milestoneStatusFilter === 'all' || milestone.status === milestoneStatusFilter;
      const searchMatch = searchQuery === '' || 
        milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (milestone.description && milestone.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return statusMatch && searchMatch;
    }).sort((a, b) => {
      // Sort milestones by due date
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [projectMilestones, milestoneStatusFilter, searchQuery]);

  // Helper function to check if task is overdue
  const isTaskOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'accent';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'review': return 'accent';
      case 'todo': return 'default';
      default: return 'default';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in-progress': return 'Em Progresso';
      case 'review': return 'Revisão';
      case 'todo': return 'A Fazer';
      default: return status;
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Internal Tabs */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Tarefas & Milestones
        </h2>
        
        <TabNavigation
          tabs={internalTabs}
          activeTab={currentView}
          onTabChange={(tabId) => setCurrentView(tabId as 'tasks' | 'milestones')}
          variant="compact"
        />
      </motion.div>

      {/* Search Bar - Universal */}
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Buscar ${currentView === 'tasks' ? 'tarefas' : 'milestones'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-transparent focus:border-primary-300 dark:focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm"
          />
        </div>
      </motion.div>

      {/* Tasks View */}
      <AnimatePresence mode="wait">
        {currentView === 'tasks' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Task Filters */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="todo">A Fazer</option>
                  <option value="in-progress">Em Progresso</option>
                  <option value="review">Revisão</option>
                  <option value="completed">Concluído</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prioridade:</span>
                <select
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="all">Todas</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <SortAsc className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'status' | 'title')}
                  className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="dueDate">Data Limite</option>
                  <option value="priority">Prioridade</option>
                  <option value="status">Status</option>
                  <option value="title">Título</option>
                </select>
              </div>
            </motion.div>

            {/* Tasks Grid */}
            {filteredTasks.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <AnimatePresence>
                  {filteredTasks.map((task, index) => {
                    const taskIsOverdue = isTaskOverdue(task.dueDate) && task.status !== 'completed';
                    const isCompleted = task.status === 'completed';

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          delay: 0.1 * (index % 6), // Stagger animation for first 6 items
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          transition: { duration: 0.2 }
                        }}
                        className={`p-6 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer ${
                          taskIsOverdue ? 'border-l-4 border-error-500' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-lg mb-2 ${
                              isCompleted 
                                ? 'text-gray-500 dark:text-gray-500 line-through' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                                {task.description}
                              </p>
                            )}
                          </div>
                          {taskIsOverdue && (
                            <AlertTriangle className="h-5 w-5 text-error-500 flex-shrink-0 ml-2" />
                          )}
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {/* Status and Priority Badges */}
                          <div className="flex justify-center gap-2">
                            <Badge variant={getStatusColor(task.status) as any} className="px-3 py-1">
                              {getStatusLabel(task.status)}
                            </Badge>
                            <Badge variant={getPriorityColor(task.priority) as any} className="px-3 py-1">
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                          
                          {/* Due Date */}
                          {task.dueDate && (
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className={`${
                                taskIsOverdue 
                                  ? 'text-error-600 dark:text-error-400 font-medium' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {formatDate(task.dueDate)}
                                {taskIsOverdue && ' (Atrasada)'}
                              </span>
                            </div>
                          )}

                          {/* Estimated Hours */}
                          {task.estimatedHours && (
                            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                              {task.estimatedHours}h estimadas
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ListTodo className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">
                  {projectTasks.length === 0 
                    ? 'Nenhuma tarefa ainda'
                    : searchQuery ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa corresponde aos filtros'
                  }
                </h3>
                <p className="text-sm mb-4">
                  {projectTasks.length === 0 
                    ? 'Adicione sua primeira tarefa para começar a organizar o trabalho.'
                    : searchQuery ? `Não encontramos tarefas com "${searchQuery}". Tente termos diferentes.`
                    : 'Tente ajustar os filtros para ver outras tarefas.'
                  }
                </p>
                {projectTasks.length === 0 && (
                  <Button variant="primary" leftIcon={<Plus size={16} />}>
                    Adicionar Tarefa
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestones View */}
      <AnimatePresence mode="wait">
        {currentView === 'milestones' && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Milestone Filters */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <select
                  value={milestoneStatusFilter}
                  onChange={(e) => setMilestoneStatusFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="planning">Planejado</option>
                  <option value="in-progress">Em Progresso</option>
                  <option value="completed">Concluído</option>
                  <option value="overdue">Atrasado</option>
                </select>
              </div>
            </motion.div>

            {/* Milestones Grid */}
            {filteredMilestones.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <AnimatePresence>
                  {filteredMilestones.map((milestone, index) => {
                    // Calculate milestone task progress
                    const milestoneTasks = projectTasks.filter(t => t.milestoneId === milestone.id);
                    const completedMilestoneTasks = milestoneTasks.filter(t => t.status === 'completed');
                    const taskProgress = milestoneTasks.length > 0 
                      ? (completedMilestoneTasks.length / milestoneTasks.length) * 100 
                      : 0;

                    // Check if milestone is overdue
                    const isOverdue = milestone.status !== 'completed' && milestone.dueDate && new Date(milestone.dueDate) < new Date();

                    return (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          delay: 0.1 * (index % 6), // Stagger animation for first 6 items
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          transition: { duration: 0.2 }
                        }}
                        className={`p-6 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer ${
                          isOverdue ? 'border-l-4 border-error-500' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                              {milestone.title}
                            </h3>
                            {milestone.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                          {isOverdue && (
                            <AlertTriangle className="h-5 w-5 text-error-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {/* Status Badge */}
                          <div className="flex justify-center">
                            <Badge variant={getMilestoneStatusColor(milestone.status) as any} className="px-3 py-1">
                              {milestone.status === 'completed' ? 'Concluído' :
                               milestone.status === 'in-progress' ? 'Em Progresso' :
                               milestone.status === 'overdue' ? 'Atrasado' : 'Planejado'}
                            </Badge>
                          </div>

                          {/* Task Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progresso das Tarefas</span>
                              <span className="font-medium">{completedMilestoneTasks.length}/{milestoneTasks.length}</span>
                            </div>
                            <ProgressBar value={taskProgress} size="sm" />
                          </div>
                          
                          {/* Due Date */}
                          {milestone.dueDate && (
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className={`${
                                isOverdue 
                                  ? 'text-error-600 dark:text-error-400 font-medium' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {formatDate(milestone.dueDate)}
                                {isOverdue && ' (Atrasado)'}
                              </span>
                            </div>
                          )}

                          {/* Task Count */}
                          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                            {milestoneTasks.length} {milestoneTasks.length === 1 ? 'tarefa' : 'tarefas'} associadas
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Target className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">
                  {projectMilestones.length === 0 
                    ? 'Nenhum milestone ainda'
                    : searchQuery ? 'Nenhum milestone encontrado' : 'Nenhum milestone corresponde ao filtro'
                  }
                </h3>
                <p className="text-sm mb-4">
                  {projectMilestones.length === 0 
                    ? 'Adicione seu primeiro milestone para organizar o projeto em marcos importantes.'
                    : searchQuery ? `Não encontramos milestones com "${searchQuery}". Tente termos diferentes.`
                    : 'Tente ajustar os filtros para ver outros milestones.'
                  }
                </p>
                {projectMilestones.length === 0 && (
                  <Button variant="primary" leftIcon={<Plus size={16} />}>
                    Adicionar Milestone
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectMilestonesTab; 