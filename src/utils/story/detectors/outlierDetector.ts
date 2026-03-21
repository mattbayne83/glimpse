import type { AnalysisResult } from '../../../types/analysis';
import type { Insight, OutlierInsightData } from '../../../types/story';

/**
 * Outlier Detector
 *
 * Finds extreme values worth investigating in numeric columns.
 *
 * Criteria:
 * - Outlier rate > 2% (more than just a few rare cases)
 * - Max z-score > 3 (truly extreme values)
 *
 * Scoring (0-100):
 * - Outlier count: 40 points (higher % = more interesting)
 * - Extremeness: 35 points (how far from normal range)
 * - Impact on mean: 15 points (statistical significance)
 * - Business context: 10 points (revenue/cost columns = higher score)
 */
export function detectOutliers(result: AnalysisResult): Insight[] {
  const insights: Insight[] = [];

  // Process each numeric column
  for (const col of result.columns) {
    if (col.analysis.type !== 'numeric') continue;

    const stats = col.analysis.stats;

    // Check if boxPlot data exists (added in Phase 2 of analysis)
    if (!stats.boxPlot || !stats.boxPlot.outliers || stats.boxPlot.outliers.length === 0) {
      continue;
    }

    const outlierCount = stats.boxPlot.outliers.length;
    const outlierPercentage = (outlierCount / stats.count) * 100;

    // Filter: Only if outlier rate > 2%
    if (outlierPercentage < 2) continue;

    // Calculate max z-score (how extreme are the outliers)
    const outliers = stats.boxPlot.outliers;
    const zScores = outliers.map(val => Math.abs((val - stats.mean) / stats.std));
    const maxZScore = Math.max(...zScores);

    // Filter: Only if max z-score > 3 (truly extreme)
    if (maxZScore < 3) continue;

    // Calculate impact on mean (if outliers were removed)
    const impactOnMean = calculateMeanImpact(stats.mean, outliers, stats.count);

    // Calculate interestingness score
    const score = scoreOutliers(
      outlierPercentage,
      maxZScore,
      impactOnMean,
      col.name
    );

    // Create insight data
    const data: OutlierInsightData = {
      column: col.name,
      outlierCount,
      outlierPercentage,
      maxZScore,
      impactOnMean,
      exampleOutliers: outliers.slice(0, 5), // First 5 examples
      // Phase 4: Visualization data
      min: stats.min,
      q25: stats.q25,
      q50: stats.q50,
      q75: stats.q75,
      max: stats.max,
    };

    // Create insight
    insights.push({
      id: `outlier-${col.name}`,
      type: 'outlier',
      score,
      title: 'Extreme values detected',
      subtitle: col.name,
      data,
    });
  }

  return insights;
}

/**
 * Score outlier interestingness (0-100)
 */
function scoreOutliers(
  outlierPercentage: number,
  maxZScore: number,
  impactOnMean: number,
  columnName: string
): number {
  let score = 0;

  // 1. Outlier count component (0-40 points)
  if (outlierPercentage > 10) score += 40; // 10%+ outliers
  else if (outlierPercentage > 5) score += 32;
  else if (outlierPercentage > 2) score += 24;

  // 2. Extremeness component (0-35 points)
  if (maxZScore > 5) score += 35; // Very extreme
  else if (maxZScore > 4) score += 28;
  else if (maxZScore > 3) score += 20;

  // 3. Impact component (0-15 points)
  const absImpact = Math.abs(impactOnMean);
  if (absImpact > 20) score += 15; // 20%+ change
  else if (absImpact > 10) score += 12;
  else if (absImpact > 5) score += 8;

  // 4. Business context bonus (0-10 points)
  if (isBusinessCritical(columnName)) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Calculate impact on mean if outliers were removed
 * Returns percentage change
 */
function calculateMeanImpact(
  mean: number,
  outliers: number[],
  totalCount: number
): number {
  if (mean === 0) return 0;

  // Sum of outlier values
  const outlierSum = outliers.reduce((sum, val) => sum + val, 0);

  // Mean without outliers
  const cleanSum = (mean * totalCount) - outlierSum;
  const cleanCount = totalCount - outliers.length;
  const cleanMean = cleanCount > 0 ? cleanSum / cleanCount : mean;

  // Percentage change
  return ((mean - cleanMean) / mean) * 100;
}

/**
 * Check if column is business-critical
 * Higher scores for revenue, cost, price, etc.
 */
function isBusinessCritical(columnName: string): boolean {
  const name = columnName.toLowerCase();
  const criticalKeywords = [
    'revenue',
    'sales',
    'price',
    'cost',
    'profit',
    'spend',
    'income',
    'salary',
    'value',
    'amount',
    'total',
  ];

  return criticalKeywords.some(kw => name.includes(kw));
}
