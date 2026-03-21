# Immersive Story Mode - Implementation Plan

**Created:** March 21, 2026
**Status:** Planning Phase
**Goal:** Transform raw analysis into auto-generated visual narratives that surface hidden insights

---

## Vision

**"From data to compelling story in one click"**

A business analyst uploads quarterly sales data. Within seconds, Glimpse analyzes it and generates a full-screen presentation that highlights:
- "Your weekend sales are 40% lower — here's the visual proof"
- "Customer age and revenue have a strong relationship you might have missed"
- "There's a seasonal pattern in Q4 you should prepare for"

The analyst clicks through beautiful slides, realizes insights they'd never found in Excel, and exports a standalone HTML presentation to share with their team. Total time: 2 minutes.

**This is the experience we're building.**

---

## User Flow

### Entry Point
```
AnalysisView (after dataset analyzed)
  ↓
[📖 Tell the Story] button in header (next to Export/Copy)
  ↓
Loading overlay (2-3 seconds)
"Detecting interesting patterns..."
  ↓
Story Mode (full-screen)
```

### Story Mode Experience
```
Full-Screen Presentation
├── Slide 1: Title Card (Dataset name + key stats)
├── Slide 2: "What's Interesting?" (Auto-detected insights preview)
├── Slide 3-N: One insight per slide (visual + narrative)
│   ├── Strong Correlations (scatter plots)
│   ├── Unusual Distributions (skewness, bimodal)
│   ├── Time Trends (line charts with annotations)
│   ├── Outliers (highlighted data points)
│   └── Categorical Patterns (bar charts, pie charts)
├── Slide N+1: Data Quality Check (if issues exist)
└── Slide N+2: Next Steps (recommendations)

Navigation Controls (bottom)
├── Progress dots (slide X of Y)
├── ← → Arrow keys / Click to advance
├── ESC to exit back to analysis
└── [Export Story] button (bottom-right)
```

### Export Flow
```
[Export Story] button clicked
  ↓
Modal: "Export Options"
├── Standalone HTML (recommended) ✅
├── PDF Report (Phase 2)
└── PowerPoint (Phase 3)
  ↓
Download `{dataset-name}_story.html`
  ↓
Success toast: "Story exported! Share anywhere."
```

---

## Technical Architecture

### New Components

**Story Mode Core**
```
src/components/story/
├── StoryMode.tsx              (~300 lines) - Full-screen container, navigation, keyboard shortcuts
├── StorySlide.tsx             (~150 lines) - Individual slide wrapper with animations
├── StoryProgress.tsx          (~80 lines)  - Progress dots indicator
└── StoryExportModal.tsx       (~120 lines) - Export options dialog
```

**Slide Templates**
```
src/components/story/slides/
├── TitleSlide.tsx             (~100 lines) - Dataset overview card
├── InsightsPreviewSlide.tsx   (~120 lines) - Grid of insight thumbnails
├── CorrelationSlide.tsx       (~200 lines) - Scatter plot + narrative text
├── DistributionSlide.tsx      (~180 lines) - Histogram + skewness annotation
├── TimeSeriesSlide.tsx        (~220 lines) - Line chart + trend insights
├── OutlierSlide.tsx           (~150 lines) - Box plot + highlighted outliers
├── CategorySlide.tsx          (~140 lines) - Bar/pie chart + dominance narrative
├── QualitySlide.tsx           (~130 lines) - Missing data visualization
└── NextStepsSlide.tsx         (~100 lines) - Recommendations card
```

**Insight Detection**
```
src/utils/story/
├── generateStory.ts           (~400 lines) - Main orchestrator
├── insightDetectors.ts        (~600 lines) - Detection algorithms for each insight type
├── insightScoring.ts          (~200 lines) - Interestingness scoring logic
├── narrativeGenerator.ts      (~300 lines) - Text generation for insights
└── slideOrderer.ts            (~150 lines) - Optimal narrative flow ordering
```

**Export System**
```
src/utils/story/
├── exportHTML.ts              (~250 lines) - Standalone HTML bundler
├── exportPDF.ts               (~200 lines) - PDF generation (Phase 2)
└── exportPPTX.ts              (~250 lines) - PowerPoint export (Phase 3)
```

### Data Flow

