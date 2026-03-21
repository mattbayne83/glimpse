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
- **App.tsx** - Main application, file upload orchestration, Pyodide initialization (main thread + openpyxl), error handling, Matrix background in header/footer, theme sync, keyboard shortcuts listener
- **FileUpload** - Drag-and-drop CSV/Excel uploader with validation (max 10MB, .csv or .xlsx) + 3 horizontal sample dataset cards (Iris, E-Commerce, SaaS)
- **ErrorDisplay** - Rich error UI with categorized messages, suggestions, and retry button
- **ThemeToggle** - 3-state theme switcher (Light/Dark/System) with persistence
- **KeyboardShortcutsModal** - Help modal showing all keyboard shortcuts (triggered by "?" key)
- **AnalysisView** - Results container with 3-tab interface + export/copy features + clear confirmation modal + keyboard navigation (arrows/numbers)
  - **OverviewTab** - Dataset summary + visual column map + correlation matrix (when 2+ numeric cols) + copy-to-clipboard
  - **ColumnsTab** - Responsive grid of snapshot cards (1-4 columns) with type filtering, search, and click-to-detail
  - **QualityTab** - Comprehensive missing data table + duplicate/cardinality warnings
- **ColumnPreviewCard** - Compact snapshot card for column overview (used in grid layout)
  - Numeric: Mini histogram + 6 key stats (Mean, Median, Min, Max, Std Dev, Missing)
  - Categorical: Top 3 horizontal bar chart + unique count, missing, most common value
  - DateTime: Date range + unique count, missing, min/max dates
- **ColumnDetailModal** - Full-screen side modal with comprehensive column analysis (ESC to close)
  - Statistics section with insights (skewness, spread, completeness badges)
  - Distribution histogram with shape detection (Normal, Right-skewed, Left-skewed, Bimodal, Uniform)
  - Range indicator showing quartiles + outlier count
  - Top values (categorical), Correlations (numeric)
- **Histogram** - Professional statistical histogram with axes, gridlines, and smooth distribution curve overlay
  - Dashed gridlines, Y-axis frequency labels, X-axis bin labels
  - Catmull-Rom smoothed curve with gradient fill
  - Shape detection badge (Normal, Right-skewed, etc.)
  - Transparent SVG with `overflow-visible` (matches RangeIndicator pattern)
  - 48px padding on all sides for visual consistency
- **RangeIndicator** - Visual quartile display (box plot style) showing min/Q1/Q2/Q3/max + outlier count
- **MiniHistogram** - Simplified histogram for snapshot cards (no axes, just bars)
- **CorrelationMatrix** - Interactive correlation heatmap with color scale (-1 to +1), theme-aware
- **MatrixBackground** - Subtle animated background effect (falling characters, canvas-based), theme-aware via props
- **MissingDataTable** - Sortable table showing completeness for all columns with missing data
- **ConfirmModal** - Reusable confirmation dialog (used for clear action)
- **ColumnMap** - Visual bar chart showing dataset structure (color = type, height = completeness)
- **TabNavigation** - Reusable tab switcher with counts

### Pyodide Integration (Main Thread - March 2026)
- Loaded on-demand when first CSV/Excel is uploaded (~30MB total)
- Runs pandas/numpy for statistical analysis
- **Python executes on main thread** - brief UI freeze during analysis (~1-2s for small datasets)
- **Retry Logic** - Automatically retries up to 3 times with exponential backoff (1s, 2s, 4s) on load failure
- **Staged Progress Bar** - Shows determinate progress through loading stages:
  - 0-60%: Loading Pyodide runtime core
  - 60-80%: Loading pandas and numpy packages
  - 80-90%: Installing openpyxl via micropip (for Excel support)
  - 90-100%: Finalizing setup
  - Real-time percentage indicator and smooth animated progress
