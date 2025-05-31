import React from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'ghost'
  | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isFullWidth = false,
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          // Variants
          'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500':
            variant === 'primary',
          'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500':
            variant === 'secondary',
          'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400':
            variant === 'accent',
          'bg-transparent hover:bg-gray-100/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300 focus:ring-gray-500':
            variant === 'ghost',
          'bg-transparent p-0 h-auto text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline focus:ring-0':
            variant === 'link',

          // Sizes
          'text-xs px-2.5 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-5 py-2.5': size === 'lg',

          // Full width
          'w-full': isFullWidth,

          // Disabled state
          'opacity-50 cursor-not-allowed': disabled || isLoading,
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      )}

      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
