# Glossary Tooltip System

Glimpse provides two complementary tooltip components for displaying statistical term definitions throughout the UI.

## Components Overview

### 1. InfoIcon (Icon-based tooltip)
**Use when:** You need a hover tooltip next to a label or heading
**Pattern:** Question mark icon → hover → definition

```tsx
import { InfoIcon } from './components/InfoIcon';

<h4 className="text-xs font-medium text-text-secondary mb-3 inline-flex items-center gap-1.5">
  Distribution Range
  <InfoIcon term="quartiles" />
</h4>
```

### 2. GlossaryTooltip (Inline text tooltip)
**Use when:** You want to make text itself interactive
**Pattern:** Underlined text → hover → definition

```tsx
import { GlossaryTooltip } from './components/GlossaryTooltip';

<p className="text-sm text-text-secondary">
  The data shows a strong positive <GlossaryTooltip term="correlation">correlation</GlossaryTooltip> between height and weight.
</p>

{/* Or use custom display text */}
<GlossaryTooltip term="Standard Deviation">spread</GlossaryTooltip>
```

## Feature Comparison

| Feature | InfoIcon | GlossaryTooltip |
|---------|----------|-----------------|
| Visual treatment | Help circle icon | Dotted underline text |
| Hover delay | 300ms | 300ms |
| Shows term name | ✅ | ✅ |
| Shows definition | ✅ | ✅ |
| Shows example | ✅ | ✅ |
| Glassmorphic styling | ✅ | ✅ |
| Auto-position (top/bottom) | ❌ (always below) | ✅ |
| Keyboard accessible | ✅ | ✅ |

## Design Patterns

### Pattern 1: Label + InfoIcon
Use for section headings and data labels where the term itself is clear but users might want more context.

```tsx
// Statistics section
<div className="space-y-2">
  <div className="flex items-center gap-1.5">
    <span className="text-sm font-medium text-text-primary">Mean</span>
    <InfoIcon term="mean" />
  </div>
  <div className="text-lg font-mono">{stats.mean.toFixed(2)}</div>
</div>
```

### Pattern 2: Inline GlossaryTooltip
Use for explanatory text where the term appears naturally in prose.

```tsx
// Insight message
<p className="text-sm text-text-secondary">
  Your data shows <GlossaryTooltip term="right-skewed">right skew</GlossaryTooltip>,
  meaning most values are clustered on the left with a long tail to the right.
</p>
```

### Pattern 3: Custom display text
When the glossary term doesn't match the display text exactly:

```tsx
// "spread" is more casual than "Standard Deviation"
<p>
  This dataset has high <GlossaryTooltip term="Standard Deviation">spread</GlossaryTooltip> in values.
</p>
```

## Complete Example

```tsx
import { InfoIcon } from './components/InfoIcon';
import { GlossaryTooltip } from './components/GlossaryTooltip';

function ColumnStats({ stats }) {
  return (
    <div className="space-y-4">
      {/* Section header with InfoIcon */}
      <h3 className="text-sm font-semibold text-text-primary inline-flex items-center gap-1.5">
        Statistical Summary
        <InfoIcon term="statistics" />
      </h3>

      {/* Stats with inline tooltips */}
      <div className="space-y-2">
        <div>
          <span className="text-xs text-text-secondary">
            <GlossaryTooltip term="mean">Average</GlossaryTooltip>
          </span>
          <div className="text-lg font-mono">{stats.mean.toFixed(2)}</div>
        </div>

        <div>
          <span className="text-xs text-text-secondary inline-flex items-center gap-1.5">
            Median
            <InfoIcon term="median" />
          </span>
          <div className="text-lg font-mono">{stats.median.toFixed(2)}</div>
        </div>
      </div>

      {/* Insight with mixed tooltips */}
      <p className="text-sm text-text-secondary border-l-2 border-primary/30 pl-3 py-2 bg-primary-light/20 rounded-r">
        The <GlossaryTooltip term="IQR">interquartile range</GlossaryTooltip> suggests
        moderate variability. See <InfoIcon term="quartiles" className="ml-0.5" /> for details.
      </p>
    </div>
  );
}
```

## Styling Notes

Both components share:
- **Glassmorphic tooltip**: `bg-bg-surface/90` + `backdrop-blur-md`
- **Primary accent**: Term name in `text-primary`, left border `border-l-primary/30`
- **300ms hover delay**: Prevents accidental triggers while scrolling
- **Responsive width**: Max 320px (`max-w-xs`), fluid on mobile
- **Smooth animation**: `animate-fade-in-tooltip` (defined in tailwind.config.ts)

## Accessibility

Both components are keyboard-accessible:
- Tab to focus trigger element
- Tooltip appears on focus (not just hover)
- Escape key dismisses tooltip
- Proper ARIA attributes (`role="tooltip"`, `aria-describedby`)

## Adding New Terms

To add a new glossary term that will work with both components:

1. Edit `src/data/glossary.ts`
2. Add new term to the `glossary` array
3. Specify category: `'distribution' | 'statistics' | 'correlation' | 'quality'`
4. Provide `term`, `definition`, and optional `example`

```ts
{
  term: 'P-Value',
  definition: 'The probability that the observed pattern could have occurred by random chance.',
  category: 'correlation',
  example: 'p = 0.001 means there\'s only a 0.1% chance this correlation happened randomly.',
}
```

The components will automatically pick up new terms via `getTerm(term)` lookup.
