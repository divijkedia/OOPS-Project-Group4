import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
  theme?: 'light' | 'dark';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
  theme,
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  }[variant];

  const isDark =
    theme === 'dark' ||
    className?.includes('bg-white') ||
    className?.includes('dark');

  return (
    <div
      className={cn(
        'relative overflow-hidden shimmer-effect',
        isDark ? 'bg-white/15' : 'bg-slate-200/80 shimmer-effect-light',
        variantStyles,
        className
      )}
      {...props}
    />
  );
};
