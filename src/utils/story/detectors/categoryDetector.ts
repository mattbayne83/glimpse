import type { AnalysisResult } from '../../../types/analysis';
import type { Insight, CategoryInsightData } from '../../../types/story';

/**
 * Category Detector
 *
 * Finds dominant or diverse patterns in categorical columns.
 *
 * Criteria:
 * - Dominance: Top value > 60% (one category overwhelms others)
 * - OR Diversity: High unique count + even distribution
 * - OR Imbalance: Top value 3x more than second
 *
 * Scoring (0-100):
 * - Dominance: 35 points (one value dominates)
 * - Diversity: 35 points (many values, even spread)
 * - Imbalance: 20 points (top vs second ratio)
 * - Business relevance: 10 points (important columns score higher)
 */
export function detectCategories(result: AnalysisResult): Insight[] {
  const insights: Insight[] = [];

  // Process each categorical column
  for (const col of result.columns) {
    if (col.analysis.type !== 'categorical') continue;

    const stats = col.analysis.stats;

    // Skip if no top values
    if (!stats.topValues || stats.topValues.length === 0) {
      continue;
    }

    const topValue = stats.topValues[0];
    const topPercentage = topValue.percentage;

    // Calculate imbalance ratio (top1 / top2)
    const imbalanceRatio = stats.topValues.length > 1
      ? topValue.percentage / stats.topValues[1].percentage
      : Infinity;

    // Calculate diversity (entropy approximation)
    const diversity = calculateEntropy(stats.topValues);

    // Determine if this is interesting
    const isDominant = topPercentage > 60; // One value > 60%
    const isDiverse = stats.uniqueCount > 10 && diversity > 0.7; // Many values, even spread
    const isImbalanced = imbalanceRatio > 3; // Top 3x more than second

    if (!isDominant && !isDiverse && !isImbalanced) {
      continue;
    }

    // Calculate interestingness score
    const score = scoreCategory(
      topPercentage,
      diversity,
      imbalanceRatio,
      stats.uniqueCount,
      col.name
    );

    // Create insight data
    const data: CategoryInsightData = {
      column: col.name,
      uniqueCount: stats.uniqueCount,
      topValue: topValue.value,
      topPercentage,
      dominance: isDominant,
      diversity,
      imbalanceRatio: isFinite(imbalanceRatio) ? imbalanceRatio : 999,
      // Phase 4: Visualization data
      topValues: stats.topValues.slice(0, 5).map(tv => ({
        value: tv.value,
        percentage: tv.percentage,
      })),
    };

    // Create insight
    const title = isDominant
      ? 'Dominant category detected'
      : isDiverse
        ? 'High diversity detected'
        : 'Category imbalance detected';

    insights.push({
      id: `category-${col.name}`,
      type: 'category',
      score,
      title,
      subtitle: col.name,
      data,
    });
  }

  return insights;
}

/**
 * Score category interestingness (0-100)
 */
function scoreCategory(
  topPercentage: number,
  diversity: number,
  imbalanceRatio: number,
  uniqueCount: number,
  columnName: string
): number {
  let score = 0;

  // 1. Dominance component (0-35 points)
  if (topPercentage > 80) score += 35; // Extreme dominance
  else if (topPercentage > 70) score += 30;
  else if (topPercentage > 60) score += 25;
  else score += 10;

  // 2. Diversity component (0-35 points)
  const uniqueRatio = Math.min(uniqueCount / 100, 1); // Normalize to 100
  if (diversity > 0.8 && uniqueRatio > 0.5) score += 35; // Very diverse
  else if (diversity > 0.6 && uniqueRatio > 0.3) score += 25;
  else if (diversity > 0.4) score += 15;

  // 3. Imbalance component (0-20 points)
  if (isFinite(imbalanceRatio)) {
    if (imbalanceRatio > 10) score += 20; // Top 10x more than second
    else if (imbalanceRatio > 5) score += 15;
    else if (imbalanceRatio > 3) score += 10;
  }

  // 4. Business relevance bonus (0-10 points)
  if (isBusinessRelevant(columnName)) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Calculate entropy (measure of diversity)
 * Returns value 0-1 (higher = more diverse)
 */
function calculateEntropy(topValues: Array<{ value: string; percentage: number }>): number {
  let entropy = 0;

  for (const item of topValues) {
    const p = item.percentage / 100; // Convert to probability
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Normalize to 0-1 (max entropy for N categories is log2(N))
  const maxEntropy = Math.log2(topValues.length);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

/**
 * Check if column is business-relevant
 */
function isBusinessRelevant(columnName: string): boolean {
  const name = columnName.toLowerCase();
  const relevantKeywords = [
    'product',
    'category',
    'type',
    'status',
    'segment',
    'channel',
    'source',
    'campaign',
    'region',
    'country',
    'industry',
    'plan',
    'tier',
  ];

  return relevantKeywords.some(kw => name.includes(kw));
}
