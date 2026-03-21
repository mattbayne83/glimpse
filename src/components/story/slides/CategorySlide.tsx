import type { Slide, CategoryInsightData } from '../../../types/story';
import SlideLayout from './SlideLayout';
import NarrativeText from './NarrativeText';
import { CategoryBarChart } from '../../CategoryBarChart';

interface CategorySlideProps {
  slide: Slide;
}

/**
 * CategorySlide - Shows dominant categorical patterns
 *
 * Phase 4: Enhanced with CategoryBarChart showing top 5 categories
 */
export default function CategorySlide({ slide }: CategorySlideProps) {
  const data = slide.data as unknown as CategoryInsightData;

  const narrative = data.dominance
    ? `"${data.topValue}" dominates ${data.column}, representing ${data.topPercentage.toFixed(1)}% of all values. ${
        data.uniqueCount > 10
          ? `Despite ${data.uniqueCount} total categories, one value overwhelmingly dominates.`
          : `This represents strong concentration among ${data.uniqueCount} total categories.`
      }`
    : `${data.column} shows ${data.uniqueCount} unique categories with ${data.diversity > 0.7 ? 'high' : 'moderate'} diversity. "${data.topValue}" leads at ${data.topPercentage.toFixed(1)}%, ${
        isFinite(data.imbalanceRatio) && data.imbalanceRatio > 3
          ? `${data.imbalanceRatio.toFixed(1)}× more than the second most common value.`
          : 'but distribution is relatively balanced across categories.'
      }`;

  const insight = data.dominance
    ? `The extreme dominance of "${data.topValue}" in ${data.column.toLowerCase()} suggests either strong preference/concentration or potential data collection bias. Consider whether this reflects genuine patterns or sampling issues.`
    : `The ${data.diversity > 0.7 ? 'diverse' : 'varied'} distribution in ${data.column.toLowerCase()} indicates meaningful segmentation opportunities. Consider analyzing sub-groups or targeting different categories separately.`;

  return (
    <SlideLayout title={slide.title} subtitle={slide.subtitle} insight={insight}>
      <div className="space-y-6">
        <NarrativeText text={narrative} className="text-center" />

        <div className="relative mx-auto max-w-2xl">
          <div className="bg-bg-elevated border border-border-default rounded-2xl p-6 md:p-8 space-y-4">
            {/* Top 5 categories (NEW - replaces single CategoryBar) */}
            <CategoryBarChart
              categories={data.topValues}
              maxCategories={5}
              highlightIndex={0}
              height={200}
            />

            {/* Stats grid (keep) */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-default">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{data.uniqueCount}</div>
                <div className="text-sm text-text-secondary">total categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{(data.diversity * 100).toFixed(0)}%</div>
                <div className="text-sm text-text-secondary">diversity score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
