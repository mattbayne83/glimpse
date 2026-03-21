# Implementation Plan: Phase 1 Features

**Status:** Ready for Implementation
**Created:** March 20, 2026
**Features:** Statistics Explanations + Arrow Key Column Navigation

---

## Plan: Statistics Glossary & Power User Navigation

### Goal
Empower non-technical users with inline help tooltips and a glossary modal, while enabling power users to rapidly explore columns using keyboard shortcuts.

### Acceptance Criteria
- [ ] Info icons appear next to all technical terms with hover tooltips
- [ ] Global glossary modal opens via `g` key shortcut
- [ ] Arrow keys (←/→) navigate between columns when detail modal is open
- [ ] Column position indicator shows "Column X/Y" in modal header
- [ ] All new shortcuts documented in KeyboardShortcutsModal
- [ ] Zero visual regressions in light/dark modes
- [ ] No performance impact on dataset analysis

---

## Steps

### 1. Create Tooltip Component (Complexity: Low)

**Files:**
- `src/components/Tooltip.tsx` (new)

**Implementation:**
```typescript
interface TooltipProps {
  term: string;           // Technical term to display
  children: React.ReactNode;  // Trigger element (e.g., info icon)
}
```

**Design:**
- Use native browser `title` attribute for simplicity (Phase 1)
- Or build custom positioned tooltip with `absolute` positioning + `onMouseEnter`/`onMouseLeave`
- Recommendation: Start with simple approach, enhance later if needed
- Dark mode: Use `bg-bg-surface`, `border-border-default`, `text-text-primary` tokens
- Positioning: Top-center by default, flip if too close to viewport edge

**Risk:** Custom tooltips can be complex. Mitigation: Use Radix UI Tooltip or similar library if building from scratch proves fragile.

---

### 2. Create Glossary Data Structure (Complexity: Low)

**Files:**
- `src/data/glossary.ts` (new)

**Structure:**
```typescript
export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'distribution' | 'statistics' | 'correlation' | 'quality';
  example?: string;  // Optional example for clarity
}

export const glossary: GlossaryTerm[] = [
  {
    term: 'Bimodal',
    definition: 'A distribution with two distinct peaks, suggesting two separate groups in your data.',
    category: 'distribution',
    example: 'Ages might show peaks at 25-35 (young professionals) and 55-65 (senior staff).'
  },
  // ... 20-25 terms total
];
```

**Terms to Include:**

**Distribution Shapes:**
- Bimodal, Right-skewed, Left-skewed, Normal, Uniform

**Statistical Measures:**
- Mean, Median, Standard Deviation (Std Dev), Interquartile Range (IQR), Quartiles (Q1/Q2/Q3), Kurtosis, Skewness, Outliers

**Correlation:**
- Pearson r, P-value, Significance, Correlation coefficient

**Data Quality:**
- Completeness, Cardinality, Missing values

**Risk:** Definitions too technical. Mitigation: Review against non-technical audience, use analogies.

---

### 3. Create GlossaryModal Component (Complexity: Low-Medium)

**Files:**
- `src/components/GlossaryModal.tsx` (new)

**Structure:**
```typescript
interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Design:**
- Follow KeyboardShortcutsModal pattern (centered, max-w-2xl, categorized sections)
- Group terms by category with expandable/collapsible sections
- Search input to filter terms (optional for Phase 1)
- ESC to close
- Sticky header with close button
- Footer: "Press G to toggle • ESC to close"

**Layout:**
```
┌─────────────────────────────────────┐
│ Statistics Glossary            [X]  │ ← Header
├─────────────────────────────────────┤
│ [Search terms...] (optional)        │ ← Search input
│                                     │
│ Distribution Shapes                 │ ← Category
│   Bimodal                           │
│   A distribution with two peaks...  │
│   Example: Ages at 25-35 and 55-65  │
│                                     │
│   Normal                            │
│   Bell curve, data clusters...      │
│                                     │
│ Statistical Measures                │
│   ...                               │
└─────────────────────────────────────┘
```

**Risk:** Modal content too long. Mitigation: Categorize clearly, add search if > 25 terms.

---

### 4. Add InfoIcon Helper Component (Complexity: Low)

**Files:**
- `src/components/InfoIcon.tsx` (new)

**Implementation:**
```typescript
interface InfoIconProps {
  term: keyof typeof glossaryTerms;  // Type-safe term keys
  className?: string;
}

