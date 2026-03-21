import type { Insight } from '../../types/story';

/**
 * Slide Orderer
 *
 * Orders insights to create a compelling narrative flow.
 *
 * Rules:
 * - Max 8 insight slides (excludes title, preview, quality, next steps)
 * - Type diversity: max 3 per type
 * - Alternate types when possible (avoid monotony)
 * - Prioritize high-scoring insights
 */
export function orderSlides(insights: Insight[], maxSlides: number = 8): Insight[] {
  // 1. Sort by score (highest first)
  const sorted = [...insights].sort((a, b) => b.score - a.score);

  // 2. Filter out low-quality insights (score < 40)
  const quality = sorted.filter(i => i.score >= 40);

  // 3. Ensure type diversity (max 3 per type)
  const diversified = ensureTypeDiversity(quality, 3);

  // 4. Take top N slides
  const selected = diversified.slice(0, maxSlides);

  // 5. Re-order for narrative flow (high → medium → high pattern)
  const ordered = createNarrativeFlow(selected);

  return ordered;
}

/**
 * Ensure max N insights per type
 */
function ensureTypeDiversity(insights: Insight[], maxPerType: number): Insight[] {
  const typeCounts: Record<string, number> = {};
  const result: Insight[] = [];

  for (const insight of insights) {
    const count = typeCounts[insight.type] || 0;

    if (count < maxPerType) {
      result.push(insight);
      typeCounts[insight.type] = count + 1;
    }
  }

  return result;
}

/**
 * Create narrative flow with alternating types
 *
 * Pattern: Start strong, vary middle, end strong
 * Avoid consecutive insights of same type
 */
function createNarrativeFlow(insights: Insight[]): Insight[] {
  if (insights.length <= 2) return insights;

  const result: Insight[] = [];
  const remaining = [...insights];

  // Start with highest-scoring insight
  result.push(remaining.shift()!);

  // Fill middle with alternating types
  while (remaining.length > 0) {
    const lastType = result[result.length - 1].type;

    // Try to find insight of different type
    const differentTypeIndex = remaining.findIndex(i => i.type !== lastType);

    if (differentTypeIndex !== -1) {
      // Found different type - use it
      result.push(remaining.splice(differentTypeIndex, 1)[0]);
    } else {
      // All remaining are same type - just take next highest
      result.push(remaining.shift()!);
    }
  }

  return result;
}

/**
 * Get summary of insight types for preview slide
 */
export function getInsightTypeSummary(insights: Insight[]): Array<{
  type: string;
  icon: string;
  label: string;
  count: number;
}> {
  const typeCounts: Record<string, number> = {};

  for (const insight of insights) {
    typeCounts[insight.type] = (typeCounts[insight.type] || 0) + 1;
  }

  return [
    {
      type: 'correlation',
      icon: '📊',
      label: 'Correlations',
      count: typeCounts['correlation'] || 0,
    },
    {
      type: 'distribution',
      icon: '📈',
      label: 'Distributions',
      count: typeCounts['distribution'] || 0,
    },
    {
      type: 'timeTrend',
      icon: '📉',
      label: 'Time Trends',
      count: typeCounts['timeTrend'] || 0,
    },
    {
      type: 'outlier',
      icon: '⚠️',
      label: 'Outliers',
      count: typeCounts['outlier'] || 0,
    },
    {
      type: 'category',
      icon: '🎯',
      label: 'Categories',
      count: typeCounts['category'] || 0,
    },
    {
      type: 'quality',
      icon: '✅',
      label: 'Data Quality',
      count: 0, // Will be set separately based on quality issues
    },
  ];
}
