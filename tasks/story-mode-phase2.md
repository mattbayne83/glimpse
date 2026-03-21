# Story Mode - Phase 2: Insight Detection

**Goal:** Auto-detect interesting patterns and rank by interestingness
**Timeline:** Week 2 (March 22-28, 2026)
**Status:** Starting

---

## Tasks

### Setup
- [x] Phase 1 complete and validated
- [ ] Create insight detection utilities directory
- [ ] Define Insight type interfaces

### Core Detection Algorithms
- [ ] **CorrelationDetector** - Find strong numeric relationships
  - Threshold: |r| > 0.5 AND p < 0.05
  - Extract: column1, column2, r, pValue, direction
  - Score factors: strength (40pts), significance (30pts), sample size (20pts), unexpectedness (10pts)

- [ ] **DistributionDetector** - Find unusual distributions
  - Detect: Extreme ranges, potential bimodality, heavy tails
  - Uses: min, max, mean, std, q25, q50, q75 from existing stats
  - Score factors: range variation (40pts), quartile spread (30pts), outlier count (20pts), business relevance (10pts)

- [ ] **TimeSeriesDetector** - Find temporal patterns (if datetime columns exist)
  - Uses: existing timeSeriesAnalysis from AnalysisResult
  - Detect: seasonality, trends, recent changes
  - Score factors: seasonality strength (35pts), trend strength (35pts), recency (20pts), actionability (10pts)

- [ ] **OutlierDetector** - Find extreme values worth investigating
  - Uses: boxPlot.outliers from NumericColumnStats
  - Calculate: outlier count, extremeness (z-score), impact on mean
  - Score factors: outlier count (40pts), extremeness (35pts), impact (15pts), context (10pts)

- [ ] **CategoryDetector** - Find dominant categorical patterns
  - Uses: topValues from CategoricalColumnStats
  - Detect: dominance (one value >60%), diversity (high entropy), imbalance
  - Score factors: dominance (35pts), diversity (35pts), imbalance (20pts), business relevance (10pts)

### Scoring & Ranking
- [ ] **insightScoring.ts** - Interestingness algorithm
  - Base score 0-100 from detector
  - Apply business context multipliers
  - Handle edge cases (divide by zero, missing data)

- [ ] **slideOrderer.ts** - Narrative flow optimization
  - Type diversity: max 3 per type
  - Alternating types when possible
  - Must-include types: correlation, timeTrend (if detected)
  - Total: 8 slides (excludes title, preview, quality, next steps)

### Integration
- [ ] Replace `generateMockStory` with `generateRealStory`
- [ ] Wire up all 5 detectors
- [ ] Apply scoring and ordering
- [ ] Test on 4 sample datasets

### Testing Checklist
- [ ] E-Commerce (3K rows) - Should find age/revenue correlation
- [ ] SaaS (5K rows) - Should find retention patterns
- [ ] Retail Sales (731 rows) - Should find weekly seasonality
- [ ] Healthcare (4K rows) - Should find vitals outliers
- [ ] Manual review: All top insights make sense
- [ ] No false positives (weak patterns ranked low)
- [ ] Type diversity (not 8 correlations)

---

## TypeScript Interfaces

```typescript
// src/types/story.ts additions

export interface Insight {
  id: string;
  type: InsightType;
  score: number; // 0-100 interestingness
  title: string;
  subtitle?: string;
  data: InsightData;
}

export type InsightType =
  | 'correlation'
  | 'distribution'
  | 'timeTrend'
  | 'outlier'
  | 'category';

export type InsightData =
  | CorrelationInsightData
  | DistributionInsightData
  | TimeTrendInsightData
  | OutlierInsightData
  | CategoryInsightData;

export interface CorrelationInsightData {
  column1: string;
  column2: string;
  r: number;
  pValue: number;
  direction: 'positive' | 'negative';
  strength: 'weak' | 'moderate' | 'strong';
  sampleSize: number;
}

export interface DistributionInsightData {
  column: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  rangeVariation: number; // range / mean
  outlierCount: number;
}

export interface TimeTrendInsightData {
  dateColumn: string;
  valueColumn: string;
  seasonalityDetected: boolean;
  estimatedPeriod?: number;
  confidence: 'low' | 'medium' | 'high';
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export interface OutlierInsightData {
  column: string;
  outlierCount: number;
  outlierPercentage: number;
  maxZScore: number;
  impactOnMean: number; // % change if outliers removed
  exampleOutliers: number[]; // First 5
}

export interface CategoryInsightData {
  column: string;
  uniqueCount: number;
  topValue: string;
  topPercentage: number;
  dominance: boolean; // Top value >60%
  diversity: number; // Entropy 0-1
  imbalanceRatio: number; // top1 / top2
}
```

---

## Implementation Order

### Step 1: Correlation Detector (30 min)
Most straightforward - data already exists in `AnalysisResult.correlation` and `correlationSignificance`.

### Step 2: Distribution Detector (45 min)
Uses existing `NumericColumnStats` (min, max, mean, std, quartiles).

### Step 3: Outlier Detector (30 min)
Uses existing `boxPlot.outliers` from `NumericColumnStats`.

### Step 4: Category Detector (30 min)
Uses existing `topValues` from `CategoricalColumnStats`.

### Step 5: Time Series Detector (45 min)
Uses existing `timeSeriesAnalysis` from `AnalysisResult` (already has FFT seasonality detection).

### Step 6: Scoring System (30 min)
Implement scoring algorithms from plan (detailed in STORY_MODE_PLAN.md).

### Step 7: Slide Ordering (20 min)
Type diversity, max 3 per type, alternating flow.

### Step 8: Integration & Testing (60 min)
Replace mock generator, test on all datasets, refine thresholds.

**Total: ~4.5 hours**

---

## Success Criteria

By end of Phase 2:
- ✅ Real insights replace mock slides
- ✅ 5-10 insights detected per dataset
- ✅ Top insights pass "show my boss" test
- ✅ No obvious false positives
- ✅ Type diversity (not 8 correlations)
- ✅ Insights are actionable (not just "X is numeric")

---

## Notes

- **Use existing data** - Don't recalculate stats, use what's in AnalysisResult
- **Thresholds are tunable** - Start conservative, adjust based on testing
- **Business context matters** - Revenue/cost columns score higher than IDs
- **Edge cases** - Handle missing data, small samples, single-value columns gracefully
