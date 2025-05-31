import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import Button from './Button';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  required?: boolean;
  maxLength?: number;
  validation?: (value: string) => string | null;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onSave,
  placeholder = 'Clique para editar...',
  className = '',
  inputClassName = '',
  multiline = false,
  required = false,
  maxLength,
  validation,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        // For textarea, move cursor to end
        const textarea = inputRef.current as HTMLTextAreaElement;
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      } else {
        // For input, select all text
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, multiline]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  };

  const handleSave = () => {
    if (required && !editValue.trim()) {
      setError('Este campo é obrigatório');
      return;
    }

    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const inputProps = {
    ref: inputRef,
    value: editValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditValue(e.target.value);
      if (error) setError(null);
    },
    onKeyDown: handleKeyDown,
    onBlur: handleSave,
    className: `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
      error ? 'border-error-500' : 'border-gray-300 dark:border-gray-600'
    } ${inputClassName}`,
    placeholder,
    maxLength,
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {multiline ? (
          <textarea
            {...inputProps}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        ) : (
          <input
            type="text"
            {...inputProps}
          />
        )}
        
        {error && (
          <p className="text-error-500 text-sm">{error}</p>
        )}
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={handleSave}
            leftIcon={<Check size={14} />}
          >
            Salvar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            leftIcon={<X size={14} />}
          >
            Cancelar
          </Button>
          
          {multiline && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl/Cmd + Enter para salvar
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 transition-colors ${className}`}
      onClick={handleEdit}
    >
      <div className="flex items-center justify-between">
        <span className={`${value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {value || placeholder}
        </span>
        <Edit2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default EditableField; 