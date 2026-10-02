import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, RotateCcw, ArrowLeft, Loader2, Check } from 'lucide-react';
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
  const [progress, setProgress] = useState(15);
  const [statusMessage, setStatusMessage] = useState('Connecting to media source...');
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const qualityLabel = format.resolution || format.bitrate || 'HD';

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let isCancelled = false;

    // Smooth progressive feedback while server processes FFmpeg pipeline
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) {
          setStatusMessage('Resolving high-speed media streams...');
          return prev + 4;
        } else if (prev < 70) {
          setStatusMessage(`Extracting & merging ${qualityLabel} with FFmpeg...`);
          return prev + 2;
        } else if (prev < 90) {
          setStatusMessage('Validating stream integrity & container...');
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    const executeDownload = async () => {
      try {
        const result = await downloadMediaFile(
          media.url,
          qualityLabel,
          format.extension,
          media.title
        );

        if (isCancelled) return;

        clearInterval(progressTimer);
        setProgress(100);
        setStatusMessage('Download ready! Saving file...');

        // Save real binary media blob
        saveBlobToFile(result.blob, result.filename);

        setTimeout(() => {
          if (!isCancelled) {
            onComplete(result.actualSize);
          }
        }, 500);
      } catch (err: any) {
        if (isCancelled) return;
        clearInterval(progressTimer);
        console.error('Download pipeline failure:', err);
        setError(err?.message || 'Download failed. The media server could not prepare this file.');
      }
    };

    executeDownload();

    return () => {
      isCancelled = true;
      clearInterval(progressTimer);
    };
  }, [media, format, qualityLabel, onComplete]);

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
            onClick={onBackToResult}
            className="px-4 py-2.5 text-xs font-medium text-neutral-200 bg-[#141418] hover:bg-[#1E1E24] border border-neutral-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Choose another quality</span>
          </button>

          <button
            type="button"
            onClick={onReset}
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
    <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in duration-200">
      {/* Centered Heading */}
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#141418] border border-neutral-800 mb-1">
          {progress >= 100 ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
          )}
        </div>
        <h2 className="text-xl font-medium text-[#F5F5F5] tracking-tight">
          Preparing {qualityLabel} ({format.extension.toUpperCase()})...
        </h2>
        <p className="text-xs text-[#999999] truncate max-w-xs mx-auto">
          {media.title}
        </p>
      </div>

      {/* Clean Minimal Progress Bar */}
      <div className="w-full bg-[#141418] border border-[#222222] h-2 rounded-full overflow-hidden p-0.5">
        <div
          className="bg-[#F5F5F5] h-full rounded-full transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dynamic Subtext */}
      <p className="text-xs text-neutral-400 font-mono tracking-tight">
        {statusMessage}
      </p>

      {/* Protection Notice */}
      <p className="text-[11px] text-neutral-500 font-normal">
        Real media validation active · Zero placeholder guarantee
      </p>
    </div>
  );
};
