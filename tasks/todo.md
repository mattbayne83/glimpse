# Implementation Plan: Keyboard Shortcuts Help Modal + Responsive Mobile Design + Excel Support

## Goal
Add three UX enhancements: (1) keyboard shortcuts help modal triggered by "?" key, (2) responsive mobile design across all components, and (3) Excel file upload support (.xlsx) via Pyodide openpyxl.

## Acceptance Criteria
- [ ] Pressing "?" key opens a help modal showing all keyboard shortcuts
- [ ] Help modal dismisses with ESC or backdrop click
- [ ] All UI components are fully responsive on mobile (320px+), tablet (768px+), and desktop (1024px+)
- [ ] Critical interactions work with touch (no hover-only UX)
- [ ] Excel files (.xlsx) can be uploaded alongside CSV files
- [ ] Excel files are parsed correctly via Pyodide openpyxl
- [ ] File validation supports both .csv and .xlsx extensions
- [ ] All existing keyboard shortcuts, modals, and features still work

---

## Feature 1: Keyboard Shortcuts Help Modal

### Steps

#### 1.1. Create KeyboardShortcutsModal component (Complexity: Low)
- **Files**: Create `src/components/KeyboardShortcutsModal.tsx`
- **Pattern**: Follow `ConfirmModal.tsx` structure (fixed overlay, backdrop, centered content)
- **Props**: `{ isOpen: boolean; onClose: () => void }`
- **Content**:
  - Title: "Keyboard Shortcuts"
  - Grid layout with shortcut key badges (left) + description (right)
  - Sections: Navigation, Actions
  - Shortcuts to document:
    - `ESC` - Close modal or show clear confirmation
    - `←` / `→` - Navigate between tabs
    - `1` / `2` / `3` - Jump to Overview/Columns/Quality
    - `?` - Show this help (meta!)
- **Styling**:
  - Fixed overlay (`z-50`)
  - Backdrop: `bg-black/50 backdrop-blur-sm` (match ConfirmModal)
  - Modal: `max-w-lg` (slightly wider than ConfirmModal for 2-column layout)
  - Keyboard badges: monospace font, rounded border, subtle shadow
- **Risk**: None — simple presentational component

#### 1.2. Add global "?" key listener in App.tsx (Complexity: Low)
- **Files**: `src/App.tsx`
- **Logic**:
  - Add state: `const [showShortcutsModal, setShowShortcutsModal] = useState(false)`
  - Add `useEffect` with `keydown` listener on `document`
  - Check: `e.key === '?' && !isInputFocused` (guard against input fields)
  - Call: `setShowShortcutsModal(true)`
  - Cleanup: remove listener on unmount
- **Guard Clause**: Reuse same pattern from AnalysisView.tsx (check `e.target instanceof HTMLInputElement/HTMLTextAreaElement`)
- **Risk**: None — same pattern already proven in AnalysisView

#### 1.3. Render modal in App.tsx (Complexity: Low)
- **Files**: `src/App.tsx`
- **Location**: After `</main>`, before `</footer>`
- **Code**: `<KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />`
- **Risk**: None

---

## Feature 2: Responsive Mobile Design

### Mobile Audit (Current Issues)

**Known Breakpoints:**
- Mobile: 320px - 767px (base styles, no prefix)
- Tablet: 768px+ (`md:`)
- Desktop: 1024px+ (`lg:`)
- Large: 1280px+ (`xl:`)

**Components to Fix:**

#### 2.1. Fix AnalysisView header overflow (Complexity: Low)
- **File**: `src/components/AnalysisView.tsx`
- **Issue**: Header with dataset name + metadata + Clear/Export buttons may overflow on narrow screens
- **Fix**:
  - Wrap header in flex column on mobile: `flex flex-col md:flex-row md:items-center md:justify-between gap-4`
  - Dataset metadata: `flex flex-wrap gap-x-4 gap-y-1` (wrap on overflow)
  - Actions: full-width buttons on mobile `w-full md:w-auto`, stack vertically `flex flex-col md:flex-row gap-2`
- **Risk**: Low — flex wrapping is safe

