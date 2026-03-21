import type { Slide, TimeTrendInsightData } from '../../../types/story';
import type { TimeSeriesAnalysis } from '../../../types/analysis';
import SlideLayout from './SlideLayout';
import NarrativeText from './NarrativeText';
import { TimeSeriesPlot } from '../../TimeSeriesPlot';

interface TimeSeriesSlideProps {
  slide: Slide;
}

/**
 * TimeSeriesSlide - Shows temporal patterns and seasonality
 *
 * Phase 4: Enhanced with TimeSeriesPlot showing trend lines and seasonality
 */
export default function TimeSeriesSlide({ slide }: TimeSeriesSlideProps) {
  const data = slide.data as unknown as TimeTrendInsightData;

  const periodLabel = data.estimatedPeriod
    ? getPeriodLabel(data.estimatedPeriod)
    : 'periodic';

  const narrative = `${data.valueColumn} shows ${data.confidence} confidence ${periodLabel} seasonality${
    data.estimatedPeriod ? ` with an estimated period of ${Math.round(data.estimatedPeriod)} ${data.estimatedPeriod === 1 ? 'day' : 'days'}` : ''
  }. ${
    data.trend
      ? `The overall trend is ${data.trend}.`
      : 'This pattern repeats consistently over time.'
  }`;

  const insight = data.estimatedPeriod
    ? getSeasonalityInsight(data.estimatedPeriod, data.valueColumn)
    : `The detected seasonality in ${data.valueColumn.toLowerCase()} suggests cyclical patterns that can inform planning and forecasting. Consider aligning strategies with these temporal patterns.`;

  // Construct TimeSeriesAnalysis object for component
  const seasonalityData: TimeSeriesAnalysis | undefined = data.dates && data.values ? {
    dateColumn: data.dateColumn,
    valueColumn: data.valueColumn,
    seasonalityDetected: data.seasonalityDetected,
    estimatedPeriod: data.estimatedPeriod,
    confidence: data.confidence,
    dates: data.dates,
    values: data.values,
  } : undefined;

  return (
    <SlideLayout title={slide.title} subtitle={slide.subtitle} insight={insight}>
      <div className="space-y-6">
        <NarrativeText text={narrative} className="text-center" />

        <div className="relative mx-auto max-w-2xl">
          {/* Time series plot (NEW) */}
          {seasonalityData ? (
            <div className="flex justify-center">
              <TimeSeriesPlot
                dates={seasonalityData.dates}
                values={seasonalityData.values}
                columnName={data.valueColumn}
                seasonality={seasonalityData}
                width={600}
                height={300}
              />
            </div>
          ) : (
            // Fallback: wave SVG if data missing
            <div className="aspect-[3/2] bg-bg-elevated border border-border-default rounded-2xl flex items-center justify-center p-8">
              <TimeSeriesViz
                periodLabel={periodLabel}
                confidence={data.confidence}
                estimatedPeriod={data.estimatedPeriod}
              />
            </div>
          )}

          {/* Stats cards (keep) */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-bg-elevated border border-border-default text-center">
              <div className="text-xl font-bold text-text-primary capitalize">{periodLabel}</div>
              <div className="text-sm text-text-secondary">Pattern</div>
            </div>
            <div className="p-4 rounded-lg bg-bg-elevated border border-border-default text-center">
              <div className="text-xl font-bold text-text-primary capitalize">{data.confidence}</div>
              <div className="text-sm text-text-secondary">Confidence</div>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function TimeSeriesViz({
  periodLabel,
  confidence,
}: {
  periodLabel: string;
  confidence: string;
  estimatedPeriod?: number;
}) {
  const waveCount = periodLabel === 'weekly' ? 3 : periodLabel === 'monthly' ? 2 : 4;

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible text-primary">
      {/* Grid */}
      <defs>
        <pattern id="time-grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="400" height="200" fill="url(#time-grid)" />

      {/* Seasonal wave */}
      <path
        d={generateWavePath(waveCount)}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.8"
        style={{ animation: 'draw-line 2s ease-out' }}
      />

      {/* Shaded seasonality regions */}
      {Array.from({ length: waveCount }).map((_, i) => (
        <rect
          key={i}
          x={40 + (i * 320) / waveCount}
          y="40"
          width={320 / (waveCount * 2)}
          height="120"
          fill="currentColor"
          opacity="0.1"
          rx="4"
        />
      ))}

      {/* Confidence badge */}
      <g transform="translate(340, 20)" className={confidence === 'high' ? 'text-success' : confidence === 'medium' ? 'text-warning' : 'text-text-tertiary'}>
        <circle r="8" fill="currentColor" />
      </g>
    </svg>
  );
}

function generateWavePath(waves: number): string {
  const points: string[] = ['M 40 100'];
  const waveWidth = 320 / waves;

  for (let i = 0; i < waves; i++) {
    const x2 = 40 + (i + 0.5) * waveWidth;
    const x3 = 40 + (i + 1) * waveWidth;
    points.push(`Q ${x2} 60, ${x3} 100`);
    if (i < waves - 1) {
      const x4 = 40 + (i + 1.5) * waveWidth;
      const x5 = 40 + (i + 2) * waveWidth;
      points.push(`Q ${x4} 140, ${x5} 100`);
      i++;
    }
  }

  return points.join(' ');
}

function getPeriodLabel(period: number): string {
  if (Math.abs(period - 7) < 1) return 'weekly';
  if (Math.abs(period - 14) < 2) return 'bi-weekly';
  if (period >= 28 && period <= 31) return 'monthly';
  if (Math.abs(period - 90) < 10) return 'quarterly';
  if (Math.abs(period - 365) < 30) return 'annual';
  return `${Math.round(period)}-day`;
}

function getSeasonalityInsight(period: number, column: string): string {
  const periodLabel = getPeriodLabel(period);

  if (periodLabel === 'weekly') {
    return `Weekly patterns in ${column.toLowerCase()} suggest day-of-week effects. Consider scheduling key activities on high-performing days and adjusting resources for low-performing periods.`;
  } else if (periodLabel === 'monthly') {
    return `Monthly cycles in ${column.toLowerCase()} indicate end-of-month or billing period effects. Plan campaigns and resource allocation to align with these natural rhythms.`;
  } else if (periodLabel === 'quarterly') {
    return `Quarterly seasonality in ${column.toLowerCase()} likely reflects business cycles or seasonal factors. Use this insight for annual planning and forecasting.`;
  } else {
    return `The ${periodLabel} pattern in ${column.toLowerCase()} can guide timing of initiatives and help set realistic expectations for different time periods.`;
  }
}