export function InfoIcon({ term, className }: InfoIconProps) {
  const definition = glossaryTerms[term];

  return (
    <Tooltip term={definition}>
      <HelpCircle className={cn("w-4 h-4 text-text-secondary hover:text-text-primary cursor-help inline-block", className)} />
    </Tooltip>
  );
}
```

**Usage:**
```tsx
<span>
  Bimodal <InfoIcon term="bimodal" />
</span>
```

**Risk:** None.

---

### 5. Integrate InfoIcon into Components (Complexity: Low)

**Files to Update:**

**ColumnDetailModal.tsx** (~490 lines):
- Line ~235: Distribution shape badge (e.g., "Bimodal")
- Line ~245-280: Statistics section (mean, median, std, IQR)
- Line ~400-420: Correlations section (Pearson r, p-value)

**ColumnPreviewCard.tsx** (~205 lines):
- Line ~140-160: Stats display (mean, median, unique)
- Line ~90-100: Completeness badge

**CorrelationMatrix.tsx** (~140 lines):
- Line ~40-60: Header explaining correlation coefficient

**MissingDataTable.tsx** (~230 lines):
- Line ~80: Completeness header

**Changes:**
```tsx
// Before
<div className="...">Mean: {mean}</div>

// After
<div className="...">
  Mean <InfoIcon term="mean" />: {mean}
</div>
```

**Risk:** Visual clutter if too many icons. Mitigation: Only add to non-obvious terms (skip "Count", keep "Kurtosis").

---

### 6. Add Global Glossary Shortcut to App.tsx (Complexity: Low)

**Files:**
- `src/App.tsx`

**Changes:**
```typescript
// Add state (line ~22)
const [showGlossaryModal, setShowGlossaryModal] = useState(false);

// Update keyboard handler (line ~131-148)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      setShowShortcutsModal(true);
    }

    // NEW: Global glossary shortcut
    if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      setShowGlossaryModal(true);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);

// Add modal render (line ~220+)
{showGlossaryModal && (
  <GlossaryModal
    isOpen={showGlossaryModal}
    onClose={() => setShowGlossaryModal(false)}
  />
)}
```

**Risk:** `g` key conflicts with typing. Mitigation: Input field guard prevents this.

---

### 7. Add Glossary Button to Header (Complexity: Low)

**Files:**
- `src/App.tsx`

**Changes:**
Add button next to "?" help icon (line ~177-186):

```tsx
<button
  onClick={() => setShowGlossaryModal(true)}
  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors duration-150 active:scale-95"
  title="Statistics Glossary (G)"
  aria-label="Show statistics glossary"
>
  <BookOpen className="w-5 h-5" />