```
AnalysisResult (Zustand store)
  ↓
generateStory(analysisResult)
  ↓
Insight Detection
├── detectCorrelations()      → CorrelationInsight[]
├── detectDistributions()     → DistributionInsight[]
├── detectTimeTrends()        → TimeSeriesInsight[]
├── detectOutliers()          → OutlierInsight[]
└── detectCategoryPatterns()  → CategoryInsight[]
  ↓
Score & Rank Insights
├── Calculate interestingness score (0-100)
├── Sort by score descending
└── Take top 8 insights
  ↓
Generate Narrative Text
├── Pattern-based templates
├── Fill in specific values
└── Add contextual explanations
  ↓
Create Slide Objects
├── Map insight type → slide component
├── Add visual specifications
└── Generate slide metadata
  ↓
Order Slides
├── Title → Preview → Insights (high→low) → Quality → Next Steps
└── Balance: Mix insight types (don't show 5 correlations in a row)
  ↓
Render Story Mode
├── StoryMode.tsx receives Slide[]
├── Animates between slides
└── Handles navigation & export
```

---

## Insight Detection Algorithm

### Interestingness Scoring (0-100 scale)

Each detected pattern gets a score based on multiple factors:

#### 1. Correlation Insights
```typescript
function scoreCorrelation(r: number, pValue: number, n: number): number {
  let score = 0;

  // Strength component (0-40 points)
  const absR = Math.abs(r);
  if (absR > 0.9) score += 40;      // Very strong
  else if (absR > 0.7) score += 30; // Strong
  else if (absR > 0.5) score += 20; // Moderate
  else if (absR > 0.3) score += 10; // Weak

  // Significance component (0-30 points)
  if (pValue < 0.001) score += 30;  // Highly significant
  else if (pValue < 0.01) score += 20;
  else if (pValue < 0.05) score += 10;

  // Sample size component (0-20 points)
  if (n > 1000) score += 20;        // Large sample = more trustworthy
  else if (n > 100) score += 15;
  else if (n > 30) score += 10;

  // Unexpectedness bonus (0-10 points)
  // If variable names suggest no relationship, add surprise bonus
  // e.g., "age" and "purchase_frequency" = expected
  // e.g., "zip_code" and "revenue" = unexpected
  score += calculateUnexpectedness(col1, col2) * 10;

  return Math.min(score, 100);
}
```

#### 2. Distribution Insights
```typescript
function scoreDistribution(stats: ColumnStats): number {
  let score = 0;

  // Skewness component (0-40 points)
  const absSkew = Math.abs(stats.skewness || 0);
  if (absSkew > 2) score += 40;     // Very skewed
  else if (absSkew > 1) score += 25; // Moderately skewed
  else if (absSkew > 0.5) score += 10; // Slightly skewed

  // Bimodality component (0-30 points)
  if (stats.bimodalityCoefficient > 0.55) score += 30; // Clear bimodal
  else if (stats.bimodalityCoefficient > 0.5) score += 15;

  // Outlier component (0-20 points)
  const outlierRate = stats.outlierCount / stats.count;
  if (outlierRate > 0.1) score += 20;    // 10%+ outliers
  else if (outlierRate > 0.05) score += 10;

  // Non-normality bonus (0-10 points)
  if (stats.normalityTest?.pValue < 0.05) score += 10;

  return Math.min(score, 100);
}
```

#### 3. Time Series Insights
```typescript
function scoreTimeTrend(trend: TimeSeriesTrend): number {
  let score = 0;

  // Trend strength (0-35 points)
  const absSlope = Math.abs(trend.slope);
  const normalizedSlope = absSlope / trend.stdDev; // Slope relative to variance
  if (normalizedSlope > 2) score += 35;     // Strong trend
  else if (normalizedSlope > 1) score += 25;
  else if (normalizedSlope > 0.5) score += 15;

  // Seasonality strength (0-35 points)
  if (trend.seasonalityStrength > 0.8) score += 35;
  else if (trend.seasonalityStrength > 0.6) score += 25;
  else if (trend.seasonalityStrength > 0.4) score += 15;

  // R² goodness of fit (0-20 points)
  if (trend.rSquared > 0.8) score += 20;
  else if (trend.rSquared > 0.6) score += 15;
  else if (trend.rSquared > 0.4) score += 10;

  // Actionability bonus (0-10 points)
  // Recent data = more actionable
  const daysSinceLastPoint = (Date.now() - trend.lastDate) / (1000 * 60 * 60 * 24);
  if (daysSinceLastPoint < 7) score += 10;
  else if (daysSinceLastPoint < 30) score += 5;

  return Math.min(score, 100);
}
```

