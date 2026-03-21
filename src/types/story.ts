/**
 * Story Mode Type Definitions
 *
 * Phase 1: Foundation types for UI components and mock slides
 * Phase 2+: Will add insight detection types
 */

export type SlideType =
  | 'title'
  | 'preview'
  | 'correlation'
  | 'distribution'
  | 'timeTrend'
  | 'outlier'
  | 'category'
  | 'quality'
  | 'nextSteps';

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  data: SlideData;
}

// Union type for all possible slide data structures
export type SlideData =
  | TitleSlideData
  | PreviewSlideData
  | MockInsightSlideData
  | InsightData // Phase 4: Added all insight data types
  | Record<string, unknown>; // Generic fallback

export interface TitleSlideData {
  datasetName: string;
  rowCount: number;
  columnCount: number;
  uploadDate?: string;
  insightCount: number;
}

export interface PreviewSlideData {
  insightTypes: Array<{
    type: SlideType;
    icon: string;
    label: string;
    count: number;
  }>;
}

export interface MockInsightSlideData {
  description: string;
  chartPlaceholder?: string;
  insight?: string;
}

// ===== PHASE 2: Insight Detection Types =====

export interface Insight {
  id: string;
  type: SlideType;
  score: number; // 0-100 interestingness
  title: string;
  subtitle?: string;
  data: InsightData;
}

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
  // Phase 4: Visualization data
  histogram?: { bins: number[]; counts: number[] };
  q25: number;
  q75: number;
}

export interface TimeTrendInsightData {
  dateColumn: string;
  valueColumn: string;
  seasonalityDetected: boolean;
  estimatedPeriod?: number;
  confidence: 'low' | 'medium' | 'high';
  trend?: 'increasing' | 'decreasing' | 'stable';
  // Phase 4: Visualization data
  dates: string[];
  values: number[];
}

export interface OutlierInsightData {
  column: string;
  outlierCount: number;
  outlierPercentage: number;
  maxZScore: number;
  impactOnMean: number; // % change if outliers removed
  exampleOutliers: number[]; // First 5
  // Phase 4: Visualization data
  min: number;
  q25: number;
  q50: number;
  q75: number;
  max: number;
}

export interface CategoryInsightData {
  column: string;
  uniqueCount: number;
  topValue: string;
  topPercentage: number;
  dominance: boolean; // Top value >60%
  diversity: number; // Entropy 0-1
  imbalanceRatio: number; // top1 / top2
  // Phase 4: Visualization data
  topValues: Array<{ value: string; percentage: number }>;
}

// Component Props
export interface StoryModeProps {
  slides: Slide[];
  onClose: () => void;
}

export interface StorySlideProps {
  slide: Slide;
  isActive: boolean;
  direction?: 'forward' | 'backward';
}

export interface StoryProgressProps {
  current: number;
  total: number;
  onJump: (index: number) => void;
}
