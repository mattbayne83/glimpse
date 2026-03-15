# Changelog

All notable changes to Glimpse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Unified Markdown Export (replace JSON export + copy buttons)
- Excel file support (.xlsx)
- Dark mode
- Keyboard shortcuts

## [0.5.0] - 2026-03-15

### Added - Error Handling Overhaul
- **Smart Error Categorization** - Automatically detect error types and provide relevant help
  - CSV parsing errors (delimiters, encoding, malformed data)
  - Pyodide loading failures (network, CDN issues)
  - Memory errors with size recommendations
  - Empty file detection
  - Data type errors
- **Retry with Exponential Backoff** - Pyodide loads automatically retry up to 3 times (1s, 2s, 4s delays)
- **ErrorDisplay Component** - Rich error UI with:
  - Clear error titles and messages
  - Contextual suggestions for resolution
  - Optional retry button for recoverable errors
  - Visual hierarchy (error header, suggestions panel, action footer)
- **Better CSV Validation** - Python script now catches pandas errors before they become generic failures
- **File Read Error Handling** - Graceful handling of corrupted or inaccessible files

### Changed
- Error state upgraded from `string | null` to `unknown | null` for better error object preservation
- All error handlers now use categorized error display instead of generic messages
- Pyodide loader reset on failure to allow manual retries

### Technical
- New `src/utils/errorHandler.ts` - Error categorization engine
- New `src/components/ErrorDisplay.tsx` - Rich error UI component
- Updated `src/utils/pyodide.ts` - Retry logic with exponential backoff
- Updated `src/utils/analyzeData.ts` - Python try-except blocks for better CSV error messages
- Updated `src/App.tsx` - Integrated ErrorDisplay with retry functionality

## [0.4.0] - 2026-03-15

### Changed - Elon's 5-Step Algorithm Applied
- **Deleted ruthlessly** - Removed 409 lines of unused 3D visualization code (DataCube3D, DataBlock3D)
- **Simplified architecture** - Merged Correlation tab into Overview (4 tabs → 3 tabs)
- **Reduced file limit** - 50MB → 10MB with helpful error messages ("try sampling or filtering your data first")
- **Reverted to main-thread** - Web Worker implementation attempted but blocked by browser CSP
  - Brief UI freeze during analysis (~1-2s for small datasets)
  - Simplified state management (removed worker complexity)
  - Unused files kept for reference: `pyodide.worker.ts`, `test.worker.ts`, `usePyodideWorker.ts`

### Technical
- Updated `App.tsx` to run Pyodide on main thread with loading states
- Updated `AnalysisView.tsx` - Overview tab now includes correlation matrix inline
- Updated `FileUpload.tsx` - 10MB limit with improved error messaging
- Simplified `useAppStore.ts` - removed worker-related state
- Bundle size: 261 KB (81 KB gzip) - includes all Pyodide utilities upfront

### Lessons Learned
- **Web Workers are NOT universally supported** - CSP or browser security policies can block execution entirely
- **Blob workers also fail** - Even minimal inline workers won't execute if browser blocks them
- **Main-thread is acceptable** - Brief freezing preferable to broken functionality
- **Question requirements aggressively** - 50MB limit was arbitrary, 10MB is more practical

## [0.3.0] - 2026-03-15

### Added
- **Example Dataset Button** - "Try Example Dataset" loads Iris flowers dataset
  - 150 rows, 4 numeric columns (sepal/petal measurements), 1 categorical (species)
  - Instant demo without needing a CSV file
  - Located below file upload area
- **Export Analysis as JSON** - Download complete analysis results
  - Button in AnalysisView header (next to Clear)
  - Filename: `{dataset-name}_analysis.json`
  - Includes all stats, histograms, quality checks, correlation matrix
- **Copy Stats to Clipboard** - Markdown-formatted statistics
  - "Copy Stats" button on Overview tab (full dataset summary)
  - "Copy" button on each column card (individual column stats)
  - Visual feedback with green checkmark for 2 seconds
