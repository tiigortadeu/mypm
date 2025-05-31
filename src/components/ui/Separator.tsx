import React from 'react';
import { cn } from '../../utils/cn';

type SeparatorVariant = 'default' | 'subtle' | 'bold';
type SeparatorSpacing = 'sm' | 'md' | 'lg' | 'xl';

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  variant?: SeparatorVariant;
  spacing?: SeparatorSpacing;
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({
  variant = 'default',
  spacing = 'md',
  className,
  ...props
}) => {
  return (
    <hr
      className={cn(
        'border-0 border-t',
        {
          // Variants
          'border-gray-200/50 dark:border-gray-700/50': variant === 'default',
          'border-gray-100/30 dark:border-gray-800/30': variant === 'subtle',
          'border-gray-300/70 dark:border-gray-600/70': variant === 'bold',
          
          // Spacing
          'my-2': spacing === 'sm',
          'my-4': spacing === 'md',
          'my-6': spacing === 'lg',
          'my-8': spacing === 'xl',
        },
        className
      )}
      {...props}
    />
  );
};

export default Separator; 