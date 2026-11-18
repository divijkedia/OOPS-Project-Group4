import React from 'react';
import { cn } from '../../lib/utils';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  theme?: 'light' | 'dark';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  titleClassName,
  descriptionClassName,
  theme,
}) => {
  const isDark =
    theme === 'dark' ||
    className?.includes('glass-card-dark') ||
    className?.includes('dark') ||
    className?.includes('text-white');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed transition-colors',
        isDark
          ? 'border-white/20 bg-white/[0.04] text-white shadow-float'
          : 'border-surface-border bg-slate-50/50 text-content-dark',
        className
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-colors',
          isDark
            ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/30 shadow-pink'
            : 'bg-brand-deep/5 text-brand-deep'
        )}
      >
        {icon || <Inbox className="w-6 h-6 stroke-[1.75]" />}
      </div>
      <h3
        className={cn(
          'text-base font-bold tracking-tight',
          isDark ? 'text-white' : 'text-content-dark',
          titleClassName
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'text-sm max-w-sm mt-1.5 mb-5 leading-relaxed',
            isDark ? 'text-slate-200' : 'text-content-muted',
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
