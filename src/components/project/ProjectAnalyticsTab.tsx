import React, { useMemo } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Download,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Users,
  Activity,
  PieChart,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { Project, Task, Milestone } from '../../types';

interface ProjectAnalyticsTabProps {
  project: Project;
  projectTasks: Task[];
  projectMilestones: Milestone[];
  formatDate: (dateString?: string) => string;
}

const ProjectAnalyticsTab: React.FC<ProjectAnalyticsTabProps> = ({
  project,
  projectTasks,
  projectMilestones,
  formatDate,
}) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    // Task analytics
    const tasksByStatus = projectTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByPriority = projectTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Time analytics
    const totalEstimatedHours = projectTasks.reduce((sum, task) => 
      sum + (task.estimatedHours || 0), 0);
    const totalActualHours = projectTasks.reduce((sum, task) => 
      sum + (task.actualHours || 0), 0);

    // Milestone analytics
    const milestonesByStatus = projectMilestones.reduce((acc, milestone) => {
      acc[milestone.status] = (acc[milestone.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Completion rate over time (simplified)
    const completedTasks = projectTasks.filter(t => t.status === 'completed');
    const completionRate = projectTasks.length > 0 
      ? (completedTasks.length / projectTasks.length) * 100 
      : 0;

    // Overdue items
    const now = new Date();
    const overdueTasks = projectTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    );
    const overdueMilestones = projectMilestones.filter(milestone => 
      new Date(milestone.dueDate) < now && milestone.status !== 'completed'
    );

    return {
      tasksByStatus,
      tasksByPriority,
      milestonesByStatus,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      overdueTasks: overdueTasks.length,
      overdueMilestones: overdueMilestones.length,
      totalTasks: projectTasks.length,
      totalMilestones: projectMilestones.length,
    };
  }, [projectTasks, projectMilestones]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'review': return 'accent';
      case 'todo': return 'default';
      case 'planned': return 'default';
      case 'delayed': return 'error';
      default: return 'default';
    }
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

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success-500" />
            </div>
            <ProgressBar value={analytics.completionRate} variant="success" size="sm" className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Itens Atrasados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.overdueTasks + analytics.overdueMilestones}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-error-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {analytics.overdueTasks} tarefas, {analytics.overdueMilestones} milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Horas Estimadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {analytics.totalEstimatedHours}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {analytics.totalActualHours}h realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progresso Geral</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {project.progress}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent-500" />
            </div>
            <ProgressBar value={project.progress} size="sm" className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Tarefas por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.tasksByStatus).map(([status, count]) => {
                const percentage = analytics.totalTasks > 0 
                  ? (count / analytics.totalTasks) * 100 
                  : 0;
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(status) as any} className="text-xs">
                          {status === 'todo' ? 'A Fazer' :
                           status === 'in-progress' ? 'Em Progresso' :
                           status === 'review' ? 'Revisão' :
                           status === 'completed' ? 'Concluído' : status}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {count} {count === 1 ? 'tarefa' : 'tarefas'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar 
                      value={percentage} 
                      variant={getStatusColor(status) as any}
                      size="sm" 
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Task Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.tasksByPriority).map(([priority, count]) => {
                const percentage = analytics.totalTasks > 0 
                  ? (count / analytics.totalTasks) * 100 
                  : 0;
                
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(priority) as any} className="text-xs">
                          {priority === 'urgent' ? 'Urgente' :
                           priority === 'high' ? 'Alta' :
                           priority === 'medium' ? 'Média' :
                           priority === 'low' ? 'Baixa' : priority}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {count} {count === 1 ? 'tarefa' : 'tarefas'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar 
                      value={percentage} 
                      variant={getPriorityColor(priority) as any}
                      size="sm" 
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progresso dos Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectMilestones.length > 0 ? (
            <div className="space-y-4">
              {projectMilestones.map(milestone => {
                const milestoneTasks = projectTasks.filter(t => t.milestoneId === milestone.id);
                const completedTasks = milestoneTasks.filter(t => t.status === 'completed');
                const progress = milestoneTasks.length > 0 
                  ? (completedTasks.length / milestoneTasks.length) * 100 
                  : 0;
                
                const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== 'completed';
                
                return (
                  <div key={milestone.id} className="p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {milestoneTasks.length} {milestoneTasks.length === 1 ? 'tarefa' : 'tarefas'} • 
                          Prazo: {formatDate(milestone.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOverdue && <AlertTriangle className="h-4 w-4 text-error-500" />}
                        <Badge variant={getStatusColor(milestone.status) as any}>
                          {milestone.status === 'completed' ? 'Concluído' :
                           milestone.status === 'in-progress' ? 'Em Progresso' :
                           milestone.status === 'delayed' ? 'Atrasado' : 'Planejado'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                        <span className="font-medium">{completedTasks.length}/{milestoneTasks.length}</span>
                      </div>
                      <ProgressBar 
                        value={progress} 
                        variant={isOverdue ? 'error' : progress === 100 ? 'success' : 'default'}
                        size="sm" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum milestone definido para análise</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Análise de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.totalEstimatedHours}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tempo Estimado
              </div>
            </div>
            
            <div className="text-center p-4 bg-accent-50/50 dark:bg-accent-900/20 rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-accent-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.totalActualHours}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tempo Realizado
              </div>
            </div>
            
            <div className="text-center p-4 bg-success-50/50 dark:bg-success-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.totalEstimatedHours > 0 
                  ? ((analytics.totalActualHours / analytics.totalEstimatedHours) * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Eficiência
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="ghost" leftIcon={<Download size={16} />} className="justify-start">
              Relatório Executivo (PDF)
            </Button>
            <Button variant="ghost" leftIcon={<Download size={16} />} className="justify-start">
              Dados Detalhados (Excel)
            </Button>
            <Button variant="ghost" leftIcon={<Download size={16} />} className="justify-start">
              Timeline do Projeto (PNG)
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Nota:</strong> Os relatórios incluem métricas de progresso, distribuição de tarefas, 
              análise de tempo e status dos milestones. Dados atualizados em tempo real.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalyticsTab; 