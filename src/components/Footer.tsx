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
    <footer className="w-full max-w-4xl mx-auto px-6 py-12 text-center border-t border-[#141418] space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#F5F5F5] uppercase">
          Aureven Flow
        </p>
        <p className="text-xs text-[#999999]">
          Download your media. Simple. Fast.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="hover:text-neutral-300 transition-colors cursor-pointer"
        >
          Privacy
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={onOpenTerms}
          className="hover:text-neutral-300 transition-colors cursor-pointer"
        >
          Terms
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={onOpenAbout}
          className="hover:text-neutral-300 transition-colors cursor-pointer"
        >
          About
        </button>
      </div>

      <p className="text-[11px] text-neutral-600">
        © 2026 Aureven Flow
      </p>

      {/* Small content authorization notice */}
      <p className="text-[11px] text-neutral-600 max-w-md mx-auto pt-1">
        Only download content you own or are authorized to download.
      </p>
    </footer>
  );
};
