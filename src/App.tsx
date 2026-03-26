import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { ErrorDisplay } from './components/ErrorDisplay';
import { MatrixBackground } from './components/MatrixBackground';
import { ThemeToggle } from './components/ThemeToggle';
import { useAppStore } from './store/useAppStore';
import { useThemeSync } from './hooks/useThemeSync';
import { useThemeColors } from './hooks/useThemeColors';
import { getPyodide } from './utils/pyodide';
import { analyzeData } from './utils/analyzeData';
import { getExcelSheetNames } from './utils/getExcelSheetNames';
import { SAMPLE_DATASETS, type SampleDataset } from './data/sampleDatasets';
import { categorizeError } from './utils/errorHandler';
import { HelpCircle } from 'lucide-react';
import * as pako from 'pako';
import { SheetSelectorModal } from './components/SheetSelectorModal';

// Lazy-load keyboard shortcuts modal (not needed until "?" key pressed)
const KeyboardShortcutsModal = lazy(() =>
  import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal }))
);

function App() {
  const {
    datasetName,
    analysisResult,
    setDataset,
    clearDataset,
    setAnalysisResult,
  } = useAppStore();

  // Sync theme with document class
  useThemeSync();

  // Get current theme colors (updates when theme changes)
  const colors = useThemeColors();

  // Local state for loading/errors (main thread fallback)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [pyodideLoadingMessage, setPyodideLoadingMessage] = useState('Initializing...');
  const [pyodideProgress, setPyodideProgress] = useState(0);
  const [error, setError] = useState<unknown | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<{ name: string; text: string } | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Sheet selector state for multi-sheet Excel files
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [pendingExcelFile, setPendingExcelFile] = useState<{ name: string; base64: string } | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);

  // Shared analysis logic (main thread fallback)
  const runAnalysis = useCallback(async (
    name: string,
    data: string,
    fileType: 'csv' | 'xlsx' = 'csv',
    sheetName?: string
  ) => {
    try {
      setError(null);
      setLastFailedFile(null);
      setDataset(name, data);

      // Initialize Pyodide (first time only)
      setIsPyodideLoading(true);
      await getPyodide((message, percentage) => {
        setPyodideLoadingMessage(message);
        setPyodideProgress(percentage);
      });
      setIsPyodideLoading(false);

      // Run analysis on main thread
      setIsAnalyzing(true);
      const result = await analyzeData(data, fileType, sheetName);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    } catch (err) {
      setIsAnalyzing(false);
      setIsPyodideLoading(false);
      setError(err);
      setLastFailedFile({ name, text: data });
      console.error('Analysis failed:', err);
    }
  }, [setDataset, setAnalysisResult]);

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const fileType = file.name.endsWith('.xlsx') ? 'xlsx' : 'csv';

      if (fileType === 'xlsx') {
        // Convert Excel file to base64 for Pyodide
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        // Check for multiple sheets
        setIsPyodideLoading(true);
        await getPyodide(); // Ensure Pyodide is loaded
        const sheetNames = await getExcelSheetNames(base64);
        setIsPyodideLoading(false);

        if (sheetNames.length > 1) {
          // Multiple sheets - show selector
          setPendingExcelFile({ name: file.name, base64 });
          setAvailableSheets(sheetNames);
          setShowSheetSelector(true);
        } else {
          // Single sheet - analyze directly
          await runAnalysis(file.name, base64, 'xlsx');
        }
      } else {
        // Read CSV as text
        const text = await file.text();
        await runAnalysis(file.name, text, 'csv');
      }
    } catch (error) {
      console.error('File read failed:', error);
      setError(new Error('Failed to read file. The file may be corrupted or inaccessible.'));
      setIsPyodideLoading(false);
    }
  }, [runAnalysis]);

  // Handle sheet selection from modal
  const handleSheetSelect = useCallback(async (sheetName: string) => {
    if (!pendingExcelFile) return;

    setShowSheetSelector(false);
    await runAnalysis(pendingExcelFile.name, pendingExcelFile.base64, 'xlsx', sheetName);
    setPendingExcelFile(null);
    setAvailableSheets([]);
  }, [pendingExcelFile, runAnalysis]);

  // Handle sheet selector cancel
  const handleSheetCancel = useCallback(() => {
    setShowSheetSelector(false);
    setPendingExcelFile(null);
    setAvailableSheets([]);
  }, []);

  // Handle example dataset selection
  const handleExampleSelect = useCallback(async (dataset: SampleDataset) => {
    try {
      let csvText: string;

      if (dataset.filePath) {
        // Load from /public directory
        const response = await fetch(dataset.filePath);
        if (!response.ok) {
          throw new Error(`Failed to load dataset: ${response.statusText}`);
        }

        // Check if the file is gzipped
        if (dataset.filePath.endsWith('.gz')) {
          // Decompress gzipped file
          const arrayBuffer = await response.arrayBuffer();
          const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
          csvText = decompressed;
        } else {
          // Read as text for uncompressed files
          csvText = await response.text();
        }
      } else if (dataset.csv) {
        // Use embedded CSV
        csvText = dataset.csv;
      } else {
        throw new Error('Dataset has neither csv nor filePath');
      }

      await runAnalysis(dataset.name, csvText);
    } catch (error) {
      console.error('Failed to load example dataset:', error);
      setError(new Error(`Failed to load example dataset. ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }, [runAnalysis]);

  // Handle retry after error
  const handleRetry = useCallback(async () => {
    if (lastFailedFile) {
      await runAnalysis(lastFailedFile.name, lastFailedFile.text);
    }
  }, [lastFailedFile, runAnalysis]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Show shortcuts modal on "?" key
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsModal(true);
      }

    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-bg-page font-sans flex flex-col">
      {/* Header */}
      <header className="relative bg-bg-surface border-b border-border-default px-6 py-4 overflow-hidden">
        {/* Subtle animated background */}
        <MatrixBackground
          fontSize={10}
          speed={80}
          color={colors.matrixChar}
          backgroundColor={colors.matrixBg}
        />

        {/* Content - positioned above background */}
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,#0066CC_0%,#0D9488_100%)] flex items-center justify-center shadow-lg shadow-primary/20">
               <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Glimpse
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">
                Privacy-First Data Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors duration-150 active:scale-95"
              title="Keyboard Shortcuts (?)"
              aria-label="Show keyboard shortcuts"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12 relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
        
        {analysisResult && datasetName ? (
          <AnalysisView
            datasetName={datasetName}
            result={analysisResult}
            onClear={clearDataset}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10">
            <div className="mb-12 text-center max-w-2xl">
              <h2 className="text-5xl font-extrabold leading-[1.15] text-text-primary mb-6 tracking-tight">
                Get instant insights <br /> 
                <span className="bg-[linear-gradient(135deg,#0066CC_0%,#0D9488_100%)] bg-clip-text text-transparent">from your data</span>
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Upload a CSV or Excel file to see statistics, distributions, and quality checks.
                <br />
                All processing happens locally on your machine.
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              onExampleSelect={handleExampleSelect}
              sampleDatasets={SAMPLE_DATASETS}
              isLoading={isAnalyzing || isPyodideLoading}
            />

            {/* Loading Indicator */}
            {(isPyodideLoading || isAnalyzing) && (
              <div className="mt-6 p-4 max-w-2xl mx-auto bg-bg-surface border border-border-default rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text-primary">
                    {isPyodideLoading
                      ? `🐍 ${pyodideLoadingMessage}`
                      : '📊 Analyzing your data...'}
                  </p>
                  {isPyodideLoading && (
                    <span className="text-xs font-mono text-text-secondary">{pyodideProgress}%</span>
                  )}
                </div>
                {isPyodideLoading && (
                  <p className="text-xs text-text-secondary mb-2">First time only, ~30MB download</p>
                )}
                <div className="w-full bg-border-default rounded-full h-2 overflow-hidden">
                  {isPyodideLoading ? (
                    <div
                      className="bg-primary h-full transition-all duration-300 ease-out"
                      style={{ width: `${pyodideProgress}%` }}
                    />
                  ) : (
                    <div className="bg-primary h-full animate-pulse w-full" />
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {Boolean(error) && (
              <ErrorDisplay
                error={error!}
                onRetry={categorizeError(error!).canRetry ? handleRetry : undefined}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <Suspense fallback={null}>
        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
        />
      </Suspense>

      {/* Footer */}
      <footer className="relative border-t border-border-default px-6 py-4 bg-bg-surface overflow-hidden">
        {/* Subtle animated background */}
        <MatrixBackground
          fontSize={10}
          speed={80}
          color={colors.matrixChar}
          backgroundColor={colors.matrixBg}
        />

        {/* Content - positioned above background */}
        <div className="relative z-10 max-w-6xl mx-auto text-center text-sm text-text-secondary">
          <p>
            No data ever leaves your machine • Powered by{' '}
            <a
              href="https://pyodide.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors duration-150"
            >
              Pyodide
            </a>
            {' • Built by '}
            <a
              href="https://mattbayne.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors duration-150"
            >
              Matt Bayne
            </a>
          </p>
        </div>
      </footer>

      {/* Sheet selector modal for multi-sheet Excel files */}
      {showSheetSelector && pendingExcelFile && (
        <SheetSelectorModal
          fileName={pendingExcelFile.name}
          sheetNames={availableSheets}
          onSelectSheet={handleSheetSelect}
          onCancel={handleSheetCancel}
        />
      )}
    </div>
  );
}

export default App;
