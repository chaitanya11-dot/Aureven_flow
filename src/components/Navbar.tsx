import React from 'react';
import { History, Info } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenAbout: () => void;
  historyCount: number;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenAbout,
  historyCount,
  onReset,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
      <button
        onClick={onReset}
        className="text-left group cursor-pointer focus:outline-none"
      >
        <span className="text-sm font-semibold tracking-[0.2em] text-[#F5F5F5] uppercase group-hover:text-white transition-colors">
          Aureven Flow
        </span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHistory}
          className="px-3.5 py-1.5 text-xs font-medium text-[#999999] hover:text-[#F5F5F5] hover:bg-[#0C0C0E] border border-transparent hover:border-[#222222] rounded-md transition-all flex items-center gap-2 cursor-pointer focus:outline-none"
          title="Download History"
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#1A1A1D] border border-[#333333] text-[10px] text-[#F5F5F5] flex items-center justify-center font-mono">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenAbout}
          className="px-3.5 py-1.5 text-xs font-medium text-[#999999] hover:text-[#F5F5F5] hover:bg-[#0C0C0E] border border-transparent hover:border-[#222222] rounded-md transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
          title="About Aureven Flow"
        >
          <Info className="w-3.5 h-3.5" />
          <span>About</span>
        </button>
      </div>
    </header>
  );
};
