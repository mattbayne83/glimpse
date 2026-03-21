import { Lightbulb } from 'lucide-react';
import type { Slide, MockInsightSlideData } from '../../../types/story';

interface MockInsightSlideProps {
  slide: Slide;
}

/**
 * MockInsightSlide - Placeholder for insight slides during Phase 1
 *
 * Will be replaced by real insight components in Phase 3:
 * - CorrelationSlide (scatter plots)
 * - DistributionSlide (histograms)
 * - TimeSeriesSlide (line charts)
 * - OutlierSlide (box plots)
 * - CategorySlide (bar charts)
 */
export default function MockInsightSlide({ slide }: MockInsightSlideProps) {
  const data = slide.data as unknown as MockInsightSlideData;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-white/60 text-lg">
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-white/80 text-center text-lg max-w-2xl mx-auto">
          {data.description}
        </p>
      )}

      {/* Chart placeholder */}
      <div className="relative">
        <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-white/30 text-6xl">
              {data.chartPlaceholder || '📊'}
            </div>
            <p className="text-white/40 text-sm">
              Chart will appear here in Phase 3
            </p>
          </div>
        </div>
      </div>

      {/* Insight */}
      {data.insight && (
        <div className="flex items-start gap-3 p-6 rounded-xl bg-white/5 border border-white/10">
          <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <div className="font-medium text-white/90 mb-1">Insight</div>
            <p className="text-white/70 text-sm leading-relaxed">
              {data.insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
