import React, { useState } from 'react';
import { Download, ArrowLeft, Video, Music } from 'lucide-react';
import { MediaMetadata, MediaFormat } from '../types/media';

interface ResultViewProps {
  media: MediaMetadata;
  onSelectFormat: (format: MediaFormat) => void;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  media,
  onSelectFormat,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  const videoFormats = media.formats.filter((f) => f.type === 'video');
  const audioFormats = media.formats.filter((f) => f.type === 'audio');
  const currentFormats = activeTab === 'video' ? videoFormats : audioFormats;

  // Selected format for the clean dropdown selector
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    currentFormats[0]?.id || media.formats[0]?.id
  );

  const selectedFormat =
    media.formats.find((f) => f.id === selectedFormatId) || currentFormats[0];

  const handleTabSwitch = (tab: 'video' | 'audio') => {
    setActiveTab(tab);
    const firstAvailable = tab === 'video' ? videoFormats[0] : audioFormats[0];
    if (firstAvailable) {
      setSelectedFormatId(firstAvailable.id);
    }
  };

  const handleStartDownload = () => {
    if (selectedFormat) {
      onSelectFormat(selectedFormat);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Paste another link</span>
        </button>
      </div>

      {/* Main Result Card */}
      <div className="bg-[#0C0C0E] border border-[#222222] rounded-2xl overflow-hidden shadow-xl">
        {/* Media Preview Header */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start">
          {/* Thumbnail Container */}
          <div className="relative w-full sm:w-48 aspect-video sm:aspect-[16/10] bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-[#1F1F24]">
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('maxresdefault.jpg')) {
                  target.src = target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                } else if (!target.src.includes('unsplash')) {
                  target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=80';
                }
              }}
            />
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-xs text-[10px] font-mono text-neutral-200 rounded">
              {media.duration}
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-[10px] text-neutral-300 uppercase tracking-wider font-medium rounded">
              {media.platform}
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-base sm:text-lg font-medium text-[#F5F5F5] leading-snug line-clamp-2">
              {media.title}
            </h2>
            <p className="text-xs text-[#999999]">
              {media.author} · {media.duration}
            </p>
            <p className="text-[11px] text-neutral-500 truncate font-mono">
              {media.url}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1C1C20]" />

        {/* Format Selector Section */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Video / Audio Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="inline-flex p-1 bg-[#141418] border border-[#222222] rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTabSwitch('video')}
                className={`flex-1 sm:flex-none min-h-[42px] px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#24242A] text-[#F5F5F5] shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
                <span className="text-[10px] opacity-60">({videoFormats.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('audio')}
                className={`flex-1 sm:flex-none min-h-[42px] px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-[#24242A] text-[#F5F5F5] shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Audio</span>
                <span className="text-[10px] opacity-60">({audioFormats.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-neutral-400 font-mono">
              {currentFormats.length} real {activeTab} streams available
            </span>
          </div>

          {/* Clean Dropdown Format Selector */}
          <div className="bg-[#121215] border border-[#222226] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">
                  Media Type
                </label>
                <select
                  value={activeTab}
                  onChange={(e) => handleTabSwitch(e.target.value as 'video' | 'audio')}
                  className="w-full min-h-[42px] bg-[#18181C] border border-[#2A2A30] text-xs text-[#F5F5F5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-neutral-500 cursor-pointer"
                >
                  <option value="video">Video (MP4)</option>
                  <option value="audio">Audio (MP3)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1.5 font-medium">
                  Select Quality
                </label>
                <select
                  value={selectedFormatId}
                  onChange={(e) => setSelectedFormatId(e.target.value)}
                  className="w-full min-h-[42px] bg-[#18181C] border border-[#2A2A30] text-xs text-[#F5F5F5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-neutral-500 cursor-pointer"
                >
                  {currentFormats.map((fmt) => (
                    <option key={fmt.id} value={fmt.id}>
                      {fmt.resolution || fmt.bitrate} · {fmt.extension.toUpperCase()} · {fmt.size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#1E1E24]">
              <span className="text-xs text-neutral-400 sm:mb-1.5">
                Estimated: <strong className="text-emerald-400 font-mono">{selectedFormat?.size}</strong>
              </span>
              <button
                type="button"
                onClick={handleStartDownload}
                className="min-h-[42px] px-6 py-2 text-xs font-semibold bg-[#F5F5F5] text-[#050505] hover:bg-white active:scale-[0.98] rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Available Qualities List */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
              Available Formats ({currentFormats.length})
            </h3>

            <div className="divide-y divide-[#1A1A20] border border-[#202026] rounded-2xl overflow-hidden bg-[#101014]">
              {currentFormats.map((format) => (
                <div
                  key={format.id}
                  className="p-3.5 sm:px-4 sm:py-3.5 flex items-center justify-between gap-2 hover:bg-[#15151B] transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-[#F5F5F5]">
                      {format.resolution || format.bitrate}
                    </span>
                    <span className="text-neutral-600 text-xs">·</span>
                    <span className="text-xs text-neutral-400 uppercase font-mono">
                      {format.extension}
                    </span>
                    <span className="text-neutral-600 text-xs">·</span>
                    <span className="text-xs text-emerald-400/90 font-mono">
                      {format.size}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectFormat(format)}
                    className="min-h-[38px] px-3.5 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-[#1C1C22] hover:bg-[#25252D] border border-[#2E2E38] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    aria-label={`Download ${format.resolution || format.bitrate}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
