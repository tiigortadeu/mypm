import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';

interface FABAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: ButtonVariant;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  className?: string;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  className,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toggleExpanded = () => {
    if (!disabled) {
      setIsExpanded(prev => !prev);
    }
  };

  const handleActionClick = (action: FABAction) => {
    setActiveActionId(action.id);
    
    // Visual feedback
    setTimeout(() => {
      setActiveActionId(null);
      setIsExpanded(false);
      action.onClick();
    }, 100);
  };

  const getVariantClasses = (variant: ButtonVariant = 'primary') => {
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
      accent: 'bg-accent-600 hover:bg-accent-700 text-white',
      ghost: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    return variants[variant];
  };

  // Simplified animation variants
  const fabVariants = {
    initial: prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 },
    animate: prefersReducedMotion ? {} : { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    hover: prefersReducedMotion ? {} : { 
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    tap: prefersReducedMotion ? {} : { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  const containerVariants = {
    hidden: prefersReducedMotion ? {} : { 
      opacity: 0, 
      scale: 0.95,
      y: 10
    },
    visible: prefersReducedMotion ? {} : {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.05
      }
    }
  };

  const actionVariants = {
    hidden: prefersReducedMotion ? {} : { 
      opacity: 0, 
      x: 10
    },
    visible: prefersReducedMotion ? {} : {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    }
  };

  const iconRotationVariants = {
    closed: { rotate: 0 },
    open: prefersReducedMotion ? {} : { 
      rotate: 45,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <>
      {/* Action Items - Simplified list layout */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-[8px] rounded-lg p-2 shadow-lg"
            style={{ 
              backdropFilter: 'blur(8px)',
              bottom: '80px', // Posição fixa acima do botão
              right: '24px', // Alinhamento com o botão
              transform: 'translateX(calc(50% - 24px))', // Centralizar em relação ao botão
            }}
          >
            <div className="flex flex-col gap-1 min-w-[160px]">
              {actions.map((action, index) => {
                const IconComponent = action.icon;
                const isActive = activeActionId === action.id;
                
                return (
                  <motion.button
                    key={action.id}
                    variants={actionVariants}
                    whileHover={prefersReducedMotion ? {} : { x: 2 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-left',
                      'hover:bg-gray-100/60 dark:hover:bg-gray-800/60',
                      isActive && 'bg-gray-200/80 dark:bg-gray-700/80 scale-98',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={disabled}
                    aria-label={action.label}
                  >
                    {/* Action Icon */}
                    <IconComponent 
                      size={16} 
                      className={cn(
                        "flex-shrink-0 transition-all duration-200 text-gray-600 dark:text-gray-400",
                        isActive && "text-primary-600 dark:text-primary-400"
                      )}
                    />
                    
                    {/* Action Label - Always visible */}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button - Smaller and more discrete */}
      <motion.button
        variants={fabVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        onClick={toggleExpanded}
        className={cn(
          'fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50',
          'bg-primary-600 hover:bg-primary-700 text-white shadow-lg',
          disabled && 'opacity-50 cursor-not-allowed',
          isExpanded && 'bg-primary-700',
          className
        )}
        disabled={disabled}
        aria-label={isExpanded ? 'Fechar menu de ações' : 'Abrir menu de ações'}
        aria-expanded={isExpanded}
        style={{ zIndex: 100 }}
      >
        <motion.div
          variants={iconRotationVariants}
          animate={isExpanded ? "open" : "closed"}
          className="flex items-center justify-center"
        >
          {isExpanded ? (
            <X size={20} className="transition-all duration-200" />
          ) : (
            <Plus size={20} className="transition-all duration-200" />
          )}
        </motion.div>
      </motion.button>
    </>
  );
};

export default FloatingActionButton; 