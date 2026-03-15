# Changelog

All notable changes to Glimpse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Better error handling for malformed CSVs
- Pyodide load failure recovery with retry
- User-friendly error messages with suggestions
- Excel file support (.xlsx)
- Dark mode
- Keyboard shortcuts

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
