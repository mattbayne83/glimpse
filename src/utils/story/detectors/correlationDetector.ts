import type { AnalysisResult } from '../../../types/analysis';
import type { Insight, CorrelationInsightData } from '../../../types/story';

/**
 * Correlation Detector
 *
 * Finds strong relationships between numeric columns.
 *
 * Criteria:
 * - |r| > 0.5 (moderate to strong correlation)
 * - p < 0.05 (statistically significant)
 *
 * Scoring (0-100):
 * - Strength: 40 points (based on |r|)
 * - Significance: 30 points (based on p-value)
 * - Sample size: 20 points (larger = more trustworthy)
 * - Unexpectedness: 10 points (bonus for surprising relationships)
 */
export function detectCorrelations(result: AnalysisResult): Insight[] {
  const insights: Insight[] = [];

  // Check if correlation data exists
  if (!result.correlation || !result.correlationSignificance) {
    return insights;
  }

  const { correlationSignificance } = result;

  // Process each significant correlation
  for (const corr of correlationSignificance) {
    // Filter: Only moderate to strong correlations
    const absR = Math.abs(corr.r);
    if (absR < 0.5) continue;

    // Filter: Only statistically significant
    if (corr.pValue >= 0.05) continue;

    // Determine strength and direction
    const strength = absR > 0.7 ? 'strong' : absR > 0.5 ? 'moderate' : 'weak';
    const direction = corr.r > 0 ? 'positive' : 'negative';

    // Calculate interestingness score
    const score = scoreCorrelation(corr.r, corr.pValue, result.overview.rows, corr.column1, corr.column2);

    // Create insight data
    const data: CorrelationInsightData = {
      column1: corr.column1,
      column2: corr.column2,
      r: corr.r,
      pValue: corr.pValue,
      direction,
      strength,
      sampleSize: result.overview.rows,
    };

    // Create insight
    insights.push({
      id: `correlation-${corr.column1}-${corr.column2}`,
      type: 'correlation',
      score,
      title: `${strength.charAt(0).toUpperCase() + strength.slice(1)} ${direction} relationship`,
      subtitle: `${corr.column1} and ${corr.column2}`,
      data,
    });
  }

  return insights;
}

/**
 * Score correlation interestingness (0-100)
 */
function scoreCorrelation(
  r: number,
  pValue: number,
  sampleSize: number,
  col1: string,
  col2: string
): number {
  let score = 0;

  // 1. Strength component (0-40 points)
  const absR = Math.abs(r);
  if (absR > 0.9) score += 40; // Very strong
  else if (absR > 0.7) score += 32; // Strong
  else if (absR > 0.5) score += 24; // Moderate

  // 2. Significance component (0-30 points)
  if (pValue < 0.001) score += 30; // Highly significant
  else if (pValue < 0.01) score += 22;
  else if (pValue < 0.05) score += 15;

  // 3. Sample size component (0-20 points)
  if (sampleSize > 1000) score += 20; // Large sample = more trustworthy
  else if (sampleSize > 100) score += 15;
  else if (sampleSize > 30) score += 10;
  else score += 5; // Small sample

  // 4. Unexpectedness bonus (0-10 points)
  // If variable names suggest no obvious relationship, add surprise bonus
  score += calculateUnexpectedness(col1, col2);

  return Math.min(score, 100);
}

/**
 * Calculate unexpectedness score (0-10)
 *
 * Higher score for surprising relationships (e.g., zip_code vs revenue)
 * Lower score for expected relationships (e.g., age vs birth_year)
 */
function calculateUnexpectedness(col1: string, col2: string): number {
  const name1 = col1.toLowerCase();
  const name2 = col2.toLowerCase();

  // Expected pairs (low score)
  const expectedPairs = [
    ['age', 'birth'],
    ['price', 'cost'],
    ['revenue', 'sales'],
    ['total', 'sum'],
    ['count', 'number'],
    ['start', 'end'],
  ];

  for (const [term1, term2] of expectedPairs) {
    if (
      (name1.includes(term1) && name2.includes(term2)) ||
      (name1.includes(term2) && name2.includes(term1))
    ) {
      return 0; // Expected relationship
    }
  }

  // Check if both are clearly different domains (high score)
  const domainKeywords = {
    demographic: ['age', 'gender', 'location', 'zip', 'city', 'state'],
    financial: ['revenue', 'price', 'cost', 'spend', 'salary', 'income'],
    temporal: ['date', 'time', 'year', 'month', 'day', 'duration'],
    behavioral: ['visits', 'clicks', 'purchase', 'engagement', 'frequency'],
  };

  let domain1: string | null = null;
  let domain2: string | null = null;

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(kw => name1.includes(kw))) domain1 = domain;
    if (keywords.some(kw => name2.includes(kw))) domain2 = domain;
  }

  // Different domains = unexpected (interesting!)
  if (domain1 && domain2 && domain1 !== domain2) {
    return 10;
  }

  // Same domain = somewhat expected
  if (domain1 && domain2 && domain1 === domain2) {
    return 3;
  }

  // Neutral (can't determine domain)
  return 5;
}
