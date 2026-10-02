import React from 'react';
import { X, ShieldCheck, Zap, Lock } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0C0C0E] border border-[#222222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1A1A1E] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F5F5F5] tracking-tight">
            About Aureven Flow
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          <p className="text-[#999999] leading-relaxed">
            Aureven Flow is a clean, fast media utility engineered for effortless saving of authorized videos and audio from YouTube, Instagram, and web streams.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex gap-3 items-start">
              <div className="p-1.5 rounded bg-[#16161A] text-neutral-300 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-[#F5F5F5] text-xs">Fast & Simple</h3>
                <p className="text-xs text-[#999999] leading-normal">
                  Paste your link, choose your preferred quality, and download without ads or redirects.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1.5 rounded bg-[#16161A] text-neutral-300 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-[#F5F5F5] text-xs">Private by Design</h3>
                <p className="text-xs text-[#999999] leading-normal">
                  No accounts, no user telemetry, and your history stays on your browser only.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1.5 rounded bg-[#16161A] text-neutral-300 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-[#F5F5F5] text-xs">Authorized Use</h3>
                <p className="text-xs text-[#999999] leading-normal">
                  Only download content you own or have explicit authorization to download.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1A1A1E] bg-[#08080A] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#16161A] rounded-lg border border-[#222226] transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
