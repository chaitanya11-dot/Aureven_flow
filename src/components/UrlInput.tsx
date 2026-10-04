import React, { useState, useEffect, useRef } from 'react';
import { Link2, ArrowRight, X, Check, Clipboard, Loader2 } from 'lucide-react';
import { detectPlatform, SAMPLE_LINKS } from '../services/mediaService';

interface UrlInputProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  onAnalyze,
  isLoading,
  disabled = false,
}) => {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shortcutKey, setShortcutKey] = useState('⌘V');
  const [autoPastedNotice, setAutoPastedNotice] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAnalyzingRef = useRef(false);

  // Keep ref in sync with loading state
  useEffect(() => {
    isAnalyzingRef.current = isLoading;
  }, [isLoading]);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isMac = /Mac|iPhone|iPod|iPad/i.test(
        navigator.platform || navigator.userAgent
      );
      setShortcutKey(isMac ? '⌘V' : 'Ctrl+V');
    }
  }, []);

  // Autofocus on mount when on idle page
  useEffect(() => {
    if (!disabled && !isLoading) {
      inputRef.current?.focus();
    }
  }, [disabled, isLoading]);

  // Validation
  useEffect(() => {
    if (!url.trim()) {
      setDetectedPlatform(null);
      setError(null);
      return;
    }

    const platform = detectPlatform(url);
    if (platform) {
      setDetectedPlatform(platform);
      setError(null);
    } else if (url.length > 8) {
      setDetectedPlatform(null);
      setError('Please enter a valid YouTube, Instagram, TikTok, or video link');
    }
  }, [url]);

  // Global Keyboard Shortcut: Cmd+V / Ctrl+V or native paste
  useEffect(() => {
    if (disabled) return;

    let pasteHandledTimeout: ReturnType<typeof setTimeout> | null = null;
    let justHandledPaste = false;

    const triggerAutoAnalyze = (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || isAnalyzingRef.current) return;

      setUrl(trimmed);
      setError(null);
      setAutoPastedNotice(true);
      setTimeout(() => setAutoPastedNotice(false), 2500);

      justHandledPaste = true;
      if (pasteHandledTimeout) clearTimeout(pasteHandledTimeout);
      pasteHandledTimeout = setTimeout(() => {
        justHandledPaste = false;
      }, 500);

      onAnalyze(trimmed);
    };

    // 1. Native paste event on window (catches Cmd+V, Ctrl+V, context menu paste anywhere)
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (disabled || isAnalyzingRef.current) return;

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && pastedText.trim()) {
        e.preventDefault();
        triggerAutoAnalyze(pastedText);
      }
    };

    // 2. Keyboard shortcut fallback if focus was outside document body
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (disabled || isAnalyzingRef.current) return;

      const isPasteCombo =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v';

      if (isPasteCombo && !justHandledPaste) {
        // If the paste event doesn't fire (e.g. background element clicked), read from clipboard API
        if (document.activeElement !== inputRef.current) {
          try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
              e.preventDefault();
              triggerAutoAnalyze(text);
            }
          } catch {
            // If clipboard permissions prompt or blocked, focus input so standard paste works
            inputRef.current?.focus();
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
      window.removeEventListener('keydown', handleKeyDown);
      if (pasteHandledTimeout) clearTimeout(pasteHandledTimeout);
    };
  }, [disabled, onAnalyze]);

  const handlePasteButtonClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const trimmed = text.trim();
        setUrl(trimmed);
        inputRef.current?.focus();
        onAnalyze(trimmed);
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
    setDetectedPlatform(null);
    setError(null);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    const platform = detectPlatform(url);
    if (!platform) {
      setError('Please paste a valid video URL');
      return;
    }

    onAnalyze(url);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setError(null);
    onAnalyze(sampleUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center px-4">
      {/* Hero Headline */}
      <div className="mb-10 space-y-3">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#F5F5F5] leading-[1.15]">
          Download your media.
          <span className="block text-[#999999] font-normal">Effortlessly.</span>
        </h1>
        <p className="text-sm sm:text-base text-[#999999] max-w-md mx-auto leading-relaxed">
          Paste a supported video link and choose the quality you want.
        </p>
      </div>

      {/* Main URL Input Container */}
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={`relative flex items-center bg-[#0C0C0E] border rounded-xl transition-all duration-200 shadow-sm ${
            error
              ? 'border-red-900/60 ring-1 ring-red-500/20'
              : detectedPlatform
              ? 'border-[#333333] ring-1 ring-neutral-700/40'
              : 'border-[#222222] hover:border-[#333333] focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-600/30'
          }`}
        >
          {/* Left Icon */}
          <div className="pl-4 sm:pl-5 pr-2 text-[#999999] flex items-center">
            <Link2 className="w-5 h-5" />
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube, Instagram, TikTok, or video link..."
            disabled={isLoading || disabled}
            className="w-full py-4 text-sm sm:text-base bg-transparent text-[#F5F5F5] placeholder:text-neutral-600 focus:outline-none disabled:opacity-50"
          />

          {/* Action buttons inside input */}
          <div className="flex items-center gap-1.5 pr-2 sm:pr-3 shrink-0">
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-neutral-400 hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
                title="Clear input"
                aria-label="Clear input text"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {!url && (
              <button
                type="button"
                onClick={handlePasteButtonClick}
                className="min-h-[40px] px-2.5 sm:px-3 text-xs text-[#999999] hover:text-[#F5F5F5] hover:bg-[#1A1A1D] border border-neutral-800 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title={`Paste and analyze automatically (${shortcutKey})`}
                aria-label="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 shrink-0" />
                <span>Paste</span>
                <kbd className="hidden md:inline-block px-1 py-0.5 text-[10px] text-neutral-500 bg-[#121215] border border-neutral-800 rounded font-mono">
                  {shortcutKey}
                </kbd>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="min-h-[40px] px-3.5 sm:px-5 text-xs sm:text-sm font-semibold bg-[#F5F5F5] text-[#050505] hover:bg-white active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              aria-label="Analyze URL"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#050505]" />
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation & Feedback Status */}
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs min-h-[20px] px-1 gap-1">
          {autoPastedNotice && (
            <span className="text-neutral-300 flex items-center gap-1.5 font-medium transition-opacity animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              Pasted from clipboard — analyzing...
            </span>
          )}

          {!autoPastedNotice && detectedPlatform && !error && (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium transition-opacity">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Link recognized
            </span>
          )}

          {!autoPastedNotice && error && (
            <span className="text-red-400 transition-opacity">
              {error}
            </span>
          )}

          {!autoPastedNotice && !detectedPlatform && !error && (
            <span className="text-neutral-500 text-[11px]">
              Press <kbd className="px-1 py-0.5 bg-[#121215] border border-neutral-800 rounded font-mono text-[10px] text-neutral-400">{shortcutKey}</kbd> anywhere to paste & analyze
            </span>
          )}

          <span className="text-neutral-500 text-[11px]">
            Direct download in original quality
          </span>
        </div>
      </form>

      {/* Quick Sample Links for 1-Click Verification */}
      <div className="mt-6 pt-4 border-t border-[#161618] flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium w-full sm:w-auto mb-1 sm:mb-0">
          Try sample:
        </span>
        {SAMPLE_LINKS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            className="min-h-[36px] text-xs text-neutral-400 hover:text-neutral-200 bg-[#0C0C0E] hover:bg-[#151518] px-3 py-1.5 rounded-lg border border-[#222222] transition-colors cursor-pointer"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Trust Signoff Below Input */}
      <div className="mt-8 text-xs text-neutral-500 tracking-wider">
        Fast · Simple · Private
      </div>
    </div>
  );
};
