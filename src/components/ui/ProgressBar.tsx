import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  variant = 'default',
  size = 'md',
  showValue = false,
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center">
        <div
          className={cn(
            'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
            {
              'h-1': size === 'sm',
              'h-2': size === 'md',
              'h-3': size === 'lg',
            }
          )}
        >
          <div
            className={cn('h-full transition-all duration-300 ease-in-out', {
              'bg-primary-500 dark:bg-primary-600': variant === 'default',
              'bg-success-500 dark:bg-success-600': variant === 'success',
              'bg-warning-500 dark:bg-warning-600': variant === 'warning',
              'bg-error-500 dark:bg-error-600': variant === 'error',
            })}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
