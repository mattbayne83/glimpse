import type { Slide, DistributionInsightData } from '../../../types/story';
import SlideLayout from './SlideLayout';
import NarrativeText from './NarrativeText';
import { Histogram } from '../../Histogram';
import { RangeIndicator } from '../../RangeIndicator';

interface DistributionSlideProps {
  slide: Slide;
}

/**
 * DistributionSlide - Shows distribution characteristics
 *
 * Phase 4: Enhanced with interactive Histogram + RangeIndicator
 *
 * Displays:
 * - Narrative context (kept for storytelling)
 * - Histogram with distribution curve
 * - Range indicator with quartiles
 * - Business implications
 */
export default function DistributionSlide({ slide }: DistributionSlideProps) {
  const data = slide.data as unknown as DistributionInsightData;

  // Generate narrative text
  const narrative = `${data.column} has values ranging from ${data.min.toFixed(2)} to ${data.max.toFixed(2)}, with a mean of ${data.mean.toFixed(2)} and median of ${data.median.toFixed(2)}. ${
    data.outlierCount > 0
      ? `${data.outlierCount} extreme ${data.outlierCount === 1 ? 'value' : 'values'} detected.`
      : 'The data shows a wide but consistent spread.'
  }`;

  // Generate insight
  const insight = data.rangeVariation > 5
    ? `The extremely wide range suggests high variability in ${data.column.toLowerCase()}. Consider segmenting analysis or investigating causes of this variation.`
    : `The wide distribution indicates significant diversity in ${data.column.toLowerCase()} across your dataset. This variation may represent meaningful differences worth exploring.`;

  // Determine distribution shape for histogram label
  const getShapeLabel = (): string => {
    const skew = (data.mean - data.median) / data.std;
    if (Math.abs(skew) < 0.5) return 'Normal';
    if (skew > 0.5) return 'Right-skewed';
    return 'Left-skewed';
  };

  return (
    <SlideLayout title={slide.title} subtitle={slide.subtitle} insight={insight}>
      <div className="space-y-6">
        {/* Narrative */}
        <NarrativeText text={narrative} className="text-center" />

        {/* Visualization */}
        <div className="relative mx-auto max-w-2xl space-y-6">
          {/* Histogram (if data available) */}
          {data.histogram && data.histogram.bins.length > 0 ? (
            <div className="flex justify-center">
              <Histogram
                bins={data.histogram.bins}
                counts={data.histogram.counts}
                width={600}
                height={300}
                shapeLabel={getShapeLabel()}
              />
            </div>
          ) : null}

          {/* Range Indicator */}
          <div className="flex justify-center">
            <RangeIndicator
              min={data.min}
              q25={data.q25}
              q50={data.median}
              q75={data.q75}
              max={data.max}
              outlierCount={data.outlierCount}
              width={600}
              height={120}
            />
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
