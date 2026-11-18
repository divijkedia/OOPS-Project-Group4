import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  labelClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, labelClassName, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-xs font-semibold uppercase tracking-wider mb-1.5',
              labelClassName || 'text-content-dark'
            )}
          >
            {label}
            {props.required && <span className="text-status-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-content-dark placeholder:text-slate-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              error
                ? 'border-status-danger text-status-danger focus:ring-status-danger'
                : 'border-surface-border hover:border-slate-300',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-content-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-status-danger font-medium flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-content-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