- **Excel Support** - openpyxl installed dynamically via micropip when needed
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
- `src/components/AnalysisView.tsx` (~540 lines) - 3-tab results view: Overview (with correlation)/Columns (grid layout)/Quality + export/copy + clear modal + keyboard navigation
- `src/components/ColumnDetailModal.tsx` (~427 lines) - Full-screen side modal with comprehensive column analysis (stats, distribution, correlations, time series)
- `src/components/ColumnPreviewCard.tsx` (~205 lines) - Compact snapshot card for grid view (viz + key metrics)
- `src/components/Histogram.tsx` (~235 lines) - Professional statistical histogram with axes, gridlines, smooth curve, and shape detection
- `src/components/BoxPlotVisualization.tsx` (~280 lines) - Box-and-whisker plot showing quartiles, outliers, and distribution shape
- `src/components/DistributionFitOverlay.tsx` (~150 lines) - Normal distribution curve overlay on histograms for distribution comparison
- `src/components/TimeSeriesPlot.tsx` (~295 lines) - Time series visualization with trend lines and seasonality detection (FFT-powered)
- `src/components/DateRangeViz.tsx` (~90 lines) - Timeline visualization for datetime columns (used in snapshot cards)
- `src/components/RangeIndicator.tsx` (~239 lines) - Visual quartile display (box plot style) with min/Q1/Q2/Q3/max + outlier count
- `src/components/MiniHistogram.tsx` (~52 lines) - Simplified histogram for snapshot cards (no axes, compact)
- `src/components/ErrorDisplay.tsx` (~60 lines) - Rich error UI with categorization, suggestions, and optional retry button
- `src/components/CorrelationMatrix.tsx` (~140 lines) - Interactive correlation heatmap with blue-white-red gradient scale (theme-aware, significance markers)
- `src/components/MissingDataTable.tsx` (~230 lines) - Comprehensive sortable missing data analysis table
- `src/components/ConfirmModal.tsx` (~60 lines) - Reusable confirmation dialog with backdrop
- `src/components/KeyboardShortcutsModal.tsx` (~90 lines) - Help modal showing keyboard shortcuts (triggered by "?" key)
- `src/components/MatrixBackground.tsx` (~90 lines) - Animated falling characters background (canvas-based, theme-aware via props)
- `src/components/FileUpload.tsx` (~217 lines) - Drag-and-drop uploader with 10MB limit + 3 horizontal sample dataset cards (icon left, content right)
- `src/components/ThemeToggle.tsx` (~30 lines) - 3-state theme switcher (Light/Dark/System) with icon and label
- `src/components/ColumnMap.tsx` (~80 lines) - Visual column structure chart
- `src/components/TabNavigation.tsx` (~50 lines) - Tab switcher with badge counts

### Hooks
- `src/hooks/useThemeSync.ts` (~20 lines) - Syncs resolved theme with `<html>` class (adds/removes `.dark`)
- `src/hooks/useResolvedTheme.ts` (~40 lines) - Resolves 'system' theme to 'light' or 'dark' based on OS preference
- `src/hooks/useThemeColors.ts` (~50 lines) - Returns hardcoded theme colors (NOT read from DOM) for canvas/SVG components

### Data & Types
- `src/types/analysis.ts` - TypeScript interfaces for analysis results (includes CorrelationMatrix)
- `src/store/useAppStore.ts` - Zustand store with persist middleware (datasetName, rawCsvData, analysisResult, theme)
- `src/utils/analyzeData.ts` (~180 lines) - Python analysis script with error handling (pandas-powered, includes correlation matrix, handles boolean columns)
- `src/utils/pyodide.ts` (~70 lines) - Pyodide lazy loader with retry logic (3 attempts, exponential backoff)
- `src/utils/errorHandler.ts` (~130 lines) - Error categorization engine with actionable suggestions
- `src/data/sampleDatasets.ts` (~180 lines) - Sample dataset registry with lazy-loading support (4 production datasets + Iris)

### Sample Datasets
- `public/retail_sales_daily.csv` (54 KB) - 731 days × 6 columns - daily sales with strong seasonality (weekly + annual patterns)
- `public/ecommerce_customers.csv` (565 KB) - 3,000 customers × 28 columns - revenue, engagement, demographics
- `public/saas_usage.csv` (831 KB) - 5,000 users × 32 columns - retention, churn, feature adoption

### Configuration
- `tailwind.config.ts` - Tailwind CSS 4 config mapping CSS variables to semantic classes (dark mode via `.dark` selector)
- `src/index.css` - Theme CSS variables in `@theme` block with `.dark` overrides

### Documentation
- `README.md` - User-facing documentation
- `CLAUDE.md` - Technical architecture reference (this file)
- `DARK_MODE.md` - Dark mode architecture guide with anti-patterns section
- `docs/SAMPLE_DATASETS.md` - Sample datasets reference with correlation patterns and use cases
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

### Sample Dataset Loading (March 2026)
- **Interface Extension**: `SampleDataset` supports both `csv` (embedded string) and `filePath` (lazy-load from `/public`)
- **Fetch Logic**: App.tsx checks for `filePath` first, falls back to `csv` for instant demos
- **Metadata Display**: FileUpload dropdown shows row×column dimensions (e.g., "3,000×28")
- **Error Handling**: Network failures for dataset loading caught and surfaced via ErrorDisplay
- **Bundle Impact**: 4 large datasets (~2.5 MB total) NOT embedded, loaded on-demand
- **Backward Compatibility**: Iris dataset kept embedded for instant zero-latency demo

