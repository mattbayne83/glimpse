# Glimpse

**Privacy-first exploratory data analysis tool**

Upload CSV files and get instant statistical insights — all processed locally in your browser. No data ever leaves your machine.

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Build**: Vite 8
- **Styling**: Tailwind CSS 4
- **State**: Zustand 5 (with persist middleware)
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)
- **Python Runtime**: Pyodide 0.29.3 (Python + pandas/numpy in WebAssembly)

## Architecture

### Core Principles
- **Client-side only**: No backend, no API calls, no data collection
- **Privacy-first**: All analysis runs in the browser via Pyodide
- **Zero config**: Drop a CSV, get insights immediately

### Component Structure
- **App.tsx** - Main application, file upload orchestration, Pyodide initialization (main thread), error handling, Matrix background in header/footer, theme sync
- **FileUpload** - Drag-and-drop CSV uploader with validation (max 10MB) + example dataset button
- **ErrorDisplay** - Rich error UI with categorized messages, suggestions, and retry button
- **ThemeToggle** - 3-state theme switcher (Light/Dark/System) with persistence
- **AnalysisView** - Results container with 3-tab interface + export/copy features + clear confirmation modal
  - **OverviewTab** - Dataset summary + visual column map + correlation matrix (when 2+ numeric cols) + copy-to-clipboard
  - **ColumnsTab** - Per-column analysis with type filtering + per-column copy
  - **QualityTab** - Comprehensive missing data table + duplicate/cardinality warnings
- **CorrelationMatrix** - Interactive correlation heatmap with color scale (-1 to +1), theme-aware
- **MatrixBackground** - Subtle animated background effect (falling characters, canvas-based), theme-aware via props
- **MissingDataTable** - Sortable table showing completeness for all columns with missing data
- **ConfirmModal** - Reusable confirmation dialog (used for clear action)
- **ColumnMap** - Visual bar chart showing dataset structure (color = type, height = completeness)
- **Histogram** - SVG histogram for numeric column distributions
- **TabNavigation** - Reusable tab switcher with counts

### Pyodide Integration (Main Thread - March 2026)
- Loaded on-demand when first CSV is uploaded (~30MB total)
- Runs pandas/numpy for statistical analysis
- **Python executes on main thread** - brief UI freeze during analysis (~1-2s for small datasets)
- **Retry Logic** - Automatically retries up to 3 times with exponential backoff (1s, 2s, 4s) on load failure
- **Staged Progress Bar** - Shows determinate progress through loading stages:
  - 0-60%: Loading Pyodide runtime core
  - 60-100%: Loading pandas and numpy packages
  - Real-time percentage indicator and smooth animated progress
- Results serialized to JSON and stored in Zustand
- **Note**: Web Workers attempted but blocked by browser security policy (CSP)

### Theme System (March 2026)
- **3-state theme switcher**: Light, Dark, System (follows OS preference)
- **Pure React architecture**: Colors selected via React state, NOT read from DOM
- **CSS variables + Tailwind**: Semantic tokens in `@theme` block, auto-generated utility classes
- **FOUC prevention**: Inline script in `index.html` applies theme before CSS loads
- **Persistence**: Theme choice stored in localStorage (`glimpse-theme`)
- **Architecture docs**: See [DARK_MODE.md](DARK_MODE.md) for complete implementation guide
- **Key insight**: Avoid reading CSS variables from DOM via `getComputedStyle()` - creates race conditions. Use hardcoded TS colors selected by React state instead.

### Error Handling (March 2026)
- **Smart Categorization** - Errors automatically categorized by type:
  - Pyodide loading failures (network/CDN issues)
  - CSV parsing errors (delimiters, encoding, malformed data)
  - Memory errors
  - Empty file detection
  - Data type errors
