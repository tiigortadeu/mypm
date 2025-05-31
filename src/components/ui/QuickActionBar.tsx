import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  tooltip?: string;
}

interface QuickActionBarProps {
  actions: QuickAction[];
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
  animated?: boolean;
}

const QuickActionBar: React.FC<QuickActionBarProps> = ({
  actions,
  layout = 'horizontal',
  align = 'right',
  spacing = 'normal',
  className,
  animated = true,
}) => {
  // Layout classes
  const layoutClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col',
  };

  // Align classes
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Spacing classes
  const spacingClasses = {
    tight: layout === 'horizontal' ? 'gap-1' : 'gap-1',
    normal: layout === 'horizontal' ? 'gap-2' : 'gap-2',
    loose: layout === 'horizontal' ? 'gap-4' : 'gap-3',
  };

  // Container classes
  const containerClasses = cn(
    layoutClasses[layout],
    alignClasses[align],
    spacingClasses[spacing],
    'items-center',
    className
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: layout === 'vertical' ? 10 : 0,
      x: layout === 'horizontal' ? 10 : 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  if (actions.length === 0) {
    return null;
  }

  const ActionContent = () => (
    <>
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          variants={animated ? itemVariants : undefined}
          whileHover={animated ? { scale: 1.02 } : undefined}
          whileTap={animated ? { scale: 0.98 } : undefined}
          title={action.tooltip}
        >
          <Button
            variant={action.variant || 'ghost'}
            size={action.size || 'sm'}
            leftIcon={<action.icon size={16} />}
            onClick={action.onClick}
            disabled={action.disabled}
            isLoading={action.isLoading}
            className="transition-all duration-200"
          >
            {action.label}
          </Button>
        </motion.div>
      ))}
    </>
  );

  if (animated) {
    return (
      <motion.div
        className={containerClasses}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <ActionContent />
      </motion.div>
    );
  }

  return (
    <div className={containerClasses}>
      <ActionContent />
    </div>
  );
};

export default QuickActionBar; 