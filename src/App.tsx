import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UrlInput } from './components/UrlInput';
import { ResultView } from './components/ResultView';
import { ProcessingView } from './components/ProcessingView';
import { CompleteView } from './components/CompleteView';
import { HistoryModal } from './components/HistoryModal';
import { AboutModal } from './components/AboutModal';
import { LegalModal } from './components/LegalModal';
import { Footer } from './components/Footer';
import {
  MediaMetadata,
  MediaFormat,
  DownloadHistoryItem,
} from './types/media';
import {
  analyzeMediaUrl,
  getHistory,
  saveToHistory,
  clearHistory,
} from './services/mediaService';

type ViewState = 'idle' | 'result' | 'processing' | 'complete';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [media, setMedia] = useState<MediaMetadata | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleAnalyze = async (url: string) => {
    try {
      setIsAnalyzing(true);
      const result = await analyzeMediaUrl(url);
      setMedia(result);
      setViewState('result');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectFormat = (format: MediaFormat) => {
    setSelectedFormat(format);
    setViewState('processing');
  };

  const handleProcessingComplete = (actualSize: string) => {
    if (media && selectedFormat) {
      setMedia({
        ...media,
        actualDownloadedSize: actualSize,
      });
      saveToHistory({
        title: media.title,
        url: media.url,
        platform: media.platform,
        formatLabel: selectedFormat.label,
        fileSize: actualSize,
        thumbnail: media.thumbnail,
      });
      setHistory(getHistory());
    }
    setViewState('complete');
  };

  const handleReset = () => {
    setMedia(null);
    setSelectedFormat(null);
    setViewState('idle');
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#050505] text-[#F5F5F5]">
      {/* Top Bar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        historyCount={history.length}
        onReset={handleReset}
      />

      {/* Main Flow Container */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-16 w-full max-w-4xl mx-auto">
        {viewState === 'idle' && (
          <UrlInput
            onAnalyze={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={isHistoryOpen || isAboutOpen || legalModal !== null}
          />
        )}

        {viewState === 'result' && media && (
          <ResultView
            media={media}
            onSelectFormat={handleSelectFormat}
            onReset={handleReset}
          />
        )}

        {viewState === 'processing' && media && selectedFormat && (
          <ProcessingView
            media={media}
            format={selectedFormat}
            onComplete={handleProcessingComplete}
            onBackToResult={() => setViewState('result')}
            onReset={handleReset}
          />
        )}

        {viewState === 'complete' && media && selectedFormat && (
          <CompleteView
            media={media}
            format={selectedFormat}
            onDownloadAnother={handleReset}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <Footer
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPrivacy={() => setLegalModal('privacy')}
        onOpenTerms={() => setLegalModal('terms')}
      />

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <LegalModal
        isOpen={legalModal !== null}
        type={legalModal}
        onClose={() => setLegalModal(null)}
      />
    </div>
  );
}
