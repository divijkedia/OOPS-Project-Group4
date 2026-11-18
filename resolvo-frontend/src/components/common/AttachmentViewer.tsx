import React, { useState } from 'react';
import { Download, ExternalLink, FileText, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export interface AttachmentViewerProps {
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentData?: string | null;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  attachmentName,
  attachmentType,
  attachmentData,
  label,
  compact = false,
  className = '',
}) => {
  const [showFullView, setShowFullView] = useState(false);

  if (!attachmentData) {
    return null;
  }

  const displayName = attachmentName || 'attachment';
  const isImage =
    (attachmentType && attachmentType.toLowerCase().startsWith('image/')) ||
    attachmentData.startsWith('data:image/') ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(displayName);

  return (
    <div className={`mt-2 ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          {isImage ? <ImageIcon className="w-3.5 h-3.5 text-brand-deep" /> : <FileText className="w-3.5 h-3.5 text-slate-600" />}
          <span>{label}</span>
        </div>
      )}

      {isImage ? (
        <div className="inline-block group">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 shadow-sm max-w-sm hover:shadow-md transition-all">
            <img
              src={attachmentData}
              alt={displayName}
              className={`object-cover cursor-pointer hover:opacity-95 transition-opacity ${
                compact ? 'max-h-36 w-auto' : 'max-h-56 w-auto'
              }`}
              onClick={() => setShowFullView(true)}
            />
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5 text-white pointer-events-none">
              <span className="text-[11px] font-medium truncate max-w-[180px] drop-shadow">
                {displayName}
              </span>
              <div className="flex items-center gap-1 pointer-events-auto">
                <button
                  type="button"
                  title="Expand screenshot"
                  onClick={() => setShowFullView(true)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-white"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <a
                  href={attachmentData}
                  download={displayName}
                  title="Download image"
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
            <span className="truncate max-w-[200px]" title={displayName}>
              {displayName}
            </span>
            <button
              type="button"
              onClick={() => setShowFullView(true)}
              className="text-brand-deep hover:underline text-[11px] font-semibold flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> View Fullscreen
            </button>
          </div>
        </div>
      ) : (
        /* File Card Preview */
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm max-w-md hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-content-dark truncate" title={displayName}>
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {attachmentType || 'Document'}
              </p>
            </div>
          </div>
          <a
            href={attachmentData}
            download={displayName}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-deep bg-brand-light border border-brand-deep/20 hover:bg-brand-deep hover:text-white transition-colors shrink-0 ml-2"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      )}

      {/* Lightbox / Modal for High-Resolution Screenshot Viewing */}
      {isImage && (
        <Modal
          isOpen={showFullView}
          onClose={() => setShowFullView(false)}
          title={`Screenshot: ${displayName}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-600">
              <span>{displayName}</span>
              <a
                href={attachmentData}
                download={displayName}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-brand-deep bg-slate-100 hover:bg-brand-light transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Save Image
              </a>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-lg border border-slate-200 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={attachmentData}
                alt={displayName}
                className="max-w-full h-auto object-contain rounded"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