#### 4. Outlier Insights
```typescript
function scoreOutliers(stats: ColumnStats): number {
  let score = 0;

  // Outlier count component (0-40 points)
  const outlierRate = stats.outlierCount / stats.count;
  if (outlierRate > 0.1) score += 40;       // 10%+ outliers
  else if (outlierRate > 0.05) score += 30;
  else if (outlierRate > 0.02) score += 20;
  else if (outlierRate > 0.01) score += 10;

  // Extremeness component (0-35 points)
  // How far are outliers from the IQR?
  const maxZScore = Math.max(...stats.outliers.map(v => Math.abs(v - stats.mean) / stats.stdDev));
  if (maxZScore > 5) score += 35;       // Extreme outliers
  else if (maxZScore > 4) score += 25;
  else if (maxZScore > 3) score += 15;

  // Impact component (0-15 points)
  // Does removing outliers significantly change mean?
  const meanWithoutOutliers = calculateMeanWithoutOutliers(stats);
  const meanChange = Math.abs((stats.mean - meanWithoutOutliers) / stats.mean);
  if (meanChange > 0.2) score += 15;    // 20%+ change
  else if (meanChange > 0.1) score += 10;

  // Context bonus (0-10 points)
  // Outliers in financial data = more interesting than measurement noise
  if (isCriticalColumn(stats.name)) score += 10;

  return Math.min(score, 100);
}
```

#### 5. Category Insights
```typescript
function scoreCategoryPattern(stats: ColumnStats): number {
  let score = 0;

  // Dominance component (0-35 points)
  // One category overwhelms others
  const topFreq = stats.topValues[0].frequency;
  if (topFreq > 0.8) score += 35;       // 80%+ dominance
  else if (topFreq > 0.6) score += 25;
  else if (topFreq > 0.4) score += 15;

  // Diversity component (0-35 points)
  // High cardinality with even distribution
  const uniqueRatio = stats.uniqueCount / stats.count;
  const entropy = calculateEntropy(stats.topValues);
  if (uniqueRatio > 0.5 && entropy > 0.8) score += 35; // Very diverse
  else if (uniqueRatio > 0.3 && entropy > 0.6) score += 20;

  // Imbalance component (0-20 points)
  // One category way more than others (but not dominant)
  const imbalanceRatio = stats.topValues[0].frequency / stats.topValues[1]?.frequency;
  if (imbalanceRatio > 5) score += 20;  // Top 5x more than second
  else if (imbalanceRatio > 3) score += 10;

  // Business relevance bonus (0-10 points)
  if (isBusinessCritical(stats.name)) score += 10;

  return Math.min(score, 100);
}
```

### Ranking & Selection Logic

```typescript
function selectTopInsights(allInsights: Insight[], maxSlides: number = 8): Insight[] {
  // 1. Score all insights
  const scored = allInsights.map(insight => ({
    ...insight,
    score: scoreInsight(insight)
  }));

  // 2. Filter out low-quality insights
  const quality = scored.filter(i => i.score >= 30); // Minimum threshold

  // 3. Sort by score
  const sorted = quality.sort((a, b) => b.score - a.score);

  // 4. Ensure diversity (don't show 8 correlations in a row)
  const diversified = ensureTypeDiversity(sorted, {
    maxPerType: 3,           // Max 3 slides of same type
    preferredMix: true,      // Alternate types when possible
    mustIncludeTypes: [      // Always show if detected
      'correlation',
      'timeTrend'
    ]
  });

  // 5. Take top N
  return diversified.slice(0, maxSlides);
}
```

---

## Slide Types & Visual Specifications

### 1. Title Slide
```
┌─────────────────────────────────────────┐
│                                         │
│            [Dataset Icon]               │
│                                         │
│         Sales Data Analysis             │
│        ═══════════════════              │
│                                         │
│    3,847 rows  ×  12 columns            │
│    Uploaded March 21, 2026              │
│                                         │
│         8 insights discovered           │
│                                         │
└─────────────────────────────────────────┘
```
- Centered layout
- Large dataset name (text-4xl)
- Stats in muted color
- Insight count teaser
- Fade-in animation (500ms)

