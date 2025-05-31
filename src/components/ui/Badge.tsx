import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        {
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300':
            variant === 'default',
          'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300':
            variant === 'primary',
          'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300':
            variant === 'secondary',
          'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-300':
            variant === 'accent',
          'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300':
            variant === 'success',
          'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300':
            variant === 'warning',
          'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300':
            variant === 'error',
          'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300':
            variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
