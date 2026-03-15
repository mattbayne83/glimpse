/* eslint-disable no-case-declarations */
// Use type-only imports to avoid bundling issues
import type { AnalysisResult } from '../types/analysis';

// Message types from main thread
type WorkerMessage =
  | { type: 'INIT' }
  | { type: 'ANALYZE'; payload: { csvText: string } };

// Response types to main thread
type WorkerResponse =
  | { type: 'READY' }
  | { type: 'PROGRESS'; payload: { percent: number; message: string } }
  | { type: 'RESULT'; payload: AnalysisResult }
  | { type: 'ERROR'; payload: { message: string } };

// Immediately signal that worker script has loaded
console.log('[Worker] Pyodide worker script loaded - using dynamic imports');
self.postMessage({ type: 'PROGRESS', payload: { percent: 0, message: 'Worker loaded' } } as WorkerResponse);

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;
  const payload = 'payload' in e.data ? e.data.payload : undefined;
  console.log('[Worker] Received message:', type);

  try {
    switch (type) {
      case 'INIT':
        console.log('[Worker] Initializing Pyodide...');
        // Initialize Pyodide (heavy operation, ~15MB download)
        postMessage({
          type: 'PROGRESS',
          payload: { percent: 10, message: 'Loading Python runtime...' },
        } as WorkerResponse);

        // Dynamically import getPyodide to avoid bundling issues
        console.log('[Worker] Dynamically importing getPyodide...');
        const { getPyodide } = await import('../utils/pyodide');
        console.log('[Worker] Calling getPyodide()...');
        await getPyodide();
        console.log('[Worker] Pyodide loaded successfully');

        postMessage({
          type: 'PROGRESS',
          payload: { percent: 100, message: 'Python runtime loaded' },
        } as WorkerResponse);

        console.log('[Worker] Sending READY message');
        postMessage({ type: 'READY' } as WorkerResponse);
        break;

      case 'ANALYZE':
        console.log('[Worker] Starting analysis...');
        // Run analysis on CSV data
        if (!payload || !payload.csvText) {
          throw new Error('No CSV data provided');
        }

        postMessage({
          type: 'PROGRESS',
          payload: { percent: 20, message: 'Parsing CSV data...' },
        } as WorkerResponse);

        // Wait a tick to allow progress message to display
        await new Promise((resolve) => setTimeout(resolve, 50));

        postMessage({
          type: 'PROGRESS',
          payload: { percent: 50, message: 'Analyzing data with pandas...' },
        } as WorkerResponse);

        console.log('[Worker] Dynamically importing analyzeData...');
        const { analyzeData } = await import('../utils/analyzeData');
        console.log('[Worker] Running analyzeData...');
        const result = await analyzeData(payload.csvText);
        console.log('[Worker] Analysis complete');

        postMessage({
          type: 'PROGRESS',
          payload: { percent: 90, message: 'Finalizing results...' },
        } as WorkerResponse);

        postMessage({ type: 'RESULT', payload: result } as WorkerResponse);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error('Worker error:', error);
    postMessage({
      type: 'ERROR',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    } as WorkerResponse);
  }
};