### 2. Insights Preview Slide
```
┌─────────────────────────────────────────┐
│  What's Interesting in Your Data?       │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │ 📊  │  │ 📈  │  │ ⚠️  │  │ 🎯  │   │
│  └─────┘  └─────┘  └─────┘  └─────┘   │
│  Strong    Time     Unusual  Category  │
│  Corr.     Trend    Outliers Pattern   │
│                                         │
│        Click or press → to explore     │
└─────────────────────────────────────────┘
```
- 2×4 grid of insight type thumbnails
- Icons + labels
- Hover effects
- Sets expectations

### 3. Correlation Slide (Primary Insight Type)
```
┌─────────────────────────────────────────┐
│  Strong Relationship Detected           │
│                                         │
│  "Customer Age" and "Total Spent"       │
│  are strongly correlated (r=0.82)       │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │        Scatter Plot              │  │
│  │  •    •    •  •                  │  │
│  │    •   •  •     •                │  │
│  │  •       • •       •             │  │
│  │    • •              •            │  │
│  │                                  │  │
│  │  [Trend line with confidence]    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  💡 Insight: Older customers spend 2.3x │
│     more on average. Consider targeted  │
│     marketing to 45+ demographic.       │
└─────────────────────────────────────────┘
```
- Large scatter plot (60% of slide height)
- Trend line with shaded confidence interval
- Annotation callouts for interesting points
- Narrative interpretation at bottom
- Scale-in animation for plot (600ms)

### 4. Distribution Slide
```
┌─────────────────────────────────────────┐
│  Unusual Distribution Found             │
│                                         │
│  "Order Value" is heavily right-skewed  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │     Histogram                    │  │
│  │  ███                             │  │
│  │  ███                             │  │
│  │  ███  ██                         │  │
│  │  ███  ██  █                      │  │
│  │  ███  ██  █  █                   │  │
│  └──────────────────────────────────┘  │
│     ↑ Most orders    ↑ Few high-value  │
│                                         │
│  💡 Insight: 80% of orders are under    │
│     $50, but 5% exceed $200. Consider   │
│     tiered shipping or loyalty perks.   │
└─────────────────────────────────────────┘
```
- Histogram with annotations
- Skewness indicator arrow
- Mean vs median comparison
- Business implication

### 5. Time Series Slide
```
┌─────────────────────────────────────────┐
│  Seasonal Pattern Detected              │
│                                         │
│  "Weekly Sales" shows strong pattern    │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Line Chart with Seasonality    │  │
│  │        ╱╲    ╱╲    ╱╲    ╱╲       │  │
│  │       ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲      │  │
│  │      ╱    ╲╱    ╲╱    ╲╱    ╲     │  │
│  │   ═══════════════════════════     │  │
│  │   [Shaded weekend dips]            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  💡 Insight: Weekend sales drop 40%.    │
│     Schedule promotions Thu-Fri to      │
│     maximize revenue.                   │
└─────────────────────────────────────────┘
```
- Line chart with trend line
- Shaded regions for seasonal periods
- Peak/trough annotations
- Actionable recommendation

### 6. Outlier Slide
```
┌─────────────────────────────────────────┐
│  Outliers Found                         │
│                                         │
│  "Processing Time" has unusual spikes   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      Box Plot                    │  │
│  │                                  │  │
│  │  ├────┬──┬──┐             •     │  │
│  │  │    │  │  │             •     │  │
│  │  ├────┴──┴──┘                   │  │
│  │   ↑         ↑             ↑     │  │
│  │  Min       Max         Outliers │  │
│  └──────────────────────────────────┘  │
│                                         │
│  💡 Insight: 3% of orders take 10x      │
│     longer to process. Investigate      │
│     these records for bottlenecks.      │
└─────────────────────────────────────────┘
```
- Box plot with highlighted outliers
- Count badge on outliers
- Investigation prompt

