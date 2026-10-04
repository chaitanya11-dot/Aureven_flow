import React from 'react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  return (
    <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center border-t border-[#141418] space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#F5F5F5] uppercase">
          Aureven Flow
        </p>
        <p className="text-xs text-[#999999]">
          Fast, simple and free media downloading.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-neutral-400">
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="min-h-[36px] px-2.5 py-1.5 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-[#101014]"
        >
          Privacy Policy
        </button>
        <span className="text-neutral-700 hidden sm:inline">·</span>
        <button
          type="button"
          onClick={onOpenTerms}
          className="min-h-[36px] px-2.5 py-1.5 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-[#101014]"
        >
          Terms of Use
        </button>
        <span className="text-neutral-700 hidden sm:inline">·</span>
        <button
          type="button"
          onClick={onOpenAbout}
          className="min-h-[36px] px-2.5 py-1.5 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-[#101014]"
        >
          Responsible Use
        </button>
      </div>

      <p className="text-[11px] text-neutral-600">
        © 2026 Aureven Flow · All rights reserved
      </p>

      {/* Responsible use notice */}
      <p className="text-[11px] text-neutral-600 max-w-md mx-auto pt-1 leading-relaxed">
        Aureven Flow is intended for downloading content you own or are legally authorized to download.
      </p>
    </footer>
  );
};

