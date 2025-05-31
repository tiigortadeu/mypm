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
  minHeight = 40,
  maxHeight = 200,
  isFullscreen = false,
  debounceMs = 0,
  className = '',
  value,
  onChange,
  onHeightChange,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutoResize(textareaRef, minHeight, maxHeight);

  // Chamar callback quando altura mudar
  useEffect(() => {
    onHeightChange?.(textareaRef.current?.scrollHeight || 0);
  }, [onHeightChange]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
  };

  return (
    <textarea
      ref={textareaRef}
      className={`resize-none overflow-hidden ${className}`}
      value={value}
      onChange={handleChange}
      style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
export { AutoResizeTextarea }; 