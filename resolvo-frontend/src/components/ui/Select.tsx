import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
  labelClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, labelClassName, children, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'block w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-content-dark transition-colors cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
              error
                ? 'border-status-danger text-status-danger focus:ring-status-danger'
                : 'border-surface-border hover:border-slate-300',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-content-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-status-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-content-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
