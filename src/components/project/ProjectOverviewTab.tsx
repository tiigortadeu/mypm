import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Target,
  Edit,
  TrendingUp,
  CheckCircle,
  ListTodo,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import Separator from '../ui/Separator';
import CreateTaskModal from '../ui/CreateTaskModal';
import { Project, Task, Milestone } from '../../types';
import { useProject } from '../../contexts/ProjectContext';

interface ProjectOverviewTabProps {
  project: Project;
  taskProgress: number;
  milestoneProgress: number;
  completedTasks: number;
  totalTasks: number;
  completedMilestones: number;
  totalMilestones: number;
  urgentTasks: { length: number };
  overdueMilestones: { length: number };
  formatDate: (dateString?: string) => string;
  projectTasks: Task[];
  projectMilestones: Milestone[];
  handleTabChange: (tabId: string) => void;
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  taskProgress,
  milestoneProgress,
  completedTasks,
  totalTasks,
  completedMilestones,
  totalMilestones,
  urgentTasks,
  overdueMilestones,
  formatDate,
  projectTasks,
  projectMilestones,
  handleTabChange,
}) => {
  // Use Project context for task updates
  const { updateTask } = useProject();

  // State for modals and loading
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [loadingTaskIds, setLoadingTaskIds] = useState<Set<string>>(new Set());
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [taskActionLoading, setTaskActionLoading] = useState<string | null>(null);
  const [taskCompletionHighlight, setTaskCompletionHighlight] = useState<string | null>(null);

  // Detect user preference for reduced motion
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Helper function para verificar se uma tarefa está atrasada
  const isOverdue = useCallback((dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, []);

  // Handle task completion toggle with loading and success feedback
  const handleToggleTaskCompletion = useCallback(async (
    taskId: string,
    currentStatus: string
  ) => {
    setLoadingTaskIds(prev => new Set(prev).add(taskId));
    
    try {
      // Simulate network delay for better UX demonstration
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      updateTask(taskId, { status: newStatus });
      
      // Show success feedback
      if (newStatus === 'completed') {
        setCompletedTaskIds(prev => new Set(prev).add(taskId));
        setTimeout(() => {
          setCompletedTaskIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }, 2000);
      }
    } finally {
      setLoadingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, [updateTask]);

  // Quick Actions handlers with optimized callbacks
  const handleOpenCreateTaskModal = useCallback(() => {
    setIsCreateTaskModalOpen(true);
  }, []);

  const handleCloseCreateTaskModal = useCallback(() => {
    setIsCreateTaskModalOpen(false);
  }, []);

  const handleNavigateToTasks = useCallback(() => {
    // Navigate to tasks-milestones tab with tasks focus
    handleTabChange('tasks-milestones?focus=tasks');
  }, [handleTabChange]);

  const handleNavigateToMilestones = useCallback(() => {
    // Navigate to tasks-milestones tab with milestones focus
    handleTabChange('tasks-milestones?focus=milestones');
  }, [handleTabChange]);

  // Memoized computations for performance
  const urgentAndOverdueTasks = useMemo(() => {
    return projectTasks
      .filter(task => 
        (task.priority === 'urgent' || isOverdue(task.dueDate)) && 
        task.status !== 'completed'
      )
      .slice(0, 10);
  }, [projectTasks, isOverdue]);

  const upcomingMilestones = useMemo(() => {
    return projectMilestones
      .filter(milestone => milestone.status !== 'completed')
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 3);
  }, [projectMilestones]);

  // Get milestone status color with memoization
  const getMilestoneStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  // Enhanced hover animation variants - Softer and more elegant
  const cardHoverVariants = {
    hover: {
      scale: 1.005, // Reduced from 1.01
      y: -0.5, // Reduced from -1
      transition: {
        type: "spring",
        stiffness: 300, // Reduced from 400
        damping: 25 // Reduced from 30
      }
    },
    tap: {
      scale: 0.995, // Adjusted accordingly
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const milestoneCardVariants = {
    hover: {
      scale: 1.003, // Reduced from 1.01
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)", // Softer shadow
      transition: {
        type: "spring",
        stiffness: 250, // Reduced from 300
        damping: 25
      }
    }
  };

  const checkboxVariants = {
    checked: {
      scale: [1, 1.15, 1], // Reduced from 1.2
      transition: {
        duration: 0.25, // Slightly faster
        ease: "easeInOut"
      }
    },
    unchecked: {
      scale: 1,
      transition: {
        duration: 0.15 // Faster return
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Resumo de Atividades - Primeira Seção */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 md:space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Resumo de Atividades
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              value: completedTasks,
              label: 'Tarefas Concluídas',
              color: 'text-success-600 dark:text-success-400',
              icon: CheckCircle,
              delay: 0.1
            },
            {
              value: totalTasks - completedTasks,
              label: 'Tarefas Pendentes',
              color: 'text-primary-600 dark:text-primary-400',
              icon: ListTodo,
              delay: 0.2
            },
            {
              value: completedMilestones,
              label: 'Marcos Atingidos',
              color: 'text-accent-600 dark:text-accent-400',
              icon: Target,
              delay: 0.3
            },
            {
              value: urgentTasks.length,
              label: 'Itens Urgentes',
              color: urgentTasks.length > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-500 dark:text-gray-400',
              icon: AlertTriangle,
              delay: 0.4
            }
          ].map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={index}
                initial={prefersReducedMotion() ? false : { opacity: 0, scale: 0.8 }}
                animate={prefersReducedMotion() ? false : { opacity: 1, scale: 1 }}
                transition={prefersReducedMotion() ? undefined : { 
                  delay: metric.delay,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={prefersReducedMotion() ? undefined : {
                  scale: 1.02, // Reduced from 1.05 for more subtle effect
                  transition: { 
                    duration: 0.2,
                    ease: "easeOut" // Smoother transition
                  }
                }}
                className="text-center p-3 md:p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                tabIndex={0}
                role="button"
                aria-label={`${metric.label}: ${metric.value}`}
              >
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className="h-4 w-4 mr-2 opacity-60" />
                  <div className={`text-xl md:text-2xl font-semibold ${metric.color}`}>
                    {metric.value}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {metric.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Divisor */}
      <Separator spacing="md" className="md:my-6" />

      {/* Preview de Próximos Milestones - Segunda Seção */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 md:space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Próximos Marcos
          </h2>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToMilestones}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="text-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Ver todos os milestones"
              >
                Ver Todos
              </Button>
            </motion.div>
          </div>
        </div>

        {upcomingMilestones.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex gap-2 md:gap-3 pb-2">
              {upcomingMilestones.slice(0, 3).map((milestone, index) => {
                const milestoneIsOverdue = isOverdue(milestone.dueDate);
                const isCompleted = milestone.status === 'completed';

                return (
                  <motion.div
                    key={milestone.id}
                    initial={prefersReducedMotion() ? false : { opacity: 0, x: 20 }}
                    animate={prefersReducedMotion() ? false : { opacity: 1, x: 0 }}
                    transition={prefersReducedMotion() ? undefined : { delay: 0.1 * index }}
                    variants={prefersReducedMotion() ? undefined : milestoneCardVariants}
                    whileHover={prefersReducedMotion() ? undefined : "hover"}
                    className={`flex-shrink-0 w-72 md:w-80 p-2 md:p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 ${
                      milestoneIsOverdue ? 'border-l-4 border-error-500' : ''
                    }`}
                    tabIndex={0}
                    role="button"
                    aria-label={`Milestone: ${milestone.title} - ${milestone.status}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {/* Status Indicator with animation */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + (0.1 * index), type: "spring" }}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-3 w-3 text-success-500 flex-shrink-0" />
                          ) : (
                            <div
                              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                milestone.status === 'in-progress' ? 'bg-primary-500' :
                                milestone.status === 'overdue' ? 'bg-error-500' :
                                'bg-gray-400'
                              }`}
                            />
                          )}
                        </motion.div>

                        {/* Milestone Content */}
                        <div className="flex-1 min-w-0">
                          <h5
                            className={`font-medium text-xs transition-colors duration-200 ${
                              isCompleted 
                                ? 'text-gray-500 dark:text-gray-500 line-through' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {milestone.title}
                          </h5>
                          {milestone.dueDate && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-2 w-2 text-gray-400" />
                              <p className={`text-xs transition-colors duration-200 ${
                                milestoneIsOverdue && !isCompleted
                                  ? 'text-error-600 dark:text-error-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {formatDate(milestone.dueDate)}
                                {milestoneIsOverdue && !isCompleted && ' (Atrasado)'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge with animation */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + (0.1 * index) }}
                      >
                        <Badge
                          variant={getMilestoneStatusColor(milestone.status)}
                          className="flex-shrink-0 text-xs px-2 py-1 transition-all duration-200 hover:scale-105"
                        >
                          {milestone.status === 'completed' ? 'Concluído' :
                           milestone.status === 'in-progress' ? 'Em Progresso' :
                           milestone.status === 'overdue' ? 'Atrasado' : 'Planejado'}
                        </Badge>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <Target className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 opacity-20" />
            </motion.div>
            <p className="text-sm">
              Nenhum milestone pendente.
            </p>
            <p className="text-xs mt-1">
              Todos os marcos estão concluídos!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Divisor */}
      <Separator spacing="md" className="md:my-6" />

      {/* To-Do List Interativo - Tarefas Pendentes - Terceira Seção */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 md:space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Tarefas Pendentes
            </h2>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {urgentAndOverdueTasks.length} {urgentAndOverdueTasks.length === 1 ? 'tarefa' : 'tarefas'}
            </motion.span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-auto" 
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToTasks}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="text-sm transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Ver todas as tarefas"
              >
                Ver Todas
              </Button>
            </motion.div>
          </div>
        </div>

        {urgentAndOverdueTasks.length > 0 ? (
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-1">
            <div className="space-y-2">
              <AnimatePresence>
                {urgentAndOverdueTasks.slice(0, 5).map((task, index) => {
                  const taskIsOverdue = isOverdue(task.dueDate);
                  const isCompleted = task.status === 'completed';
                  const isLoading = loadingTaskIds.has(task.id);
                  const isRecentlyCompleted = completedTaskIds.has(task.id);

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.1 * index }}
                      variants={cardHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className={`p-2 md:p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 cursor-pointer ${
                        taskIsOverdue ? 'border-l-4 border-error-500' : ''
                      } ${isRecentlyCompleted ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800' : ''}`}
                    >
                      <div className="flex items-center space-x-2 md:space-x-3">
                        {/* Interactive Checkbox with loading state */}
                        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <motion.div
                            variants={checkboxVariants}
                            animate={isCompleted ? "checked" : "unchecked"}
                            className="relative"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                            ) : (
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleTaskCompletion(task.id, task.status);
                                }}
                                className="w-4 h-4 text-success-600 bg-gray-100 dark:bg-gray-800 rounded focus:ring-success-500 focus:ring-2 cursor-pointer transition-all duration-200 hover:scale-110"
                                aria-label={`Marcar tarefa "${task.title}" como ${isCompleted ? 'pendente' : 'concluída'}`}
                              />
                            )}
                          </motion.div>
                        </div>

                        {/* Status Indicator with animation */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + (0.1 * index), type: "spring" }}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                          ) : (
                            <div
                              className={`h-3 w-3 rounded-full flex-shrink-0 transition-all duration-200 ${
                                task.priority === 'urgent' ? 'bg-error-500 shadow-lg shadow-error-500/30' :
                                task.priority === 'high' ? 'bg-warning-500 shadow-lg shadow-warning-500/30' :
                                task.priority === 'medium' ? 'bg-primary-500 shadow-lg shadow-primary-500/30' :
                                'bg-success-500 shadow-lg shadow-success-500/30'
                              }`}
                            />
                          )}
                        </motion.div>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <h5
                            className={`font-medium text-sm transition-all duration-200 ${
                              isCompleted 
                                ? 'text-gray-500 dark:text-gray-500 line-through' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {task.title}
                          </h5>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <p className={`text-xs transition-colors duration-200 ${
                                taskIsOverdue && !isCompleted
                                  ? 'text-error-600 dark:text-error-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {formatDate(task.dueDate)}
                                {taskIsOverdue && !isCompleted && ' (Atrasada)'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Priority Badge with enhanced animation */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + (0.1 * index) }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge
                            variant={
                              isCompleted
                                ? 'success'
                                : task.priority === 'urgent'
                                  ? 'error'
                                  : task.priority === 'high'
                                    ? 'warning'
                                    : task.priority === 'medium'
                                      ? 'accent'
                                      : 'default'
                            }
                            className="flex-shrink-0 transition-all duration-200 hover:shadow-md"
                          >
                            {isCompleted
                              ? 'Concluída'
                              : task.priority === 'urgent' ? 'Urgente' :
                                task.priority === 'high' ? 'Alta' :
                                task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <CheckCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 opacity-20" />
            </motion.div>
            <p className="text-sm">
              Nenhuma tarefa urgente ou atrasada pendente.
            </p>
            <p className="text-xs mt-1">
              Ótimo trabalho mantendo o projeto em dia!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={handleCloseCreateTaskModal}
        mode="create"
        task={undefined}
      />
    </div>
  );
};

export default ProjectOverviewTab; 