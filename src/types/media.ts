export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'web';

export interface MediaFormat {
  id: string;
  type: 'video' | 'audio';
  resolution?: string;
  bitrate?: string;
  height?: number;
  extension: string;
  size: string;
  label: string;
  isEstimated?: boolean;
}

export interface MediaMetadata {
  id: string;
  url: string;
  title: string;
  platform: PlatformType;
  duration: string;
  author: string;
  thumbnail: string;
  formats: MediaFormat[];
  actualDownloadedSize?: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: PlatformType;
  formatLabel: string;
  fileSize: string;
  thumbnail: string;
  downloadedAt: number;
}
