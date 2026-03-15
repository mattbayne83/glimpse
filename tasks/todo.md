# Glimpse Implementation Plan

## Phase 0: Pyodide Setup ✅
- [x] Scaffold project with standard stack
- [x] Verify dev server runs

## Phase 1: Pyodide Integration & File Upload

### 1.1 Pyodide Bootstrap
- [ ] Install `pyodide` npm package
- [ ] Create `src/utils/pyodide.ts` - lazy loader for Pyodide runtime
- [ ] Create Web Worker wrapper for Python execution
- [ ] Test basic pandas import in worker

### 1.2 File Upload Component
- [ ] Create `FileUpload.tsx` - drag-and-drop area
- [ ] Add file validation (CSV only, max 50MB)
- [ ] Parse CSV to text in browser
- [ ] Store raw CSV data in Zustand store

### 1.3 State Management
- [ ] Update `useAppStore.ts` with:
  - `datasetName: string | null`
  - `rawCsvData: string | null`
  - `analysisResult: AnalysisResult | null`
  - `isAnalyzing: boolean`
  - Actions: `uploadDataset()`, `clearDataset()`

## Phase 2: Python Analysis Engine

### 2.1 Analysis Script
- [ ] Create Python analysis script (stored as string in TS)
- [ ] Load CSV into pandas DataFrame
- [ ] Calculate dataset overview:
  - Shape (rows × columns)
  - Memory usage
  - Column types distribution
  - Total missing values

### 2.2 Column-Level Analysis
- [ ] **Numeric columns**:
  - Count, mean, std, min, max
  - 25th, 50th, 75th percentiles
  - Missing count
  - Histogram bins (for charting)
- [ ] **Categorical columns**:
  - Unique count
  - Top 10 values with frequencies
  - Missing count
- [ ] **DateTime columns**:
  - Min/max dates
  - Date range frequency

### 2.3 Data Quality Checks
- [ ] Duplicate row detection
- [ ] Columns with >50% missing values
- [ ] High-cardinality categorical detection (>100 unique)

### 2.4 Python-to-JS Bridge
- [ ] Define TypeScript interfaces for analysis result
- [ ] Convert Python analysis output to JSON
- [ ] Update Zustand store with analysis result

## Phase 3: UI - Dataset Overview

### 3.1 Layout
- [ ] Create `AnalysisView.tsx` - main container
- [ ] Add header with dataset name + "Clear" button
- [ ] Create tabs: Overview, Columns, Data Quality

### 3.2 Overview Tab
- [ ] Create `DatasetSummary.tsx`:
  - Stat cards: Rows, Columns, Memory
  - Column type breakdown (pie chart or bar)
  - Missing values summary
- [ ] Add loading state during analysis

## Phase 4: UI - Column Analysis

### 4.1 Column List
- [ ] Create `ColumnList.tsx` - filterable list of columns
- [ ] Filters: All / Numeric / Categorical / DateTime
- [ ] Search by column name

### 4.2 Column Detail Cards
- [ ] Create `NumericColumnCard.tsx`:
  - Stats table (mean, std, quartiles)
  - Mini histogram (recharts or simple SVG)
- [ ] Create `CategoricalColumnCard.tsx`:
  - Unique count badge
  - Top 10 values horizontal bar chart
- [ ] Create `DateTimeColumnCard.tsx`:
  - Date range display
  - Frequency over time (if relevant)

## Phase 5: UI - Data Quality

### 5.1 Quality Warnings
- [ ] Create `DataQualityView.tsx`:
  - Warning cards for:
    - Duplicate rows (count + %)
    - High-missing columns (list)
    - High-cardinality categoricals (list)
- [ ] "No issues found" empty state

## Phase 6: Polish & Optimization

### 6.1 Performance
- [ ] Lazy-load Pyodide (only when file uploaded)
- [ ] Show Pyodide download progress
- [ ] Cache analysis results in localStorage (persist in Zustand)

### 6.2 UX Improvements
- [ ] Add example dataset button (pre-loaded CSV)
- [ ] Export analysis as JSON
- [ ] Copy stats to clipboard
- [ ] Keyboard shortcuts (Esc to clear, etc.)

### 6.3 Error Handling
- [ ] Handle malformed CSV files
- [ ] Handle Pyodide load failures
- [ ] User-friendly error messages

### 6.4 Documentation
- [ ] Add README with "Why Glimpse?" section
- [ ] Privacy policy statement (no data collection)
- [ ] Usage guide in UI (? icon)

## Phase 7: Advanced Features (Post-MVP)

- [ ] Correlation matrix (numeric columns only)
- [ ] Scatter plot matrix
- [ ] Outlier detection visualization
- [ ] Export analysis as PDF
- [ ] Support Excel files (.xlsx)
- [ ] Dark mode

---

## Technical Decisions

### Pyodide vs Pure JS
✅ **Pyodide** - Leverages pandas/numpy for robust statistical analysis

### Charting Library
- **Option 1**: Recharts (React-native, responsive)
- **Option 2**: Simple SVG (lightweight, full control)
- **Decision**: Start with simple SVG for histograms, upgrade to Recharts if needed

### File Size Limit
- **50MB max** - Balance usability with browser memory constraints
- Warn user if file is >10MB (may take longer to process)

### CSV Parsing
- **Option 1**: Papa Parse (robust, popular)
- **Option 2**: Native browser parsing + pandas
- **Decision**: Let pandas handle parsing (one less dependency)

---

## Current Status

**Phase**: 0 Complete, 1 Next
**Dev Server**: http://localhost:5174/