#### 2.2. Fix ColumnDetailModal on mobile (Complexity: Medium)
- **File**: `src/components/ColumnDetailModal.tsx`
- **Issue**: Fixed 500px width might be too narrow on phones (need full-width), body scroll lock may interfere with mobile Safari
- **Fix**:
  - Width: `w-full` on all screens (remove max-width on mobile), or use `max-w-full md:max-w-[500px]`
  - Padding: reduce from `p-8` to `p-4 md:p-8` for more screen real estate
  - Header: ensure X button is large enough for touch (`min-w-[44px] min-h-[44px]` — iOS guideline)
  - Histogram: ensure min-height doesn't cause overflow (`min-h-[150px] md:min-h-[200px]`)
- **Test**: iOS Safari body scroll lock (may need `-webkit-overflow-scrolling: touch`)
- **Risk**: Medium — body scroll lock can be finicky on mobile browsers

#### 2.3. Fix CorrelationMatrix on mobile (Complexity: Medium)
- **File**: `src/components/CorrelationMatrix.tsx`
- **Issue**: Large correlation matrices (10+ columns) will overflow horizontally on mobile
- **Fix**:
  - Wrap in `overflow-x-auto` container
  - Add horizontal scroll indicator: subtle gradient fade on edges
  - Cell size: reduce from current size on mobile (`text-xs md:text-sm`, `w-12 h-12 md:w-16 md:h-16`)
  - Headers: rotate text on mobile (already rotated, but ensure readable)
  - Interpretation guide: stack vertically on mobile (`flex flex-col md:flex-row`)
- **Risk**: Medium — need to balance readability vs scrolling

#### 2.4. Fix MissingDataTable on mobile (Complexity: Low)
- **File**: `src/components/MissingDataTable.tsx`
- **Issue**: Table columns may be too narrow on mobile
- **Fix**:
  - Summary stats grid: already responsive (`grid-cols-1 md:grid-cols-4`)
  - Table: wrap in `overflow-x-auto` for horizontal scroll if needed
  - Consider: card layout on mobile instead of table (one card per column)
  - Bars: ensure minimum width for touch interaction
- **Risk**: Low — tables naturally scroll horizontally

#### 2.5. Fix Tab navigation on mobile (Complexity: Low)
- **File**: `src/components/AnalysisView.tsx` (TabNavigation inline)
- **Issue**: Tab labels may be too long on narrow screens ("Overview", "Columns", "Quality")
- **Fix**:
  - Reduce padding: `px-3 py-2 md:px-6 md:py-3`
  - Font size: `text-sm md:text-base`
  - Consider: icons only on mobile (Chart for Overview, Grid for Columns, AlertCircle for Quality)
  - Alternative: scrollable tabs if needed (`overflow-x-auto snap-x`)
- **Risk**: Low — simple responsive adjustments

#### 2.6. Fix FileUpload on mobile (Complexity: Low)
- **File**: `src/components/FileUpload.tsx`
- **Issue**: Sample dataset cards may be cramped in 3-column grid on mobile
- **Fix**:
  - Already responsive: `grid-cols-1 md:grid-cols-3` ✅
  - Ensure tap targets are large enough: `min-h-[60px]` on cards
  - Icon size: reduce on mobile if needed
- **Risk**: Low — mostly already responsive

#### 2.7. Fix Histogram on mobile (Complexity: Low)
- **File**: `src/components/Histogram.tsx`
- **Issue**: Axis labels may overlap on narrow width
- **Fix**:
  - Reduce padding: `p-4 md:p-8` (less space for axes on mobile)
  - Font size: `text-[8px] md:text-[10px]` for axis labels
  - X-axis labels: rotate 45deg on mobile if needed, or show fewer labels
- **Risk**: Low — SVG scales naturally

#### 2.8. Add mobile-specific touch interactions (Complexity: Low)
- **Files**: All clickable components (cards, buttons, tabs)
- **Fix**:
  - Ensure all tap targets ≥44px (iOS guideline)
  - Remove hover-only UX (use `active:` states for touch feedback)
  - Add `-webkit-tap-highlight-color: transparent` to avoid blue flash on iOS
  - Consider: swipe gestures for tab navigation (optional, nice-to-have)
- **Risk**: Low — CSS-only changes