### 7. Category Slide
```
┌─────────────────────────────────────────┐
│  Dominant Category                      │
│                                         │
│  "Product Type" is heavily imbalanced   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │    Horizontal Bar Chart          │  │
│  │  Widget A  ████████████ 68%      │  │
│  │  Widget B  ███ 18%               │  │
│  │  Widget C  ██ 10%                │  │
│  │  Widget D  █ 4%                  │  │
│  └──────────────────────────────────┘  │
│                                         │
│  💡 Insight: Widget A dominates sales.  │
│     Diversification or optimization     │
│     opportunity?                        │
└─────────────────────────────────────────┘
```
- Horizontal bars (easier to read labels)
- Percentage labels
- Color gradient (most→least)
- Strategic question prompt

### 8. Quality Slide (Conditional)
```
┌─────────────────────────────────────────┐
│  Data Quality Check                     │
│                                         │
│  ⚠️ Some columns have missing data      │
│                                         │
│  Email Address     ████░░░  78% complete│
│  Phone Number      ███████░  92% complete│
│  Zip Code          ██████░░  85% complete│
│                                         │
│  💡 Recommendation: 3 columns need      │
│     attention before drawing            │
│     conclusions. Consider data          │
│     cleaning strategies.                │
└─────────────────────────────────────────┘
```
- Only shown if quality issues exist
- Completion bars
- Prioritized by severity
- Gentle reminder (not alarming)

### 9. Next Steps Slide (Always Last)
```
┌─────────────────────────────────────────┐
│  What's Next?                           │
│                                         │
│  Based on these insights, consider:     │
│                                         │
│  1. Investigate high-value customers    │
│     (Age 45+ segment)                   │
│                                         │
│  2. Address weekend sales decline       │
│     (Promotional strategy?)             │
│                                         │
│  3. Review outlier orders               │
│     (3% taking 10x longer)              │
│                                         │
│  [Export This Story] [Back to Analysis] │
└─────────────────────────────────────────┘
```
- Numbered action items
- Derived from insights shown
- Call-to-action buttons
- Satisfying conclusion

---

## Animation Specifications

### Slide Transitions
```typescript
const slideTransition = {
  enter: {
    opacity: 0,
    x: 100,          // Slide from right
    scale: 0.95
  },
  center: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    x: -100,         // Slide to left
    scale: 0.95
  },
  duration: 400,     // 400ms transition
  easing: 'easeOut'
};
```

### Chart Animations
- **Bars**: Grow from 0 to full height (staggered, 50ms delay per bar)
- **Lines**: Draw from left to right (800ms)
- **Scatter points**: Fade in with scale animation (random 0-200ms delay per point)
- **Trend lines**: Draw after scatter points finish (500ms)

### Text Reveals
- **Titles**: Fade in + slide up (300ms)
- **Body text**: Fade in with 100ms delay
- **Insights (💡)**: Scale bounce animation (400ms) after 500ms delay

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Story Mode UI and navigation working

**Tasks:**
- [ ] Create StoryMode.tsx component (full-screen container)
- [ ] Create StorySlide.tsx component (slide wrapper with animations)
- [ ] Implement keyboard navigation (←/→/ESC)
- [ ] Create StoryProgress.tsx component (dots indicator)
- [ ] Add "Tell the Story" button to AnalysisView header
- [ ] Mock: Generate 3 hardcoded slides from real analysis data
- [ ] Test: Smooth transitions, responsive on mobile

**Success Criteria:**
- Full-screen story mode launches from button
- Can navigate between mock slides with arrows
- ESC returns to analysis view
- Animations feel smooth (60fps)

### Phase 2: Insight Detection (Week 2)
**Goal:** Auto-detect interesting patterns from AnalysisResult

**Tasks:**
- [ ] Create insightDetectors.ts (5 detector functions)
- [ ] Implement correlation detection (score > 0.5, p < 0.05)
- [ ] Implement distribution detection (skewness, bimodality)
- [ ] Implement time trend detection (FFT seasonality)
- [ ] Implement outlier detection (IQR method, >5% threshold)
- [ ] Implement category pattern detection (dominance, diversity)
- [ ] Create insightScoring.ts (interestingness algorithm)
- [ ] Create slideOrderer.ts (diversify types, max 3 per type)
- [ ] Test: Run on 4 sample datasets, verify insights make sense

**Success Criteria:**
- Detects 5-10 insights per typical dataset
- Top-ranked insights pass "would I show this to my boss?" test
- No false positives (weak patterns ranked high)
- Type diversity (not 8 correlations in a row)

