import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0C0C0E] border border-[#222222] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-[#1A1A1E] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F5F5F5]">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-[#999999] leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                Aureven Flow is designed with complete privacy as a foundational principle.
              </p>
              <p>
                • We do not track, profile, or sell user browsing habits or downloaded links.
              </p>
              <p>
                • Download history is saved purely within your web browser’s local storage and never synchronized to any external server.
              </p>
              <p>
                • Media requests are transiently processed solely to deliver the requested stream.
              </p>
            </>
          ) : (
            <>
              <p>
                By using Aureven Flow, you agree to respect copyright and intellectual property rights.
              </p>
              <p>
                • You agree to only download media that you own or have explicit authorization from copyright holders to download.
              </p>
              <p>
                • Aureven Flow is provided for personal backup, offline research, and authorized creator asset retrieval.
              </p>
              <p>
                • Commercial redistribution of unauthorized third-party media is strictly prohibited.
              </p>
            </>
          )}
        </div>

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
