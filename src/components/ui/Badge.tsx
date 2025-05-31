import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error';

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
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        {
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200':
            variant === 'default',
          'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200':
            variant === 'primary',
          'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-200':
            variant === 'secondary',
          'bg-accent-100 text-accent-800 dark:bg-accent-900/50 dark:text-accent-200':
            variant === 'accent',
          'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-200':
            variant === 'success',
          'bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-200':
            variant === 'warning',
          'bg-error-100 text-error-800 dark:bg-error-900/50 dark:text-error-200':
            variant === 'error',
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
