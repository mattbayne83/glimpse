# Glimpse Backlog

## In Progress
_None - ready for next feature!_

## Next Up (Priority)
_To be determined - current roadmap complete!_

## Recently Added ✨
- [x] **Phase 1-3: Advanced Statistical Analysis & Visualizations** (March 20, 2026) - Professional statistical capabilities
  - **Statistical Significance**: scipy integration, Shapiro-Wilk normality tests, correlation p-values with significance markers
  - **Advanced Visualizations**: Box plots, distribution fit overlays on histograms
  - **Time Series Analysis**: FFT-based seasonality detection, trend lines, periodic pattern highlighting
  - **Retail Sales Dataset**: 2-year daily sales data (731 rows) with strong seasonality patterns
  - **DateRangeViz**: Timeline visualization for datetime columns in snapshot cards
  - Components: BoxPlotVisualization, DistributionFitOverlay, TimeSeriesPlot, DateRangeViz
  - scipy.fft for frequency analysis, scipy.stats for normality and significance tests
- [x] **Excel File Support** (March 20, 2026) - Upload and analyze .xlsx files
  - Extended file validation to accept `.xlsx` files alongside `.csv`
  - Pyodide loads openpyxl package via micropip for Excel parsing
  - pandas `read_excel()` converts Excel → DataFrame for analysis
  - Enhanced error handling with Excel-specific troubleshooting
  - All existing analysis features work with Excel files
- [x] **Responsive Mobile Design** (March 20, 2026) - Enhanced mobile experience
  - ColumnDetailModal responsive: full-width on mobile, side panel on desktop
  - Touch-friendly interactions throughout
  - Improved spacing and sizing for small screens
  - Body scroll lock prevents background scrolling in modals
- [x] **Keyboard Shortcuts** (March 17, 2026) - Power user navigation
  - ESC, arrow keys, number keys for navigation
  - "?" key opens help modal
  - Global listeners with input field guards
  - See `KeyboardShortcutsModal.tsx` component
- [x] **Production-Quality Sample Datasets** (March 16, 2026) - Dramatically improved demo experience
  - Replaced toy datasets (150 rows, 5 cols) with realistic production data
  - **E-Commerce Customers**: 3,000 rows × 28 columns - revenue, engagement, segmentation
  - **SaaS Product Usage**: 5,000 rows × 32 columns - retention, churn, feature adoption
  - **Healthcare Patient Visits**: 4,000 rows × 31 columns - vitals, labs, diagnoses
  - **Employee HR Analytics**: 2,500 rows × 33 columns - salary, performance, attrition
  - All datasets include realistic correlations, missing data patterns, and quality issues
  - Lazy-loaded from `/public` to keep bundle size small
  - Kept Iris dataset as instant-load demo option (no network request)
- [x] **Sample Dataset Library** (March 15, 2026) - Multiple example datasets available
  - Pre-loaded datasets for instant demos
  - Easy selection via FileUpload component
  - Currently includes Iris flowers (150 rows, 5 columns)
- [x] **Staged Pyodide Progress Bar** (March 15, 2026) - Determinate progress during initial load
  - Shows actual progress through loading stages (0→60→100%)
  - Stage 1 (0-60%): Loading Pyodide runtime core
  - Stage 2 (60-100%): Loading pandas and numpy packages
  - Percentage indicator shows exact progress
  - Replaces indeterminate pulsing bar with smooth animated progress
- [x] **Unified Markdown Export** (March 15, 2026) - Comprehensive analysis report in markdown format
  - Replaces JSON export with formatted markdown report
  - Includes: dataset overview, all column details, correlation matrix, quality issues
  - Downloads as `.md` file for easy sharing and documentation
  - Keeps individual "Copy Stats" button for quick clipboard access
- [x] **Column Detail Side Modal - Full Integration** (March 15, 2026) - Click columns anywhere to see details
  - Slide-in panel from right (480px width)
  - All statistics, histogram, quality metrics, correlations in one place
  - ESC key + backdrop click to dismiss
  - **Phase 2 Complete**: Works from Overview (column chart), Columns (cards), Quality (table)
  - Body scroll lock prevents background scrolling
- [x] **Column Search** (March 15, 2026) - Real-time search in Columns tab
  - Case-insensitive substring matching
  - Works with type filters
  - Clear button for quick reset
  - Search icon + placeholder text

