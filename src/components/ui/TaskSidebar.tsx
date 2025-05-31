import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  User, 
  ArrowRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Task } from '../../types';
import { useProject } from '../../contexts/ProjectContext';
import Button from './Button';
import EditableField from './EditableField';
import CommentSection from './CommentSection';
import { cn } from '../../utils/cn';

interface TaskSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (taskId: string) => void;
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onViewDetails 
}) => {
  const { projects, updateTask, addComment } = useProject();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in sidebar after animation
      setTimeout(() => {
        const focusableElements = sidebarRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        firstElement?.focus();
      }, 100);
    } else {
      // Restore focus when sidebar closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Keyboard navigation - Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const focusableElements = sidebar.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Handlers para atualização de campos
  const handleUpdateField = async (field: keyof Task, value: string | number) => {
    if (!task) return;
    updateTask(task.id, { [field]: value });
  };

  const handleAddComment = async (content: string) => {
    if (!task) return;
    addComment(task.id, content);
  };

  // Validações para campos
  const validateTitle = (value: string) => {
    if (!value.trim()) return 'Título é obrigatório';
    if (value.length < 3) return 'Título deve ter pelo menos 3 caracteres';
    return undefined;
  };

  if (!task) return null;

  const project = projects.find(p => p.id === task.projectId);

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const taskIsOverdue = isOverdue(task.dueDate) && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
          
          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sidebar-title"
            tabIndex={-1}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 
                id="sidebar-title"
                className="text-lg font-medium text-gray-900 dark:text-gray-100"
              >
                Editar Tarefa
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                aria-label="Fechar sidebar de edição da tarefa"
                title="Fechar (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                
                {/* Task Title - Editável */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-success-500 mt-2 flex-shrink-0" />
                    ) : taskIsOverdue ? (
                      <AlertTriangle className="h-5 w-5 text-error-500 mt-2 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 mt-2 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <EditableField
                        value={task.title}
                        type="text"
                        placeholder="Título da tarefa"
                        validation={validateTitle}
                        onSave={(value) => handleUpdateField('title', value)}
                        className={cn(
                          "text-xl font-semibold",
                          isCompleted && "line-through opacity-60"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Task Description - Editável */}
                <div className="space-y-2">
                  <EditableField
                    value={task.description || ''}
                    type="textarea"
                    placeholder="Descrição da tarefa..."
                    onSave={(value) => handleUpdateField('description', value)}
                    minHeight={80}
                    maxHeight={160}
                    className={cn(
                      "text-sm",
                      isCompleted && "opacity-60"
                    )}
                  />
                </div>

                {/* Task Metadata - Compacto */}
                <div className="space-y-4">
                  {/* Project - Read Only */}
                  {project && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Projeto:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {project.title}
                      </span>
                    </div>
                  )}

                  {/* Due Date - Editável */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Prazo</span>
                    </div>
                    <EditableField
                      value={task.dueDate || ''}
                      type="date"
                      placeholder="Selecionar data"
                      onSave={(value) => handleUpdateField('dueDate', value)}
                      className={cn(
                        taskIsOverdue && "text-error-600 dark:text-error-400"
                      )}
                    />
                    {taskIsOverdue && (
                      <p className="text-xs text-error-600 dark:text-error-400">
                        Tarefa em atraso
                      </p>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="pt-4">
                  <CommentSection
                    comments={task.comments}
                    onAddComment={handleAddComment}
                    maxHeight={120}
                    placeholder="Adicionar comentário à tarefa..."
                  />
                </div>
              </div>
            </div>

            {/* Footer - Always Visible */}
            <div className="flex-shrink-0 p-4 bg-gray-50/30 dark:bg-gray-800/20">
              <Button
                variant="primary"
                onClick={() => onViewDetails(task.id)}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full justify-center"
                aria-label={`Ver detalhes completos da tarefa ${task.title}`}
              >
                Ver Detalhes Completos
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskSidebar; 