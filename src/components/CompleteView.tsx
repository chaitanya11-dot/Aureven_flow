import React, { useState } from 'react';
import { Check, Download, RotateCcw, ShieldCheck, Play, Film, Music, Sparkles } from 'lucide-react';
import { MediaFormat, MediaMetadata } from '../types/media';
import { triggerNativeDownload, extractYouTubeId } from '../services/mediaService';

interface CompleteViewProps {
  media: MediaMetadata;
  format: MediaFormat;
  onDownloadAnother: () => void;
}

export const CompleteView: React.FC<CompleteViewProps> = ({
  media,
  format,
  onDownloadAnother,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [downloaded, setDownloaded] = useState(true);

  const qualityTitle = format.resolution || format.bitrate || '1080p';
  const displaySize = media.actualDownloadedSize || format.size;
  const ytId = extractYouTubeId(media.url);

  const handleDownloadAgain = () => {
    triggerNativeDownload(
      media.url,
      qualityTitle,
      format.extension,
      media.title
    );
    setDownloaded(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 text-center space-y-6 animate-in fade-in duration-200">
      {/* Success Badge */}
      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
        <Check className="w-6 h-6 stroke-[2.5]" />
      </div>

      {/* Main Ready Notice */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold text-[#F5F5F5] tracking-tight">
          Your media is ready
        </h2>
        <p className="text-sm text-neutral-200 font-medium line-clamp-2 max-w-md mx-auto">
          {media.title}
        </p>
        <p className="text-xs text-neutral-400 font-mono">
          {qualityTitle} · {format.extension.toUpperCase()} · <span className="text-emerald-400 font-medium">{displaySize}</span>
        </p>
      </div>

      {/* Interactive In-App Player / Preview */}
      <div className="bg-[#0C0C0F] border border-[#222228] rounded-2xl p-4 shadow-xl text-left space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-medium text-neutral-300">
            {format.type === 'video' ? (
              <Film className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Music className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>Original Media Player</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{showPreview ? 'Close Player' : 'Play Video'}</span>
          </button>
        </div>

        {showPreview ? (
          <div className="rounded-xl overflow-hidden bg-black border border-neutral-800">
            {ytId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1`}
                title={media.title}
                className="w-full aspect-video rounded-xl bg-black border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : format.type === 'video' ? (
              <video
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full max-h-64 rounded-xl object-contain bg-black"
                src={media.url}
                poster={media.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="p-4 bg-neutral-900/60 rounded-xl space-y-2">
                <audio
                  controls
                  autoPlay
                  preload="metadata"
                  className="w-full"
                  src={media.url}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => setShowPreview(true)}
            className="relative rounded-xl overflow-hidden aspect-video max-h-52 bg-neutral-900 border border-neutral-800 cursor-pointer group flex items-center justify-center"
          >
            {media.thumbnail ? (
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity"
              />
            ) : (
              <div className="w-full h-full bg-neutral-900" />
            )}
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="w-13 h-13 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-[11px] text-white font-medium flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-current text-blue-400" />
              <span>Click to play original video</span>
            </div>
          </div>
        )}

        {/* Compatibility badge */}
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Actual Size: {displaySize} · Verified Stream · Universal Compatibility</span>
        </div>
      </div>

      {/* Download Action Buttons */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={handleDownloadAgain}
          className="w-full py-4 px-5 text-sm font-semibold bg-white text-[#050505] hover:bg-neutral-100 active:scale-[0.99] rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl"
        >
          <Download className="w-4 h-4 stroke-[2.4]" />
          <span>
            {downloaded
              ? `Download ${qualityTitle} (${format.extension.toUpperCase()}) Again`
              : `Download ${qualityTitle} (${format.extension.toUpperCase()})`}
          </span>
        </button>

        <button
          type="button"
          onClick={onDownloadAnother}
          className="w-full py-2.5 px-4 text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#121216] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Download another video</span>
        </button>
      </div>
    </div>
  );
};
