import React, { useState, useEffect } from 'react';
import { X, Trash2, Download, Clock, Check } from 'lucide-react';
import { DownloadHistoryItem } from '../types/media';
import { triggerNativeDownload } from '../services/mediaService';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRedownload = (item: DownloadHistoryItem) => {
    if (!item.url) return;
    const isAudio = item.formatLabel.toLowerCase().includes('mp3');
    const ext = isAudio ? 'mp3' : 'mp4';
    const quality = isAudio ? 'MP3' : (item.formatLabel.match(/\d+p/)?.[0] || '720p');

    triggerNativeDownload(item.url, quality, ext, item.title);
    setDownloadedId(item.id);
    setTimeout(() => setDownloadedId(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="bg-[#0C0C0E] border border-[#222228] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1A1A1E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 id="history-modal-title" className="text-base font-semibold text-[#F5F5F5]">
              Download History
            </h2>
            {history.length > 0 && (
              <span className="text-xs text-neutral-400">({history.length})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="min-h-[36px] px-2.5 py-1 text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer rounded-lg hover:bg-[#16161C]"
                aria-label="Clear download history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer hover:bg-[#16161C]"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-30 stroke-[1.5]" />
              <p className="text-sm">No download history yet.</p>
              <p className="text-xs text-neutral-600">
                Completed downloads will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider px-1">
                Recent Downloads
              </div>
              <div className="divide-y divide-[#1A1A20] border border-[#1E1E24] rounded-2xl overflow-hidden bg-[#101014]">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#141418] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-[#F5F5F5] truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#999999] font-mono mt-0.5">
                        {item.formatLabel} · {item.fileSize}
                      </p>
                    </div>

                    {item.url && (
                      <button
                        type="button"
                        onClick={() => handleRedownload(item)}
                        className="min-w-[38px] min-h-[38px] flex items-center justify-center text-neutral-300 hover:text-white hover:bg-[#1E1E24] rounded-xl transition-colors shrink-0 cursor-pointer border border-neutral-800"
                        title="Download again"
                        aria-label={`Download again ${item.title}`}
                      >
                        {downloadedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#1A1A1E] bg-[#08080A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-[#16161A] rounded-xl border border-[#222226] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
