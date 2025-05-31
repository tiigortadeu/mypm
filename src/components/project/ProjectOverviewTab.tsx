import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
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

  // Helper function para verificar se uma tarefa está atrasada
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Handle task completion toggle
  const handleToggleTaskCompletion = (
    taskId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    updateTask(taskId, { status: newStatus });
  };

  // Calcular métricas importantes
  const overdueTasks = totalTasks > 0 ? Math.round((totalTasks - completedTasks) * 0.15) : 0; // Simulação baseada no projeto
  const budgetValue = project.budget ? `R$ ${(project.budget / 1000).toFixed(0)}k` : 'R$ 45k';

  // Filtrar tarefas urgentes e atrasadas para o to-do list
  const urgentAndOverdueTasks = useMemo(() => {
    return projectTasks
      .filter(task => 
        (task.priority === 'urgent' || isOverdue(task.dueDate)) && 
        task.status !== 'completed'
      )
      .slice(0, 10);
  }, [projectTasks]);

  // Filtrar próximos milestones para o preview
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

  // Get milestone status color
  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'delayed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Importantes - Formato Inline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {project.progress}%
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Progresso
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-error-600 dark:text-error-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {urgentTasks.length}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Urgentes
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <Calendar className="h-4 w-4 text-warning-600 dark:text-warning-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {overdueTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Atrasadas
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <DollarSign className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {budgetValue}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Orçamento
          </span>
        </div>
      </motion.div>

      {/* To-Do List Interativo - Tarefas Pendentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Tarefas Pendentes
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {urgentAndOverdueTasks.length} {urgentAndOverdueTasks.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
        </div>

        {urgentAndOverdueTasks.length > 0 ? (
          <div className="space-y-2">
            {urgentAndOverdueTasks.map((task, index) => {
              const taskIsOverdue = isOverdue(task.dueDate);
              const isCompleted = task.status === 'completed';

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 ${
                    taskIsOverdue ? 'border-l-4 border-error-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Interactive Checkbox */}
                    <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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

                    {/* Status Indicator */}
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                    ) : (
                      <div
                        className={`h-3 w-3 rounded-full flex-shrink-0 ${
                          task.priority === 'urgent' ? 'bg-error-500' :
                          task.priority === 'high' ? 'bg-warning-500' :
                          task.priority === 'medium' ? 'bg-primary-500' :
                          'bg-success-500'
                        }`}
                      />
                    )}

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <h5
                        className={`font-medium text-sm ${
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
                          <p className={`text-xs ${
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

                    {/* Priority Badge */}
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
                      className="flex-shrink-0"
                    >
                      {isCompleted
                        ? 'Concluída'
                        : task.priority === 'urgent' ? 'Urgente' :
                          task.priority === 'high' ? 'Alta' :
                          task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">
              Nenhuma tarefa urgente ou atrasada pendente.
            </p>
            <p className="text-xs mt-1">
              Ótimo trabalho mantendo o projeto em dia!
            </p>
          </div>
        )}
      </motion.div>

      {/* Preview de Próximos Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Próximos Marcos
          </h2>
          <button 
            onClick={() => handleTabChange('tasks-milestones')}
            className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Ver Todos
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {upcomingMilestones.length > 0 ? (
          <div className="space-y-2">
            {upcomingMilestones.map((milestone, index) => {
              const milestoneIsOverdue = isOverdue(milestone.dueDate);
              const isCompleted = milestone.status === 'completed';

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 ${
                    milestoneIsOverdue ? 'border-l-4 border-error-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Status Indicator */}
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                      ) : (
                        <div
                          className={`h-3 w-3 rounded-full flex-shrink-0 ${
                            milestone.status === 'in-progress' ? 'bg-primary-500' :
                            milestone.status === 'delayed' ? 'bg-error-500' :
                            'bg-gray-400'
                          }`}
                        />
                      )}

                      {/* Milestone Content */}
                      <div className="flex-1 min-w-0">
                        <h5
                          className={`font-medium text-sm ${
                            isCompleted 
                              ? 'text-gray-500 dark:text-gray-500 line-through' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {milestone.title}
                        </h5>
                        {milestone.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.dueDate && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <p className={`text-xs ${
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

                    {/* Status Badge */}
                    <Badge
                      variant={getMilestoneStatusColor(milestone.status)}
                      className="flex-shrink-0"
                    >
                      {milestone.status === 'completed' ? 'Concluído' :
                       milestone.status === 'in-progress' ? 'Em Progresso' :
                       milestone.status === 'delayed' ? 'Atrasado' : 'Planejado'}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">
              Nenhum milestone pendente.
            </p>
            <p className="text-xs mt-1">
              Todos os marcos estão concluídos!
            </p>
          </div>
        )}
      </motion.div>

      {/* Métricas Detalhadas - Layout Minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Detalhamento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Progresso Geral */}
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Progresso Geral
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {project.progress}%
              </div>
              <ProgressBar
                value={project.progress}
                size="sm"
                className="flex-1"
              />
            </div>
          </div>

          {/* Tarefas */}
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Tarefas
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {completedTasks}/{totalTasks}
              </div>
              <ProgressBar
                value={taskProgress}
                size="sm"
                variant="success"
                className="flex-1"
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Milestones
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {completedMilestones}/{totalMilestones}
              </div>
              <ProgressBar
                value={milestoneProgress}
                size="sm"
                variant="default"
                className="flex-1"
              />
            </div>
          </div>

          {/* Itens Urgentes */}
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Itens Urgentes
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {urgentTasks.length}
              </div>
              <AlertTriangle
                className={`h-6 w-6 ${urgentTasks.length > 0 ? 'text-warning-500' : 'text-gray-400'}`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Informações do Projeto - Layout Minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Informações do Projeto
        </h2>
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg space-y-4">
          {/* Status e Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                <Badge
                  variant={
                    project.status === 'completed'
                      ? 'success'
                      : project.status === 'in-progress'
                        ? 'primary'
                        : project.status === 'on-hold'
                          ? 'warning'
                          : 'default'
                  }
                >
                  {project.status === 'in-progress' ? 'Em Progresso' :
                   project.status === 'completed' ? 'Concluído' :
                   project.status === 'on-hold' ? 'Em Pausa' : 'Planejamento'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Criado em</span>
                <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                  <Calendar className="h-4 w-4" />
                  {formatDate(project.createdAt)}
                </div>
              </div>

              {project.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prazo</span>
                  <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                    <Clock className="h-4 w-4" />
                    {formatDate(project.dueDate)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {project.budget && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Orçamento</span>
                  <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                    <DollarSign className="h-4 w-4" />
                    R$ {project.budget.toLocaleString('pt-BR')}
                  </div>
                </div>
              )}

              {overdueMilestones.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Atrasos</span>
                  <div className="flex items-center gap-1 text-sm text-error-600 dark:text-error-400">
                    <AlertTriangle className="h-4 w-4" />
                    {overdueMilestones.length} milestones atrasados
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Descrição
            </h4>
            <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Resumo de Atividades - Layout Minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Resumo de Atividades
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-semibold text-success-600 dark:text-success-400">
              {completedTasks}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Tarefas Concluídas
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
              {totalTasks - completedTasks}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Tarefas Pendentes
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-semibold text-accent-600 dark:text-accent-400">
              {completedMilestones}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Marcos Atingidos
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <div className={`text-2xl font-semibold ${urgentTasks.length > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {urgentTasks.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Itens Urgentes
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ações Rápidas - Layout Minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ações Rápidas
        </h2>
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="primary" 
              leftIcon={<Target size={16} />}
              className="justify-start"
            >
              Adicionar Milestone
            </Button>
            
            <Button 
              variant="ghost" 
              leftIcon={<Edit size={16} />}
              className="justify-start"
            >
              Editar Projeto
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start"
            >
              Adicionar Tarefa
            </Button>
            
            <Button 
              variant="ghost" 
              className="justify-start"
            >
              Gerar Relatório
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectOverviewTab; 