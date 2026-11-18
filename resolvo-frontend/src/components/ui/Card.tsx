import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'pinkGauge' | 'dark';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  noPadding = false,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 overflow-hidden';

  const variantStyles = {
    default: 'bg-white text-slate-900 border border-slate-200/80 shadow-soft',
    glass: 'glass-card-light text-slate-900 shadow-float',
    pinkGauge: 'pink-gauge-gradient text-brand-deep shadow-float',
    dark: 'glass-card-dark text-white shadow-float',
  }[variant];

  const paddingStyles = noPadding ? '' : 'p-6';

  return (
    <div className={cn(baseStyles, variantStyles, paddingStyles, className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('flex items-center justify-between pb-4 border-b border-slate-200/50 mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('text-lg font-bold text-slate-900 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-sm text-slate-500 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('pt-4 border-t border-slate-200/50 mt-4 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);
