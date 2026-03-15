import { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { ErrorDisplay } from './components/ErrorDisplay';
import { MatrixBackground } from './components/MatrixBackground';
import { useAppStore } from './store/useAppStore';
import { getPyodide } from './utils/pyodide';
import { analyzeData } from './utils/analyzeData';
import { IRIS_DATASET } from './data/sampleDatasets';
import { categorizeError } from './utils/errorHandler';

function App() {
  const {
    datasetName,
    analysisResult,
    setDataset,
    clearDataset,
    setAnalysisResult,
  } = useAppStore();

  // Local state for loading/errors (main thread fallback)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<{ name: string; text: string } | null>(null);

  // Shared analysis logic (main thread fallback)
  const runAnalysis = useCallback(async (name: string, csvText: string) => {
    try {
      setError(null);
      setLastFailedFile(null);
      setDataset(name, csvText);

      // Initialize Pyodide (first time only)
      setIsPyodideLoading(true);
      await getPyodide();
      setIsPyodideLoading(false);

      // Run analysis on main thread
      setIsAnalyzing(true);
      const result = await analyzeData(csvText);
      setAnalysisResult(result);
      setIsAnalyzing(false);
    } catch (err) {
      setIsAnalyzing(false);
      setIsPyodideLoading(false);
      setError(err);
      setLastFailedFile({ name, text: csvText });
      console.error('Analysis failed:', err);
    }
  }, [setDataset, setAnalysisResult]);

  // Handle file upload
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      await runAnalysis(file.name, text);
    } catch (error) {
      console.error('File read failed:', error);
      setError(new Error('Failed to read file. The file may be corrupted or inaccessible.'));
    }
  }, [runAnalysis]);

  // Handle example dataset
  const handleExampleClick = useCallback(async () => {
    await runAnalysis(IRIS_DATASET.name, IRIS_DATASET.csv);
  }, [runAnalysis]);

  // Handle retry after error
  const handleRetry = useCallback(async () => {
    if (lastFailedFile) {
      await runAnalysis(lastFailedFile.name, lastFailedFile.text);
    }
  }, [lastFailedFile, runAnalysis]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* Header */}
      <header className="relative bg-white border-b border-[#E2E8F0] px-6 py-4 overflow-hidden">
        {/* Subtle animated background */}
        <MatrixBackground
          color="#0066CC"
          backgroundColor="#FFFFFF"
          fontSize={10}
          speed={80}
        />

        {/* Content - positioned above background */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[#0F172A]" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.5), 0 0 16px rgba(255, 255, 255, 0.3)' }}>
            Glimpse
          </h1>
          <p className="text-sm text-[#64748B] mt-1" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.5), 0 0 16px rgba(255, 255, 255, 0.3)' }}>
            Privacy-first data analysis • All processing runs locally
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        {analysisResult && datasetName ? (
          <AnalysisView
            datasetName={datasetName}
            result={analysisResult}
            onClear={clearDataset}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-bold leading-snug text-[#0F172A] mb-2">
                Get instant insights from your data
              </h2>
              <p className="text-[#64748B]">
                Upload a CSV file to see statistics, distributions, and quality checks
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              onExampleClick={handleExampleClick}
              isLoading={isAnalyzing || isPyodideLoading}
            />

            {/* Loading Indicator */}
            {(isPyodideLoading || isAnalyzing) && (
              <div className="mt-6 p-4 max-w-2xl mx-auto bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
                <p className="text-sm font-medium text-[#334155]">
                  {isPyodideLoading
                    ? '🐍 Loading Python runtime... (first time only, ~15MB)'
                    : '📊 Analyzing your data...'}
                </p>
                <div className="mt-2 w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                  <div className="bg-[#0066CC] h-full animate-pulse w-full" />
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

      {/* Footer */}
      <footer className="relative border-t border-[#E2E8F0] px-6 py-4 bg-white overflow-hidden">
        {/* Subtle animated background */}
        <MatrixBackground
          color="#0066CC"
          backgroundColor="#FFFFFF"
          fontSize={10}
          speed={80}
        />

        {/* Content - positioned above background */}
        <div className="relative z-10 max-w-6xl mx-auto text-center text-sm text-[#64748B]" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.5), 0 0 16px rgba(255, 255, 255, 0.3)' }}>
          <p>
            No data ever leaves your machine • Powered by{' '}
            <a
              href="https://pyodide.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066CC] hover:underline transition-colors duration-150"
            >
              Pyodide
            </a>
            {' • Built by '}
            <a
              href="https://mattbayne.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0066CC] hover:underline transition-colors duration-150"
            >
              Matt Bayne
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