## Advanced Features

### Visualizations
- [ ] Scatter plot matrix for numeric columns (requires raw data pipeline - currently only aggregated stats)

### Export & Sharing
- [ ] Export analysis as PDF report (with charts embedded)
- [ ] Generate shareable URL with analysis results (compressed JSON in URL hash)
- [ ] Copy analysis as formatted text for Slack/Teams

### Data Processing
- [ ] Multi-sheet Excel support (currently reads first sheet only)
- [ ] Support JSON files (auto-flatten nested structures)
- [ ] Support Parquet files via Pyodide pyarrow
- [ ] Column transformation suggestions (normalize, bin, encode)
- [ ] Data cleaning wizard (handle missing values, remove duplicates)

### Analysis Depth
- [ ] Additional statistical tests (t-test, chi-square, ANOVA)
- [ ] Automatic anomaly detection with confidence scores
- [ ] Data profiling report (comprehensive multi-page PDF)
- [ ] Column type inference improvements (detect emails, phone numbers, IDs)

## Performance
- [ ] Lazy-load Pyodide only when needed (reduce initial bundle)
- [ ] Show Pyodide download progress bar
- [ ] Cache analysis results more aggressively

## Data Science Features
- [ ] Statistical tests (normality, correlation significance)
- [ ] Automatic anomaly detection
- [ ] Data type inference improvements
- [ ] Missing data pattern analysis
- [ ] Suggest data cleaning steps

## Nice to Have
- [ ] URL sharing of analysis results
- [ ] Side-by-side dataset comparison
- [ ] Column rename/transform suggestions
- [ ] Integration with external data sources
- [ ] Save/load analysis sessions

## Completed ✅
- [x] Phase 1: Pyodide integration + file upload
- [x] Phase 2: Python analysis engine with histograms
- [x] Tabbed interface (Overview/Columns/Quality)
- [x] Column type filtering
- [x] Visual column map representation
- [x] Histogram generation for numeric columns
- [x] Data quality warnings (duplicates, high missing, high cardinality)
- [x] **Comprehensive missing data table** - Sortable table showing all columns with missing data
- [x] **Matrix animated background** - Subtle falling characters effect in header/footer
- [x] **Clear confirmation modal** - Prevent accidental data loss
- [x] **Example dataset button** - Pre-loaded iris dataset (150 rows, 4 numeric columns) for instant demos
- [x] **Export analysis as JSON** - Download complete analysis results for later use
- [x] **Copy stats to clipboard** - Copy overview or individual column stats as markdown
- [x] **Correlation matrix** - Interactive heatmap showing relationships between numeric columns (conditional tab)
- [x] **Elon Simplification Sprint** (March 2026) - Questioned requirements, deleted ruthlessly, simplified architecture:
  - Deleted 409 lines of unused 3D visualization code (DataCube3D, DataBlock3D)
  - Reduced file limit from 50MB → 10MB with better error messages
  - Merged Correlation tab into Overview (4 tabs → 3 tabs)
  - Attempted Web Worker implementation but blocked by browser CSP - reverted to main-thread execution
- [x] **Error Handling Overhaul** (March 2026) - Comprehensive error detection and recovery:
  - Smart error categorization with actionable suggestions
  - Pyodide load retry with exponential backoff (3 attempts)
  - Better CSV parsing error detection (encoding, delimiters, empty files)
  - Retry button for recoverable errors
  - User-friendly error messages with troubleshooting tips
- [x] **Progressive Disclosure UX** (March 15, 2026) - Simplified column views with detail modal
  - Minimal preview cards (sparklines, key stats only)
  - Full detail modal for comprehensive exploration
  - Reduced bundle by 1.5 KB despite adding features
  - Layout consistency fixes across all tabs
- [x] **Dark Mode Support** (March 15, 2026) - Full dark mode implementation with system preference detection
  - 3-state theme toggle (Light/Dark/System) with persistence
  - Pure React architecture (hardcoded colors, no DOM reads)
  - CSS variables + Tailwind semantic tokens
  - FOUC prevention with inline script
  - Theme-aware MatrixBackground and CorrelationMatrix components
  - **7-iteration lesson**: Avoid reading CSS variables from DOM - creates race conditions
  - See DARK_MODE.md for architecture documentation
