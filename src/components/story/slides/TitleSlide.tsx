import { Database } from 'lucide-react';
import type { Slide, TitleSlideData } from '../../../types/story';

interface TitleSlideProps {
  slide: Slide;
}

/**
 * TitleSlide - Opening slide with dataset overview
 *
 * Shows:
 * - Dataset name (large, centered)
 * - Dimensions (rows × columns)
 * - Upload date (optional)
 * - Insight count teaser
 */
export default function TitleSlide({ slide }: TitleSlideProps) {
  const data = slide.data as unknown as TitleSlideData;

  return (
    <div className="text-center space-y-8 animate-fade-in">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="p-6 rounded-2xl bg-bg-elevated border border-border-default">
          <Database className="w-16 h-16 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Dataset name */}
      <div className="space-y-2">
        <h1 className="text-5xl font-bold text-text-primary">
          {data.datasetName}
        </h1>
        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 text-text-secondary">
        <div className="text-center">
          <div className="text-3xl font-bold text-text-primary">
            {data.rowCount.toLocaleString()}
          </div>
          <div className="text-sm mt-1">rows</div>
        </div>

        <div className="text-4xl text-text-tertiary">×</div>

        <div className="text-center">
          <div className="text-3xl font-bold text-text-primary">
            {data.columnCount}
          </div>
          <div className="text-sm mt-1">columns</div>
        </div>
      </div>

      {/* Upload date (optional) */}
      {data.uploadDate && (
        <div className="text-text-tertiary text-sm">
          Uploaded {data.uploadDate}
        </div>
      )}

      {/* Insight count teaser */}
      <div className="pt-4">
        <div className="inline-block px-6 py-3 rounded-full bg-primary-light border border-primary-border">
          <span className="text-text-primary font-medium">
            {data.insightCount} {data.insightCount === 1 ? 'insight' : 'insights'} discovered
          </span>
        </div>
      </div>
    </div>
  );
}
