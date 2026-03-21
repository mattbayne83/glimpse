# Implementation Plan: Tooltip Design Improvements

**Status:** Ready for Implementation
**Created:** March 21, 2026
**Based On:** UI Design Review (Score: 2.7/5 → Target: 4/5)

---

## Plan: Enhanced Educational Tooltips with Glassmorphic Treatment

### Goal
Transform generic tooltips into polished, educational overlays with visual hierarchy, glassmorphic styling, and interaction polish.

### Acceptance Criteria
- [x] Term name appears as bold header in tooltip (visual hierarchy)
- [x] Definition text has comfortable line-height (readability)
- [x] Tooltip uses glassmorphic treatment matching app design system
- [x] 300ms hover delay prevents accidental triggers while scrolling
- [x] Smooth 200ms fade-in animation on appearance
- [x] Subtle brand accent (left border in primary color)
- [x] ARIA support with `aria-describedby` and unique IDs
- [x] No ESLint errors, all existing tooltips work
- [x] Dark mode fully supported

---

## Steps

### 1. Add Fade-In Animation to CSS (Complexity: Low)

**Files:** `src/index.css`

**Implementation:**
Add new keyframe animation after existing `slide-in-right` animation (around line 185):

```css
@keyframes fade-in-tooltip {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.animate-fade-in-tooltip {
  animation: fade-in-tooltip 0.2s ease-out;
}
```

**Why:** Custom animation provides both fade + slight upward slide for polish. Uses `transform: translateX(-50%)` to maintain centered positioning.

**Risk:** None — purely additive CSS.

---

### 2. Update Tooltip Component with All Improvements (Complexity: Medium)

**Files:** `src/components/Tooltip.tsx`

**Changes:**
1. Add `term` prop to interface (required for header)
2. Import `useId` from React for ARIA
3. Add hover delay state management (300ms)
4. Apply glassmorphic styling (`bg-bg-surface/90`, `backdrop-blur-md`)
5. Restructure content: term header + definition body
6. Increase padding (`px-4 py-3`), line-height (`leading-relaxed`)
7. Add brand accent (left border `border-l-2 border-primary/30`)
8. Add fade-in animation class
9. Implement `aria-describedby` linking

**New Interface:**
```typescript
interface TooltipProps {
  term: string;        // NEW: term name for header
  content: string;     // definition text
  children: React.ReactNode;
  className?: string;
}
```

**Implementation Pattern:**
```typescript
const [isHovered, setIsHovered] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);
const tooltipId = useId();

// 300ms delay before showing
useEffect(() => {
  let timeout: NodeJS.Timeout;
  if (isHovered) {
    timeout = setTimeout(() => setShowTooltip(true), 300);
  } else {
    setShowTooltip(false);
  }
  return () => clearTimeout(timeout);
}, [isHovered]);
```

**Visual Structure:**
```tsx
{showTooltip && (
  <div
    id={tooltipId}
    role="tooltip"
    className="absolute z-50 px-4 py-3 bg-bg-surface/90 backdrop-blur-md
      border border-border-default/50 border-l-2 border-l-primary/30
      rounded-lg shadow-2xl max-w-xs pointer-events-none
      top-full left-1/2 -translate-x-1/2 mt-2
      animate-fade-in-tooltip"
  >
    {/* Term Header */}
    <div className="font-semibold text-sm text-primary leading-snug mb-1.5">
      {term}
    </div>

    {/* Definition Body */}
    <div className="text-xs text-text-secondary leading-relaxed">
      {content}
    </div>

    {/* Arrow */}
    <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2
      bg-bg-surface/90 border-border-default/50 rotate-45
      top-[-5px] border-t border-l" />
  </div>
)}
```

**Risk:** Breaking change to component API (adds required `term` prop). Mitigation: Update all call sites in same commit.

---

### 3. Update InfoIcon to Pass Term Name (Complexity: Low)

**Files:** `src/components/InfoIcon.tsx`

**Changes:**
1. Import `getTerm()` instead of just `getTermDefinition()`
2. Retrieve full term object
3. Pass `term` prop to Tooltip (term name, not just definition)
4. Handle case where term not found

**Before:**
```typescript
const definition = getTermDefinition(term);
return (
  <Tooltip content={definition}>
    {/* ... */}
  </Tooltip>
);
```

