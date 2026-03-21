import type { AnalysisResult } from '../../../types/analysis';
import type { Insight, TimeTrendInsightData } from '../../../types/story';

/**
 * Time Series Detector
 *
 * Finds temporal patterns in datetime columns.
 *
 * Criteria:
 * - Seasonality detected (FFT analysis)
 * - Medium or high confidence
 *
 * Scoring (0-100):
 * - Seasonality strength: 35 points (based on confidence)
 * - Pattern clarity: 35 points (period makes business sense)
 * - Recency: 20 points (recent data = more actionable)
 * - Actionability: 10 points (weekly/monthly patterns score higher)
 */
export function detectTimeSeries(result: AnalysisResult): Insight[] {
  const insights: Insight[] = [];

  // Check if time series analysis exists
  if (!result.timeSeriesAnalysis || result.timeSeriesAnalysis.length === 0) {
    return insights;
  }

  // Process each time series analysis
  for (const ts of result.timeSeriesAnalysis) {
    // Filter: Only if seasonality detected
    if (!ts.seasonalityDetected) continue;

    // Filter: Only if confidence is medium or high
    if (ts.confidence === 'low') continue;

    // Determine trend (if detectable from data)
    // Note: Current timeSeriesAnalysis doesn't include trend, so we'll leave it undefined
    // Can be added in Phase 3 when we enhance time series analysis

    // Calculate interestingness score
    const score = scoreTimeSeries(
      ts.confidence,
      ts.estimatedPeriod,
      ts.dates.length
    );

    // Create insight data
    const data: TimeTrendInsightData = {
      dateColumn: ts.dateColumn,
      valueColumn: ts.valueColumn,
      seasonalityDetected: ts.seasonalityDetected,
      estimatedPeriod: ts.estimatedPeriod,
      confidence: ts.confidence,
      // trend will be undefined for Phase 2
      // Phase 4: Visualization data
      dates: ts.dates,
      values: ts.values,
    };

    // Create insight
    const periodLabel = getPeriodLabel(ts.estimatedPeriod);

    insights.push({
      id: `timeseries-${ts.dateColumn}-${ts.valueColumn}`,
      type: 'timeTrend',
      score,
      title: 'Seasonal pattern detected',
      subtitle: `${ts.valueColumn}${periodLabel ? ` (${periodLabel})` : ''}`,
      data,
    });
  }

  return insights;
}

/**
 * Score time series interestingness (0-100)
 */
function scoreTimeSeries(
  confidence: 'low' | 'medium' | 'high',
  estimatedPeriod: number | undefined,
  dataPointCount: number
): number {
  let score = 0;

  // 1. Seasonality strength (0-35 points)
  if (confidence === 'high') score += 35;
  else if (confidence === 'medium') score += 25;
  else score += 10; // low (shouldn't happen due to filter)

  // 2. Pattern clarity (0-35 points)
  if (estimatedPeriod) {
    // Weekly pattern (7 days)
    if (Math.abs(estimatedPeriod - 7) < 1) score += 35;
    // Monthly pattern (28-31 days)
    else if (estimatedPeriod >= 28 && estimatedPeriod <= 31) score += 32;
    // Quarterly pattern (~90 days)
    else if (Math.abs(estimatedPeriod - 90) < 10) score += 28;
    // Annual pattern (~365 days)
    else if (Math.abs(estimatedPeriod - 365) < 30) score += 30;
    // Other patterns
    else score += 20;
  }

  // 3. Recency (0-20 points)
  // More data points = more recent and comprehensive
  if (dataPointCount > 100) score += 20;
  else if (dataPointCount > 50) score += 15;
  else if (dataPointCount > 20) score += 10;

  // 4. Actionability bonus (0-10 points)
  // Weekly and monthly patterns are most actionable for businesses
  if (estimatedPeriod) {
    if (Math.abs(estimatedPeriod - 7) < 1) score += 10; // Weekly
    else if (estimatedPeriod >= 28 && estimatedPeriod <= 31) score += 8; // Monthly
    else score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Convert period number to human-readable label
 */
function getPeriodLabel(period: number | undefined): string | null {
  if (!period) return null;

  // Weekly
  if (Math.abs(period - 7) < 1) return 'weekly';

  // Bi-weekly
  if (Math.abs(period - 14) < 2) return 'bi-weekly';

  // Monthly
  if (period >= 28 && period <= 31) return 'monthly';

  // Quarterly
  if (Math.abs(period - 90) < 10) return 'quarterly';

  // Annual
  if (Math.abs(period - 365) < 30) return 'annual';

  // Other
  return `${Math.round(period)}-day cycle`;
}
