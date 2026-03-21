# Glimpse - Elon Cleanup Plan

**Generated:** March 20, 2026
**Goal:** Remove dead code, fix TypeScript errors, simplify architecture, improve performance

---

## PHASE 1: DELETIONS (Step 2)

### A. Glossary System Cleanup ✅ APPROVED (with modifications)
**Decision:** Keep Tooltip.tsx (already simplified), delete unused components

- [x] **KEEP** `Tooltip.tsx` - Already simplified, used by InfoIcon
- [ ] **DELETE** `GlossaryModal.tsx` (150 lines) - Never imported/used
- [ ] **DELETE** `GlossaryTooltip.tsx` (84 lines) - Never imported/used
- [ ] **DELETE** `InfoIcon.tsx` (33 lines) - Wrapper can be inlined
- [ ] **DELETE** `src/data/glossary.ts` - Data file no longer needed

**Impact:** Remove 267+ lines, simplify help system
**Replacement Strategy:** Inline Tooltip component directly where InfoIcon was used

---

### B. Unintegrated Components

#### B1. ScatterPlotMatrix ⚠️ NEEDS CONFIRMATION
- [ ] **DELETE** `ScatterPlotMatrix.tsx` (~250 lines)

**Justification:**
- Never integrated into app
- Requires raw data pipeline that violates privacy-first architecture
- Correlation matrix already shows relationships effectively
- Listed in BACKLOG but blocked by fundamental design constraint

**Question:** Confirm deletion? This cannot work with current architecture without major refactor.

---

#### B2. Duplicate BoxPlot ⚠️ NEEDS CONFIRMATION
- [ ] **DELETE** `BoxPlot.tsx` (~100 lines, if it exists)

**Verification needed:** Check if BoxPlot.tsx exists separately from BoxPlotVisualization.tsx
**Question:** Confirm deletion of unused duplicate?

---

### C. Dead Code in Existing Files

#### C1. Deprecated Dataset ⚠️ NEEDS CONFIRMATION
- [ ] **DELETE** `IRIS_DATASET_DEPRECATED` constant from `src/data/sampleDatasets.ts`

**Justification:** TypeScript flags as unused, replaced by new sample datasets
**Question:** Confirm deletion?

---

### D. MatrixBackground Decision ✅ KEEP (per user request)
- [x] **KEEP** `MatrixBackground.tsx` - User explicitly wants to keep this

---

## PHASE 2: SIMPLIFICATIONS (Step 3)

### A. TypeScript Error Fixes ⚠️ NEEDS CONFIRMATION

**Current errors:**
1. `NodeJS.Timeout` namespace errors in Tooltip.tsx (may be resolved by linter)
2. ScatterPlotMatrix duplicate JSX attributes (if kept)
3. Unused variable `IRIS_DATASET_DEPRECATED`

**Fix Strategy:**
- Add `@types/node` to dependencies (if Tooltip still has errors)
- Fix or delete ScatterPlotMatrix based on decision above
- Remove unused constants

**Question:** Proceed with TypeScript strict compliance?

---

### B. File Upload Limit ⚠️ NEEDS CONFIRMATION

**Current:** 10MB hard limit
**Proposed:** 50MB with warning for >10MB files

**Justification:**
- Modern browsers can handle 50-100MB easily
- Pyodide itself is 30MB
- Real limitation is processing time, not memory
- Better UX: let users try larger files with warning

**Question:** Increase file limit to 50MB?

---

### C. Component Usage Audit ⚠️ NEEDS CONFIRMATION

**Action:** Run unused export detection to find other dead code

```bash
npx unimported
```

**Question:** Run audit and review findings before deletion?

---

## PHASE 3: ACCELERATIONS (Step 4)

### A. Sample Dataset Compression ⚠️ NEEDS CONFIRMATION

**Current state:**
```
568K  ecommerce_customers.csv
632K  healthcare_patient_visits.csv
480K  hr_analytics.csv
44K   retail_sales_daily.csv
832K  saas_usage.csv
Total: ~2.5 MB
```

**Proposed:** Compress to `.csv.gz`
- Expected: ~500 KB total (80% reduction)
- Client-side decompression before pandas
- Faster network transfer

