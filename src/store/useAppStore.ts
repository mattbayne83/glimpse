import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysisResult } from '../types/analysis';

interface AppState {
  // Dataset
  datasetName: string | null;
  rawCsvData: string | null;

  // Analysis
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;

  // Pyodide state
  isPyodideLoading: boolean;
  isPyodideReady: boolean;
}

interface AppActions {
  // Dataset actions
  setDataset: (name: string, csvData: string) => void;
  clearDataset: () => void;

  // Analysis actions
  setAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setAnalysisError: (error: string | null) => void;

  // Pyodide actions
  setPyodideLoading: (isLoading: boolean) => void;
  setPyodideReady: (isReady: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      // Initial state
      datasetName: null,
      rawCsvData: null,
      analysisResult: null,
      isAnalyzing: false,
      analysisError: null,
      isPyodideLoading: false,
      isPyodideReady: false,

      // Actions
      setDataset: (name, csvData) =>
        set({ datasetName: name, rawCsvData: csvData, analysisError: null }),

      clearDataset: () =>
        set({
          datasetName: null,
          rawCsvData: null,
          analysisResult: null,
          analysisError: null,
        }),

      setAnalyzing: (isAnalyzing) =>
        set({ isAnalyzing }),

      setAnalysisResult: (result) =>
        set({ analysisResult: result, isAnalyzing: false, analysisError: null }),

      setAnalysisError: (error) =>
        set({ analysisError: error, isAnalyzing: false }),

      setPyodideLoading: (isLoading) =>
        set({ isPyodideLoading: isLoading }),

      setPyodideReady: (isReady) =>
        set({ isPyodideReady: isReady, isPyodideLoading: false }),
    }),
    {
      name: 'glimpse-storage',
      // Don't persist raw CSV data or loading states
      partialize: (state) => ({
        analysisResult: state.analysisResult,
        datasetName: state.datasetName,
      }),
    }
  )
);