### Boolean Column Handling (March 2026)
- **Issue**: Pandas `.describe()` on boolean columns doesn't return numeric stats ('mean', 'std', etc.)
- **Fix**: Detect boolean columns via `pd.api.types.is_bool_dtype()` and treat as categorical
- **Fallback**: For numeric columns, manually calculate stats instead of using `.describe()` to handle edge cases
- **Impact**: Prevents KeyError when analyzing datasets with boolean flags (e.g., `premium_member`, `email_subscribed`)

### Excel File Support (March 2026)
- **Implementation**: openpyxl installed via micropip during Pyodide initialization
- **Detection**: File extension check (.xlsx) → use `pd.read_excel()` instead of `pd.read_csv()`
- **Limitation**: Currently reads first sheet only (multi-sheet support planned)
- **Error Handling**: Excel-specific errors categorized with "try saving as CSV" suggestion
- **Progress**: openpyxl installation shown at 80-90% in staged progress bar

### Advanced Statistical Analysis (March 2026)
- **scipy Integration**: scipy package (~3MB) installed via micropip for statistical tests and FFT
- **Normality Testing**: Shapiro-Wilk test on numeric columns (p < 0.05 flags non-normal distributions)
  - Green checkmark badge for normal distributions, yellow warning for non-normal
  - Displayed in ColumnDetailModal statistics section
- **Correlation Significance**: Pearson correlation p-values calculated via scipy.stats
  - Asterisk (*) markers on CorrelationMatrix for statistically significant correlations (p < 0.05)
  - Helps distinguish real patterns from random noise in correlation heatmap
- **Box Plots**: Box-and-whisker plots (BoxPlotVisualization.tsx) show quartiles, median, and outliers
  - Integrated into ColumnDetailModal for numeric columns
  - Complements histogram with different perspective on distribution shape
- **Distribution Fit**: Normal curve overlay (DistributionFitOverlay.tsx) on histograms
  - Shows how closely data matches normal distribution
  - Visual comparison helps identify skewness and kurtosis
- **Time Series Analysis**: FFT-based seasonality detection for datetime columns
  - TimeSeriesPlot.tsx renders trend lines and seasonality shading
  - Detects periodic patterns (daily, weekly, monthly, annual cycles)
  - Integrated into ColumnDetailModal when datetime column detected
  - Retail Sales dataset specifically designed to showcase this feature
- **DateRangeViz**: Timeline visualization for datetime column snapshot cards
  - Shows temporal extent of data at a glance in grid view

### Sample Dataset Updates (March 2026)
- **Retail Sales Daily** (March 2026): Replaced Iris as primary demo dataset
  - 731 rows (2 years of daily data) × 6 columns
  - Strong weekly seasonality (weekends vs weekdays) + annual patterns (holiday spikes)
  - Designed to showcase time series analysis and FFT seasonality detection
  - Multiple numeric columns for correlation analysis
  - Instant-load demo (embedded, not lazy-loaded)
- **Iris dataset deprecated**: Removed from sample dataset cards (too small, limited correlation patterns)
  - Can still be used for testing but not featured in UI

### UI/UX Enhancements
- **Keyboard Shortcuts** (March 2026): Power user navigation
  - `ESC` - Close modal or show clear confirmation
  - `←` / `→` - Navigate between tabs
  - `1` / `2` / `3` - Jump to Overview/Columns/Quality tabs
  - `?` - Show keyboard shortcuts help modal
  - Works globally (guards against input field focus)
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
- **Sample Dataset Cards** (March 2026): 3 compact horizontal cards below file upload
  - **Iris** (150 × 5): Classic ML demo, instant load (embedded)
  - **E-Commerce** (3,000 × 28): Customer revenue, engagement & demographics
  - **SaaS Usage** (5,000 × 32): User retention, churn prediction & feature adoption
  - Horizontal layout: icon left (Flower2, ShoppingCart, TrendingUp), content right
  - Lazy-loaded from `/public/*.csv` via fetch (Iris embedded)
  - Ultra-compact design to fit above the fold: p-3, text-xs, line-clamp-2
  - See `docs/SAMPLE_DATASETS.md` for complete dataset documentation
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

**Recently Completed:**
- ✅ Advanced statistical analysis (normality tests, correlation significance, FFT seasonality) (March 20, 2026)
- ✅ Advanced visualizations (box plots, distribution fit, time series plots) (March 20, 2026)
- ✅ Responsive mobile design (March 20, 2026)
- ✅ Excel file support via openpyxl (March 20, 2026)
- ✅ Keyboard shortcuts (March 17, 2026)

**Next Priority:**
- Scatter plot matrix (requires raw data pipeline - currently only aggregated stats)
- Multi-sheet Excel support
- Custom column transformations
