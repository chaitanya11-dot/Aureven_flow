import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, RotateCcw, ArrowLeft, DownloadCloud, Sparkles } from 'lucide-react';
import { MediaFormat, MediaMetadata } from '../types/media';
import { downloadMediaFile, saveBlobToFile } from '../services/mediaService';

interface ProcessingViewProps {
  media: MediaMetadata;
  format: MediaFormat;
  onComplete: (actualSize: string) => void;
  onBackToResult: () => void;
  onReset: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  media,
  format,
  onComplete,
  onBackToResult,
  onReset,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Connecting to media source & preparing stream...');
  const hasTriggeredRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const qualityLabel = format.resolution || format.bitrate || 'HD';

  // Live timer for elapsed download time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update dynamic status messages as time progresses
  useEffect(() => {
    if (elapsedSeconds > 3 && elapsedSeconds <= 8) {
      setStatusMessage('Extracting video and audio streams...');
    } else if (elapsedSeconds > 8 && elapsedSeconds <= 20) {
      setStatusMessage('Merging and packaging high-quality stream...');
    } else if (elapsedSeconds > 20) {
      setStatusMessage('Finalizing download and transferring to browser...');
    }
  }, [elapsedSeconds]);

  useEffect(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function executeDownload() {
      try {
        const result = await downloadMediaFile(
          media.url,
          qualityLabel,
          format.extension,
          media.title,
          controller.signal
        );

        // Save real binary file to user's disk
        saveBlobToFile(result.blob, result.filename);

        // Transition to complete
        onComplete(result.actualSize || format.size || 'HD Stream');
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          return;
        }
        console.error('Download execution error:', err);
        setError(err?.message || 'Download could not be completed. Please try again.');
      }
    }

    executeDownload();
    // Do not abort on simple component re-render / StrictMode remounts
  }, [media.url, format.extension, qualityLabel, media.title, format.size, onComplete]);

  const handleUserCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onReset();
  };

  const handleUserBack = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onBackToResult();
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="w-6 h-6 stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#F5F5F5] tracking-tight">
            Download failed
          </h2>
          <p className="text-xs text-red-300/90 leading-relaxed max-w-sm mx-auto">
            {error}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={handleUserBack}
            className="px-4 py-2.5 text-xs font-medium text-neutral-200 bg-[#141418] hover:bg-[#1E1E24] border border-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Choose another quality</span>
          </button>

          <button
            type="button"
            onClick={handleUserCancel}
            className="px-4 py-2.5 text-xs font-medium text-neutral-400 hover:text-white bg-transparent hover:bg-[#121215] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try another link</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 text-center space-y-6 animate-in fade-in duration-200">
      {/* Animated Downloading Status Header */}
      <div className="space-y-2.5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-1 relative">
          <DownloadCloud className="w-7 h-7 text-cyan-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <h2 className="text-xl font-medium text-[#F5F5F5] tracking-tight">
          Downloading {qualityLabel} ({format.extension.toUpperCase()})
        </h2>
        <p className="text-xs text-[#999999] truncate max-w-xs mx-auto">
          {media.title}
        </p>
      </div>

      {/* Background Download Notice Card with Live Status */}
      <div className="bg-[#121216] border border-[#222228] rounded-2xl p-5 text-left space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Active Processing</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {formatElapsed(elapsedSeconds)} elapsed
          </span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          {statusMessage}
        </p>

        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Format: <strong className="text-neutral-200">{qualityLabel} · {format.extension.toUpperCase()}</strong></span>
          <span>Target Size: <strong className="text-cyan-400">{format.size}</strong></span>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleUserBack}
          className="flex-1 py-2.5 px-3 text-xs font-medium text-neutral-300 bg-[#121216] hover:bg-[#1C1C22] border border-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Other Qualities</span>
        </button>

        <button
          type="button"
          onClick={handleUserCancel}
          className="flex-1 py-2.5 px-3 text-xs font-medium text-neutral-300 bg-[#121216] hover:bg-[#1C1C22] border border-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};
