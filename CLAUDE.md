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
- **FileUpload** - Drag-and-drop CSV uploader with validation (max 50MB)
- **AnalysisView** - Results container with tabbed interface + clear confirmation modal
  - **OverviewTab** - Dataset summary + visual column map
  - **ColumnsTab** - Per-column analysis with type filtering
  - **QualityTab** - Comprehensive missing data table + duplicate/cardinality warnings
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
- `src/components/AnalysisView.tsx` (~415 lines) - Tabbed results view with Overview/Columns/Quality + clear modal
- `src/components/MissingDataTable.tsx` (~230 lines) - Comprehensive sortable missing data analysis table
- `src/components/ConfirmModal.tsx` (~60 lines) - Reusable confirmation dialog with backdrop
- `src/components/MatrixBackground.tsx` (~90 lines) - Animated falling characters background (canvas-based)
- `src/components/FileUpload.tsx` (~120 lines) - Drag-and-drop uploader with validation
- `src/components/ColumnMap.tsx` (~80 lines) - Visual column structure chart
- `src/components/Histogram.tsx` (~40 lines) - Simple SVG histogram renderer
- `src/components/TabNavigation.tsx` (~50 lines) - Tab switcher with badge counts

### Data & Types
- `src/types/analysis.ts` - TypeScript interfaces for analysis results
- `src/store/useAppStore.ts` - Zustand store with persist middleware
- `src/utils/analyzeData.ts` (~130 lines) - Python analysis script (pandas-powered)
- `src/utils/pyodide.ts` (~50 lines) - Pyodide lazy loader

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
6. **Serialize** → Python returns JSON string
7. **Render** → React components display results

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

## Development

```bash
npm run dev    # Start dev server (http://localhost:5174)
npm run build  # Production build
npm run lint   # Run ESLint
```

## Future Enhancements

See [BACKLOG.md](BACKLOG.md) for full roadmap.

**Priority:**
- Example dataset button
- Export analysis as JSON
- Correlation matrix heatmap
- Excel file support
