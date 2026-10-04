import React, { useEffect } from 'react';
import { X, ShieldCheck, Zap, Lock } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div className="bg-[#0C0C0E] border border-[#222228] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1A1A1E] flex items-center justify-between shrink-0">
          <h2 id="about-modal-title" className="text-base font-semibold text-[#F5F5F5] tracking-tight">
            About Aureven Flow
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer hover:bg-[#16161C]"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-sm overflow-y-auto flex-1">
          <p className="text-[#999999] leading-relaxed text-xs sm:text-sm">
            Aureven Flow is a clean, fast media utility engineered for effortless saving of authorized videos and audio from YouTube, Instagram, and web streams.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-[#16161A] text-neutral-300 shrink-0 border border-neutral-800">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F5F5F5] text-xs">Fast & Simple</h3>
                <p className="text-xs text-[#999999] leading-relaxed">
                  Paste your link, choose your preferred quality, and download without ads or redirects.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-[#16161A] text-neutral-300 shrink-0 border border-neutral-800">
                <Lock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F5F5F5] text-xs">Private by Design</h3>
                <p className="text-xs text-[#999999] leading-relaxed">
                  No accounts, no telemetry, and your history stays in your browser&apos;s local storage.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-[#16161A] text-neutral-300 shrink-0 border border-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F5F5F5] text-xs">Authorized Use</h3>
                <p className="text-xs text-[#999999] leading-relaxed">
                  Only download media you own or have explicit authorization to download.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#1A1A1E] bg-[#08080A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-[#16161A] rounded-xl border border-[#222226] transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