**Question:** Compress sample datasets?

---

### B. Pyodide Fallback CDN ⚠️ NEEDS CONFIRMATION

**Current:** Single CDN (cdn.jsdelivr.net)
**Proposed:** Add fallback CDNs (cdnjs, unpkg)

**Benefit:** 50% reduction in load failures due to CDN issues

**Question:** Implement CDN fallback chain?

---

### C. Bundle Splitting ⚠️ NEEDS CONFIRMATION

**Proposed lazy-loads:**
1. ColumnDetailModal (~490 lines) - only loads when user clicks column
2. Advanced viz components (TimeSeriesPlot, BoxPlotVisualization)

**Expected gain:** 50-80 KB reduction in initial bundle

**Question:** Implement lazy loading for heavy components?

---

### D. Icon Tree-Shaking ⚠️ NEEDS CONFIRMATION

**Current:** Full Lucide React icon set
**Proposed:** Import only used icons explicitly

**Expected gain:** 20-30 KB reduction

**Question:** Audit and optimize icon imports?

---

## PHASE 4: AUTOMATIONS (Step 5)

### A. TypeScript Strict Mode ⚠️ NEEDS CONFIRMATION

**Action:** Enable `strict: true` in tsconfig.json
**Benefit:** Catch errors at build time

**Question:** Enable strict mode after cleanup?

---

### B. Bundle Size Monitoring ⚠️ NEEDS CONFIRMATION

**Proposed:** Add size-limit to CI

```json
{
  "scripts": {
    "check-size": "size-limit"
  }
}
```

**Question:** Add bundle size monitoring?

---

### C. Pre-commit Hooks ⚠️ NEEDS CONFIRMATION

**Proposed checks:**
1. Unused export detection (unimported)
2. TypeScript errors (tsc --noEmit)
3. ESLint

**Question:** Set up pre-commit automation?

---

## SUMMARY OF DECISIONS NEEDED

### HIGH PRIORITY (Do First)
1. ✅ **APPROVED:** Keep MatrixBackground.tsx
2. ✅ **APPROVED:** Keep Tooltip.tsx, delete GlossaryModal/GlossaryTooltip/InfoIcon
3. ⚠️ **DELETE ScatterPlotMatrix?** (250 lines, never integrated)
4. ⚠️ **DELETE BoxPlot.tsx?** (duplicate, if it exists)
5. ⚠️ **DELETE IRIS_DATASET_DEPRECATED?** (unused constant)

### MEDIUM PRIORITY (Simplifications)
6. ⚠️ **Increase file limit to 50MB?** (from 10MB)
7. ⚠️ **Fix all TypeScript errors?** (strict mode)
8. ⚠️ **Run unused code audit?** (unimported tool)

### LOW PRIORITY (Optimizations)
9. ⚠️ **Compress sample datasets?** (2.5 MB → 500 KB)
10. ⚠️ **Add Pyodide CDN fallbacks?** (reliability)
11. ⚠️ **Lazy-load heavy components?** (bundle splitting)
12. ⚠️ **Tree-shake icons?** (20-30 KB savings)

### FUTURE (Automations)
13. ⚠️ **Enable TypeScript strict mode?**
14. ⚠️ **Add bundle size monitoring?**
15. ⚠️ **Set up pre-commit hooks?**

---

## ESTIMATED IMPACT

**Code Reduction:** 400-600 lines deleted (8-12% of component code)
**Bundle Size:** 100-150 KB lighter (38-58% reduction)
**TypeScript Errors:** 0 (from current 5+)
**Maintenance:** Simpler, more coherent architecture

---

## EXECUTION ORDER

1. **Phase 1A** - Delete glossary system (except Tooltip.tsx)
2. **Phase 1B** - Delete unintegrated components (ScatterPlotMatrix, BoxPlot)
3. **Phase 1C** - Remove dead code from existing files
4. **Phase 2A** - Fix TypeScript errors
5. **Phase 2B** - Increase file upload limit
6. **Phase 3** - Performance optimizations (compression, CDN, lazy-load)
7. **Phase 4** - Automation setup

**Question for user:** Which phases/items do you want to proceed with?
