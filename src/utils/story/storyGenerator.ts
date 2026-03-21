import type { AnalysisResult } from '../../types/analysis';
import type { Slide, Insight } from '../../types/story';
import { detectCorrelations } from './detectors/correlationDetector';
import { detectOutliers } from './detectors/outlierDetector';
import { detectDistributions } from './detectors/distributionDetector';
import { detectCategories } from './detectors/categoryDetector';
import { detectTimeSeries } from './detectors/timeSeriesDetector';
import { orderSlides, getInsightTypeSummary } from './slideOrderer';

/**
 * Story Generator - Phase 2
 *
 * Auto-detects interesting patterns and generates a narrative presentation.
 *
 * Flow:
 * 1. Run all 5 detectors
 * 2. Collect and score insights
 * 3. Order by interestingness + diversity
 * 4. Convert to slides
 * 5. Add title, preview, and next steps
 */
export function generateStory(analysisResult: AnalysisResult, datasetName?: string): Slide[] {
  const slides: Slide[] = [];

  // Step 1: Run all detectors
  const allInsights: Insight[] = [
    ...detectCorrelations(analysisResult),
    ...detectOutliers(analysisResult),
    ...detectDistributions(analysisResult),
    ...detectCategories(analysisResult),
    ...detectTimeSeries(analysisResult),
  ];

  // Step 2: Order insights (max 8, type diversity, narrative flow)
  const orderedInsights = orderSlides(allInsights, 8);

  // Step 3: Create title slide
  slides.push(createTitleSlide(analysisResult, datasetName, orderedInsights.length));

  // Step 4: Create preview slide
  slides.push(createPreviewSlide(orderedInsights));

  // Step 5: Convert insights to slides
  for (const insight of orderedInsights) {
    slides.push(insightToSlide(insight));
  }

  // Step 6: Add quality slide (if issues exist)
  const qualitySlide = createQualitySlide(analysisResult);
  if (qualitySlide) {
    slides.push(qualitySlide);
  }

  // Step 7: Add next steps slide
  slides.push(createNextStepsSlide(orderedInsights));

  return slides;
}

/**
 * Create title slide
 */
function createTitleSlide(
  result: AnalysisResult,
  datasetName: string | undefined,
  insightCount: number
): Slide {
  return {
    id: 'title',
    type: 'title',
    title: 'Dataset Overview',
    data: {
      datasetName: datasetName || 'Your Dataset',
      rowCount: result.overview.rows,
      columnCount: result.overview.columns,
      uploadDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      insightCount,
    },
  };
}

/**
 * Create preview slide showing insight types
 */
function createPreviewSlide(insights: Insight[]): Slide {
  return {
    id: 'preview',
    type: 'preview',
    title: 'Insights Preview',
    data: {
      insightTypes: getInsightTypeSummary(insights),
    },
  };
}

/**
 * Convert insight to slide
 */
function insightToSlide(insight: Insight): Slide {
  return {
    id: insight.id,
    type: insight.type,
    title: insight.title,
    subtitle: insight.subtitle,
    data: insight.data,
  };
}

/**
 * Create quality slide (if quality issues exist)
 */
function createQualitySlide(result: AnalysisResult): Slide | null {
  const { quality } = result;

  // Check if there are any quality issues
  const hasIssues =
    quality.duplicateRows > 0 ||
    quality.highMissingColumns.length > 0 ||
    quality.highCardinalityColumns.length > 0;

  if (!hasIssues) return null;

  return {
    id: 'quality',
    type: 'quality',
    title: 'Data Quality Check',
    data: {
      duplicateRows: quality.duplicateRows,
      duplicatePercentage: quality.duplicatePercentage,
      highMissingColumns: quality.highMissingColumns,
      highCardinalityColumns: quality.highCardinalityColumns,
    },
  };
}

/**
 * Create next steps slide with actionable recommendations
 */
function createNextStepsSlide(insights: Insight[]): Slide {
  const recommendations: string[] = [];

  // Generate recommendations based on detected insights
  for (const insight of insights.slice(0, 3)) {
    // Top 3 insights only
    const rec = generateRecommendation(insight);
    if (rec) recommendations.push(rec);
  }

  // Fallback if no insights
  if (recommendations.length === 0) {
    recommendations.push('Continue exploring your data for additional patterns');
    recommendations.push('Consider collecting more data for deeper analysis');
    recommendations.push('Review data quality and completeness');
  }

  return {
    id: 'next-steps',
    type: 'nextSteps',
    title: "What's Next?",
    data: {
      recommendations,
    },
  };
}

/**
 * Generate actionable recommendation from insight
 */
function generateRecommendation(insight: Insight): string | null {
  switch (insight.type) {
    case 'correlation':
      return `Investigate the relationship between ${insight.subtitle}`;

    case 'outlier':
      return `Review ${insight.subtitle} for extreme values and potential data errors`;

    case 'distribution':
      return `Analyze the wide variation in ${insight.subtitle}`;

    case 'category':
      return `Consider the dominance pattern in ${insight.subtitle}`;

    case 'timeTrend':
      return `Plan for the seasonal pattern in ${insight.subtitle}`;

    default:
      return null;
  }
}
