import type { DateTimeColumnStats } from '../types/analysis';

interface DateRangeVizProps {
  stats: DateTimeColumnStats;
  width?: number;
  height?: number;
}

/**
 * Mini timeline visualization for datetime columns.
 * Shows date range as a horizontal bar with min/max labels and total span.
 */
export function DateRangeViz({ stats, width = 200, height = 56 }: DateRangeVizProps) {
  const { minDate, maxDate } = stats;

  // Parse dates
  const startDate = minDate ? new Date(minDate) : null;
  const endDate = maxDate ? new Date(maxDate) : null;

  // Calculate date span in days
  const spanDays = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Format span as human-readable
  const formatSpan = (days: number): string => {
    if (days === 0) return '1 day';
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const months = Math.round(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }
    const years = (days / 365).toFixed(1);
    return `${years} year${parseFloat(years) > 1.5 ? 's' : ''}`;
  };

  // Format date for label (compact)
  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  if (!startDate || !endDate) {
    return (
      <div className="h-14 flex items-center justify-center text-xs text-text-tertiary italic">
        No valid dates
      </div>
    );
  }

  const barHeight = 8;
  const padding = { top: 16, right: 8, bottom: 16, left: 8 };
  const barWidth = width - padding.left - padding.right;
  const centerY = height / 2;

  return (
    <div className="w-full h-14">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ maxWidth: '100%' }}
      >
        {/* Start marker (circle) */}
        <circle
          cx={padding.left}
          cy={centerY}
          r={4}
          className="fill-primary"
        />

        {/* Timeline bar */}
        <rect
          x={padding.left}
          y={centerY - barHeight / 2}
          width={barWidth}
          height={barHeight}
          rx={4}
          className="fill-primary/20"
        />

        {/* Gradient fill (progress bar style) */}
        <defs>
          <linearGradient id="dateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="stop-color-primary" stopOpacity="0.4" />
            <stop offset="100%" className="stop-color-primary" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <rect
          x={padding.left}
          y={centerY - barHeight / 2}
          width={barWidth}
          height={barHeight}
          rx={4}
          fill="url(#dateGradient)"
        />

        {/* End marker (circle) */}
        <circle
          cx={padding.left + barWidth}
          cy={centerY}
          r={4}
          className="fill-primary"
        />

        {/* Start date label */}
        <text
          x={padding.left}
          y={padding.top - 4}
          textAnchor="start"
          className="text-[9px] font-mono text-text-secondary fill-current"
        >
          {formatDate(startDate)}
        </text>

        {/* End date label */}
        <text
          x={padding.left + barWidth}
          y={padding.top - 4}
          textAnchor="end"
          className="text-[9px] font-mono text-text-secondary fill-current"
        >
          {formatDate(endDate)}
        </text>

        {/* Span label (centered below) */}
        <text
          x={padding.left + barWidth / 2}
          y={centerY + barHeight / 2 + 16}
          textAnchor="middle"
          className="text-[10px] font-semibold text-primary fill-current"
        >
          {formatSpan(spanDays)}
        </text>
      </svg>
    </div>
  );
}
