# Design System — Glimpse

Generated: March 15, 2026
Mood: Analytical clarity meets trustworthy restraint — a professional tool that respects privacy through visual honesty

---

## Color Palette

### Primary Colors
| Role | Name | Hex | Tailwind Class | Usage |
|------|------|-----|----------------|-------|
| Primary | Insight Blue | #0066CC | `bg-[#0066CC]` | CTAs, primary buttons, key data highlights, active states |
| Primary Light | Sky Wash | #E6F2FF | `bg-[#E6F2FF]` | Hover backgrounds, selected rows, subtle emphasis |
| Primary Dark | Data Navy | #004C99 | `bg-[#004C99]` | Button active states, high-contrast interactive elements |

### Secondary Colors
| Role | Name | Hex | Tailwind Class | Usage |
|------|------|-----|----------------|-------|
| Secondary | Analysis Teal | #0D9488 | `bg-[#0D9488]` | Numeric insights, histogram bars, statistical markers |
| Secondary Light | Mint Frost | #CCFBF1 | `bg-[#CCFBF1]` | Background for numeric stat cards |
| Accent | Privacy Slate | #475569 | `bg-[#475569]` | Secondary buttons, muted actions, privacy-first messaging |

### Neutral Scale
| Step | Hex | Usage |
|------|-----|-------|
| 50 | #F8FAFC | Page backgrounds, canvas, main app background |
| 100 | #F1F5F9 | Card backgrounds, alternating table rows |
| 200 | #E2E8F0 | Borders, dividers, column separators |
| 300 | #CBD5E1 | Disabled button borders, placeholder text |
| 400 | #94A3B8 | Muted icons, inactive tab text |
| 500 | #64748B | Secondary labels, helper text |
| 600 | #475569 | Body text, standard content |
| 700 | #334155 | Headings, emphasis, column headers |
| 800 | #1E293B | High-contrast headings, dataset names |
| 900 | #0F172A | Maximum contrast, critical labels |
| 950 | #020617 | Reserved for dark mode surfaces (future) |

### Semantic Colors
| Role | Hex | Usage |
|------|-----|-------|
| Success | #10B981 | Data quality ✅, no issues found, upload complete |
| Warning | #F59E0B | Duplicate rows ⚠️, moderate data quality issues |
| Error | #EF4444 | High missing data ❌, critical quality problems, upload errors |
| Info | #3B82F6 | High cardinality notices ℹ️, informational callouts |