- **Actionable Suggestions** - Each error type gets relevant troubleshooting tips
- **Retry Support** - Recoverable errors (network, Pyodide loading) show retry button
- **Python Error Detection** - CSV parsing wrapped in try-except for pandas-specific errors
- **User-Friendly Messages** - Technical errors translated to plain English with next steps

### State Management (Zustand)
- `datasetName` - Current file name
- `rawCsvData` - CSV text (not persisted)
- `analysisResult` - Full analysis object (persisted to localStorage)
- `theme` - Theme preference ('light' | 'dark' | 'system', persisted to localStorage)
- Local component state: `isAnalyzing`, `isPyodideLoading`, `error` (in App.tsx)

## Key Files

### Core Application
- `src/App.tsx` (~180 lines) - Main app logic, file handling, Pyodide orchestration (main thread), Matrix backgrounds
- `src/main.tsx` - React entry point
- `src/index.css` - Tailwind imports + theme config

### Components
- `src/components/AnalysisView.tsx` (~480 lines) - 3-tab results view: Overview (with correlation)/Columns/Quality + export/copy + clear modal
- `src/components/ErrorDisplay.tsx` (~60 lines) - Rich error UI with categorization, suggestions, and optional retry button
- `src/components/CorrelationMatrix.tsx` (~140 lines) - Interactive correlation heatmap with blue-white-red gradient scale (theme-aware)
- `src/components/MissingDataTable.tsx` (~230 lines) - Comprehensive sortable missing data analysis table
- `src/components/ConfirmModal.tsx` (~60 lines) - Reusable confirmation dialog with backdrop
- `src/components/MatrixBackground.tsx` (~90 lines) - Animated falling characters background (canvas-based, theme-aware via props)
- `src/components/FileUpload.tsx` (~140 lines) - Drag-and-drop uploader with 10MB limit + example dataset button
- `src/components/ThemeToggle.tsx` (~30 lines) - 3-state theme switcher (Light/Dark/System) with icon and label
- `src/components/ColumnMap.tsx` (~80 lines) - Visual column structure chart
- `src/components/Histogram.tsx` (~40 lines) - Simple SVG histogram renderer
- `src/components/TabNavigation.tsx` (~50 lines) - Tab switcher with badge counts

### Hooks
- `src/hooks/useThemeSync.ts` (~20 lines) - Syncs resolved theme with `<html>` class (adds/removes `.dark`)
- `src/hooks/useResolvedTheme.ts` (~40 lines) - Resolves 'system' theme to 'light' or 'dark' based on OS preference
- `src/hooks/useThemeColors.ts` (~50 lines) - Returns hardcoded theme colors (NOT read from DOM) for canvas/SVG components

### Data & Types
- `src/types/analysis.ts` - TypeScript interfaces for analysis results (includes CorrelationMatrix)
- `src/store/useAppStore.ts` - Zustand store with persist middleware (datasetName, rawCsvData, analysisResult, theme)
- `src/utils/analyzeData.ts` (~180 lines) - Python analysis script with error handling (pandas-powered, includes correlation matrix)
- `src/utils/pyodide.ts` (~70 lines) - Pyodide lazy loader with retry logic (3 attempts, exponential backoff)
- `src/utils/errorHandler.ts` (~130 lines) - Error categorization engine with actionable suggestions
- `src/data/sampleDatasets.ts` (~190 lines) - Pre-loaded sample datasets (Iris flowers)

### Configuration
- `tailwind.config.ts` - Tailwind CSS 4 config mapping CSS variables to semantic classes (dark mode via `.dark` selector)
- `src/index.css` - Theme CSS variables in `@theme` block with `.dark` overrides

### Documentation
- `README.md` - User-facing documentation
- `CLAUDE.md` - Technical architecture reference (this file)
- `DARK_MODE.md` - Dark mode architecture guide with anti-patterns section
- `CHANGELOG.md` - Version history
- `BACKLOG.md` - Feature roadmap
- `tasks/todo.md` - Implementation plan

## Analysis Pipeline

