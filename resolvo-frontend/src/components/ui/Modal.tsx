import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-float border border-surface-border p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200',
          maxWidthStyles
        )}
      >
        <div className="flex items-start justify-between pb-3">
          <div>
            {title && (
              <h3 id="modal-title" className="text-lg font-bold text-content-dark">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-content-muted mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-content-muted hover:text-content-dark hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-azure"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 text-content-dark">{children}</div>

        {footer && <div className="pt-4 border-t border-surface-border mt-3 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};
