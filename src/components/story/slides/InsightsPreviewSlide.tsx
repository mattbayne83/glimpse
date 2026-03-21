import type { Slide, PreviewSlideData } from '../../../types/story';

interface InsightsPreviewSlideProps {
  slide: Slide;
}

/**
 * InsightsPreviewSlide - Preview of all detected insights
 *
 * Shows:
 * - Grid of insight type cards (2×4)
 * - Icon + label for each type
 * - Count of insights per type
 * - Navigation prompt
 */
export default function InsightsPreviewSlide({ slide }: InsightsPreviewSlideProps) {
  const data = slide.data as unknown as PreviewSlideData;

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-text-primary">
          What's Interesting in Your Data?
        </h2>
        <p className="text-text-secondary text-lg">
          We found several patterns worth exploring
        </p>
      </div>

      {/* Insight type grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.insightTypes.map((insightType, index) => (
          <div
            key={insightType.type}
            className="group p-6 rounded-2xl bg-bg-elevated border border-border-default hover:bg-bg-hover hover:border-border-hover transition-all duration-300"
            style={{
              animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="text-center space-y-3">
              {/* Icon */}
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {insightType.icon}
              </div>

              {/* Label */}
              <div className="text-text-primary font-medium text-sm">
                {insightType.label}
              </div>

              {/* Count badge */}
              {insightType.count > 0 && (
                <div className="inline-block px-2 py-1 rounded-full bg-primary-light text-primary text-xs">
                  {insightType.count}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation prompt */}
      <div className="text-center">
        <p className="text-text-tertiary text-sm animate-pulse">
          Click or press → to explore
        </p>
      </div>
    </div>
  );
}