1. **File Upload** → User drops CSV
2. **Validation** → Check file type and size (<10MB)
3. **Pyodide Init** → Load Python runtime on main thread (first time only, ~15MB)
4. **CSV Parse** → Python reads CSV into pandas DataFrame
5. **Analysis** → Python calculates:
   - Dataset overview (rows, cols, memory, types)
   - Per-column stats (mean/std/quartiles for numeric, top values for categorical)
   - Histograms (20 bins for numeric columns)
   - Data quality (duplicates, high missing, high cardinality)
   - Correlation matrix (when 2+ numeric columns exist)
6. **Serialize** → Python returns JSON string
7. **Render** → React components display results in 3 tabs (Overview/Columns/Quality)
8. **Export/Copy** → User can download markdown report or copy quick stats to clipboard

## Data Flow

```
CSV File
  ↓
FileUpload Component
  ↓
App.tsx (handleFileSelect)
  ↓
Pyodide Loader (getPyodide)
  ↓
analyzeData(csvText)
  ↓
Python Script (pandas)
  ↓
JSON Result
  ↓
Zustand Store (setAnalysisResult)
  ↓
AnalysisView Component
  ↓
Overview / Columns / Quality Tabs
```

## Key Gotchas

### Pyodide Version Matching
- **Critical**: npm package version MUST match CDN URL
- Current: `0.29.3` in both package.json and `pyodide.ts`
- Mismatch causes "indexURL parameter mismatch" errors

### File Validation
- Max 10MB file size enforced in `FileUpload.tsx`
- CSV-only validation (`.csv` extension check)
- No backend means can't handle streaming for huge files
- 10MB limit prevents browser memory issues with Pyodide

### State Persistence
- Only `analysisResult`, `datasetName`, and `theme` persist to localStorage
- `rawCsvData` NOT persisted (can be large)
- Loading states never persisted
- Theme stored under `glimpse-theme` key (separate from Zustand `glimpse-storage` for early access)

### CSV Escaping
- Python script uses triple quotes for CSV data
- Double quotes in CSV escaped with `replace(/"/g, '\\"')`

### Deleted Components (March 2026)
- `DataBlock3D.tsx` and `DataCube3D.tsx` removed (409 lines) - 3D visualizations were unused and had layout issues

### Web Workers Blocked (March 2026)
- **Issue**: Web Workers completely blocked in browser environment (likely CSP or security policy)
- **Symptom**: Worker object creates successfully but code never executes (even minimal inline Blob workers fail)
- **Solution**: Reverted to main-thread Pyodide execution
- **Trade-off**: Brief UI freeze during analysis (~1-2 seconds for small datasets) instead of background processing
- **Unused files**: `src/workers/pyodide.worker.ts`, `src/workers/test.worker.ts`, `src/hooks/usePyodideWorker.ts` (kept for reference)

### Dark Mode Architecture (March 2026)
- **Critical lesson**: DO NOT read CSS variables from DOM via `getComputedStyle()` - creates race conditions
- **Why**: React state updates → triggers re-render → useEffect adds `.dark` class AFTER render → but useMemo/useState reads CSS DURING render = reads old value
- **Solution**: Hardcode colors in TypeScript (`useThemeColors`), select via React state (`useResolvedTheme`)
- **7 iterations**: Initial implementation tried reading DOM, failed inconsistently, refactored to pure React approach
- **Data flow**: User clicks → Zustand state → useResolvedTheme → hardcoded colors → components re-render
- **See**: [DARK_MODE.md](DARK_MODE.md) for complete anti-pattern documentation

### UI/UX Enhancements
- **Dark Mode**: 3-state theme system (Light/Dark/System)
  - Theme toggle in header with icon and label
  - System mode follows OS preference automatically
  - Persists to localStorage (`glimpse-theme`)
  - FOUC prevention via inline script
  - See [DARK_MODE.md](DARK_MODE.md) for architecture details
