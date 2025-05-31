import React, { useState } from 'react';
import { X, Calendar, DollarSign, Target, Users } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { Priority, Project } from '../../types';
import { useProject } from '../../contexts/ProjectContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createProject } = useProject();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    startDate: '',
    endDate: '',
    budget: '',
    assigneeIds: [] as string[],
    teamSize: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form input changes
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de término é obrigatória';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'Data de término deve ser posterior à data de início';
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Orçamento deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: 'planning',
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? Number(formData.budget) : undefined,
        assigneeIds: formData.assigneeIds,
        tasks: [],
        milestones: [],
        risks: [],
        documents: [],
      };

      await createProject(newProject);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        startDate: '',
        endDate: '',
        budget: '',
        assigneeIds: [],
        teamSize: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Erro ao criar projeto. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        startDate: '',
        endDate: '',
        budget: '',
        assigneeIds: [],
        teamSize: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Criar Novo Projeto
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título do Projeto *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                errors.title ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Digite o título do projeto"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-error-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none ${
                errors.description ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Descreva o objetivo e escopo do projeto"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-error-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Priority and Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridade
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={isSubmitting}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data Início *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.startDate ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <p className="text-error-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data Término *
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.endDate ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <p className="text-error-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Orçamento (R$)
            </label>
            <input
              type="number"
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                errors.budget ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
            {errors.budget && (
              <p className="text-error-500 text-sm mt-1">{errors.budget}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 rounded-lg p-3">
              <p className="text-error-600 dark:text-error-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateProjectModal; 