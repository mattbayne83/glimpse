# Story Mode - Phase 3: Visual Slides

**Goal:** Create beautiful slide templates for each insight type
**Timeline:** Week 3 (March 29 - April 4, 2026)
**Status:** Starting

---

## Tasks

### Setup
- [x] Phase 2 complete (insight detection working)
- [ ] Review existing chart components for reuse
- [ ] Create slide component utilities (shared layouts, animations)

### Slide Components (Priority Order)

#### 1. CorrelationSlide (~2 hours)
- [ ] Build scatter plot visualization
  - Reuse existing plot components if available
  - Add trend line overlay
  - Show r-value and p-value
  - Color-code by correlation strength
- [ ] Add narrative text generation
  - "X and Y show a [strong/moderate] [positive/negative] relationship"
  - Statistical details (r, p-value, sample size)
- [ ] Add insight section
  - Business implication based on column names
  - Actionable recommendation
- [ ] Test on E-Commerce dataset (age vs revenue)

#### 2. DistributionSlide (~1.5 hours)
- [ ] Reuse existing Histogram component
  - Enhanced with range indicators
  - Mean vs median comparison
  - Quartile overlays
- [ ] Add narrative text
  - "Wide range detected: [min] to [max]"
  - Variation description
- [ ] Add insight section
  - Implication of wide/narrow spread
- [ ] Test on SaaS dataset (wide spending ranges)

#### 3. OutlierSlide (~1.5 hours)
- [ ] Reuse existing BoxPlotVisualization
  - Highlight outlier points
  - Show outlier count badge
  - Color-code severity
- [ ] Add narrative text
  - "[X]% of values are extreme outliers"
  - Impact on mean calculation
- [ ] Add insight section
  - Investigation recommendations
  - Data quality implications
- [ ] Test on Healthcare dataset (vitals outliers)

#### 4. CategorySlide (~1 hour)
- [ ] Build horizontal bar chart
  - Top 5 categories
  - Percentage labels
  - Gradient colors (most → least)
- [ ] Add narrative text
  - Dominance description
  - Diversity metrics
- [ ] Add insight section
  - Strategic implications
- [ ] Test on E-Commerce dataset (product types)

#### 5. TimeSeriesSlide (~2 hours)
- [ ] Reuse existing TimeSeriesPlot
  - Add trend line
  - Highlight seasonal periods
  - Peak/trough annotations
- [ ] Add narrative text
  - Seasonality description
  - Period label (weekly, monthly, etc.)
  - Confidence level
- [ ] Add insight section
  - Planning recommendations
  - Timing strategies
- [ ] Test on Retail Sales dataset (weekly patterns)

#### 6. QualitySlide (~1 hour)
- [ ] Build missing data visualization
  - Horizontal bars showing completeness
  - Color-coded by severity
  - Sort by missing %
- [ ] Add duplicate row warning (if applicable)
- [ ] Add high cardinality warning (if applicable)
- [ ] Gentle tone (not alarming)
- [ ] Test on datasets with quality issues

#### 7. NextStepsSlide (~30 min)
- [ ] Simple numbered list layout
- [ ] Action-oriented language
- [ ] Context-specific recommendations
- [ ] CTA buttons (optional)
- [ ] Test with various insight combinations

---

## Shared Utilities

### SlideLayout Component
```tsx
interface SlideLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  insight?: string;
}

// Provides consistent layout across all slides:
// - Centered title + subtitle
// - Content area (chart/visualization)
// - Insight section at bottom
```

### NarrativeText Component
```tsx
interface NarrativeTextProps {
  text: string;
  highlight?: string; // Bold/color specific terms
}

// Formats narrative text with:
// - Readable font size
// - Proper line spacing
// - Optional highlighting
```

### InsightBox Component
```tsx
interface InsightBoxProps {
  insight: string;
}

// Styled box for 💡 insights:
// - Lightbulb icon
// - Colored background
// - Action-oriented text
```

---

## Chart Specifications