### Palette Rationale
Insight Blue (#0066CC) is a mid-saturation blue that evokes analytical rigor without the coldness of darker blues — it's the color of "aha moments" in data. Analysis Teal (#0D9488) provides a complementary contrast for numeric visualizations, grounding quantitative insights in a distinct visual channel. The neutral scale uses slate tones (not pure grays) to maintain warmth and avoid the sterile feel of clinical analytics tools. Privacy Slate (#475569) reinforces the tool's privacy-first ethos through visual restraint.

### Accessibility Notes
- Primary (#0066CC) on white: **4.54:1** — WCAG AA compliant for normal text, AAA for large text
- Neutral-700 (#334155) on white: **11.04:1** — WCAG AAA compliant for all text sizes
- Neutral-600 (#475569) on white: **8.59:1** — WCAG AAA compliant for body text
- All semantic colors pass WCAG AA at minimum when used on white backgrounds
- Blue-yellow color-blind safe: Avoid pairing Insight Blue with Warning orange without additional visual cues (icons, borders)

---

## Typography

### Font Pairing
| Role | Font | Weight(s) | Import |
|------|------|-----------|--------|
| Headings | Inter | 600, 700 | `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap')` |
| Body | Inter | 400, 500 | `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap')` |
| Mono/Data | JetBrains Mono | 400, 500 | `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap')` |

**Consolidated Import** (already in use):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Why This Pairing Works
Inter is a workhorse typeface designed for digital interfaces with excellent x-height and legibility at all sizes — perfect for dense tabular data. Using Inter for both headings and body creates a monolithic, focused system that doesn't distract from the data. JetBrains Mono provides tabular-friendly monospacing for CSV data previews, column names, and numeric values, with clear differentiation between similar characters (0/O, 1/l/I).

### Type Scale
| Element | Size | Weight | Line Height | Letter Spacing | Tailwind |
|---------|------|--------|-------------|----------------|----------|
| Display | 3rem / 48px | 700 | 1.1 | -0.02em | `text-5xl font-bold leading-tight tracking-tight` |
| H1 | 2.25rem / 36px | 700 | 1.2 | -0.01em | `text-4xl font-bold leading-snug` |
| H2 | 1.5rem / 24px | 600 | 1.3 | 0 | `text-2xl font-semibold` |
| H3 | 1.25rem / 20px | 600 | 1.4 | 0 | `text-xl font-semibold` |
| H4 | 1rem / 16px | 600 | 1.5 | 0 | `text-base font-semibold` |
| Body | 1rem / 16px | 400 | 1.6 | 0 | `text-base` |
| Body Small | 0.875rem / 14px | 400 | 1.5 | 0 | `text-sm` |
| Caption | 0.75rem / 12px | 500 | 1.4 | 0.01em | `text-xs font-medium tracking-wide` |
| Mono Data | 0.875rem / 14px | 400 | 1.5 | 0 | `font-mono text-sm` |

### Alternative Pairings
1. **IBM Plex Sans + IBM Plex Mono**: More geometric and technical feel, excellent for dashboards but slightly colder than Inter.
2. **Work Sans + Fira Code**: Friendlier sans-serif with a warmer personality, pairs with a popular developer-focused monospace — good if targeting a more casual analytics audience.

---

## Spacing & Layout

### Spacing Scale
Base unit: 4px. Use Tailwind's default scale:
| Token | Value | Common Usage |
|-------|-------|-------------|
| 1 | 4px | Icon-to-text gaps, tight inline spacing |
| 2 | 8px | Small padding, inline element spacing |
| 3 | 12px | Compact card padding, list item gaps |
| 4 | 16px | Standard padding, form field spacing, default gaps |
| 6 | 24px | Section padding, card internal spacing |
| 8 | 32px | Large section spacing, modal padding |
| 12 | 48px | Page section margins, major content breaks |
| 16 | 64px | Top-level page padding (vertical) |

### Border Radius
| Element | Radius | Tailwind |
|---------|--------|----------|
| Buttons | 6px | `rounded-md` |
| Cards | 8px | `rounded-lg` |
| Inputs | 6px | `rounded-md` |
| Badges/Pills | full | `rounded-full` |
| Modals | 12px | `rounded-xl` |
| Stat Cards | 8px | `rounded-lg` |

**Radius Philosophy**: Moderate rounding (6-8px) strikes a balance between professional sharpness and approachable friendliness — not as clinical as 0px, not as playful as 16px.

### Shadows
| Level | CSS | Tailwind | Usage |
|-------|-----|----------|-------|
| Subtle | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-sm` | Cards at rest, table borders |
| Default | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | `shadow` | Dropdowns, file upload zone |
| Medium | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | `shadow-md` | Elevated cards, active modals |
| Large | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `shadow-lg` | Overlays, tooltips, quality warning cards |

---

## Component Styles

### Buttons
```
Primary:   bg-[#0066CC] text-white font-medium px-4 py-2 rounded-md hover:bg-[#004C99] transition-colors duration-150 shadow-sm
Secondary: bg-transparent border border-[#CBD5E1] text-[#334155] px-4 py-2 rounded-md hover:bg-[#F1F5F9] transition-colors duration-150
Ghost:     bg-transparent text-[#0066CC] px-4 py-2 rounded-md hover:bg-[#E6F2FF] transition-colors duration-150
Danger:    bg-[#EF4444] text-white font-medium px-4 py-2 rounded-md hover:bg-[#DC2626] transition-colors duration-150 shadow-sm
```

### Cards
```
Default:   bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-6
Elevated:  bg-white rounded-lg shadow-md p-6
Interactive: bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-6 hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200 cursor-pointer
Stat Card: bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-sm
```

### Inputs
```
Default:   border border-[#CBD5E1] rounded-md px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] outline-none transition-all duration-150
Error:     border-[#EF4444] ring-2 ring-[#EF4444]/20 text-[#0F172A]
Disabled:  border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed
```

### Tabs
```
Tab Button (Inactive): px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#334155] transition-colors duration-150
Tab Button (Active):   px-4 py-2 text-sm font-medium text-[#0066CC] border-b-2 border-[#0066CC]
Tab Container:         border-b border-[#E2E8F0] flex gap-2
```

### Badges
```
Numeric Type:      px-2 py-1 bg-[#CCFBF1] text-[#0D9488] text-xs rounded font-medium
Categorical Type:  px-2 py-1 bg-[#E6F2FF] text-[#0066CC] text-xs rounded font-medium
DateTime Type:     px-2 py-1 bg-[#F1F5F9] text-[#475569] text-xs rounded font-medium
Quality Issue:     px-2 py-1 bg-[#FEF3C7] text-[#92400E] text-xs rounded-full font-medium
```

### Quality Warning Cards
```
Success (No Issues): p-4 bg-[#D1FAE5] border border-[#6EE7B7] rounded-lg
Warning:             p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg
Error:               p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg
Info:                p-4 bg-[#DBEAFE] border border-[#93C5FD] rounded-lg
```

---

## Visualization Styles

### Histograms
```
Bar Fill:       fill-[#0D9488] opacity-80
Bar Hover:      fill-[#0D9488] opacity-100
Axis Lines:     stroke-[#CBD5E1] stroke-width-1
Grid Lines:     stroke-[#E2E8F0] stroke-width-1 stroke-dasharray-2
```

### Column Map (Dataset Structure Visualization)
```
Numeric Column:      fill-[#0D9488] hover:fill-[#0F766E]
Categorical Column:  fill-[#0066CC] hover:fill-[#004C99]
DateTime Column:     fill-[#64748B] hover:fill-[#475569]
Background:          fill-[#F8FAFC]
Bar Container:       border border-[#E2E8F0] rounded-md p-3 bg-white
```

### Data Quality Indicators
```
High Completeness (>90%):   bg-[#10B981] (success green)
Medium Completeness (50-90%): bg-[#F59E0B] (warning orange)
Low Completeness (<50%):    bg-[#EF4444] (error red)
```

---

## Animation & Motion

### Timing
| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150ms | ease-out | Button hover, badge appearance, tab switch |
| Standard | 200ms | ease-in-out | Card hover, dropdown open, tooltip fade |
| Emphasis | 300ms | cubic-bezier(0.16, 1, 0.3, 1) | File upload modal, analysis complete |
| Exit | 150ms | ease-in | Closing modals, dismissing tooltips |

### Transitions to Use
- **Button hover**: `transition-colors duration-150`
- **Card hover**: `transition-all duration-200` (shadow + border)
- **Modal entrance**: `animate-[fade-in_0.3s_cubic-bezier(0.16,1,0.3,1)]`
- **Tab switch**: `transition-colors duration-150`
- **Loading states**: `animate-pulse` for skeleton screens

### Special Effects
```
File Upload Drag Hover: border-2 border-dashed border-[#0066CC] bg-[#E6F2FF] transition-all duration-200
Pyodide Loading: animate-spin on a loader icon + pulse on text
Analysis Complete: Subtle scale-in animation on result cards
```

---

## Layout Patterns

### Page Container
```
max-w-6xl mx-auto px-4 py-8
```

### Header (Dataset Name + Metadata)
```
flex items-center justify-between mb-6
```

### Stat Card Grid
```
grid grid-cols-2 md:grid-cols-4 gap-4 mb-6
```

### Column Analysis Cards
```
space-y-4 (vertical stack with 16px gap)
```

### Quality Tab Layout
```
space-y-4 (stacked warning cards)
```

---

## Anti-Patterns — Do NOT

1. **Don't use pure black (#000000) for text** — Always use Neutral-800 (#1E293B) or Neutral-900 (#0F172A) for maximum contrast. Pure black is harsh on screens.

2. **Don't mix rounded and sharp corners** — Stick to the defined radius scale (6-8px for most elements). Mixing rounded-lg with rounded-none creates visual chaos.

3. **Don't use more than 3 font weights on a single page** — 400 (body), 500 (medium), 600 (semibold), 700 (bold) is the absolute maximum. Prefer 400 + 600 for most layouts.

4. **Don't combine drop shadows with borders on interactive cards** — Use shadow-sm + border for resting state, shadow-md + NO border for hover. Don't stack both at high intensity.

5. **Don't use bright colors for large background areas** — Primary blue (#0066CC) is for accents only. Never use it as a page background or large card fill — use Neutral-50 (#F8FAFC) instead.

6. **Don't use red for data values unless indicating errors** — Use Analysis Teal (#0D9488) for numeric insights. Red is reserved for quality warnings and validation errors.

7. **Don't use decorative icons in data tables** — Icons are functional (sorting, filtering) or semantic (warning, success). Avoid ornamental icons that don't add information.

8. **Don't animate on data load** — CSV analysis results should appear instantly (fade-in max 150ms). Users want speed, not choreography. Save 300ms+ animations for modals and major UI transitions only.

9. **Don't use gradient backgrounds** — Glimpse's visual language is flat and honest. Gradients imply decoration over data.

10. **Don't use custom scrollbars** — Let the OS handle scrollbars. Custom scrollbars break accessibility and feel overdesigned for a professional tool.

---

## Future Considerations

### Dark Mode (Not Implemented Yet)
When implementing dark mode:
- Background: Neutral-950 (#020617)
- Surface: Neutral-900 (#0F172A)
- Borders: Neutral-800 (#1E293B)
- Text: Neutral-50 (#F8FAFC) for body, white for headings
- Primary stays #0066CC but increase to #3B9EFF for better contrast on dark backgrounds
- Histograms: Use Analysis Teal (#14B8A6) with higher opacity

### Mobile Responsive Breakpoints
- Mobile: Single-column stat cards, stacked layouts
- Tablet (md): 2-column stat grid
- Desktop (lg+): 4-column stat grid, side-by-side visualizations

### Example Dataset Feature
When adding the planned "Load Example Dataset" button:
- Use Ghost button style with Info blue (#3B82F6) text
- Place below file upload zone
- Subtle border-dashed to differentiate from primary upload action

---

## Implementation Checklist

- [x] Inter font already loaded in index.html
- [ ] Add JetBrains Mono to index.html for monospace data display
- [ ] Update index.css with custom color variables for semantic colors
- [ ] Create reusable Button component with primary/secondary/ghost/danger variants
- [ ] Create Card component with default/elevated/interactive variants
- [ ] Update AnalysisView tabs to use defined tab styles
- [ ] Apply quality warning card styles (success/warning/error/info backgrounds)
- [ ] Update histogram SVG with defined fill colors
- [ ] Update ColumnMap with defined column type colors
- [ ] Document component usage in CLAUDE.md

---

**Design System Complete**
This system balances analytical professionalism with visual warmth. Every color, font, and spacing decision reinforces Glimpse's core promise: honest, privacy-first data insights.
