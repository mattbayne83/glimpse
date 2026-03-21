import { useMemo } from 'react';

interface CategoryBarChartProps {
  categories: Array<{ value: string; percentage: number }>;
  maxCategories?: number;
  highlightIndex?: number;
  height?: number;
}

/**
 * CategoryBarChart - Horizontal bar chart for categorical data
 *
 * Shows top N categories with percentage bars.
 * Theme-aware, responsive, follows Glimpse design patterns.
 *
 * Phase 4: Created for Story Mode CategorySlide
 */
export function CategoryBarChart({
  categories,
  maxCategories = 5,
  highlightIndex = 0,
  height = 200,
}: CategoryBarChartProps) {
  const displayCategories = useMemo(
    () => categories.slice(0, maxCategories),
    [categories, maxCategories]
  );

  // Calculate dynamic bar height based on number of categories
  const spacing = 8; // gap between bars
  const totalSpacing = (displayCategories.length - 1) * spacing;
  const barHeight = Math.floor((height - totalSpacing) / displayCategories.length);

  return (
    <div className="space-y-2" style={{ height }}>
      {displayCategories.map((cat, idx) => (
        <div key={cat.value} className="space-y-1">
          {/* Label and percentage */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-primary font-medium truncate max-w-[60%]">
              {cat.value}
            </span>
            <span className="text-text-secondary">{cat.percentage.toFixed(1)}%</span>
          </div>

          {/* Bar */}
          <div
            className="bg-bg-hover rounded-full overflow-hidden"
            style={{ height: barHeight }}
          >
            <div
              className={`h-full transition-all duration-500 ${
                idx === highlightIndex
                  ? 'bg-gradient-to-r from-primary to-primary-hover'
                  : 'bg-text-tertiary'
              }`}
              style={{ width: `${cat.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