### Phase 3: Visual Slides (Week 3)
**Goal:** Create beautiful slide templates for each insight type

**Tasks:**
- [ ] Create TitleSlide.tsx (dataset overview)
- [ ] Create InsightsPreviewSlide.tsx (grid of thumbnails)
- [ ] Create CorrelationSlide.tsx (scatter plot + narrative)
- [ ] Create DistributionSlide.tsx (histogram + skewness)
- [ ] Create TimeSeriesSlide.tsx (line chart + seasonality)
- [ ] Create OutlierSlide.tsx (box plot + highlighted points)
- [ ] Create CategorySlide.tsx (bar chart + dominance)
- [ ] Create QualitySlide.tsx (conditional, missing data bars)
- [ ] Create NextStepsSlide.tsx (action items)
- [ ] Implement chart animations (grow, draw, fade)
- [ ] Test: Visual consistency, readability, brand alignment

**Success Criteria:**
- All 9 slide types render correctly
- Charts are publication-quality (axes, labels, legends)
- Animations feel polished (not distracting)
- Works in light and dark mode
- Mobile-responsive (readable on phone)

### Phase 4: Narrative Generation (Week 4)
**Goal:** Auto-generate compelling text descriptions

**Tasks:**
- [ ] Create narrativeGenerator.ts (text templates)
- [ ] Write correlation narratives ("X and Y are strongly related")
- [ ] Write distribution narratives ("X is right-skewed, most values...")
- [ ] Write time trend narratives ("X shows weekly pattern...")
- [ ] Write outlier narratives ("3% of values are extreme...")
- [ ] Write category narratives ("X dominates at 68%...")
- [ ] Implement insight implications (💡 business recommendations)
- [ ] Add contextual tips (action items based on patterns)
- [ ] Test: Read-aloud test (does it sound natural?)

**Success Criteria:**
- Narratives are conversational (not robotic)
- Business implications are specific (not generic)
- Non-technical users understand insights
- No jargon (or jargon is explained)

### Phase 5: Export System (Week 5)
**Goal:** Export story as standalone HTML file

**Tasks:**
- [ ] Create exportHTML.ts (bundle slides + styles + data)
- [ ] Inline all CSS (Tailwind classes → inline styles)
- [ ] Embed slide data as JSON (no external dependencies)
- [ ] Add navigation JavaScript (arrow keys, click)
- [ ] Minify output HTML (gzip-friendly)
- [ ] Test: Exported file works offline, all browsers
- [ ] Add StoryExportModal.tsx (export options UI)
- [ ] Implement download trigger (Blob + download link)

**Success Criteria:**
- Exported HTML is self-contained (no external requests)
- File size <500KB for typical story (8 slides)
- Works offline (no CDN dependencies)
- Opens in all modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile-friendly (responsive layout preserved)

### Phase 6: Polish & Testing (Week 6)
**Goal:** Production-ready quality

**Tasks:**
- [ ] Add loading states ("Detecting patterns...")
- [ ] Error handling (no insights found → helpful message)
- [ ] Keyboard shortcuts help (? key shows shortcuts)
- [ ] Touch gestures (swipe left/right on mobile)
- [ ] Auto-play mode (optional, 5s per slide)
- [ ] Accessibility audit (ARIA labels, keyboard-only navigation)
- [ ] Performance optimization (lazy-load heavy charts)
- [ ] Browser testing (Chrome, Safari, Firefox, Edge, mobile)
- [ ] User testing (5 target users, observe confusion points)
- [ ] Documentation (STORY_MODE.md technical reference)

**Success Criteria:**
- No crashes or visual glitches
- Feels fast (<3s to generate story)
- Intuitive (no user gets stuck)
- WCAG 2.1 AA compliant (accessibility)
- Works on iPhone, Android, tablet

---

## Success Metrics

### Adoption Metrics
- **30%+ Story Mode usage** - % of analyses that enter Story Mode
- **80%+ completion rate** - % who view all slides (not just first)
- **50%+ export rate** - % who export after viewing story

### Quality Metrics
- **User satisfaction** - NPS survey after export ("How likely to recommend?")
- **Insight relevance** - Manual review of top-ranked insights (90%+ pass "interesting" test)
- **False positive rate** - % of insights that are noise (<10% target)

