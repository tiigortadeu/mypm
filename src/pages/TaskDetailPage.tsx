import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle,
  AlertTriangle,
  Edit,
  Save,
  X,
  FileText,
  Eye,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/ui/RichTextEditor';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import CommentSection from '../components/ui/CommentSection';
import { Task } from '../types';

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { getTaskById, updateTask, addComment, projects } = useProject();
  
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load task data
  useEffect(() => {
    if (taskId) {
      const foundTask = getTaskById(taskId);
      if (foundTask) {
        setTask(foundTask);
        setNotes(foundTask.notes || '');
      }
    }
  }, [taskId, getTaskById]);

  // Auto-save notes
  useEffect(() => {
    if (task && notes !== (task.notes || '')) {
      const timer = setTimeout(() => {
        handleSaveNotes();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [notes, task]);

  const handleSaveNotes = async () => {
    if (!task) return;
    
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate save delay
      updateTask(task.id, { notes });
      setTask({ ...task, notes });
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!task) return;
    addComment(task.id, content);
    // Recarregar task para obter comentários atualizados
    const updatedTask = getTaskById(task.id);
    if (updatedTask) {
      setTask(updatedTask);
    }
  };

  const handleGoBack = () => {
    navigate('/tasks');
  };

  // Helper functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
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
      case 'completed': return 'success';
      case 'in-progress': return 'accent';
      case 'review': return 'warning';
      case 'todo': default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'accent';
      case 'low': default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in-progress': return 'Em Andamento';
      case 'review': return 'Revisão';
      case 'todo': default: return 'A Fazer';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': default: return 'Baixa';
    }
  };

  if (!task) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleGoBack} leftIcon={<ArrowLeft size={16} />}>
            Voltar para Tasks
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tarefa não encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            A tarefa que você está procurando não existe ou foi removida.
          </p>
          <Button variant="primary" onClick={handleGoBack}>
            Voltar para Tasks
          </Button>
        </div>
      </div>
    );
  }

  const project = projects.find(p => p.id === task.projectId);
  const taskIsOverdue = isOverdue(task.dueDate) && task.status !== 'completed';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Navigation */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" onClick={handleGoBack} leftIcon={<ArrowLeft size={16} />}>
          Voltar para Tasks
        </Button>
      </motion.div>

      {/* Task Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-display font-light text-gray-900 dark:text-gray-50 mb-2">
              {task.title}
            </h1>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Task Metadata - Inline Format */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <CheckCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            <Badge variant={getStatusColor(task.status)} className="text-xs">
              {getStatusLabel(task.status)}
            </Badge>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Prioridade:</span>
            <Badge variant={getPriorityColor(task.priority)} className="text-xs">
              {getPriorityLabel(task.priority)}
            </Badge>
          </div>

          {project && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Projeto:</span>
              <Link 
                to={`/projects/${project.id}`}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {project.title}
              </Link>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Prazo:</span>
              <span className={`text-sm font-medium ${
                taskIsOverdue 
                  ? 'text-error-600 dark:text-error-400' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {formatDate(task.dueDate)}
              </span>
            </div>
          )}

          {task.estimatedHours && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Estimativa:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {task.estimatedHours}h
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Notes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Anotações
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                Salvando...
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              leftIcon={isEditing ? <Eye size={16} /> : <Edit size={16} />}
            >
              {isEditing ? 'Visualizar' : 'Editar'}
            </Button>
          </div>
        </div>

        {/* Notes Content */}
        <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          {isEditing ? (
            <RichTextEditor
              value={notes}
              onChange={(value) => setNotes(value)}
              onSave={handleSaveNotes}
              isSaving={isSaving}
              placeholder="Escreva suas anotações sobre esta tarefa...

Use este espaço para:
• Documentar o progresso
• Registrar decisões importantes
• Anotar bloqueios e soluções
• Compartilhar insights
• Organizar ideias"
              minHeight={300}
              className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-base leading-relaxed"
            />
          ) : (
            <div className="min-h-[300px]">
              {task.notes ? (
                <MarkdownRenderer 
                  content={task.notes} 
                  className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Nenhuma anotação adicionada ainda.
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Clique em "Editar" para adicionar suas primeiras anotações.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Comentários
            {task.comments && task.comments.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                ({task.comments.length})
              </span>
            )}
          </h2>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <CommentSection
            comments={task.comments || []}
            onAddComment={handleAddComment}
            placeholder="Adicionar comentário sobre esta tarefa..."
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TaskDetailPage; 