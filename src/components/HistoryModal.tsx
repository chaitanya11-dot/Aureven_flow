import React from 'react';
import { X, Trash2, Download, Clock } from 'lucide-react';
import { DownloadHistoryItem } from '../types/media';
import { triggerFileDownload } from '../services/mediaService';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0C0C0E] border border-[#222222] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1A1A1E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#F5F5F5]">History</h2>
            {history.length > 0 && (
              <span className="text-xs text-[#999999]">({history.length})</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear history</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-30 stroke-[1.5]" />
              <p className="text-sm">No download history yet.</p>
              <p className="text-xs text-neutral-600">
                Completed downloads will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider">
                Today
              </div>
              <div className="divide-y divide-[#1A1A20] border border-[#1E1E24] rounded-xl overflow-hidden bg-[#101014]">
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
                        {item.formatLabel}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const ext = item.formatLabel.toLowerCase().includes('mp3') ? 'mp3' : 'mp4';
                        triggerFileDownload(item.title, ext);
                      }}
                      className="p-2 text-neutral-400 hover:text-white hover:bg-[#1E1E24] rounded-md transition-colors shrink-0 cursor-pointer"
                      title="Download again"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1A1A1E] bg-[#08080A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#16161A] rounded-lg border border-[#222226] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
