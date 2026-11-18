import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Paperclip, X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { FileAttachment } from '../../types/incident';

export interface AttachmentInputProps {
  attachment: FileAttachment | null;
  onChange: (attachment: FileAttachment | null) => void;
  variant?: 'button' | 'dropzone';
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
}

export const AttachmentInput: React.FC<AttachmentInputProps> = ({
  attachment,
  onChange,
  variant = 'button',
  disabled = false,
  accept = 'image/*,.pdf,.txt,.log',
  maxSizeMB = 10,
  label = 'Attach Screenshot or File',
  hint = 'Supports images (PNG, JPG, WebP), PDFs, and logs up to 10MB. You can also paste (Ctrl+V) a screenshot.',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setErrorMessage(null);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxSizeMB} MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onChange({
          name: file.name,
          type: file.type || 'application/octet-stream',
          data: result,
          size: file.size,
        });
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read file from disk.');
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Clipboard paste listener for quick screenshot pasting
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const screenshotFile = new File([blob], `screenshot-${timestamp}.png`, { type: blob.type });
            processFile(screenshotFile);
            break;
          }
        }
      }
    },
    [disabled, processFile]
  );

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = attachment?.data.startsWith('data:image/') ||
    (attachment?.type && attachment.type.startsWith('image/')) ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(attachment?.name || '');

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Button Variant (Ideal for Comments / Diagnostic Notes) */}
      {variant === 'button' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Attach File / Screenshot</span>
            </button>
            <span className="text-[11px] text-slate-400">
              (or paste screenshot directly with Ctrl+V)
            </span>
          </div>

          {/* Staged Attachment Preview Chip */}
          {attachment && (
            <div className="inline-flex items-center gap-2.5 p-2 rounded-xl bg-brand-light/60 border border-brand-azure/30 shadow-xs max-w-md animate-fade-in">
              {isImage ? (
                <img
                  src={attachment.data}
                  alt={attachment.name}
                  className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                  <FileText className="w-4 h-4" />
                </div>
              )}
              <div className="truncate text-xs">
                <p className="font-semibold text-content-dark truncate max-w-[200px]" title={attachment.name}>
                  {attachment.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-auto shrink-0"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dropzone Variant (Ideal for New Incident Report Form) */}
      {variant === 'dropzone' && (
        <div>
          {label && (
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-dark mb-1.5">
              {label}
            </label>
          )}

          {!attachment ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-azure bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-200 hover:border-brand-azure/60 bg-slate-50/50 hover:bg-blue-50/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-brand-azure">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-content-dark">
                    Click to browse or drag & drop screenshot/file here
                  </p>
                  <p className="text-[11px] text-content-muted mt-0.5">
                    {hint}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Selected File Card in Dropzone */
            <div className="p-3.5 rounded-xl border border-brand-azure/30 bg-blue-50/40 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3 overflow-hidden">
                {isImage ? (
                  <img
                    src={attachment.data}
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-brand-deep">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <p className="text-xs font-bold text-content-dark truncate" title={attachment.name}>
                      {attachment.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatFileSize(attachment.size)} • Ready to submit with report
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-status-danger font-medium animate-fade-in mt-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
