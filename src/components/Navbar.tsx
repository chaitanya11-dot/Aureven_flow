import React, { useState } from 'react';
import { Info, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenAbout: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAbout,
  onReset,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-40">
      {/* Brand Logo & Name */}
      <button
        onClick={() => {
          setMobileMenuOpen(false);
          onReset();
        }}
        className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5 min-h-[44px]"
        aria-label="Aureven Flow Home"
      >
        <div className="w-8 h-8 rounded-xl bg-[#0E0E12] border border-[#222228] p-1 flex items-center justify-center shadow-md group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all">
          <img
            src="/icon.png"
            alt="Aureven Flow Logo"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
        </div>
        <span className="text-sm font-semibold tracking-[0.2em] text-[#F5F5F5] uppercase group-hover:text-white transition-colors">
          Aureven Flow
        </span>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex items-center gap-2">
        <button
          onClick={onOpenAbout}
          className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-[#999999] hover:text-[#F5F5F5] hover:bg-[#121216] border border-transparent hover:border-[#222226] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
          title="About Aureven Flow"
          aria-label="About Aureven Flow"
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </nav>

      {/* Mobile Hamburger Toggle (Touch-friendly 44x44) */}
      <div className="flex sm:hidden items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-300 hover:text-white bg-[#101014] border border-[#222226] rounded-xl transition-colors cursor-pointer"
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 bg-[#0E0E12] border border-[#222228] rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 sm:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAbout();
            }}
            className="w-full min-h-[44px] px-4 py-2.5 text-xs font-medium text-neutral-200 hover:bg-[#18181F] rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <Info className="w-4 h-4 text-neutral-400" />
            <span>About Aureven Flow</span>
          </button>
        </div>
      )}
    </header>
  );
};
