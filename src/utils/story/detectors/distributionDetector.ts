import type { AnalysisResult } from '../../../types/analysis';
import type { Insight, DistributionInsightData } from '../../../types/story';

/**
 * Distribution Detector
 *
 * Finds unusual distribution patterns in numeric columns.
 *
 * Criteria:
 * - High range variation (range / mean > 2)
 * - OR wide quartile spread (IQR / mean > 0.5)
 * - OR significant outliers (>5% of data)
 *
 * Scoring (0-100):
 * - Range variation: 40 points (wide spread)
 * - Quartile spread: 30 points (IQR analysis)
 * - Outlier count: 20 points (data quality indicator)
 * - Business relevance: 10 points (important columns score higher)
 */
export function detectDistributions(result: AnalysisResult): Insight[] {
  const insights: Insight[] = [];

  // Process each numeric column
  for (const col of result.columns) {
    if (col.analysis.type !== 'numeric') continue;

    const stats = col.analysis.stats;

    // Calculate range variation (range / mean)
    const range = stats.max - stats.min;
    const rangeVariation = stats.mean !== 0 ? range / Math.abs(stats.mean) : range;

    // Calculate IQR spread (for quartile analysis)
    const iqr = stats.q75 - stats.q25;
    const iqrSpread = stats.mean !== 0 ? iqr / Math.abs(stats.mean) : iqr;

    // Count outliers (if boxPlot exists)
    const outlierCount = stats.boxPlot?.outliers?.length || 0;
    const outlierPercentage = (outlierCount / stats.count) * 100;

    // Filter: Only if distribution is interesting
    const isWideRange = rangeVariation > 2;
    const isWideIQR = iqrSpread > 0.5;
    const hasSignificantOutliers = outlierPercentage > 5;

    if (!isWideRange && !isWideIQR && !hasSignificantOutliers) {
      continue;
    }

    // Calculate interestingness score
    const score = scoreDistribution(
      rangeVariation,
      iqrSpread,
      outlierPercentage,
      col.name
    );

    // Create insight data
    const data: DistributionInsightData = {
      column: col.name,
      min: stats.min,
      max: stats.max,
      mean: stats.mean,
      median: stats.q50,
      std: stats.std,
      rangeVariation,
      outlierCount,
      // Phase 4: Visualization data
      histogram: stats.histogram,
      q25: stats.q25,
      q75: stats.q75,
    };

    // Create insight
    insights.push({
      id: `distribution-${col.name}`,
      type: 'distribution',
      score,
      title: 'Wide distribution detected',
      subtitle: col.name,
      data,
    });
  }

  return insights;
}

/**
 * Score distribution interestingness (0-100)
 */
function scoreDistribution(
  rangeVariation: number,
  iqrSpread: number,
  outlierPercentage: number,
  columnName: string
): number {
  let score = 0;

  // 1. Range variation component (0-40 points)
  if (rangeVariation > 10) score += 40; // Extremely wide
  else if (rangeVariation > 5) score += 35;
  else if (rangeVariation > 2) score += 28;
  else score += 15;

  // 2. Quartile spread component (0-30 points)
  if (iqrSpread > 2) score += 30; // Very wide IQR
  else if (iqrSpread > 1) score += 24;
  else if (iqrSpread > 0.5) score += 18;

  // 3. Outlier component (0-20 points)
  if (outlierPercentage > 10) score += 20;
  else if (outlierPercentage > 5) score += 15;
  else if (outlierPercentage > 2) score += 10;

  // 4. Business relevance bonus (0-10 points)
  if (isBusinessRelevant(columnName)) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Check if column is business-relevant
 * Financial, engagement, and performance metrics score higher
 */
function isBusinessRelevant(columnName: string): boolean {
  const name = columnName.toLowerCase();
  const relevantKeywords = [
    'revenue',
    'sales',
    'price',
    'cost',
    'profit',
    'spend',
    'value',
    'amount',
    'engagement',
    'visits',
    'clicks',
    'conversion',
    'retention',
    'churn',
    'satisfaction',
    'rating',
    'score',
  ];

  return relevantKeywords.some(kw => name.includes(kw));
}
