import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Save, 
  FileText, 
  Type,
  AlignLeft,
  List,
  ListOrdered,
  Bold,
  Italic,
  Link2,
  Quote,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoResize } from '../../utils/hooks/useAutoResize';
import { cn } from '../../utils/cn';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  isSaving?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface MarkdownShortcut {
  trigger: string;
  replacement: string;
  cursorOffset?: number;
}

const markdownShortcuts: MarkdownShortcut[] = [
  { trigger: '**', replacement: '**bold text**', cursorOffset: -11 },
  { trigger: '*', replacement: '*italic text*', cursorOffset: -12 },
  { trigger: '- ', replacement: '- ', cursorOffset: 0 },
  { trigger: '1. ', replacement: '1. ', cursorOffset: 0 },
  { trigger: '# ', replacement: '# ', cursorOffset: 0 },
  { trigger: '## ', replacement: '## ', cursorOffset: 0 },
  { trigger: '### ', replacement: '### ', cursorOffset: 0 },
  { trigger: '> ', replacement: '> ', cursorOffset: 0 },
  { trigger: '[]', replacement: '[]()' , cursorOffset: -1 },
  { trigger: '---', replacement: '\n---\n', cursorOffset: 0 },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = 'Start writing...',
  className,
  minHeight = 300,
  isSaving = false,
  autoSave = true,
  autoSaveDelay = 2000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Auto-resize functionality
  const { adjustHeight } = useAutoResize({ 
    initialMinHeight: minHeight, 
    maxHeight: isFullscreen ? undefined : 1000,
    debounceMs: 100 
  });

  // Track unsaved changes
  useEffect(() => {
    if (value !== (lastSaved ? value : '')) {
      setHasUnsavedChanges(true);
    }
  }, [value, lastSaved]);

  // Auto-save functionality with error handling
  useEffect(() => {
    if (!autoSave || !onSave) return;
    
    const timer = setTimeout(async () => {
      if (value.trim() && hasUnsavedChanges) {
        try {
          setSaveError(null);
          await onSave();
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
          setSaveError('Erro ao salvar automaticamente');
        }
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [value, autoSave, autoSaveDelay, onSave, hasUnsavedChanges]);

  // Manual save function
  const handleManualSave = async () => {
    if (!onSave) return;
    
    try {
      setSaveError(null);
      await onSave();
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveError('Erro ao salvar');
    }
  };

  // Word and character count
  useEffect(() => {
    const words = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
    setWordCount(words);
    setCharCount(value.length);
  }, [value]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 for fullscreen
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

      // Ctrl+S for save
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleManualSave();
        return;
      }

      // Escape to exit fullscreen
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen, onSave]);

  // Smart placeholder based on content
  const getSmartPlaceholder = () => {
    if (value.trim() === '') {
      return placeholder + '\n\nMarkdown tips:\n• **bold** or *italic*\n• # Heading\n• - List item\n• > Quote\n• [link](url)\n• --- (divider)';
    }
    return placeholder;
  };

  // Insert markdown
  const insertMarkdown = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + textToInsert.length);
      } else {
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      }
      textarea.focus();
    }, 0);
  };

  // Handle input with markdown shortcuts
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    adjustHeight();
  };

  // Handle key press for markdown shortcuts
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const lineStart = value.lastIndexOf('\n', cursorPos - 1) + 1;
      const currentLine = value.substring(lineStart, cursorPos);
      
      // Check for markdown shortcuts
      for (const shortcut of markdownShortcuts) {
        if (currentLine.endsWith(shortcut.trigger)) {
          e.preventDefault();
          
          const beforeShortcut = value.substring(0, lineStart);
          const afterCursor = value.substring(cursorPos);
          
          if (shortcut.trigger === '**' || shortcut.trigger === '*') {
            // Handle bold/italic differently
            const newValue = beforeShortcut + currentLine.slice(0, -shortcut.trigger.length) + shortcut.replacement + afterCursor;
            onChange(newValue);
            
            setTimeout(() => {
              const newPos = cursorPos - shortcut.trigger.length + (shortcut.cursorOffset || 0);
              textarea.setSelectionRange(newPos, newPos);
            }, 0);
          } else {
            // Handle other shortcuts
            const newValue = beforeShortcut + currentLine + (e.key === 'Enter' ? '\n' : ' ') + afterCursor;
            onChange(newValue);
          }
          
          return;
        }
      }
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const containerClasses = cn(
    'relative w-full',
    isFullscreen && 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6'
  );

  const editorClasses = cn(
    'w-full bg-transparent border-0 resize-none outline-none',
    'text-gray-900 dark:text-gray-100',
    'placeholder:text-gray-500 dark:placeholder:text-gray-400',
    'font-mono text-base leading-relaxed',
    'transition-all duration-200',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Toolbar */}
      <AnimatePresence>
        {(showToolbar || isFullscreen) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between mb-4 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => insertMarkdown('**', '**', 'bold text')}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => insertMarkdown('*', '*', 'italic text')}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => insertMarkdown('# ', '', 'Heading')}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                title="Heading"
              >
                <Type size={16} />
              </button>
              <button
                onClick={() => insertMarkdown('- ', '', 'List item')}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                title="List"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => insertMarkdown('> ', '', 'Quote')}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                title="Quote"
              >
                <Quote size={16} />
              </button>
              <button
                onClick={() => insertMarkdown('[', '](url)', 'link text')}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                title="Link"
              >
                <Link2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                title={isFullscreen ? 'Exit fullscreen (F11)' : 'Enter fullscreen (F11)'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowToolbar(true)}
          onBlur={() => !isFullscreen && setShowToolbar(false)}
          placeholder={getSmartPlaceholder()}
          style={{ minHeight: isFullscreen ? 'calc(100vh - 200px)' : minHeight }}
          className={editorClasses}
          spellCheck="false"
        />
      </div>

      {/* Status Bar */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>{wordCount} {wordCount === 1 ? 'palavra' : 'palavras'}</span>
          <span>{charCount} {charCount === 1 ? 'caractere' : 'caracteres'}</span>
        </div>

        <div className="flex items-center gap-3">
          {isSaving && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span>Salvando...</span>
            </div>
          )}
          
          {saveError && !isSaving && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle size={14} />
              <span>{saveError}</span>
              <button
                onClick={handleManualSave}
                className="text-xs underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          {hasUnsavedChanges && !isSaving && !saveError && (
            <div className="flex items-center gap-2 text-amber-500">
              <Clock size={14} />
              <span>Alterações não salvas</span>
            </div>
          )}
          
          {lastSaved && !isSaving && !saveError && !hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-green-500">
              <Save size={14} />
              <span>Salvo às {formatTime(lastSaved)}</span>
            </div>
          )}

          {!isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              title="Tela cheia (F11)"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen overlay backdrop */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" />
      )}
    </div>
  );
};

export default RichTextEditor; 