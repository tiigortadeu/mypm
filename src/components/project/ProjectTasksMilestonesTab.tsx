import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Plus,
  Filter,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { Task, Milestone } from '../../types';

interface ProjectMilestonesTabProps {
  projectId: string;
  projectTasks: Task[];
  projectMilestones: Milestone[];
  formatDate: (dateString?: string) => string;
  getMilestoneStatusColor: (status: string) => string;
}

const ProjectMilestonesTab: React.FC<ProjectMilestonesTabProps> = ({
  projectId,
  projectTasks,
  projectMilestones,
  formatDate,
  getMilestoneStatusColor,
}) => {
  // Local state for filters
  const [milestoneStatusFilter, setMilestoneStatusFilter] = useState<string>('all');

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    return projectMilestones.filter(milestone => {
      const statusMatch = milestoneStatusFilter === 'all' || milestone.status === milestoneStatusFilter;
      return statusMatch;
    });
  }, [projectMilestones, milestoneStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
          <Target className="h-6 w-6" />
          Milestones do Projeto
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {projectMilestones.length} {projectMilestones.length === 1 ? 'milestone' : 'milestones'} total
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
          <select
            value={milestoneStatusFilter}
            onChange={(e) => setMilestoneStatusFilter(e.target.value)}
            className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300"
          >
            <option value="all">Todos</option>
            <option value="planned">Planejado</option>
            <option value="in-progress">Em Progresso</option>
            <option value="completed">Concluído</option>
            <option value="delayed">Atrasado</option>
          </select>
        </div>
      </div>

      {/* Milestones Grid */}
      {filteredMilestones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMilestones.map(milestone => {
            // Calculate milestone task progress
            const milestoneTasks = projectTasks.filter(t => t.milestoneId === milestone.id);
            const completedMilestoneTasks = milestoneTasks.filter(t => t.status === 'completed');
            const taskProgress = milestoneTasks.length > 0 
              ? (completedMilestoneTasks.length / milestoneTasks.length) * 100 
              : 0;

            // Check if milestone is overdue
            const isOverdue = milestone.status !== 'completed' && milestone.dueDate && new Date(milestone.dueDate) < new Date();

            return (
              <div
                key={milestone.id}
                className={`p-6 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 ${
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
                       milestone.status === 'delayed' ? 'Atrasado' : 'Planejado'}
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">
            {projectMilestones.length === 0 
              ? 'Nenhum milestone ainda'
              : 'Nenhum milestone corresponde ao filtro'
            }
          </h3>
          <p className="text-sm mb-4">
            {projectMilestones.length === 0 
              ? 'Adicione seu primeiro milestone para organizar o projeto em marcos importantes.'
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
    </div>
  );
};

export default ProjectMilestonesTab; 