**After:**
```typescript
const glossaryTerm = getTerm(term);
const definition = glossaryTerm?.definition;

if (!glossaryTerm || !definition) {
  console.warn(`InfoIcon: Term "${term}" not found in glossary`);
  return null;
}

return (
  <Tooltip term={glossaryTerm.term} content={definition}>
    {/* ... */}
  </Tooltip>
);
```

**Risk:** Low — `getTerm()` function already exists and returns full object.

---

### 4. Verify getTerm Function Exists (Complexity: Low)

**Files:** `src/data/glossary.ts`

**Action:** Read-only verification — confirm function signature:

```typescript
export function getTerm(term: string): GlossaryTerm | undefined {
  return glossaryMap.get(term.toLowerCase());
}
```

**Expected:** Function exists (confirmed via exploration). No changes needed.

**Risk:** None — verification only.

---

### 5. Update Arrow Styling for Glassmorphic Backdrop (Complexity: Low)

**Files:** `src/components/Tooltip.tsx` (within Step 2)

**Issue:** Arrow uses `bg-bg-surface` (solid), but tooltip now uses `bg-bg-surface/90` (90% opacity). Mismatch creates visible seam.

**Fix:** Match arrow background to tooltip background:

```tsx
<div className="
  absolute left-1/2 -translate-x-1/2 w-2 h-2
  bg-bg-surface/90        {/* Match tooltip opacity */}
  border-border-default/50 {/* Match tooltip border opacity */}
  rotate-45 top-[-5px] border-t border-l
" />
```

**Alternative:** Use pseudo-element with `backdrop-filter` inheritance (more complex, defer to future iteration).

**Risk:** None — simple opacity match.

---

### 6. Test All Existing Tooltip Call Sites (Complexity: Low)

**Files to Test:**
1. `src/components/ColumnDetailModal.tsx` — InfoIcons on Mean, Median, Std Dev, etc.
2. `src/components/MissingDataTable.tsx` — InfoIcon on "Completeness"
3. `src/components/CorrelationMatrix.tsx` — InfoIcon on correlation terms

**Test Cases:**
- [ ] Hover over "Mean" info icon → tooltip shows "Mean" header + definition
- [ ] Hover over "Bimodal" badge → tooltip appears after 300ms delay
- [ ] Tooltip fades in smoothly (not jarring pop)
- [ ] Glassmorphic background blurs content behind it
- [ ] Left border accent is visible in primary color
- [ ] Dark mode: all colors appropriate, no contrast issues
- [ ] Keyboard focus (Tab to icon) → tooltip appears
- [ ] ESC key closes modal → tooltip disappears

**Risk:** Medium — breaking change to API. Mitigation: Compile-time TypeScript errors will catch all call sites.

---

### 7. Add ESLint Check (Complexity: Low)

**Command:**
```bash
npx eslint src/components/Tooltip.tsx src/components/InfoIcon.tsx --max-warnings 0
```

**Expected:** Zero errors, zero warnings.

**Risk:** Low — TypeScript strict mode will catch issues during development.

---

### 8. Visual QA in Browser (Complexity: Low)

**Test Scenarios:**

**Scenario 1: Educational Clarity**
1. Upload E-Commerce dataset
2. Click "emails_open" column
3. Hover over "Mean" info icon
4. ✅ Verify: Term "Mean" appears as bold blue header
5. ✅ Verify: Definition appears below in smaller gray text
6. ✅ Verify: Line-height feels comfortable (not cramped)

**Scenario 2: Glassmorphic Treatment**
1. In column detail modal, scroll to Statistics section
2. Hover over "Standard Deviation" info icon
3. ✅ Verify: Tooltip has semi-transparent background
4. ✅ Verify: Content behind tooltip is blurred
5. ✅ Verify: Left border accent is visible (subtle blue)

**Scenario 3: Interaction Polish**
1. Rapidly move mouse over multiple info icons
2. ✅ Verify: Tooltips don't flash instantly (300ms delay)
3. ✅ Verify: Fade-in animation is smooth
4. ✅ Verify: No jank or layout shift

**Scenario 4: Dark Mode**
1. Toggle dark mode via header button
2. Hover over info icons in both modes
3. ✅ Verify: Glassmorphic effect works in dark mode
4. ✅ Verify: Text remains readable (sufficient contrast)
5. ✅ Verify: Primary color accent adjusts appropriately

**Scenario 5: Accessibility**
1. Use keyboard only (Tab key)
2. Tab to info icon → tooltip appears
3. Tab away → tooltip disappears
4. ✅ Verify: Screen reader announces tooltip content
5. ✅ Verify: No console warnings about ARIA

