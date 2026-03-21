import type { Slide, OutlierInsightData } from '../../../types/story';
import SlideLayout from './SlideLayout';
import NarrativeText from './NarrativeText';
import { RangeIndicator } from '../../RangeIndicator';

interface OutlierSlideProps {
  slide: Slide;
}

/**
 * OutlierSlide - Shows extreme values worth investigating
 *
 * Phase 4: Enhanced with RangeIndicator to show outlier positions
 */
export default function OutlierSlide({ slide }: OutlierSlideProps) {
  const data = slide.data as unknown as OutlierInsightData;

  const narrative = `${data.outlierCount} ${data.outlierCount === 1 ? 'value' : 'values'} (${data.outlierPercentage.toFixed(1)}%) in ${data.column} ${data.outlierCount === 1 ? 'is' : 'are'} extreme outliers. The most extreme ${data.outlierCount === 1 ? 'value is' : 'values are'} ${Math.abs(data.maxZScore).toFixed(1)} standard deviations from the mean. ${
    Math.abs(data.impactOnMean) > 5
      ? `Removing these outliers would change the mean by ${Math.abs(data.impactOnMean).toFixed(1)}%.`
      : 'These outliers have minimal impact on overall statistics.'
  }`;

  const insight = data.outlierPercentage > 5
    ? `High outlier rate suggests potential data quality issues or genuinely exceptional cases in ${data.column.toLowerCase()}. Review these ${data.outlierCount} records to determine if they're errors or legitimate extreme values.`
    : `These outliers in ${data.column.toLowerCase()} may represent important edge cases or exceptional circumstances. Investigate whether they reveal insights or require data validation.`;

  return (
    <SlideLayout title={slide.title} subtitle={slide.subtitle} insight={insight}>
      <div className="space-y-6">
        <NarrativeText text={narrative} className="text-center" />

        <div className="relative mx-auto max-w-2xl space-y-6">
          {/* Big number display (keep for storytelling impact) */}
          <OutlierViz
            outlierCount={data.outlierCount}
            outlierPercentage={data.outlierPercentage}
            maxZScore={data.maxZScore}
          />

          {/* Range indicator (NEW - visualizes WHERE outliers are) */}
          <div className="flex justify-center">
            <RangeIndicator
              min={data.min}
              q25={data.q25}
              q50={data.q50}
              q75={data.q75}
              max={data.max}
              outlierCount={data.outlierCount}
              width={600}
              height={120}
            />
          </div>

          {/* Example outlier values (keep) */}
          {data.exampleOutliers.length > 0 && (
            <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
              <div className="text-sm text-text-secondary mb-2">Example outlier values:</div>
              <div className="flex flex-wrap gap-2">
                {data.exampleOutliers.slice(0, 5).map((val, i) => (
                  <span key={i} className="px-3 py-1 rounded bg-orange-500/20 text-orange-300 font-mono text-sm">
                    {val.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}

function OutlierViz({
  outlierCount,
  outlierPercentage,
  maxZScore,
}: {
  outlierCount: number;
  outlierPercentage: number;
  maxZScore: number;
}) {
  return (
    <div className="w-full space-y-6 text-center">
      {/* Large outlier count */}
      <div className="space-y-2">
        <div className="text-6xl md:text-7xl font-bold text-orange-400">
          {outlierCount}
        </div>
        <div className="text-xl text-text-secondary">
          outlier{outlierCount === 1 ? '' : 's'} detected
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
          <div className="text-2xl font-bold text-orange-400">{outlierPercentage.toFixed(1)}%</div>
          <div className="text-sm text-text-secondary">of data</div>
        </div>
        <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
          <div className="text-2xl font-bold text-orange-400">{Math.abs(maxZScore).toFixed(1)}σ</div>
          <div className="text-sm text-text-secondary">max deviation</div>
        </div>
      </div>
    </div>
  );
}
