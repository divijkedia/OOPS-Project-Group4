import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'deep' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'rounded';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-azure focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

  const shapeStyles = shape === 'pill' ? 'rounded-full' : 'rounded-xl';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3 gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-brand-pink text-brand-deep font-semibold shadow-pink hover:bg-brand-pink-hover hover:shadow-lg active:scale-[0.98]',
    glass:
      'glass-pill text-white hover:bg-white/20 active:scale-[0.98]',
    deep:
      'bg-brand-deep text-white hover:bg-brand-azure shadow-soft active:scale-[0.98]',
    secondary:
      'bg-white border border-surface-border text-content-dark hover:bg-slate-50 shadow-sm active:scale-[0.98]',
    ghost:
      'text-content-muted hover:text-content-dark hover:bg-slate-100',
    danger:
      'bg-status-danger text-white hover:bg-red-600 shadow-sm active:scale-[0.98]',
  }[variant];

  return (
    <button
      className={cn(baseStyles, shapeStyles, sizeStyles, variantStyles, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};
