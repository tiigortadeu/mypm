import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import AutoResizeTextarea from './AutoResizeTextarea';
import { useProject } from '../../contexts/ProjectContext';
import { Task } from '../../types';
import { cn } from '../../utils/cn';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task; // For editing existing task
  mode?: 'create' | 'edit';
}

interface FormData {
  title: string;
  description: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  estimatedHours: string;
}

interface FormErrors {
  title?: string;
  projectId?: string;
  dueDate?: string;
  estimatedHours?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  mode = 'create' 
}) => {
  const { projects, addTask, updateTask } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    estimatedHours: '',
  });

  // Reset form when modal opens/closes or task changes
  React.useEffect(() => {
    if (isOpen && task && mode === 'edit') {
      // Populate form with existing task data
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || '',
        estimatedHours: task.estimatedHours?.toString() || '',
      });
    } else if (isOpen && mode === 'create') {
      // Reset for new task
      setFormData({
        title: '',
        description: '',
        projectId: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        estimatedHours: '',
      });
    }
    
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, task, mode]);

  // Validation functions
  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) return 'Título é obrigatório';
    if (title.trim().length < 3) return 'Título deve ter pelo menos 3 caracteres';
    if (title.trim().length > 100) return 'Título deve ter no máximo 100 caracteres';
    return undefined;
  };

  const validateProject = (projectId: string): string | undefined => {
    if (!projectId) return undefined;
    const project = projects.find(p => p.id === projectId);
    if (!project) return 'Projeto selecionado não existe';
    return undefined;
  };

  const validateDate = (date: string): string | undefined => {
    if (!date) return undefined;
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return 'Data de vencimento deve ser futura';
    }
    return undefined;
  };

  const validateEstimatedHours = (hours: string): string | undefined => {
    if (!hours) return undefined;
    
    const numHours = parseFloat(hours);
    if (isNaN(numHours)) return 'Horas estimadas deve ser um número';
    if (numHours <= 0) return 'Horas estimadas deve ser maior que 0';
    if (numHours > 999) return 'Horas estimadas deve ser menor que 1000';
    return undefined;
  };

  // Real-time validation (only for non-title fields)
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'title') return;
    
    let fieldError: string | undefined;
    
    switch (field) {
      case 'projectId':
        fieldError = validateProject(value);
        break;
      case 'dueDate':
        fieldError = validateDate(value);
        break;
      case 'estimatedHours':
        fieldError = validateEstimatedHours(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  // Title validation only on blur
  const handleTitleBlur = () => {
    const titleError = validateTitle(formData.title);
    setErrors(prev => ({ ...prev, title: titleError }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {
      title: validateTitle(formData.title),
      projectId: validateProject(formData.projectId),
      dueDate: validateDate(formData.dueDate),
      estimatedHours: validateEstimatedHours(formData.estimatedHours),
    };

    Object.keys(newErrors).forEach(key => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'edit' && task) {
        // Update existing task
        const updatedTask: Partial<Task> = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          projectId: formData.projectId || projects[0]?.id || '',
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate || undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        };

        updateTask(task.id, updatedTask);
      } else {
        // Create new task
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: formData.title.trim(),
          description: formData.description.trim(),
          projectId: formData.projectId || projects[0]?.id || '',
          priority: formData.priority,
          status: 'todo',
          createdAt: new Date().toISOString(),
          dueDate: formData.dueDate || undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        };

        addTask(newTask);
      }

      setTimeout(() => {
        onClose();
      }, 200);

    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in-progress': return 'Em Andamento';
      case 'review': return 'Revisão';
      case 'todo': return 'A Fazer';
      default: return status;
    }
  };

  // Consistent input styles
  const inputBaseClasses = "w-full px-4 py-3 bg-transparent border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200";
  const selectBaseClasses = "w-full px-4 py-3 bg-transparent border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 appearance-none cursor-pointer";
  const containerClasses = "bg-gray-50/30 dark:bg-gray-800/20 rounded-lg";
  const metadataInputClasses = "w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 rounded-lg border-0 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200";
  const errorClasses = "ring-2 ring-red-500/30";

  // Handle fullscreen navigation
  const handleFullscreenClick = (taskId?: string) => {
    if (taskId) {
      navigate(`/tasks/id/${taskId}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      allowFullscreen={true}
      onFullscreenClick={mode === 'edit' && task ? () => handleFullscreenClick(task.id) : undefined}
      className="text-left"
    >
      <div className="p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Título proeminente - Hero Section */}
          <div className="space-y-2">
            <input
              id="task-title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              onBlur={handleTitleBlur}
              placeholder={mode === 'edit' ? 'Editar nome da tarefa...' : 'Nome da tarefa...'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className={cn(
                "w-full text-3xl font-light bg-transparent border-0 focus:outline-none focus:ring-0 py-2 transition-all duration-200",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "text-gray-900 dark:text-gray-100",
                errors.title && "text-red-600 dark:text-red-400"
              )}
              disabled={isSubmitting}
            />
            {errors.title && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.title}</span>
              </div>
            )}
          </div>

          {/* Descrição expansível */}
          <div className="space-y-4">
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
              Descrição
            </label>
            <div className={containerClasses}>
              <div className="p-4">
                <AutoResizeTextarea
                  id="task-description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Descreva os detalhes da tarefa..."
                  minHeight={120}
                  className="bg-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Divisão sutil */}
          <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 my-8"></div>

          {/* Campos principais organizados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Projeto */}
            <div className="space-y-3">
              <label htmlFor="task-project" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Projeto
              </label>
              <div className={containerClasses}>
                <select
                  id="task-project"
                  value={formData.projectId}
                  onChange={(e) => handleFieldChange('projectId', e.target.value)}
                  className={cn(
                    selectBaseClasses,
                    errors.projectId && errorClasses
                  )}
                  disabled={isSubmitting}
                >
                  <option value="">Selecionar projeto (opcional)</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              {errors.projectId && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.projectId}</span>
                </div>
              )}
            </div>

            {/* Prioridade */}
            <div className="space-y-3">
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prioridade
              </label>
              <div className={containerClasses}>
                <select
                  id="task-priority"
                  value={formData.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value as FormData['priority'])}
                  className={selectBaseClasses}
                  disabled={isSubmitting}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metadados adicionais */}
          <div className={cn(containerClasses, "p-6 space-y-6")}>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Informações Adicionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Status - Only show in edit mode */}
              {mode === 'edit' && (
                <div className="space-y-3">
                  <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    id="task-status"
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value as FormData['status'])}
                    className={cn(metadataInputClasses, "appearance-none cursor-pointer")}
                    disabled={isSubmitting}
                  >
                    <option value="todo">A Fazer</option>
                    <option value="in-progress">Em Andamento</option>
                    <option value="review">Revisão</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
              )}

              {/* Data limite */}
              <div className="space-y-3">
                <label htmlFor="task-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data limite
                </label>
                <input
                  id="task-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  className={cn(
                    metadataInputClasses,
                    "[color-scheme:dark]",
                    errors.dueDate && errorClasses
                  )}
                  disabled={isSubmitting}
                />
                {errors.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.dueDate}</span>
                  </div>
                )}
              </div>

              {/* Horas estimadas */}
              <div className="space-y-3">
                <label htmlFor="task-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Horas estimadas
                </label>
                <input
                  id="task-hours"
                  type="number"
                  min="0"
                  max="999"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleFieldChange('estimatedHours', e.target.value)}
                  placeholder="Ex: 8"
                  className={cn(
                    metadataInputClasses,
                    "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                    errors.estimatedHours && errorClasses
                  )}
                  disabled={isSubmitting}
                />
                {errors.estimatedHours && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.estimatedHours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Minimalista */}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1 py-3"
            >
              {isSubmitting 
                ? (mode === 'edit' ? 'Salvando...' : 'Criando...') 
                : (mode === 'edit' ? 'Salvar Alterações' : 'Criar Tarefa')
              }
            </Button>
          </div>

        </form>
      </div>
    </Modal>
  );
};

export default TaskModal;

// Keep the old component name for backward compatibility
export { TaskModal as CreateTaskModal };