#### 2.9. Test on actual devices (Complexity: Low)
- **Devices**:
  - iPhone SE (375px width) — smallest modern phone
  - iPad (768px width) — tablet breakpoint
  - Desktop (1280px+)
- **Browsers**: Safari iOS, Chrome Android, Firefox Android
- **Test cases**:
  - Upload file (drag-drop on desktop, file picker on mobile)
  - View all tabs (Overview, Columns, Quality)
  - Open column detail modal
  - Scroll correlation matrix
  - Use keyboard shortcuts (desktop only)
- **Risk**: Low — verification step

---

## Feature 3: Excel File Support

### Steps

#### 3.1. Research openpyxl in Pyodide (Complexity: Low)
- **Goal**: Confirm openpyxl is available in Pyodide 0.29.3
- **Method**:
  - Check Pyodide package list: https://pyodide.org/en/stable/usage/packages-in-pyodide.html
  - Alternative: Test `pyodide.loadPackage('openpyxl')` in browser console
- **Risk**: Low — openpyxl is likely available, fallback is micropip install

#### 3.2. Update FileUpload validation to accept .xlsx (Complexity: Low)
- **File**: `src/components/FileUpload.tsx`
- **Changes**:
  - Line 20: Update extension check: `if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx'))`
  - Error message: "Please upload a CSV or Excel file (.xlsx)"
  - Accept attribute: `<input accept=".csv,.xlsx" />`
- **Risk**: None — simple condition change

#### 3.3. Load openpyxl package in Pyodide loader (Complexity: Low)
- **File**: `src/utils/pyodide.ts`
- **Changes**:
  - Line 78: Add 'openpyxl' to package array: `await pyodide.loadPackage(['pandas', 'numpy', 'openpyxl'])`
  - Update progress message: "Loading pandas, numpy, and openpyxl..."
- **Risk**: Low — same pattern as pandas/numpy loading

#### 3.4. Update analyzeData to handle both CSV and Excel (Complexity: Medium)
- **File**: `src/utils/analyzeData.ts`
- **Strategy**: Detect file type, read accordingly, then use same analysis pipeline
- **Changes**:
  - Add parameter: `fileType: 'csv' | 'xlsx'` to `analyzeData(csvData: string, fileType: 'csv' | 'xlsx')`
  - Python code:
    ```python
    if file_type == 'xlsx':
        import openpyxl
        from io import BytesIO
        # Excel data comes as base64, decode first
        excel_bytes = base64.b64decode(excel_data)
        df = pd.read_excel(BytesIO(excel_bytes))
    else:
        df = pd.read_csv(StringIO(csv_data))
    ```
  - For Excel: convert File to base64 in App.tsx (use FileReader API)
- **Edge Cases**:
  - Multiple sheets: default to first sheet (add comment in code)
  - Empty sheets: same validation as CSV
  - Formulas: pandas reads values, not formulas (document in error message if needed)
- **Risk**: Medium — base64 encoding adds complexity, need to test with real Excel files

#### 3.5. Update App.tsx to detect file type and encode Excel (Complexity: Medium)
- **File**: `src/App.tsx`
- **Changes in handleFileSelect**:
  ```typescript
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const fileType = file.name.endsWith('.xlsx') ? 'xlsx' : 'csv';

      if (fileType === 'xlsx') {
        // Convert to base64 for Pyodide
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        await runAnalysis(file.name, base64, 'xlsx');
      } else {
        const text = await file.text();
        await runAnalysis(file.name, text, 'csv');
      }
    } catch (error) {
      console.error('File read failed:', error);
      setError(new Error('Failed to read file...'));
    }
  }, [runAnalysis]);
  ```
- **Changes in runAnalysis signature**:
  - Add parameter: `fileType: 'csv' | 'xlsx' = 'csv'`
  - Pass to analyzeData: `await analyzeData(csvText, fileType)`
- **Risk**: Medium — base64 encoding large files may cause memory issues (same 10MB limit applies)

