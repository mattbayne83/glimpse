# Changelog

All notable changes to Glimpse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Responsive mobile design
- Excel file support (.xlsx)

## [0.8.0] - 2026-03-17

### Added - Column Detail Modal & Enhanced UI & Keyboard Shortcuts
- **Column Detail Modal** - Full-screen side modal for deep column analysis
  - Click any column in the Columns tab to open detailed view
  - Statistics section with smart insights (skewness, spread, completeness badges)
  - Professional histogram with axes, gridlines, and smooth distribution curve
  - Distribution shape detection: Normal, Right-skewed, Left-skewed, Bimodal, Uniform
  - Range indicator showing min/Q1/Q2/Q3/max + outlier count
  - Top values for categorical columns
  - Correlation analysis for numeric columns (top 5 strongest correlations)
  - ESC key to close, keyboard navigation support
- **Enhanced Histogram Component** - Professional statistical visualization
  - Y-axis with frequency labels and dashed gridlines
  - X-axis with bin labels (5-7 evenly spaced values)
  - Smooth Catmull-Rom curve overlay with gradient fill
  - Vertical gradient on bars (80% → 30% opacity for depth)
  - Shape detection badge (pill-shaped with backdrop blur)
  - Default height increased from 80px → 200px for better readability
- **Snapshot Card Grid** - Engaging visual column overview (Columns tab)
  - Responsive grid layout (1-4 columns depending on screen size)
  - Compact header with column name + single-letter type badge (N/C/D)
  - Prominent visualization area:
    - Numeric: Mini histogram (56px tall)
    - Categorical: Top 3 horizontal bar chart with percentages
    - DateTime: Date range placeholder
  - 2-column stat grid with 4-6 key metrics per column
  - Color-coded missing values (green = 0%, orange/red = >0%)
  - Hover effects: shadow lift + primary border + chevron indicator
  - Click anywhere on card to open detail modal
- **Box Plot Removal** - Deleted redundant box plot from detail modal
  - Range indicator already shows quartiles + outlier count
  - Reduced visual clutter while keeping all essential information
