import type { Slide } from '../../../types/story';
import SlideLayout from './SlideLayout';

interface QualitySlideProps {
  slide: Slide;
}

interface QualitySlideData {
  duplicateRows: number;
  duplicatePercentage: number;
  highMissingColumns: string[];
  highCardinalityColumns: string[];
}

/**
 * QualitySlide - Shows data quality issues (conditional)
 */
export default function QualitySlide({ slide }: QualitySlideProps) {
  const data = slide.data as unknown as QualitySlideData;

  const hasIssues =
    data.duplicateRows > 0 ||
    data.highMissingColumns.length > 0 ||
    data.highCardinalityColumns.length > 0;

  if (!hasIssues) return null;

  const insight = `While these quality issues don't invalidate the insights above, addressing them could improve analysis accuracy. Consider data cleaning as a next step.`;

  return (
    <SlideLayout title={slide.title} insight={insight}>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Duplicate rows */}
        {data.duplicateRows > 0 && (
          <div className="p-5 rounded-lg bg-warning-bg border border-warning-border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <div className="font-semibold text-warning-text">Duplicate Rows Detected</div>
            </div>
            <div className="text-text-primary">
              {data.duplicateRows.toLocaleString()} duplicate {data.duplicateRows === 1 ? 'row' : 'rows'} ({data.duplicatePercentage.toFixed(1)}% of data)
            </div>
          </div>
        )}

        {/* High missing columns */}
        {data.highMissingColumns.length > 0 && (
          <div className="p-5 rounded-lg bg-error-bg border border-error-border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <div className="font-semibold text-error-text">High Missing Data</div>
            </div>
            <div className="text-text-primary mb-3">
              {data.highMissingColumns.length} {data.highMissingColumns.length === 1 ? 'column has' : 'columns have'} &gt;50% missing values:
            </div>
            <div className="flex flex-wrap gap-2">
              {data.highMissingColumns.slice(0, 5).map((col, i) => (
                <span key={i} className="px-3 py-1 rounded bg-bg-elevated text-text-primary text-sm font-mono">
                  {col}
                </span>
              ))}
              {data.highMissingColumns.length > 5 && (
                <span className="px-3 py-1 text-text-secondary text-sm">
                  +{data.highMissingColumns.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* High cardinality columns */}
        {data.highCardinalityColumns.length > 0 && (
          <div className="p-5 rounded-lg bg-primary-light border border-primary-border">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔢</span>
              <div className="font-semibold text-primary">High Cardinality</div>
            </div>
            <div className="text-text-primary mb-3">
              {data.highCardinalityColumns.length} {data.highCardinalityColumns.length === 1 ? 'column has' : 'columns have'} &gt;100 unique values (may be IDs):
            </div>
            <div className="flex flex-wrap gap-2">
              {data.highCardinalityColumns.slice(0, 5).map((col, i) => (
                <span key={i} className="px-3 py-1 rounded bg-bg-elevated text-text-primary text-sm font-mono">
                  {col}
                </span>
              ))}
              {data.highCardinalityColumns.length > 5 && (
                <span className="px-3 py-1 text-text-secondary text-sm">
                  +{data.highCardinalityColumns.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SlideLayout>
  );
}
