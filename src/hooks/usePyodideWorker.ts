import { useRef, useCallback, useState, useEffect } from 'react';
import type { AnalysisResult } from '../types/analysis';
// import PyodideWorker from '../workers/pyodide.worker.ts?worker';

type WorkerStatus = 'idle' | 'initializing' | 'ready' | 'analyzing' | 'error';

interface Progress {
  percent: number;
  message: string;
}

interface UsePyodideWorkerReturn {
  status: WorkerStatus;
  progress: Progress;
  error: string | null;
  analyze: (csvText: string) => Promise<AnalysisResult>;
  initialize: () => void;
  terminate: () => void;
}

export function usePyodideWorker(): UsePyodideWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<WorkerStatus>('idle');
  const [progress, setProgress] = useState<Progress>({ percent: 0, message: '' });
  const [error, setError] = useState<string | null>(null);
  const resolveRef = useRef<((result: AnalysisResult) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Initialize worker
  const initialize = useCallback(() => {
    if (workerRef.current) return;

    try {
      console.log('[Hook] Creating Web Worker...');

      // TEMPORARY: Create inline blob worker to test if workers work at all
      const workerCode = `
        console.log('[BLOB WORKER] Inline worker loaded!');
        self.postMessage({ type: 'PROGRESS', payload: { percent: 0, message: 'Blob worker alive!' } });

        self.onmessage = (e) => {
          console.log('[BLOB WORKER] Received message:', e.data.type);

          if (e.data.type === 'INIT') {
            console.log('[BLOB WORKER] Initializing...');
            self.postMessage({ type: 'READY' });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerRef.current = new Worker(workerUrl);
      console.log('[Hook] Blob worker created successfully');

      // Set up message handler
      workerRef.current.onmessage = (e: MessageEvent) => {
        const { type, payload } = e.data;
        console.log('[Hook] Received message from worker:', type, payload);

        switch (type) {
          case 'READY':
            console.log('[Hook] Worker ready, setting status to ready');
            setStatus('ready');
            break;

          case 'PROGRESS':
            console.log('[Hook] Progress update:', payload);
            setProgress(payload);
            if (payload.message.includes('Worker loaded')) {
              console.log('[Hook] ✅ Worker script successfully loaded and executing!');
            } else if (payload.message.includes('Loading Python runtime')) {
              setStatus('initializing');
            } else if (payload.message.includes('Analyzing')) {
              setStatus('analyzing');
            }
            break;

          case 'RESULT':
            setStatus('ready');
            setProgress({ percent: 100, message: 'Complete' });
            if (resolveRef.current) {
              resolveRef.current(payload);
              resolveRef.current = null;
            }
            break;

          case 'ERROR':
            setStatus('error');
            setError(payload.message);
            if (rejectRef.current) {
              rejectRef.current(new Error(payload.message));
              rejectRef.current = null;
            }
            break;
        }
      };

      // Set up error handler
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        setStatus('error');
        setError(error.message || 'Worker failed');
        if (rejectRef.current) {
          rejectRef.current(new Error(error.message || 'Worker failed'));
          rejectRef.current = null;
        }
      };

      // Request Pyodide initialization
      console.log('[Hook] Sending INIT message to worker');
      setStatus('initializing');
      workerRef.current.postMessage({ type: 'INIT' });
    } catch (err) {
      console.error('[Hook] Failed to create worker:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create worker');
    }
  }, []); // Remove status dependency

  // Analyze function
  const analyze = useCallback(
    (csvText: string): Promise<AnalysisResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        if (status !== 'ready') {
          reject(new Error('Worker not ready'));
          return;
        }

        // Store resolve/reject for later use
        resolveRef.current = resolve;
        rejectRef.current = reject;

        // Clear previous error
        setError(null);

        // Send analyze message
        workerRef.current.postMessage({
          type: 'ANALYZE',
          payload: { csvText },
        });
      });
    },
    [status]
  );

  // Cleanup on unmount
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setStatus('idle');
      setProgress({ percent: 0, message: '' });
      setError(null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return {
    status,
    progress,
    error,
    analyze,
    initialize,
    terminate,
  };
}
