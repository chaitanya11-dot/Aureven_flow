import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-[#0C0C0E] border border-[#222228] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 border-b border-[#1A1A1E] flex items-center justify-between shrink-0">
          <h2 id="legal-modal-title" className="text-base font-semibold text-[#F5F5F5]">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
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

        <div className="p-5 sm:p-6 space-y-4 text-xs text-[#999999] leading-relaxed overflow-y-auto flex-1">
          {type === 'privacy' ? (
            <>
              <p className="text-neutral-300">
                Aureven Flow is designed with user privacy and zero data harvesting as foundational principles:
              </p>
              <ul className="space-y-2 list-disc pl-4 text-neutral-400">
                <li>We do not track, profile, or monetize user browsing habits or requested links.</li>
                <li>Your download history is kept exclusively within your device&apos;s local browser storage and is never uploaded.</li>
                <li>Transferred media streams are strictly transient and purged from server temporary storage immediately upon download completion.</li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-neutral-300">
                By using Aureven Flow, you acknowledge and agree to the following responsible use guidelines:
              </p>
              <ul className="space-y-2 list-disc pl-4 text-neutral-400">
                <li>You agree to only download media that you own, have explicit authorization from copyright owners to download, or which is in the public domain.</li>
                <li>Aureven Flow is provided for personal backup, offline viewing, and authorized creator asset management.</li>
                <li>Commercial distribution or monetization of unauthorized third-party materials is strictly prohibited.</li>
              </ul>
            </>
          )}
        </div>

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
