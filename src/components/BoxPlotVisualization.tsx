import type { NumericColumnStats } from '../types/analysis';

interface BoxPlotVisualizationProps {
  stats: NumericColumnStats;
  columnName: string;
  width?: number;
  height?: number;
}

/**
 * Box-and-whisker plot for numeric columns.
 * Shows quartiles, IQR, whiskers, and outliers for distribution visualization.
 */
export function BoxPlotVisualization({
  stats,
  columnName,
  width = 400,
  height = 300,
}: BoxPlotVisualizationProps) {
  const { q25, q50, q75, min, max, boxPlot } = stats;

  if (!boxPlot || q25 === undefined || q50 === undefined || q75 === undefined) {
    return (
      <div className="p-4 text-sm text-text-tertiary italic text-center">
        Insufficient data for box plot
      </div>
    );
  }

  const { iqr, lowerWhisker, upperWhisker, outliers } = boxPlot;

  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const boxWidth = Math.min(plotWidth * 0.4, 80); // Max 80px wide box
  const centerX = plotWidth / 2;

  // Calculate Y scale (min to max including outliers)
  const dataMin = Math.min(min, lowerWhisker, ...(outliers || []));
  const dataMax = Math.max(max, upperWhisker, ...(outliers || []));
  const dataRange = dataMax - dataMin;
  const yPadding = dataRange * 0.1;

  const yScale = (value: number) =>
    plotHeight - ((value - (dataMin - yPadding)) / (dataRange + 2 * yPadding)) * plotHeight;

  // Format value for labels
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
    if (Math.abs(value) < 1 && value !== 0) return value.toFixed(2);
    return value.toFixed(1);
  };

  // Generate Y-axis ticks (5 ticks)
  const numTicks = 5;
  const tickValues = Array.from({ length: numTicks }, (_, i) => {
    const step = (dataMax - dataMin) / (numTicks - 1);
    return dataMin + step * i;
  });

  // Limit outliers to 20 max
  const displayOutliers = outliers.slice(0, 20);
  const hiddenOutliers = outliers.length - displayOutliers.length;

  return (
    <div className="w-full">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Y-axis gridlines */}
        {tickValues.map((tick, i) => (
          <line
            key={`grid-${i}`}
            x1={padding.left}
            y1={padding.top + yScale(tick)}
            x2={padding.left + plotWidth}
            y2={padding.top + yScale(tick)}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.1"
            className="text-text-tertiary"
          />
        ))}

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-default"
        />

        {/* Y-axis labels */}
        {tickValues.map((tick, i) => (
          <text
            key={`label-y-${i}`}
            x={padding.left - 10}
            y={padding.top + yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-[10px] font-mono text-text-secondary fill-current"
          >
            {formatValue(tick)}
          </text>
        ))}

        {/* Upper whisker line */}
        <line
          x1={padding.left + centerX}
          y1={padding.top + yScale(upperWhisker)}
          x2={padding.left + centerX}
          y2={padding.top + yScale(q75)}
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-primary"
        />

        {/* Upper whisker cap */}
        <line
          x1={padding.left + centerX - boxWidth / 4}
          y1={padding.top + yScale(upperWhisker)}
          x2={padding.left + centerX + boxWidth / 4}
          y2={padding.top + yScale(upperWhisker)}
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-primary"
        />

        {/* Box (IQR) */}
        <rect
          x={padding.left + centerX - boxWidth / 2}
          y={padding.top + yScale(q75)}
          width={boxWidth}
          height={yScale(q25) - yScale(q75)}
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        {/* Median line (bold) */}
        <line
          x1={padding.left + centerX - boxWidth / 2}
          y1={padding.top + yScale(q50)}
          x2={padding.left + centerX + boxWidth / 2}
          y2={padding.top + yScale(q50)}
          stroke="currentColor"
          strokeWidth="3"
          className="text-primary"
        />

        {/* Lower whisker line */}
        <line
          x1={padding.left + centerX}
          y1={padding.top + yScale(q25)}
          x2={padding.left + centerX}
          y2={padding.top + yScale(lowerWhisker)}
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-primary"
        />

        {/* Lower whisker cap */}
        <line
          x1={padding.left + centerX - boxWidth / 4}
          y1={padding.top + yScale(lowerWhisker)}
          x2={padding.left + centerX + boxWidth / 4}
          y2={padding.top + yScale(lowerWhisker)}
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-primary"
        />

        {/* Outlier points */}
        {displayOutliers.map((outlier, i) => (
          <circle
            key={`outlier-${i}`}
            cx={padding.left + centerX}
            cy={padding.top + yScale(outlier)}
            r="3"
            fill="currentColor"
            className="text-warning"
            opacity="0.7"
          >
            <title>Outlier: {formatValue(outlier)}</title>
          </circle>
        ))}

        {/* Axis labels */}
        <text
          x={15}
          y={padding.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 15 ${padding.top + plotHeight / 2})`}
          className="text-xs font-medium text-text-secondary fill-current"
        >
          {columnName}
        </text>

        {/* Legend labels (right side) */}
        <text
          x={padding.left + plotWidth + 10}
          y={padding.top + yScale(upperWhisker)}
          textAnchor="start"
          dominantBaseline="middle"
          className="text-[9px] text-text-tertiary fill-current"
        >
          Upper Whisker
        </text>

        <text
          x={padding.left + plotWidth + 10}
          y={padding.top + yScale(q75)}
          textAnchor="start"
          dominantBaseline="middle"
          className="text-[9px] text-text-tertiary fill-current"
        >
          Q3
        </text>

        <text
          x={padding.left + plotWidth + 10}
          y={padding.top + yScale(q50)}
          textAnchor="start"
          dominantBaseline="middle"
          className="text-[9px] font-semibold text-primary fill-current"
        >
          Median
        </text>

        <text
          x={padding.left + plotWidth + 10}
          y={padding.top + yScale(q25)}
          textAnchor="start"
          dominantBaseline="middle"
          className="text-[9px] text-text-tertiary fill-current"
        >
          Q1
        </text>

        <text
          x={padding.left + plotWidth + 10}
          y={padding.top + yScale(lowerWhisker)}
          textAnchor="start"
          dominantBaseline="middle"
          className="text-[9px] text-text-tertiary fill-current"
        >
          Lower Whisker
        </text>
      </svg>

      {/* Info box */}
      <div className="mt-3 p-3 bg-bg-page rounded-lg text-xs text-text-secondary">
        <p className="font-medium text-text-primary mb-1">📊 Box Plot Breakdown</p>
        <ul className="space-y-1">
          <li>
            • <span className="font-semibold text-text-primary">IQR:</span> {formatValue(iqr)} (Q3 - Q1)
          </li>
          <li>
            • <span className="font-semibold text-text-primary">Whiskers:</span> Extend to 1.5×IQR from box
          </li>
          <li>
            • <span className="font-semibold text-warning">Outliers:</span> {outliers.length} detected
            {hiddenOutliers > 0 && ` (showing ${displayOutliers.length}, +${hiddenOutliers} hidden)`}
          </li>
          <li className="text-[10px] text-text-tertiary mt-1">
            Values beyond whiskers are considered outliers
          </li>
        </ul>
      </div>
    </div>
  );
}
