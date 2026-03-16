import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysisResult } from '../types/analysis';

interface AppState {
  // Dataset
  datasetName: string | null;
  rawCsvData: string | null;

  // Analysis result (persisted)
  analysisResult: AnalysisResult | null;

  // Theme preference
  theme: 'light' | 'dark' | 'system';
}

interface AppActions {
  // Dataset actions
  setDataset: (name: string, csvData: string) => void;
  clearDataset: () => void;
  setAnalysisResult: (result: AnalysisResult) => void;

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      // Initial state
      datasetName: null,
      rawCsvData: null,
      analysisResult: null,
      theme: (localStorage.getItem('glimpse-theme') as 'light' | 'dark' | 'system') || 'system',

      // Actions
      setDataset: (name, csvData) =>
        set({ datasetName: name, rawCsvData: csvData }),

      clearDataset: () =>
        set({
          datasetName: null,
          rawCsvData: null,
          analysisResult: null,
        }),

      setAnalysisResult: (result) =>
        set({ analysisResult: result }),

      setTheme: (theme) => {
        localStorage.setItem('glimpse-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'glimpse-storage',
      // Don't persist raw CSV data or loading states
      partialize: (state) => ({
        analysisResult: state.analysisResult,
        datasetName: state.datasetName,
        theme: state.theme,
      }),
    }
  )
);
