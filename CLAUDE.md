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
- **App.tsx** - Main application, file upload orchestration, Pyodide initialization, Matrix background in header/footer
- **FileUpload** - Drag-and-drop CSV uploader with validation (max 50MB) + example dataset button
- **AnalysisView** - Results container with tabbed interface + export/copy features + clear confirmation modal
  - **OverviewTab** - Dataset summary + visual column map + copy-to-clipboard
  - **ColumnsTab** - Per-column analysis with type filtering + per-column copy
  - **QualityTab** - Comprehensive missing data table + duplicate/cardinality warnings
  - **CorrelationTab** - Correlation matrix heatmap (conditional, 2+ numeric columns)
- **CorrelationMatrix** - Interactive correlation heatmap with color scale (-1 to +1)
- **MatrixBackground** - Subtle animated background effect (falling characters, canvas-based)
- **MissingDataTable** - Sortable table showing completeness for all columns with missing data
- **ConfirmModal** - Reusable confirmation dialog (used for clear action)
- **ColumnMap** - Visual bar chart showing dataset structure (color = type, height = completeness)
- **Histogram** - SVG histogram for numeric column distributions
- **TabNavigation** - Reusable tab switcher with counts

### Pyodide Integration
- Loaded on-demand when first CSV is uploaded (~10-15MB)
- Runs pandas/numpy for statistical analysis
- Python code executes in main thread (not Web Worker yet)
- Results serialized to JSON and parsed in React

### State Management (Zustand)
- `datasetName` - Current file name
- `rawCsvData` - CSV text (not persisted)
- `analysisResult` - Full analysis object (persisted to localStorage)
- `isAnalyzing` - Loading state
- `isPyodideLoading` / `isPyodideReady` - Python runtime status

## Key Files

### Core Application
- `src/App.tsx` (~150 lines) - Main app logic, file handling, Pyodide orchestration, Matrix backgrounds
- `src/main.tsx` - React entry point
- `src/index.css` - Tailwind imports + theme config

### Components
- `src/components/AnalysisView.tsx` (~480 lines) - Tabbed results view with Overview/Columns/Quality/Correlation + export/copy + clear modal
- `src/components/CorrelationMatrix.tsx` (~140 lines) - Interactive correlation heatmap with blue-white-red gradient scale
- `src/components/MissingDataTable.tsx` (~230 lines) - Comprehensive sortable missing data analysis table
- `src/components/ConfirmModal.tsx` (~60 lines) - Reusable confirmation dialog with backdrop
- `src/components/MatrixBackground.tsx` (~90 lines) - Animated falling characters background (canvas-based)
- `src/components/FileUpload.tsx` (~140 lines) - Drag-and-drop uploader with validation + example dataset button
- `src/components/ColumnMap.tsx` (~80 lines) - Visual column structure chart
- `src/components/Histogram.tsx` (~40 lines) - Simple SVG histogram renderer
- `src/components/TabNavigation.tsx` (~50 lines) - Tab switcher with badge counts

### Data & Types
- `src/types/analysis.ts` - TypeScript interfaces for analysis results (includes CorrelationMatrix)
- `src/store/useAppStore.ts` - Zustand store with persist middleware
- `src/utils/analyzeData.ts` (~160 lines) - Python analysis script (pandas-powered, includes correlation matrix)
- `src/utils/pyodide.ts` (~50 lines) - Pyodide lazy loader
- `src/data/sampleDatasets.ts` (~190 lines) - Pre-loaded sample datasets (Iris flowers)

### Documentation
- `README.md` - User-facing documentation
- `CLAUDE.md` - Technical architecture reference (this file)
- `CHANGELOG.md` - Version history
- `BACKLOG.md` - Feature roadmap
- `tasks/todo.md` - Implementation plan

## Analysis Pipeline

1. **File Upload** → User drops CSV
2. **Validation** → Check file type and size (<50MB)
3. **Pyodide Init** → Load Python runtime (first time only)
4. **CSV Parse** → Python reads CSV into pandas DataFrame
5. **Analysis** → Python calculates:
   - Dataset overview (rows, cols, memory, types)
   - Per-column stats (mean/std/quartiles for numeric, top values for categorical)
   - Histograms (20 bins for numeric columns)
   - Data quality (duplicates, high missing, high cardinality)
   - Correlation matrix (when 2+ numeric columns exist)
6. **Serialize** → Python returns JSON string
7. **Render** → React components display results
8. **Export/Copy** → User can download JSON or copy markdown summaries

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
- Max 50MB file size enforced in `FileUpload.tsx`
- CSV-only validation (`.csv` extension check)
- No backend means can't handle streaming for huge files

### State Persistence
- Only `analysisResult` and `datasetName` persist to localStorage
- `rawCsvData` NOT persisted (can be large)
- Loading states never persisted

### CSV Escaping
- Python script uses triple quotes for CSV data
- Double quotes in CSV escaped with `replace(/"/g, '\\"')`

### Unused Components
- `DataBlock3D.tsx` and `DataCube3D.tsx` exist but not currently used (3D visualizations disabled due to layout issues)

### UI/UX Enhancements
- **MatrixBackground**: Subtle animated effect (8-18% opacity, blue #0066CC on white)
  - Falling characters with random Greek/math/currency symbols
  - Canvas-based animation (80ms speed, 10px font size)
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
- **Export Analysis**: Download complete analysis results as JSON
  - Filename: `{dataset-name}_analysis.json`
  - Includes all stats, histograms, quality checks, correlation matrix
- **Copy to Clipboard**: Markdown-formatted stats
  - Overview tab: copy full dataset summary
  - Column cards: copy individual column stats
  - Visual feedback with checkmark (2-second timeout)
- **Correlation Matrix**: Interactive heatmap visualization
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

## Future Enhancements

See [BACKLOG.md](BACKLOG.md) for full roadmap.

**Next Priority:**
- Better error handling for malformed CSVs
- Pyodide load failure recovery with retry
- User-friendly error messages with suggestions
- Keyboard shortcuts (Esc to clear, etc.)
- Dark mode support