</button>
```

**Risk:** Header crowding. Mitigation: Use Lucide `BookOpen` icon, visually distinct from `HelpCircle`.

---

### 8. Update ColumnDetailModal Props for Navigation (Complexity: Medium)

**Files:**
- `src/components/ColumnDetailModal.tsx`

**New Props:**
```typescript
interface ColumnDetailModalProps {
  columnName: string;
  result: AnalysisResult;
  onClose: () => void;
  // NEW: Navigation support
  columnIndex: number;      // Current column position (0-based)
  totalColumns: number;     // Total number of columns
  onNavigate: (direction: 'prev' | 'next') => void;  // Callback to change column
}
```

**Changes:**
- Header (line ~205-220): Add position indicator
  ```tsx
  <div className="flex items-center gap-2">
    <h2 className="text-2xl font-bold text-text-primary truncate">{columnName}</h2>
    <span className="text-sm text-text-secondary whitespace-nowrap">
      {columnIndex + 1} / {totalColumns}
    </span>
  </div>
  ```

- Add navigation listener (new useEffect):
  ```typescript
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      // Don't interfere with text inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleNavigation);
    return () => document.removeEventListener('keydown', handleNavigation);
  }, [onNavigate]);
  ```

**Risk:** Arrow keys conflict with existing tab navigation. Mitigation: AnalysisView.tsx already has `if (!selectedColumn)` guard.

---

### 9. Update AnalysisView Navigation Logic (Complexity: Medium)

**Files:**
- `src/components/AnalysisView.tsx`

**Changes:**

1. Track column list order (line ~80-120, after filtering logic):
```typescript
// Get ordered column list (respects current filter/search)
const orderedColumns = useMemo(() => {
  return columns.filter((col) => {
    // Apply existing filter logic
    if (columnFilter === 'numeric' && col.analysis.type !== 'numeric') return false;
    if (columnFilter === 'categorical' && col.analysis.type !== 'categorical') return false;
    if (columnFilter === 'datetime' && col.analysis.type !== 'datetime') return false;

    // Apply search filter
    if (columnSearch && !col.name.toLowerCase().includes(columnSearch.toLowerCase())) {
      return false;
    }

    return true;
  });
}, [columns, columnFilter, columnSearch]);
```

2. Add navigation handler:
```typescript
const handleColumnNavigation = useCallback((direction: 'prev' | 'next') => {
  if (!selectedColumn) return;

  const currentIndex = orderedColumns.findIndex((col) => col.name === selectedColumn);
  if (currentIndex === -1) return;

  let newIndex: number;
  if (direction === 'prev') {
    // Wrap to end if at start
    newIndex = currentIndex === 0 ? orderedColumns.length - 1 : currentIndex - 1;
  } else {
    // Wrap to start if at end
    newIndex = currentIndex === orderedColumns.length - 1 ? 0 : currentIndex + 1;
  }

  setSelectedColumn(orderedColumns[newIndex].name);
}, [selectedColumn, orderedColumns]);
```

3. Update modal props (line ~342-349):
```tsx
{selectedColumn && (
  <ColumnDetailModal
    columnName={selectedColumn}
    result={result}
    onClose={() => setSelectedColumn(null)}
    // NEW
    columnIndex={orderedColumns.findIndex((col) => col.name === selectedColumn)}
    totalColumns={orderedColumns.length}
    onNavigate={handleColumnNavigation}
  />
)}
```

**Risk:** Navigation breaks when filter changes mid-navigation. Mitigation: `orderedColumns` recalculates via useMemo, navigation respects current filter.

---

### 10. Update KeyboardShortcutsModal Documentation (Complexity: Low)

**Files:**
- `src/components/KeyboardShortcutsModal.tsx`

**Changes:**
Update shortcuts array (line ~8-30):

```typescript
const shortcuts: { category: string; items: Shortcut[] }[] = [
  {
    category: 'Navigation',
    items: [
      { keys: ['←', '→'], description: 'Navigate between tabs (or columns in detail view)' },  // UPDATED
      { keys: ['1'], description: 'Jump to Overview tab' },
      { keys: ['2'], description: 'Jump to Columns tab' },
      { keys: ['3'], description: 'Jump to Quality tab' },
    ],
  },
  {
    category: 'Actions',
    items: [
      { keys: ['Esc'], description: 'Close modal or show clear confirmation' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['G'], description: 'Show statistics glossary' },  // NEW
    ],
  },
];
```

**Risk:** None.

---

### 11. Test Dark Mode Compatibility (Complexity: Low)

**Files:**
- All new components (Tooltip, GlossaryModal, InfoIcon)

**Testing:**
1. Toggle dark mode via header button
2. Verify all new components use semantic tokens:
   - `bg-bg-surface` (NOT `bg-white`)
   - `text-text-primary` (NOT `text-gray-900`)
   - `border-border-default` (NOT `border-gray-300`)
3. Verify InfoIcon hover states work in both modes
4. Check glossary modal backdrop in dark mode (should be `bg-black/50`)

**Risk:** Hardcoded colors break dark mode. Mitigation: Use ONLY semantic Tailwind tokens from `@theme` block.

---

### 12. Accessibility Audit (Complexity: Low)

**Checks:**
- [ ] All InfoIcons have `aria-label` or tooltip text for screen readers
- [ ] GlossaryModal has `role="dialog"` and `aria-modal="true"`
- [ ] All interactive elements meet 44×44px min touch target (mobile)
- [ ] Keyboard navigation works without mouse (tab, enter, esc)
- [ ] Focus visible states on all new interactive elements

**Files to Audit:**
- Tooltip.tsx
- GlossaryModal.tsx
- InfoIcon.tsx

**Risk:** Screen readers can't access tooltip content. Mitigation: Use `aria-describedby` to link tooltip text.

---

## Open Questions

1. **Tooltip Implementation Choice:**
   - Option A: Native browser `title` attribute (simple, zero dependencies)
   - Option B: Custom React tooltip (better UX, more control)
   - Option C: Radix UI Tooltip (accessible, battle-tested)

   **Recommendation:** Start with Option A for speed, upgrade to C if needed.

2. **Glossary Search:**
   - Include in Phase 1 or defer to Phase 2?
   - 20-25 terms might not need search immediately.

   **Recommendation:** Defer. Categorization is sufficient for Phase 1.

3. **Column Navigation Order:**
   - Should arrow keys respect current filter/search?
   - Or navigate through ALL columns regardless?

   **Recommendation:** Respect filters (implemented in Step 9). More intuitive UX.

4. **InfoIcon Placement:**
   - Add to ALL technical terms or only non-obvious ones?
   - Risk of visual clutter vs. comprehensive help.

   **Recommendation:** Start conservative (10-12 terms), expand based on user feedback.

---

## Verification

### Manual Testing
- [ ] Open Glimpse with sample dataset (E-Commerce)
- [ ] Press `G` → glossary modal opens
- [ ] Hover over InfoIcon → tooltip appears
- [ ] Click column card → detail modal opens
- [ ] Press `→` → next column loads
- [ ] Press `←` from first column → wraps to last column
- [ ] Press `?` → keyboard shortcuts show new `G` entry
- [ ] Toggle dark mode → all new UI elements render correctly
- [ ] ESC closes modals appropriately

### Automated Testing (Optional)
- [ ] Unit test: glossary data has all required fields
- [ ] Unit test: navigation wraps correctly at boundaries
- [ ] Visual regression test: snapshot new components in light/dark

### Performance
- [ ] Measure dataset load time before/after changes
- [ ] Ensure no regression (should be < 5ms difference)
- [ ] InfoIcon tooltips don't cause layout thrashing

---

## Implementation Order

1. **Day 1: Glossary Infrastructure**
   - Create glossary.ts data (Step 2)
   - Create Tooltip component (Step 1)
   - Create InfoIcon component (Step 4)
   - Test in isolation

2. **Day 2: Glossary Modal**
   - Create GlossaryModal component (Step 3)
   - Add global `G` shortcut to App.tsx (Step 6)
   - Add glossary button to header (Step 7)
   - Update KeyboardShortcutsModal (Step 10)

3. **Day 3: InfoIcon Integration**
   - Add InfoIcons to ColumnDetailModal (Step 5)
   - Add InfoIcons to ColumnPreviewCard (Step 5)
   - Add InfoIcons to CorrelationMatrix (Step 5)
   - Add InfoIcons to MissingDataTable (Step 5)

4. **Day 4: Column Navigation**
   - Update ColumnDetailModal props + navigation (Step 8)
   - Update AnalysisView navigation logic (Step 9)
   - Update KeyboardShortcutsModal (Step 10)
   - Test wrap-around behavior

5. **Day 5: Polish & Testing**
   - Dark mode testing (Step 11)
   - Accessibility audit (Step 12)
   - Manual verification checklist
   - Fix any issues found

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tooltip implementation fragile | Medium | Use proven library (Radix UI) if custom breaks |
| Arrow keys conflict with tab navigation | High | AnalysisView already guards with `!selectedColumn` |
| Visual clutter from too many InfoIcons | Medium | Start conservative, iterate based on feedback |
| Performance regression from tooltips | Low | Use CSS-only hover if JS tooltips cause issues |
| Glossary definitions too technical | Medium | Review with non-technical user before finalizing |
| Dark mode color bugs | Low | Use ONLY semantic tokens, never hardcode colors |
| Navigation breaks with filters | Medium | Use `orderedColumns` from filtered list |

---

## Success Metrics

**Quantitative:**
- Zero ESLint errors
- Zero TypeScript errors
- < 5ms performance regression on dataset load
- 100% dark mode visual parity with light mode

**Qualitative:**
- Non-technical users understand all statistical terms without external resources
- Power users can explore 10+ columns faster with keyboard than with mouse
- No user confusion about new shortcuts (clear documentation)
- New UI feels "native" to existing design system

---

## Follow-up Ideas (Phase 2+)

- Visual examples in glossary (e.g., show bimodal histogram diagram)
- Search/filter in glossary modal
- "Related terms" links in glossary entries
- Contextual glossary (e.g., open to "bimodal" if clicking from bimodal badge)
- Keyboard shortcut to jump to specific column by number (1-9)
- Column navigation preview (show next column name on hover)
