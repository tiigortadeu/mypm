import React, { useCallback, useMemo } from 'react';
import { cn } from '../../utils/cn';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const renderMarkdown = useCallback((text: string) => {
    if (!text) return '';
    
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>')
      // Lists
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-gray-700 dark:text-gray-300">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-gray-700 dark:text-gray-300">$1</li>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')
      // Links
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Code inline
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="border-gray-300 dark:border-gray-600 my-4" />')
      // Line breaks
      .replace(/\n/g, '<br>');
  }, []);

  const htmlContent = useMemo(() => renderMarkdown(content), [content, renderMarkdown]);

  if (!content) {
    return null;
  }

  return (
    <div 
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
        'prose-p:text-gray-700 dark:prose-p:text-gray-300',
        'prose-strong:text-gray-900 dark:prose-strong:text-gray-100',
        'prose-em:text-gray-800 dark:prose-em:text-gray-200',
        'prose-a:text-primary-600 dark:prose-a:text-primary-400',
        'prose-code:text-gray-900 dark:prose-code:text-gray-100',
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer; 