import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 md:p-8',
        hoverable &&
          'transition-all duration-200 hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return <div className={cn('mb-6', className)}>{children}</div>;
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h3
      className={cn(
        'text-xl font-semibold text-gray-900 dark:text-gray-50',
        className
      )}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p
      className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)}
    >
      {children}
    </p>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn('', className)}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'mt-6 pt-6',
        className
      )}
    >
      {children}
    </div>
  );
};