### Scatter Plot (Correlation)
- **Size**: 600×400px (aspect 3:2)
- **Points**: Semi-transparent dots
- **Trend line**: Dashed, contrasting color
- **Axes**: Labeled with column names
- **Grid**: Subtle background grid

### Histogram (Distribution)
- **Reuse**: Existing Histogram component
- **Enhancements**: Add mean/median lines
- **Colors**: Gradient bars (primary color)
- **Annotations**: Min, max, quartiles

### Box Plot (Outliers)
- **Reuse**: Existing BoxPlotVisualization
- **Enhancements**: Highlight outlier points
- **Colors**: Red for outliers, primary for box
- **Counts**: Badge showing outlier count

### Bar Chart (Categories)
- **Orientation**: Horizontal (easier to read labels)
- **Bars**: 5-10 categories max
- **Labels**: Category name + percentage
- **Colors**: Gradient from primary to muted

### Line Chart (Time Series)
- **Reuse**: Existing TimeSeriesPlot
- **Enhancements**: Shaded seasonality regions
- **Trend**: Dashed overlay line
- **Annotations**: Peak/trough labels

---

## Animation Specifications

### Slide Enter
- Fade in: 0 → 1 opacity (400ms)
- Slide up: 20px → 0 (400ms)
- Ease: ease-out

### Chart Animations
- **Bars**: Grow from 0 to full height (600ms, stagger 50ms)
- **Lines**: Draw from left to right (800ms)
- **Points**: Fade in + scale (random 0-200ms delay)
- **Trend lines**: Draw after points (500ms delay)

### Text Reveals
- **Title**: Fade + slide up (300ms)
- **Body**: Fade in (400ms, 100ms delay)
- **Insight**: Scale bounce (400ms, 500ms delay)

---

## Testing Checklist

### Visual Quality
- [ ] All charts render correctly
- [ ] Axes have proper labels
- [ ] Colors are accessible (WCAG AA)
- [ ] Text is readable (16px min)
- [ ] Animations are smooth (60fps)

### Dark Mode
- [ ] All slides work in dark mode
- [ ] Charts use theme-aware colors
- [ ] Text contrast is sufficient
- [ ] No white backgrounds on black

### Mobile
- [ ] Charts scale to mobile width
- [ ] Text remains readable
- [ ] Touch targets are 44px+
- [ ] No horizontal scroll

### Content Quality
- [ ] Narratives are clear and concise
- [ ] Insights are actionable
- [ ] Technical terms are explained
- [ ] No jargon overload

---

## Implementation Order

**Day 1: Correlation + Distribution** (3.5 hours)
- Most common insight types
- Reuse existing chart components

**Day 2: Outlier + Category** (2.5 hours)
- Medium complexity
- Reuse existing BoxPlot

**Day 3: TimeSeries + Quality** (3 hours)
- Most complex (time series)
- Conditional quality slide

**Day 4: NextSteps + Polish** (2 hours)
- Simple slide
- Test all slides together
- Refine animations
- Fix any visual bugs

**Day 5: Integration Testing** (4 hours)
- Test on all 4 sample datasets
- Verify narrative quality
- Check mobile responsiveness
- Dark mode verification
- Performance optimization

**Total: ~15 hours**

---

## Success Criteria

By end of Phase 3:
- ✅ All 7 slide types render beautifully
- ✅ Charts are publication-quality
- ✅ Narratives are clear and helpful
- ✅ Insights are actionable
- ✅ Works in light + dark mode
- ✅ Mobile-responsive
- ✅ Animations feel polished
- ✅ Zero visual bugs or glitches

**Demo-ready:** Show a business analyst a full story (title → insights → next steps) and they should say "Wow, this looks professional!"

---

## Notes

- **Reuse existing components** - Don't rebuild charts from scratch
- **Keep it simple** - Don't over-animate or over-design
- **Focus on clarity** - Insights should be obvious at a glance
- **Test iteratively** - Build one slide, test it, move to next
