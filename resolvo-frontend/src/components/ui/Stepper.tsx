import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { LIFECYCLE_STEPS, type StepItem } from '../../lib/constants';

export interface StepperProps {
  currentStepIndex: number; // 0-based index
  steps?: StepItem[];
  variant?: 'horizontal' | 'compact';
  theme?: 'light' | 'dark';
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStepIndex,
  steps = LIFECYCLE_STEPS,
  variant = 'horizontal',
  theme = 'light',
  className,
}) => {
  const isDark = theme === 'dark' || className?.includes('dark') || className?.includes('glass');

  if (variant === 'compact') {
    return (
      <div className={cn('w-full', className)}>
        <div
          className={cn(
            'flex items-center justify-between text-xs font-semibold mb-2',
            isDark ? 'text-slate-300' : 'text-content-muted'
          )}
        >
          <span>Lifecycle Progress</span>
          <span className={cn('font-bold', isDark ? 'text-brand-pink' : 'text-brand-deep')}>
            Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                title={step.label}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  isCompleted
                    ? isDark ? 'bg-brand-azure' : 'bg-brand-deep'
                    : isCurrent
                    ? 'bg-brand-pink shadow-pink animate-pulse'
                    : isDark ? 'bg-white/15' : 'bg-slate-200'
                )}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto py-2', className)}>
      <div className="flex items-center min-w-[640px] justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isUpcoming = idx > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step indicator node */}
              <div className="flex flex-col items-center text-center group cursor-default">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200',
                    isCompleted &&
                      (isDark
                        ? 'bg-brand-azure text-white shadow-soft border border-brand-bright/40'
                        : 'bg-brand-deep text-white shadow-soft'),
                    isCurrent && 'bg-brand-pink text-brand-deep font-extrabold ring-4 ring-brand-pink/30 shadow-pink',
                    isUpcoming &&
                      (isDark
                        ? 'bg-white/10 text-slate-300 border border-white/20'
                        : 'bg-slate-100 text-slate-500 border border-slate-200')
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold mt-2 max-w-[80px] truncate transition-colors',
                    isDark
                      ? isCurrent
                        ? 'text-brand-pink font-bold drop-shadow'
                        : isCompleted
                        ? 'text-white font-semibold'
                        : 'text-slate-300 font-medium'
                      : isCurrent
                      ? 'text-brand-deep font-bold'
                      : isCompleted
                      ? 'text-content-dark font-semibold'
                      : 'text-slate-500 font-medium'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all duration-300',
                    idx < currentStepIndex
                      ? isDark
                        ? 'bg-gradient-to-r from-brand-azure to-brand-pink'
                        : 'bg-brand-deep'
                      : isDark
                      ? 'bg-white/15'
                      : 'bg-slate-200'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