#### 3.6. Update error messages for Excel-specific issues (Complexity: Low)
- **File**: `src/utils/errorHandler.ts`
- **Changes**:
  - Add Excel-specific error patterns:
    - `"no default engine"` → "Excel file could not be read. Ensure openpyxl is loaded."
    - `"Excel file format cannot be determined"` → "File may be corrupted or not a valid Excel file."
    - `"Worksheet .* not found"` → "Excel file has no data sheets."
  - Add to suggestions: "Try re-saving the Excel file or exporting as CSV first."
- **Risk**: Low — just better error messaging

#### 3.7. Test with real Excel files (Complexity: Low)
- **Test Cases**:
  1. Simple Excel file (single sheet, numeric/categorical columns)
  2. Excel with formulas (should read calculated values)
  3. Excel with multiple sheets (should use first sheet)
  4. Corrupted Excel file (should show error)
  5. Large Excel file (should respect 10MB limit)
- **Datasets**: Use existing sample datasets but export to .xlsx format
- **Risk**: Low — verification step

---

## Open Questions
**None** — all features are well-scoped and follow existing patterns.

---

## Verification

### Feature 1: Keyboard Shortcuts Help Modal
- [ ] Press "?" key → modal appears
- [ ] Modal shows all shortcuts with clear descriptions
- [ ] ESC key closes modal
- [ ] Backdrop click closes modal
- [ ] Modal doesn't interfere with other keyboard shortcuts
- [ ] Typing "?" in search box doesn't trigger modal (guard clause works)

### Feature 2: Responsive Mobile Design
- [ ] Test on iPhone SE (375px): all UI visible, no horizontal scroll
- [ ] Test on iPad (768px): optimal layout utilization
- [ ] Test on desktop (1280px+): no regressions
- [ ] All tap targets ≥44px on mobile
- [ ] No hover-only UX (all interactions work via touch)
- [ ] Column detail modal: full-width on mobile, slides in smoothly
- [ ] Correlation matrix: scrolls horizontally on mobile if needed
- [ ] Tab navigation: readable and tappable on narrow screens
- [ ] File upload: sample dataset cards not cramped

### Feature 3: Excel File Support
- [ ] Upload .xlsx file → analysis runs successfully
- [ ] Excel results match CSV results for same data
- [ ] Upload CSV file → still works (no regression)
- [ ] Upload .xlsx with formulas → values are analyzed (not formulas)
- [ ] Upload .xlsx with multiple sheets → uses first sheet
- [ ] Upload corrupted .xlsx → shows helpful error message
- [ ] File picker shows "CSV or Excel (.xlsx)" in validation message
- [ ] openpyxl loads without errors (check browser console)
- [ ] Large Excel file (>10MB) → rejected with clear message

---

## Risk Assessment

| Feature | Complexity | Main Risk | Mitigation |
|---------|------------|-----------|------------|
| Keyboard Shortcuts Modal | **Low** | None | Reuse ConfirmModal pattern |
| Responsive Mobile - Headers/Tabs | **Low** | Layout shifts | Test on real devices |
| Responsive Mobile - ColumnDetailModal | **Medium** | Body scroll lock on iOS Safari | Test extensively on iOS |
| Responsive Mobile - CorrelationMatrix | **Medium** | Readability at small sizes | Allow horizontal scroll |
| Excel Support - openpyxl loading | **Low** | Package not available | Check docs first |
| Excel Support - base64 encoding | **Medium** | Memory issues with large files | Keep 10MB limit |
| Excel Support - multi-sheet files | **Low** | User expects specific sheet | Document behavior |

---

## Implementation Order

1. **Keyboard Shortcuts Help Modal** (1-2 hours)
   - Quick win, high visibility, low risk
   - Steps: 1.1 → 1.2 → 1.3

2. **Excel File Support** (2-3 hours)
   - Core functionality, medium complexity
   - Steps: 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7

3. **Responsive Mobile Design** (4-6 hours)
   - Most time-consuming, requires device testing
   - Steps: 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 → 2.9

**Total Estimated Time:** 7-11 hours

---

## Notes

- All three features are **additive** — no breaking changes to existing functionality
- Each feature can be implemented and tested independently
- Responsive design is the most iterative (requires real device testing)
- Excel support reuses existing CSV analysis pipeline (just different parsing)
- Keyboard shortcuts modal is the smallest, highest-impact feature (do first for quick win)
