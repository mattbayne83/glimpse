import { useEffect, useState } from 'react';
import type { StorySlideProps } from '../../types/story';
import TitleSlide from './slides/TitleSlide';
import InsightsPreviewSlide from './slides/InsightsPreviewSlide';
import CorrelationSlide from './slides/CorrelationSlide';
import DistributionSlide from './slides/DistributionSlide';
import OutlierSlide from './slides/OutlierSlide';
import CategorySlide from './slides/CategorySlide';
import TimeSeriesSlide from './slides/TimeSeriesSlide';
import QualitySlide from './slides/QualitySlide';
import NextStepsSlide from './slides/NextStepsSlide';

/**
 * StorySlide - Wrapper for individual slides with enter/exit animations
 *
 * Features:
 * - Fade + slide animations
 * - Scale effect (0.95 → 1.0)
 * - Centered content container
 * - Type-based slide rendering
 */
export default function StorySlide({ slide, isActive, direction = 'forward' }: StorySlideProps) {
  const [shouldRender, setShouldRender] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShouldRender(true), 0);
      return () => clearTimeout(timer);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!shouldRender) return null;

  // Animation classes based on state
  const animationClasses = isActive
    ? 'opacity-100 translate-x-0 scale-100'
    : direction === 'forward'
      ? 'opacity-0 translate-x-24 scale-95'
      : 'opacity-0 -translate-x-24 scale-95';

  // Render appropriate slide component based on type
  const renderSlideContent = () => {
    switch (slide.type) {
      case 'title':
        return <TitleSlide slide={slide} />;
      case 'preview':
        return <InsightsPreviewSlide slide={slide} />;
      case 'correlation':
        return <CorrelationSlide slide={slide} />;
      case 'distribution':
        return <DistributionSlide slide={slide} />;
      case 'outlier':
        return <OutlierSlide slide={slide} />;
      case 'category':
        return <CategorySlide slide={slide} />;
      case 'timeTrend':
        return <TimeSeriesSlide slide={slide} />;
      case 'quality':
        return <QualitySlide slide={slide} />;
      case 'nextSteps':
        return <NextStepsSlide slide={slide} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        absolute inset-0 flex items-center justify-center p-8
        transition-all duration-400 ease-out
        ${animationClasses}
      `}
      style={{
        pointerEvents: isActive ? 'auto' : 'none',
      }}
    >
      <div className="w-full max-w-4xl">
        {renderSlideContent()}
      </div>
    </div>
  );
}