**Risk:** Low — visual verification only.

---

## Open Questions

**None.** All design decisions were made in the UI review. Implementation is straightforward.

---

## Verification Checklist

### Functional Requirements
- [ ] Term name appears as header in tooltip (bold, primary color)
- [ ] Definition text has `leading-relaxed` line-height
- [ ] Glassmorphic styling applied (`bg-bg-surface/90`, `backdrop-blur-md`)
- [ ] 300ms hover delay before tooltip shows
- [ ] 200ms fade-in animation plays smoothly
- [ ] Left border accent visible (`border-l-2 border-l-primary/30`)
- [ ] `aria-describedby` links trigger to tooltip
- [ ] Unique ID generated via `useId()` for each tooltip

### Technical Requirements
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint errors (`npx eslint --max-warnings 0`)
- [ ] All InfoIcon call sites work (ColumnDetailModal, MissingDataTable, CorrelationMatrix)
- [ ] Dark mode fully supported (no hardcoded colors)
- [ ] Animation doesn't cause layout shift
- [ ] Tooltip doesn't flicker on rapid hover/unhover

### Design System Alignment
- [ ] Uses semantic color tokens (not hardcoded hex values)
- [ ] Matches glassmorphic treatment from rest of app
- [ ] Font sizes follow type scale (text-sm header, text-xs body)
- [ ] Spacing uses 8px base grid (px-4 py-3 = 16px/12px)
- [ ] Primary color accent matches brand guidelines

---

## Risk Assessment

| Step | Complexity | Risk | Mitigation |
|------|-----------|------|------------|
| 1. Add CSS animation | Low | None | Purely additive |
| 2. Update Tooltip component | Medium | Breaking API change | TypeScript catches all call sites |
| 3. Update InfoIcon | Low | getTerm() might fail | Already has fallback handling |
| 4. Verify getTerm exists | Low | None | Read-only check |
| 5. Update arrow styling | Low | Visual mismatch | Opacity match is simple |
| 6. Test call sites | Low | Missed edge case | Manual browser testing |
| 7. ESLint check | Low | None | Automated |
| 8. Visual QA | Low | Subjective assessment | Checklist-based |

**Overall Risk:** Low-Medium — The API change is breaking, but TypeScript will catch all issues at compile time.

---

## Implementation Order

**Sequential (cannot parallelize):**

1. **Step 1: Add CSS animation** (1 min)
   - Must exist before Tooltip uses `animate-fade-in-tooltip` class

2. **Step 2: Update Tooltip.tsx** (15 min)
   - Core component changes

3. **Step 3: Update InfoIcon.tsx** (5 min)
   - Depends on Tooltip accepting `term` prop

4. **Step 4: Verify getTerm** (1 min)
   - Quick read-only check

5. **Step 7: ESLint check** (1 min)
   - Catch any errors before browser testing

6. **Step 6: Test call sites** (10 min)
   - Browser-based verification

7. **Step 8: Visual QA** (10 min)
   - Final polish check

**Total Estimated Time:** ~45 minutes

---

## Notes

- **Backwards Compatibility:** This is a breaking change to Tooltip API (adds required `term` prop). All call sites must be updated in same commit.
- **Future Enhancement:** Consider adding examples to tooltips (glossary data includes optional `example` field). Defer to Phase 2.
- **Performance:** 300ms delay + 200ms animation = 500ms total before fully visible. Acceptable for educational tooltips (not time-critical UI).
- **Accessibility:** `useId()` ensures stable IDs across server/client renders (important for SSR if app adds it later).

---

## Success Metrics

**Before (Current State):**
- Visual Hierarchy: 2/5
- Typography: 2.5/5
- Spacing: 3/5
- Consistency: 2/5
- **Overall: 2.7/5**

**After (Target State):**
- Visual Hierarchy: 4.5/5 (term header + body hierarchy)
- Typography: 4.5/5 (comfortable line-height, proper scale)
- Spacing: 4/5 (increased padding, better breathing room)
- Consistency: 4.5/5 (glassmorphic treatment matches app)
- **Overall: 4+/5** ✅

---

## Rollback Plan

If issues arise:
1. **Immediate:** Revert Tooltip.tsx to previous version (git checkout)
2. **InfoIcon:** Will break without `term` prop — revert InfoIcon.tsx too
3. **CSS:** Safe to leave animation (unused keyframes don't harm anything)

**Git Strategy:** Single atomic commit with all changes (easier to revert if needed).