- **Keyboard Shortcuts** - Power user navigation (March 17, 2026)
  - `ESC` key closes modals or shows clear confirmation
  - Arrow keys (`←`/`→`) navigate between tabs
  - Number keys (`1`/`2`/`3`) jump to Overview/Columns/Quality tabs
  - `?` key opens keyboard shortcuts help modal
  - Global listeners with input field guards (doesn't interfere with typing)

### Changed
- **Columns Tab** - Grid layout replaced vertical list for better engagement
  - 1 column on mobile, 2 on md, 3 on lg, 4 on xl screens
  - Snapshot cards show immediate visual sense of data distribution
  - Click-to-detail pattern encourages exploration
- **Data Quality Section** - Removed from detail modal (now in Statistics section)
  - Completeness shown inline with "Missing" stat row
  - Color-coded insight badges (green/amber/red) indicate data quality
  - Simplified UI while maintaining all information

### Technical
- New components: `ColumnDetailModal.tsx` (427 lines), `ColumnPreviewCard.tsx` (205 lines), `RangeIndicator.tsx` (239 lines), `MiniHistogram.tsx` (52 lines), `KeyboardShortcutsModal.tsx` (90 lines)
- Enhanced: `Histogram.tsx` (40 → 235 lines) - complete rewrite with axes, gridlines, curve smoothing
- Enhanced: `AnalysisView.tsx` - grid layout for Columns tab, modal state management, keyboard navigation
- Enhanced: `App.tsx` - keyboard shortcuts listener for "?" key
- Distribution shape detection algorithm in `ColumnDetailModal.tsx`

## [0.7.0] - 2026-03-16

### Added - Production-Quality Sample Datasets
- **4 New Realistic Datasets** - Dramatically improved demo experience
  - **E-Commerce Customers** (3,000 × 28): Revenue, engagement, customer segmentation
  - **SaaS Product Usage** (5,000 × 32): Retention, churn, plan tier comparisons
  - **Healthcare Patient Visits** (4,000 × 31): Vitals, labs, diagnoses, risk factors
  - **Employee HR Analytics** (2,500 × 33): Salary, performance, attrition patterns
- **Lazy Loading** - Large datasets loaded from `/public/*.csv` via fetch (not embedded)
  - Keeps bundle size small while offering production-scale examples
  - Error handling for network failures
  - Metadata display shows row×column counts in dropdown (e.g., "3,000×28")
- **Realistic Correlations** - All datasets include meaningful patterns
  - E-Commerce: Customer tier → revenue (exponential growth), engagement → retention
  - SaaS: Plan tier → churn (Free 23% vs Enterprise 3%), payment failure → 7.7x churn risk
  - Healthcare: Age → conditions, BMI → vitals, smoking → cardiovascular metrics
  - HR: Tenure → salary (+3%/year), performance → attrition (Rating 1 = 70% risk)
- **Intentional Data Quality Issues** - Missing data patterns, duplicates, outliers
  - E-Commerce: 8-12% missing (phone, middle initial), 3 duplicate emails, whale customers
  - SaaS: 13% missing (churned users), power users with 800K-1.4M API calls
  - Healthcare: 9.5% missing (labs for outpatient visits), age/vital outliers
  - HR: 5.3% missing (exit dates for current employees), C-level salary outliers
- **Complete Documentation** - New `docs/SAMPLE_DATASETS.md` reference guide
  - Dataset overviews with key columns and correlations
  - Use case descriptions for each dataset
  - Generation methodology notes

### Fixed
- **Boolean Column Handling** - Fixed KeyError when analyzing datasets with boolean columns
  - Pandas `.describe()` on booleans doesn't return numeric stats
  - Now detects boolean columns and treats as categorical instead
  - Manual stat calculation for numeric columns as fallback

### Changed
- **SampleDataset Interface** - Extended to support lazy-loading
  - Added optional `filePath` property for `/public` datasets
  - Added optional `rows` and `columns` metadata for UI display
  - `csv` property now optional (for backward compatibility with embedded datasets)
- **FileUpload Component** - Enhanced dataset selection UI
  - Dropdown shows row×column dimensions for each dataset
  - Layout: dataset name + description on left, dimensions on right
- **App.tsx** - Dataset loading logic supports both embedded and fetched CSVs
  - Checks `filePath` first, falls back to `csv` for instant demos
  - Error handling for fetch failures
- **Iris Dataset** - Renamed to "Iris Flowers (Quick Demo)" to highlight instant-load benefit

### Removed
- Penguins, Sales, and Housing toy datasets (replaced with production-quality alternatives)

### Technical
- New files: `public/*.csv` (4 datasets, ~2.5 MB total)
- New documentation: `docs/SAMPLE_DATASETS.md`
- Updated: `src/data/sampleDatasets.ts` (registry refactor)
- Updated: `src/utils/analyzeData.ts` (boolean column detection)

## [0.6.0] - 2026-03-15

### Added - Dark Mode
- **3-State Theme Toggle** - Light, Dark, and System modes
  - ThemeToggle component in header with icon (Sun/Moon/Monitor) and label
  - System mode automatically follows OS preference
  - Persists theme choice to localStorage (`glimpse-theme`)
- **Pure React Architecture** - No DOM reads, hardcoded colors selected by React state
  - `useResolvedTheme` hook resolves 'system' to 'light' or 'dark'
  - `useThemeColors` hook returns hardcoded colors (not read from CSS)
  - `useThemeSync` hook syncs resolved theme with `<html>` class
- **CSS Variables + Tailwind** - Semantic design tokens
  - `@theme` block in `index.css` with comprehensive color palette
  - `.dark` class overrides for dark mode
  - Tailwind config maps CSS variables to utility classes (e.g., `bg-bg-surface`)
- **Theme-Aware Components**
  - MatrixBackground receives colors as props (light: #0066CC, dark: #3B9EFF)
  - CorrelationMatrix uses theme-aware gradient colors
  - All UI components use semantic Tailwind classes
- **FOUC Prevention** - Inline script in `index.html` applies theme before CSS loads
- **Complete Documentation** - New `DARK_MODE.md` with architecture guide and anti-patterns section

### Changed
- MatrixBackground refactored to accept `color` and `backgroundColor` props instead of reading DOM
- CorrelationMatrix uses `useThemeColors` hook for gradient colors
- Zustand store extended with `theme` state and `setTheme` action
- Store persistence partialize includes `theme` field

### Technical
- New hooks: `useResolvedTheme.ts`, `useThemeColors.ts`, `useThemeSync.ts`
- New component: `ThemeToggle.tsx`
- Updated `tailwind.config.ts` with semantic color mappings
- Updated `index.css` with dark mode CSS variable overrides
- Updated `index.html` with FOUC prevention script

### Lessons Learned
- **CRITICAL**: Never read CSS variables from DOM via `getComputedStyle()` in React
  - Creates race conditions: useEffect updates `.dark` class AFTER render, but useMemo/useState reads CSS DURING render
  - 7 iterations to discover this issue - initial implementation failed inconsistently
  - Solution: Hardcode colors in TypeScript, select via React state
- **Pure React is better**: Keep theme colors in React state, not in DOM
- **Props > Context for canvas/SVG**: Passing colors as props is cleaner than reading from DOM

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
