import type { AnalysisResult } from '../../types/analysis';
import type { Slide } from '../../types/story';

/**
 * Mock Story Generator - Phase 1
 *
 * Creates 3 hardcoded slides using real dataset statistics:
 * 1. Title slide (dataset name + dimensions)
 * 2. Insights preview (placeholder icons)
 * 3. Mock insight (one real correlation or pattern)
 *
 * Phase 2+ will replace this with real insight detection algorithms.
 */
export function generateMockStory(analysisResult: AnalysisResult, datasetName?: string): Slide[] {
  const slides: Slide[] = [];

  // Slide 1: Title
  slides.push({
    id: 'title',
    type: 'title',
    title: 'Dataset Overview',
    data: {
      datasetName: datasetName || 'Your Dataset',
      rowCount: analysisResult.overview.rows,
      columnCount: analysisResult.overview.columns,
      uploadDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      insightCount: 3, // Hardcoded for Phase 1
    },
  });

  // Slide 2: Insights Preview
  slides.push({
    id: 'preview',
    type: 'preview',
    title: 'Insights Preview',
    data: {
      insightTypes: [
        { type: 'correlation', icon: '📊', label: 'Correlations', count: 1 },
        { type: 'distribution', icon: '📈', label: 'Distributions', count: 1 },
        { type: 'timeTrend', icon: '📉', label: 'Time Trends', count: 0 },
        { type: 'outlier', icon: '⚠️', label: 'Outliers', count: 1 },
        { type: 'category', icon: '🎯', label: 'Categories', count: 0 },
        { type: 'quality', icon: '✅', label: 'Data Quality', count: 0 },
      ],
    },
  });

  // Slide 3: Mock Insight (use real data if available)
  const mockInsight = createMockInsight(analysisResult);
  slides.push(mockInsight);

  return slides;
}

/**
 * Creates a mock insight slide using real analysis data
 * Tries to find interesting patterns in the actual dataset
 */
function createMockInsight(analysisResult: AnalysisResult): Slide {
  // Try to find a strong correlation
  if (analysisResult.correlation && analysisResult.correlation.matrix && analysisResult.correlation.matrix.length > 0) {
    const correlations = analysisResult.correlation.matrix;
    let strongestCorrelation = { col1: '', col2: '', value: 0 };

    // Find the strongest non-diagonal correlation
    for (const row of correlations as any) {
      for (const col of correlations as any) {
        if (row.column !== col.column) {
          const value = Math.abs((row as any)[col.column] || 0);
          if (value > Math.abs(strongestCorrelation.value) && value < 1) {
            strongestCorrelation = {
              col1: row.column,
              col2: col.column,
              value: (row as any)[col.column],
            };
          }
        }
      }
    }

    if (Math.abs(strongestCorrelation.value) > 0.3) {
      const r = strongestCorrelation.value;
      const absR = Math.abs(r);
      const strength = absR > 0.7 ? 'strong' : absR > 0.5 ? 'moderate' : 'weak';
      const direction = r > 0 ? 'positive' : 'negative';

      return {
        id: 'mock-correlation',
        type: 'correlation',
        title: 'Strong Relationship Detected',
        subtitle: `${strongestCorrelation.col1} and ${strongestCorrelation.col2}`,
        data: {
          description: `These two variables show a ${strength} ${direction} correlation (r=${r.toFixed(3)})`,
          chartPlaceholder: '📊',
          insight: `${
            r > 0
              ? 'As one increases, the other tends to increase as well.'
              : 'As one increases, the other tends to decrease.'
          } This pattern appears in ${analysisResult.overview.rows.toLocaleString()} data points.`,
        },
      };
    }
  }

  // Fallback: Find an interesting column distribution
  const numericColumns = analysisResult.columns.filter(col => col.analysis.type === 'numeric');
  if (numericColumns.length > 0) {
    // Find column with widest range (relative to mean)
    let mostInteresting = numericColumns[0];
    let maxVariation = 0;

    for (const col of numericColumns) {
      if (col.analysis.type === 'numeric') {
        const stats = col.analysis.stats;
        const range = stats.max - stats.min;
        const mean = stats.mean;
        const variation = mean !== 0 ? range / Math.abs(mean) : range;

        if (variation > maxVariation) {
          maxVariation = variation;
          mostInteresting = col;
        }
      }
    }

    if (mostInteresting.analysis.type === 'numeric') {
      const stats = mostInteresting.analysis.stats;
      return {
        id: 'mock-distribution',
        type: 'distribution',
        title: 'Wide Distribution Detected',
        subtitle: mostInteresting.name,
        data: {
          description: `This column has values ranging from ${stats.min.toFixed(2)} to ${stats.max.toFixed(2)}, with a mean of ${stats.mean.toFixed(2)}`,
          chartPlaceholder: '📈',
          insight: `The data spans a wide range, suggesting significant variation in ${mostInteresting.name.toLowerCase()} across your dataset.`,
        },
      };
    }
  }

  // Fallback: Generic placeholder
  return {
    id: 'mock-generic',
    type: 'correlation',
    title: 'Exploring Your Data',
    subtitle: `${analysisResult.overview.columns} columns analyzed`,
    data: {
      description: `We're analyzing ${analysisResult.overview.rows.toLocaleString()} rows across ${
        analysisResult.overview.columns
      } columns to find interesting patterns.`,
      chartPlaceholder: '🔍',
      insight: 'Real insights will appear here once Phase 2 (insight detection) is implemented.',
    },
  };
}