### Engagement Metrics
- **Time in Story Mode** - Avg 2-3 min (indicates thorough review)
- **Slides viewed** - Avg 6-8 slides (full story consumption)
- **Return usage** - % who use Story Mode on 2nd+ dataset (40%+ target)

---

## Decisions Locked In ✅

### UX Decisions
1. **Navigation** → **Manual (Keyboard/Click)**
   - User controls pacing with arrow keys, space, or click
   - No auto-play in v1 (users want control)
   - Future: Optional auto-play toggle if requested

2. **Slide limit** → **Max 8 insights** (Plus title, preview, quality, next steps = 12 total)
   - Keeps stories concise and focused
   - Prevents overwhelming users
   - Can revisit if users consistently want more

3. **Edit mode** → **Not in v1**
   - One-click export of auto-generated story
   - Simpler, faster to ship
   - Add editing in Phase 7+ if users request it

### Technical Decisions
4. **Chart library** → **Keep SVG**
   - Reuse existing histogram, box plot, scatter plot components
   - Easy to style, accessible, performant for current use cases
   - No need to rebuild with canvas

5. **Export format priority** → **HTML-only for v1**
   - Standalone HTML (privacy-preserved, interactive, works everywhere)
   - PDF and PowerPoint deferred to Phase 7+ based on demand

6. **Pyodide packages** → **Use existing (pandas, numpy, scipy)**
   - No additional packages needed for v1 insight detection
   - Correlation, distribution, time series all work with current stack
   - Future: scikit-learn for clustering/anomaly (Phase 7+)

---

## Risk Mitigation

### Risk 1: Insight Detection Produces Weak Results
**Symptom:** Top-ranked insights are obvious or uninteresting ("Age is numeric")

**Mitigation:**
- Manual review of insights on 10 diverse datasets before launch
- Adjust scoring thresholds (require minimum score of 40/100)
- Add "unexpectedness" component to scoring (penalize obvious patterns)
- Fallback: If <3 insights found, show helpful message instead of weak slides

### Risk 2: Story Mode Feels Slow
**Symptom:** >5 seconds to generate story, users abandon

**Mitigation:**
- Show loading overlay with progress ("Analyzing correlations... 1/5")
- Pre-compute insights during initial analysis (cache in AnalysisResult)
- Lazy-load slide components (don't render off-screen slides)
- Performance budget: <3s total generation time

### Risk 3: Exported HTML is Too Large
**Symptom:** 5MB files that don't email/upload easily

**Mitigation:**
- Inline only critical CSS (not full Tailwind)
- Compress embedded data (gzip-friendly JSON)
- Limit chart resolution (SVG path simplification)
- Target: <500KB per story (works for email, Slack)

### Risk 4: Users Don't Understand Insights
**Symptom:** Confusion about what patterns mean or why they matter

**Mitigation:**
- Add glossary tooltips (hover "correlation" → see definition)
- Use plain language (avoid "r=0.82", say "strong relationship")
- Include business implications (not just statistical facts)
- User testing: Watch 5 non-technical users, iterate on clarity

---

## Future Enhancements (Post-v1)

### Phase 7: Advanced Insights (Q3 2026)
- Clustering detection (k-means, DBSCAN)
- Anomaly scoring (isolation forests)
- Causal inference suggestions (correlation → causation candidates)
- Segmentation analysis (auto-detect customer segments)

### Phase 8: Customization (Q4 2026)
- Edit mode (reorder, remove, add custom slides)
- Branding options (logo, colors, fonts)
- Template library (industry-specific narratives)
- Voice narration (text-to-speech for slides)

### Phase 9: Collaboration (2027)
- Shareable URLs (compressed results in hash)
- Commenting on slides (feedback loop)
- Presentation mode (hide controls, fullscreen)
- Video export (MP4 with narration)

---

## Conclusion

Story Mode transforms Glimpse from an analysis tool into a **complete workflow** — from raw data to compelling presentation in minutes. By auto-detecting insights and generating beautiful narratives, we eliminate the friction between "I found something interesting" and "I convinced my team to act on it."

**This is our Tableau killer feature.** No other tool combines privacy, zero-friction analysis, and auto-generated storytelling. We're not just making analysis easier — we're making insights impossible to ignore.

**Next step:** Build Phase 1 (foundation) and validate the UX with real users before investing in complex insight detection.
