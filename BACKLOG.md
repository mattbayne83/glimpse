# Glimpse Backlog

## In Progress
_None - ready for next feature!_

## Next Up (Priority)
- [ ] **Unified Markdown Export** - Replace JSON export + copy buttons with comprehensive markdown report
- [ ] Better error handling for malformed CSVs
- [ ] Pyodide load failure recovery with retry
- [ ] User-friendly error messages with suggestions

## Polish & UX
- [ ] Keyboard shortcuts (Esc to clear, etc.)
- [ ] Dark mode support
- [ ] Responsive design improvements for mobile

## Advanced Features
- [ ] Scatter plot matrix for numeric columns
- [ ] Outlier detection with visualizations
- [ ] Export analysis as PDF report
- [ ] Support Excel files (.xlsx)
- [ ] Time series analysis for datetime columns
- [ ] Data profiling report (comprehensive PDF)

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
- [ ] Sample dataset library (iris, titanic, sales, etc.)
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
