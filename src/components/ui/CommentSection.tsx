import React, { useState, useRef, useEffect } from 'react';
import { Clock, MessageCircle, Send, User } from 'lucide-react';
import { TaskComment } from '../../types';
import MarkdownRenderer from './MarkdownRenderer';
import AutoResizeTextarea from './AutoResizeTextarea';
import Button from './Button';
import { cn } from '../../utils/cn';

interface CommentSectionProps {
  comments?: readonly TaskComment[];
  onAddComment: (content: string) => Promise<void>;
  className?: string;
  maxHeight?: number;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Componente para exibir e gerenciar comentários de uma tarefa
 * Suporta renderização markdown, timestamps formatados e scroll automático
 */
const CommentSection: React.FC<CommentSectionProps> = ({
  comments = [],
  onAddComment,
  className,
  maxHeight = 240,
  placeholder = "Adicionar comentário...",
  disabled = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll para o final quando novos comentários são adicionados
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSaving || disabled) return;
    
    setIsSaving(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Agora mesmo';
      if (diffMinutes < 60) return `${diffMinutes}min atrás`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h atrás`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d atrás`;
      
      // Para datas mais antigas, mostrar data formatada
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const sortedComments = [...comments].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header com contador */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <MessageCircle className="h-4 w-4" />
        <span>Comentários ({comments.length})</span>
      </div>

      {/* Lista de comentários */}
      {comments.length > 0 ? (
        <div
          ref={commentsContainerRef}
          className="space-y-3 overflow-y-auto pr-2 -mr-2"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {sortedComments.map((comment, index) => (
            <div
              key={comment.id}
              className={cn(
                'group relative p-3 rounded-lg transition-all duration-200',
                'bg-gray-50/50 dark:bg-gray-800/30',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                'border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50'
              )}
            >
              {/* Badge de sequência */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  #{comment.sequence}
                </span>
              </div>

              {/* Conteúdo do comentário */}
              <MarkdownRenderer 
                content={comment.content} 
                className="text-sm text-gray-700 dark:text-gray-300 mb-2"
              />

              {/* Footer com metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{comment.author || 'Usuário'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span title={new Date(comment.createdAt).toLocaleString('pt-BR')}>
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>

                {comment.readonly && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-200/50 dark:bg-gray-700/50 rounded text-gray-600 dark:text-gray-400">
                    Readonly
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum comentário ainda</p>
          <p className="text-xs mt-1">Seja o primeiro a comentar!</p>
        </div>
      )}

      {/* Input para novo comentário */}
      {!disabled && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <AutoResizeTextarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              minHeight={60}
              maxHeight={120}
              disabled={isSaving}
              className={cn(
                'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg',
                'bg-white dark:bg-gray-800',
                'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500'
              )}
            />
            
            {/* Contador de caracteres */}
            {newComment.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                {newComment.length}
              </div>
            )}
          </div>

          {/* Footer do form */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Ctrl/Cmd + Enter para enviar • </span>
              Suporte a Markdown
            </div>

            <div className="flex items-center gap-2">
              {newComment.trim() && (
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  Limpar
                </button>
              )}
              
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newComment.trim() || isSaving}
                isLoading={isSaving}
                leftIcon={!isSaving ? <Send className="h-3 w-3" /> : undefined}
              >
                {isSaving ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {disabled && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
          Comentários desabilitados
        </div>
      )}
    </div>
  );
};

export default CommentSection; 