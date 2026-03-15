import { useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { useAppStore } from './store/useAppStore';
import { getPyodide } from './utils/pyodide';
import { analyzeData } from './utils/analyzeData';

function App() {
  const {
    datasetName,
    analysisResult,
    isAnalyzing,
    analysisError,
    isPyodideLoading,
    isPyodideReady,
    setDataset,
    clearDataset,
    setAnalyzing,
    setAnalysisResult,
    setAnalysisError,
    setPyodideLoading,
    setPyodideReady,
  } = useAppStore();

  // Handle file upload
  const handleFileSelect = async (file: File) => {
    try {
      // Read file as text
      const text = await file.text();

      // Store in state
      setDataset(file.name, text);

      // Initialize Pyodide if not ready
      if (!isPyodideReady) {
        setPyodideLoading(true);
        await getPyodide();
        setPyodideReady(true);
      }

      // Run analysis
      setAnalyzing(true);
      const result = await analyzeData(text);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(
        error instanceof Error ? error.message : 'Failed to analyze data'
      );
    }
  };

  // Preload Pyodide on mount (optional - could wait until file upload)
  useEffect(() => {
    // Uncomment to preload Pyodide:
    // getPyodide().then(() => setPyodideReady(true));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Glimpse</h1>
          <p className="text-sm text-gray-600 mt-1">
            Privacy-first data analysis • All processing runs locally
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        {analysisResult && datasetName ? (
          <AnalysisView
            datasetName={datasetName}
            result={analysisResult}
            onClear={clearDataset}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Get instant insights from your data
              </h2>
              <p className="text-gray-600">
                Upload a CSV file to see statistics, distributions, and quality checks
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isAnalyzing || isPyodideLoading}
            />

            {isPyodideLoading && (
              <p className="mt-4 text-sm text-gray-600 animate-pulse">
                Loading Python runtime... (first time only)
              </p>
            )}

            {analysisError && (
              <div className="mt-6 p-4 max-w-2xl bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900">Analysis Error</p>
                <p className="text-sm text-red-700 mt-1">{analysisError}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>
            No data ever leaves your machine • Powered by{' '}
            <a
              href="https://pyodide.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Pyodide
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