- **Correlation Matrix** - Interactive heatmap visualization
  - New "Correlation" tab (conditional, only appears with 2+ numeric columns)
  - Color scale: blue (-1 negative correlation) → white (0) → red (+1 positive)
  - Grid layout with row and column headers (rotated text)
  - Hover tooltips showing exact correlation values
  - Interpretation guide explaining correlation strength thresholds
  - Responsive cell sizing based on number of columns

### Changed
- Python analysis script now calculates correlation matrix via pandas `.corr()`
- Tab count badges now conditionally show Correlation tab
- FileUpload component supports optional example dataset callback

### Technical
- Added `CorrelationMatrix` component (~140 lines)
- Added `src/data/sampleDatasets.ts` with Iris dataset
- Extended `AnalysisResult` type with optional `correlation?: CorrelationMatrix`
- Updated `analyzeData.ts` Python script to compute correlation matrix
- Added clipboard API integration with async/await error handling

## [0.2.0] - 2026-03-15

### Added
- **Tabbed Interface** - Overview, Columns, and Quality tabs for better organization
- **Column Filtering** - Filter columns by type (All, Numeric, Categorical, DateTime)
- **Visual Column Map** - Color-coded visualization showing dataset structure
  - Height represents data completeness
  - Colors indicate column types
  - Hover tooltips with column details
- **Enhanced Column Analysis**
  - Histograms for all numeric columns (20 bins)
  - Top 10 values for categorical columns (was 5)
  - Added Q1 and Q3 quartile statistics
- **Improved Data Quality Tab**
  - Detailed warning cards with icons
  - Actionable recommendations for each issue
  - "No issues found" success state

### Changed
- Reorganized analysis view into tabs instead of single scrolling page
- Increased histogram detail from 10 to 20 bins
- Improved categorical value display with percentages
- Enhanced quality warnings with context and suggestions

### Technical
- Updated Pyodide from 0.26.4 to 0.29.3
- Added histogram generation to Python analysis script
- Created TabNavigation, Histogram, and ColumnMap components

## [0.1.0] - 2026-03-15

### Added
- **Initial Release** - Privacy-first EDA tool
- **Pyodide Integration** - Python + pandas/numpy running in browser
- **File Upload** - Drag-and-drop CSV upload with validation (max 50MB)
- **Dataset Overview**
  - Row and column counts
  - Memory usage calculation
  - Missing value percentage
  - Column type distribution (numeric, categorical, datetime)
- **Column-Level Analysis**
  - Numeric: mean, std, min, max, quartiles, count
  - Categorical: unique count, top 5 values with frequencies
  - DateTime: date ranges, unique count
- **Data Quality Checks**
  - Duplicate row detection
  - High-missing column warnings (>50% missing)
  - High-cardinality categorical detection (>100 unique)
- **State Management**
  - Zustand store with persist middleware
  - Analysis results cached in localStorage
  - Dataset name preservation across sessions
- **UI Components**
  - Clean header with dataset metadata
  - Stat cards for overview metrics
  - Column cards with type badges
  - Quality warning cards with severity colors
  - Loading states during analysis
  - Error handling with user-friendly messages

### Technical
- React 19 + TypeScript 5.9 setup
- Vite 8 build system
- Tailwind CSS 4 for styling
- Lucide React icons
- Inter font from Google Fonts
- Pyodide 0.26.4 (later updated to 0.29.3)

## Project Structure

### Key Files
- `src/App.tsx` - Main application logic and file upload handling
- `src/components/AnalysisView.tsx` - Results display with tabs
- `src/components/FileUpload.tsx` - Drag-and-drop file upload
- `src/utils/pyodide.ts` - Pyodide runtime loader
- `src/utils/analyzeData.ts` - Python analysis script
- `src/types/analysis.ts` - TypeScript interfaces for results
- `src/store/useAppStore.ts` - Zustand state management

### Documentation
- `CLAUDE.md` - Project architecture and technical reference
- `README.md` - User-facing documentation
- `BACKLOG.md` - Feature roadmap and todo list
- `tasks/todo.md` - Implementation plan

---

[Unreleased]: https://github.com/yourusername/glimpse/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/yourusername/glimpse/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/glimpse/releases/tag/v0.1.0