- **MatrixBackground**: Subtle animated effect, theme-aware
  - Falling characters with random Greek/math/currency symbols
  - Canvas-based animation (80ms speed, 10px font size)
  - Colors passed as props (light: #0066CC on white, dark: #3B9EFF on slate-900)
  - Used in header and footer with white text-shadow for legibility
- **Clear Confirmation**: Modal prevents accidental data loss
  - Yellow warning icon + destructive red button
  - Backdrop dismissal supported
- **Missing Data Table**: Complete replacement for basic warning box
  - Shows ALL columns with missing data (not just >50%)
  - Sortable by column name, populated count, missing count
  - Color-coded completeness bars (green→yellow→orange→red)
  - Summary stats: total columns affected, avg completeness, most/least complete
- **Example Dataset**: "Try Example Dataset" button loads Iris dataset
  - 150 rows, 4 numeric columns (sepal/petal measurements), 1 categorical (species)
  - Instant demo without needing to find a CSV file
- **Export Report**: Download comprehensive markdown analysis report
  - Filename: `{dataset-name}_analysis.md`
  - Includes: dataset overview, all column details, correlation matrix, quality issues
  - Formatted markdown for easy sharing and documentation
  - Generated timestamp and footer with Glimpse attribution
- **Copy to Clipboard**: Quick markdown-formatted stats
  - Overview tab: copy dataset summary
  - Visual feedback with checkmark (2-second timeout)
- **Correlation Matrix**: Interactive heatmap visualization, theme-aware
  - Color scale: blue (-1 negative) → white (0) → red (+1 positive)
  - Grid layout with row/column headers
  - Hover tooltips show exact correlation values
  - Only appears when 2+ numeric columns exist
  - Includes interpretation guide (strong/moderate/weak thresholds)

## Development

```bash
npm run dev    # Start dev server (http://localhost:5174)
npm run build  # Production build
npm run lint   # Run ESLint
```

### Error Handling System (March 2026)
- **ErrorDisplay Component**: Multi-section error UI
  - Header section: error icon, title, message
  - Suggestions section: lightbulb icon, bulleted troubleshooting tips
  - Action footer: retry button (conditional on error type)
  - Color-coded by severity (red/orange/yellow scheme)
- **Error Categorizer** (`errorHandler.ts`): Pattern-matching error detection
  - Scans error messages for keywords (case-insensitive)
  - Returns structured ErrorInfo: title, message, suggestions, canRetry flag
  - 9 error categories: Pyodide loading, CSV parsing, encoding, memory, empty file, missing columns, data type, network, generic fallback
  - Suggestions tailored to error type (e.g., "save as UTF-8" for encoding errors)
- **Pyodide Retry Logic**: Exponential backoff
  - Max 3 attempts with 1s, 2s, 4s delays
  - Resets loading promise on failure to allow manual retry
  - Enhanced error message includes attempt count and connection hint
- **Python Error Handling**: pandas-specific try-except blocks
  - EmptyDataError → "CSV file is empty or contains no data"
  - ParserError → "CSV parsing failed: {details}. Check delimiters and quoting."
  - UnicodeDecodeError → "File encoding error: {details}. Save with UTF-8."
  - Generic Exception → "Failed to read CSV: {details}"
  - Validation: checks for empty DataFrame and zero columns
- **App-Level Integration**:
  - Error state type changed from `string` to `unknown` (preserves Error objects)
  - Retry handler uses `lastFailedFile` state to re-run analysis
  - Conditional retry button based on `categorizeError().canRetry`
  - File read failures wrapped with helpful context message

## Future Enhancements

See [BACKLOG.md](BACKLOG.md) for full roadmap.

**Next Priority:**
- Responsive mobile design (better tablet/phone experience)
- Keyboard shortcuts help modal (press "?" to see available shortcuts)
- Sample dataset picker (dropdown to choose from multiple examples)
