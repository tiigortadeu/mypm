import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import AutoResizeTextarea from './AutoResizeTextarea';
import { useProject } from '../../contexts/ProjectContext';
import { Project } from '../../types';
import { cn } from '../../utils/cn';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

interface FormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  budget: string;
}

interface FormErrors {
  title?: string;
  endDate?: string;
  budget?: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  project 
}) => {
  const { updateProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'planning',
    startDate: '',
    endDate: '',
    budget: '',
  });

  // Reset form when modal opens/closes or project changes
  React.useEffect(() => {
    if (isOpen && project) {
      // Populate form with existing project data
      setFormData({
        title: project.title,
        description: project.description,
        priority: project.priority || 'medium',
        status: project.status,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        budget: project.budget?.toString() || '',
      });
    }
    
    if (!isOpen) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, project]);

  // Validation functions
  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) return 'Título é obrigatório';
    if (title.trim().length < 3) return 'Título deve ter pelo menos 3 caracteres';
    if (title.trim().length > 100) return 'Título deve ter no máximo 100 caracteres';
    return undefined;
  };

  const validateDates = (startDate: string, endDate: string): string | undefined => {
    if (!startDate || !endDate) return undefined;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return 'Data de término deve ser posterior à data de início';
    }
    return undefined;
  };

  const validateBudget = (budget: string): string | undefined => {
    if (!budget) return undefined;
    
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget)) return 'Orçamento deve ser um número';
    if (numBudget < 0) return 'Orçamento deve ser maior ou igual a 0';
    if (numBudget > 999999999) return 'Orçamento deve ser menor que 1 bilhão';
    return undefined;
  };

  // Real-time validation (only for non-title fields)
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'title') return;
    
    let fieldError: string | undefined;
    
    if (field === 'endDate' || field === 'startDate') {
      const currentData = { ...formData, [field]: value };
      fieldError = validateDates(currentData.startDate, currentData.endDate);
      setErrors(prev => ({ ...prev, endDate: fieldError }));
    } else if (field === 'budget') {
      fieldError = validateBudget(value);
      setErrors(prev => ({ ...prev, budget: fieldError }));
    }
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
      endDate: validateDates(formData.startDate, formData.endDate),
      budget: validateBudget(formData.budget),
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
      // Update existing project
      const updatedProject: Partial<Project> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        updatedAt: new Date().toISOString(),
      };

      updateProject(project.id, updatedProject);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Priority and status labels
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
      case 'planning': return 'Planejamento';
      case 'in-progress': return 'Em Progresso';
      case 'on-hold': return 'Em Pausa';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Consistent input styles
  const inputBaseClasses = "w-full px-4 py-3 bg-transparent border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200";
  const selectBaseClasses = "w-full px-4 py-3 bg-transparent border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 appearance-none cursor-pointer";
  const containerClasses = "bg-gray-50/30 dark:bg-gray-800/20 rounded-lg";
  const metadataInputClasses = "w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 rounded-lg border-0 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200";
  const errorClasses = "ring-2 ring-red-500/30";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      className="text-left"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Título proeminente - Hero Section */}
            <div className="space-y-2">
              <input
                id="project-title"
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: undefined }));
                  }
                }}
                onBlur={handleTitleBlur}
                placeholder="Nome do projeto..."
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
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Descrição
              </label>
              <div className={containerClasses}>
                <div className="p-4">
                  <AutoResizeTextarea
                    id="project-description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Descreva os objetivos e escopo do projeto..."
                    minHeight={120}
                    maxHeight={150}
                    className="bg-transparent"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Divisão sutil */}
            <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 my-6"></div>

            {/* Configurações principais */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Configurações
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Prioridade */}
                <div className="space-y-3">
                  <label htmlFor="project-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prioridade
                  </label>
                  <div className={containerClasses}>
                    <select
                      id="project-priority"
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

                {/* Status */}
                <div className="space-y-3">
                  <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div className={containerClasses}>
                    <select
                      id="project-status"
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value as FormData['status'])}
                      className={selectBaseClasses}
                      disabled={isSubmitting}
                    >
                      <option value="planning">Planejamento</option>
                      <option value="in-progress">Em Progresso</option>
                      <option value="on-hold">Em Pausa</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Cronograma */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Cronograma
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Data de início */}
                <div className="space-y-3">
                  <label htmlFor="project-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data de início
                  </label>
                  <div className={containerClasses}>
                    <input
                      id="project-start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className={cn(
                        inputBaseClasses,
                        "[color-scheme:dark]"
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Data de término */}
                <div className="space-y-3">
                  <label htmlFor="project-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data de término
                  </label>
                  <div className={containerClasses}>
                    <input
                      id="project-end-date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleFieldChange('endDate', e.target.value)}
                      className={cn(
                        inputBaseClasses,
                        "[color-scheme:dark]",
                        errors.endDate && errorClasses
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.endDate && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.endDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Orçamento */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Orçamento
              </h3>
              
              <div className="space-y-3">
                <label htmlFor="project-budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Valor (R$)
                </label>
                <div className={containerClasses}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      R$
                    </span>
                    <input
                      id="project-budget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => handleFieldChange('budget', e.target.value)}
                      placeholder="0,00"
                      className={cn(
                        inputBaseClasses,
                        "pl-12",
                        errors.budget && errorClasses
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.budget && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.budget}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botões fixos na parte inferior */}
        <div className="border-t border-gray-200/20 dark:border-gray-700/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default EditProjectModal; 