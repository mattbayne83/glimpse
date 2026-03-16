# Dark Mode Implementation

## Architecture

Glimpse uses a **clean, props-based architecture** for dark mode that follows React best practices.

### Key Components

1. **`useThemeSync` hook** (`src/hooks/useThemeSync.ts`)
   - Syncs theme state with `<html>` class (adds/removes `.dark`)
   - Handles system preference detection when `theme='system'`
   - Listens for OS theme changes

2. **`useThemeColors` hook** (`src/hooks/useThemeColors.ts`)
   - Reads CSS variables from `:root`
   - Returns color object
   - Memoized - only re-computes when theme changes
   - **Single source of truth** for theme-reactive colors

3. **CSS Variables** (`src/index.css`)
   - Semantic tokens defined in `@theme` block
   - Light mode: default values
   - Dark mode: overrides in `.dark` class
   - Tailwind CSS 4 auto-generates utility classes (e.g., `bg-bg-surface`)

### Data Flow

```
User clicks ThemeToggle
  → setTheme() updates Zustand store
  → useThemeSync() adds/removes .dark class
  → CSS variables update
  → useThemeColors() re-computes (memoized)
  → Components re-render with new colors
```

### For HTML/CSS Components

Use Tailwind semantic classes:
```tsx
<div className="bg-bg-surface text-text-primary border-border-default">
  {/* Auto-adapts to theme via CSS */}
</div>
```

### For Canvas/SVG Components

Use `useThemeColors()` and pass as props:

```tsx
function Parent() {
  const colors = useThemeColors(); // Returns hardcoded colors based on resolved theme

  return <MatrixBackground
    color={colors.matrixChar}
    backgroundColor={colors.matrixBg}
  />;
}

function MatrixBackground({ color, backgroundColor }) {
  useEffect(() => {
    // Use color and backgroundColor here
    // Effect re-runs when colors change
  }, [color, backgroundColor]);
}
```

**CRITICAL:** `useThemeColors()` returns **hardcoded TypeScript values**, NOT values read from CSS via `getComputedStyle()`. This avoids race conditions with DOM class updates.

## Why This Architecture?

✅ **Separation of concerns**: Theme reading vs. rendering
✅ **Props-based**: Clear data flow, easy to debug
✅ **Stable dependencies**: No React Hook violations
✅ **HMR-friendly**: Works with hot module replacement
✅ **Testable**: Components are pure, hooks are isolated
✅ **Scalable**: Easy to add new theme-reactive components
✅ **No race conditions**: Colors are hardcoded in TS, not read from DOM
✅ **Pure React**: Data flows through React state, never through DOM reads

## The Anti-Pattern We Avoided

### This Lesson Took 7 Iterations to Learn

❌ **DON'T DO THIS:**
```typescript
// Reading CSS variables from DOM creates race conditions
const cssVars = getComputedStyle(document.documentElement);
const color = cssVars.getPropertyValue('--color-matrix-char');
```

✅ **DO THIS INSTEAD:**
```typescript
// Hardcode colors in TypeScript, select via React state
const resolvedTheme = useResolvedTheme(); // 'light' | 'dark'
return resolvedTheme === 'dark'
  ? { matrixChar: '#3B9EFF' }
  : { matrixChar: '#0066CC' };
```

### Why This Took So Long to Discover

**The Problem:** Reading from the DOM creates timing issues:
1. User clicks theme toggle → React state changes → triggers re-render
2. useEffect updates `.dark` class on `<html>` (happens AFTER render commits)
3. But useMemo/useState reads CSS via `getComputedStyle()` (happens DURING render)
4. **= Race condition**: Reads old CSS value before class updates

**The Symptom:** Dark mode "worked" inconsistently:
- Sometimes colors updated immediately
- Sometimes required a second click
- Sometimes only updated after page refresh
- Appeared to work in dev (HMR masked the issue)
- Failed reliably in production builds

**The False Trails (Iterations 1-6):**
1. "Maybe need to force re-render?" → Added extra useState, didn't help
2. "Maybe CSS variables not loading?" → Added delays, made it worse
3. "Maybe need to use refs?" → Over-complicated, still inconsistent
4. "Maybe need useLayoutEffect?" → No improvement
5. "Maybe need to read in useEffect?" → Still async issues
6. "Maybe need to debounce reads?" → Band-aid, not a fix

**The Solution (Iteration 7):**
- Stopped reading from DOM entirely
- Hardcoded color values in TypeScript
- Let React state be the source of truth
- Colors selected via `useResolvedTheme()` hook
- **Result:** 100% reliable, no race conditions, pure React data flow

### Key Insight

**CSS variables are for CSS, not for JavaScript.**

Use them for:
- ✅ Styling HTML elements via Tailwind classes
- ✅ Theme switching via `.dark` class

**Don't use them for:**
- ❌ Reading colors into JavaScript at runtime
- ❌ Passing values to canvas/SVG rendering
- ❌ Computing derived values in React hooks

**Instead:** Hardcode colors in TypeScript, duplicate the values. The duplication is worth it for reliability.

## Adding New Theme Colors

1. Add CSS variable to `src/index.css`:
   ```css
   @theme {
     --color-my-new-color: #123456;
   }
   .dark {
     --color-my-new-color: #ABCDEF;
   }
   ```

2. Add to `useThemeColors` hook:
   ```ts
   return {
     // ...
     myNewColor: cssVars.getPropertyValue('--color-my-new-color').trim(),
   };
   ```

3. Use in component:
   ```tsx
   const colors = useThemeColors();
   <div style={{ color: colors.myNewColor }} />
   ```

## Persistence

- Theme choice stored in localStorage (`glimpse-theme`)
- Zustand persist middleware syncs state
- FOUC prevention script in `index.html` applies theme before CSS loads

## Testing Theme Toggle

1. Light mode: No `.dark` class on `<html>`
2. Dark mode: `.dark` class added to `<html>`
3. System mode: Follows OS preference (test by changing system settings)
4. Persistence: Reload page, theme persists
5. No FOUC: Theme applied before first paint
