import React, { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  allowFullscreen?: boolean;
  initialFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onFullscreenClick?: (taskId?: string) => void;
  taskId?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  allowFullscreen = false,
  initialFullscreen = false,
  onFullscreenChange,
  onFullscreenClick,
  taskId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  // Fullscreen state with localStorage persistence
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (!allowFullscreen) return false;
    if (initialFullscreen) return true;
    
    const storageKey = `modal-fullscreen-${title || 'default'}`;
    return localStorage.getItem(storageKey) === 'true';
  });

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Toggle fullscreen function
  const toggleFullscreen = useCallback(() => {
    if (!allowFullscreen) return;
    
    // Se onFullscreenClick existe, usar navegação ao invés de toggle local
    if (onFullscreenClick) {
      onFullscreenClick(taskId);
      return;
    }
    
    // Comportamento original para outros modals
    setIsFullscreen(prev => {
      const newValue = !prev;
      const storageKey = `modal-fullscreen-${title || 'default'}`;
      localStorage.setItem(storageKey, String(newValue));
      onFullscreenChange?.(newValue);
      return newValue;
    });
  }, [allowFullscreen, title, onFullscreenChange, onFullscreenClick, taskId]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if modal should be fullscreen
  const shouldBeFullscreen = allowFullscreen && (isFullscreen || isMobile);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus modal container after animation
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Restore focus when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Enhanced escape key handler + F11 for fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        // If fullscreen, exit fullscreen first, then close modal on second press
        if (shouldBeFullscreen && allowFullscreen && !isMobile) {
          if (isFullscreen) {
            setIsFullscreen(false);
            const storageKey = `modal-fullscreen-${title || 'default'}`;
            localStorage.setItem(storageKey, 'false');
            onFullscreenChange?.(false);
            return;
          }
        }
        onClose();
      }

      if (event.key === 'F11' && allowFullscreen && !isMobile) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, shouldBeFullscreen, allowFullscreen, isMobile, isFullscreen, title, onClose, onFullscreenChange, toggleFullscreen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
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

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const getSizeClasses = () => {
    if (shouldBeFullscreen) {
      return 'w-full h-full max-w-none max-h-none';
    }

    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  const getContainerClasses = () => {
    if (shouldBeFullscreen) {
      // Fullscreen relativo à área de conteúdo principal
      // Considera sidebar colapsada (80px) e expandida (256px)
      return 'fixed inset-0 z-50 flex md:left-20 xl:left-64';
    }
    return 'fixed inset-0 z-50 flex items-center justify-center p-4';
  };

  const getModalClasses = () => {
    if (shouldBeFullscreen) {
      // No fullscreen, ocupar apenas a área disponível do conteúdo
      // Margem top para o header (altura aprox 64px) + padding
      return 'w-full h-full overflow-hidden rounded-none md:mt-20 md:mr-6 md:mb-6 md:ml-6 md:h-[calc(100vh-7rem)] md:rounded-xl';
    }
    return 'w-full max-h-[90vh] overflow-hidden rounded-xl';
  };

  const getAnimationProps = () => {
    if (shouldBeFullscreen) {
      return {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { type: 'spring', damping: 30, stiffness: 400 }
      };
    }

    return {
      initial: { opacity: 0, scale: 0.95, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 10 },
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    };
  };

  const getModalStyles = () => {
    if (shouldBeFullscreen) {
      return 'bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg';
    }
    return 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md';
  };

  const getBackdropClasses = () => {
    if (shouldBeFullscreen) {
      // Backdrop que respeita a área de conteúdo principal
      return 'fixed inset-0 z-40 md:left-20 xl:left-64 bg-black/5 backdrop-blur-sm';
    }
    return 'fixed inset-0 z-40 bg-black/5 backdrop-blur-sm';
  };

  const getBackdropStyles = () => {
    return 'bg-black/20 backdrop-blur-sm';
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={getBackdropClasses()}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div className={getContainerClasses()}>
            <motion.div
              ref={modalRef}
              {...getAnimationProps()}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative shadow-2xl/50',
                getModalClasses(),
                getSizeClasses(),
                getModalStyles(),
                // Mobile responsive adjustments for non-fullscreen
                !shouldBeFullscreen && (size === 'sm' || size === 'md') ? 'sm:max-w-sm md:max-w-lg' : '',
                className
              )}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
            >
              {/* Header without borders */}
              {(title || allowFullscreen) && (
                <div className="flex items-center justify-between p-6 bg-transparent">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-light text-gray-900 dark:text-gray-100"
                    >
                      {title}
                    </h2>
                  )}
                  
                  {!title && <div />} {/* Spacer when no title */}
                  
                  <div className="flex items-center gap-2">
                    {/* Fullscreen toggle button */}
                    {allowFullscreen && !isMobile && (
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        title={isFullscreen ? 'Exit fullscreen (F11)' : 'Enter fullscreen (F11)'}
                      >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                      </button>
                    )}
                    
                    {/* Close button - always show */}
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                      aria-label="Close modal"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Show header with just close button when no title and no fullscreen */}
              {!title && !allowFullscreen && (
                <div className="flex justify-end p-4">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className={cn(
                'overflow-y-auto',
                shouldBeFullscreen 
                  ? (title ? 'h-[calc(100vh-5rem)]' : 'h-full')
                  : (title ? 'max-h-[calc(90vh-5rem)]' : 'max-h-[90vh]')
              )}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
export { Modal }; 