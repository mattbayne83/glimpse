# Glimpse Backlog

## In Progress
- [ ] Project documentation (README, CHANGELOG)

## Next Up (Priority)
- [ ] **Example dataset button** - Pre-loaded sample CSV for instant demos
- [ ] **Export analysis as JSON** - Download results for later use
- [ ] **Copy stats to clipboard** - Quick sharing of column stats
- [ ] **Correlation matrix** - Heatmap showing relationships between numeric columns

## Polish & UX
- [ ] Better error handling for malformed CSVs
- [ ] Pyodide load failure recovery with retry
- [ ] User-friendly error messages with suggestions
- [ ] Keyboard shortcuts (Esc to clear, etc.)
- [ ] Dark mode support
- [ ] Responsive design improvements for mobile

## Advanced Features
- [ ] **Interactive 3D Data Cube** - Rotatable Rubik's cube visualization (needs spacing/layout fixes)
- [ ] Scatter plot matrix for numeric columns
- [ ] Outlier detection with visualizations
- [ ] Export analysis as PDF report
- [ ] Support Excel files (.xlsx)
- [ ] Time series analysis for datetime columns
- [ ] Data profiling report (comprehensive PDF)

## Performance
- [ ] Web Worker for Pyodide analysis (keep UI responsive)
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
