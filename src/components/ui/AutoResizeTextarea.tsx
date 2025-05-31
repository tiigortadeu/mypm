import React, { useEffect, useRef } from 'react';
import { useAutoResize } from '../../utils/hooks/useAutoResize';
import { cn } from '../../utils/cn';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
  isFullscreen?: boolean;
  debounceMs?: number;
  onHeightChange?: (height: number) => void;
}

/**
 * Componente textarea com auto-redimensionamento e design minimalista
 * Utiliza o hook useAutoResize para funcionalidade de expansão automática
 * 
 * @param minHeight - Altura mínima em pixels (padrão: 120)
 * @param maxHeight - Altura máxima em pixels (indefinido = ilimitado)
 * @param isFullscreen - Se está em modo fullscreen (remove maxHeight)
 * @param debounceMs - Debounce para ajuste de altura (padrão: 0)
 * @param onHeightChange - Callback chamado quando altura muda
 */
const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  minHeight = 120,
  maxHeight = 400,
  isFullscreen = false,
  debounceMs = 0,
  className = '',
  value,
  onChange,
  onHeightChange,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const effectiveMaxHeight = isFullscreen ? undefined : maxHeight;
  useAutoResize(textareaRef, minHeight, effectiveMaxHeight);

  useEffect(() => {
    onHeightChange?.(textareaRef.current?.scrollHeight || 0);
  }, [onHeightChange]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
  };

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        'resize-none w-full border-0 focus:outline-none focus:ring-0 transition-all duration-200',
        'text-gray-900 dark:text-gray-100',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'leading-relaxed',
        className
      )}
      value={value}
      onChange={handleChange}
      style={{ 
        minHeight: `${minHeight}px`, 
        maxHeight: effectiveMaxHeight ? `${effectiveMaxHeight}px` : 'none',
        overflow: effectiveMaxHeight ? 'auto' : 'hidden'
      }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
export { AutoResizeTextarea }; 